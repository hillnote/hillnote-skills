#!/usr/bin/env bash
# Set the plugin version in every manifest at once.
#   ./scripts/bump.sh patch | minor | major | x.y.z
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <major|minor|patch|x.y.z>" >&2
  exit 1
fi

# Same list as scripts/validate.mjs.
files=(
  "plugins/hillnote/plugin.json"
  "plugins/hillnote/.claude-plugin/plugin.json"
  "plugins/hillnote/.cursor-plugin/plugin.json"
  "plugins/hillnote/.antigravity-plugin/plugin.json"
  "plugins/hillnote/gemini-extension.json"
  ".claude-plugin/marketplace.json"
)

current_version="$(sed -nE 's/^[[:space:]]*"version": "([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p' "${files[0]}" | head -n 1)"
IFS=. read -r major minor patch <<< "$current_version"

case "$1" in
  major) new_version="$((major + 1)).0.0" ;;
  minor) new_version="$major.$((minor + 1)).0" ;;
  patch) new_version="$major.$minor.$((patch + 1))" ;;
  *)
    if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      new_version="$1"
    else
      echo "Usage: $0 <major|minor|patch|x.y.z>" >&2
      exit 1
    fi
    ;;
esac

for file in "${files[@]}"; do
  perl -0pi -e "s/\"version\": \"[0-9]+\\.[0-9]+\\.[0-9]+\"/\"version\": \"$new_version\"/" "$file"
done

node scripts/validate.mjs
echo "Updated version: $current_version -> $new_version"
