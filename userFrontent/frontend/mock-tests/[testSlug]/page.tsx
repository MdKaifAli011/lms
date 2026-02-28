'use client'

import { useState, use } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MockTestSetup({ params }: { params: Promise<{ testSlug: string }> }) {
    const resolvedParams = use(params)
    const [agreed, setAgreed] = useState(false)

    return (
        <main className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-6 sm:py-8 antialiased selection:bg-primary/30 font-sans">

                {/* Header */}
                <header className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-bold uppercase tracking-wider">
                                    Entrance 2024
                                </span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                                <span className="text-muted-foreground text-[10px] font-mono">ID: MOCK-2024-001</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-serif italic text-foreground leading-tight">
                                NEET AI-Predicted <span className="text-primary">Mock Test</span>
                            </h1>
                            <p className="text-muted-foreground max-w-2xl text-sm font-light leading-relaxed">
                                Verify your identity and system requirements. This test uses real-time AI invigilation for NEET/JEE standards compliance.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-card/20 backdrop-blur-md border border-border px-5 py-3 rounded-2xl flex flex-col items-center">
                                <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Time Limit</span>
                                <span className="text-xl font-bold text-foreground tracking-tight">180<span className="text-sm text-muted-foreground ml-1 font-medium">m</span></span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-5">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <StatsCard icon={<HelpCircle className="w-3.5 h-3.5" />} title="Questions" value="180" sub="Total" />
                            <StatsCard icon={<Award className="w-3.5 h-3.5" />} title="Max Marks" value="720" />
                            <StatsCard icon={<PlusCircle className="w-3.5 h-3.5" />} title="Correct" value="+4" colorClass="text-green-400" borderClass="border-l-green-500/30" titleColorClass="text-green-500/70" />
                            <StatsCard icon={<MinusCircle className="w-3.5 h-3.5" />} title="Negative" value="-1" colorClass="text-rose-400" borderClass="border-l-rose-500/30" titleColorClass="text-rose-400/70" />
                        </div>

                        {/* Regulations Panel */}
                        <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-5 md:p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                                    <Gavel className="w-6 h-6 text-primary" />
                                    Exam Regulations
                                </h2>
                            </div>
                            <div className="grid gap-4">
                                <RegulationItem number="01">
                                    The examination follows a strict timer synchronization. The server clock will be the final authority for test completion.
                                </RegulationItem>
                                <RegulationItem number="02">
                                    The Question Palette on the right will track your progress: <span className="text-green-400 font-semibold italic">Answered</span>, <span className="text-rose-400 font-semibold italic">Unanswered</span>, and <span className="text-blue-400 font-semibold italic">Marked for Review</span>.
                                </RegulationItem>
                                <RegulationItem number="03">
                                    Leaving the full-screen mode or switching windows is prohibited. AI detection will flag any suspicious activity immediately.
                                </RegulationItem>
                                <RegulationItem number="04">
                                    <span className="text-foreground font-medium">Your webcam must remain active throughout the session. Ensure adequate lighting on your face.</span>
                                </RegulationItem>
                            </div>

                            {/* Syllabus */}
                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-sm font-bold text-foreground">Syllabus Coverage</h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <SyllabusCard subject="Physics" count="45" color="blue" />
                                    <SyllabusCard subject="Chemistry" count="45" color="yellow" />
                                    <SyllabusCard subject="Biology" count="90" color="rose" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - System Check */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-4 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-primary" />
                                    System Check
                                </h2>
                                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            </div>

                            <div className="space-y-3">
                                {/* Camera Feed Mockup */}
                                <div className="relative rounded-xl overflow-hidden bg-background ring-1 ring-border shadow-xl group">
                                    <div className="aspect-video flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
                                        <div className="text-center p-4 z-20">
                                            <Video className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                                            <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider italic leading-tight">Video Stream Encrypted</p>
                                        </div>
                                        <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background/60 border border-border backdrop-blur-md">
                                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                                            <span className="text-[8px] font-bold text-primary uppercase tracking-tighter">Live Camera</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <SystemStatusRow
                                        icon={<Wifi className="w-3.5 h-3.5" />}
                                        title="Connectivity"
                                        detail="22ms Latency"
                                        status="STABLE"
                                        statusColor="blue"
                                    />
                                    <SystemStatusRow
                                        icon={<Mic className="w-3.5 h-3.5" />}
                                        title="Microphone"
                                        detail="Standard Audio Device"
                                        status="READY"
                                        statusColor="slate"
                                    />
                                </div>

                                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                                    <div className="flex gap-2">
                                        <BatteryCharging className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                                        <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                            Please ensure your device is connected to a <span className="text-destructive font-semibold underline decoration-destructive/30">power source</span>. Battery failure is not grounds for a re-test.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card/40 backdrop-blur-md border border-border rounded-xl p-4 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 text-foreground/5 group-hover:text-destructive/10 transition-colors duration-500">
                                <Activity className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-5 h-5 rounded bg-destructive/20 flex items-center justify-center">
                                        <Lock className="w-2.5 h-2.5 text-destructive" />
                                    </div>
                                    <h3 className="font-bold text-xs text-foreground">AI Proctoring Active</h3>
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                    Eye tracking, ambient noise analysis, and browser activity are monitored. Data is deleted after 48 hours of result verification.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 mb-12">
                    <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-start gap-3 max-w-2xl">
                            <div className="relative flex items-center justify-center mt-0.5">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="peer h-5 w-5 rounded-md border-2 border-border bg-background text-primary focus:ring-primary focus:ring-offset-background transition-all cursor-pointer"
                                />
                            </div>
                            <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                                I confirm that I am the authorized candidate taking this exam. I have read the instructions and agree that any <span className="text-foreground font-medium">academic dishonesty</span> will result in immediate disqualification and permanent ban from LMS Doors.
                            </label>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <Link href="/mock-tests" className="px-5 py-2.5 text-center text-xs font-bold text-muted-foreground hover:text-primary transition-all uppercase tracking-wider">
                                Exit Test
                            </Link>
                            {agreed ? (
                                <Link
                                    href={`/mock-tests/${resolvedParams.testSlug}/exam`}
                                    className="px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center group transition-all bg-primary hover:opacity-95 text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 cursor-pointer"
                                >
                                    Begin Exam
                                    <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <span className="px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center bg-muted text-muted-foreground cursor-not-allowed">
                                    Begin Exam
                                    <ArrowRight className="ml-1.5 w-4 h-4" />
                                </span>
                            )}
                        </div>
                    </div>
                </div>
        </main>
    )
}

