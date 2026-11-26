# Hillnote

Work in your [Hillnote](https://hillnote.com) workspaces from your AI agent. This plugin bundles the `hillnote` skill and Hillnote's Cloud MCP connector.

The skill teaches your agent Hillnote's formats and tools: documents, slide decks, databases and kanban boards, sheets, moodboards and diagrams, libraries and HTML tools, and the Hillnote app itself. When you ask about your own projects, plans or decisions, your agent searches your workspace first and names the notes it used.

## Install

In Claude Code:

```sh
/plugin install hillnote --marketplace hillnote/hillnote-skills
```

For every other agent, see the [repository README](https://github.com/hillnote/hillnote-skills#install).

## How it connects

- **On the computer with your workspaces**, agents that can run commands use the `hillnote` command in the Hillnote desktop app. Their edits show in Hillnote at once, and they can open documents, slides and boards in the app for you. Set it up in Hillnote under **Settings → Connections**: press **Configure** next to your agent app in the **Local MCP** card.
- **Anywhere else**, Cloud MCP (`https://hillnote.com/mcp`), which this plugin adds, reaches your synced workspaces, even from a phone. The first time your agent uses it, you sign in to Hillnote in your browser and choose read-only or read & write.

## Links

- [Cloud MCP docs](https://hillnote.com/docs/mcp/cloud-mcp)
- [Skill docs](https://hillnote.com/docs/mcp/claude-skill)
- [Support](https://hillnote.com/support)
- [Privacy policy](https://hillnote.com/privacy)

MIT licensed.
