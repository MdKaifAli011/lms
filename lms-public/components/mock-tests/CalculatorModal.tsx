"use client";

import React, { useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Op = "+" | "-" | "×" | "÷" | null;

export function CalculatorModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<Op>(null);
  const [fresh, setFresh] = useState(true);

  const append = useCallback((digit: string) => {
    setDisplay((d) => {
      if (fresh) return digit === "." ? "0." : digit;
      if (digit === "." && d.includes(".")) return d;
      if (d === "0" && digit !== ".") return digit;
      return d + digit;
    });
    setFresh(false);
  }, [fresh]);

  const clear = useCallback(() => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  }, []);

  const backspace = useCallback(() => {
    setDisplay((d) => {
      if (d.length <= 1) return "0";
      const next = d.slice(0, -1);
      setFresh(false);
      return next;
    });
  }, []);

  const doOp = useCallback(
    (nextOp: Op) => {
      const val = parseFloat(display);
      if (prev !== null && op !== null) {
        let result = 0;
        if (op === "+") result = prev + val;
        else if (op === "-") result = prev - val;
        else if (op === "×") result = prev * val;
        else if (op === "÷") result = val === 0 ? 0 : prev / val;
        const out = String(Number.isFinite(result) ? result : 0);
        setDisplay(out);
        setPrev(parseFloat(out));
      } else {
        setPrev(val);
      }
      setOp(nextOp);
      setFresh(true);
    },
    [display, prev, op]
  );

  const equals = useCallback(() => {
    if (op === null) return;
    const val = parseFloat(display);
    if (prev === null) return;
    let result = 0;
    if (op === "+") result = prev + val;
    else if (op === "-") result = prev - val;
    else if (op === "×") result = prev * val;
    else if (op === "÷") result = val === 0 ? 0 : prev / val;
    setDisplay(String(Number.isFinite(result) ? result : 0));
    setPrev(null);
    setOp(null);
    setFresh(true);
  }, [op, display, prev]);

  if (!open) return null;

  const buttons: { label: string; onClick: () => void; className?: string }[] = [
    { label: "C", onClick: clear, className: "text-rose-600 dark:text-rose-400" },
    { label: "⌫", onClick: backspace, className: "text-rose-600 dark:text-rose-400" },
    { label: "%", onClick: () => { setDisplay((d) => String(parseFloat(d) / 100)); setFresh(false); }, className: "text-muted-foreground" },
    { label: "÷", onClick: () => doOp("÷"), className: "text-primary font-bold" },
    { label: "7", onClick: () => append("7") },
    { label: "8", onClick: () => append("8") },
    { label: "9", onClick: () => append("9") },
    { label: "×", onClick: () => doOp("×"), className: "text-primary font-bold" },
    { label: "4", onClick: () => append("4") },
    { label: "5", onClick: () => append("5") },
    { label: "6", onClick: () => append("6") },
    { label: "-", onClick: () => doOp("-"), className: "text-primary font-bold" },
    { label: "1", onClick: () => append("1") },
    { label: "2", onClick: () => append("2") },
    { label: "3", onClick: () => append("3") },
    { label: "+", onClick: () => doOp("+"), className: "text-primary font-bold" },
    { label: "0", onClick: () => append("0") },
    { label: ".", onClick: () => append(".") },
    { label: "=", onClick: equals, className: "col-span-2 bg-primary text-primary-foreground font-bold hover:opacity-90" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculator-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={cn(
          "w-full max-w-xs rounded-2xl border border-border bg-card shadow-2xl overflow-hidden",
          "font-[family-name:var(--font-lexend),var(--font-sans),sans-serif]"
        )}
        style={{ fontFamily: "var(--font-lexend), var(--font-sans), sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
          <h2 id="calculator-title" className="text-sm font-bold text-foreground">
            Calculator
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close calculator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="h-14 px-4 flex items-center justify-end rounded-xl bg-muted/50 border border-border text-2xl font-bold text-foreground tabular-nums overflow-x-auto">
            {display}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={b.onClick}
                className={cn(
                  "h-12 rounded-xl border border-border bg-background text-foreground font-medium",
                  "hover:bg-muted active:scale-95 transition-all",
                  b.className
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
