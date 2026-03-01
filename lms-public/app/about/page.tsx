import React from "react";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";
import AboutLMSDoors from "@/components/AboutLMSDoors";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />
      <AboutLMSDoors />
      <FooterComponent />
    </div>
  );
}
