# Hillnote tool reference

Canonical catalog of every Hillnote MCP tool and where it exists. Your client always has the authoritative parameter schemas via the MCP tool list — this file adds availability, ordering, and the gotchas that schemas can't express.

**Legend:** R = remote MCP (hillnote.com/mcp) · L = local MCP (`hillnote-mcp`) · F = achievable with direct file access (Files mode). "F" names the file operation, since Files mode has no Hillnote tools.

**With the `hillnote` command** every L tool is `hillnote raw <tool> --args '{…}'` (the workspace is filled in), and every one has a designed command too — map at the end of this file, usage in `references/cli.md`. On the computer that holds the workspace, prefer the command; use R for workspaces that are only in the cloud (`references/modes.md`).

**Workspace parameter:** remote tools take `workspace` = a workspace ID from `list_workspaces`. Local tools take `workspace` = a workspace name or path — **except local recipe and HTML-tool tools, which take `workspacePath` (the workspace folder path) instead**. Always start from `list_workspaces` output rather than guessing.

## Availability matrix

| Domain | Tool | R | L | F equivalent |
|---|---|---|---|---|
| Guides | `get_slides_story_guide` | ✓ | ✓ | — (use `references/slides.md`) |
| Guides | `get_slides_visual_guide` | ✓ | ✓ | — (use `references/slides.md`) |
| Guides | `get_html_tool_guide` | ✓ | ✓ | — (use `references/tool-design.md`) |
| Workspace | `list_workspaces` | ✓ | ✓ | list known workspace folders |
| Workspace | `read_registry` | ✓ | ✓ | read `documents-registry.json` |
| Workspace | `list_collaborators` | ✓ | — | — (cloud concept) |
| Documents | `read_document` | ✓ | ✓ | read the `.md` file |
| Documents | `add_document` | ✓ | ✓ | write a new `.md` under `documents/` |
| Documents | `rename_document` | ✓ | ✓ | rename file (registry catches up) |
| Documents | `move_document` | ✓ | — | move file between folders |
| Documents | `delete_document` | ✓ | ✓ | delete the file |
| Documents | `insert_content` | ✓ | ✓ | edit the file |
| Documents | `delete_content` | ✓ | ✓ | edit the file |
| Documents | `replace_content` | ✓ | ✓ | edit the file |
| Search | `search_documents` | ✓ | ✓ | grep across `documents/` |
| Databases | `find_databases` | ✓ | — | find folders containing `database.json` |
| Databases | `list_databases` | — | ✓ | same as above |
| Databases | `get_database_config` | ✓ | — | read `database.json` |
| Databases | `get_database_rows` | ✓ | — | read row `.md` files |
| Databases | `query_database_rows` | ✓ | — | filter row frontmatter yourself |
| Databases | `read_database` | — | ✓ | read config + rows |
| Databases | `save_database_config` | ✓ | — | write `database.json` |
| Databases | `create_database` | ✓ | ✓ | create folder + `database.json` |
| Databases | `delete_database` | ✓ | ✓ | delete the folder |
| Databases | `add_rows` / `update_rows` / `delete_rows` | ✓ | ✓ | write/edit/delete row `.md` files |
| Databases | `add_column` / `update_column` / `delete_column` | ✓ | ✓ | edit `database.json` (+ rows) |
| Databases | `create_view` | ✓ | ✓ | edit `database.json` |
| Databases | `list_views` | — | ✓ | read `database.json` `views` |
| Sheets | `find_sheets` | ✓ | — | find folders containing `sheet.json` |
| Sheets | `list_sheets` | — | ✓ | same as above |
| Sheets | `get_sheet` | ✓ | — | read `sheet.json` |
| Sheets | `query_sheet_rows` | ✓ | — | filter `data.csv` rows yourself |
| Sheets | `read_sheet` | — | ✓ | read config + rows |
| Sheets | `add_sheet_rows` | ✓ | ✓ | append CSV lines (empty `_hnid` cell) |
| Sheets | `update_sheet_rows` | ✓ | ✓ | edit CSV cells (keep `_hnid`) |
| Sheets | `delete_sheet_rows` | ✓ | ✓ | remove CSV lines |
| Sheets | `create_sheet` | ✓ | ✓ | create folder + `sheet.json` + `data.csv` |
| Libraries | `list_libraries` | ✓ | ✓ | find folders containing `library.json`; `cat` the `<Library>.md` card |
| Libraries | `get_library_outline` | ✓ | ✓ | `cat <volume>/outline.md` |
| Libraries | `search_library` | ✓ | ✓ | `rg -il <term> <volume>/sections/` |
| Libraries | `get_library_section` | ✓ | ✓ | `cat` the section file (keep its frontmatter when editing) |
| Libraries | `get_library_map` | ✓ | ✓ | `cat` the card + each `<volume>/outline.md` |
| Playbooks | `list_playbooks` | ✓ | ✓ | `ls documents/<Library>/playbooks/`; read each `when:` line |
| Playbooks | `read_playbook` | ✓ | ✓ | `cat` the playbook, then `cat` each pinned reference |
| Playbooks | `create_playbook` / `update_playbook` | ✓ | ✓ | write/edit `documents/<Library>/playbooks/<name>.md` (format in `references/library.md`) |
| Moodboards | `get_moodboard_guide` | ✓ | ✓ | — (use `references/moodboard.md`) |
| Moodboards | `read_moodboard` | ✓ | ✓ | read the ```moodboard fence |
| Moodboards | `add_moodboard_items` | ✓ | ✓ | edit the ```moodboard fence per `references/moodboard.md` |
| Moodboards | `update_moodboard_items` | ✓ | ✓ | edit the ```moodboard fence per `references/moodboard.md` |
| Moodboards | `remove_moodboard_items` | ✓ | ✓ | edit the ```moodboard fence per `references/moodboard.md` |
| Moodboards | `clear_moodboard` | ✓ | ✓ | edit the ```moodboard fence per `references/moodboard.md` |
| Moodboards | `draw_on_moodboard` | ✓ | ✓ | — (lay the items out yourself, or use a ```mermaid fence) |
| Moodboards | `render_moodboard` | app-only | ✓ app running | — |
| Views (remote) | `show_document` / `show_table` / `show_moodboard` | ✓ | — | — (local: the App interface tools) |
| Views (remote) | `render_document` / `get_asset_urls` | app-only | — | — |
| HTML tools | `add_html_tool` | ✓ | ✓ | create folder under `resources/html/` |
| HTML tools | `list_html_tools` | ✓ | ✓ | list `resources/html/` |
| HTML tools | `get_html_tool` | ✓ | ✓ | read the tool folder |
| HTML tools | `read_html_file` | ✓ | ✓ | read a file in it |
| HTML tools | `write_html_file` | ✓ | ✓ | write a file in it |
| HTML tools | `replace_in_html_file` | ✓ | ✓ | edit a file in it |
| HTML tools | `attach_tool_sheet` | ✓ | ✓ | add a `sheets` entry to its `tool.meta.json` (create the sheet in `documents/Tools/` first) |
| HTML tools | `attach_tool_database` | ✓ | ✓ | add a `databases` entry to its `tool.meta.json` |
| HTML tools | `add_tool_view` | ✓ | ✓ | append `{ id, name, type: "tool", toolPath, filters: [], sorts: [] }` to the database.json/sheet.json `views` (see `references/html-tools.md` → Custom views) |
| HTML tools | `add_tool_to_doc` | — | ✓ | insert `[html:Name](path)` link yourself |
| HTML tools | `edit_html_tool` | — | ✓ | edit files + metadata |
| App UI | `get_app_state` | — | ✓ | — (needs the running app) |
| App UI | `open_document` / `open_workspace` | — | ✓ | — |
| App UI | `scroll_to` / `highlight_text` | — | ✓ | — |
| App UI | `show_slide` / `open_database` / `open_sheet` / `open_library` | — | ✓ | — |
| App UI | `post_activity` | — | ✓ | — |
| App UI | `open_view` / `notepad` / `build_mode` / `check_preview` | — | ✓ | — |
| Trash | `list_trash` / `restore_from_trash` | — | ✓ | — (`hillnote trash restore`: a file moved out of `.hillnote/trash/` by hand loses its registry entry) |
| Recipes | `list_recipes` / `get_recipe` / `get_recipe_documents` | ✓ | ✓ | read `ai_prompt_overrides.json` |
| Recipes | `create_recipe` / `update_recipe` | ✓ | ✓ | edit `ai_prompt_overrides.json` (preserve other keys) |
| Kanban automation | `get_board_automation` | — | ✓ | read `database.json` / `sheet.json` (`hillnote automation show`) |
| Kanban automation | `configure_board_automation` | — | ✓ | — (`hillnote automation set`) |
| Kanban automation | `schedule_card_move` / `cancel_scheduled_move` | — | ✓ | — (`hillnote schedule add` / `cancel`) |
| Sync | `push_changes` / `pull_changes` | — | ✓* | — (app syncs) |
| Sync | `list_conflicts` / `resolve_conflict` | — | ✓* | — |

