"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";
import { cn } from "@/lib/utils";

const faqGroups = [
  {
    title: "General",
    items: [
      {
        q: "What is LMS Doors?",
        a: "LMS Doors is a learning management platform designed for competitive exam preparation. We offer structured content, practice tests, mock exams, and AI-assisted tools to help you master exams like NEET, JEE, CAT, and more.",
      },
      {
        q: "How do I get started?",
        a: "Choose your exam from the Exams page, explore the syllabus hierarchy, and start with the diagnostic or foundation content. You can also take practice tests and full-length mocks from the Practice and Mock Tests sections.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes. We offer a 7-day free pass so you can explore the platform. Sign up and start with our exam selection and study materials at no cost.",
      },
    ],
  },
  {
    title: "Account & Access",
    items: [
      {
        q: "How do I reset my password?",
        a: "Use the \"Forgot password\" link on the sign-in page. Enter your registered email and we'll send you a link to set a new password.",
      },
      {
        q: "Can I access content on multiple devices?",
        a: "Yes. Your progress syncs across devices. Log in on any supported browser or device to continue where you left off.",
      },
    ],
  },
  {
    title: "Exams & Content",
    items: [
      {
        q: "Which exams are supported?",
        a: "We support NEET-UG, JEE Main, JEE Advanced, CAT/MBA, and other major competitive exams. Content is organized by exam and subject.",
      },
      {
        q: "How often is content updated?",
        a: "We align with official syllabus changes and exam patterns. Content and mock tests are updated regularly to reflect the latest trends.",
      },
    ],
  },
  {
    title: "Mock Tests & Practice",
    items: [
      {
        q: "What is the difference between practice tests and mock tests?",
        a: "Practice tests are topic or chapter-wise and shorter. Mock tests are full-length, timed simulations that mirror the real exam pattern and difficulty.",
      },
      {
        q: "Can I review my answers after a mock test?",
        a: "Yes. After submission you get a detailed report with solutions, explanations, and performance insights to help you improve.",
      },
    ],
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-4 sm:px-5 py-4 sm:py-5 hover:bg-muted/30 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-foreground text-sm sm:text-base pr-2">{question}</span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 text-muted-foreground text-sm leading-relaxed border-t border-border">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />

      <main className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 pb-16">
        <header className="mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
            <span className="h-1 w-10 rounded-full bg-blue-500" />
          </div>
          <h1 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Quick answers to common questions about LMS Doors, your account, and our content.
          </p>
        </header>

        <div className="space-y-10 sm:space-y-12">
          {faqGroups.map((group) => (
            <section key={group.title}>
              <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="h-1 w-8 rounded-full bg-blue-500 shrink-0" />
                {group.title}
              </h2>
              <div className="space-y-3">
                {group.items.map((item, idx) => {
                  const id = `${group.title}-${idx}`;
                  return (
                    <FaqItem
                      key={id}
                      question={item.q}
                      answer={item.a}
                      isOpen={openId === id}
                      onToggle={() => toggle(id)}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}
