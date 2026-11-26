# HTML tools

Self-contained interactive mini-apps that live inside the workspace — calculators, trackers, timers, visualizers, dashboards, custom forms. They run in Hillnote's sidebar preview (a narrow ~350–450px column), render inline in documents, and can be a **Custom view** tab of a database or sheet. Build one when the user wants interactivity a document or database can't provide.

**Design and styling rules live in `references/tool-design.md`.** When MCP is connected, `get_html_tool_guide` serves the live version — call it before building anything.

## Anatomy

```
resources/html/<toolName>/          # or resources/html/<category>/<toolName>/
├── index.html                      # entry point — one self-contained file is the ideal shape
├── tool.meta.json                  # metadata + sheet/database declarations — server-managed, never write it via MCP
└── tool.settings.json              # the tool's hillnote.settings state — written by the tool at runtime, never by you
```

plus one workspace-level `resources/html/tool_registry.json` (the app's tile index) — also server-managed.

- `toolName` and `category`: letters, numbers, underscores, hyphens only.
- Entry point: flag one file `isEntryPoint: true`, or name it `index.html`.
- A document embeds a tool with a markdown link: `[html:Display Name](resources/html/<tool>/index.html)`.
- `tool.meta.json` and `tool_registry.json` are maintained by `add_html_tool` / `attach_tool_sheet` / `attach_tool_database` / `edit_html_tool`. `write_html_file`, `replace_in_html_file` and `edit_html_tool` file operations refuse them — and `tool.settings.json` — ("managed automatically" / "saved state"). Only in Files mode do you write `tool.meta.json` yourself — fields: `name`, `description`, `glyph`, `category`, `entryPoint`, `files`, `createdAt`, and `sheets` / `databases` (below); always read-modify-write it, keeping fields you don't know.

## Data: Sheets and settings

Tools are sandboxed — `localStorage`, `sessionStorage`, IndexedDB and cookies don't persist. A tool stores **records in a Sheet** (`await hillnote.sheet('Name')` → `rows()` / `add()` / `update()` / `remove()` / `onChange()`) and **small state** in `hillnote.settings.get/set`. Code patterns: `references/tool-design.md` → Data persistence.

A tool reaches only the sheets declared in its `tool.meta.json` (plus, in a Custom view, that view's own data — below):

```json
"sheets": [
  { "name": "Expenses", "path": "Tools/Expenses", "owned": true,
    "columns": [{ "id": "title", "name": "Item", "type": "title" }, { "id": "amount", "name": "Amount", "type": "number" }] }
]
```

- `path` is relative to `documents/`. `name` is what the tool passes to `hillnote.sheet()` (case-insensitive). Max 20 per tool.
- **Declare with columns → a new sheet** at `documents/Tools/<name>`, owned by the tool: its `sheet.json` carries `"owner": { "tool": "resources/html/<tool>" }` and the tool uses it without a prompt. Fails if that folder already exists — connect it instead.
- **Declare by name only → connect an existing sheet**, matched case-insensitively on its name or folder name anywhere in `documents/` (exactly one match, or the call fails listing the candidates). The user approves the tool's access once, in the app.
- Every spec is validated before anything is written. Results list each sheet's column ids — rows are keyed by column id (display names also work).
- New tool: `add_html_tool(…, sheets: [{ name, columns? }])`. Existing tool: `attach_tool_sheet(toolName | toolPath, sheet: { name, columns? })` — replaces a same-named declaration, keeps every other `tool.meta.json` field, never deletes a sheet or rows. Loose tools (a bare `.html` directly in `resources/html/`) can't declare sheets — give them a folder first.
- Files mode: create the sheet per `references/sheets.md`, add the `owner` marker to its `sheet.json` if the tool owns it, and add the entry to `tool.meta.json` yourself.

### Existing databases, the primary source, Custom views

- **Databases** are declared the same way in `"databases": [{ "name", "path", "columns" }]` (max 20) — connect-only (tools never create databases; for new records use a sheet). New tool: `add_html_tool(…, databases: [{ name }])`; existing tool: `attach_tool_database(toolName | toolPath, database: { name })` — exactly one database must match the name or folder name. The tool uses `await hillnote.database('Name')` with the same `rows/add/update/remove/onChange/columns`. A database row's `id` is its row document's filename (`"Ace of spades.md"`); `add()` returns the new ids (a clashing title gets a numbered filename, `"King 2.md"`), and setting `title` renames the row, so re-read ids afterwards. Computed (formula) columns — in sheets too — are read-only. A tool's access to a database always needs the user's one-time approval in the app (per device) — unless they added the view or linked the data themselves.
- **Primary**: mark one sheet or database entry `"primary": true` (any of the calls above take `primary`; a new primary replaces the old one; marking two in one call fails) and the tool reads it without naming it: `await hillnote.data()`. `data()` resolves to the Custom view's own data, else the `primary` entry, else the tool's only declared source — otherwise it rejects ("This tool has no linked data…" / "…has no primary data source…"), so catch it and show an empty state.
- **Custom views**: `add_tool_view(toolName | toolPath, database | sheet, viewName?)` appends a view tab of type `tool` (named `viewName`, else the tool's name) to that database/sheet and makes it the open view — every call adds another tab. The tool needn't declare that data: in the view, `hillnote.data()` *is* the view's database/sheet and `rows()` already follows the toolbar's filters, search and sort (the tool's own `filters` narrow further, its `sort` wins; `rows({ ignoreView: true })` for every row); `onChange` also fires when those change. `hillnote.sheet()` / `hillnote.database()` still reach only declared sources, unfiltered. Files mode: append `{ "id": "<unique>", "name": "Cards", "type": "tool", "toolPath": "resources/html/<tool>/index.html", "filters": [], "sorts": [] }` to the `views` in its `database.json` / `sheet.json` — if `views` is empty, put `{ "id": "default", "name": "Table", "type": "table", "filters": [], "sorts": [] }` first or the table view is lost — and set `lastOpenedView` to the new id to open it. Use a Custom view when the user wants their data *shown differently* (a card deck, a chart, a game board) rather than a separate app.
- **Context**: `await hillnote.ready()`, then `hillnote.context` is `{ surface: 'view' | 'preview' | 'embed' | 'quickmenu', view: { id, name, filters, search, sort } | null, source: { kind, name } | null, theme: 'light' | 'dark' }` (`view` only in a Custom view); `hillnote.onContextChange(cb)` fires when the view's filters/search/sort or the app's light/dark theme change. Every view of a tool shares one `hillnote.settings` — key per-view state by `context.view.id`.

## The injected baseline (know this before writing)

Every `.html` file saved through the tools gets a design-system baseline injected automatically: theme tokens that resolve for light and dark, pre-styled bare elements, a class kit (`.btn`, `.card`, `.toolbar`, …), and an error-reporting bridge. Consequences:

- **Don't write** CSS resets, dark-mode media queries, base typography, scrollbar, or form-control styles — they're provided. Write only tool-specific CSS (full inventory: `references/tool-design.md`).
- **Reads hide the baseline** as a single `<!-- hillnote-baseline -->` placeholder line. Never edit it — `replace_in_html_file` refuses any `searchText` containing `hillnote-baseline` or `hillnote-error-bridge`. To restyle, override its CSS variables in your own `<style>` (e.g. `:root { --radius: 12px }`).
- Runtime errors in a running tool are captured automatically and surfaced to the user in the app's preview panel — don't build error-logging UI into the tool.

## Build loop

1. **Guide** — `get_html_tool_guide` (Files mode: read `references/tool-design.md`).
2. **Plan** — pin down the one job, inputs, outputs. State a 2–3 bullet design direction. Small and single-purpose beats configurable.
3. **Create in ONE call** — `add_html_tool(workspace | workspacePath, toolName, files: [{filename, content, isEntryPoint?}], description?, glyph?, category?, sheets?, databases?)`
   - `glyph`: the tile emoji (over 4 codepoints is silently trimmed; default 🔧). Always set it.
   - `description`: the tile subtitle (silently capped at 500 chars). Always set it.
   - `sheets`: `[{ name, columns?, primary? }]` for any tool that stores records (see Data above). The response's `sheets` give the column ids to key rows by.
   - `databases`: `[{ name, primary? }]` for a tool built for an existing database; the response lists its column ids.
   - Needs at least one `.html` file; fails if the tool already exists (edit it instead, or pick another name).
4. **Check `validation`, not a read-back.** Every HTML write returns `validation` with an `issues` array:
   - **Empty `issues` ⇒ done.** Do NOT read the file back to verify.
   - Non-empty ⇒ fix each listed issue with `replace_in_html_file`.
5. **Embed** — local MCP: use the returned `markdownLink`, or `add_tool_to_doc(workspacePath, documentPath, toolName, position: "end" | "beginning" | "after:<text>")`. Remote: build `[html:Name](<path>/<entryPoint>)` from the response and insert it with `insert_content`. Files mode: write the link into the document directly. A tool built for a database/sheet usually belongs in a view instead: `add_tool_view`.

## Editing existing tools

| Step | Tool |
|---|---|
| Discover | `list_html_tools` (optional `category`) |
| Inspect | `get_html_tool` (`listOnly: true` first for big tools) → `read_html_file` (`startLine`/`endLine` for ranges; returns `totalLines`) |
| Targeted edit (preferred) | `replace_in_html_file` with `searchText`, `replaceText`, optional `replaceAll` / `occurrenceIndex` |
| Whole-file rewrite | `write_html_file` (last resort) |
| Batch ops + metadata | `edit_html_tool` (local only: create/update/delete files, update `description`/`entryPoint`) |
| Give it a sheet (e.g. moving off localStorage) | `attach_tool_sheet` with `sheet: { name, columns? }`, then switch the code to `hillnote.sheet(…)` with `replace_in_html_file` |
| Let it use an existing database | `attach_tool_database` with `database: { name, primary? }`, then use `hillnote.database(…)` / `hillnote.data()` |
| Show it as a view of a database/sheet | `add_tool_view` with the tool and `database` or `sheet` — the tool reads the view's rows with `hillnote.data()` |

`replace_in_html_file` errors tell you the fix — follow them, don't retry blind:

- **Not found**: exact match required. The error includes the file's line count and a content sample — use a shorter unique snippet from it, or read the exact range first.
- **"appears N times — ambiguous"**: expand `searchText` with surrounding context until unique, or pass `replaceAll: true` / `occurrenceIndex: <n>` (1-based).
- **"managed automatically"** / baseline refusal: you targeted a reserved file or the injected baseline — see the anatomy and baseline sections above.

For a file you wrote cleanly earlier in the session, your own last content is current — go straight to `replace_in_html_file` with a short unique `searchText` instead of re-reading.

## ToolForge (what the user sees in the app)

The app's ToolForge screen (in the navigation sidebar) shows every tool as a tile in a **My Tools** grid — glyph, name, description. Tools you create via MCP appear there automatically; a `registered: false` in your response is harmless (the tile is synthesized from the tool's metadata). Clicking a tile opens the tool in the sidebar preview. ToolForge also lets users build tools in-app: **Build in App** (describe → an in-app AI chat builds it) and **Create Spec Sheet** (writes a build-brief document into the workspace). If the user shows you a spec-sheet document, treat it as the tool's requirements and build from it. ToolForge's **Link data** builds a tool against a database's or sheet's real columns and can add it as a view tab.

In a database or sheet, the **Custom** view type picks a tool (tabs: Your tools · Templates · Build with AI — templates: Card deck, Chart, Key numbers, Checklist, Timeline, Leaderboard, Flashcards, Random picker); the view's bar offers Change tool, Edit with AI, Reload tool and Open in sidebar. If a template already fits the request, point the user to it before building.

## Mode notes

The tool surface is identical on remote and local MCP (local takes `workspacePath` and adds `add_tool_to_doc` / `edit_html_tool`). In Files mode, write the folder and files directly and include a `tool.meta.json` so the tool shows in the app — but note the design baseline is injected only by MCP/app writes, so a hand-written file must carry its own complete styling (see the Files-mode caveat in `references/tool-design.md`). Tools and Custom views run only in the Hillnote desktop app; the web app shows "HTML tools run in Hillnote for desktop." in their place.

## Don'ts

- Don't point `write_html_file` / `replace_in_html_file` at documents — they only accept `resources/html/` paths (the error names the right tool to use instead).
- Don't write dark-mode media queries or hardcode status colors — baseline theming handles it, and validation flags hardcoded hex.
- Don't read a file back after a clean `validation` — trust it.
- Don't build an HTML tool where a database (rows, views) or a plain document is the right shape — tools are for *interaction*; the records they keep belong in a Sheet.
- Don't persist with `localStorage` / `sessionStorage` / IndexedDB / cookies — they reset in the tool sandbox. Use a declared Sheet and `hillnote.settings`.
- Prefer one self-contained HTML file; sibling files in the tool folder (`style.css`, `app.js`, modules, extra pages) load too, but each is another file to maintain.
- Don't assume network access from inside a tool — keep logic client-side and offline-capable.
