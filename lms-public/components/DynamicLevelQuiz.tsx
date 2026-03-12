"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LevelQuiz is heavy (timer, state, API calls). Load it only when needed (e.g. when in viewport).
 * SSR disabled so the chunk loads on client when the component mounts.
 */
export const DynamicLevelQuiz = dynamic(
  () => import("@/components/LevelQuiz").then((m) => ({ default: m.LevelQuiz })),
  {
    ssr: false,
    loading: () => <QuizBlockSkeleton />,
  }
);

function QuizBlockSkeleton() {
  return (
    <section className="my-8 sm:my-10 min-h-[280px]" aria-hidden>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-6 w-48 rounded-lg" />
      </div>
      <div className="flex justify-center items-center min-h-[200px] rounded-2xl border border-dashed border-border/60 bg-muted/10">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </section>
  );
}
