"use client";

export default function MockTestExamLoading() {
  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
      <div
        className="h-10 w-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"
        aria-hidden
      />
      <p className="text-sm font-medium text-muted-foreground">Starting exam...</p>
    </div>
  );
}
