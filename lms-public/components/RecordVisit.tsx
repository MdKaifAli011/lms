"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/api";

type Resource = "exams" | "subjects" | "units" | "chapters" | "topics" | "subtopics" | "definitions";

interface RecordVisitProps {
  resource: Resource;
  param: string; // id or slug (API accepts both)
}

export function RecordVisit({ resource, param }: RecordVisitProps) {
  useEffect(() => {
    if (!param) return;
    recordVisit(resource, param).catch(() => {
      // ignore errors (e.g. CORS, API down)
    });
  }, [resource, param]);
  return null;
}
