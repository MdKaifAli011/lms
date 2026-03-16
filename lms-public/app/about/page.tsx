import React from "react";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";
import AboutLMSDoors from "@/components/AboutLMSDoors";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <ExamCategoriesBar />
      {/* Spacer: matches Header + ExamCategoriesBar height — no CLS */}
      <div className="h-[80px] sm:h-[92px] shrink-0" aria-hidden />
      <AboutLMSDoors />
      <FooterComponent />
    </div>
  );
}
