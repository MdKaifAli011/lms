import Link from "next/link";
import {
  ArrowRight,
  Search,
  Clock,
  BarChart,
  ChevronDown,
  Lock,
  Smartphone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MockTestCard } from "@/components/mock-tests/MockTestCard";

export default function MockTestHub() {
  return (
    <main className="max-w-7xl mx-auto w-full min-w-0 px-3 min-[480px]:px-4 sm:px-5 md:px-6 py-10 sm:py-12 md:py-14 selection:bg-primary/30">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
        <div>
          <div className="inline-flex items-center justify-center mb-3 sm:mb-4">
            <span className="h-1 w-10 rounded-full bg-primary" />
          </div>
          <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-3">
            Exam Hub
          </span>
          <h1 className="text-2xl min-[480px]:text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Mock Test <span className="text-primary">Selection</span>
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-muted-foreground max-w-xl">
            Choose from our AI-curated list of mock tests designed to simulate real exam environments
            and difficulty levels.
          </p>
        </div>
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              className="w-full h-10 sm:h-11 pl-9 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
              placeholder="Search exams (NEET, JEE, CAT...)"
              type="text"
            />
          </div>
        </div>
      </div>

      <section className="mb-10 sm:mb-12">
        <Card className="overflow-hidden border border-border bg-card shadow-lg transition-all hover:shadow-xl hover:border-primary/20">
          <CardContent className="p-0">
            <div className="relative bg-muted/50 dark:bg-muted/20">
              <div className="relative z-10 grid md:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 md:p-10">
                <div>
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                    <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">
                      Recommended for You
                    </span>
                  </div>
                  <h2 className="text-xl min-[480px]:text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 leading-tight">
                    NEET AI-Predicted Mock Test 001
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                    Based on your previous performance in Biology and Physics, this test is calibrated
                    to bridge your current score gaps. Includes real-time AI invigilation.
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/60 px-3 py-2 rounded-lg border border-border text-xs sm:text-sm font-medium">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      180m
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/60 px-3 py-2 rounded-lg border border-border text-xs sm:text-sm font-medium">
                      <BarChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      720 Marks
                    </div>
                    <Link
                      href="/mock-tests/neet-ai-predicted-001"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-primary/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Start Now <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <div className="hidden md:block relative">
                  <div className="absolute -right-8 -top-8 w-48 h-48 bg-primary/15 blur-3xl rounded-full pointer-events-none" />
                  <Card className="bg-card/80 backdrop-blur-xl border border-border p-5 rounded-xl shadow-xl relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Predicted Score
                        </p>
                        <p className="text-lg font-bold text-foreground">640 – 685</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[85%] rounded-full" />
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex justify-between">
                        <span>AI Confidence Level</span>
                        <span className="text-foreground">94%</span>
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
        <button
          type="button"
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold shadow-md shadow-primary/20 hover:opacity-95 transition-all"
        >
          All Exams
        </button>
        {["NEET-UG", "JEE Main", "JEE Advanced", "CAT/MBA"].map((exam) => (
          <button
            key={exam}
            type="button"
            className="px-4 py-2 rounded-full bg-card border border-border text-muted-foreground text-xs sm:text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-colors"
          >
            {exam}
          </button>
        ))}
        <div className="ml-auto hidden lg:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-card pl-3 pr-2 py-2 rounded-full border border-border">
          <span>Sort by:</span>
          <select className="bg-transparent border-none focus:ring-0 font-semibold text-foreground cursor-pointer py-0 pl-0 pr-6 text-xs sm:text-sm">
            <option>Latest First</option>
            <option>Difficulty</option>
            <option>Duration</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <MockTestCard
          id="MOCK-2024-002"
          title="JEE Advance Practice 05"
          difficulty="Hard"
          difficultyColor="orange"
          time="180m"
          marks="360"
          questions="54"
          users={["JS", "AK", "+4k"]}
          userColors={["bg-muted", "bg-primary", "bg-muted"]}
          href="/mock-tests/jee-advance-practice-05"
        />
        <MockTestCard
          id="MOCK-2024-003"
          title="NEET Full-Length Test 12"
          difficulty="Medium"
          difficultyColor="blue"
          time="200m"
          marks="720"
          questions="200"
          users={["RD", "MP", "+12k"]}
          userColors={["bg-muted", "bg-primary", "bg-muted"]}
          actionLabel="Start Now"
          href="/mock-tests/neet-full-length-test-12"
        />
        <MockTestCard
          id="MOCK-2024-004"
          title="Biology Chapter-wise: Genetics"
          difficulty="Mixed"
          difficultyColor="blue"
          time="60m"
          marks="180"
          questions="45"
          users={["TM", "+800"]}
          userColors={["bg-muted", "bg-muted"]}
          href="/mock-tests/biology-genetics"
        />

        <Card className="relative overflow-hidden bg-card/60 border border-border border-dashed opacity-80">
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60 backdrop-blur-sm">
            <div className="bg-card px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-lg">
              <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Unlocks Tomorrow
              </span>
            </div>
          </div>
          <CardContent className="p-5 sm:p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Extreme
              </span>
              <span className="text-xs text-muted-foreground">MOCK-2024-005</span>
            </div>
            <h3 className="text-lg font-bold mb-4 text-foreground">Ultimate AI Predictor 2024</h3>
            <div className="flex items-center gap-4 mb-6 text-muted-foreground text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Time</span>
                <span className="font-bold text-foreground">180m</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Marks</span>
                <span className="font-bold text-foreground">720</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  ---
                </div>
              </div>
              <button
                type="button"
                disabled
                className="bg-muted border border-transparent px-5 py-2 rounded-xl text-xs font-bold cursor-not-allowed text-muted-foreground"
              >
                Coming Soon
              </button>
            </div>
          </CardContent>
        </Card>

        <MockTestCard
          id="MOCK-2024-006"
          title="Weekly Concept Drill: Physics"
          difficulty="Easy"
          difficultyColor="blue"
          time="45m"
          marks="120"
          questions="30"
          users={["LQ", "+2k"]}
          userColors={["bg-primary", "bg-muted"]}
          actionLabel="Start Now"
          href="/mock-tests/weekly-concept-physics"
        />
        <MockTestCard
          id="MOCK-2024-007"
          title="JEE Main Advanced Math Hub"
          difficulty="Hard"
          difficultyColor="orange"
          time="120m"
          marks="300"
          questions="30"
          users={["BY", "+500"]}
          userColors={["bg-muted", "bg-muted"]}
          href="/mock-tests/jee-math-hub"
        />
      </div>

      <div className="mt-10 sm:mt-12 flex justify-center">
        <button
          type="button"
          className="text-muted-foreground hover:text-primary font-semibold flex items-center gap-2 transition-colors px-5 py-2.5 rounded-full hover:bg-primary/10"
        >
          Load More Exams
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
}