\* Sync tools appear when the local server runs managed by the Hillnote app; a standalone `hillnote-mcp` may not expose them.

Counts to sanity-check a connection: remote lists 72 tools (66 plus 6 view tools such as `show_document`); local lists 84 — 70 file tools + 14 App UI tools (plus the 4 sync tools when app-managed). "app-only" tools serve the remote interactive views — they're listed, but not for you to call.

**Scopes (remote):** the OAuth grant is `read` or `read_write`. With a read-only token every write tool fails with `Write access required. This token only has "read" scope.` — the fix is to reconnect choosing read & write, not to retry.

## Documents

- `read_document(workspace, documentId, startLine?, endLine?)` — `documentId` is an ID or path from `read_registry`. Response includes `totalLines`; use ranges for big files (both servers). Library section files resolve by path too (`documents/<Library>/<Volume>/sections/<file>.md`, or a `doc:…#s-…` citation) even though sections are not in the registry — the response flags `isLibrarySection` — but for library questions prefer `search_library` + `get_library_section`, never a whole volume.
- `add_document(workspace, title, content?, tags?, folder?, emoji?)` — title ending `.slides.md` / `.moodboard.md` creates those types (moodboard: **omit content entirely**; a moodboard create returns the `moodboardPath` to pass to the moodboard tools). Creating over an existing file is blocked (remote and local) — the error tells you to edit it or pick another title, so retitle rather than retry. **Local** keeps the title as the file name (`Launch Plan.md`, `会議メモ.md` — Hillnote lists a document under its file name; only characters a file name cannot hold are dropped) and returns the created `path`: use that path from then on.
- `replace_content(workspace, documentId, searchText, replaceText, all?)` — **exact-match contract**: `searchText` must match byte-for-byte including whitespace and newlines. Read the document first and copy the text. `all: true` replaces every occurrence; default is first-only.
- `insert_content` — remote prefers `afterLine` (0 = before line 1) over `position: "start"|"end"`; local uses `position` ("start", "end", or a character offset) with optional `expectedLineBefore` as a guard. Default is append. Local `position: "start"` means the start of the BODY: in a file with a properties (frontmatter) block the text lands after it, never above it.
- `delete_content` — remote prefers `startLine`/`endLine`; local uses `startPos`/`endPos`. Both **require `expectedContent`** (the exact text you expect to delete) — blind positional deletes are rejected.
- `move_document(workspace, documentId | documentIds[≤25], targetFolder?)` — remote only. Omit `targetFolder` for root. A move that would land on another document's path is skipped with a per-item error, not an overwrite.
- `rename_document` changes title + filename + registry; renaming onto an existing document's file name is blocked (remote and local). Local: a true rename (content kept byte for byte, registry entry moves with it), and a change of letter case only is allowed. For database rows prefer editing via database tools (filename = row title).
- `delete_document`: confirm with the user and verify the ID against `read_registry` first. **Local** deletes are recoverable — the file moves to `.hillnote/trash/<timestamp>/…` in the workspace (kept 30 days) and the result carries `trashPath`. `restore_from_trash(workspace, path)` puts it back — `path` is the original path (as `list_trash` reports it), the `trashPath`, or just the name — together with its registry entry (emoji, pin, position, links); it never overwrites something that now lives at that path. **Remote** deletes are permanent — `delete_document`, `delete_rows` and `delete_database` alike (the app removes the files on its next sync). In apps that support it, Hillnote Cloud first asks the user to confirm in a prompt of its own; a result starting "Nothing was deleted" means they declined or closed it — tell them, and don't retry unless they ask. Locally `delete_rows` and `delete_database` go to the trash the same way.
- Local `search_documents` results carry `path` (the workspace-relative registry path). Pass that to `read_document` / `replace_content` — `documentId` is only the file's base name and is ambiguous when two folders hold the same name.

