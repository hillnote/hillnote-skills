# Troubleshooting

Symptom → likely cause → what to do. When an error names its own fix (many Hillnote tool errors do), follow that first.

## Connection & auth

| Symptom | Likely cause | Remedy |
|---|---|---|
| Remote: `list_workspaces` is empty or the workspace is missing | Workspace never synced to the cloud | Open the Hillnote app → sync that workspace once → retry |
| Remote: writes fail with `Write access required. This token only has "read" scope.` | The OAuth token was granted read-only | Reconnect/re-authorize the Hillnote connector and choose read & write; retrying won't help |
| Remote: everything suddenly 401s / asks to re-auth | Access token expired or was revoked | Re-authorize; if the user manages connections, they can also revoke stale tokens from their Hillnote account |
| OAuth window never completes | Popup blocked or user not signed in to hillnote.com | Allow the popup, sign in on the site, retry the connect flow |
| No Hillnote tools at all | Nothing connected | Offer to set it up yourself, asking first (`references/modes.md` → Setting things up), or the user opens Hillnote → **Settings → Connections** → **Configure** next to their agent app: the **Local MCP** card for this computer, the **Cloud MCP** card for synced workspaces anywhere |
| `hillnote: command not found` | The command isn't on this shell's PATH | Use `"$HILLNOTE_CLI"` or Hillnote's built-in copy by its full path (`references/modes.md` → Setting things up). For good: ask the user, then Configure in Settings → Connections → Local MCP. `hillnote doctor` explains anything else |
| Remote: an edit doesn't show in the app yet | Cloud MCP writes the cloud copy; the app pulls it on its next sync | Tell the user it will appear after the sync. For a workspace on this computer, use the `hillnote` command instead — its edits show at once |

## Local MCP setup

| Symptom | Likely cause | Remedy |
|---|---|---|
| Client can't start the server / "command not found" | `hillnote-mcp` not on PATH or Node < 18 | `npm install -g @hillnote/mcp-server`, Node ≥ 18, then fully restart the MCP client |
| Config added but no tools | Client didn't reload | Restart the client (e.g. quit and reopen Claude Desktop) |
| `list_workspaces` empty locally | Hillnote app not installed / has no workspaces yet | Install the app and open a workspace once so it's registered |
| Local reads hang or time out | Workspace lives in a cloud-streamed folder (Google Drive, OneDrive, iCloud) with files not downloaded | Mark the workspace folder "available offline" / keep downloaded |

## Truncation & big workspaces

| Symptom | Remedy |
|---|---|
| Response says truncated / capped | Use the paging parameter for that tool family — playbook in `references/tool-reference.md`. Never resend the same call |
| Search "found nothing" but the note exists | Remote content search is bounded on large workspaces (check `contentSearchPartial`) — narrow the query, add title/tag words, or scope to one workspace |
| Database query flagged `partialScan` | Tighten filters or paginate with `startRow`/`maxRows` |
| A single write rejected as too large | Split the content into multiple `insert_content` calls or multiple documents |

## Editing conflicts

