# Databases

A Hillnote database is a **folder inside `documents/`** holding a `database.json` config plus one markdown file per row. It powers table, kanban, gallery, calendar, chart, gantt, dashboard, map and Custom (HTML tool) views in the app. Use a database whenever the user wants a tracker, board, CRM, content calendar, or anything with rows and columns — not a markdown table.

## Mode notes — read this first

- **Both MCP servers (and the `hillnote` command):** the same write tools with the same failsafes — create with `create_database`, rows with `add_rows` / `update_rows` / `delete_rows`, shape with `add_column` / `update_column` / `delete_column` / `create_view`. Reads differ: remote `find_databases` → `get_database_config` → `get_database_rows` / `query_database_rows` (a row's id is its `filePath`); local `list_databases` → `read_database`.
- **Remote differences:** deleted rows and databases are **permanent** — local ones go to the workspace trash (a deleted column's values are gone on both); each call is one all-or-nothing commit; `add_rows` takes up to 500 rows per call, and a `where` or a column change covers up to 1,000 rows (beyond that, pass `ids` or use the app). Remote also has `save_database_config` for whole-config edits.
- **Files:** write the folder, `database.json`, and row files directly.
- `save_database_config` (remote) **overwrites** the keys it manages (`name`, `columns`, `views`, `defaultView`, `description`, `emoji`, `agents`) — one you leave out is removed (send `agents` back unchanged too); other top-level keys in the file are kept. So always `get_database_config` first, modify the returned object, send the whole thing back. Dropping a column from the config hides that frontmatter field; renaming a column **id** there orphans existing row values — use `update_column` for that (it renames the id in every row — on remote, in the views too). Pass the board's `agents` object and the status column's `optionAgents` / `optionAutoMoves` back unchanged — kanban automation can't be set up remotely (`references/automation.md`).

## database.json

```json
{
  "name": "Content Tracker",
  "columns": [
    { "id": "title", "name": "Title", "type": "title" },
    { "id": "status", "name": "Status", "type": "status",
      "options": ["Idea", "Drafting", "Review", "Published", "Archived"],
      "optionColors": { "Idea": "gray", "Drafting": "blue", "Review": "amber",
                        "Published": "emerald", "Archived": "gray" },
      "optionStates": { "Published": "done", "Archived": "archive" } },
    { "id": "channel", "name": "Channel", "type": "select",
      "options": ["Blog", "Video", "Newsletter"] },
    { "id": "due", "name": "Due", "type": "date" },
    { "id": "owner", "name": "Owner", "type": "email" },
    { "id": "notes", "name": "Notes", "type": "text" }
  ],
  "views": [
    { "id": "board", "name": "Board", "type": "kanban", "groupBy": "status", "filters": [], "sorts": [] },
    { "id": "all", "name": "All", "type": "table", "filters": [], "sorts": [] },
    { "id": "cal", "name": "Calendar", "type": "calendar", "dateColumn": "due", "colorByColumn": "status" }
  ],
  "defaultView": "board"
}
```

**Kanban automation:** a `status` column may also carry `optionAgents` (an agent CLI started when a card lands in that status) and `optionAutoMoves` (cards move on by themselves), and the config a top-level `agents` key (board defaults for its agents) — set them with `configure_board_automation` / `hillnote automation` (local only), never by hand (`references/automation.md`). They run in the desktop app, and only for moves it makes: changing a status with `update_rows` starts nothing — `schedule_card_move` does.

## Column types (12)

| Type | Value in row frontmatter | Notes |
|---|---|---|
| `title` | — (comes from filename) | Every database has one |
| `text` | string | Free text; first text column doubles as card description |
| `number` | number | |
| `select` | one option string | Define `options` (+ optional `optionColors`) |
| `multiselect` | array of option strings | Kanban shows the row in every matching column |
| `status` | one option string | `select` + `optionStates`: `normal` / `done` (strikethrough) / `archive` (dimmed, stacked in kanban) |
| `checkbox` | `true` / `false` | |
| `date` | `YYYY-MM-DD` | Powers calendar/gantt views and due-date badges. Optional `dateRole` on the column (`"start"` / `"end"`, at most one of each per database) marks the pair the gantt draws bars from |
| `url` | string | |
| `email` | string | Rendered as a person badge (name part shown) |
| `recurring` | object (`frequency`: daily/weekly/monthly/yearly, `interval`, `byDays`, monthly `nthWeek`/`nthWeekday`) | Repeating tasks that auto-reset. Settable via `add_rows`/`update_rows` (either server); the app runs the resets. In Files mode don't hand-author — let the app or local MCP set it |
| `location` | string | A city/address name, `"lat, lng"` coordinates, or a Google Maps link. Plotted by map views (names are geocoded; city-scale places draw as boundary areas, everything else as pins) |
| `image` | string | A workspace-relative `resources/images/<folder>/<file>` path, or an `https://` URL. Always store the relative form — an absolute path is machine-specific and breaks on other devices. Gallery and board views can show it as a square cover at the top of each card (the view's `cardImageColumn` picks which image column; rows without one just render as normal cards) |

`optionColors` values: `gray, red, amber, emerald, blue, purple, pink, cyan, orange`.

## Views (9)

| Type | Required config | Good for |
|---|---|---|
| `table` | — | Everything, default |
| `kanban` | `groupBy` = a select/multiselect/status column id; optional `rowGroupBy` for swimlanes | Workflows, pipelines |
| `gallery` | — | Visual collections |
| `calendar` | `dateColumn` = a date column id; optional `colorByColumn` | Schedules, editorial calendars |
| `chart` | `chartType` (`bar`/`line`/`pie`/`area`), `labelColumn`, `valueColumn`, `aggregation` | Summaries |
| `gantt` | date columns with `dateRole: "start"` and `dateRole: "end"` (set on the columns, not the view); optional `colorByColumn`, `ganttZoom` (`day`/`week`/`month`), `ganttGroupBy` (swimlanes), `ganttShowProgress`, `ganttShowDependencies` | Timelines, project plans |
| `dashboard` | `widgets` array — each `{ id, kind: chart\|stat\|recent-docs\|upcoming, title, size: single\|double\|full, height: 1-3, filters, config }` | At-a-glance overviews |
| `map` | optional `mapLocationColumn` (defaults to the first location/text/url column), `mapStyle` (`colorful` default /`minimal`/`detailed`/`nolabels`), `colorByColumn` | Places, trips, itineraries |
| `tool` | `toolPath` = an HTML tool's entry file (`resources/html/<tool>/index.html`) — MCP: add it with `add_tool_view`; Files mode: append the view object from `references/html-tools.md` → Custom views | Anything bespoke: card layouts, HTML charts, games, boards — see `references/html-tools.md` → Custom views |

All views accept `filters` and `sorts`. A kanban over a `status` column with sensible `optionStates` is the strongest default for task tracking: done items strike through, archived items collapse into a stack.

## Row files

One `.md` per row inside the database folder:

```markdown
---
status: Drafting
channel: Blog
due: 2026-08-01
owner: sam@example.com
notes: Outline approved
_emoji: ✍️
---

# How we ship features

Body markdown — checklists here (`- [ ]`) surface as progress bars on kanban cards.
```

- **Filename (minus `.md`) = row title.** Don't duplicate the title in frontmatter; renaming the file retitles the row.
- Frontmatter keys = column **ids** (not display names).
- `_emoji` is a special key for the row's emoji. `_dependsOn` (array of predecessor row ids) draws dependency arrows in the gantt view — usually drawn in-app; ids break if a predecessor row is renamed.
- The body is a full document: notes, checklists, comments — the row's detail page.

## Recipes by mode

**Create a tracker** — Local or remote: `create_database` with columns + a kanban view as above. Files: make the folder, write `database.json`, add row files.

**Bulk-add rows** — Local or remote: `add_rows(workspace, databasePath, rows)` where each row is `{ title, <columnId>: value, …, _content?: "body markdown" }` (remote: up to 500 per call). Files: write one `.md` per row.

**Update rows** — Local or remote: `update_rows` by row `ids` (their `filePath`s from `read_database`, or from `get_database_rows` / `query_database_rows` on remote) or a `where` object, with the field updates keyed by **column ID**. A `where` matching more than one row is blocked unless `allowMultiple: true` — use `ids` to move one card. Select/status values must match the column's options exactly (the error lists them). Files: edit frontmatter in the row files. Either way a status change starts no agent or auto-move — on an automated board, hand the card on with `schedule_card_move` instead.

**Query/report** — Remote: `get_database_config` for column ids → `query_database_rows` with ANDed filters (`equals | not_equals | contains | gt | lt | gte | lte`) and a `sort`; paginate on `hasMore`, and treat `partialScan: true` as "narrow the filter". Local: `read_database` with filter/sort/search — its operators spell differently: `equals | notEquals | contains | notContains | greaterThan | lessThan | isEmpty | isNotEmpty`.

**Add a view or column** — Local or remote: `create_view` / `add_column` (`update_column` / `delete_column` to change or remove one). Remote alternative for several changes at once: `get_database_config` → edit `views`/`columns` → `save_database_config` (full object, `agents` included).

## Legacy tasklists

Older workspaces may contain task-board folders with a `tasklist.json`. These are **legacy** — the app migrates them to databases on open. Never create a `tasklist.json`; if you meet one, suggest opening it in the app to migrate, then work with the resulting database.
