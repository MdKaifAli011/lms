"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { ExamCategoriesBar } from "@/components/ExamCategoriesBar";
import { FooterComponent } from "@/components/home/FooterComponent";
import { Card, CardContent } from "@/components/ui/card";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <ExamCategoriesBar />
      <div className="h-[80px]" aria-hidden />

      <main className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 pb-16">
        {/* Hero */}
        <header className="mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
            <span className="h-1 w-10 rounded-full bg-blue-500" />
          </div>
          <h1 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
            Contact Us
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
            Have a question or feedback? We&apos;d love to hear from you. Reach out and we&apos;ll get back as soon as we can.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Contact info cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="border border-border bg-card hover:border-blue-500/20 transition-colors">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <a
                      href="mailto:contact@lmsdoors.com"
                      className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                    >
                      contact@lmsdoors.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card hover:border-blue-500/20 transition-colors">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <a
                      href="tel:+1234567890"
                      className="text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                    >
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card hover:border-blue-500/20 transition-colors">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Address</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      123 Education Street, Learning City, LC 12345
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2">
            <Card className="border border-border bg-card">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <h2 className="text-lg font-bold text-foreground mb-1">Send a message</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Fill out the form below and we&apos;ll respond within 24–48 hours.
                </p>
                {submitted ? (
                  <div className="py-8 text-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-foreground font-medium">Thank you for reaching out.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      We&apos;ve received your message and will get back to you soon.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                          Name
                        </label>
                        <Input id="name" name="name" placeholder="Your name" required />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                          Email
                        </label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                        Subject
                      </label>
                      <Input id="subject" name="subject" placeholder="What is this regarding?" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        required
                        placeholder="Your message..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-y"
                      />
                    </div>
                    <Button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Send message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <FooterComponent />
    </div>
  );
}
