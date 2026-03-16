"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FlashcardItem {
  front: string;
  back: string;
}

interface FlashcardDeckProps {
  title: string;
  cards?: FlashcardItem[];
  className?: string;
}

const DEFAULT_CARDS: FlashcardItem[] = [
  {
    front: "Sample term or question 1",
    back: "Definition or answer 1. Replace with real data later.",
  },
  {
    front: "Sample term or question 2",
    back: "Definition or answer 2. Replace with real data later.",
  },
  {
    front: "Sample term or question 3",
    back: "Definition or answer 3. Replace with real data later.",
  },
];

export function FlashcardDeck({
  title,
  cards = DEFAULT_CARDS,
  className,
}: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = cards.length;
  const current = cards[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < total - 1;

  const goPrev = () => {
    if (hasPrev) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  };

  const goNext = () => {
    if (hasNext) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  if (total === 0) {
    return (
      <section className={cn("my-8 sm:my-10", className)} aria-label={title}>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">
          {title}
        </h2>
        <Card className="border border-border bg-card">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No flashcards yet. Add content later.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className={cn("my-8 sm:my-10", className)} aria-label={title}>
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">
        {title}
      </h2>
      <Card className="border border-border bg-card overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <p className="text-xs font-medium text-muted-foreground mb-3">
            Card {currentIndex + 1} of {total}
          </p>

          {/* 3D flip: two faces so back text is not mirrored */}
          <div
            className="perspective-1000 w-full min-h-[200px] sm:min-h-[240px]"
            style={{ perspective: "1000px" }}
          >
            <button
              type="button"
              onClick={() => setIsFlipped((f) => !f)}
              className={cn(
                "relative w-full h-full min-h-[200px] sm:min-h-[240px] cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
              )}
              aria-label={
                isFlipped ? "Flip card to show front" : "Flip card to show back"
              }
            >
              <div
                className={cn(
                  "relative w-full h-full min-h-[200px] sm:min-h-[240px] transition-transform duration-500 ease-in-out",
                  "transform-style-3d",
                  isFlipped && "rotate-y-180"
                )}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front face — no rotation, visible when not flipped */}
                <div
                  className="absolute inset-0 w-full h-full rounded-xl border-2 border-border bg-muted/40 hover:bg-muted/60 flex flex-col items-center justify-center p-6 text-center backface-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <span className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-medium">
                    Front
                  </span>
                  <p className="text-foreground font-medium leading-relaxed wrap-break-word w-full">
                    {current?.front ?? ""}
                  </p>
                </div>

                {/* Back face — pre-rotated 180deg so when flipper rotates 180deg it shows right-side out */}
                <div
                  className="absolute inset-0 w-full h-full rounded-xl border-2 border-primary/40 bg-primary/5 flex flex-col items-center justify-center p-6 text-center backface-hidden rotate-y-180"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <span className="text-xs uppercase tracking-wider text-primary mb-2 font-medium">
                    Back
                  </span>
                  <p className="text-foreground font-medium leading-relaxed wrap-break-word w-full">
                    {current?.back ?? ""}
                  </p>
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 text-center">
            Tap card to flip
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={!hasPrev}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFlipped(false)}
              className="gap-1"
            >
              <RotateCw className="h-4 w-4" /> Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={!hasNext}
              className="gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
