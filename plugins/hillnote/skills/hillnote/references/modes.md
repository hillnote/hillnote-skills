# Access modes

The same Hillnote workspace can be reached four ways. Formats are identical everywhere; only capabilities and identifiers differ.

**The rule: the `hillnote` command for workspaces on this computer, Cloud MCP for everything else.**

- **Agent on the computer that holds the workspace, with a shell** → the `hillnote` command — even when the workspace is also synced. Edits show in the app at once, the App interface works straight after, and the app's auto-sync takes the changes to the cloud.
- **Agent anywhere else** — web and phone chat apps, another computer, no shell → Remote MCP (Cloud MCP), for the workspaces the user has synced. It works without the Hillnote app.
- **Desktop chat app on that computer, no shell** → Local MCP: the command's operations as tools.
- **Bulk or structural work on the user's machine** → Files mode, alongside the command.

**Setting it up** happens in Hillnote, **Settings → Connections**. **Configure** next to an agent app in the **Local MCP** card adds this skill and the `hillnote` command (for Claude Desktop: Hillnote's local MCP server). In the **Cloud MCP** card it adds this skill and Cloud MCP to the agent app; for Claude Desktop it opens Claude's own Connectors settings, where the connector also reaches Claude on the phone. An app can be connected both ways — the rule above still decides which route each workspace takes.

## CLI — the `hillnote` command

The Local MCP server's operations as a shell command. Same machine, same files, same validation — but nothing is loaded into your context until you run `hillnote --help`, long content travels in files and pipes, and one command (`hillnote status`) replaces the orientation sequence.

- **Availability**: on `PATH` in every terminal the Hillnote app opens (`$HILLNOTE_CLI` is the absolute-path fallback there). For their own terminal and agent apps, the user sets it up once: **Settings → Connections → Local MCP → Configure** next to their agent app adds this skill and the command in one step (the **Command line** card adds just the command). Then they open a new terminal window or agent session. Check with `hillnote --version`.
- **No configuration**: it needs no MCP client config and no Node install — it runs on the Hillnote app's own runtime. File commands work with the app closed; only the App interface commands (`open`, `say`, `app …`, `preview check`, `board render`) need it open.
- **Workspace**: the one containing your current folder, else `-w <name|path>`.
- **Use it for every workspace on this computer** — over Local MCP whenever you have a shell, and over Remote MCP even when the workspace is synced. It never talks to hillnote.com: for workspaces that aren't on this computer, use Remote MCP.
- **Everything, the app included**: documents, databases, sheets, libraries and playbooks, moodboards (`board draw` for diagrams), HTML tools, recipes, kanban automation, trash, the guides, and the running app — `open` (documents, sections, slides, databases, sheets, libraries), `say`, `app state`, `app view` (Chat, Terminal, Files, Browser), `app notepad`, `app build`, `preview check`.
- Details, the `--where` filter grammar, write guards and exit codes: `references/cli.md`.

## Remote MCP — hillnote.com/mcp

The cloud server, which Hillnote calls **Cloud MCP**. The user connects it as a remote MCP connector (claude.ai, Claude Desktop, ChatGPT or any MCP client; the Hillnote plugin adds it automatically, and **Settings → Connections → Cloud MCP → Configure** adds it to agent apps on the user's computer) and authorizes via OAuth in the browser.

- **Only synced workspaces exist here.** A workspace must have been synced from the Hillnote app at least once; otherwise `list_workspaces` won't show it. Remedy: open the app and sync the workspace, then retry.
- **On the computer that holds the workspace, prefer the `hillnote` command** when you have a shell — see the rule above.
- **Scopes:** the OAuth grant is `read` or `read_write`. With a read-only token every write tool fails with `Write access required. This token only has "read" scope.` — the fix is to reconnect/re-authorize choosing read & write, not to retry.
- **Writes land in the cloud copy** and flow to the user's devices the next time the app syncs. Tell the user their app will show the change after it syncs.
- **Showing the user**: no App interface here — instead `show_document` (a document or deck), `show_table` (a sheet or database) and `show_moodboard` render an interactive view in the conversation, in clients that display MCP Apps views. `render_document`, `render_moodboard` and `get_asset_urls` serve those views; don't call them yourself.
- **What's absent here:** media upload, plugin installation, publishing, kanban automation, the trash and the App interface. Offer the app, the `hillnote` command or Files mode for those (exact gaps: SKILL.md table). The database tools are all here; deletes (`delete_document`, `delete_rows`, `delete_column`, `delete_database`) are permanent — no trash.
- Responses are size-capped and searches/scans are bounded on very large workspaces — use the pagination playbook in `references/tool-reference.md`.

## Local MCP — `hillnote-mcp`

A stdio server that reads the Hillnote app's workspace list on the same machine and works on the files directly.

- **Setup** (public docs at hillnote.com/docs): install the Hillnote app; then either let **Settings → Connections → Local MCP → Configure** set it up (it writes the config for Claude Desktop; for agents that can run commands it sets up the `hillnote` command instead), copy the config shown there into the client, or install with `npm install -g @hillnote/mcp-server` and add to the MCP client config:
  ```json
  { "mcpServers": { "hillnote-app": { "command": "hillnote-mcp" } } }
  ```
  Requires Node ≥ 18. **Restart the MCP client** (e.g. Claude Desktop) after config changes.
- **Workspace identifiers** are names or folder paths, not cloud IDs. `list_workspaces` shows what the app knows about.
- **Writes hit the files immediately** — the running app sees them live.
- **App interface tools** drive the running app's window: open and scroll documents, jump slides, open databases, sheets and libraries, switch the main view, write to the Notepad, drive Build mode, check a Builds preview, post activity. They need the app open and the user's approval on first use (`references/tool-reference.md` → App interface).
- **Sync etiquette** (when the sync tools are present): on a workspace the user also edits elsewhere, `pull_changes` before a work session, `push_changes` when they want edits in the cloud, and surface `list_conflicts` results to the user rather than resolving silently.

## Files mode — direct access to the workspace folder

A Hillnote workspace is a plain folder; with filesystem access (e.g. Claude Code on the user's machine) you need no MCP at all. This is a first-class mode, not a fallback: file edits are immediately visible to the running app, and everything MCP can express is ultimately just these files.

**Finding the workspace on disk:** it lives wherever the user created it (commonly under Documents or a cloud-drive folder). Ask the user for the path, or search for `documents-registry.json` and confirm the folder with them before editing — multiple workspaces are common.

**Prefer direct file editing when you're on the user's machine** for bulk or structural work — mass renames/reorganization, editing many documents at once, adding media, installing plugins, or mixing Hillnote content with git, scripts, or other tools. MCP still earns its keep for the guide tools (`get_slides_story_guide`, `get_moodboard_guide`, `get_html_tool_guide`) and HTML-tool writes (the design baseline is injected only on MCP/app writes) — combining modes is fine; they operate on the same files.

```
<workspace>/
├── documents/                 # all content: .md docs, .slides.md, .canvas.md,
│   │                          #   .moodboard.md, database folders, quicknotes, imports
│   └── topics.md              # auto-generated #topic → documents index
├── resources/                 # media: images/, pdfs/, html/ (HTML tools), files/
├── plugins/                   # sidebar plugins (one folder per plugin)
├── documents-registry.json    # metadata index: titles, tags, dates, paths
├── ai_prompt_overrides.json   # saved recipes + persona instructions
└── agents.md / CLAUDE.md      # auto-generated orientation (don't hand-maintain)
```

Rules for working directly:

- **The filesystem is ground truth; the registry is an index.** Read `documents-registry.json` for fast orientation (filenames may differ from display titles), but don't hand-edit it — the app regenerates it and picks up new files on its next scan.
- Put new documents under `documents/`, media under the matching `resources/` subfolder, and reference media by relative path (`resources/images/…`).
- Leave auto-generated files alone: `topics.md`, `agents.md`, `CLAUDE.md`, activity logs.
- Preserve YAML frontmatter and `<!-- COMMENTS_SECTION_START/END -->` blocks when editing (see `references/documents.md`).
- Never write a `.canvas.md`; canvases are edited only in the app (see `references/canvas.md`). A `.moodboard.md` may be edited only per `references/moodboard.md` (one JSON object per line, append only, never touch `viewport`/`version`/`strokes`).
- Guide tools don't exist here — the condensed grammar in `references/slides.md` / `references/moodboard.md` is your source.

## Setting things up for the user

You may fix a missing connection yourself instead of only sending the user to Settings. **Always ask the user first**: say what you will change and where, and wait for a yes before you change a config file, add an MCP server, touch their PATH or shell files, or start a sign-in. If they would rather do it themselves, give them the steps instead. When they are at the Hillnote app, the simplest route is **Settings → Connections → Configure** next to their agent app: one step, and Hillnote keeps this skill up to date.

**The `hillnote` command isn't on PATH.** Hillnote writes it to a fixed place every time the app launches, whether or not the user installed it:

- macOS: `~/Library/Application Support/Hillnote/bin/hillnote`
- Windows: `%APPDATA%\Hillnote\bin\hillnote.cmd`
- Linux: `~/.config/Hillnote/bin/hillnote`

If it is there, run it by its full path (quote it: the macOS path has a space). Nothing on the computer changes, so no setup is needed; tell the user you are using Hillnote's built-in command. Not there → Hillnote isn't installed, or hasn't been opened since it was installed: ask the user to open it once. To make `hillnote` permanent, ask, then either send them to **Configure** in Settings → Connections → Local MCP (adds this skill too) or, with their OK, link it into a folder already on their PATH (macOS/Linux: `ln -s "<that path>" ~/.local/bin/hillnote`, after checking `~/.local/bin` is on PATH).

**Cloud MCP isn't connected.** Check it would help first: it reaches only the workspaces the user has synced. If they agree, add it with your own app's command. It takes effect in a new session, and the first time it is used the user signs in to Hillnote in their browser and clicks **Allow access** (the page shows whether your app asked for read-only or read & write). Name it `hillnote` (the local server is `hillnote-app`), so the two can sit side by side.

| Agent | How to add Cloud MCP |
|---|---|
| Claude Code | `claude mcp add --transport http --scope user hillnote https://hillnote.com/mcp`. The user then signs in from `/mcp` in a new session, or with `claude mcp login hillnote` in their terminal |
| Codex | `codex mcp add hillnote --url https://hillnote.com/mcp`. It starts the sign-in at once and waits for it, so it is best run by the user in their terminal |
| Gemini CLI | `gemini mcp add --transport http --scope user hillnote https://hillnote.com/mcp` |
| Cursor | merge `"mcpServers": { "hillnote": { "url": "https://hillnote.com/mcp" } }` into `~/.cursor/mcp.json` |
| VS Code | merge `"servers": { "hillnote": { "type": "http", "url": "https://hillnote.com/mcp" } }` into the user `mcp.json` |
| Zed | merge `"context_servers": { "hillnote": { "url": "https://hillnote.com/mcp" } }` into its `settings.json` (it may hold comments: edit, never rewrite) |
| Others | the app's MCP settings — or **Configure** in Settings → Connections → Cloud MCP |

Merging means keeping every other entry in the file exactly as it was.

**Chat apps without a shell** (claude.ai, the Claude apps, ChatGPT) can't be set up from inside the chat. Give the user the steps: their Connectors settings → add a custom connector → paste `https://hillnote.com/mcp` → sign in to Hillnote. In Claude a connector added once works on every device, the phone included.

**A workspace isn't in Cloud MCP.** It hasn't been synced. Ask the user to open it in Hillnote, click the **Sync** tab in the sidebar, then **Sync this Workspace**; it appears once the upload finishes.

**Before your first App interface call** (`open_document`, `hillnote open`, …), tell the user Hillnote will ask them once to approve your app.

## Choosing and escalating

- Task fits your mode → just do it.
- Same workspace on this computer and in Cloud MCP → the `hillnote` command (or Local MCP / Files): Cloud MCP writes reach this computer only on the next sync, so what you show the user is stale and can clash with what they have open.
- Several modes available → the command for anything on this computer, direct files for bulk/structural work there, Remote MCP for workspaces that are only in the cloud. Mixing within one task is fine — all modes act on the same files.
- Task needs a missing capability → name the gap and offer the concrete alternative:
  - "Your remote connection can't set up kanban automation (an agent per status, scheduled card moves) — that runs in the Hillnote app. I can give you the exact steps, or if you're on the computer with the app, set it up directly with the `hillnote` command (or the local MCP server)."
  - "Plugins install as files in the workspace. I'll generate `manifest.json` and `index.html` — save them into `plugins/<id>/` in your workspace folder."
  - "Publishing happens in the Hillnote app (it needs your account); here's what to click and what to expect."
- Never silently degrade (e.g. don't fake a database by writing a lone markdown table when the user asked for a tracker — say what you can and can't do).

## Workspaces and collaborators

- Multiple workspaces are normal. When the target is ambiguous, show `list_workspaces` results and ask, rather than picking one.
- On remote, `list_collaborators` shows who else can edit (owner, collaborators, pending invites). On shared workspaces expect concurrent edits: re-read before writing, keep diffs small, and retry once on a version-conflict error (see `references/troubleshooting.md`).
