"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface ExamCardProps {
  exam: {
    id: string;
    name: string;
    slug?: string;
    image?: string | { url?: string | null } | null;
    orderNumber?: number;
    seo?: { metaDescription?: string | null } | null;
  };
  showProgress?: boolean;
  mentor?: string;
  courseType?: "live" | "self-paced";
}

const placeholderGradients = [
  "from-blue-500 to-indigo-600",
  "from-blue-500 to-blue-600",
  "from-violet-500 to-purple-600",
  "from-amber-500 to-orange-600",
];

export function ExamCard({
  exam,
  showProgress = false,
  mentor: _mentor = "Expert Team", // eslint-disable-line @typescript-eslint/no-unused-vars
  courseType = "self-paced",
}: ExamCardProps) {
  const rawImage =
    exam.image && typeof exam.image === "object"
      ? (exam.image as { url?: string | null }).url ?? null
      : typeof exam.image === "string"
        ? exam.image
        : null;
  const examImage =
    rawImage &&
    rawImage !== "No Image" &&
    (rawImage.startsWith("http://") || rawImage.startsWith("https://") || rawImage.startsWith("/"))
      ? rawImage
      : null;
  const description =
    (exam.seo && typeof exam.seo === "object" && exam.seo.metaDescription) ||
    `Comprehensive preparation for ${exam.name}. Expert-designed content.`;
  const placeholderGradient =
    placeholderGradients[(exam.orderNumber ?? 0) % placeholderGradients.length];
  const firstLetter = exam.name.charAt(0).toUpperCase();
  const examHref = `/exam/${exam.slug || exam.id}`;

  return (
    <article className="group h-full flex flex-col overflow-hidden rounded-xl sm:rounded-2xl min-w-0 bg-white/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] shadow-md hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <div className="relative h-24 sm:h-32 md:h-36 overflow-hidden shrink-0">
        {examImage ? (
          <Image
            src={examImage}
            alt={exam.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 260px"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${placeholderGradient} flex items-center justify-center`}
          >
            <span className="text-3xl sm:text-4xl font-black text-white/90 drop-shadow">
              {firstLetter}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        {courseType === "live" && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-primary/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
              Live
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col min-w-0 p-3 sm:p-4">
        <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 mb-2">
          {exam.name}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-xs mb-3 line-clamp-2 leading-relaxed flex-1">
          {description}
        </p>
        {showProgress && (
          <div className="mb-3">
            <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-primary w-0" />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 dark:border-white/5 pt-3 mt-auto">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Syllabus</span>
          <Link
            href={examHref}
            className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-2 rounded-lg font-bold text-xs hover:opacity-95 transition-all"
          >
            View
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
