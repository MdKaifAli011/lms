/**
 * Syncs editor content with the exam page via custom events.
 * Only runs when the editor is inside .lexical-playground-embed (exam detail page).
 * - Listens for 'exam-editor-set-initial' to set initial HTML.
 * - Dispatches 'exam-editor-content-change' on each change with serialized HTML.
 */

import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getRoot } from "lexical"
import { useEffect } from "react"
import { CAN_USE_DOM } from "@lexical/utils"

const EXAM_SET_INITIAL = "exam-editor-set-initial"
const EXAM_CONTENT_CHANGE = "exam-editor-content-change"
const EXAM_EDITOR_READY = "exam-editor-ready"

export default function ExamContentSyncPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!CAN_USE_DOM || !document.querySelector(".lexical-playground-embed")) return

    const handleSetInitial = (e: Event) => {
      const customEvent = e as CustomEvent<{ html: string }>
      const html = customEvent.detail?.html
      if (typeof html !== "string") return
      editor.update(() => {
        const root = $getRoot()
        root.clear()
        if (html.trim()) {
          try {
            const parser = new DOMParser()
            const dom = parser.parseFromString(html, "text/html")
            const nodes = $generateNodesFromDOM(editor, dom.body)
            nodes.forEach((node) => root.append(node))
          } catch {
            // ignore parse errors
          }
        }
      })
    }

    window.addEventListener(EXAM_SET_INITIAL, handleSetInitial)
    window.dispatchEvent(new CustomEvent(EXAM_EDITOR_READY))
    return () => window.removeEventListener(EXAM_SET_INITIAL, handleSetInitial)
  }, [editor])

  useEffect(() => {
    if (!CAN_USE_DOM || !document.querySelector(".lexical-playground-embed")) return

    let timeoutId: ReturnType<typeof setTimeout>
    return editor.registerUpdateListener(({ editorState }) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        editorState.read(() => {
          try {
            const html = $generateHtmlFromNodes(editor, null)
            window.dispatchEvent(
              new CustomEvent(EXAM_CONTENT_CHANGE, { detail: { html } })
            )
          } catch {
            // ignore
          }
        })
      }, 300)
    })
  }, [editor])

  return null
}
