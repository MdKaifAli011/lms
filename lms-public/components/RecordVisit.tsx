"use client";

import { useEffect, useRef } from "react";
import { recordVisit } from "@/lib/api";

type Resource = "exams" | "subjects" | "units" | "chapters" | "topics" | "subtopics" | "definitions";

interface RecordVisitProps {
  resource: Resource;
  param: string; // id or slug (API accepts both)
}

/**
 * When the page is open, sends one POST to /api/{resource}/{param}/visit so the
 * backend increments that entity's visit count by 1. Uses a ref to fire only
 * once per mount (avoids double count in React Strict Mode).
 */
export function RecordVisit({ resource, param }: RecordVisitProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (!param?.trim() || sent.current) return;
    sent.current = true;
    recordVisit(resource, param).catch(() => {
      // ignore errors (e.g. CORS, API down); don't reset sent so we don't retry on next effect
    });
  }, [resource, param]);

  return null;
}
