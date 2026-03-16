"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Award,
  PlusCircle,
  MinusCircle,
  Gavel,
  Settings,
  BatteryCharging,
  Mic,
  Wifi,
  Video,
  Lock,
  ArrowRight,
  Activity,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFullLengthMockBySlug, type FullLengthMock } from "@/lib/api";
import { toTitleCase } from "@/lib/titleCase";

export default function MockTestSetup({
  params,
}: {
  params: Promise<{ testSlug: string }>;
}) {
  const resolvedParams = use(params);
  const [agreed, setAgreed] = useState(false);
  const [mock, setMock] = useState<FullLengthMock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const slug = resolvedParams.testSlug;
    const tick = queueMicrotask || ((fn: () => void) => setTimeout(fn, 0));
    tick(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });
    getFullLengthMockBySlug(slug)
      .then((data) => {
        if (!cancelled) {
          setMock(data);
          if (!data) setError("Mock test not found");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setMock(null);
          setError(e instanceof Error ? e.message : "Failed to load mock test");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [resolvedParams.testSlug]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto w-full min-w-0 px-4 min-[480px]:px-5 sm:px-6 md:px-8 py-8 sm:py-10 antialiased selection:bg-primary/30 font-sans text-base">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
          <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
          <p className="text-base text-muted-foreground font-medium">Loading mock test…</p>
        </div>
      </main>
    );
  }

  if (error || !mock) {
    return (
      <main className="max-w-7xl mx-auto w-full min-w-0 px-4 min-[480px]:px-5 sm:px-6 md:px-8 py-8 sm:py-10 antialiased selection:bg-primary/30 font-sans text-base">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
          <h1 className="text-2xl font-bold text-foreground">Mock test not found</h1>
          <p className="text-base text-muted-foreground max-w-md leading-relaxed">{error ?? "This mock test may have been removed or the link is invalid."}</p>
          <Link
            href="/mock-tests"
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Back to Mock Tests
          </Link>
        </div>
      </main>
    );
  }

  const examLabel = toTitleCase(mock.examName ?? "Entrance");
  const mockIdDisplay = (typeof mock.mockId === "string" && mock.mockId.trim()) ? mock.mockId.trim() : "—";
  const marksPerQuestion = mock.totalQuestions > 0 ? Math.round(mock.totalMarks / mock.totalQuestions) : 4;

  return (
    <main className="max-w-7xl mx-auto w-full min-w-0 px-4 min-[480px]:px-5 sm:px-6 md:px-8 py-8 sm:py-10 antialiased selection:bg-primary/30 font-sans text-base">
      <header className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold uppercase tracking-wider">
                {examLabel}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" aria-hidden />
              <span className="text-muted-foreground text-xs font-mono">
                ID: {mockIdDisplay}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif italic text-foreground leading-tight tracking-tight">
              {mock.title}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base font-normal leading-relaxed">
              {mock.description?.trim() || "Verify your identity and system requirements. This test uses real-time AI invigilation for exam standards compliance."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-card/20 backdrop-blur-md border border-border px-6 py-4 rounded-2xl flex flex-col items-center min-w-28">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                Time Limit
              </span>
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {mock.durationMinutes}<span className="text-base text-muted-foreground ml-1 font-medium">m</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatsCard icon={<HelpCircle className="w-4 h-4" />} title="Questions" value={String(mock.totalQuestions)} sub="Total" />
            <StatsCard icon={<Award className="w-4 h-4" />} title="Max Marks" value={String(mock.totalMarks)} />
            <StatsCard
              icon={<PlusCircle className="w-4 h-4" />}
              title="Correct"
              value={`+${marksPerQuestion}`}
              colorClass="text-green-400"
              borderClass="border-l-green-500/30"
              titleColorClass="text-green-500/70"
            />
            <StatsCard
              icon={<MinusCircle className="w-4 h-4" />}
              title="Negative"
              value="-1"
              colorClass="text-rose-400"
              borderClass="border-l-rose-500/30"
              titleColorClass="text-rose-400/70"
            />
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 md:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
                <Gavel className="w-6 h-6 text-primary shrink-0" />
                Exam Regulations
              </h2>
            </div>
            <div
              className={cn(
                "text-base leading-relaxed max-w-none",
                "prose prose-base dark:prose-invert prose-p:text-muted-foreground prose-li:text-muted-foreground",
                "prose-p:my-2 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-strong:text-foreground"
              )}
            >
              {mock.regulations != null && String(mock.regulations).trim() !== "" ? (
                <div
                  dangerouslySetInnerHTML={{ __html: String(mock.regulations).trim() }}
                  className="exam-regulations-content text-muted-foreground text-[15px] leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-6 [&_ul]:my-2 [&_ul]:ml-1 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-6 [&_ol]:my-2 [&_ol]:ml-1 [&_li]:my-0.5 [&_li]:pl-1"
                />
              ) : (
                <div className="grid gap-5 text-muted-foreground">
                  <RegulationItem number="01">
                    The examination follows a strict timer synchronization. The server clock will be the
                    final authority for test completion.
                  </RegulationItem>
                  <RegulationItem number="02">
                    The Question Palette on the right will track your progress:{" "}
                    <span className="text-green-400 font-semibold italic">Answered</span>,{" "}
                    <span className="text-rose-400 font-semibold italic">Unanswered</span>, and{" "}
                    <span className="text-blue-400 font-semibold italic">Marked for Review</span>.
                  </RegulationItem>
                  <RegulationItem number="03">
                    Leaving the full-screen mode or switching windows is prohibited. AI detection will
                    flag any suspicious activity immediately.
                  </RegulationItem>
                  <RegulationItem number="04">
                    <span className="text-foreground font-medium">
                      Your webcam must remain active throughout the session. Ensure adequate lighting on
                      your face.
                    </span>
                  </RegulationItem>
                </div>
              )}
            </div>

            <div className="mt-7 pt-7 border-t border-border">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-base font-bold text-foreground">Syllabus Coverage</h3>
                <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SyllabusCard subject="Full syllabus" count={String(mock.totalQuestions)} color="blue" badge="Total" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-5">
          <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-primary shrink-0" />
                System Check
              </h2>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden />
            </div>

            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-background ring-1 ring-border shadow-xl group">
                <div className="aspect-video flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent z-10" />
                  <div className="text-center p-5 z-20">
                    <Video className="w-10 h-10 text-muted-foreground mx-auto mb-2" aria-hidden />
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider italic leading-tight">
                      Video Stream Encrypted
                    </p>
                  </div>
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-2 px-2.5 py-1 rounded-full bg-background/60 border border-border backdrop-blur-md">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-xs font-bold text-primary uppercase tracking-tight">
                      Live Camera
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <SystemStatusRow
                  icon={<Wifi className="w-4 h-4" />}
                  title="Connectivity"
                  detail="22ms Latency"
                  status="STABLE"
                  statusColor="blue"
                />
                <SystemStatusRow
                  icon={<Mic className="w-4 h-4" />}
                  title="Microphone"
                  detail="Standard Audio Device"
                  status="READY"
                  statusColor="slate"
                />
              </div>

              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="flex gap-3">
                  <BatteryCharging className="w-5 h-5 text-destructive shrink-0 mt-0.5" aria-hidden />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Please ensure your device is connected to a{" "}
                    <span className="text-destructive font-semibold underline decoration-destructive/30">
                      power source
                    </span>
                    . Battery failure is not grounds for a re-test.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-foreground/5 group-hover:text-destructive/10 transition-colors duration-500" aria-hidden>
              <Activity className="w-24 h-24" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-destructive/20 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5 text-destructive" aria-hidden />
                </div>
                <h3 className="font-bold text-sm text-foreground">AI Proctoring Active</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Eye tracking, ambient noise analysis, and browser activity are monitored. Data is
                deleted after 48 hours of result verification.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-14">
        <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="relative flex items-center justify-center mt-1 shrink-0">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={mock.locked}
                className="peer h-5 w-5 rounded-md border-2 border-border bg-background text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-describedby="terms-desc"
              />
            </div>
            <label
              id="terms-desc"
              htmlFor="terms"
              className={cn(
                "text-sm text-muted-foreground leading-relaxed select-none",
                mock.locked ? "cursor-default" : "cursor-pointer"
              )}
            >
              {mock.locked ? (
                <>This mock test is not yet available. Check back later for updates.</>
              ) : (
                <>
                  I confirm that I am the authorized candidate taking this exam. I have read the
                  instructions and agree that any{" "}
                  <span className="text-foreground font-medium">academic dishonesty</span> will result in
                  immediate disqualification and permanent ban from LMS Doors.
                </>
              )}
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/mock-tests"
              className="px-6 py-3 text-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors rounded-xl"
            >
              Exit Test
            </Link>
            {mock.locked ? (
              <span className="px-8 py-3.5 rounded-xl font-bold text-base flex items-center justify-center bg-muted text-muted-foreground cursor-not-allowed">
                Coming Soon
              </span>
            ) : agreed ? (
              <Link
                href={`/mock-tests/${resolvedParams.testSlug}/exam`}
                className="px-8 py-3.5 rounded-xl font-bold text-base flex items-center justify-center group transition-all bg-primary hover:opacity-95 text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Begin Exam
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden />
              </Link>
            ) : (
              <span className="px-8 py-3.5 rounded-xl font-bold text-base flex items-center justify-center bg-muted text-muted-foreground cursor-not-allowed">
                Begin Exam
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden />
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatsCard({
  icon,
  title,
  value,
  sub,
  colorClass = "text-foreground",
  borderClass = "",
  titleColorClass = "text-muted-foreground",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub?: string;
  colorClass?: string;
  borderClass?: string;
  titleColorClass?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border p-4 rounded-xl backdrop-blur-sm",
        borderClass
      )}
    >
      <div className={cn("flex items-center gap-2 mb-2", titleColorClass)}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      <div className={cn("text-xl font-bold tracking-tight", colorClass)}>
        {value} {sub && <span className="text-sm font-normal text-muted-foreground ml-0.5">{sub}</span>}
      </div>
    </div>
  );
}

function RegulationItem({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-card border border-border text-xs font-bold text-muted-foreground shrink-0">
        {number}
      </div>
      <p className="text-muted-foreground text-base leading-relaxed pt-0.5">{children}</p>
    </div>
  );
}

function SyllabusCard({
  subject,
  count,
  color,
  badge = "PART A+B",
}: {
  subject: string;
  count: string;
  color: "blue" | "yellow" | "rose";
  badge?: string;
}) {
  const colors = {
    blue: {
      text: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      hover: "hover:bg-blue-500/5",
    },
    yellow: {
      text: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      hover: "hover:bg-yellow-500/5",
    },
    rose: {
      text: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      hover: "hover:bg-rose-500/5",
    },
  }[color];

  return (
    <div
      className={cn(
        "bg-card p-4 rounded-xl border border-border group transition-all",
        colors.hover
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-sm font-bold", colors.text)}>{subject}</span>
        <span
          className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full border",
            colors.bg,
            colors.text,
            colors.border
          )}
        >
          {badge}
        </span>
      </div>
      <div className="text-xl font-bold text-foreground tracking-tight">
        {count} <span className="text-sm font-medium text-muted-foreground ml-1">MCQs</span>
      </div>
    </div>
  );
}

function SystemStatusRow({
  icon,
  title,
  detail,
  status,
  statusColor,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  status: string;
  statusColor: "blue" | "slate";
}) {
  const statusClass =
    statusColor === "blue" ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/10";

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
        </div>
      </div>
      <span className={cn("text-xs font-bold px-2 py-1 rounded-full", statusClass)}>
        {status}
      </span>
    </div>
  );
}
