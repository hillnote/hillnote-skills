# Documents

Regular Hillnote documents are `.md` files under `documents/`. Standard CommonMark plus the dialect below. Identical in every access mode. Special types are chosen by filename suffix — `.slides.md` (decks), `.canvas.md` (canvases), `.moodboard.md` (moodboards) — and have their own references; canvases and moodboards hold machine-managed JSON, so never edit them as prose.

## Frontmatter

Optional YAML frontmatter carries metadata:

```markdown
---
title: Quarterly Review
tags: [finance, q3]
emoji: 📊
description: One-line summary shown in listings
---

# Quarterly Review
…
```

The filename may differ from the display title — the registry holds the canonical title, so resolve documents through `read_registry` or search, not by guessing filenames.

## Hillnote markdown dialect

| Syntax | Renders as |
|---|---|
| `==text==` | Highlight |
| `<color:#e03131>text</color>` | Colored text (hex) |
| `#topic` (inline in prose) | Topic chip linking notes by theme |
| `- [ ]` / `- [x]` | Task checkboxes |
| ` ```mermaid ` fence | Live mermaid diagram |
| `[youtube:Title](videoId)` | Embedded YouTube player |
| `[web:Title](https://…)` | Embedded web page |
| `[html:Title](resources/html/tool/index.html)` | Embedded HTML tool |
| `[^n]` | Superscript |
| `:::toc "Table of Contents"` … `:::` | Auto-generated inline TOC |
| `:::tabs` `:::tab "Title"` content `:::endtab` `:::endtabs` | Tabbed panels |
| `![alt](resources/images/pic.png)` | Image from workspace resources |
| Standard tables, quotes, code fences, links | As usual |

**Topics vs tags:** `tags` in frontmatter categorize a document; inline `#topics` cross-link notes by theme across the workspace (the auto-generated `documents/topics.md` maps them). To add a note to a topic, just write the `#topic` in its prose.

## Not supported — use substitutes

- **No LaTeX/math** — `$…$` stays literal. Use a code fence, a mermaid diagram, or plain-text notation.
- **No callout/admonition blocks** (`:::note`, `> [!NOTE]`) — use a blockquote, a highlighted line, or a single-tab `:::tabs` block.
- Raw HTML beyond the documented embeds is not part of the dialect; keep to the table above so content round-trips through the editor cleanly.

## Comment blocks — preserve verbatim

Documents may end with a machine-managed section:

```
<!-- COMMENTS_SECTION_START -->
… comment blocks …
<!-- COMMENTS_SECTION_END -->
```

These are user comments managed by the app. Never edit, reformat, or delete anything between the markers; add your content above the section.

## Editing workflow

1. **Read first** — `read_document` (line ranges for long files).
2. **Smallest sufficient edit** — `replace_content` with exact copied `searchText` for changes; `insert_content` for additions (`afterLine` on remote for precise placement); `delete_content` with `expectedContent` as a safety check.
3. **Verify** if the edit was intricate — re-read the touched range.
4. On shared (collaborative) workspaces, keep diffs small and re-read before writing; concurrent edits cause version conflicts (see `references/troubleshooting.md`).

Rewriting an entire document via one giant `replace_content` is a last resort — prefer targeted edits so user changes elsewhere in the file survive.

## Organization

- **Folders**: pass `folder` on `add_document`, reorganize with `move_document` (remote) or file moves (Files mode).
- **Quicknotes**: rapid-capture scratch notes (a `quicknotes` area) — treat as informal; summarize or promote them into proper documents when asked to organize.
- **Imports**: converted files (PDF/DOCX/etc.) land in an `imports` folder — often messy markdown that benefits from a cleanup pass.
- **Naming**: give documents clear titles and an `emoji`; they're the user's sidebar.

## Media

Reference media by relative path (`resources/images/…`, `resources/pdfs/…`). **No MCP tool uploads binary media** — files get there via the app or Files mode. When authoring remotely, either use images already in `resources/`, link external images by URL, or tell the user where to drop the file and reference that path.

## Writing quality

Match the document's existing tone and structure. For new documents: frontmatter with a good title/emoji/tags, one `#` heading, scannable sections, tables for enumerable facts, task lists for actionables, and topics (`#word`) where the workspace already uses them — check how sibling documents are written first.
