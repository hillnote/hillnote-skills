# Hillnote skills

Agent skill and connector for [Hillnote](https://hillnote.com), the markdown workspace app.

The skill teaches your agent Hillnote's formats and tools: documents, slide decks, databases and kanban boards, sheets, moodboards and diagrams, libraries and HTML tools, and the Hillnote app itself. It also has your agent search a workspace before answering questions about your own projects and notes.

It follows the [Agent Skills specification](https://agentskills.io/specification), so it works with any agent that supports skills, including Claude Code, Claude, ChatGPT and Codex, Cursor, Antigravity, Gemini CLI, GitHub Copilot, OpenCode and [many more](https://agentskills.io/clients).

## How your agent connects

Choose by where your agent runs:

| Your agent runs | Connect with | Reaches |
| --- | --- | --- |
| On the computer with your Hillnote workspaces, and can run commands | **The `hillnote` command**, built into the desktop app | Every workspace on that computer, and the Hillnote app itself |
| Anywhere else: web and phone chat apps, another computer | **Cloud MCP**: `https://hillnote.com/mcp` | Every workspace you have synced |

**The `hillnote` command** works on the workspaces on your computer with nothing to configure. Your agent's edits show in Hillnote at once, and Hillnote syncs them as usual. It can also work the app for you: open a document at a section, jump to a slide, show a kanban view, or jot something in your Notepad. It is already available in the terminals Hillnote opens.

**Cloud MCP** reaches every workspace you have synced, from anywhere, even a phone, without the Hillnote app. This plugin adds it for you in Claude, Codex, Cursor and Gemini CLI. The first time your agent uses it, you sign in to Hillnote in your browser and allow access (the page shows whether your agent asked for read-only or read & write). See the [Cloud MCP docs](https://hillnote.com/docs/mcp/cloud-mcp).

Both can be on at once: the skill uses the command for workspaces on your computer and Cloud MCP for the rest.

**Hillnote can set up your agent for you.** In **Settings → Connections**, press **Configure** next to your agent app:

- In the **Local MCP** card, it adds this skill and the `hillnote` command, and keeps the skill up to date with each Hillnote release. For Claude Desktop, it sets up Hillnote's local MCP server.
- In the **Cloud MCP** card, it adds this skill and Cloud MCP. For Claude Desktop, it opens Claude's connector settings, so Hillnote also works in Claude on your phone.

Two other ways exist for setups these don't fit: the [local MCP server](https://hillnote.com/docs/mcp/local-mcp), for desktop chat apps that can't run commands, and direct access to the workspace folder. The skill works out which one your agent has.

## Install

### Claude

For the Claude Code CLI:

```sh
claude plugin marketplace add hillnote/hillnote-skills
claude plugin install hillnote@hillnote-skills
```

From within a Claude Code session:

```sh
/plugin marketplace add hillnote/hillnote-skills
/plugin install hillnote@hillnote-skills
```

On Claude Code 2.1.275 or later, one line does both:

```sh
/plugin install hillnote --marketplace hillnote/hillnote-skills
```

To get updates later, run `claude plugin update hillnote@hillnote-skills`.

For claude.ai and the Claude desktop app, follow the steps at [hillnote.com/claude](https://hillnote.com/claude).

### ChatGPT and Codex

```sh
codex plugin marketplace add hillnote/hillnote-skills
```

Then install Hillnote from the plugin directory in Codex or the ChatGPT desktop app.

### Antigravity

In the Antigravity CLI, run:

```sh
agy plugin install https://github.com/hillnote/hillnote-skills
```

### Gemini CLI

```sh
gemini extensions install https://github.com/hillnote/hillnote-skills
```

### Cursor, GitHub Copilot, OpenCode and other agents

Install with [npx skills](https://github.com/vercel-labs/skills), which asks which agents to install into:

```sh
npx skills add https://github.com/hillnote/hillnote-skills
```

To install by hand, copy the folders in `plugins/hillnote/skills/` into your agent's skills folder, for example `~/.copilot/skills/` for GitHub Copilot. These routes install the skill only. If your workspace is synced, also add `https://hillnote.com/mcp` as an MCP server in your agent.

## Skills

| Skill | What it does |
| --- | --- |
| [hillnote](plugins/hillnote/skills/hillnote) | Write and organise documents, slide decks (`.slides.md`), databases and kanban boards, sheets, moodboards and diagrams (`.moodboard.md`), libraries and HTML tools; answer questions from your own notes; show things in the Hillnote app; build sidebar plugins; fix sync and connection problems |

## Requirements

- **Cloud MCP** needs a Hillnote account and a workspace synced from the Hillnote app at least once.
- **The `hillnote` command** needs the Hillnote desktop app on the same computer. It runs on the app's own runtime, so you don't need Node. Commands that work the app, such as opening a document, presenting a slide or writing to your Notepad, need the app open.
- The skill itself only describes formats and tools. It works in any agent that can read skills.

## Privacy

The skill sends nothing by itself. When your agent uses Hillnote, the notes it reads become part of the conversation and are processed by the AI model you use. Cloud MCP reaches only the workspaces you have synced, with the access you chose when you signed in. Review your AI provider's privacy policy before pointing an agent at sensitive workspaces. Hillnote's privacy policy is at [hillnote.com/privacy](https://hillnote.com/privacy).

## Release maintenance

Check the repo before pushing:

```sh
node scripts/validate.mjs
```

Update the version in every manifest with:

```sh
./scripts/bump.sh patch
```

The script also accepts `major`, `minor`, or an explicit version like `1.1.0`.

Gemini CLI installs from the latest GitHub release, so publish a release for each version, tagged with the version number (for example `v1.0.1`). The `Gemini release archive` workflow then attaches `hillnote-gemini.tar.gz`, which has real copies of the skills. Don't attach other files to a release: Gemini CLI only picks a file when there is exactly one, and otherwise falls back to the source archive, which has no Gemini manifest. To build the archive locally, run `./scripts/package-gemini.sh`.

## License

[MIT](LICENSE)