## Search

- Remote `search_documents(query, workspace?, offset?, maxResults?)` — case-insensitive substring over titles/tags/content across all workspaces (or one). `maxResults` default 20, max 100. Title/tag matches are exhaustive; content search scans the ~150 most-recently-modified documents and sets `contentSearchPartial` when capped — narrow the query or scope to one workspace rather than assuming "not found".
- Local `search_documents(query, workspace?, fuzzy?, threshold?)` — fuzzy, weighted ranking (filename > title > headings > tags > body).

## Databases

Both servers have the same write tools (below); the reads differ. Remote reads:
- `find_databases(workspace)` → paths, columns, views. Always first.
- `get_database_config(workspace, databasePath)` → column names for filters, current shape before saving.
- `get_database_rows(workspace, databasePath, startRow?, maxRows?)` — path order, default 50, max 200, returns `totalRows`/`hasMore`.
- `query_database_rows(workspace, databasePath, filter?, sort?, startRow?, maxRows?)` — filters ANDed, operators `equals | not_equals | contains | gt | lt | gte | lte` (numeric strings compare numerically). Scans up to 500 rows and sets `partialScan` beyond that — tighten filters or page with `get_database_rows`.
- `save_database_config(workspace, databasePath, config, confirm?)` — **overwrites the keys it manages** (`name`, `columns`, `views`, `defaultView`, `description`, `emoji`, `agents`); any other top-level keys in the file are kept. Flow: `get_database_config` → modify the returned object → save the whole thing, passing `agents` (the board's agent defaults) and the status column's `optionAgents` / `optionAutoMoves` back unchanged (kanban automation can't be set up remotely). Failsafes: columns must keep `title` and unique ids; a save that would REMOVE existing columns is blocked unless `confirm: true` (the error lists them) — merge into the full column list instead of sending a partial one; a non-object `agents` is refused.

Local reads: `list_databases`, `read_database` (config + rows with filter/sort/search in one — operators `equals | notEquals | contains | notContains | greaterThan | lessThan | isEmpty | isNotEmpty`, note the different spelling from remote), `list_views`.

Writes, same names and parameters on both servers: `create_database(workspace, name, columns?, views?, defaultView?, folderPath?)`, `delete_database(workspace, databasePath, confirm)`, `add_rows(workspace, databasePath, rows)`, `update_rows` (by row ids or matching criteria), `delete_rows`, `add_column`, `update_column`, `delete_column`, `create_view`. Column/view shapes are in `references/databases.md`.

- Remote differences: a row id is its `filePath` from `get_database_rows` / `query_database_rows` (the bare file name works too); deleted rows and databases are permanent (local: workspace trash); each call is one all-or-nothing commit; `add_rows` takes up to 500 rows per call and a `where` or a column change covers up to 1,000 rows; `update_column` also renames a changed id inside views, and `delete_column` drops the column from views' group-by too.

- `create_database` refuses a target folder that already exists and holds anything — a `database.json` dropped among existing documents would turn every one of them into a row. Pick another name or `folderPath`.
- `read_database` accepts two extra local options: `includeRows: false` returns the columns, views and a row count without reading any row (use it to check a schema before writing), and `includeContent: true` adds each row’s full markdown body as `_content` — the way to read a row you just added, since new row files are not in the document registry until the app rescans.

Write failsafes, both servers (each block explains how to retry):
- Row payload keys must be **column IDs** (not names); select/status/multiselect values must match the column's options exactly — invalid payloads are rejected before anything is written.
- `update_rows`/`delete_rows`: a `where` matching **more than one row** is blocked unless you pass `allowMultiple: true`; prefer `ids` (row file paths from `read_database`, or `get_database_rows` / `query_database_rows` on remote) for single-row changes. Empty `where`, empty `ids`, unknown ids, and zero matches are all errors, never silent no-ops. Title renames must target exactly one row and won't overwrite another row's file. **A row's file name is its title** (in the app and on both servers): `add_rows` keeps the title as given (`Fix login bug.md`; a duplicate becomes `Fix login bug 2`) and returns each new row's `title` and `filePath` in `addedRows` — address the row by that. A `title:` key in a row's YAML is not authoritative (the app writes one at creation and does not update it on rename).
- Local filters: `greaterThan` / `lessThan` (sheets also `…OrEqual`) compare **dates** when the filter value is a date (`2026-10-01`), numbers otherwise; `equals` / `notEquals` on a multiselect column test membership ("has this tag").
- `delete_database`, `delete_column` and `clear_moodboard` require `confirm: true` — the error reports how many rows/items would be lost. Confirm with the user before passing it.

## Sheets

CSV-backed datasets — a folder with `sheet.json` + one `data.csv` holding every row (no per-row documents; built for tens of thousands of rows). Full detail, the `_hnid` row-id contract, and Files-mode rules in `references/sheets.md`. **Both servers have full row CRUD**, as for databases.

- Remote reads: `find_sheets(workspace)` → `get_sheet(workspace, sheetPath)` (columns + `rowCount`) → `query_sheet_rows(workspace, sheetPath, search?, filters?, sort?, startRow?, maxRows?)` — default 50, max 200 per page, loop on `hasMore`.
- Local reads: `list_sheets(workspace)` → `read_sheet(workspace, sheetPath, search?, filters?, sort?, limit?, offset?)` — config + rows in one call.
- Filter operators on both servers: `equals | notEquals | contains | greaterThan | greaterThanOrEqual | lessThan | lessThanOrEqual | isEmpty | isNotEmpty` — the databases-style spelling, **not** the remote-database `gt`/`lt` forms.
- Writes (same names on both servers): `add_sheet_rows(workspace, sheetPath, rows)` — rows keyed by **column id**, new `ids` returned; `update_sheet_rows(workspace, sheetPath, updates, options{ids | where})` — prefer `ids` from a query; `delete_sheet_rows(workspace, sheetPath, ids, confirm: true)` — blocked without confirm; `create_sheet(workspace, name, columns, rows?, folderPath?)` — first column is always the title, fails if the folder exists.
- Rows returned carry a stable `id` — target updates/deletes with it. Sheets can be LARGE: always filter/search + paginate, never read everything.
- Remote caps: `data.csv` writes over 10MB and reads over 25MB are refused — that scale belongs in the Hillnote app.
- Sheet edits merge into a running app within a couple of seconds (row-by-row — they never clobber the user's in-app changes).

## Kanban automation (local only)

- `get_board_automation(workspace, databasePath | sheetPath)` — per status `{ agent, autoMove }`, `defaults`, this machine's `projectFolder`, pending `scheduledMoves` (each with `thisMachine`). No board → every scheduled move in the workspace.
- `configure_board_automation` — partial: only the `statuses` entries / `defaults` / `projectFolder` keys you pass change; `null` removes. Statuses must be options of the status column (matched case-insensitively); a zero-delay auto-move loop is refused; `projectFolder` paths must be existing absolute folders on this machine.
- `schedule_card_move(row, to, at = "now", column?)` — Hillnote makes the move, so the status's agent and auto-move run (only if the card actually changes status); returns `whenItLands: { startsAgent, thenAutoMovesTo }`. One schedule per card (replaces). `at`: `"now"`, ISO 8601, or `"YYYY-MM-DD HH:MM"` local; past times are refused. `column` = a select column to move along instead (no agents/auto-moves). Runs on this machine while that workspace is open in the app, or once when it next opens.
- Editing a status with `update_rows` / `update_sheet_rows` starts **nothing** — schedule the move instead. Details and recipes: `references/automation.md`.

## Libraries

A library (📚) is a folder of imported long documents — books, manuals, statutes, reports — stored as **volumes** of one markdown file per outline node with page numbers and stable ids. Five read-only tools plus four playbook tools, with **identical names, parameters and envelopes on both servers** (and in the app's own Chat); full detail, on-disk layout, citation forms, playbooks and the Files-mode recipe in `references/library.md`.

- `list_libraries(workspace, query?, limit?, offset?)` — libraries with `stats` and `volumes[]` (`id`, `title`, `path`, `folder`, `pages`, `sections`, `status`, `synced`). Default 50, max 200. Start here when the user names a book or long document.
- `get_library_map(workspace, library?, volume?, depth?, maxChars?)` — **read this first for any library question**: every section with its page range and summary, capped to fit a prompt (`depth` 1–6, default 2; `maxChars` 200–20000, default 4000; entries past the cap are counted, never silently dropped). Use it to pick what to read, to answer structural questions, and to tell "the library doesn't cover this" apart from "my search missed it".
- `get_library_outline(workspace, library, volume?, parent?, depth?, includeSummaries?, offset?, limit?)` — without `volume`: every volume with its top-level chapters (`topLevel`); with `volume`: the paginated outline tree (`depth` 0 = all, default 2; `parent` = a node id; `limit` ≤ 300, loop on `hasMore`).
- `search_library(workspace, query, library?, volume?, mode?, kinds?, limit?, offset?, snippetChars?)` — ranked hits with `section.id`, `section.file`, `pages`, a `**`-marked `snippet` and a `citation` object; `kinds: ["figure"]` searches figure captions/OCR. Both MCP servers rank by keywords (`engine: "csv-keywords"` / `"csv-keywords+grep"`) — `mode: "semantic"`/`"hybrid"` fall back and set `semanticUnavailable`; `contentSearchPartial: true` means the bounded body grep (or the 30-volume cap on remote) did not cover everything — scope with `library`/`volume` or quote a phrase.
- `get_library_section(workspace, section, library?, volume?, include?, maxChars?, offset?, inlinePageMarkers?)` — `section` = id (`s-…`), section file path / `doc:…#s-…` citation, or title (exact → prefix → substring; extra matches in `alternatives`). Body is a slice: loop with `offset = bodyRange.end` while `hasMore` (`maxChars` default 6000, `0` = metadata only). `include` picks `body`, `summary`, `children`, `neighbors`, `figures`, `pages` (default body + neighbors + pages). `citation.markdown` is the link to paste; `citation.page` opens the PDF page. `pendingUserReview: true` = unresolved sync conflict markers — don't edit. To edit: `replace_content` with `documentId = section.file`, keeping the frontmatter.

**Playbooks** — the user's saved "for this kind of question, read these sources and answer this way":

- `list_playbooks(workspace, library?, limit?)` — titles + one-line `when` triggers, no bodies. Cheap; call it early for anything that sounds routine or repeated.
- `read_playbook(workspace, playbook, library?, resolve?, maxChars?)` — the instructions **plus the full text of every pinned source** (`resolve` default true, `maxChars` 24000 across all bodies). This replaces searching: follow the instructions, cite from the bodies, fall back to `search_library` only for gaps. If a pinned source is reported missing, say so.
- `create_playbook(workspace, library, title, when, instructions?, references?, tools?)` — save a repeatable approach. Do it **unprompted** when the user states a standing preference ("from now on…"), corrects your approach in a way that generalises, asks a kind of question they've clearly asked before, or the answer needed a non-obvious source set that will be needed again. Not for one-off lookups or mid-exploration. `list_playbooks` first — never a near-duplicate. Keep `when` narrow; put the exact `citation.markdown` links you used in `references`. Tell the user you saved it.
- `update_playbook(workspace, playbook, library?, title?, when?, instructions?, references?, tools?)` — only the fields you pass change; `references` and `tools` **replace** the whole list. There is no delete tool.

References are forgiving on every surface — `library`: id, `documents/<Library>` (with or without the prefix, the card or `library.json` path) or title; `volume`: id, folder name or title; unique substrings work. Errors list what exists ("Known libraries: …", "Known volumes: …") — read them instead of guessing. Remote `workspace` is the workspace ID as usual; local takes name or path.

**Cloud libraries** (ids `cl-…`) are libraries hosted on hillnote.com and shared with the user, read-only. On remote, every read tool above (map, outline, search, section, playbook list/read) accepts `library = <cl-id or title>` with `workspace` omitted; playbook writes are refused on them. On local, a cloud library the user connected in the app shows up in `list_libraries`, and queries against it need the Hillnote app running.

## Interactive views (remote only)

Where the client displays MCP Apps views (Claude, ChatGPT and others), these put Hillnote content in front of the user inside the conversation, with an Open in Hillnote button. Use them when the user asks to see something, or to show a result you just made — the read tools stay the way to get data for yourself.

- `show_document(workspace, documentId)` — a rendered document, or a deck they can page through.
- `show_table(workspace, path)` — `path` = a sheet's or database's folder (from `find_sheets` / `find_databases`): a summary card that opens into a paged table they can sort, search and filter.
- `show_moodboard(workspace, moodboardPath)` — the board, read-only, with pan and zoom.

## App interface (local only)

These tools drive the **running Hillnote app's window** so the user can watch the work — they need the app open on the same machine, and the first UI call shows the user an approval dialog naming your client (denied/absent app returns a clear error; all file tools keep working). Use them to *show*, not to read/write content.

- `get_app_state()` — what's on screen: current workspace, open document with `isDirty` (**true = unsaved user edits — don't rewrite that file with content tools until they save**), any QuickView document.
- `open_document(workspace, document, target?, focusWindow?)` — put a document on screen. `target: "quickview"` opens a read-only side panel instead of replacing the user's editor. Doesn't create documents — `add_document` first.
- `open_workspace(workspace)` — switch to a workspace's landing page.
- `scroll_to(workspace, document, heading? | text? | anchorId?, highlight?)` — scroll to a section, with a pulsing highlight until the user clicks (default on). Case-insensitive; errors if not found, so use exact text from a fresh read. `anchorId` targets a `[text]{#id}` section anchor (the fragment of a `doc:…#id` link) — library section ids are documents, not anchors: use `open_library` with `section` for those.
- `open_library(workspace, library, volume?, section?, focusWindow?)` — libraries are folders, so `open_document` can't open them; this shows the library's landing page (volumes, outlines, search, Import/Reindex/Share) or, with `section` (id, file path or title), that section document. Accepts the same references as the library tools. Use after `search_library`/`get_library_section` to show the user the passage you cited.
- `highlight_text(workspace, document, text, all?)` — pulse-highlight occurrences ("look at this part"); purely visual, never touches the file. The result's `highlighted` flag is honest — false means the pointer didn't stick (a note explains).
- `show_slide(workspace, document, slideNumber)` — jump a `.slides.md` deck to a slide (**1-based**); switches the deck to presentation view if needed. Returns `totalSlides`.
- `open_database(workspace, database, view?, filters?, scrollToColumn?, calendarMode?, calendarDate?, highlightRow?)` — databases are folders, so `open_document` can't open them; this can also switch views (name/id/type), apply visible ad-hoc filters, scroll a kanban column into view, set the calendar to month/week/day or a date, and flash a row by id or partial title.
- `open_sheet(workspace, sheet, view?, filters?, scrollToColumn?, calendarMode?, calendarDate?, highlightRow?)` — the sheet twin of `open_database` (sheets are folders too). `highlightRow` takes the stable row id from `read_sheet` or a partial title. Use after `add_sheet_rows`/`update_sheet_rows` to show the user the result.
- `post_activity(message, workspace?, document?)` — post a short status line ("Drafting section 2…") to the in-app agent activity feed at the start of each major step.
- `open_view(view, workspace?, path?)` — show `chat`, `terminal`, `files` or `browser` filling the app's main area (in the tab that already has it, else a new tab, so the user's document stays open); `workspace` goes back.
- `notepad(action, text?, show?, workspace?)` — the workspace's Notepad in the side panel, for anything throwaway the user asks for ("jot this down", a list for now). `append` is the normal write; `replace` / `clear` only when the user asked or the text is yours (they run in the open panel, so the user can undo); `read` returns the page. What should last belongs in a document.
- `build_mode(action, project?, file?, line?, text?, to?, agent?)` — Build mode, the app's coding side: `enter` / `exit`, `open_project`, `open_file` (show the user code, optionally at a line), `send_to_terminal` (types an instruction at the project's coding agent, or a command at a shell prompt — **nothing runs until the user presses Enter**).
- `check_preview(url?, click?, width?)` — load a page of the Builds project the app is running (or a `localhost` URL / a path like `/settings`) in a hidden window, like a new visitor: console errors, uncaught exceptions, failed requests and a screenshot. Use it after a change to see whether the page works.

The app also has a **follow mode** (on by default): your content and row writes automatically open the changed document/database/sheet and highlight the changed section or row — so narrate with `post_activity`, write, then use `scroll_to`/`show_slide`/`open_database`/`open_sheet` for deliberate presentation moments.

The app also visualizes your presence on its own — a glow frame while you drive the UI, an "edited this document" chip when you write the doc the user is viewing, a sidebar flash on files you create/rename, and animated slide changes. You don't need to announce every small write; save `post_activity` for major steps and the UI tools for moments worth the user's attention.

## Slides

- `get_slides_story_guide()` → read before writing any deck. `get_slides_visual_guide(documentPath)` → read before the visual pass (requires the deck's path).
- Canvases (`.canvas.md`) have no tools on either server: they're edited only in the app (`references/canvas.md`).

## Moodboards

The same seven tools on both servers (guide, read, add, draw, update, remove, clear), plus `render_moodboard` locally and `show_moodboard` remotely. Every board tool takes `workspace` + `moodboardPath` (the `documents/….moodboard.md` path that `add_document` / `read_registry` report; must end in `.moodboard.md`). Item, connector, diagram and layout grammar in `references/moodboard.md`.

- `get_moodboard_guide()` → read before any moodboard work (guide text + usage notes).
- `read_moodboard(workspace, moodboardPath)` — English `summary`, `board` settings (incl. `locked`), every item with its id, every connector, counts and `warnings`. Read before updating, connecting to or removing existing items. `read_document` on a board returns raw JSON (local) or a summary without item ids (remote) — use this instead.
- `add_moodboard_items(workspace, moodboardPath, items?, connectors?)` — appends (frames to the back layer); ids are assigned and returned; connector endpoints may alias this call's items as `"#<index>"` or by a `ref` name you give the item. Connectors alone join items already on the board. Omit `h` on text and sticky notes to fit the box to its text. Caps ≤500 items / ≤1000 connectors per call. Invalid items and dangling connectors are dropped with a warning; the result's `ids` skip dropped items, and `issues` lists anything that overlaps, is cut off or hidden behind a box (empty = clean).
- `draw_on_moodboard(workspace, moodboardPath, nodes?, edges, layout?, direction?, groups?, edgeStyle?, at?, name?)` — a whole diagram in one call: Hillnote lays out the nodes, sizes each box to its text and routes the arrows. **Prefer it over `add_moodboard_items` for anything with connections or more than a few items.** Returns `refs` (your node ids → item ids), `bounds`, `warnings`, `issues`. Same `name` again redraws that diagram in place, keeping item ids. Format in `references/moodboard.md`.
- `render_moodboard(workspace, moodboardPath, ids?, region?)` — **local, app running**: a PNG of the board (or the items / region you name) as Export as Image paints it, plus the `issues`. Use it to check a drawing. App closed → `rendered: false` with a reason; the app is never launched.
- `update_moodboard_items(workspace, moodboardPath, updates)` — `[{ id, …fields }]`, ≤500 per call; only the given fields change; `null` removes an optional field; `type` is immutable; locked items are skipped unless the patch sets `locked: false`; the result lists `skipped` (with reasons) and `notFound`.
- `remove_moodboard_items(workspace, moodboardPath, ids)` — attached connectors go too; unknown ids come back in `notFound`; all-unknown is an error, not a silent no-op. Removing a frame leaves its contents.
- `clear_moodboard(workspace, moodboardPath, confirm)` — erases items, connectors and pen strokes (settings kept); refuses on a non-empty board without `confirm: true` (the error reports the counts). Confirm with the user first.

Failsafes: the board must already exist (`add_document` with a `.moodboard.md` title and no content — the tools never create files); `board.locked: true` makes every write return an error (ask the user to unlock; never edit around it); a fence that isn't valid JSON makes every tool except `clear_moodboard` fail with a corruption error and change nothing — fix it in Files mode or `clear_moodboard` with consent. `insert_content` / `replace_content` / `delete_content` reject `.moodboard.md` targets.

## HTML tools

- `get_html_tool_guide()` — the live design/build guide (returns guide text + hard rules). Call before building; deeper background in `references/html-tools.md` and `references/tool-design.md`.
- `add_html_tool(workspace | workspacePath, toolName, files[{filename, content, isEntryPoint?}], description?, glyph?, category?, sheets?, databases?)` — `toolName`/`category` letters/numbers/underscores/hyphens only; needs at least one `.html` file; fails if the tool already exists. `glyph` = tile emoji (>4 codepoints silently trimmed), `description` silently capped at 500 chars — set both. Maintains `tool.meta.json` and the tool registry for you (`registered` flag in the response; `false` is harmless). `sheets: [{ name, columns? }]` (max 20) is where the tool keeps its records: with `columns` a new sheet is created at `documents/Tools/<name>`, owned by the tool; name only connects the one existing sheet with that name or folder name (the user approves access once — no prompt when the sheet is already owned by that tool). Column names must be distinct; the first column is always the title. All specs are validated before anything is written; the response's `sheets` carry each sheet's `path` and column ids. The tool code uses `await hillnote.sheet(name)` and `hillnote.settings` — never `localStorage` (it doesn't persist in the sandbox). `databases: [{ name }]` connects EXISTING databases (exactly one match each; never created) → `await hillnote.database(name)`. Any one sheet/database spec may carry `primary: true` → `await hillnote.data()`; more than one primary fails.
- `attach_tool_sheet(workspace | workspacePath, toolName | toolPath, sheet{name, columns?}, category?)` — the same create/connect rules for an EXISTING tool (e.g. moving it off `localStorage`). Replaces a same-named declaration, keeps every other `tool.meta.json` field, refuses loose tools (a bare `.html` in `resources/html/`) and anything but `resources/html/<tool>` or `resources/html/<category>/<tool>`. If `tool.meta.json` exists but can't be read it fails with "…exists but could not be read… Nothing was written — retry" — retry; never write the file yourself. Additive; returns `{ tool, sheet: { name, path, columns, owned }, hint }`. `sheet.primary: true` makes it the tool's primary source (clearing any other).
- `attach_tool_database(workspace | workspacePath, toolName | toolPath, database{name, primary?}, category?)` — connect an EXISTING database to an existing tool (same meta rules). Returns `{ tool, database: { name, path, columns }, hint }`; row ids in the tool are row filenames.
- `add_tool_view(workspace | workspacePath, toolName | toolPath, database | sheet, viewName?, category?)` — exactly one of `database` / `sheet` (name or folder name, one match). Appends a Custom view (`type: "tool"`) and makes it the open view; returns `{ view: { id, name }, source: { kind, name, path }, toolPath }`. Grants nothing: the user approves the tool's access in the app the first time the view opens.
- **Every HTML write returns `validation.issues[]`** — empty means verified, don't read the file back; non-empty lists what to fix.
- Iterate: `get_html_tool(…, listOnly?)` → `read_html_file(…, filePath, startLine?, endLine?)` (returns `totalLines`) → `replace_in_html_file(…, searchText, replaceText, replaceAll?, occurrenceIndex?)` for targeted edits, `write_html_file` for whole-file rewrites.
- `replace_in_html_file` errors are self-explanatory: not-found includes a file sample; ambiguity names `replaceAll`/`occurrenceIndex` (1-based); reserved targets (`tool_registry.json`, `tool.meta.json`, `tool.settings.json` — in any spelling the filesystem treats as the same file — and the injected `hillnote-baseline` block) are refused, as are path names containing `:` or `~<digit>` or ending in `.` or a space.
- These file tools only accept paths under `resources/html/` — never point them at documents (the error names the right tool).
- Local extras: `add_tool_to_doc` (inserts the tool's embed link into a document at `end`/`beginning`/`after:<text>`), `edit_html_tool` (batch file ops + metadata).

## Recipes

Saved prompt templates (stored in the workspace's `ai_prompt_overrides.json`). `list_recipes` → `get_recipe(recipeId)` → `get_recipe_documents(recipeId, maxLines?)` to pull every referenced document in one call. `create_recipe(recipe{when_user_asks_about, override_instructions, required_documents?, optional_documents?, output_format?})`; `update_recipe(recipeId, updates)` changes only provided fields, ID immutable. Local variants take `workspacePath`.

## Sync (local, app-managed)

`pull_changes` before starting work on a shared workspace, `push_changes` after edits the user wants in the cloud, `list_conflicts` / `resolve_conflict` when pushes report conflicts. Remote MCP needs none of this — its writes land in the cloud workspace directly, and the app picks them up on its next sync.

## Pagination & truncation playbook

Remote responses are size-capped (~100k chars of JSON); an oversized result comes back as a truncation envelope — `{truncated: true, totalChars, hint, preview}` — whose `hint` names the right paging parameter. Never re-issue the same call — switch to the paging parameter for that family:

| Symptom | Use |
|---|---|
| Long document read truncated | `read_document` with `startLine`/`endLine` (loop on `totalLines`) |
| Database rows truncated | `startRow`/`maxRows` (loop on `hasMore`/`totalRows`) |
| Sheet rows truncated | remote `startRow`/`maxRows`; local `limit`/`offset` — plus tighter `filters`/`search` |
| Search results truncated | `offset`/`maxResults` |
| Library section body truncated / `hasMore` | `get_library_section` with `offset = bodyRange.end` (or a smaller `maxChars`); outlines and search page with `offset`/`limit` |
| Recipe documents too large | `get_recipe_documents` with `maxLines`, then targeted `read_document` |
| HTML tool payload too large | `get_html_tool` with `listOnly: true`, then per-file `read_html_file` with line ranges |
| Registry very large | prefer `search_documents` over browsing `read_registry` |

## `hillnote` command → tool map

The designed commands compose the local tools below. Run `hillnote <command> --help` for flags. Two tools are deliberately `raw`-only: `list_workspaces` (`hillnote ws list` reads the workspace list without opening every registry) and `delete_content` (it addresses text by raw character offset; `hillnote doc edit --delete --old "…"` deletes by exact text instead).

| Command | Tool(s) it composes |
|---|---|
| `hillnote status` | `read_registry`, `list_databases`, `list_sheets`, `list_libraries`, `list_recipes` + what the app has open |
| `hillnote ls` · `doc links` · `backlinks` · `orphans` · `unresolved` | `read_registry` |
| `hillnote view` (`--outline`, `--section`, `--lines`) | `read_document` |
| `hillnote search` | `search_documents` |
| `hillnote doc create` | `add_document` |
| `hillnote doc append` · `doc prepend` | `insert_content` (end / start); `append --section`: `read_document` + `replace_content` |
| `hillnote doc edit` | `read_document` + `replace_content` |
| `hillnote doc rename` · `doc delete` | `rename_document` · `delete_document` |
| `hillnote trash list` · `trash restore` | `list_trash` · `restore_from_trash` |
| `hillnote db list` · `db schema` · `db rows` · `db row` | `list_databases` · `read_database` |
| `hillnote db add` · `db edit` · `db delete` | `add_rows` · `read_database` + `update_rows` · `read_database` + `delete_rows` |
| `hillnote db create` · `db drop` | `create_database` · `delete_database` |
| `hillnote db column list\|add\|edit\|delete` | `read_database` · `add_column` · `update_column` · `delete_column` |
| `hillnote db view list\|add` | `list_views` · `create_view` |
| `hillnote sheet list` · `schema` · `rows` · `create` | `list_sheets` · `read_sheet` · `create_sheet` |
| `hillnote sheet add` · `edit` · `delete` | `add_sheet_rows` · `read_sheet` + `update_sheet_rows` · `read_sheet` + `delete_sheet_rows` |
| `hillnote lib list` · `map` · `outline` · `search` · `view` | `list_libraries` · `get_library_map` · `get_library_outline` · `search_library` · `get_library_section` |
| `hillnote playbook list` · `view` · `create` · `edit` | `list_playbooks` · `read_playbook` · `create_playbook` · `update_playbook` |
| `hillnote guide <topic>` | `get_slides_story_guide` · `get_slides_visual_guide` · `get_moodboard_guide` · `get_html_tool_guide` |
| `hillnote board view` · `add` · `draw` · `edit` · `remove` · `clear` · `render` | `read_moodboard` · `add_moodboard_items` · `draw_on_moodboard` · `update_moodboard_items` · `remove_moodboard_items` · `clear_moodboard` · `render_moodboard` |
| `hillnote tool list` · `view` · `create` · `read` · `write` · `edit` · `remove-file` · `embed` · `attach-sheet` · `attach-db` · `add-view` | `list_html_tools` · `get_html_tool` · `add_html_tool` · `read_html_file` · `write_html_file` · `replace_in_html_file` · `edit_html_tool` · `add_tool_to_doc` · `attach_tool_sheet` · `attach_tool_database` · `add_tool_view` |
| `hillnote recipe list` · `view` · `docs` · `create` · `edit` | `list_recipes` · `get_recipe` · `get_recipe_documents` · `create_recipe` · `update_recipe` |
| `hillnote automation show` · `set` · `defaults` · `folder` | `get_board_automation` · `configure_board_automation` |
| `hillnote schedule add` · `list` · `cancel` | `schedule_card_move` · `get_board_automation` · `cancel_scheduled_move` |
| `hillnote open` · `say` · `app state` | `open_document` · `open_workspace` · `scroll_to` · `highlight_text` · `show_slide` · `open_database` · `open_sheet` · `open_library` · `post_activity` · `get_app_state` |
| `hillnote app view` · `app notepad` · `app build` · `preview check` | `open_view` · `notepad` · `build_mode` · `check_preview` |
