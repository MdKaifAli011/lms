"use client";

import React from "react";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";
import { GradientBg } from "@/components/ui/gradient-bg";
import { PracticeTabs } from "@/components/practice/PracticeTabs";
import Link from "next/link";

export function PracticeShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />
      {/* Hero section – same feel as /practice (GradientBg + dots + glows) */}
      <GradientBg variant="subtle" intensity="low" className="relative overflow-x-hidden">
        <div
          className="absolute inset-0 -z-30 bg-[radial-gradient(hsl(var(--muted))_1px,transparent_1px)] bg-size-[18px_18px] sm:bg-size-[22px_22px]"
          aria-hidden
        />
        <div className="absolute -top-20 -left-20 sm:-top-40 sm:-left-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-primary/15 sm:bg-primary/20 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />
        <div className="absolute top-1/4 right-0 sm:top-1/3 sm:-right-40 h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-primary/10 sm:bg-indigo-500/20 blur-2xl sm:blur-3xl -z-20 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 pt-10 sm:pt-12 md:pt-14 pb-10 sm:pb-12 md:pb-14">
          <div className="mb-6 sm:mb-8">
            <Link
              href="/practice"
              className="text-sm text-muted-foreground hover:text-foreground mb-3 inline-block transition-colors"
            >
              ← Back to Practice
            </Link>
            <div className="rounded-2xl border border-border bg-white/80 dark:bg-card/60 backdrop-blur-sm shadow-sm py-3 px-4 mb-6">
              <PracticeTabs />
            </div>
            <h1 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="text-muted-foreground text-sm sm:text-base mt-1.5">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </GradientBg>
      <FooterComponent />
    </div>
  );
}
