---
name: hillnote
description: Work with Hillnote, the markdown-native workspace app, via its MCP tools, its `hillnote` shell command, or workspace folders. Use when the user mentions Hillnote, a Hillnote workspace, hillnote.com/mcp, the hillnote-mcp server, the hillnote command, ToolForge, or documents-registry.json; when they ask to create or edit notes, slide decks (.slides.md), moodboards / pinboards / inspiration boards (.moodboard.md), databases, kanban boards and their automation (agent CLIs, auto-moves, scheduled moves), sheets (large CSV datasets), libraries (books, manuals or statutes split into citeable sections), or HTML tools; when building a Hillnote sidebar plugin (plugins/ folder, manifest.json, window.hillnote SDK, hillnote-plugin://); or when troubleshooting Hillnote sync, publishing, or MCP connections. A connected workspace is also the user's knowledge base — search it when they ask about their own projects, plans, decisions, or anything they wrote down.
---

# Hillnote

Hillnote is a workspace app where everything — documents, slide decks, canvases, moodboards, database rows — is a plain markdown file in a regular folder (large datasets are **sheets**: one CSV per dataset instead of per-row files). Two routes cover almost everything, chosen by where the workspace is:

- **On this computer → the `hillnote` command.** Every local operation, the Hillnote app's own interface included, from a shell, with no tool definitions in your context.
- **Anywhere else → Cloud MCP** (the remote MCP server at hillnote.com/mcp): the workspaces the user has synced, from any device — web and phone chat apps included — without the Hillnote app.

**Local MCP** (the same operations as the command, for apps that can't run commands) and **direct file access** to the workspace folder fill the gaps. Capabilities differ by route; the file formats never do.

## Pick your route

Check what you have before planning, and take the first that fits:

1. **The `hillnote` command** — you have a shell and `hillnote --version` succeeds (or `$HILLNOTE_CLI` is set, or Hillnote's built-in copy exists — paths in `references/modes.md` → Setting things up). Use it for every workspace on this computer, **even one that is also synced**: your edits show in the app at once, showing the user something works straight after, and the app's auto-sync carries the changes to the cloud. (The same edit through Cloud MCP reaches the app only on its next sync, so what you show is stale and can clash with what the user has open.) It does everything Local MCP does — documents, databases, sheets, libraries and playbooks, moodboards, HTML tools, recipes, kanban automation, trash, the authoring guides (`hillnote guide <topic>`) and the App interface (`hillnote open`, `hillnote say`, `hillnote app …`, `hillnote preview check`) — with `hillnote raw <tool>` as the escape hatch. Start with `hillnote status`; run `hillnote <command> --help` instead of guessing flags (`references/cli.md`).
2. **Remote MCP** (Cloud MCP) — you see `move_document`, `find_databases`, `query_database_rows`, `save_database_config`, `list_collaborators`. You're talking to hillnote.com, where only workspaces the user has synced from the app exist. Use it for workspaces that aren't on this computer, and whenever you have no shell. It can't drive the Hillnote app, but `show_document`, `show_table` and `show_moodboard` put a document, deck, sheet, database or board in front of the user right in the conversation (in clients that display MCP Apps views).
3. **Local MCP** — you see `read_database`, `read_sheet`, `add_tool_to_doc`. The Hillnote install on the user's machine, for clients without a shell (desktop chat apps): the same operations as the command, as tools. Its **App interface tools** drive the running app's window so the user can watch you work: `get_app_state`, `open_document`, `scroll_to`, `highlight_text`, `show_slide`, `open_database`, `open_sheet`, `open_library`, `open_workspace`, `open_view` (Chat, Terminal, Files or the Browser), `notepad`, `build_mode`, `check_preview`, `post_activity` — plus `render_moodboard`, which returns a picture of a board. They need the app open and, on first use, the user's approval. When the app runs the server itself, sync tools appear too (`pull_changes`, `push_changes`, `list_conflicts`, `resolve_conflict`).
4. **Files** — you have file access to a folder containing `documents-registry.json`, `documents/`, and `resources/`. That folder is a Hillnote workspace; work on it directly — for bulk or structural work it is often the most native interface, alongside the command (see `references/modes.md`).
5. **None of the above** — the user mentions Hillnote but nothing is connected. Help them connect. You may set it up yourself — use Hillnote's built-in `hillnote`, add Cloud MCP with your app's own command — but **always ask the user first** (`references/modes.md` → Setting things up). Or send them to Hillnote's **Settings → Connections**, **Configure** next to their agent app: the **Local MCP** card for this computer (adds this skill and the `hillnote` command), the **Cloud MCP** card for Hillnote Cloud.

## Capability gaps that change your plan

The `hillnote` command can do everything in the Local column.

| Task | Remote MCP | Local MCP · `hillnote` | Files |
|---|---|---|---|
| Create a database / edit rows & columns | ✓ database tools (deletes permanent) | ✓ full tools | ✓ write the files |
| Create / edit a canvas (`.canvas.md`) | ✗ app only | ✗ app only | ✗ app only — read it, never write it |
| Create / edit a moodboard (`.moodboard.md`) | ✓ moodboard tools | ✓ moodboard tools | ✓ with care — edit the fence per `references/moodboard.md` |
| Draw a diagram (nodes + edges, laid out for you) | ✓ `draw_on_moodboard` | ✓ `draw_on_moodboard` · `board draw` | ✗ use a ```mermaid fence |
| See a board as a picture | ✗ (`show_moodboard` shows it to the user) | ✓ `render_moodboard` · `board render` — app running | ✗ |
| Create a sidebar plugin | ✗ generate files for the user | ✗ generate files for the user | ✓ write `plugins/<id>/` |
| Publish a workspace as a website | ✗ app only | ✗ app only | ✗ app only |
| Add images / media files | ✗ app or Files mode | ✗ app or Files mode | ✓ copy into `resources/` |
| Guide tools (slides, moodboard, HTML tools) | ✓ | ✓ | ✗ use condensed guides in references |
| Show the user things in the app (open docs, scroll/highlight, jump slides, database views, library pages) | ✗ — `show_document` / `show_table` / `show_moodboard` show them in the conversation | ✓ app running + consent (`hillnote open`) | ✗ |
| Drive the app — Chat / Terminal / Files / Browser views, Notepad, Build mode, check a Builds preview | ✗ | ✓ app running (`hillnote app view\|notepad\|build`, `hillnote preview check`) | ✗ |
| Recover a deleted document, row or database | ✗ deletes are permanent | ✓ `list_trash` / `restore_from_trash` (30 days) | ✗ use `hillnote trash restore` (a file moved out by hand loses its emoji, pin and links) |
| Search inside a library (imported book / long document) | ✓ keyword (`search_library`) | ✓ keyword (`search_library`) | ✓ `rg` the volume's `sections/` |
| Import a document into a library / reindex / share it | ✗ app only | ✗ app only | ✗ app only (never create section files by hand) |
| Kanban automation — agents per status, auto-moves, scheduled card moves | ✗ desktop only | ✓ `*_board_automation`, `schedule_card_move` | ✗ use `hillnote automation` / `hillnote schedule` |

When a task needs a capability your mode lacks, say so plainly and offer the alternative ("I can prepare the files — save them into your workspace" or "this one needs the Hillnote app").

## Golden rules

1. **Orient before acting**: `list_workspaces` → `read_registry` (structure) or `search_documents` (content) — with the command, `hillnote status`. Never guess workspace or document IDs.
2. **The workspace is the user's memory.** When they ask about their own projects, plans, decisions, or people — or anything they plausibly wrote down — `search_documents` and read the top hits before answering from general knowledge. Cite which note the answer came from.
3. **Guides before creation**: call `get_slides_story_guide` before writing any slides, `get_moodboard_guide` before touching any moodboard, `get_html_tool_guide` before building any HTML tool. They are served by the server and always current (the remote slides guides are short summaries — `references/slides.md` has the full grammar; the moodboard guide may also come back condensed — `references/moodboard.md` fills the gaps).
4. **Story first, visuals second** for decks: write the full narrative, then call `get_slides_visual_guide` and do a separate visual pass.
5. **Never write a `.canvas.md`.** Canvases are edited only in the Hillnote app: no tool or command edits them, and text edits corrupt them. For a diagram you make yourself, use a ```mermaid fence in a document, or a moodboard (`references/canvas.md`).
6. **Never write a `.moodboard.md` through text tools** — `replace_content` / `insert_content` / `delete_content` are blocked on it and `read_document` shows raw JSON (local) or a summary without item ids (remote). `get_moodboard_guide` first, then `add_moodboard_items` / `update_moodboard_items` / `remove_moodboard_items`, with `read_moodboard` before touching existing items. Files mode may edit the fence only per `references/moodboard.md`. Locked board → ask the user to unlock; the tools never carry frame contents — move or remove a frame's items along with it; corrupt board → `clear_moodboard` (`confirm: true`) and rebuild.
7. **Read before you edit.** `replace_content` and `replace_in_html_file` need the exact existing text, whitespace included — copy it from a fresh read. (Exception: HTML files you wrote this session — your last write is fresh; a clean `validation` needs no read-back.)
8. **Respect the user's saved setup.** Check `list_recipes` (or `ai_prompt_overrides.json` in Files mode) — it holds saved prompts and persona instructions to follow.
9. **Truncated or capped response → paginate** (`startLine`/`endLine`, `startRow`/`maxRows`, `offset`, `maxLines`, `listOnly`). Never retry the same oversized call.
10. **Confirm destructive operations** — `delete_document`, `delete_database`, `delete_rows`, `delete_column`, `delete_sheet_rows`, `clear_moodboard`, and `save_database_config` (a full overwrite: always read the current config, modify it, then save). Read current state before any of them. Remote deletes are permanent; local ones go to the workspace trash. Enforced by the servers: `delete_database`, `delete_column`, `clear_moodboard`, and `delete_sheet_rows` are blocked without `confirm: true`, and multi-row `update_rows`/`delete_rows` need `allowMultiple: true` — ask the user before passing either.
11. **Never create `tasklist.json`** — tasklists are legacy and auto-migrate. Model tasks as a database with a `status` column.
12. **Write the dialect Hillnote renders.** No LaTeX/math, no callout blocks; use the supported syntax in `references/documents.md`.
13. **Library questions: `search_library` → `get_library_section`; never `read_document` a whole book.** A library (📚) is an imported book, manual, statute or long report split into citeable sections. `list_libraries` first when the user names one, then search, then read only the sections that matter, and cite with `citation.markdown`. Edit a section with `replace_content` on `section.file`, keeping its frontmatter (`references/library.md`).
14. **Hand a kanban card on by scheduling the move, never by editing its status.** Only moves Hillnote makes start a status's agent or auto-move: `schedule_card_move` (`at: "now"` is fine) or `hillnote schedule add … --now` — `update_rows` / `update_sheet_rows` / `db edit` start nothing (`references/automation.md`).

## Task routing

| When the task involves… | Read |
|---|---|
| Setup, mode choice, workspace folder layout, sync | `references/modes.md` |
| Tool availability, parameters, pagination | `references/tool-reference.md` |
| The `hillnote` shell command — references, `--where` filters, write guards, exit codes | `references/cli.md` |
| Writing/editing documents, markdown dialect, organization | `references/documents.md` |
| Slide decks (`.slides.md`) | `references/slides.md` |
| Canvases (`.canvas.md`, app only) and diagrams | `references/canvas.md` |
| Moodboards / pinboards / inspiration boards (`.moodboard.md`) | `references/moodboard.md` |
| Databases, trackers, kanban, calendar views | `references/databases.md` |
| Kanban automation — an agent per status, auto-moves, scheduled card moves, project folder | `references/automation.md` |
| Sheets — large CSV datasets, imported data, bulk rows | `references/sheets.md` |
| Libraries — imported books, manuals, statutes, long reports; sections, page citations | `references/library.md` |
| HTML tools — creating, editing, embedding, ToolForge | `references/html-tools.md` |
| HTML tool design — baseline tokens, classes, component recipes, quality bar | `references/tool-design.md` |
| Sidebar plugins (`plugins/<id>/`, `window.hillnote`) | `references/plugins.md` |
| Errors, conflicts, publishing, connection problems | `references/troubleshooting.md` |

## Quick crib (no reference read needed)

- **With the `hillnote` command**: `hillnote status` → `hillnote view <doc> --outline` / `--section "Heading"` → `hillnote doc edit <doc> --old "exact" --new "text"` (add `--dry-run` first when unsure). Rows: `hillnote db schema <db>` → `hillnote db rows <db> --where 'status is "To Do"'` → `hillnote db add <db> title="…" status="…"`. Guides: `hillnote guide slides-story|moodboard|html-tool`. Libraries: `hillnote playbook list` → `hillnote lib map` → `hillnote lib search "…"` → `hillnote lib view <section id>`. Each recipe below has a command (`hillnote --help`); any tool name also works as `hillnote raw <tool>`.
- **New note**: `add_document` with `workspace`, `title`, markdown `content` (optional `folder`, `tags`, `emoji`).
- **New deck**: `get_slides_story_guide` → `add_document` titled `Name.slides.md` with the story → visual pass per `get_slides_visual_guide` (+ `references/slides.md` for the full marker grammar). Whole-deck look = frontmatter `theme:` (`light`/`dark`/`mono`/`sand`/`ink`), only when asked; `paginate: true` / `footer:` for numbers and a footer line.
- **A diagram**: `draw_on_moodboard` on a moodboard — give nodes and edges, Hillnote lays them out and routes the arrows — or a ```mermaid fence in a document. Never create or edit a canvas: they're drawn in the app.
- **New moodboard**: `get_moodboard_guide` → `add_document` titled `Name.moodboard.md` with **no content** → `draw_on_moodboard` for anything connected, `add_moodboard_items` for loose items (titled frames, `#<index>` or `ref` connector aliases) → check `issues` in the result; `read_moodboard` (local: `render_moodboard` to see it) to verify.
- **New HTML tool**: `get_html_tool_guide` → ONE `add_html_tool` call with the complete tool (set `description` + `glyph` emoji) → empty `validation.issues` means done, don't read back → embed via the returned link.
- **Task an agent starts on later (local)**: `configure_board_automation` (once: give a status an agent) → `add_rows` → `schedule_card_move { row, to: "<that status>", at: "YYYY-MM-DD HH:MM" }`. CLI: `hillnote automation set` → `db add` → `hillnote schedule add … --at …`.
- **Show a database/sheet differently** (cards, an HTML chart, a game board): build the tool with `databases`/`sheets` `[{ name, primary: true }]` reading `hillnote.data()`, then `add_tool_view` — it becomes a Custom view tab of that data.
- **Question about the user's own stuff**: `search_documents(query)` → `read_document` the top hits → answer citing the notes (say if nothing relevant was found).
- **Find and fix text**: `search_documents` → `read_document` → `replace_content` with exact `searchText`.
- **New tracker / kanban board** (either server): `create_database` with a `status` column (`optionStates` for done/archive) and a `kanban` view grouped by it → `add_rows` keyed by column id → move one card with `update_rows` by `ids`.
- **Quick data question about a database**: `find_databases` → `get_database_config` → `query_database_rows` (remote) or `read_database` (local).
- **Quick data question about a sheet**: `find_sheets` → `query_sheet_rows` (remote) or `list_sheets` → `read_sheet` (local) — always filter + paginate; sheets can be tens of thousands of rows. Editing `data.csv` directly? Preserve the trailing `_hnid` id column (see `references/sheets.md`).
- **Question about an imported book / long document (a library)**: `list_libraries` → `list_playbooks` (a matching playbook? `read_playbook` and follow it) → `get_library_map(library)` → `search_library(query, library?)` → `get_library_section(section = hit.section.id)` for the top hits → answer citing `citation.markdown` (pages included). A search miss is not proof the library lacks it — check the map. Never `read_document` a whole volume. After working out a repeatable approach, save it with `create_playbook` (`references/library.md`).
- **Show your work in the app (local)**: `post_activity` your step → write → `open_document` / `scroll_to` / `show_slide` / `open_database` / `open_sheet` / `open_library` to put the result on screen. Check `get_app_state` first when editing — `isDirty: true` means the user has unsaved edits in that document. CLI: `hillnote say` → write → `hillnote open <doc> --heading "…"`.
- **Something throwaway** ("jot this down", a list for now): `notepad` with `action: "append"` (`hillnote app notepad append --text "…"`), not a new document. What should last belongs in a document.
- **Show the user (remote)**: after a read or write they want to see, `show_document` (a document or deck), `show_table` (a sheet or database) or `show_moodboard`.
