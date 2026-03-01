"use client";

import { useState, use, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calculator,
  HelpCircle,
  Timer,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

function TorqueDiagram() {
  return (
    <svg
      viewBox="0 0 280 160"
      className="w-full h-auto max-w-xs mx-auto"
      aria-label="Diagram: Torque & Rolling Mechanics - sphere on rough surface with force F"
    >
      <line
        x1={20}
        y1={120}
        x2={260}
        y2={120}
        stroke="currentColor"
        strokeWidth={2}
        strokeDasharray="4 2"
        className="text-slate-400"
      />
      <circle
        cx={140}
        cy={90}
        r={40}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        className="text-primary"
      />
      <circle cx={140} cy={90} r={3} fill="currentColor" className="text-primary" />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="text-primary" />
        </marker>
      </defs>
      <line
        x1={180}
        y1={26}
        x2={220}
        y2={26}
        stroke="currentColor"
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
        className="text-primary"
      />
      <text x={200} y={20} fontSize={12} fontWeight="bold" fill="currentColor" className="fill-foreground text-center">
        F
      </text>
      <line
        x1={140}
        y1={90}
        x2={200}
        y2={26}
        stroke="currentColor"
        strokeWidth={1}
        strokeDasharray="2 2"
        className="text-muted-foreground opacity-60"
      />
      <text x={165} y={60} fontSize={10} fill="currentColor" className="fill-muted-foreground">
        h
      </text>
    </svg>
  );
}

export default function MockTestExamPage({
  params,
}: {
  params: Promise<{ testSlug: string }>;
}) {
  use(params);
  const [answer, setAnswer] = useState("12.5");
  const [timer, setTimer] = useState(2 * 60 * 60 + 24 * 60 + 45);
  const [activeSubject, setActiveSubject] = useState<"physics" | "chemistry" | "mathematics">("physics");
  const [activeSection, setActiveSection] = useState<"mcq" | "nvq">("mcq");
  const [currentQuestion, setCurrentQuestion] = useState(26);
  const [answeredCount] = useState(24);
  const [reviewCount] = useState(3);
  const totalQuestions = 90;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];

  const handleNumpad = (key: string) => {
    if (key === "backspace") {
      setAnswer((a) => a.slice(0, -1));
    } else {
      setAnswer((a) => a + key);
    }
  };

  const subjects = [
    { id: "physics", label: "Physics" },
    { id: "chemistry", label: "Chemistry" },
    { id: "mathematics", label: "Mathematics" },
  ] as const;

  const questionStatus = (n: number) => {
    if (n === currentQuestion) return "current";
    if ([21, 22, 24].includes(n)) return "answered";
    if (n === 25) return "review";
    return "unvisited";
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased flex flex-col overflow-hidden">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 py-2 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-primary shrink-0" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
              JEE Main 2024
            </h1>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
              Mock Test Environment
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <nav className="flex gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            {subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSubject(s.id)}
                className={cn(
                  "px-3 py-1 text-[11px] font-medium rounded-md transition-all",
                  activeSubject === s.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary font-bold">
            <Timer className="w-3.5 h-3.5" />
            <span className="text-xs tabular-nums">{formatTime(timer)}</span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <button className="p-1.5 hover:bg-primary/10 rounded-md transition-colors text-muted-foreground hover:text-primary">
            <Calculator className="w-4 h-4" />
          </button>
          <button className="p-1.5 hover:bg-primary/10 rounded-md transition-colors text-muted-foreground hover:text-primary">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="sticky z-10 top-[41px] flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-4 py-1.5 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
            Section:
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveSection("mcq")}
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold border-b-2 transition-colors",
                activeSection === "mcq"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              )}
            >
              Section A (MCQs)
            </button>
            <button
              onClick={() => setActiveSection("nvq")}
              className={cn(
                "px-2 py-0.5 text-[10px] font-medium border-b-2 transition-colors",
                activeSection === "nvq"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              )}
            >
              Section B (NVQ)
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
            +4 Correct
          </span>
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900">
            -1 Incorrect
          </span>
        </div>
      </div>

      <main className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                Question {currentQuestion}
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-base font-medium leading-relaxed text-foreground">
                A solid sphere of mass <span className="font-mono font-semibold">M = 5.0 kg</span> and
                radius <span className="font-mono font-semibold">R = 0.2 m</span> is placed on a
                rough horizontal surface with a friction coefficient{" "}
                <span className="font-mono font-semibold">μₛ = 0.3</span>. A constant horizontal
                force <span className="font-mono font-semibold">F</span> is applied at a height{" "}
                <span className="font-mono font-semibold">h = 1.6R</span> from the center of the
                sphere.
                <br />
                <br />
                If the sphere undergoes pure rolling without slipping, determine the maximum value
                of <span className="font-mono font-semibold">F</span> (in Newtons) that can be
                applied. Take <span className="font-mono font-semibold">g = 10 m/s²</span>.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
                  <div className="aspect-video w-full rounded-md bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-700 p-2">
                    <TorqueDiagram />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-mono mt-1 text-center">
                    Diagram: Torque & Rolling Mechanics
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Your Answer
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Enter numerical value"
                        className="w-full h-11 px-3 text-lg font-bold bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-foreground placeholder:text-muted-foreground"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">
                        Newtons
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-3 gap-1.5">
                      {numpadKeys.map((key) => (
                        <button
                          key={key}
                          onClick={() => handleNumpad(key)}
                          className={cn(
                            "flex h-10 w-full items-center justify-center rounded-md border font-bold text-base transition-all",
                            key === "backspace"
                              ? "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                              : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-foreground hover:bg-primary/10 hover:border-primary/30"
                          )}
                        >
                          {key === "backspace" ? (
                            <span className="text-base">⌫</span>
                          ) : (
                            key
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setAnswer("")}
                      className="w-full mt-2 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors"
                    >
                      Clear Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden lg:flex w-64 flex-col border-l border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="size-9 rounded-full overflow-hidden border-2 border-primary/30 bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-foreground truncate">Alex Henderson</h4>
              <p className="text-[9px] text-muted-foreground font-bold uppercase truncate">
                ID: JEE-2024-8829
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-5">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-[8px] uppercase font-bold text-muted-foreground mb-0.5">Answered</p>
              <p className="text-base font-bold text-foreground">
                {answeredCount} <span className="text-[10px] text-muted-foreground">/ {totalQuestions}</span>
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-[8px] uppercase font-bold text-muted-foreground mb-0.5">Review</p>
              <p className="text-base font-bold text-amber-500">{reviewCount}</p>
            </div>
          </div>

          <h5 className="text-[9px] font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
            Question Palette
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </h5>

          <div className="grid grid-cols-5 gap-1.5 overflow-y-auto mb-4 pr-1 max-h-40">
            {Array.from({ length: 15 }, (_, i) => i + 21).map((n) => {
              const status = questionStatus(n);
              return (
                <button
                  key={n}
                  onClick={() => setCurrentQuestion(n)}
                  className={cn(
                    "h-7 rounded text-[10px] font-bold flex items-center justify-center transition-all",
                    status === "current" &&
                      "border-2 border-primary ring-2 ring-primary/20 bg-white dark:bg-slate-900 text-primary",
                    status === "answered" && "border border-primary/20 bg-primary text-primary-foreground",
                    status === "review" &&
                      "border border-amber-200 dark:border-amber-800 bg-amber-500 text-white",
                    status === "unvisited" &&
                      "border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-muted-foreground"
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary shrink-0" /> Answered
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 shrink-0" /> Not Visited
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shrink-0" /> Review
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm border border-slate-300 bg-white dark:bg-slate-800 shrink-0" /> Unanswered
              </div>
            </div>
            <button className="w-full py-2 rounded-md border-2 border-primary text-primary font-bold text-[10px] hover:bg-primary/10 transition-all">
              Full Question Paper
            </button>
          </div>
        </aside>
      </main>

      <footer className="h-14 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-6 flex items-center justify-between z-20 shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.03)] shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentQuestion((q) => Math.max(1, q - 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md border-2 border-primary font-bold text-xs text-primary hover:bg-primary/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-md border-2 border-primary font-bold text-xs text-primary hover:bg-primary/10 transition-colors">
            Mark for Review & Next
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnswer("")}
            className="px-4 py-2 rounded-md font-bold text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Clear Response
          </button>
          <button
            onClick={() => setCurrentQuestion((q) => Math.min(totalQuestions, q + 1))}
            className="flex items-center gap-1.5 px-6 py-2 rounded-md bg-primary text-primary-foreground font-bold text-xs shadow-lg shadow-primary/25 hover:opacity-95 active:scale-95 transition-all"
          >
            Save & Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
