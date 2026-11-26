# Sheets

A Hillnote sheet is a **folder inside `documents/`** holding a `sheet.json` config plus a single `data.csv` with every row. Unlike a database there are **no per-row documents** — rows are pure data — which is what lets a sheet stay fast at tens of thousands of rows (imported customer lists, transaction exports, survey results). Sheets power the same table, kanban, gallery, calendar, chart, gantt, dashboard, map and Custom (HTML tool) views in the app, always over the full dataset.

**Sheet or database?** Use a **sheet** for large or imported tabular data where rows are just values. Use a **database** when each row needs its own page — notes, checklists, a body document. If the user drops a CSV into Hillnote, it becomes a sheet automatically.

## Mode notes — read this first

- **Remote MCP:** full row CRUD. `find_sheets` → `get_sheet` → `query_sheet_rows` to read; `add_sheet_rows` / `update_sheet_rows` / `delete_sheet_rows` / `create_sheet` to write. Writes are refused over 10MB of CSV and reads over 25MB — at that size, tell the user to work in the Hillnote app.
- **Local MCP:** full row CRUD with the local names: `list_sheets`, `read_sheet` (config + rows in one call), plus the same four write tools.
- **Files:** read and edit `data.csv` directly — but follow the **`_hnid` contract** below. Editing the CSV is a first-class path: Hillnote merges your changes instead of overwriting.
- Sheets can be huge. **Never read everything** — filter/search and paginate (default 50 rows per page, max 200).

## The `_hnid` id contract (critical in Files mode)

The **last CSV column, `_hnid`**, holds each row's stable id (`r_` + a UUID). It is how Hillnote matches rows when merging changes from tools, other machines, or your edits.

- **Keep the column**, and keep each existing row's id unchanged.
- **Leave the `_hnid` cell empty on rows you add** — ids are assigned automatically.
- **Never duplicate an id** (a copy-pasted row keeps its id only on the first occurrence).
- Deleting the whole column makes the next sync fall back to a full re-import: data survives, but row ids regenerate and row emojis reset.

Edits merge, not overwrite: Hillnote 3-way merges `data.csv` row-by-row (within seconds if the sheet is open, otherwise on its next open). Cells changed only in the app keep their values; a cell changed in **both** places resolves to the file's version, with the app-side value kept in a review panel for the user.

## sheet.json

```json
{
  "name": "Customers",
  "columns": [
    { "id": "title", "name": "Customer", "type": "title" },
    { "id": "email", "name": "Email", "type": "email" },
    { "id": "mrr", "name": "MRR", "type": "number" },
    { "id": "plan", "name": "Plan", "type": "select", "options": ["Free", "Pro"],
      "optionColors": { "Free": "gray", "Pro": "emerald" } },
    { "id": "docs", "name": "Docs", "type": "doclink" }
  ],
  "views": [
    { "id": "default", "name": "Table", "type": "table", "filters": [], "sorts": [] }
  ],
  "defaultView": "default"
}
```

- The **first column is always the title column** (`type: "title"`).
- Views use the same shapes as databases (see `references/databases.md`) and always run over the full dataset.
- The CSV **header row = column display names**; a renamed header renames the column, a new header adds one.
- A sheet created for an HTML tool also carries `"owner": { "tool": "resources/html/<tool>" }` — leave it in place; it lets that tool use the sheet without an access prompt.

## Column types

| Type | Value you write (tools) / CSV cell | Notes |
|---|---|---|
| `title` | string | First column, always |
| `text` / `url` / `email` / `location` / `image` | string | `location`: place name or `lat, lng` |
| `number` | a number (`"1,234"` is accepted) | |
| `checkbox` | `true` / `false` | `yes`/`no`/`1`/`0` accepted |
| `date` / `datetime` | `"YYYY-MM-DD"` / ISO 8601 | ISO only — regional formats degrade filtering |
| `select` / `status` | one option string | `options` get `optionColors` automatically; status options named Done/Complete start "done" |
| `multiselect` | array of strings (CSV: joined with `; `) | A `"a, b"` string is split |
| `doclink` | `[[Title|doc:documents/Path.md]]`, comma-separated | Sheet-only; links rows to documents |

