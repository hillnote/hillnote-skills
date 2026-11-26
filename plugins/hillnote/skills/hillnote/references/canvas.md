# Canvases (`.canvas.md`)

A canvas is an Excalidraw drawing stored in a `.canvas.md` file — diagrams, whiteboards, flowcharts. The file's internals are machine-managed JSON.

**Canvases are edited only in the Hillnote app.** Neither MCP server has canvas tools, and the `hillnote` command has no `canvas` command. Never point text-editing tools (`replace_content`, `insert_content`, `delete_content`, file writes) at a `.canvas.md`: the servers refuse it, and a raw edit corrupts the drawing.

When the user wants a diagram:

- **One you make yourself:** a ```mermaid fence in a regular document (see `references/documents.md`), or a moodboard with frames, shapes and connectors (see `references/moodboard.md`).
- **A change to an existing canvas:** say what to change and let the user do it in the app. You may read the file to see what it shows, but never write it.
