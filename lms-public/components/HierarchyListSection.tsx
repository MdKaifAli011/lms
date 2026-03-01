"use client";

import Link from "next/link";
import { ChevronRight, Layers, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type HierarchyListVariant = "units" | "chapters" | "topics" | "subtopics" | "definitions";

export interface HierarchyListItem {
  id: string;
  href: string;
  slug?: string;
  name?: string;
  title?: string;
}

const variantConfig: Record<
  HierarchyListVariant,
  { title: string; subtitle: string; emptyMessage: string; accent: string; badge: string; cardHover: string; circle: string; circleHover: string; labelHover: string; glow: string; border: string; icon: typeof Layers }
> = {
  units: {
    title: "Units",
    subtitle: "Continue learning unit by unit",
    emptyMessage: "No units available yet.\nThey'll appear here once content is added.",
    accent: "bg-green-500",
    badge: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    cardHover: "group-hover:text-green-600 dark:group-hover:text-green-400",
    circle: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    circleHover: "group-hover:bg-green-200 dark:group-hover:bg-green-800",
    labelHover: "group-hover:text-green-600 dark:group-hover:text-green-400",
    glow: "from-green-400/40 via-emerald-400/40 to-lime-400/40",
    border: "from-green-400 via-emerald-400 to-lime-400",
    icon: Layers,
  },
  chapters: {
    title: "Chapters",
    subtitle: "Continue learning chapter by chapter",
    emptyMessage: "No chapters available yet.\nThey'll appear here once content is added.",
    accent: "bg-purple-500",
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    cardHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    circle: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    circleHover: "group-hover:bg-purple-200 dark:group-hover:bg-purple-800",
    labelHover: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
    glow: "from-purple-400/40 via-fuchsia-400/40 to-indigo-400/40",
    border: "from-purple-400 via-fuchsia-400 to-indigo-400",
    icon: Layers,
  },
  topics: {
    title: "Topics",
    subtitle: "Pick a topic to explore subtopics",
    emptyMessage: "No topics available yet.\nThey'll appear here once content is added.",
    accent: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    cardHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
    circle: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    circleHover: "group-hover:bg-orange-200 dark:group-hover:bg-orange-800",
    labelHover: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
    glow: "from-orange-400/40 via-amber-400/40 to-yellow-400/40",
    border: "from-orange-400 via-amber-400 to-yellow-400",
    icon: Layers,
  },
  subtopics: {
    title: "Subtopics",
    subtitle: "Read concepts and definitions step by step",
    emptyMessage: "No subtopics available yet.\nThey'll appear here once content is added.",
    accent: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    cardHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    circle: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    circleHover: "group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
    labelHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    glow: "from-blue-400/40 via-indigo-400/40 to-blue-500/40",
    border: "from-blue-400 via-indigo-400 to-blue-500",
    icon: Layers,
  },
  definitions: {
    title: "Definitions",
    subtitle: "Key terms you should remember for this subtopic",
    emptyMessage: "No definitions available yet.\nThey'll appear here once content is added.",
    accent: "bg-yellow-500",
    badge: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    cardHover: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400",
    circle: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    circleHover: "group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800",
    labelHover: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400",
    glow: "from-yellow-400/40 via-amber-400/40 to-orange-400/40",
    border: "from-yellow-400 via-amber-400 to-orange-400",
    icon: FileText,
  },
};

interface HierarchyListSectionProps {
  variant: HierarchyListVariant;
  items: HierarchyListItem[];
  className?: string;
}

function getLabel(item: HierarchyListItem): string {
  return (item.name ?? item.title ?? item.slug ?? item.id) || "";
}

export function HierarchyListSection({
  variant,
  items,
  className,
}: HierarchyListSectionProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className={cn("mt-6", className)}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-lg font-semibold text-foreground">
            <span className={cn("h-[3px] w-6 rounded", config.accent)} />
            {config.title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {config.subtitle}
          </p>
        </div>
        <Badge variant="outline" className={cn("h-6 px-2.5 text-xs border-0", config.badge)}>
          <Icon className="mr-1 h-3.5 w-3.5" />
          {safeItems.length}
        </Badge>
      </div>

      {safeItems.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="p-5 text-center text-xs text-muted-foreground whitespace-pre-line">
            {config.emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {safeItems.map((item) => {
            const href = item.href;
            const label = getLabel(item);
            if (!href || !label) return null;
            return (
              <Link
                key={item.id}
                href={href}
                className="group relative block rounded-lg p-[1px]"
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100",
                    config.glow
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                    config.border
                  )}
                />
                <div className="relative rounded-lg border border-gray-200 bg-white transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-transparent dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between gap-3 p-3">
                    <h3
                      className={cn(
                        "text-sm font-medium text-foreground transition-colors duration-200",
                        config.labelHover
                      )}
                    >
                      {label}
                    </h3>
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                        config.circle,
                        config.circleHover
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
