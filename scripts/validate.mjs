#!/usr/bin/env node
// Checks the repo before a push or a release. No dependencies.
//
//   node scripts/validate.mjs
//
// 1. Every manifest parses and they all carry the same version.
// 2. Plugin and marketplace names agree, and marketplace sources point at the plugin.
// 3. Every MCP config points at the same Cloud MCP URL.
// 4. Files the manifests reference exist.
// 5. Each skill passes the Agent Skills spec and claude.ai's upload rules.
// 6. Nothing internal leaks into the public skill text.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN_NAME = 'hillnote';
const MARKETPLACE_NAME = 'hillnote-skills';
const PLUGIN_DIR = `plugins/${PLUGIN_NAME}`;
const MCP_URL = 'https://hillnote.com/mcp';

const errors = [];
const fail = (msg) => errors.push(msg);
const abs = (rel) => join(ROOT, rel);

function readJson(rel) {
  try {
    return JSON.parse(readFileSync(abs(rel), 'utf8'));
  } catch (e) {
    fail(`${rel}: ${e.code === 'ENOENT' ? 'missing' : `invalid JSON (${e.message})`}`);
    return null;
  }
}

// ── 1. Versions ───────────────────────────────────────────────────────────
// Same list as scripts/bump.sh.
const VERSIONED = [
  `${PLUGIN_DIR}/plugin.json`,
  `${PLUGIN_DIR}/.claude-plugin/plugin.json`,
  `${PLUGIN_DIR}/.cursor-plugin/plugin.json`,
  `${PLUGIN_DIR}/.antigravity-plugin/plugin.json`,
  `${PLUGIN_DIR}/gemini-extension.json`,
  '.claude-plugin/marketplace.json',
];
const versions = [];
for (const rel of VERSIONED) {
  const j = readJson(rel);
  if (!j) continue;
  const v = rel.endsWith('marketplace.json')
    ? j.plugins?.find((p) => p.name === PLUGIN_NAME)?.version
    : j.version;
  if (!/^\d+\.\d+\.\d+$/.test(v || '')) fail(`${rel}: version "${v}" is not x.y.z`);
  versions.push([rel, v]);
}
if (new Set(versions.map(([, v]) => v)).size > 1) {
  fail(`versions differ (run scripts/bump.sh): ${versions.map(([r, v]) => `${r}=${v}`).join(', ')}`);
}

