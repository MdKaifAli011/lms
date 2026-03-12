/** LMS 7-level content tree node types */
export interface DefinitionNode {
  name: string;
  contentBody: string;
}

export interface SubtopicNode {
  name: string;
  contentBody: string;
  definitions: DefinitionNode[];
}

export interface TopicNode {
  name: string;
  contentBody: string;
  subtopics: SubtopicNode[];
}

export interface ChapterNode {
  name: string;
  contentBody: string;
  topics: TopicNode[];
}

export interface UnitNode {
  name: string;
  contentBody: string;
  chapters: ChapterNode[];
}

export interface SubjectNode {
  name: string;
  contentBody: string;
  units: UnitNode[];
}

export interface ContentTree {
  exam: { name: string; contentBody: string };
  subjects: SubjectNode[];
}
