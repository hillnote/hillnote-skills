# Moodboards (`.moodboard.md`)

A moodboard is a free-form, zoomable pinboard stored in a `.moodboard.md` file — images, document cards, videos, text notes, sticky notes, link cards, colour swatches, frames and shapes, optionally joined by connectors, plus the user's own pen strokes. The file is frontmatter plus one ```` ```moodboard ```` JSON fence; the JSON is machine-managed.

**The one rule: never write the board JSON through text tools.** `replace_content` / `insert_content` / `delete_content` are blocked on `.moodboard.md`, and `read_document` gives raw JSON (local) or a summary without item ids (remote) — use `read_moodboard`. Call `get_moodboard_guide` first, then use the moodboard tools — they assign ids, validate every field, keep z-order and write atomically. Files mode may edit the fence, but only as described under Mode notes.

## Creation sequence

1. `get_moodboard_guide` — always first; it's the current item/layout spec (some servers return a condensed version — this file covers the rest).
2. `add_document` with a title ending `.moodboard.md` (e.g. `"Brand Inspiration.moodboard.md"`) and **no content** — the system writes the empty board. The moodboard tools never create files; a missing board is an error that points you back here.
3. Anything with connections — a flowchart, pipeline, architecture map, org chart, mind map — or more than a few items: `draw_on_moodboard` (below); Hillnote does the layout. Loose items (an inspiration board, swatches, photos): `add_moodboard_items` with your planned items + connectors. Both append to what's there; frames go to the back layer.
4. Check the result's `issues` (empty = nothing overlaps, is cut off or hidden behind a box) and `warnings` (anything dropped). `read_moodboard` gives the summary, ids and positions; locally, with the app running, `render_moodboard` shows you the board as a picture; remotely, `show_moodboard` shows it to the user.

To redo from scratch: `clear_moodboard` with `confirm: true` (destructive — confirm with the user), then add items. Otherwise never rebuild a board to change one item — update or remove in place.

## Diagrams: `draw_on_moodboard`

One call draws a whole diagram: give nodes and edges, and Hillnote lays them out, sizes each box to its text and routes the arrows — no coordinates. Edges alone are enough: `[["Browser","API"],["API","Database","reads"]]` creates all three nodes.

- `layout`: `flow` (default — flowcharts, pipelines, architecture, dependencies), `tree` (org charts, hierarchies), `mindmap` (branches around the first node), `grid` (cards in rows, no structure). `direction`: `auto` (default), `TB`, `LR` — for flow and tree.
- `nodes` (≤200): a string (id and label), or `{ id, label, tint, shape: box|diamond|ellipse, fontSize, group, item }` — `diamond` for a decision, `ellipse` for a start or end; `item` draws the node as a real board item (any `add_moodboard_items` spec, e.g. a `doc` card or an image; its x/y are ignored).
- `edges` (≤400): `["from","to"]`, `["from","to","label"]` or `{ from, to, label, dash, color, curve, start, end, width }`. Labels ≤3 words.
- `groups`: titled frames that hold nodes (`{ id, title, tint }`; nodes join with `group`) — flow, tree and grid.
- `edgeStyle`: `auto` (right angles for trees, curves otherwise), `curved`, `straight`, `elbow`. `at: { x, y }` places it; by default it goes to the right of what's already there.
- `name`: call again with the same name to redraw that diagram in place — its items keep their ids, but positions the user changed by hand are reset.
- Returns `refs` (your node ids → item ids, for later `update_moodboard_items`), `bounds`, `warnings` and `issues`. One tint per category, as for items.

## Plan the layout before placing anything

This is for `add_moodboard_items`; `draw_on_moodboard` lays itself out.

1. Decide 2–4 sections; give each a titled `frame` and lay its items out inside with a 40 px inset. Keep every item fully inside its frame: the app treats an item whose centre lies in a frame as its content — dragging, duplicating or deleting the frame in the app takes it along (nested frames and locked items stay put).
2. World pixels, origin top-left, +x right / +y down, integers. Positive coordinates starting near (0,0).
3. 320 px columns with 40 px gutters (x = 0, 360, 720, …), 40 px between rows, ≤4 items per row.
4. Sizes follow content — omit `w`/`h` for the type default; don't shrink items to fit (the view zooms to fit). Photos 320×240 or the real aspect ratio; videos 16:9 (320×180, 480×270, 640×360); doc cards 260 wide; swatches 120×120; sticky notes 200×200.
5. Text and sticky notes: one idea, ≤120 characters; `fontSize: 28` for a single title note; omit `h` and the box fits its text. Sticky notes (`sticky`, a coloured card that keeps its size) for ideas, todos and comments; text notes for headings and labels.
6. One tint per category (e.g. `mint` = confirmed, `coral` = risk) — the `color` of doc cards, frames and sticky notes, or a text note's `tint`. Tint keys: `coral`, `peach`, `sand`, `mint`, `sage`, `fog`, `dusk`, `blossom`.
7. Stacking = array order, and only adding sets it: new frames go to the back, everything else on top of what's there; no tool restacks. Add a filled `shape` backdrop before the items that sit on it (or use a frame).