// ── 2. Names and marketplace sources ──────────────────────────────────────
for (const rel of VERSIONED.filter((r) => !r.endsWith('marketplace.json'))) {
  const j = readJson(rel);
  if (j && j.name !== PLUGIN_NAME) fail(`${rel}: name is "${j.name}", expected "${PLUGIN_NAME}"`);
}
const MARKETPLACES = {
  '.claude-plugin/marketplace.json': (p) => p.source,
  '.cursor-plugin/marketplace.json': (p) => p.source,
  '.agents/plugins/marketplace.json': (p) => p.source?.path,
};
for (const [rel, sourceOf] of Object.entries(MARKETPLACES)) {
  const j = readJson(rel);
  if (!j) continue;
  if (j.name !== MARKETPLACE_NAME) fail(`${rel}: name is "${j.name}", expected "${MARKETPLACE_NAME}"`);
  const entry = j.plugins?.find((p) => p.name === PLUGIN_NAME);
  if (!entry) { fail(`${rel}: no "${PLUGIN_NAME}" plugin entry`); continue; }
  const src = sourceOf(entry);
  if (src?.replace(/^\.\//, '') !== PLUGIN_DIR) fail(`${rel}: source "${src}" should be ./${PLUGIN_DIR}`);
}

// ── 3. MCP configs ────────────────────────────────────────────────────────
const MCP_CONFIGS = [
  [`${PLUGIN_DIR}/.mcp.json`, (s) => s?.url],
  [`${PLUGIN_DIR}/mcp.json`, (s) => s?.url],
  [`${PLUGIN_DIR}/gemini-extension.json`, (s) => s?.httpUrl],
];
for (const [rel, urlOf] of MCP_CONFIGS) {
  const j = readJson(rel);
  if (!j) continue;
  const url = urlOf(j.mcpServers?.[PLUGIN_NAME]);
  if (url !== MCP_URL) fail(`${rel}: mcpServers.${PLUGIN_NAME} points at "${url}", expected ${MCP_URL}`);
}

// ── 4. Referenced files ───────────────────────────────────────────────────
for (const rel of [
  `${PLUGIN_DIR}/assets/icon.png`,
  `${PLUGIN_DIR}/skills`,
  `${PLUGIN_DIR}/README.md`,
  `${PLUGIN_DIR}/LICENSE`,
  'README.md',
  'LICENSE',
]) {
  if (!existsSync(abs(rel))) fail(`${rel}: missing`);
}

// ── 5. Skills ─────────────────────────────────────────────────────────────
// claude.ai's upload rules (same as skill-creator's quick_validate.py).
const ALLOWED_KEYS = new Set(['name', 'description', 'license', 'allowed-tools', 'metadata', 'compatibility']);
const skillsRoot = abs(`${PLUGIN_DIR}/skills`);
const skillDirs = existsSync(skillsRoot)
  ? readdirSync(skillsRoot).filter((d) => statSync(join(skillsRoot, d)).isDirectory())
  : [];
if (skillDirs.length === 0) fail(`${PLUGIN_DIR}/skills: no skills`);

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue; // nested or continuation line
    let value = kv[2].trim();
    if (/^["'].*["']$/.test(value)) value = value.slice(1, -1);
    out[kv[1]] = value;
  }
  return out;
}

for (const dir of skillDirs) {
  const rel = `${PLUGIN_DIR}/skills/${dir}/SKILL.md`;
  if (!existsSync(abs(rel))) { fail(`${rel}: missing`); continue; }
  const fm = frontmatter(readFileSync(abs(rel), 'utf8'));
  if (!fm) { fail(`${rel}: must start with a --- frontmatter block`); continue; }
  const extra = Object.keys(fm).filter((k) => !ALLOWED_KEYS.has(k));
  if (extra.length) fail(`${rel}: unexpected frontmatter key(s): ${extra.join(', ')}`);
  const name = fm.name || '';
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name) || name.length > 64) fail(`${rel}: name "${name}" must be kebab-case, 64 chars max`);
  if (name !== dir) fail(`${rel}: name "${name}" must match its folder "${dir}"`);
  const desc = fm.description || '';
  if (!desc || /^[|>]/.test(desc)) fail(`${rel}: description must be one non-empty line`);
  if (desc.length > 1024) fail(`${rel}: description is ${desc.length} chars (max 1024)`);
  if (/[<>]/.test(desc)) fail(`${rel}: description cannot contain < or >`);
}

// ── 6. Public-repo scrub ──────────────────────────────────────────────────
// The skill describes the public tool surface and file formats only — never
// source paths, internal services or credentials.
const FORBIDDEN = [
  [/Accessory modules|HillnoteApp|HillnoteWebsite|HillnoteMobile/, 'internal repo path'],
  [/\b(src|backend|renderer|main-process)\/[\w.-]+\.(m?js|ts|jsx)\b/, 'source file path'],
  [/\bAKIA[0-9A-Z]{16}\b|\bsk-[A-Za-z0-9_-]{20,}|\bgh[po]_[A-Za-z0-9]{20,}/, 'credential-shaped string'],
];
function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}
if (existsSync(skillsRoot)) {
  for (const file of walk(skillsRoot)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const [re, what] of FORBIDDEN) {
        if (re.test(line)) fail(`${relative(ROOT, file)}:${i + 1}: ${what}: ${line.trim().slice(0, 100)}`);
      }
    });
  }
}

// ── Result ────────────────────────────────────────────────────────────────
if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ ${skillDirs.length} skill(s), ${VERSIONED.length} manifests at ${versions[0]?.[1]}, MCP → ${MCP_URL}`);
