"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  StickyNote,
  BookOpen,
  ClipboardList,
  FileQuestion,
  Settings,
  Share2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface StudyToolsSidebarProps {
  examSlug?: string;
  user?: {
    name?: string;
    role?: string;
    avatar?: string;
  };
}

export function StudyToolsSidebar({ examSlug, user }: StudyToolsSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isSyllabusPage = Boolean(
    examSlug && pathname && pathname === `/exam/${examSlug}/syllabus`
  );

  /** Base path for current hierarchy (no /syllabus, /quiz, or /flashcards). */
  const basePath =
    examSlug && pathname?.startsWith(`/exam/${examSlug}`)
      ? pathname
          .replace(/\/syllabus\/?$/, "")
          .replace(/\/quiz\/?$/, "")
          .replace(/\/flashcards\/?$/, "")
          .replace(/\/$/, "") || `/exam/${examSlug}`
      : null;

  /** Quiz page for current hierarchy level. */
  const quizHref = basePath ? `${basePath}/quiz` : null;
  const isQuizPage = Boolean(quizHref && pathname === quizHref);

  /** Flashcards page for current hierarchy level. */
  const flashcardsHref = basePath ? `${basePath}/flashcards` : null;
  const isFlashcardsPage = Boolean(flashcardsHref && pathname === flashcardsHref);

  /** Content page (Take Notes): from Syllabus → exam home; else base path. */
  const contentHref =
    examSlug && pathname?.startsWith(`/exam/${examSlug}`)
      ? pathname.endsWith("/syllabus")
        ? `/exam/${examSlug}`
        : basePath ?? `/exam/${examSlug}`
      : null;

  /** On content pages (not Syllabus, Quiz, or Flashcards), show Take Notes as default active. */
  const isNotesDefaultActive = Boolean(
    examSlug &&
      pathname?.startsWith(`/exam/${examSlug}`) &&
      !isSyllabusPage &&
      !isQuizPage &&
      !isFlashcardsPage
  );

  useEffect(() => {
    if (isMobile) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    if (isHovering) {
      timeoutId = setTimeout(() => setIsExpanded(true), 150);
    } else {
      timeoutId = setTimeout(() => setIsExpanded(false), 300);
    }
    return () => clearTimeout(timeoutId);
  }, [isHovering, isMobile]);

  const studyTools = [
    ...(contentHref
      ? [{ icon: StickyNote, label: "Take Notes", href: contentHref }]
      : [{ icon: StickyNote, label: "Take Notes", onClick: () => {} }]),
    ...(quizHref
      ? [
          {
            icon: FileQuestion,
            label: "Quiz",
            href: quizHref,
          },
        ]
      : []),
    ...(flashcardsHref ? [{ icon: BookOpen, label: "Flashcards", href: flashcardsHref }] : [{ icon: BookOpen, label: "Flashcards", onClick: () => {} }]),
    ...(examSlug
      ? [
          {
            icon: ClipboardList,
            label: "Syllabus",
            href: `/exam/${examSlug}/syllabus`,
          },
        ]
      : []),
  ];

  const quickActions = [
    { icon: Share2, label: "Share", onClick: () => {} },
    { icon: HelpCircle, label: "Help", onClick: () => {} },
  ];

  const displayName = user?.name ?? "User";
  const userRole = user?.role ?? "Student";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isMobile) {
    const mobileTools = [
      ...(contentHref ? [{ icon: StickyNote, label: "Notes", onClick: () => {}, isPrimary: false, href: contentHref }] : [{ icon: StickyNote, label: "Notes", onClick: () => {}, isPrimary: false }]),
      ...(quizHref
        ? [{ icon: FileQuestion, label: "Quiz", onClick: () => {}, isPrimary: false, href: quizHref }]
        : []),
      ...(flashcardsHref ? [{ icon: BookOpen, label: "Cards", onClick: () => {}, isPrimary: false, href: flashcardsHref }] : [{ icon: BookOpen, label: "Cards", onClick: () => {}, isPrimary: false }]),
      ...(examSlug ? [{ icon: ClipboardList, label: "Syllabus", onClick: () => {}, isPrimary: false, href: `/exam/${examSlug}/syllabus` }] : []),
      { icon: Settings, label: "More", onClick: () => {}, isPrimary: false },
    ];
    return (
      <nav
        role="navigation"
        aria-label="Study tools"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100]",
          "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-border",
          "shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.25)]"
        )}
        style={{
          paddingLeft: "max(0.5rem, env(safe-area-inset-left, 0px))",
          paddingRight: "max(0.5rem, env(safe-area-inset-right, 0px))",
          paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex items-stretch justify-around gap-0 min-h-[48px] py-1">
          {mobileTools.map((tool, index) => {
            const Icon = tool.icon;
            const toolHref = (tool as { href?: string }).href;
            if (toolHref) {
              const isActive =
                pathname === toolHref ||
                (tool.label === "Notes" && isNotesDefaultActive) ||
                (tool.label === "Cards" && isFlashcardsPage);
              return (
                <Link
                  key={index}
                  href={toolHref}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 min-h-[40px] py-1.5 flex-1 min-w-0 transition-colors duration-200 ease-out rounded-lg mx-0.5",
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
                  )}
                  aria-label={tool.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0">
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-medium truncate max-w-[60px] sm:max-w-[52px] text-center px-0.5">{tool.label}</span>
                </Link>
              );
            }
            const notesActive = tool.label === "Notes" && isNotesDefaultActive;
            return (
              <button
                key={index}
                type="button"
                onClick={tool.onClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-h-[40px] py-1.5 flex-1 min-w-0 transition-colors duration-200 ease-out rounded-lg mx-0.5",
                  notesActive
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
                )}
                aria-label={tool.label}
                aria-current={notesActive ? "page" : undefined}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-md shrink-0">
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium truncate max-w-[60px] sm:max-w-[52px] text-center px-0.5">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <aside
      className={cn(
        "sticky self-start top-[72px] sm:top-[84px] h-[calc(100vh-72px)] sm:h-[calc(100vh-84px)] ",
        "bg-white dark:bg-gray-900 border-l border-border",
        "transition-all duration-300 ease-in-out flex flex-col shrink-0 shadow-sm",
        isExpanded ? "w-64 shadow-lg" : "w-16"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
        <div className="p-3 space-y-2">
          {isExpanded && (
            <>
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wider px-2 py-1">
                Study Tools
              </h3>
              <Separator className="my-2" />
            </>
          )}

          <div className="space-y-1">
            {studyTools.map((tool, index) => {
              const Icon = tool.icon;
              const href = (tool as { href?: string }).href;
              if (href) {
                const isActive =
                  (tool.label === "Syllabus" && isSyllabusPage) ||
                  (tool.label === "Quiz" && isQuizPage) ||
                  (tool.label === "Take Notes" && isNotesDefaultActive) ||
                  (tool.label === "Flashcards" && isFlashcardsPage);
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-auto py-2.5 px-2 rounded-lg transition-colors duration-200 ease-out",
                      !isExpanded && "justify-center px-0",
                      isActive
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:hover:text-primary-foreground"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
                    )}
                    title={!isExpanded ? tool.label : undefined}
                    aria-label={tool.label}
                    asChild
                  >
                    <Link href={href} className="flex w-full items-center gap-3 py-2.5 px-2 min-h-10" aria-label={tool.label} aria-current={isActive ? "page" : undefined}>
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      {isExpanded && <span className="text-sm font-normal">{tool.label}</span>}
                    </Link>
                  </Button>
                );
              }
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-auto py-2.5 px-2 rounded-lg transition-colors duration-200 ease-out",
                    !isExpanded && "justify-center px-0",
                    tool.label === "Take Notes" && isNotesDefaultActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 dark:hover:text-primary-foreground"
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary"
                  )}
                  onClick={(tool as { onClick?: () => void }).onClick}
                  title={!isExpanded ? tool.label : undefined}
                  aria-label={tool.label}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {isExpanded && <span className="text-sm font-normal">{tool.label}</span>}
                </Button>
              );
            })}
          </div>

          {isExpanded && (
            <>
              <div className="pt-4">
                <Separator className="my-2" />
              </div>
              <div className="space-y-1">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start gap-3 h-auto py-2.5 px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 dark:hover:text-primary transition-colors duration-200 ease-out"
                      onClick={action.onClick}
                      aria-label={action.label}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      <span className="text-sm font-normal">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-border p-3 shrink-0">
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 text-rose-700 dark:text-rose-300 font-semibold text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{displayName}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{userRole}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
              onClick={() => {}}
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={user?.avatar} alt={displayName} />
              <AvatarFallback className="bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 text-rose-700 dark:text-rose-300 font-semibold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </aside>
  );
}