## Item spec (for `add_moodboard_items`)

Common: `type`, `x`, `y`, `w`, `h` (≥ 8), `locked` (false — the app won't move or resize it), `opacity` (0..1, default 1). `id` is assigned and returned — never pick one.

| type | required | optional (default) | default w×h |
|---|---|---|---|
| `image` | `src` — `resources/images/<board>/<file>` or `https://…` | `fit`: `cover`\|`contain` (`cover`), `caption` | 320×240 |
| `doc` | `path` — workspace-relative, e.g. `documents/notes.md` | `expanded` (false), `previewHeight` (320, height when expanded), `color` tint key | 260×56 |
| `video` | `url` — YouTube or Vimeo URL (or `provider` + `videoId`) | `title` | 320×180 |
| `text` | `text` | `fontSize` 14/16/20/28 (16), `align`: `left`\|`center`\|`right` (`left`), `color` hex, `tint` (optional highlight; default none = plain handwritten text) key | 220×120 |
| `link` | `url` — `http(s)://…` | `title`, `description` (≤300 chars, blurb under the title), `image` (`https://` preview picture) | 280×96 |
| `swatch` | `hex` — `#rrggbb` (or `#rgb`) | `label` | 120×120 |
| `frame` | — | `title`, `color` tint key or hex | 600×400 |
| `shape` | — | `kind`: `rect`\|`ellipse` (`rect`), `fill` hex\|`transparent` (`transparent`), `stroke` hex\|`transparent` (`#1e1e1e`), `strokeWidth` (2), `radius` (corner radius, rect only) | 160×120 |
| `sticky` | — | `text` (may be blank), `color` tint key (`sand` = yellow; never uncoloured), `fontSize` 14/16/20/28 (16), `align` (`left`) | 200×200 |

Link previews: leave `image` out and the app, once the board is open, fills the picture (plus a missing `title` / `description`) from the page and grows a default-height card to 200 tall. If you pass `image` yourself, also pass `h: 200`.

Caps per call: ≤500 items + ≤1000 connectors (`add`), ≤500 updates, ≤5000 ids (`remove`) — batch bigger boards. A bad required field (non-portable image `src`, non-http link `url`, bad swatch `hex`, a video URL that isn't YouTube/Vimeo, a doc `path` that is empty or contains `..` / a drive letter) drops the item with a warning, never guessed; if every item is dropped the call fails and nothing is written. The result's `ids` skip dropped items, so check `warnings` before mapping ids back to your list. Bad optional values fall back silently: an unknown tint key or enum value is ignored (a sticky reverts to `sand`).

**Image `src`**: `resources/images/<board>/<file>` (a file that already exists there) or a public `https://` URL. Never `data:` / `blob:` / `file:` URIs, absolute machine paths or `hillnote-resource://` — such items are dropped. A relative path outside `resources/` is kept but warned about (it won't travel with the workspace). No MCP tool uploads images; files reach `resources/` via the app or Files mode.

## Connectors

`{ "from", "to", "label"?, "style"? }` in the `connectors` array of `add_moodboard_items`.

- `from` / `to`: an item id, `{ "item": id, "side": "auto"|"top"|"right"|"bottom"|"left" }` (default `auto`), or a free point `{ "x", "y" }`.
- `"#0"`, `"#1"`, … alias the items of the **same call** by 0-based index, and an item given a `"ref": "name"` can be used as `"name"` (tool calls only — never in the file). To connect items already on the board, `read_moodboard` first and send a call with only `connectors`, using their ids.
- `style` (all optional): `color` hex (`#1e1e1e`), `width` 1..12 (2), `dash`: `solid`|`dashed`|`dotted` (`solid`), `start` / `end`: `none`|`arrow`|`dot` (`none` / `arrow`), `curve`: `curved`|`straight`|`elbow` (`curved`).
- `label` ≤3 words (`"cites"`, `"inspired by"`, `"contradicts"`). Unknown endpoint ids and self-loops are dropped.
- No tool restyles or deletes a single connector (update/remove take item ids only); one goes only with an endpoint item or `clear_moodboard`. Leave such edits to the user in the app.

## Updating, removing, clearing

- `update_moodboard_items` with `updates: [{ "id": "…", …fields }]` patches items in place (ids from `read_moodboard` or a previous add). Only the fields you pass change; `null` removes an optional field (`caption`, `title`, `label`, `color`, `tint`, `radius`, `previewHeight`, link `description` / `image`). `type` is immutable — remove and re-add to change it. A patch that would leave the item invalid lands in `skipped` with a reason; items with `locked: true` are skipped (`item is locked`) unless the patch itself sets `locked: false`. Connectors stay attached and follow the item; unknown ids come back in `notFound`. Example — move a note into the second column and retint it: `{ "updates": [{ "id": "m_k3d9x1qz", "x": 360, "tint": "coral" }] }`. Never remove + re-add an item just to move it.
- `remove_moodboard_items` with `ids: [...]` deletes those items and every connector attached to them.
- The tools never carry frame contents: moving a frame moves only the frame (patch its contents by the same dx/dy in the same call), and removing a frame leaves its contents (pass their ids too to delete the section).
- `clear_moodboard` empties items, connectors and pen strokes (board settings are kept). On a non-empty board it refuses without `confirm: true` — ask the user first.

## Board settings and locking

`board` = `{ bg, texture, grid: { size, snap }, locked }` — user-edited in the app's settings popover; the item tools never change it. `bg`: `default`, `paper`, `sand`, `mint`, `fog`, `dusk`, `blossom`, `slate`, `cork` or `#rrggbb`; `texture`: `none`, `dots` (default), `grid`, `lines`, `paper`, `cork`; `grid.size` 4..400 (20). `board.locked: true` is the user's view-only switch (`read_moodboard`'s summary says `LOCKED (view-only)`): the app refuses every move/resize/add/delete and all four writing tools return an error. Ask the user to unlock the board (lock button in the right rail) — never edit the file around the lock.

## Mode notes

- **Remote MCP**: `workspace` = workspace ID from `list_workspaces`; `moodboardPath` = the path `add_document` / `read_registry` reports (e.g. `documents/brand-inspiration.moodboard.md`). Writes land in the cloud copy; the app shows them after its next sync.
- **Local MCP**: `workspace` = workspace name or path; same `moodboardPath`. Writes hit the file on disk immediately — an open board re-parses live.
- **CLI**: `hillnote guide moodboard`, then `hillnote board view|add|draw|edit|remove|clear|render` — `add --file` takes `{ "items", "connectors" }`, `draw --file` the `draw_on_moodboard` object (`{ "layout", "nodes", "edges", "groups", "name" }`), `edit --file` an array of `{ "id", …fields }`; `render` needs the app running (`references/cli.md`).
- **Files mode** (no tools): read the file freely; write it only per the guide's "Writing the File Directly" rules — keep the frontmatter (`type: moodboard`) and exactly one ```` ```moodboard ```` fence whose body is valid JSON as a whole (`{"type":"moodboard","version":1,"board":{…},"viewport":{…},"items":[…],"connectors":[…],"strokes":[…]}`); **one JSON object per line** inside `items`, `connectors` and `strokes` (e.g. `{"id":"m_k3d9x1qz","type":"sticky","x":0,"y":0,"w":200,"h":200,"text":"Idea","color":"mint"}`, `{"id":"m_p0a7c2mf","from":{"item":"m_k3d9x1qz"},"to":{"item":"m_r8s1t4vw","side":"left"},"label":"cites"}`); ids `m_` + 8 lowercase base36 characters, unique in the file; **append only** — new items at the end of `items` (new frames at the front, before the items they contain), never reorder or renumber existing lines, never touch `viewport`, `version` or `strokes`; omit defaults (`fit: cover`, `locked: false`, `opacity: 1`, default connector `style`); integer coordinates; portable image `src` only (copy the file into `resources/images/<board>/` first). `bg` / `texture` may be set here. Validate the JSON before saving — an invalid fence makes the app keep its last good board and show a corruption warning.

## Recovery

- Fence isn't valid JSON → the app keeps its last good board and warns; every moodboard tool except `clear_moodboard` errors out ("Moodboard file is corrupt …") without changing anything. Fix the JSON in Files mode, or with the user's consent `clear_moodboard` with `confirm: true` and rebuild.
- File has no fence → treated as an empty board; the next tool write replaces whatever text was there.
- Items or connectors missing after an add → they were dropped by validation; read `warnings`, fix the field, re-add.
- "This moodboard is locked (view-only)" → ask the user to unlock it; don't work around the lock.
