import type { EditorThemeClasses } from "lexical"

export const editorTheme: EditorThemeClasses = {
  paragraph: "lexical-paragraph",
  text: {
    bold: "lexical-bold",
    italic: "lexical-italic",
    underline: "lexical-underline",
    strikethrough: "lexical-strikethrough",
    code: "lexical-inline-code",
  },
  heading: {
    h1: "lexical-h1",
    h2: "lexical-h2",
    h3: "lexical-h3",
    h4: "lexical-h4",
    h5: "lexical-h5",
    h6: "lexical-h6",
  },
  list: {
    ul: "lexical-ul",
    ol: "lexical-ol",
    listitem: "lexical-li",
    listitemChecked: "lexical-li-checked",
    listitemUnchecked: "lexical-li-unchecked",
  },
  listitem: "lexical-li",
  link: "lexical-link",
  hashtag: "lexical-hashtag",
  quote: "lexical-quote",
  code: "lexical-code-block",
  hr: "lexical-hr",
  table: "lexical-table",
  tableCell: "lexical-table-cell",
  tableCellHeader: "lexical-table-cell-header",
}