`create_sheet` / `add_html_tool` accept loose type names too (`boolean` → checkbox, `tags` → multiselect, `dropdown` → select, `integer` → number …) and store the canonical type. Rows written with `add_sheet_rows` / `update_sheet_rows` / `hillnote.sheet()` are coerced to the column's type, and a select/multiselect/status value that isn't an option yet is added to the column's options (with a colour).

Kanban automation (an agent per status, auto-moves, scheduled moves; settings in `sheet.json` as on databases) works on sheets too — local only, same tools with `sheetPath`, rows named by `_hnid`. Changing a status with `update_sheet_rows` (either server) or in `data.csv` starts nothing; `schedule_card_move` hands the card on: `references/automation.md`.

## Recipes by mode

**Query/report** — Remote: `find_sheets(workspace)` → `get_sheet(workspace, sheetPath)` for column ids → `query_sheet_rows(workspace, sheetPath, search?, filters?, sort?, startRow?, maxRows?)`. Local: `list_sheets` → `read_sheet(workspace, sheetPath, search?, filters?, sort?, limit?, offset?)`. Filter operators (both servers): `equals | notEquals | contains | greaterThan | greaterThanOrEqual | lessThan | lessThanOrEqual | isEmpty | isNotEmpty`. Filters are ANDed; page on `hasMore`/`totalRows`. Files: parse `data.csv` yourself.

**Bulk-add rows** — `add_sheet_rows(workspace, sheetPath, rows)` where each row is an object keyed by **column id** (e.g. `{ "title": "Acme", "mrr": 99 }`); returned `ids` are the new rows' ids. Files: append CSV lines with an empty `_hnid` cell.

**Update rows** — `update_sheet_rows(workspace, sheetPath, updates, options)` with `updates` keyed by column id and `options.ids` (row ids from a query — preferred) or `options.where: { column, value }` (case-insensitive equality, updates **every** match). Files: edit the cells, keep `_hnid`.

**Delete rows** — `delete_sheet_rows(workspace, sheetPath, ids, confirm: true)` — blocked without `confirm`; ask the user first. Files: remove the CSV lines.

**Create a sheet** — `create_sheet(workspace, name, columns, rows?, folderPath?)` with columns like `[{ "name": "Customer" }, { "name": "MRR", "type": "number" }]` — the first entry becomes the title column; seed `rows` may be keyed by column id or name. Fails if the folder already exists. Files: create the folder, write `sheet.json` and a `data.csv` whose header row is the column names (add an empty `_hnid` header as the last column; ids fill in on first sync). **For an HTML tool's records, don't call `create_sheet`** — declare the sheet on the tool (next recipe).

**Give an HTML tool a sheet** — tools can't persist in `localStorage` (the sandbox resets it); their records live in a sheet the tool declares. New tool: `add_html_tool(…, sheets: [{ name, columns? }])`; existing tool: `attach_tool_sheet(toolName | toolPath, sheet: { name, columns? })`. With `columns`, a new sheet is created at `documents/Tools/<name>` and owned by the tool; with just a name, an existing sheet (matched on its name or folder name) is connected and the user approves access once (no prompt when the sheet is already owned by that tool). The tool code then uses `await hillnote.sheet('<name>')` → `rows()` / `add()` / `update()` / `remove()` / `onChange()`, keyed by column id (small state goes in `hillnote.settings.get/set`). Rows the tool writes are ordinary sheet rows — query and edit them with the tools above. To show a tool *inside* the sheet as a view tab, use `add_tool_view` (Custom views in `references/html-tools.md`).

**Turn a user's CSV into a sheet** — small: `create_sheet` with inferred columns + the rows. Large: have the user drop the CSV into Hillnote (imports become sheets automatically, with type inference).

## Gotchas

- Rows returned by the read tools carry `id` — always prefer `options.ids` over `where` for targeted updates.
- Row payload keys must be **column ids**, not display names (the error lists valid ids).
- A `query_sheet_rows` / `read_sheet` response that hits the size cap needs tighter filters or paging — never retry the same call.
- Sheet edits made while the app is open appear there within a couple of seconds; nothing extra to sync.
