"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  ArrowRight,
  History,
  Bot,
  Sparkles,
  Atom,
  Dna,
  Beaker,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";
import { cn } from "@/lib/utils";

interface FormulaToolkitProps {
  subject: string;
  title: string;
  description: string;
  pages: number;
  size: string;
  icon: React.ReactNode;
  color: "blue" | "red" | "yellow";
}

interface PreviousYearPaperProps {
  exam: string;
  year: number;
}

export default function MaterialsPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All Resources" },
    { id: "biology", label: "Biology" },
    { id: "physics", label: "Physics" },
    { id: "chemistry", label: "Chemistry" },
    { id: "mathematics", label: "Mathematics" },
    { id: "formula", label: "Formula Toolkits" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 pt-10 sm:pt-12 md:pt-14 pb-16">
        <header className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 lg:px-8 py-10 text-center sm:text-left">
          <h1 className="text-3xl min-[480px]:text-4xl sm:text-5xl font-serif italic text-foreground mb-3 tracking-tight">
            Study Materials &amp; Archives
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl">
            Premium repository of year-wise papers, curated formula toolkits, and AI-assisted
            revision guides.
          </p>
        </header>

        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 lg:px-8 mb-10">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  activeFilter === filter.id
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                    : "bg-card dark:bg-gray-800 border border-border text-muted-foreground hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 lg:px-8 pb-16">
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Formula Toolkits</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  High-yield revision sheets for quick last-minute preparation.
                </p>
              </div>
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 font-semibold text-sm flex items-center group"
              >
                View all toolkits
                <ArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" size={16} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <FormulaToolkitCard
                subject="Physics"
                title="Electromagnetism Handbook"
                description="Complete collection of Gauss's Law, Faraday's Law, and Maxwell equations with 50+ solved examples."
                pages={24}
                size="4.2 MB"
                icon={<Atom size={24} />}
                color="blue"
              />
              <FormulaToolkitCard
                subject="Biology"
                title="Genetic Mechanisms Summary"
                description="Visual mind-maps for DNA replication, transcription, and translation processes. Updated for 2024 syllabus."
                pages={18}
                size="3.8 MB"
                icon={<Dna size={24} />}
                color="red"
              />
              <FormulaToolkitCard
                subject="Chemistry"
                title="Organic Reagents Mastery"
                description="Comprehensive table of reducing agents, oxidizing agents, and named reaction catalysts."
                pages={12}
                size="2.5 MB"
                icon={<Beaker size={24} />}
                color="yellow"
              />
            </div>
          </section>

          <section className="pb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Year-wise Previous Papers</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Official question papers with verified solutions and video explanations.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
              {[2023, 2022, 2021, 2020, 2019].map((year) => (
                <PreviousYearPaperCard key={year} exam="NEET" year={year} />
              ))}

              <div className="bg-muted/50 dark:bg-slate-800/50 rounded-2xl p-6 text-center border border-dashed border-border flex flex-col items-center justify-center hover:bg-card dark:hover:bg-slate-800 transition-all cursor-pointer">
                <History className="text-muted-foreground mb-2" size={32} />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  More Archives
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="fixed right-6 sm:right-8 bottom-28 sm:bottom-8 max-xl:hidden xl:flex flex-col gap-4 z-40">
          <button
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/20 hover:scale-110 transition-transform active:scale-95 group relative"
            title="Ask AI Tutor"
            type="button"
          >
            <Bot size={24} />
            <span className="absolute right-full mr-3 bg-foreground text-background text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Ask AI Revision Guide
            </span>
          </button>
          <button
            className="w-14 h-14 bg-card border border-border text-foreground rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
            title="Flashcards"
            type="button"
          >
            <Sparkles size={24} />
          </button>
        </div>
      </div>

      <FooterComponent />
    </div>
  );
}

function FormulaToolkitCard({
  subject,
  title,
  description,
  pages,
  size,
  icon,
  color,
}: FormulaToolkitProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      text: "text-blue-600 dark:text-blue-400",
      badge: "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
    },
    red: {
      bg: "bg-rose-50 dark:bg-rose-950/30",
      text: "text-rose-600 dark:text-rose-400",
      badge: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30",
      text: "text-yellow-600 dark:text-yellow-500",
      badge: "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-500",
    },
  }[color];

  return (
    <div className="bg-card/80 dark:bg-gray-800/60 rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-gray-900/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            colorClasses.bg,
            colorClasses.text
          )}
        >
          {icon}
        </div>
        <span
          className={cn(
            "text-xs font-bold px-2 py-1 rounded uppercase tracking-widest",
            colorClasses.badge
          )}
        >
          {subject}
        </span>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{description}</p>

      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-6">
        <div className="flex items-center gap-4">
          <span className="flex items-center">
            <FileText size={14} className="mr-1" /> {pages} Pages
          </span>
          <span className="flex items-center">
            <Download size={14} className="mr-1" /> {size}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center"
        >
          <Printer size={16} className="mr-2" /> Print
        </Button>
        <Button className="py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-600/20">
          Start Review
        </Button>
      </div>
    </div>
  );
}

function PreviousYearPaperCard({ exam, year }: PreviousYearPaperProps) {
  return (
    <div className="bg-card/80 dark:bg-gray-800/60 rounded-2xl p-6 text-center border border-border shadow-sm hover:shadow-lg hover:border-blue-500/30 transition-all group cursor-pointer">
      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {exam} Paper
      </p>
      <p className="text-3xl font-bold text-foreground mb-4 group-hover:scale-110 transition-transform">
        {year}
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase hover:underline flex items-center justify-center"
        >
          <Download size={14} className="mr-1" /> PDF
        </button>
        <button
          type="button"
          className="py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-blue-600 hover:text-white text-xs font-bold uppercase transition-all"
        >
          Mock Test
        </button>
      </div>
    </div>
  );
}
