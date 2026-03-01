import React from "react";
import Link from "next/link";
import { BarChart3, BookOpen, Users, Gamepad2, ArrowRight, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: BarChart3, title: "Pro Mock Tests", desc: "Adaptive difficulty that mimics real exam pattern.", href: "/mock-tests", label: "Enter Simulator", badge: "TOP RANKERS", primary: true },
  { icon: BookOpen, title: "Material Archive", desc: "Year-wise solved archives with step-by-step solutions.", href: "/materials", label: "Browse Archive" },
  { icon: Users, title: "Prime Community", desc: "Mentors from Top IITs, AIIMS, and Ivy League.", href: "#", label: "Join Discussion" },
  { icon: Gamepad2, title: "Gamified XP", desc: "Earn XP for streaks, unlock milestones.", href: "#", label: "Leaderboard" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-14 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-5 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-14 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-2">Elite Features</h2>
          <p className="text-sm sm:text-base text-muted-foreground">The technology behind your success.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.title} href={f.href} className="group block h-full">
                <article className={cn("h-full flex flex-col rounded-xl sm:rounded-2xl p-5 sm:p-6 relative overflow-hidden bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border shadow-lg hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300")}>
                  {f.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-[10px] font-extrabold uppercase">
                        <BadgeCheck className="h-3 w-3 shrink-0" />
                        {f.badge}
                      </span>
                    </div>
                  )}
                  <div className={cn("size-12 sm:size-14 rounded-xl flex items-center justify-center shrink-0 mb-5", f.primary ? "bg-primary/10 border border-primary/20 group-hover:bg-primary" : "bg-muted/50 border border-border")}>
                    <Icon className={cn("text-2xl", f.primary ? "text-primary group-hover:text-primary-foreground" : "text-muted-foreground")} />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-foreground mb-2 pr-16 sm:pr-0">{f.title}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{f.desc}</p>
                  <span className="inline-flex items-center gap-2 text-primary font-bold text-sm group-hover:underline">
                    {f.label}
                    <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5" />
                  </span>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
