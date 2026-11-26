# Kanban automation — agents, auto-moves, scheduled moves

A database or sheet with a **status** column can run its board by itself. Setting it up is **local only** (local MCP or the `hillnote` command), and it runs in the Hillnote **desktop app** on the user's machine — not the web app. Over the remote server you can only read it and must preserve it (see *Remote MCP* below).

## What a board can do

Per **status** (an option of the board's status column):

- **Agent** — when a card lands in the status, Hillnote opens a terminal and starts an agent CLI on the task: `claude`, `codex`, `cursor`, `antigravity` or `copilot`. It runs in the board's **project folder** (e.g. the code repo the board tracks — the workspace stays available to it) with a brief built from the card: title, fields, the path to its document (a sheet row: its id), and the status's instructions. Settings: `cli`, `instructions`, `permissions` (`ask` — the CLI asks before acting; `auto` — no permission prompts), `whenDoneMoveTo` (the status the agent moves the card to as its last step).
- **Auto-move** — every card that lands in the status moves on to another status by itself, `afterMinutes` later (`0` = as soon as it lands) — unless it has left that status by then. E.g. Inbox → To do at once; Done → Archived after a day.

Plus **scheduled moves** (one card → one status at a set time, or now) and board **defaults** for every agent the board starts: `closeAfterMinutes` — close a finished agent's terminal this long after it goes quiet (`1`, `2`, `5` default, `15`; never while it works or waits for input); `notifyOnInput` (default on — the user is notified when an agent waits for input); `permissions` — the default for **Delegate to agent**.

**In the app:** board settings (toolbar gear) ▸ **Agents** tab — Project folder, Status automation, Defaults, Scheduled moves. A kanban card's ⋮ menu has **Delegate to agent** (hand that one card to a CLI now, with optional instructions and a "when done" status — from outside the app, give a status an agent and schedule the card into it), **Schedule move…**, **Open agent terminal** / **Stop agent**. Column headers mark statuses that start an agent or auto-move; a card with a pending move shows `→ <status> · <when>`.

## The one rule

**Only moves Hillnote makes set anything off** — moving a card in the app (a drag, or changing its status there), or a scheduled move Hillnote applies. Changing a status by editing the row (`update_rows`, `update_sheet_rows`, `hillnote db edit` / `sheet edit`, the file or `data.csv`, a sync from another machine) starts **no agent and no auto-move**. To hand a card to a status's agent, or move it on when you finish your own task, **schedule the move** — `at: "now"` works.

The card must actually **change** status: a move into the status it's already in starts nothing — so never set the status with `update_rows` first and then schedule it. Statuses chain: when an auto-move or scheduled move lands a card in a status, that status's agent and auto-move run too.

## Tools and commands

| To… | `hillnote` | Local MCP |
|---|---|---|
| See a board's setup + its pending moves | `automation show <board>` | `get_board_automation` (`databasePath` or `sheetPath`) |
| Every pending move in the workspace | `schedule list` (`schedule list <board>` for one) | `get_board_automation` with no board |
| Give a status an agent | `automation set <board> "<status>" --agent claude --when-done "<status>" --instructions "…" [--permissions ask]` | `configure_board_automation` `statuses: { "<status>": { agent: { cli, instructions, permissions, whenDoneMoveTo } } }` |
| Change / remove it | the same with only the flags to change; `--when-done none`; `--no-agent` | only the fields to change; `whenDoneMoveTo: null`; `{ agent: null }` |
| Auto-move every card on | `automation set <board> "<status>" --auto-move "<status>" --after 1d` (`0`, `15m`, `2h`, `1d`, `1w`); `--no-auto-move` | `{ autoMove: { to, afterMinutes } }` (`null` removes) |
| Board defaults | `automation defaults <board> --permissions ask --close-after 5 --notify on` | `defaults: { permissions, closeAfterMinutes, notifyOnInput }` |
| Project folder (this machine) | `automation folder <board> <absolute path>` (`--all-boards`, `--clear`) | `projectFolder: { thisBoard \| allBoards }` (`null` clears) |
| Move a card at a time / now | `schedule add <board> "<row>" --to "<status>" --at "YYYY-MM-DD HH:MM"` (`--in 2h`, `--now`; sheet rows `--id r_…`) | `schedule_card_move` `{ row, to, at }` |
| Cancel | `schedule cancel <id>` | `cancel_scheduled_move` `{ id }` (`sm_…`) |

- `configure_board_automation` changes only the keys you pass; an existing agent keeps the fields you leave out. Status names match case-insensitively (an unknown one errors with the options); `whenDoneMoveTo` / `autoMove.to` must be a different status; a project folder must be an existing absolute folder on this machine.
- `<board>` is a database or sheet by name or path; `<row>` is a database row's title (its file name — if several match, pass the exact one), or a sheet row's `_hnid` (or a unique title).
- `at`: `"now"` (default), ISO 8601, or `"YYYY-MM-DD HH:MM"` in local time; a time in the past is refused. `schedule_card_move` returns `whenItLands: { startsAgent, thenAutoMovesTo }` — tell the user what the move will set off. Its optional `column` moves along a select column instead: a plain timed change (agents and auto-moves are status-only).
- `hillnote agents` is an alias for `hillnote automation`.

## Recipes

**A task an agent starts on tomorrow at 9:**
```bash
hillnote automation set Tasks "In progress" --agent claude --when-done Review     # once per board
hillnote db add Tasks title="Fix login redirect" status="To do"
hillnote schedule add Tasks "Fix login redirect" --to "In progress" --at "2026-10-23 09:00"
```
MCP: `configure_board_automation` → `add_rows` → `schedule_card_move`.

**Hand a card to its column's agent right now:** `schedule_card_move { row, to: "<agent status>", at: "now" }` — not `update_rows`.

**A pipeline:** Inbox auto-moves to "To do" at once; "In progress" has an agent that finishes into "Review"; "Done" auto-moves to "Archived" after 1 day.

**Board has no status column:** add one first — `hillnote db column add <db> "Status:status=To do|In progress|Done"` (or `add_column` with `type: "status"`).

## Remote MCP

No automation tools, and no change made through it sets anything off. `get_database_config` shows the setup (file keys below). `save_database_config` replaces the keys it manages — `name`, `columns`, `views`, `defaultView`, `description`, `emoji`, `agents` — and keeps any other top-level keys in the file: send `agents` back unchanged and keep the status column's `optionAgents` / `optionAutoMoves` exactly as returned. To set automation up, the user needs the desktop app, local MCP or `hillnote`.

## Rules and limits

- Ask before setting `permissions: "auto"` — it starts the CLI with its skip-all-prompts flag.
- Scheduled moves and auto-moves run on **the machine that scheduled them**, while that workspace is open in Hillnote; one missed while it was closed runs once on the next launch. A move from another machine shows `thisMachine: false` and fires only there. One schedule per card — a new one (including the auto-move of a status the card lands in) replaces the old.
- A zero-delay auto-move loop (A → B → A) is refused; a card that keeps bouncing between statuses is paused and the user is told.
- A card renamed in the app keeps its schedule; one renamed or deleted any other way is dropped when its move comes due (the user sees "Couldn't move … as scheduled").
- Where it lives: the status column's `optionAgents` (`{ "<status>": { toolId, instructions, permissions, finishTo } }`) and `optionAutoMoves` (`{ "<status>": { to, afterMin } }`), and the board's top-level `agents` (`{ permissions, closeAfterMin, notifyOnInput }`) in `database.json` / `sheet.json` (the file spells the tools' `cli` / `whenDoneMoveTo` / `afterMinutes` / `closeAfterMinutes` as `toolId` / `finishTo` / `afterMin` / `closeAfterMin`). The project folder and the schedule live in machine-specific files under the workspace's `.hillnote/` folder. Read them freely, **change them only through the tools/commands**.
- **Agent didn't start?** The status was edited rather than moved · the card was already in that status · the CLI isn't installed or is off in Settings ▸ AI · the project folder is missing on this machine ("Project folder not found") · an agent is already working on that card (one at a time) · that workspace wasn't open in Hillnote, or the move belongs to another machine.
- **If you are the delegated agent** (your prompt starts "You were delegated a task from the Hillnote …"): work in your working directory, use the absolute paths in the prompt, and finish with the exact `hillnote … schedule add … --now` command it gives (or `schedule_card_move` with `at: "now"`) — never by editing the status.
