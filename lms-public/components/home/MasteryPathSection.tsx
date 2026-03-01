"use client";

import React from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const timelineSteps = [
  { step: "01", title: "Diagnostic Baseline", description: "Choose your exam and take a baseline assessment. We identify your strengths and gaps.", label: "Initial Assessment", side: "left" as const, nodeActive: true, isFinal: false },
  { step: "02", title: "Concept Mapping", description: "Explore the full curriculum in a clear hierarchy. See how concepts connect.", label: "Structure", side: "right" as const, nodeActive: false, isFinal: false },
  { step: "03", title: "Foundation Building", description: "Study structured content for every subject and unit. Master theory with expert notes.", label: "Growth", side: "left" as const, nodeActive: false, isFinal: false },
  { step: "04", title: "Practice & Application", description: "Topic-wise practice and chapter-level exercises. Build speed and confidence.", label: "Practice", side: "right" as const, nodeActive: false, isFinal: false },
  { step: "05", title: "Mock Tests & Simulation", description: "Full-length mocks that mirror real exam pattern and timing.", label: "Test", side: "left" as const, nodeActive: false, isFinal: false },
  { step: "06", title: "Performance Optimization", description: "Pinpoint weak areas. Revise by subject and unit. Optimize your plan.", label: "Refine", side: "right" as const, nodeActive: false, isFinal: false },
  { step: "07", title: "Absolute Exam Mastery", description: "Final revision and exam-day readiness. Deliver your best.", label: "Target: Rank 1", side: "left" as const, nodeActive: false, isFinal: true },
];

export function MasteryPathSection() {
  return (
    <section id="mastery" className="relative overflow-x-hidden py-14 sm:py-20 md:py-24 px-3 sm:px-5 md:px-6 bg-muted/30 dark:bg-muted/20 border-y border-border">
      <div className="max-w-4xl mx-auto w-full min-w-0">
        <div className="mb-10 sm:mb-14 text-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-3 text-foreground">The 7-Level Mastery Path</h2>
          <p className="text-sm sm:text-base max-w-2xl mx-auto text-muted-foreground">From diagnostic assessment to exam-day mastery.</p>
        </div>
        <div className="relative">
          <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-[2px] md:-translate-x-1/2 bg-border" aria-hidden />
          <div className="space-y-8 md:space-y-12">
            {timelineSteps.map((item) => (
              <div key={item.step} className="relative flex flex-col md:flex-row items-stretch md:items-center group">
                <div className={cn("flex-1 hidden md:block", item.side === "left" ? "md:text-right md:pr-8" : "md:pl-8 md:order-1")}>
                  {item.side === "left" ? (
                    <span className={cn("text-xs font-black uppercase", item.nodeActive ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                  ) : (
                    <div className="p-4 md:p-6 rounded-xl bg-card border border-border shadow-lg md:text-right">
                      <span className="text-xl font-black text-primary/70">{item.step}</span>
                      <h4 className="text-lg font-bold text-foreground mt-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  )}
                </div>
                <div className="z-10 shrink-0 flex items-center justify-center md:order-2 self-start md:self-center size-8 md:size-10">
                  {item.isFinal ? (
                    <div className="rounded-full border-2 flex items-center justify-center w-full h-full bg-primary border-primary/30">
                      <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className={cn("rounded-full border-2 flex items-center justify-center w-full h-full bg-background", item.nodeActive ? "border-primary" : "border-border")}>
                      <span className={cn("rounded-full size-1.5", item.nodeActive ? "bg-primary" : "bg-muted-foreground")} />
                    </div>
                  )}
                </div>
                <div className={cn("flex-1 md:order-3", item.side === "left" ? "md:pl-8 ml-6 md:ml-0" : "md:pr-8 mr-6 md:mr-0")}>
                  {item.side === "left" ? (
                    <div className="p-4 md:p-6 rounded-xl bg-card border border-border shadow-lg">
                      <span className="text-xl font-black text-primary/70">{item.step}</span>
                      <h4 className="text-lg font-bold text-foreground mt-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ) : (
                    <>
                      <div className="md:hidden">
                        <div className="p-4 md:p-6 rounded-xl bg-card border border-border shadow-lg">
                          <span className="text-xl font-black text-primary/70">{item.step}</span>
                          <h4 className="text-lg font-bold text-foreground mt-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <span className={cn("text-xs font-black uppercase", item.isFinal ? "text-primary italic" : "text-muted-foreground")}>{item.label}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
