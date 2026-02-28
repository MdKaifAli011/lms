# All Lexical Features & Tools

This project uses the **full Lexical Playground** (same as [playground.lexical.dev](https://playground.lexical.dev)), so you get every editor feature Lexical provides. Below is the complete list.

---

## Core (lexical)

- **Editor state** – Immutable state, undo/redo, commands
- **Nodes** – Paragraph, text, root, element hierarchy
- **Selection** – Range, node selection, caret
- **Serialization** – Export/import editor state as JSON

---

## Text & Formatting

| Feature | Package | What you get |
|--------|---------|----------------|
| **Rich text** | `@lexical/rich-text` | Headings (H1–H6), quote blocks, paragraph blocks |
| **Plain text** | `@lexical/plain-text` | Plain text only (no blocks) |
| **Bold / Italic / Underline / Strikethrough** | `@lexical/selection` | `$patchStyleText`, format toggles |
| **Code** | `@lexical/code` | Inline code, code blocks, syntax highlighting (Prism) |
| **Code (Shiki)** | `@lexical/code-shiki` | Code blocks with Shiki syntax highlighting |
| **Subscript / Superscript** | `@lexical/selection` | Text transform |
| **Text color / Background** | `@lexical/selection` | Inline styles |
| **Font family / Font size** | Custom (Toolbar) | Dropdowns in playground |
| **Mark (highlight, etc.)** | `@lexical/mark` | Decorator nodes for highlights/keywords |

---

## Blocks & Structure

| Feature | Package | What you get |
|--------|---------|----------------|
| **Bullet list** | `@lexical/list` | Unordered lists |
| **Numbered list** | `@lexical/list` | Ordered lists |
| **Checklist** | `@lexical/list` | Checkable list items |
| **Nested lists** | `@lexical/list` | Indent/outdent |
| **Tables** | `@lexical/table` | Insert table, merge/split cells, resize, alignment |
| **Layout columns** | Custom (LayoutPlugin) | 2/3/4 column layouts |
| **Collapsible** | Custom (CollapsiblePlugin) | Expand/collapse sections |
| **Horizontal rule** | `@lexical/react` (LexicalHorizontalRuleNode) | Divider line |
| **Page break** | Custom (PageBreakPlugin) | Page break node |

---

## Links & Embeds

| Feature | Package | What you get |
|--------|---------|----------------|
| **Links** | `@lexical/link` | Insert/edit/remove links, auto-detect URLs |
| **Auto-link** | `@lexical/link` + AutoLinkPlugin | URLs become links as you type |
| **Images** | `@lexical/react` + ImagesPlugin | Upload, URL, resize, caption, alignment |
| **YouTube** | Custom (YouTubePlugin) | Embed YouTube videos |
| **Twitter/X** | Custom (TwitterPlugin) | Embed tweets |
| **Figma** | Custom (FigmaPlugin) | Embed Figma frames |
| **Excalidraw** | Custom + `@excalidraw/excalidraw` | In-editor whiteboard/diagrams |
| **Polls** | Custom (PollPlugin) | Inline poll blocks |
| **Sticky notes** | Custom (StickyPlugin) | Draggable sticky notes |
| **Date/Time** | Custom (DateTimePlugin) | Date/time picker block |
| **GIF** | AutoEmbedPlugin | GIF embed (e.g. Tenor) |

---

## Special text & UX

| Feature | Package | What you get |
|--------|---------|----------------|
| **Hashtags** | `@lexical/hashtag` | #tag detection and styling |
| **Mentions** | Custom (MentionsPlugin) | @mention typeahead |
| **Emojis** | Custom (EmojisPlugin, EmojiPickerPlugin) | Emoji picker and shortcuts |
| **Equations** | Custom + `katex` | LaTeX math (EquationsPlugin) |
| **Markdown shortcuts** | `@lexical/markdown` | Type `#`, `##`, `-`, `1.`, `[]` etc. for blocks |
| **Markdown import/export** | `@lexical/markdown` | Paste/export Markdown |
| **HTML import/export** | `@lexical/html` | Paste/export HTML |
| **Drag & drop paste** | `@lexical/rich-text` + DragDropPastePlugin | Drop images/files into editor |
| **Clipboard** | `@lexical/clipboard` | Copy/paste with formatting |
| **File (document)** | `@lexical/file` | Document node / serialization |

---

## Toolbar & UI

| Feature | Where | What you get |
|--------|--------|----------------|
| **Main toolbar** | ToolbarPlugin | Block type, format buttons, insert menu |
| **Floating format bar** | FloatingTextFormatToolbarPlugin | Bold/italic/etc. on text selection |
| **Floating link editor** | FloatingLinkEditorPlugin | Edit link on selection |
| **Component picker** | ComponentPickerPlugin | Slash or plus menu for blocks/embeds |
| **Context menu** | ContextMenuPlugin | Right-click: link, copy, etc. |
| **Code actions** | CodeActionMenuPlugin | Copy, Prettier for code blocks |
| **Table actions** | TableActionMenuPlugin, TableHoverActionsV2Plugin | Add row/column, merge, etc. |
| **Draggable blocks** | DraggableBlockPlugin | Drag handle to reorder blocks |
| **Table of contents** | TableOfContentsPlugin | Headings list (for nav/sidebar) |

---

## Collaboration & Comments

| Feature | Package | What you get |
|--------|---------|----------------|
| **Real-time collaboration** | `@lexical/yjs` + `yjs`, `y-websocket` | Multiplayer editing |
| **Comments** | CommentPlugin + `@lexical/yjs` | Comment threads on selection |
| **Version history** | VersionsPlugin | Connect/disconnect, version sync |
| **Connect/Disconnect** | ActionsPlugin | Toggle collaboration |

---

## Dev & Debug

| Feature | Where | What you get |
|--------|--------|----------------|
| **Tree view** | TreeViewPlugin | Live JSON/debug view of editor state |
| **Settings** | Settings (bottom-left) | Empty editor, collab, debug view, typing perf |
| **Paste log** | PasteLogPlugin | Log paste events (dev) |
| **Test recorder** | TestRecorderPlugin | Record and replay actions (dev) |
| **Docs** | DocsPlugin | In-app docs link |

---

## Other packages (used by playground or available)

| Package | Purpose |
|--------|--------|
| `@lexical/extension` | New extension API (defineExtension, DecoratorTextExtension) – used by playground App |
| `@lexical/headless` | Headless editor (no DOM) – e.g. server validation |
| `@lexical/overflow` | Overflow/scroll behavior |
| `@lexical/utils` | Helpers: `$getNearestBlockElementAncestorOrThrow`, `mergeRegister`, `$insertNodeToNearestRoot`, etc. |

---

## Optional Lexical packages (not in playground)

You can add these for more capabilities:

| Package | Feature |
|--------|--------|
| `@lexical/devtools` | Lexical DevTools panel in browser |
| `@lexical/history` | Standalone history (undo/redo) – often bundled in `@lexical/react` |
| `@lexical/offset` | Offset-based APIs |
| `@lexical/tailwind` | Tailwind CSS utilities for Lexical |
| `@lexical/dragon` | Experimental drag-and-drop |

---

## Summary

- **Your setup:** Full Lexical Playground in `editor/` + all required `@lexical/*` packages and `@lexical/yjs` for collaboration and commenting.
- **You have:** Every feature listed above (toolbar, insert menu, tables, images, layouts, equations, Excalidraw, stickies, links, lists, code, markdown, hashtags, mentions, emojis, collab, comments, floating toolbars, etc.).
- **To use it:** Open the page that mounts the playground (e.g. `/playground` or wherever you render the editor with `ssr: false`). No need to change any Lexical or playground code to get all these features.

For more: [Lexical docs](https://lexical.dev/docs) · [Playground](https://playground.lexical.dev) · [GitHub](https://github.com/facebook/lexical).