| Symptom | Likely cause | Remedy |
|---|---|---|
| "Version conflict" / "modified concurrently" on a remote write | Someone (or the app's sync) edited at the same time | Re-read the document, re-apply your edit on the fresh content, retry once; if it persists, pause and tell the user |
| `replace_content` "text not found" | `searchText` doesn't match byte-for-byte (whitespace, line breaks) | `read_document` again, copy the exact text including newlines, retry |
| `delete_content` refuses | `expectedContent` mismatch — line numbers went stale | Re-read, recompute the range. This guard is protecting you; don't drop it |
| Edits not visible in the user's app | App hasn't pulled the cloud change yet (remote writes) | Ask them to sync/refresh in the app; the change is saved |

## HTML tools

| Symptom | Meaning | Remedy |
|---|---|---|
| Write returns `validation.issues` (non-empty) | The written HTML has real problems (unbalanced tags, script syntax, fixed widths, hardcoded colors) | Fix each listed issue with `replace_in_html_file`; don't re-read the file |
| `searchText appears N times — ambiguous` | Multiple matches, no disambiguator | Expand `searchText` with surrounding context, or pass `replaceAll: true` / `occurrenceIndex: <n>` |
| `searchText not found` | Exact-match miss (whitespace, or the text changed) | Use the file sample in the error; read the exact range with `startLine`/`endLine`; copy verbatim |
| "…is managed automatically and cannot be written/edited" | You targeted `tool_registry.json` or `tool.meta.json` | Those are server-owned — declare sheets with `add_html_tool` (`sheets`) / `attach_tool_sheet`; change description or entry point with `edit_html_tool` |
| "…is the tool's saved state and cannot be written directly" | You targeted `tool.settings.json` | The tool owns it through `hillnote.settings.get/set` — change the code, not the file |
| `validation.issues` has `browser-storage` | The tool uses `localStorage`/`sessionStorage`/IndexedDB/cookies, which reset in the sandbox | Store records in a sheet (`add_html_tool` `sheets` / `attach_tool_sheet`, then `hillnote.sheet(…)`) and small state in `hillnote.settings` |
| `add_html_tool`/`attach_tool_sheet`: "documents/Tools/… already exists" | A sheet (or folder) with that name exists | Nothing was written — connect it by name without `columns`, or choose another name |
| `databases[…]`: "tools connect existing databases only — omit columns" | You passed `columns` for a database | Databases are never created by tools — drop `columns`, or declare a sheet with columns for new records |
| `add_tool_view`: "Pass exactly one of database or sheet" / "matches N …" | Neither/both given, or the name is ambiguous | Pass one, using the folder name from `find_databases` / `find_sheets` (local: `list_databases` / `list_sheets`) when names repeat |
| A tool shows "This tool has no linked data…" / "…has no primary data source…" | `hillnote.data()` ran outside a Custom view (sidebar preview, document embed) and the tool has no single or `primary` source | Show it as a Custom view (`add_tool_view`), or mark one source `primary: true` (`attach_tool_sheet` / `attach_tool_database`) |
| `Access to database "…" was denied` (or sheet) | The user chose Deny on the access prompt | Ask the user to reload the tool/view (Reload tool) and choose Allow |
| `Row "…" was not found — it may have been renamed or deleted` | The tool used a database row id from before a `title` rename | Re-read `rows()` after renaming and use the new ids |
| `attach_tool_sheet`/`edit_html_tool`: "tool.meta.json exists but could not be read" | The file timed out (cloud-streamed drive), is mid-sync, or isn't valid JSON | Nothing was written — retry; if it keeps failing, ask the user to check the file. Never overwrite `tool.meta.json` yourself — that drops the tool's sheets |
| `No sheet named "…"` / `matches N sheets` | A name-only sheet spec found no sheet, or several | Nothing was written — pass `columns` to create it, check names with `list_sheets`/`find_sheets`, or ask the user which one and rename the other |
| "The hillnote-baseline block … cannot be edited" | `searchText` touched the injected baseline | Override its CSS variables in your own `<style>` instead (e.g. `:root { --radius: 12px }`) |
| `add_html_tool`: "already exists" | Tool name taken | Edit the existing tool (`replace_in_html_file`) or pick a different `toolName` |
| Tool doesn't show in the app's ToolForge grid | `registered: false`, or the app hasn't synced/refreshed yet | Harmless — the tile appears from the tool's metadata after the app's next sync/refresh |

## Canvases & moodboards

| Symptom | Meaning | Remedy |
|---|---|---|
| Canvas renders wrong or was touched by a text edit | Element JSON corrupted | Only the app can fix it: ask the user to open it in Hillnote. Never repair canvas JSON yourself |
| Moodboard tool: "file is corrupt (the ```moodboard fence does not contain valid JSON)" | A hand edit broke the fence; the app keeps showing its last good board and warns | Fix the JSON in Files mode (validate before saving), or with the user's consent `clear_moodboard` with `confirm: true` to reset, then rebuild |
| Moodboard tool: "This moodboard is locked (view-only)" | The user locked the board (`board.locked`) | Ask them to unlock it (lock button in the board's right rail); never edit the file around the lock |
| "Moodboard file not found" | The tools never create boards | `add_document` titled `Name.moodboard.md` with no content, then retry with the returned `moodboardPath` |
| `issues` in a `draw_on_moodboard` / `add_moodboard_items` result | Items overlap, are cut off or hidden behind a box | Move them with `update_moodboard_items`, or redraw the diagram with the same `name`; check with `render_moodboard` (local, app running) |
| Items or connectors missing after `add_moodboard_items` | Dropped by validation (non-portable image `src`, non-http link, bad swatch hex, unknown connector endpoint, self-loop) | Read the result's `warnings`, fix the field, re-add — see `references/moodboard.md` |
| `clear_moodboard` refuses | Non-empty board without `confirm: true` | Confirm with the user, then pass `confirm: true` |
| Content tool rejects a `.canvas.md` / `.moodboard.md` | Text tools are blocked on these files | Moodboards: use the moodboard tools (`get_moodboard_guide` first). Canvases: only the app edits them |

## App UI tools (local)

- **"Hillnote app is not running (or its Agent Bridge is disabled)"** — the UI tools (`open_document`, `scroll_to`, `show_slide`, `open_database`, `open_view`, `notepad`, `build_mode`, `check_preview`, `render_moodboard`, …) and their commands (`hillnote open`, `say`, `app …`, `preview check`, `board render` — exit code 4) need the app open on the same machine. Ask the user to open Hillnote (and check Settings → Connections → Agent interface control), then retry. Every file tool still works without it.
- **"The user declined interface control for this client"** — the user blocked your client in the first-use approval dialog. Don't retry; keep working with file tools and mention they can change it in Hillnote Settings → Connections.
- **`scroll_to`/`highlight_text` "not found"** — the document changed since you last read it. `read_document` again and use exact current text.
- **`highlighted: false` with a note** — the scroll worked but the visual pointer didn't persist (the document reloaded mid-flight); call `highlight_text` again if the user still needs it.

## Sync (local MCP with sync tools)

`pull_changes` before a session on a shared workspace → edit → `push_changes`. If a push reports conflicts: `list_conflicts`, show them to the user, apply their choice with `resolve_conflict`. A push rejected for a version mismatch means pull first. Storage-quota errors on push mean the account's plan storage is full — the user frees space or upgrades in the app.

## Publishing (Hillnote app only — no MCP tool publishes)

Requirements the app enforces, in order: an account **username** is set → the plan allows publishing (free plans don't; paid tiers have per-plan site limits) → the workspace has been **synced** at least once → the workspace name yields a valid, non-reserved slug (`index`, `sitemap`, `resources`, `search-data` are reserved; the name needs at least one letter/number).

- Build lifecycle: queued → building → published (or failed). Failed builds can simply be published again.
- The site appears at `sites.hillnote.com/<username>/<workspace-slug>`; the user's public profile lists their published sites.
- "Too many publish requests" — publishing is rate-limited; wait and retry later.
- "Already published" — use the app's update/rebuild action instead of publishing anew.
- Custom domains are a top-tier plan feature and require the site to be published first; DNS/SSL verification can take time after adding one.

When asked to "publish this", prepare the content, then hand off: tell the user the checklist above and where to click (workspace → publish), and what URL to expect.

## When to hand off to the app

Only the Hillnote app can: set up kanban automation for a **remote-only** connection, edit a canvas, unlock a locked moodboard, add media files, enable plugins, manage the account/plan, and publish. Say so early, finish everything you *can* do, and leave the user a precise list of the remaining clicks.
