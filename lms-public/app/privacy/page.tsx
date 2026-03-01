import React from "react";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            How we collect, use, and protect your information when you use LMS Doors.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Last updated: January 2025
          </p>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-10 sm:space-y-12">
          <section className="border-b border-border pb-8">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-blue-500 shrink-0" />
              1. Information We Collect
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We collect information you provide when you register, use our services, or contact us. This may include your name, email address, phone number, exam preferences, and study progress. We also collect usage data such as pages visited, time spent, and device information to improve our platform.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-blue-500 shrink-0" />
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
              We use your information to deliver and personalize our services, process payments, send important updates, and improve our content and features. We may use aggregated, anonymized data for analytics and research. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-blue-500 shrink-0" />
              3. Data Security
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We implement industry-standard security measures to protect your data, including encryption in transit and at rest, access controls, and regular security reviews. While we strive to protect your information, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-blue-500 shrink-0" />
              4. Cookies and Similar Technologies
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how you use our platform. You can manage cookie settings in your browser, though some features may not work correctly if cookies are disabled.
            </p>
          </section>

          <section className="border-b border-border pb-8">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-blue-500 shrink-0" />
              5. Your Rights
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Depending on your location, you may have the right to access, correct, or delete your personal data, or to object to or restrict certain processing. You can update your account details in settings or contact us at contact@lmsdoors.com for requests.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-blue-500 shrink-0" />
              6. Contact Us
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              For questions about this Privacy Policy or our data practices, please contact us at{" "}
              <a href="mailto:contact@lmsdoors.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                contact@lmsdoors.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}
