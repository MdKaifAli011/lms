"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavigationButtonsProps {
  prev?: { label: string; href: string } | null;
  next?: { label: string; href: string } | null;
}

export function NavigationButtons({ prev, next }: NavigationButtonsProps) {
  if (!prev && !next) return null;

  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      {prev ? (
        <Link
          href={prev.href}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Previous: {prev.label}</span>
          <span className="sm:hidden">Previous</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group inline-flex items-center gap-3 rounded-full px-6 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all"
        >
          <span className="hidden sm:inline">Next: {next.label}</span>
          <span className="sm:hidden">Next</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