function StatsCard({
    icon,
    title,
    value,
    sub,
    colorClass = "text-foreground",
    borderClass = "",
    titleColorClass = "text-muted-foreground"
}: {
    icon: React.ReactNode
    title: string
    value: string
    sub?: string
    colorClass?: string
    borderClass?: string
    titleColorClass?: string
}) {
    return (
        <div className={cn("bg-card border border-border p-3 rounded-xl backdrop-blur-sm", borderClass)}>
            <div className={cn("flex items-center gap-1.5 mb-1", titleColorClass)}>
                {icon}
                <span className="text-[9px] font-bold uppercase tracking-wider">{title}</span>
            </div>
            <div className={cn("text-lg font-bold", colorClass)}>
                {value} {sub && <span className="text-xs font-normal text-muted-foreground">{sub}</span>}
            </div>
        </div>
    )
}

function RegulationItem({ number, children }: { number: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-card border border-border text-[9px] font-bold text-muted-foreground shrink-0">
                {number}
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
                {children}
            </p>
        </div>
    )
}

function SyllabusCard({ subject, count, color }: { subject: string, count: string, color: 'blue' | 'yellow' | 'rose' }) {
    const colors = {
        blue: { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hover: 'hover:bg-blue-500/5' },
        yellow: { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', hover: 'hover:bg-yellow-500/5' },
        rose: { text: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', hover: 'hover:bg-rose-500/5' }
    }[color]

    return (
        <div className={cn("bg-card p-3 rounded-xl border border-border group transition-all", colors.hover)}>
            <div className="flex items-center justify-between mb-2">
                <span className={cn("text-xs font-bold", colors.text)}>{subject}</span>
                <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full border", colors.bg, colors.text, colors.border)}>
                    PART A+B
                </span>
            </div>
            <div className="text-xl font-bold text-foreground">
                {count} <span className="text-[10px] font-medium text-muted-foreground ml-1">MCQs</span>
            </div>
        </div>
    )
}

function SystemStatusRow({ icon, title, detail, status, statusColor }: {
    icon: React.ReactNode
    title: string
    detail: string
    status: string
    statusColor: 'blue' | 'slate'
}) {
    const statusClass = statusColor === 'blue' ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted/10'

    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-bold text-foreground">{title}</p>
                    <p className="text-[9px] text-muted-foreground">{detail}</p>
                </div>
            </div>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full", statusClass)}>
                {status}
            </span>
        </div>
    )
}