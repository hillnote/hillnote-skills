# The `hillnote` command

A shell command that does what the Local MCP server does — validated writes, registry-aware listings, search, database and sheet queries — without loading any tool definitions into your context. It works on workspaces on the user's machine, and its file commands work even when the Hillnote app is closed.

**Use it for every workspace on this computer when you have a shell** (Claude Code, Codex, Cursor's agent, Gemini CLI…) — over Local MCP, and over Cloud MCP even when the workspace is also synced: your edits show in the app at once and its auto-sync takes them to the cloud. One command replaces the `list_workspaces` → `read_registry` → `read_document` sequence, long content goes in from a file instead of an escaped JSON string, and output can be piped or redirected so only what you need reaches your context. It is a command for the **local** app — it never talks to hillnote.com; for workspaces that aren't on this computer, use Cloud MCP.

## Finding it

```bash
command -v hillnote || echo "$HILLNOTE_CLI"
```

- It is on `PATH` in every terminal the Hillnote app opens. `$HILLNOTE_CLI` holds its absolute path there as a fallback.
- Elsewhere the user sets it up once: Hillnote → **Settings → Connections → Local MCP → Configure** next to their agent app (adds this skill too), or **Command line → Install** for just the command. Then a new terminal or agent session.
- Not on PATH? Hillnote's built-in copy works by its full path — macOS `"$HOME/Library/Application Support/Hillnote/bin/hillnote"`, Windows `%APPDATA%\Hillnote\bin\hillnote.cmd`, Linux `~/.config/Hillnote/bin/hillnote` (`references/modes.md` → Setting things up; ask the user before making it permanent). Not there either: Hillnote isn't installed or hasn't been opened yet — fall back to Local MCP or Files mode, same data and formats.

## Learn the flags from the command, not from memory

```bash
hillnote --help                # the whole surface in ~30 lines
hillnote db --help             # one noun
hillnote db rows --help        # one verb: every flag, with examples
```

`--help` is generated from the code that parses the flags, so it is always right. **Run it rather than guessing a flag** — an unknown flag is an error (with a "did you mean"), never silently ignored.

Start every session with `hillnote status`: the workspace, the document the user has open and whether it has unsaved edits, the databases, sheets and libraries here — and whether the user has saved **recipes** (their standing instructions: read them with `hillnote recipe list` before answering a request one covers).

## Which workspace, which document

- **Workspace**: the one containing your current folder. Otherwise `-w <name|path>` (it may come first: `hillnote -w Research ls`). `hillnote ws list` shows them all.
- **Document**: a path (`Projects/Plan`, with or without `documents/` and `.md`), its name, or its file name. Reads also accept a unique fragment of the name. **Writes never guess** — give the exact name or path; an ambiguous reference lists the candidates and changes nothing.
- `@active` is the document open in the app; `@quickview` the one in the QuickView panel.
- Databases and sheets: their path under `documents/`, or their name. **Rows** by their title (`hillnote db edit Tasks "Fix login" status=Done`) — `db add` prints the title each new row got.
- Documents and rows **keep the title you give them**: the title is the file name, and the name Hillnote shows. `doc create` prints the created path — use it from then on.

## Reading cheaply

```bash
hillnote view Roadmap --outline             # headings + line numbers: orient first
hillnote view Roadmap --section "Risks"     # one section (nested subsections included)
hillnote view Roadmap --lines 40-80
hillnote view Roadmap Spec --head 30        # several documents in one call
hillnote db rows Tasks --fields title,due --limit 20
hillnote db rows Tasks --where "status is Done" --count
```

Rows print as tab-separated text with a header (`--no-header` to drop it; `--csv` for a real CSV to save: `hillnote sheet rows Leads --where "country is Germany" --csv > german.csv`); `--json` gives the full structured result of any command, dry runs included.

## Filtering rows: `--where`

`column operator value`, joined with `and`. Columns by id or display name; quote values that contain spaces.

| Operator | Meaning |
|---|---|
| `is` · `is not` | equals (case-insensitive) |
| `contains` · `not contains` | substring (`not contains`: databases only) |
| `gt` · `gte` · `lt` · `lte` | numeric comparison |
| `before` · `after` | date comparison, e.g. `due before 2026-10-01`. `gt` / `gte` / `lt` / `lte` compare dates too when the value is one |
| `is empty` · `is not empty` | blank / filled |

```bash
hillnote db rows Tasks --where 'status is "In Progress" and priority gte 2' --sort due
```

Use the **word** operators: an unquoted `>` or `<` is a shell redirect. There is no `or` — run the query once per alternative. On a multiselect column `tags is beta` means "has the tag beta". When nothing matches, stderr says how each clause was read (`0 of 12 rows match: status is "Done" AND due lt "2026-10-01" (as dates)`) — so an empty result is never a misread filter in disguise. A wrong column or option value is an error that lists the valid ones; read `hillnote db schema <database>` first and you will not hit it.

## Writing

```bash
hillnote doc create "Spec" --folder Projects --file spec.md      # prints the new path — use it from then on
hillnote doc append Journal --text "- shipped"
hillnote doc edit Roadmap --old "ships in Q3" --new "ships in Q4"
hillnote doc edit Roadmap --section "Risks" --file risks.md      # replaces that section's body, keeps its heading
hillnote db add Tasks title="Fix login" status="To Do" priority=2
hillnote db edit Tasks fix-login status=Done
hillnote sheet add Leads --csv leads.csv                          # thousands of rows in one call is fine
```

- **Content** comes from `--file <path>`, `--file -` (stdin, only when you ask for it) or `--text "…"`. Write long markdown to a file first; do not squeeze it into `--text`.
- **`--old` is exact and must match once.** Several matches are refused with their line numbers (add surrounding text, or pass `--all`); no match changes nothing and shows the nearest lines. Line numbers are never used to address an edit, so a concurrent change cannot shift your target.
- **Row fields** are `key=value` using column ids or names. Values are typed by the column (`priority=2` is a number, `tags=a,b` a list) and option values are checked before anything is written. `key:=<json>` passes a typed value as-is.
- **`--dry-run` on any write** shows what would change and writes nothing. Use it before anything you are unsure of.
- **Several rows at once** need `--multiple`; **deletes** need `--yes`. `db` and `sheet` commands never apply to a whole database or sheet.
- **Deleted documents, database rows and databases are recoverable** for 30 days: `hillnote trash list`, then `hillnote trash restore "<name or original path>"` — a document comes back with its emoji, pin, position and links, and nothing is ever overwritten. Do not `mv` files out of `.hillnote/trash/` yourself: the workspace would not know the document again. Sheet rows are lines of one CSV file and are **not** recoverable — dry-run first.
- **Unsaved edits are protected.** If the user is typing in the document you are writing to, the command waits a few seconds for Hillnote to autosave, then refuses (exit 5). Retry shortly or ask them to save; `--force` writes anyway and may leave a conflict copy.
- Canvases and moodboards hold machine-managed JSON: text edits are refused. Use `hillnote board …` for moodboards; canvases are edited only in the app.

## Beyond documents and rows

Every part of a workspace has commands — `hillnote --help` lists them, `hillnote <noun> --help` explains one. The golden rules still apply: guides before creation, confirm destructive operations.

| Noun | What it covers |
|---|---|
| `doc` | also `prepend` (lands after the properties block), `links` / `backlinks` / `orphans` / `unresolved` (from the registry — as fresh as the app's last rebuild) |
| `db` | structure too: `create` (`--column "Status:status=To Do\|Done" --kanban status`), `column list\|add\|edit\|delete`, `view list\|add`, `row <db> <row>` (one row in full), `drop --yes` (recoverable) |
| `sheet` | `create` from `--column` specs or straight from `--csv` |
| `lib` · `playbook` | libraries: `lib map` first, then `lib search "…"` → `lib view <section id>` → cite the `cite:` line it prints. `playbook list` before answering a recurring kind of question; `playbook create` after working one out. Read-only for library content — importing happens in the app |
| `guide <topic>` | `slides-story`, `slides-visual --doc <deck>`, `moodboard`, `html-tool` — **read it before creating that kind of thing**. The guides name MCP tools; each opens with a key that says which command each tool is (`add_moodboard_items → hillnote board add <board> --file …`) |
| `board` | moodboards: `view`, `draw --file diagram.json` (nodes + edges, laid out for you — use it for anything connected; `references/moodboard.md` → Diagrams), `add --file items.json` (`{items, connectors}`; connectors alone link existing items), `edit --file patches.json`, `remove <id…> --yes`, `clear --yes`, `render` (a PNG of the board to check your work; app running). Dropped items say why on stderr |
| `tool` | HTML tools: `create <name> --file index.html` or `--dir <folder>` (records: `--sheets sheets.json`), `list`, `view`, `read`, `write`, `edit --old … --new …`, `embed <tool> <doc>`, `attach-sheet <tool> <sheet> [--column "Amount:number" …]` (with columns: a new sheet in `documents/Tools/`; without: connect an existing one), `attach-db <tool> <database> [--primary]`, `add-view <tool> --database <db>` (or `--sheet`; `--name "Tab"` names the tab, default the tool's name) — shows the tool as a Custom view tab of that data. Names are letters, numbers, `-` and `_`. A write prints `validation: no issues` (or the issues) — when it is clean, do not read the file back. Tools keep records in a sheet (`hillnote.sheet(…)`), never `localStorage` |
| `recipe` | the user's saved instructions: `list` and `view` before answering; `docs <id>` prints the documents a recipe tells you to read |
| `open` · `say` | show things in the running app — a document (`--heading`, `--text`, `--quickview`), `--slide N`, a database or sheet (`--view kanban --where … --row …`), a library section; `say "…"` posts a status line. **Only when the user asked to be shown something.** Needs the app running; the first call raises an approval dialog there — if the command reports it got no answer in time, ask the user to approve it and retry |
| `app` · `preview` | the running app beyond `open`: `app state` (what's on screen, unsaved edits), `app view chat\|terminal\|files\|browser\|workspace`, `app notepad read\|append\|replace\|clear` (the Notepad, for anything throwaway the user asks for — `append` is the normal write), `app build enter\|exit\|project\|open <file>\|send "<instruction>"` (Build mode; `send` only types — the user presses Enter), `preview check [url\|/path]` (load the Builds app like a visitor: console errors, failed requests, screenshot). Needs the app running |
| `trash` | `list`, `restore <name\|path>` — the other half of every recoverable delete |
| `automation` · `schedule` | kanban automation (`references/automation.md`): `automation show <board>`, `automation set <board> "<status>" --agent claude --when-done "<status>"` / `--auto-move "<status>" --after 1d`, `automation defaults`, `automation folder <board> <path>`; `schedule add <board> "<row>" --to "<status>" --at "YYYY-MM-DD HH:MM"` (`--in 2h`, `--now`), `schedule list`, `schedule cancel <id>`. **To hand a card on, `schedule add … --now` — `db edit status=…` starts no agent** |
| `doctor` | why is something not working: the command, the workspace, the link to the app, whether this agent is approved |

Moodboard items and patches are JSON files — write them with your file tool, then pass `--file`. Removing board items, tool files or a database column is **not** recoverable: `--dry-run` first.

## The escape hatch: `hillnote raw`

Any local tool by its MCP name, with the workspace filled in — for the rare case no designed command fits:

```bash
hillnote raw --list                     # every tool beside the command that does its job
hillnote raw update_column --schema
hillnote raw update_column --args '{"databasePath":"Tasks","columnId":"status","updates":{"optionColors":{"Done":"green"}}}'
hillnote raw --batch calls.jsonl        # many calls in one process: {"tool": "…", "args": {…}} per line → one JSON result per line
```

Tool names and arguments are exactly those in `tool-reference.md` (Local column).

## Output and exit codes

stdout is the result and nothing else; stderr carries errors, notes and paging hints — so `hillnote … > out.md` and `hillnote … | head` are safe. Errors say what is valid and what to run instead.

| Exit | Meaning |
|---|---|
| 0 | done |
| 1 | the operation ran and failed |
| 2 | the command line is wrong (unknown flag, column, operator…) |
| 3 | a document / database / sheet / row reference matched nothing, or several things |
| 4 | needs the running Hillnote app and it is not reachable, or it did not answer in time (only the commands that use it — `open`, `say`, `app …`, `preview check`, `board render` — and cloud libraries) |
| 5 | refused by a guard: unsaved edits, missing `--yes` / `--multiple`, several `--old` matches |

Text output is capped at 24 000 characters with a hint for the next slice (`--lines`, `--offset`); `--max-chars 0` lifts the cap.

## The user does not see my work in the app

Writes show up in the app's activity indicator, open-document follow mode and sidebar only after the user has approved this agent once. `hillnote status` and `hillnote doctor` say whether that is the case; if not, one app call (`hillnote open <doc>`) raises the approval dialog in Hillnote. The files are written either way.
