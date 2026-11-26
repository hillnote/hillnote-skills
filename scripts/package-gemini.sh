#!/usr/bin/env bash
# Build the Gemini CLI extension archive that the release workflow attaches.
#   ./scripts/package-gemini.sh [out.tar.gz]
set -euo pipefail

cd "$(dirname "$0")/.."

out="${1:-dist/hillnote-gemini.tar.gz}"
plugin="plugins/hillnote"

stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

cp "$plugin/gemini-extension.json" "$plugin/LICENSE" "$stage/"
# Gemini copies an installed extension with fs.cp, which breaks symlinks, so the archive needs real files.
cp -RL "$plugin/skills" "$stage/skills"

mkdir -p "$(dirname "$out")"
tar -czf "$out" -C "$stage" gemini-extension.json LICENSE skills

echo "Wrote $out"
