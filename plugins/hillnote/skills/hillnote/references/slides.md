# Slide decks (`.slides.md`)

A deck is one markdown file whose title ends in `.slides.md`. Slides render on a 1280×720 (16:9) stage. The user sees it in the slide viewer, plays it with **▶ Present** (full screen or a presenter view), and can **Edit** slides in a visual designer — every surface reads and writes this same markdown, so text edits are always safe.

## Anatomy

```markdown
---
type: slides
---

June 2026

~

# Launch Review

What shipped, what we learned

~

Ana Torres

***

## The one-line summary

- Shipped on time
- Retention up

***

> "Best quarter yet."
> — A happy customer
```

- Frontmatter `type: slides` (both `---` and `***` fences parse; write `---`).
- `***` on its own line separates slides (`---` also works; keep whatever the file already uses).
- The first slide is the cover and is styled automatically — leave it unstyled. If it ends with an image, the cover becomes 2/3 text + 1/3 image.
- There is no speaker-notes syntax: anything you write on a slide is shown. Put presenter notes in a separate document if asked.

## Deck theme, slide numbers, footer (frontmatter)

```markdown
---
type: slides
theme: mono
paginate: true
footer: Acme · Q3 review
---
```

| `theme:` | Look |
|---|---|
| *(omit)* | Auto — follows the app's light/dark mode, gradient cover (the default) |
| `light` | Paper — clean white, blue accent |
| `dark` | Midnight — deep navy, sky-blue accent (stays dark when projected) |
| `mono` | Black on white, thin titles, uppercase section labels |
| `sand` | Warm cream, terracotta cover and accents |
| `ink` | Bold — black, heavy titles, yellow accent |

- The theme restyles every slide at once (colours, title weight, cover, charts, diagrams) — to change a deck's look, set `theme:` instead of colouring slides one by one. Leave it out unless the user asks for a look or the content clearly calls for one. `minimal`, `auto` and unknown values all mean the default — don't write them.
- `paginate: true` numbers every slide except the cover; `footer:` adds a small line at the bottom of every slide except the cover.
- Text is slide-sized (titles ≈56px, body ≈22px) and shrinks automatically to fit a dense slide — don't rely on it: **one idea per slide, at most ~6 short bullets**; split long content across slides.
- Tables render with their header row on top; numbered lists keep their numbers.

## The two-pass method (non-negotiable)

**Pass 1 — story.** Call `get_slides_story_guide` and follow it: pick a narrative structure (it offers eight — hero's journey, the mountain, sparklines, in-medias-res, etc.), then write the complete deck as plain content. One idea per slide; headlines that tell the story on their own; 3–5 bullets; paragraphs ≤2 sentences; data over claims. **No layout markers, no images, no colours, no `theme:` in this pass.**

**Pass 2 — visuals.** After the user approves the story (or asks for a polished deck outright), call `get_slides_visual_guide` with the deck's path and enhance slides **in batches of 3–5** using targeted `replace_content` edits — preserve every word of the story, add markers/media around it. The remote server's guides are short summaries; this file is the full grammar.

## Visual grammar (condensed — prefer the live local guide when available)

Column rule: text blocks (headings, paragraphs, lists, quotes, code, tables, diagrams) stack in one column; **each image/video creates its own column** (text + 2 images = 3 columns). Columns without a width share the remaining space equally.

| Marker | Effect |
|---|---|
| `~` | Vertical spacer — spreads sections top/middle/bottom (great on covers) |
| `~inline` | Next image/video/visualization stays in the current column (below the text) |
| `~split` | Force next text block into a new column |
| `~column1-2/3` | Set column N's width (any column, any fraction) |
| `~banner` | Content above it spans full width; the rest becomes columns |
| `~split-column` | Split the current column into two stacked sub-blocks with independent styles |
| `~bg-1a1a2e` / `~bg-<image-url>` / `~bg-resources/images/…` | Slide background (hex colour, web image or workspace image) |
| `~text-ffffff`, `~text-h1-ffcc00`, `~text-h2-…`, `~text-h3-…`, `~text-body-cccccc` | Slide text colours (all, or one level; body = paragraphs, lists, quotes, table cells) |
| `~bg-column-…` / `~text-column-…` (`~text-column-h1-…`, `~text-column-body-…`) | Same, scoped to the current column |
| `~line-horizontal[-hex]` | Decorative horizontal separator |
| `~line-vertical[-left\|-right][-hex]` | Decorative vertical line (centred by default) |
| `~bar` `~line` `~pie` `~area` (before a table) | Render the table as a chart — numeric data only; plain tables need no marker |
| `~visualize` (before an `html` fence) | Live sandboxed HTML/SVG/JS; theme-aware via CSS vars `--text-color`, `--bg`, `--muted`, `--border`, `--accent` |
| ` ```mermaid ` fence | Diagram (flowchart, sequence, gantt, class, state, ER, pie, mindmap) — adapts to light/dark |

Media: `![alt](https://images.unsplash.com/photo-ID?w=1280&h=720&fit=crop)`, workspace images by relative path (`resources/images/…`), video as `![Title](https://youtube.com/watch?v=ID)` / `youtu.be/ID` / `vimeo.com/ID` or the shorthand `[youtube:Title](ID)`.

## Taste rules (from the visual guide — they matter)

1. Don't style the cover slide; it's already styled.
2. Custom colours only when a slide genuinely needs contrast/emphasis (e.g. one dark statement slide) — for the whole deck's look, use `theme:`.
3. Never `~split` a single paragraph or one list — only genuinely separate content blocks.
4. Not every slide needs decoration; clean text beats clutter.
5. Help the audience *see* the point — prefer one strong visual (image/chart/diagram) over a wall of text or three fillers.

## Editing existing decks

Read the deck first; keep its separator style and its frontmatter (theme, paginate, footer); target one batch of slides per `replace_content` (the existing slide text as `searchText`). After edits, sanity-check: separators intact, no marker before the cover, charts only on numeric tables. Local MCP: `show_slide` puts a slide on the user's screen when they ask to see it.

## Review checklist

Story reads from headlines alone · one idea per slide · ≤6 short bullets · chart types fit the data (bar = compare, line = trend, pie = proportion) · markers used sparingly · cover untouched · theme only if asked.
