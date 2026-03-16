"use client";

import React from "react";
import Image from "next/image";
import { MasteryPathSection } from "@/components/home/MasteryPathSection";
import { CTASection } from "@/components/home/CTASection";
import { cn } from "@/lib/utils";

export default function AboutLMSDoors() {
  return (
    <div className="bg-background text-foreground font-sans selection:bg-primary/30 selection:text-primary-foreground min-h-screen">
      {/* Theme-aware grid + glow: light = subtle primary dots, dark = slightly stronger */}
      <style>{`
        .about-hero-grid {
          background-image: radial-gradient(circle, hsl(var(--primary) / 0.12) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .dark .about-hero-grid {
          background-image: radial-gradient(circle, hsl(var(--primary) / 0.18) 1px, transparent 1px);
        }
        .about-hero-glow {
          background: radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.12) 0%, transparent 55%);
        }
        .dark .about-hero-glow {
          background: radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--primary) / 0.2) 0%, transparent 55%);
        }
      `}</style>

      {/* Hero Section */}
      <header className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden about-hero-grid">
        <div className="absolute inset-0 about-hero-glow" aria-hidden />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" aria-hidden />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" aria-hidden />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-16 sm:py-20">
          <span
            className={cn(
              "inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase rounded-full",
              "bg-primary/15 text-primary border border-primary/30",
              "dark:bg-primary/20 dark:border-primary/40"
            )}
          >
            Evolution of Learning
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif mb-6 sm:mb-8 leading-tight text-foreground">
            Redefining the Future of <br />
            <span className="italic text-primary">Competitive Learning</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Where artificial intelligence meets elite pedagogy to create an unbreakable foundation
            for entrance exam mastery.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              className="w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/25"
            >
              Explore Our Mission
            </button>
            <button
              type="button"
              className={cn(
                "w-full md:w-auto px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-lg transition-all duration-200",
                "bg-card/80 dark:bg-card/60 backdrop-blur-md border border-border",
                "hover:bg-muted/50 dark:hover:bg-muted/40 text-foreground"
              )}
            >
              Watch Film
            </button>
          </div>
        </div>
      </header>

      {/* The Vision: 7-Level Mastery Philosophy */}
      <MasteryPathSection />

      {/* Our Story Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-muted/30 dark:bg-muted/20 relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative aspect-square rounded-xl overflow-hidden group border border-border shadow-lg">
              <Image
                alt="Team Collaboration"
                className="object-cover opacity-70 group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRPSjKZnluDZBf4EHOzOFHXQsdFS2x0tJk_Yl-ltvlHDeyWBbPeHJI-7crySzolqRqdWDnOjjv64pzVTC9LoH4uWjCKtnR3SOGjEIn9Dk-e20yj0PLt9l_G0Ki6BwMTfQcVrYDCLA6Q1bpJuR-9SSx5xMszzoGpQwFzA9LUlGRmUSm7zSZWNvBPVtdVWWtUf0nAwDQtV7lWF5cEme8-6Oao9GL2RHY-RB4ZNupwxCMLwPBzahnJkH9n5EWeN-cc7qOBhsiYgg"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/90 via-transparent to-transparent dark:from-background/95" aria-hidden />
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
                <p className="text-primary font-bold text-base sm:text-lg">Since 2018</p>
                <p className="text-muted-foreground text-sm sm:text-base">Pioneering Educational Tech</p>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-6 sm:mb-8 leading-tight text-foreground">
                The Journey from a <br />
                <span className="text-primary italic">Single Door</span> to Thousands.
              </h2>
              <div className="space-y-4 sm:space-y-6 text-muted-foreground leading-relaxed text-sm sm:text-base">
                <p>
                  LMS Doors began in a small research lab with a single question: Why do
                  high-potential students struggle with standardized testing? We discovered it
                  wasn&apos;t a lack of talent, but a lack of personalized pathway.
                </p>
                <p>
                  Our founders, a group of IITians and AI researchers, developed the &quot;LMS
                  Protocol&quot;—a series of algorithmic shifts that transform how information is
                  encoded and recalled.
                </p>
                <p>
                  Today, we serve over 50,000 students globally, providing them not just with
                  content, but with the cognitive keys to unlock their own potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Pillars: Cards */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6">
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            <div
              className={cn(
                "p-6 sm:p-8 md:p-10 rounded-xl transition-all duration-300 hover:translate-y-[-6px]",
                "bg-card border border-border shadow-sm hover:shadow-md",
                "dark:bg-card/90 dark:border-border/80"
              )}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 dark:bg-primary/15 rounded-lg flex items-center justify-center mb-6 sm:mb-8 border border-primary/20">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                </svg>
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">AI-Powered Precision</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our neural engines track over 200 data points per session, crafting a learning path
                that evolves as you do.
              </p>
            </div>

            <div
              className={cn(
                "p-6 sm:p-8 md:p-10 rounded-xl transition-all duration-300 hover:translate-y-[-6px] relative",
                "bg-card border border-primary/30 shadow-sm hover:shadow-md",
                "dark:bg-card/90 dark:border-primary/40"
              )}
            >
              <span className="absolute -top-2.5 right-6 bg-primary text-primary-foreground text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-widest">
                Core Pillar
              </span>
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 dark:bg-primary/15 rounded-lg flex items-center justify-center mb-6 sm:mb-8 border border-primary/20">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                </svg>
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">Academic Excellence</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Content curated by top-tier educators with decades of experience in competitive
                entrance exam patterns.
              </p>
            </div>

            <div
              className={cn(
                "p-6 sm:p-8 md:p-10 rounded-xl transition-all duration-300 hover:translate-y-[-6px]",
                "bg-card border border-border shadow-sm hover:shadow-md",
                "dark:bg-card/90 dark:border-border/80"
              )}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 dark:bg-primary/15 rounded-lg flex items-center justify-center mb-6 sm:mb-8 border border-primary/20">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-foreground">Student-Centric Innovation</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Designed for the modern student—intuitive interfaces, gamified progress, and 24/7
                mentor support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-muted/20 dark:bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif mb-3 sm:mb-4 text-foreground">
              The Minds Behind LMS Doors
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">Led by visionaries in education and technology.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { name: "Dr. Arjan Singh", role: "Chief Executive Officer", meta: "Ex-IIT, PhD in Cognitive Systems", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDv4YLecrXVxaKaMhIAlN5cts7spRryAGGnamjAMWHAWhPPS1NVIazmbgZduDAEWv5nVwgouBsHWdJVAk0ZlAd7OcAuVVl_oYQF6PVja8uFXNbe--P7GY-6aB9REaI_ndx1meqBzlvdPL5I288tjqNsmzU3NdTmNPxoUi8abufcPlxjYfIH0TtsphY2vxpDU98-l-P1k_pgwCwdSlXNCSUHDY0RKZ4zkuye-Y5gXk68wHMiEiaya4WA_Kd8dwWZZ6YQY4dAuCI" },
              { name: "Sarah Chen", role: "Head of AI Research", meta: "MIT Media Lab Alumna", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBx4-CnMwVe37fSxx_byTBX9LuLuliV9I9o03WkGf9EdJh4Ykei_RC1yvu-orPrXxDnd4Htmwm6y5iTDjSIBNC8lfo61GB3_IZW2-JgfvW20Agda-k-3BbU8COsfQXCDqotmhofhAEaGCAZ-kpYTq9z0OsnIr0UxKAhFcsxZ0B7plBsRMed_32isqA7FSG_TRgS1wYpHYcKRmSJdrUldPYmLmrPE96EyunhsVihbwRvnB6htntfgaNFIf-0jfDU2CFdAKlpZNI" },
              { name: "Marcus Voe", role: "Chief Pedagogy Officer", meta: "20+ Years in Competitive Prep", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAXCZUNltWnIuC9xMoQnn4LZMxp3PfsHKVndlqfClTUDt8iCgKjhCbn7tU-u9hljL8CJkOa1S7QqWkP8DLOT4urWUrcYNg2leFRnkhht9wLJL0LNrs8XrIdozjHB6Ox382aFgaiJoFWbatXdIx_he7yHOxiJXj4eWVDKemn3d1tx1CX4flowsoT9ZEaE_hAJEUL2EOmGiYTc0RrNVIvU-4Pg2UU0_DXZ4Wywqe2Hp4-rkizr92WGRqgW0m_TSXTVkb-Haf8JM" },
              { name: "Elena Rodriguez", role: "Director of Growth", meta: "Global Strategy Specialist", src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4Z6zwQ4hl8WDaNjbGgGMibzbyx3RSgzzaum3cXbMmjV5Bq-y8AVu3D4zSDna2iCR31dEpUol3zH7ac0cQ09diDd4m9nuW7gRdLYy0Z5Q1e8WwxEZ8wjf89BHCyLtDMZByujqkuzOjNUtsIONiNSa_1swgRUmdZhV9W-D9HcmSj9JmW0xGXkPAU31Q1n2pYJOGCt1okddR68ORLHdvltlSSqYrsZk74fv9WyRR-Ylo9uQYeQMbH2XDaNhPJ7yRLtTP8e4ePdg" },
            ].map((person) => (
              <div key={person.name} className="group">
                <div className="relative mb-4 overflow-hidden rounded-xl aspect-4/5 bg-muted border border-border shadow-sm">
                  <Image
                    alt={person.name}
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    src={person.src}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h5 className="text-base sm:text-lg font-bold text-foreground">{person.name}</h5>
                <p className="text-primary text-xs font-semibold uppercase tracking-widest mb-1.5 sm:mb-2">
                  {person.role}
                </p>
                <p className="text-muted-foreground text-sm">{person.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
