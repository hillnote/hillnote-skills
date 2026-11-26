# Sidebar plugins

> **⚠️ Plugin platform v2 (2026-08) — this file predates it.** The platform is now much larger than documented here: ~70 SDK methods across 14 namespaces (workspace tools, cloud + local AI streaming, commands in ⌘K/slash/toolbar, host UI dialogs/toasts/notifications, plugin-to-plugin bus, triggers in both directions, document-embedded plugin buttons), 19 permissions, three plugin kinds (`sidebar`, `view`, `view-extension`) plus `background: true`, in-app scaffolding + dev mode with hot reload, and a community registry with an in-app store. **For authoring plugins, treat <https://github.com/hillnote/hillnote-plugins> as the source of truth** — its `skill/` folder is a dedicated plugin-dev guide with the full generated API reference, and `examples/api-showcase/` exercises the entire SDK. Inside the app, the complete typed surface is served at `hillnote-plugin:///hillnote.d.ts` and the Plugins panel has a built-in API reference (book icon). What follows below is still correct for the basics (folder layout, sandbox model, bridge script) but **understates** the current permission list and API surface.

Plugins are tiny sandboxed web apps that live in the Hillnote editor sidebar and talk to the app through a permission-gated `window.hillnote` API. A plugin is a folder with **exactly two files** — `manifest.json` and `index.html`. No build tooling, no npm, no frameworks, no TypeScript: the HTML runs as-is in a sandboxed iframe.

Plugins are not HTML tools. HTML tools (`resources/html/`, see `references/html-tools.md`) are standalone mini-apps embedded in documents; plugins (`plugins/<id>/`) are sidebar companions that react to the open document through the SDK.

## How plugins get installed (read first)

**No MCP tool writes plugins.** The folder must land at `<workspace>/plugins/<id>/`:

- **Files mode**: write `plugins/<id>/manifest.json` and `plugins/<id>/index.html` directly.
- **Remote or local MCP**: generate both files in your reply and tell the user exactly where to save them.
- **Enable**: plugins must be turned on in Hillnote's settings; then the plugin appears under the editor's 3-dot menu → Plugins, with an Enable button and a consent dialog listing the requested permissions.

## Scaffolding workflow

When the user says "build me a plugin that does X":

1. **Pin down the surface** (ask if not given):
   - Plugin id — lowercase-hyphens, matches the folder name. Bad ids fail validation.
   - Display name + one-line description.
   - Which editor types it targets (`tiptap`, `database`, `canvas`, `slides`, or all).
   - Custom color theme (hex bg + text) or defaults.
   - The **minimum** permission set — each extra permission is consent-dialog friction.
2. **Write `manifest.json` first** and validate it mentally against the gotchas below.
3. **Write `index.html`** — always include the bridge script, then your UI, then a `<script>` using `window.hillnote.*`.
4. **Hand off** — tell the user the save path, how to enable, which permissions the dialog will list and why, and where errors show up (checklist at the end of this file).

## manifest.json

```jsonc
{
  "id": "word-counter",          // REQUIRED — [a-z0-9][a-z0-9-]*, must equal folder name
  "name": "Word Counter",        // REQUIRED — free-form display string
  "version": "0.1.0",            // REQUIRED — semver-ish string
  "author": "Your Name",         // optional, shown on the manager card
  "description": "Live counts.", // optional, one line
  "kind": "sidebar",             // "sidebar" (default) | "view-extension" (preview — see API section)
  "supportedViews": ["tiptap", "database", "canvas", "slides"],  // sidebar plugins only: when to show
  "extends": { "kind": "database-view", "id": "timeline" },      // view-extension plugins only
  "icon": "Hash",                // a lucide icon name, or { "svg": "icon.svg" } (monochrome, inside the folder)
  "color": { "bg": "#1E293B", "text": "#FFFFFF" },  // optional card tint — both valid hex or ignored
  "permissions": ["editor:read"],
  "networkHosts": [],            // REQUIRED (non-empty) if "network" is in permissions
  "entry": "index.html"          // optional, defaults to index.html
}
```

**Validation gotchas:**

- `id` with uppercase or underscores is rejected — always lowercase + hyphens, equal to the folder name.
- `network` in `permissions` with an empty `networkHosts` is a manifest error.
- `networkHosts` entries are plain DNS hostnames only — no scheme, path, wildcard, IP, or port.
- Permission strings outside the table below are **silently dropped** (the API call then fails at runtime).
- `color.bg` and `color.text` must both be valid `#RGB`/`#RRGGBB`; a partial pair falls back to neutral.
- SVG icons render through CSS masks — single color via `currentColor`; multi-color SVGs won't work (use a lucide name for colorful visuals). The SVG path must stay inside the plugin folder (`../`, leading `/`, and schemes are rejected).

## Permissions (default-deny)

| Permission | Grants |
|---|---|
| `editor:read` | Read the document content, selection, metadata |
| `editor:write` | Modify the document — insert, rows, elements, slides |
| `files:read` / `files:write` | Read / write workspace files (paths relative to workspace root; traversal rejected) |
| `llm:ollama` | Prompt the user's local models |
| `llm:premium` | Prompt premium models — uses the user's credits |
| `network` | Outbound HTTPS to the hostnames in `networkHosts` |
| `secrets` | Encrypted key/value store on this device, scoped to this plugin |

