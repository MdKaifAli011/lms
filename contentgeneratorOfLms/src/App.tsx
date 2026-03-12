import { useState, useCallback } from "react";
import { PdfUploader } from "./components/PdfUploader";
import { ContentTreeDiagram } from "./components/ContentTreeDiagram";
import { ContentBodyView } from "./components/ContentBodyView";
import { extractTextFromPdf, buildContentTreeFromText, countTreeNodes } from "./lib/pdfParser";
import type { ContentTree } from "./types";
import type { NodeType } from "./components/ContentTreeDiagram";
import "./App.css";

function App() {
  const [tree, setTree] = useState<ContentTree | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedContentBody, setSelectedContentBody] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [examName, setExamName] = useState("NEET");
  const [subjectName, setSubjectName] = useState("Biology");

  const handleFileSelect = useCallback(
    async (file: File) => {
      setLoading(true);
      setStatus({ type: "idle", message: "" });
      setFileName(file.name);
      setSelectedPath(null);
      setSelectedContentBody(null);
      setSelectedNodeType(null);
      try {
        const { text, numPages } = await extractTextFromPdf(file);
        const built = buildContentTreeFromText(text, file.name, numPages, examName, subjectName);
        setTree(built);
        const counts = countTreeNodes(built);
        setStatus({
          type: "success",
          message: `Extracted ${numPages} pages → ${counts.units} units, ${counts.chapters} chapters, ${counts.topics} topics, ${counts.definitions} definitions. Export JSON and run \`npm run import:content\` in the main LMS project.`,
        });
      } catch (err) {
        setTree(null);
        setStatus({
          type: "error",
          message: err instanceof Error ? err.message : "Failed to parse PDF",
        });
      } finally {
        setLoading(false);
      }
    },
    [examName, subjectName]
  );

  const handleSelectNode = useCallback((path: string, contentBody: string, nodeType: NodeType) => {
    setSelectedPath(path);
    setSelectedContentBody(contentBody);
    setSelectedNodeType(nodeType);
  }, []);

  const handleExportJson = useCallback(() => {
    if (!tree) return;
    const json = JSON.stringify(tree, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-tree-${fileName?.replace(/\.pdf$/i, "") ?? "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus({ type: "success", message: `Downloaded ${a.download}. Use in main LMS: \`API_BASE=<url> node scripts/import-content-tree.mjs <path-to-this.json>\`` });
  }, [tree, fileName]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>LMS Content Generator</h1>
        <p>Upload a PDF to extract content and build the 7-level tree (Exam → Subject → Unit → Chapter → Topic → Subtopic → Definition). Export JSON and import in the main LMS with <code>npm run import:content</code>.</p>
      </header>

      <div className="app-controls">
        <PdfUploader
          onFileSelect={handleFileSelect}
          disabled={loading}
          fileName={fileName}
        />
        <div className="app-controls-exam">
          <label htmlFor="exam-name">Exam name</label>
          <input
            id="exam-name"
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g. NEET"
          />
        </div>
        <div className="app-controls-subject">
          <label htmlFor="subject-name">Subject name</label>
          <input
            id="subject-name"
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g. Biology"
          />
        </div>
        {status.message && (
          <p className={`app-status ${status.type}`}>{status.message}</p>
        )}
      </div>

      <main className="app-main">
        <aside className="app-panel-tree">
          {loading && <p className="app-status">Parsing PDF…</p>}
          <ContentTreeDiagram
            tree={tree}
            selectedPath={selectedPath}
            onSelectNode={handleSelectNode}
          />
          {tree && (
            <button type="button" className="app-export" onClick={handleExportJson}>
              Export as JSON
            </button>
          )}
        </aside>
        <section className="app-panel-content">
          <ContentBodyView
            contentBody={selectedContentBody}
            nodeType={selectedNodeType}
            nodePath={selectedPath}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
