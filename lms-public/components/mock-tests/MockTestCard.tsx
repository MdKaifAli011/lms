import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MockTestCard({
  id,
  title,
  difficulty,
  difficultyColor,
  time,
  marks,
  questions,
  users,
  userColors,
  actionLabel = "Book Slot",
  href,
}: {
  id: string;
  title: string;
  difficulty: string;
  difficultyColor: "green" | "orange" | "blue";
  time: string;
  marks: string;
  questions?: string;
  users: string[];
  userColors: string[];
  actionLabel?: string;
  href: string;
}) {
  const diffBg = {
    green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    orange: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    blue: "bg-primary/10 text-primary",
  }[difficultyColor];

  return (
    <Card className="group h-full flex flex-col bg-card border border-border shadow-lg transition-all hover:shadow-xl hover:border-primary/20 hover:-translate-y-0.5">
      <CardContent className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest",
              diffBg
            )}
          >
            {difficulty}
          </span>
          <span className="text-xs text-muted-foreground">{id}</span>
        </div>

        <h3 className="text-lg font-bold mb-4 text-foreground group-hover:text-primary transition-colors flex-1 min-h-0">
          <Link
            href={href}
            className="relative inline-block focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded focus:ring-offset-card"
          >
            <span className="absolute inset-0 z-0 rounded pointer-events-none" aria-hidden />
            <span className="relative z-10">{title}</span>
          </Link>
        </h3>

        <div className="flex items-center gap-4 mb-6 text-muted-foreground text-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Time</span>
            <span className="font-bold text-foreground">{time}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Marks</span>
            <span className="font-bold text-foreground">{marks}</span>
          </div>
          {questions && (
            <>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                  Questions
                </span>
                <span className="font-bold text-foreground">{questions}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto relative z-10">
          <div className="flex -space-x-2">
            {users.map((u, i) => (
              <div
                key={i}
                className={cn(
                  "w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm",
                  userColors[i] || "bg-muted text-muted-foreground"
                )}
              >
                {u}
              </div>
            ))}
          </div>
          <Link
            href={href}
            className="inline-flex items-center justify-center px-5 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:opacity-95 transition-all"
          >
            {actionLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
