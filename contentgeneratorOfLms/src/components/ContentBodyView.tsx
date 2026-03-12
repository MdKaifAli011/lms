import "./ContentBodyView.css";

interface ContentBodyViewProps {
  contentBody: string | null;
  nodeType: string | null;
  nodePath: string | null;
}

export function ContentBodyView({ contentBody, nodeType, nodePath }: ContentBodyViewProps) {
  if (contentBody == null || nodePath == null) {
    return (
      <div className="content-body-view content-body-view-empty">
        <p>Select a node in the tree to view its <strong>contentBody</strong> (extracted HTML).</p>
      </div>
    );
  }

  return (
    <div className="content-body-view">
      <div className="content-body-view-header">
        <span className="content-body-view-badge">{nodeType}</span>
        <code className="content-body-view-path">{nodePath}</code>
      </div>
      <div className="content-body-view-raw">
        <h4>Raw HTML (contentBody)</h4>
        <pre className="content-body-view-pre">{contentBody}</pre>
      </div>
      <div className="content-body-view-preview">
        <h4>Preview (as rendered in LMS)</h4>
        <div
          className="content-body-view-rendered lexical-content"
          dangerouslySetInnerHTML={{ __html: contentBody }}
        />
      </div>
    </div>
  );
}