Calling a method without its permission throws `Permission denied: <permission>`. Request only what the code actually uses.

## index.html shape

```html
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Word Counter</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; font-size: 13px; }
  @media (prefers-color-scheme: dark) { body { color: #ddd; background: #181818; } }
</style></head>
<body>
  <script src="hillnote-plugin:///bridge.js"></script>
  <div id="out"></div>
  <script>
    hillnote.editor.on('change', async () => {
      const text = await hillnote.editor.getText();
      document.getElementById('out').textContent = `${text.split(/\s+/).filter(Boolean).length} words`;
    });
  </script>
</body>
</html>
```

The bridge URL is exactly `hillnote-plugin:///bridge.js` (three slashes, served by the host) — never inline it. Loading it twice is safe (idempotent), and `window.hillnote` is frozen — don't patch it. Inline all styles and scripts; external CDNs need the `network` permission and hostname allowlisting. Note: plugins do **not** get the HTML-tool design baseline — style them yourself, including a `prefers-color-scheme` dark block.

## The `window.hillnote` API (all async; permission in parens)

### `hillnote.editor` — read (`editor:read`)

```ts
getType(): 'tiptap' | 'database' | 'canvas' | 'slides' | null
getContent(): string                    // HTML for tiptap, JSON for database/canvas, markdown for slides
getText(): string                       // plain text view
getSelection(): { from, to, empty } | null
getMetadata(): object                   // type-specific facts (rowCount, totalSlides, …)
isActive(name, attrs?): boolean         // tiptap mark/node check, e.g. isActive('bold')
```

### `hillnote.editor` — write (`editor:write`), by editor type

```ts
// TipTap
insertContent(htmlOrDoc): boolean       // raw HTML or TipTap node spec — NOT markdown
insertMarkdown(markdown): boolean       // USE THIS for markdown / model output
setContent(content): boolean
focus(): true

// Database
getRows(): Row[]                        // (editor:read)
getConfig(): DatabaseConfig | null      // (editor:read)
addRow(rowData): unknown
updateCell(rowId, columnId, value): unknown
deleteRows(rowIds): unknown

// Canvas
getElements(): Element[]                // (editor:read)
addElements(specs): unknown             // element spec: see below
clearElements(): unknown
updateScene(scene): boolean

// Slides
getSlides(): { index, content }[]       // (editor:read)
getCurrentSlide(): { index, content } | null
goToSlide(index): number                // returns clamped index
editSlide(index, markdown): boolean     // edits the markdown source, viewer re-parses
replaceContent(markdown): boolean
```

