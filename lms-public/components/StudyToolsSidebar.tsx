"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  StickyNote,
  Bot,
  BookOpen,
  Bookmark,
  Settings,
  Share2,
  HelpCircle,
  ClipboardList,
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
    ...(examSlug
      ? [
          {
            icon: ClipboardList,
            label: "Syllabus",
            href: `/exam/${examSlug}/syllabus`,
          },
        ]
      : []),
    { icon: StickyNote, label: "Take Notes", onClick: () => {} },
    { icon: Bot, label: "Ask AI Tutor", onClick: () => {} },
    { icon: BookOpen, label: "Flashcards", onClick: () => {} },
    { icon: Bookmark, label: "Bookmark", onClick: () => {} },
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
      ...(examSlug ? [{ icon: ClipboardList, label: "Syllabus", onClick: () => {}, isPrimary: false, href: `/exam/${examSlug}/syllabus` }] : []),
      { icon: StickyNote, label: "Notes", onClick: () => {}, isPrimary: false },
      { icon: Bot, label: "AI Tutor", onClick: () => {}, isPrimary: true },
      { icon: BookOpen, label: "Cards", onClick: () => {}, isPrimary: false },
      { icon: Bookmark, label: "Saved", onClick: () => {}, isPrimary: false },
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
              const isActive = pathname === toolHref;
              return (
                <Link
                  key={index}
                  href={toolHref}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 min-h-[40px] py-1 flex-1 transition-colors",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                  aria-label={tool.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    isActive && "bg-blue-100 dark:bg-blue-900/40"
                  )}>
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-medium truncate max-w-[52px] text-center">{tool.label}</span>
                </Link>
              );
            }
            if (tool.isPrimary) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={tool.onClick}
                  className="flex flex-1 items-center justify-center min-w-0 min-h-[40px] -mt-4"
                  aria-label={tool.label}
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                </button>
              );
            }
            return (
              <button
                key={index}
                type="button"
                onClick={tool.onClick}
                className="flex flex-col items-center justify-center gap-0.5 min-h-[40px] py-1 flex-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                aria-label={tool.label}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-medium truncate max-w-[52px] text-center">{tool.label}</span>
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
                const isActive = isSyllabusPage;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-auto py-2.5 px-2 transition-colors",
                      !isExpanded && "justify-center px-0",
                      isActive
                        ? "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                    title={!isExpanded ? tool.label : undefined}
                    asChild
                  >
                    <Link href={href} className="flex w-full items-center gap-3 py-2.5 px-2 min-h-10" aria-current={isActive ? "page" : undefined}>
                      <Icon className="h-5 w-5 shrink-0" />
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
                    "w-full justify-start gap-3 h-auto py-2.5 px-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors",
                    !isExpanded && "justify-center px-0"
                  )}
                  onClick={(tool as { onClick?: () => void }).onClick}
                  title={!isExpanded ? tool.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
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
                      className="w-full justify-start gap-3 h-auto py-2.5 px-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                      onClick={action.onClick}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
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
            >
              <Settings className="h-4 w-4" />
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
