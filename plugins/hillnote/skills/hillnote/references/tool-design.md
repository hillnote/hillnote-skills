# HTML tool design guide

How to make a Hillnote tool look and feel excellent. When MCP is connected, `get_html_tool_guide` serves the live version of this guidance — call it first and treat it as authoritative; this file is the Files-mode fallback and expanded recipe book.

## The context you're designing for

- The tool runs in a **sandboxed iframe in Hillnote's sidebar, roughly 350–450px wide**, and can also be embedded in documents. Design for a narrow column and vertical scrolling.
- Shown as a **Custom view** of a database or sheet (`hillnote.context.surface === 'view'`), it fills that view's area instead — far wider than the sidebar, so keep layouts fluid (`grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`). The view tab already names it and the database toolbar already filters, searches and sorts — don't repeat a big title or filter controls there.
- It ships straight to the user. The bar is *genuinely beautiful*, not functional-but-plain.
- One `index.html`, everything inline, works offline.

## The injected design system (do not write this yourself)

Every HTML file saved through the tools gets a baseline stylesheet injected automatically at save time. It provides:

**Tokens** — shadcn-style CSS custom properties on `:root`, resolving for light AND dark automatically. `--primary` is set per tool (a stable accent derived from the tool's name):

```
--background --foreground --card --card-foreground --muted --muted-foreground
--secondary --accent --primary --primary-foreground --destructive
--success --warning --info --border --input --ring
--radius --font --shadow-sm --shadow
```

**Pre-styled bare elements** — `h1`–`h4`, `p`, `a`, `code`, `table`, `dialog`, `button`, `input`, `select`, `textarea`, `label`. Inputs are full-width; checkbox/radio/range pick up the accent color; focus rings are handled.

**Classes**:

| Kit | Classes |
|---|---|
| Buttons | `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-destructive`, `.btn-sm`, `.btn-icon` |
| Surfaces | `.card`, `.toolbar` (sticky header) |
| Layout | `.row`, `.stack` (flex with 8px gap), `.field` (label + control) |
| Lists | `.list`, `.list-item` |
| Status | `.badge`, `.badge-success`, `.badge-warning`, `.badge-info`, `.badge-danger` |
| Text | `.muted`, `.empty-state` |

## Hard rules

1. **Never write** CSS resets, dark-mode media queries, base typography, scrollbar, or form-control styles — all provided. Write only tool-specific CSS.
2. **Never hardcode colors.** Status colors come from `var(--success)`, `var(--warning)`, `var(--info)`, `var(--destructive)`. Tinted backgrounds: `color-mix(in srgb, var(--success) 14%, transparent)`. Hardcoded hex breaks dark mode and is flagged by validation.
3. **Compose the provided classes** with your own modifier classes rather than re-implementing lookalikes.
4. **Exactly one `.btn-primary` per view** — it marks the dominant action.
5. The injected baseline appears in reads as one `<!-- hillnote-baseline -->` placeholder — never edit it. Re-theme by overriding its variables in your own `<style>` (e.g. `:root { --radius: 12px }`).

## Component recipes

**App shell** — sticky toolbar + scrolling body:

```html
<header class="toolbar row">
  <h1>Expenses</h1>
  <span class="badge">12</span>
  <button class="btn btn-primary" style="margin-left:auto">Add</button>
</header>
<main class="stack">…</main>
```

**List with actions**:

```html
<div class="list card">
  <div class="list-item row">
    <div><strong>Groceries</strong><div class="muted">Yesterday</div></div>
    <span class="badge badge-success" style="margin-left:auto">$42</span>
    <button class="btn btn-icon btn-ghost" title="Delete">✕</button>
  </div>
</div>
```

**Stat row** — dashboard cells:

```html
<div class="row">
  <div class="card" style="flex:1"><div class="muted">Total</div><strong style="font-size:20px">$1,284</strong></div>
  <div class="card" style="flex:1"><div class="muted">This week</div><strong style="font-size:20px">$212</strong></div>
</div>
```

**Form / settings**:

```html
<div class="stack card">
  <div class="field"><label>Name</label><input placeholder="Trip to Lisbon"></div>
  <div class="field"><label>Budget</label><input type="number" value="500"></div>
  <div class="row"><button class="btn btn-ghost">Reset</button><button class="btn btn-primary" style="margin-left:auto">Save</button></div>
</div>
```

**Tabs** — single file, switch views in JS. The active tab wears `.btn-primary`, the rest `.btn-ghost`; re-render on click.

**Modal** — the native `<dialog>` element is pre-styled (including the backdrop). Use `dialog.showModal()` and `dialog.close()` — no custom overlay divs.

**Mini chart** — no library. A sized `<canvas>` plus `getContext('2d')`. Take colors from the tokens so the chart follows the theme — `--primary` is a plain color, but most tokens are light/dark pairs a canvas can't parse, so resolve them through an element — and redraw when the app's light/dark theme flips (it follows the app's toggle, not the OS):

```js
const probe = document.body.appendChild(document.createElement('i'));
const token = (name) => { probe.style.color = `var(${name})`; return getComputedStyle(probe).color; };
ctx.fillStyle = token('--success');
hillnote.onContextChange(draw);   // theme toggles (and Custom-view filter changes)
```

**Empty state** — always render one when there's no data:

```html
<div class="empty-state">No expenses yet. Add your first one above.</div>
```

## Quality bar

- Real placeholder content — never lorem ipsum.
- Render empty **and** error states, not just the happy path.
- Hover and focus states come from the baseline — don't add your own unless genuinely bespoke.
- Spacing on a 4px grid (the `.row`/`.stack` gap is 8px). Body text 13–14px.
- Wrap risky operations (`JSON.parse`, sheet calls) in try/catch and show a friendly message instead of a blank screen.

## Data persistence

Tools run in a sandbox: `localStorage`, `sessionStorage`, IndexedDB and cookies **do not persist** — they reset on every reload, and validation flags them (`browser-storage`). Hillnote gives every tool two stores instead.

**Records → a Sheet.** Anything that is a list of entries (expenses, sessions, tasks, logs, history) lives in a Sheet in `documents/Tools/`, where the user can see and edit it and other agents can query it. Declare it when you create the tool: `add_html_tool` with `sheets: [{ name: "Expenses", columns: [{ name: "Item" }, { name: "Amount", type: "number" }, { name: "Date", type: "date" }] }]` — the first column is the row title; types: text, number, checkbox, date, datetime, select, multiselect, status, url, email, location, image (give select/multiselect/status their `options` — they render as colored chips). Write typed values: numbers, `true`/`false`, dates as `"YYYY-MM-DD"`, multiselect as an array of strings; a select/status value not yet in the options is added to them. To use a sheet that already exists, pass just its name (`sheets: [{ name: "CRM" }]`) — the user approves access once. For an existing tool, use `attach_tool_sheet`. Both return each sheet's column ids.

```js
const expenses = await hillnote.sheet('Expenses');
let rows = await expenses.rows();          // [{ id, title, amount, date }] — keys are column ids
await expenses.add({ title: 'Coffee', amount: 3.5, date: '2026-09-22' });
await expenses.update(row.id, { amount: 4 });
await expenses.remove(row.id);
expenses.onChange(async () => { rows = await expenses.rows(); render(); }); // changes made elsewhere
```

`rows({ search, filters: [{ column, operator, value }], sort: { column, direction }, limit })` filters on the host (operators: `equals`, `notEquals`, `contains`, `greaterThan`, `greaterThanOrEqual`, `lessThan`, `lessThanOrEqual`, `isEmpty`, `isNotEmpty`); an unknown column or operator throws rather than returning every row. `limit` defaults to — and caps at — 10,000 rows (no paging; filter instead). Display names also work as row keys. `add` returns the new row ids, `update`/`remove` the number of rows changed; each takes one item/id or an array (up to 1,000 — batch instead of looping). `onChange` fires for changes made elsewhere (the app, agents, sync, another tool), never for this tool's own writes — update local state after a write. Save as values change: writes started while the tool is closing (`beforeunload`/`pagehide`) may not reach Hillnote.

**Small state → `hillnote.settings`.** Preferences, the selected tab, a draft, a counter: `hillnote.settings.get('tab', 'week')` (synchronous, with a fallback), `hillnote.settings.set('tab', 'month')`, `.remove(key)`, `.all()` — JSON values, 64 KB total, saved next to the tool (`tool.settings.json`) and synced with the workspace. Never write that file yourself.

**Built for existing data → `hillnote.data()`.** When the tool is for a database or sheet the user already has (declared `primary: true`, or shown as a Custom view via `add_tool_view`), read it without naming it — and re-render on change, because in a view the toolbar's filters/search/sort change the rows:
```js
await hillnote.ready();                          // fills hillnote.context
const data = await hillnote.data();              // rejects when nothing is linked — catch it, show an empty state
const columns = data.columns();                  // sync; data.kind is 'database' | 'sheet'
let rows = await data.rows();                    // a Custom view's filters/search/sort already applied
data.onChange(async () => { rows = await data.rows(); render(); });
const key = 'layout:' + (hillnote.context.view?.id || 'default'); // per-view settings
```
`data()` is the Custom view's own database/sheet, else the declared source marked `primary`, else the tool's only declared one (`hillnote.database('Cards')` / `hillnote.sheet(…)` reach declared sources by name). In a view the tool's own `rows()` filters narrow the view's further and its `sort` wins; `rows({ ignoreView: true })` reads everything. `columns()` is `[{ id, name, type, options?, optionStyles?, optionStates?, computed? }]` (the title column's id is always `title`) — enough to render any database generically; computed (formula) columns are read-only (writing one throws). Database rows may also carry `_emoji` (the row's icon); keys starting with `_` are ignored when a row goes back into `update()`. To match the database views, colour select/status chips with `optionStyles[value]` (`{ bg, fg }` — the app's own option colours; status columns add `optionStates`: `done` / `archive`). Tools follow the app's light/dark theme on their own (`hillnote.context.theme`; `hillnote.onContextChange(cb)` when it or the view changes).

**Migrating an old tool** that used localStorage: `attach_tool_sheet` (with columns matching the old records), then replace the localStorage load/save with `hillnote.sheet(…)` calls via `replace_in_html_file`.

## Dependencies

- Default: vanilla JS, everything inline, zero dependencies.
- For genuinely heavy needs only (rich charting, markdown rendering, PDF): at most **one** pinned CDN `<script>`, with a visible "this feature needs an internet connection" empty-state when its global is missing.
- **Prefer one self-contained `index.html`.** Sibling files in the tool's folder (`style.css`, `app.js`, JS modules, extra pages) do load — tools are served from their own folder — but each is another file to keep in sync.

## Token-efficient workflow

1. State a 2–3 bullet design direction (layout, key components, how the accent is used) — then build the **complete tool in one `add_html_tool` call** — with its `sheets` if it stores records, its `databases`/`primary` if it's built for existing data (then `add_tool_view` when it should open as a view tab of that data).
2. Every write returns a `validation` summary. **Empty `issues` ⇒ done — do not read the file back.**
3. Fix issues and make later edits with `replace_in_html_file` using a short, unique `searchText`. Duplicated text → `replaceAll` or `occurrenceIndex`. Not found → use the file sample in the error, or read just a line range.

## What validation checks

`validation.issues` flags real problems: unbalanced tags, script syntax errors, fixed widths ≥480px (they overflow the sidebar), several hardcoded hex colors (breaks dark mode), browser storage (`localStorage`/`sessionStorage`/IndexedDB/cookies — use a Sheet and `hillnote.settings`). Advisory notes cover things like a missing viewport meta or a very large file. Treat issues as a to-do list; weigh advisories with judgment.

## Files-mode caveat

The baseline is injected by the MCP servers and the app **at write time**. Writing tool files directly to disk skips injection — the tokens and classes above won't exist in that file. (The `hillnote` runtime is different: the app adds it when it renders any tool, but a sheet or database is reachable only if the tool's `tool.meta.json` declares it, or it is the Custom view's own data — see `references/html-tools.md`.) Either write complete self-contained styling (define your own small token set, honor `prefers-color-scheme` for dark mode), or better: create the tool through MCP or the app so the design system applies. Never paste a hand-built imitation of the baseline block into the file — the real one is managed for you on the next MCP write.