Canvas `addElements(specs)` takes an array of element specs: `type` (`rectangle`, `ellipse`, `diamond`, `text`, `arrow`, `line`), `x`, `y`, `width`, `height`, `strokeColor` and `backgroundColor` (hex, or `"transparent"`), `fillStyle` (`solid` / `hachure` / `cross-hatch`), `strokeWidth`, `roughness` (0 smooth / 1 artist / 2 sketchy), `opacity`, `groupId`. Shapes take `label` for centered text; `text` elements take `text`, `fontSize`, `fontFamily`, `textAlign`; arrows and lines take `points: [[0,0],[dx,dy]]` (relative to the element's `x`, `y`) and `startArrowhead` / `endArrowhead` (`"arrow"`, `"bar"`, `"dot"`, `"triangle"`).

### Events (no permission)

```ts
on('change' | 'selection', handler): void
off('change' | 'selection', handler): void
```

Handlers take **no arguments** — fetch what you need inside (`getText()`, `getContent()`, …). Debounce heavy `change` handlers (see quotas).

**`insertContent` vs `insertMarkdown`:** `insertContent` expects HTML or a TipTap doc — markdown through it shows literal `**asterisks**`. `insertMarkdown` routes through the same formatter Hillnote uses for AI chat output (headings, code blocks, tables, lists). Use `insertMarkdown` for any markdown or model output.

### `hillnote.files`

```ts
read(relPath): string                   // (files:read)
write(relPath, content): unknown        // (files:write)
list(relPath): DirEntry[]               // (files:read)
```

Paths are relative to the workspace root; traversal (`..`, leading `/`) is rejected. Writes inside `plugins/<your-id>/` count toward the 50 MB plugin quota; writes elsewhere don't.

### `hillnote.llm` (`llm:ollama`)

```ts
getPreferredModel(): string | null      // the model the USER selected — always use this
checkOllamaStatus(): { running, hasPreferredModel }
ollamaRequest(endpoint, options): unknown                        // buffered — poor UX for long prompts
ollamaStream(endpoint, options, callbacks): Promise<finalChunk>  // preferred
```

`endpoint` is an Ollama API path like `/api/chat`; `options` is the raw request body Ollama expects. **Never hard-code a model name** — the user may not have it installed; if `getPreferredModel()` returns null, show "no local model selected".

`ollamaStream` callbacks: `onChunk(chunk)` per token batch, plus optional `onComplete(finalChunk)` / `onError(err)`. The returned Promise resolves with the final chunk (the one with `done: true`) or rejects on stream error. **One stream at a time** — starting another replaces the prior one's delivery, so disable the trigger control while streaming.

```js
const model = await hillnote.llm.getPreferredModel();
if (!model) { out.textContent = 'No local model selected in Hillnote.'; return; }
await hillnote.llm.ollamaStream('/api/chat', {
  method: 'POST',
  body: { model, stream: true, messages: [{ role: 'user', content: prompt }] },
}, {
  onChunk: (c) => { out.textContent += (c.message?.content || ''); },
  onError: (e) => { showError(e); },
});
```

### `hillnote.secrets` (`secrets`)

```ts
set(key, value): unknown                // value must be a string — JSON.stringify objects
get(key): string | null
delete(key): unknown
list(): string[]                        // your plugin's keys
```

Encrypted on disk, namespaced per plugin (other plugins can't read yours). Keys match `[a-zA-Z0-9._-]+`, ≤128 chars. Cap: 1 MB total per plugin (`QuotaExceeded` beyond). Uninstalling wipes secrets; disabling keeps them. **Use this for API keys — not `localStorage` (the sandbox has none).**

### `hillnote.meta`

```ts
getManifest(): { id, name, version, kind }
getGrants(): string[]                   // permissions actually granted — may be narrower than the manifest
```

Check `getGrants()` before using an optional capability.

### `hillnote.viewExtension` (preview)

```ts
getProps(): object | null               // read-only props the host hands a view-extension slot; null for sidebar plugins
```

`kind: "view-extension"` plugins (with a manifest `extends` like `{ "kind": "database-view", "id": "timeline" }`) are a **preview** capability for custom editor views — the host passes the slot read-only data (e.g. database rows) through `getProps()`. For anything users need today, build a `sidebar` plugin.

## Quotas and limits

- **RPC rate**: 100 calls/sec per plugin (token bucket). Excess throws `RateLimited` — debounce your `change` handler.
- **Secrets**: 1 MB total → `QuotaExceeded`.
- **Files**: 50 MB inside `plugins/<your-id>/`; outside the folder uncapped.

## Network

Default CSP blocks all outbound requests. To call out:

```jsonc
{ "permissions": ["network"], "networkHosts": ["api.example.com"] }
```

- HTTPS only — no `http://`.
- Plain hostnames — no schemes, paths, `*.wildcards`, IPs, or ports.
- Each hostname becomes one `connect-src https://hostname` CSP entry; anything else fails with a CSP violation in DevTools.

## Sandbox: what does NOT work

- **No `localStorage`, cookies, or IndexedDB** — the iframe is a null-origin sandbox (`allow-scripts` only). Persist via `secrets` (small/sensitive) or `files.write`.
- **No `window.parent` / `window.top` access** — cross-origin restrictions block it; the bridge is the only channel to the app, and the host validates every RPC argument against grants.
- **No `http://` requests** — HTTPS only, allowlisted hosts only.
- **No multi-color custom SVG icons** — masks render one color; use a lucide icon name instead.
- **No source-code protection** — plugin JS is readable on disk. Proprietary logic belongs on the user's own server, called via `network`.

## Errors and debugging

- Uncaught errors and unhandled rejections forward to the host automatically and appear as a **red badge** on the plugin's manager card (counts the last hour) — clicking shows timestamps and stacks (in-memory, cleared on app restart). No need to build logging UI for development.
- Manifest problems render as a red banner under the card; a threat-pattern scan shows an amber banner; new permissions trigger an amber re-consent banner.
- For live inspection: open the app's DevTools (`Cmd+Option+I` on macOS / `Ctrl+Shift+I` elsewhere) and check the plugin iframe's console.

## Manager UX (what the user sees)

- Plugins live under the editor's **3-dot menu → Plugins** (after plugins are enabled in the app's settings).
- Each plugin is a card: icon + name + description + meta line (`v0.1.0 · sidebar · by Author`), an Enable/Disable button, and a trash icon (hover) with an uninstall confirm.
- The consent dialog lists requested permissions at enable time; permission changes require re-consent.

## Common idioms

- **"Run when the doc changes"**: `hillnote.editor.on('change', handler)` — fetch content inside the handler.
- **"Insert formatted markdown"**: `insertMarkdown(md)`, never `insertContent(md)`.
- **"Stream from a model"**: `getPreferredModel()` → `ollamaStream` with `onChunk`.
- **"Save an API key"**: `hillnote.secrets.set(key, value)`.
- **"Call my server"**: `network` permission + hostname in `networkHosts`, HTTPS only.
- **"Show errors"**: don't — uncaught errors already surface on the manager card.

## After scaffolding, always tell the user

1. The exact save path: `<workspace>/plugins/<id>/` (two files).
2. How to enable: turn plugins on in Hillnote's settings, then editor 3-dot menu → Plugins → Enable.
3. Which permissions the consent dialog will list, and why each is needed.
4. Where errors show up if something breaks: red badge on the manager card; DevTools console for the iframe.
