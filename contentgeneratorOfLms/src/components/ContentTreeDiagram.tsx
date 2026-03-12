import { useState } from "react";
import type { ContentTree, SubjectNode, UnitNode, ChapterNode, TopicNode, SubtopicNode, DefinitionNode } from "../types";
import "./ContentTreeDiagram.css";

type NodeType = "exam" | "subject" | "unit" | "chapter" | "topic" | "subtopic" | "definition";

interface TreeDiagramProps {
  tree: ContentTree | null;
  selectedPath: string | null;
  onSelectNode: (path: string, contentBody: string, nodeType: NodeType) => void;
}

const LEVEL_LABELS: Record<NodeType, string> = {
  exam: "Exam",
  subject: "Subject",
  unit: "Unit",
  chapter: "Chapter",
  topic: "Topic",
  subtopic: "Subtopic",
  definition: "Definition",
};

function DefinitionList({
  definitions,
  basePath,
  onSelect,
}: {
  definitions: DefinitionNode[];
  basePath: string;
  onSelect: (path: string, contentBody: string, nodeType: NodeType) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="tree-branch">
      <button type="button" className="tree-branch-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "▼" : "▶"} Definitions ({definitions.length})
      </button>
      {open && (
        <ul className="tree-list">
          {definitions.map((d, i) => (
            <li key={i}>
              <button
                type="button"
                className="tree-node tree-node-definition"
                onClick={() => onSelect(`${basePath}/def/${i}`, d.contentBody, "definition")}
              >
                <span className="tree-node-label">{d.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SubtopicNodeItem({
  subtopic,
  path,
  onSelect,
  selectedPath,
}: {
  subtopic: SubtopicNode;
  path: string;
  onSelect: (p: string, body: string, t: NodeType) => void;
  selectedPath: string | null;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedPath === path;
  return (
    <li className="tree-branch">
      <button
        type="button"
        className={`tree-node tree-node-subtopic ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(path, subtopic.contentBody, "subtopic")}
      >
        <span className="tree-node-level">{LEVEL_LABELS.subtopic}</span>
        <span className="tree-node-label">{subtopic.name}</span>
      </button>
      <button type="button" className="tree-branch-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "▼" : "▶"}
      </button>
      {open && (
        <DefinitionList definitions={subtopic.definitions} basePath={path} onSelect={onSelect} />
      )}
    </li>
  );
}

function TopicNodeItem({
  topic,
  path,
  onSelect,
  selectedPath,
}: {
  topic: TopicNode;
  path: string;
  onSelect: (p: string, body: string, t: NodeType) => void;
  selectedPath: string | null;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedPath === path;
  return (
    <li className="tree-branch">
      <button
        type="button"
        className={`tree-node tree-node-topic ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(path, topic.contentBody, "topic")}
      >
        <span className="tree-node-level">{LEVEL_LABELS.topic}</span>
        <span className="tree-node-label">{topic.name}</span>
      </button>
      <button type="button" className="tree-branch-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "▼" : "▶"}
      </button>
      {open && (
        <ul className="tree-list">
          {topic.subtopics.map((s, i) => (
            <SubtopicNodeItem
              key={i}
              subtopic={s}
              path={`${path}/st/${i}`}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function ChapterNodeItem({
  chapter,
  path,
  onSelect,
  selectedPath,
}: {
  chapter: ChapterNode;
  path: string;
  onSelect: (p: string, body: string, t: NodeType) => void;
  selectedPath: string | null;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedPath === path;
  return (
    <li className="tree-branch">
      <button
        type="button"
        className={`tree-node tree-node-chapter ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(path, chapter.contentBody, "chapter")}
      >
        <span className="tree-node-level">{LEVEL_LABELS.chapter}</span>
        <span className="tree-node-label">{chapter.name}</span>
      </button>
      <button type="button" className="tree-branch-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "▼" : "▶"}
      </button>
      {open && (
        <ul className="tree-list">
          {chapter.topics.map((t, i) => (
            <TopicNodeItem
              key={i}
              topic={t}
              path={`${path}/t/${i}`}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function UnitNodeItem({
  unit,
  path,
  onSelect,
  selectedPath,
}: {
  unit: UnitNode;
  path: string;
  onSelect: (p: string, body: string, t: NodeType) => void;
  selectedPath: string | null;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedPath === path;
  return (
    <li className="tree-branch">
      <button
        type="button"
        className={`tree-node tree-node-unit ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(path, unit.contentBody, "unit")}
      >
        <span className="tree-node-level">{LEVEL_LABELS.unit}</span>
        <span className="tree-node-label">{unit.name}</span>
      </button>
      <button type="button" className="tree-branch-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "▼" : "▶"}
      </button>
      {open && (
        <ul className="tree-list">
          {unit.chapters.map((c, i) => (
            <ChapterNodeItem
              key={i}
              chapter={c}
              path={`${path}/c/${i}`}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function SubjectNodeItem({
  subject,
  path,
  onSelect,
  selectedPath,
}: {
  subject: SubjectNode;
  path: string;
  onSelect: (p: string, body: string, t: NodeType) => void;
  selectedPath: string | null;
}) {
  const [open, setOpen] = useState(true);
  const isSelected = selectedPath === path;
  return (
    <li className="tree-branch">
      <button
        type="button"
        className={`tree-node tree-node-subject ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(path, subject.contentBody, "subject")}
      >
        <span className="tree-node-level">{LEVEL_LABELS.subject}</span>
        <span className="tree-node-label">{subject.name}</span>
      </button>
      <button type="button" className="tree-branch-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? "▼" : "▶"}
      </button>
      {open && (
        <ul className="tree-list">
          {subject.units.map((u, i) => (
            <UnitNodeItem
              key={i}
              unit={u}
              path={`${path}/u/${i}`}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function ContentTreeDiagram({ tree, selectedPath, onSelectNode }: TreeDiagramProps) {
  if (!tree) return null;

  return (
    <div className="content-tree-diagram">
      <h3 className="tree-title">Tree structure (7 levels)</h3>
      <div className="tree-root">
        <button
          type="button"
          className={`tree-node tree-node-exam ${selectedPath === "exam" ? "selected" : ""}`}
          onClick={() => onSelectNode("exam", tree.exam.contentBody, "exam")}
        >
          <span className="tree-node-level">{LEVEL_LABELS.exam}</span>
          <span className="tree-node-label">{tree.exam.name}</span>
        </button>
        <ul className="tree-list tree-list-root">
          {tree.subjects.map((s, i) => (
            <SubjectNodeItem
              key={i}
              subject={s}
              path={`s/${i}`}
              onSelect={onSelectNode}
              selectedPath={selectedPath}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export type { NodeType };
