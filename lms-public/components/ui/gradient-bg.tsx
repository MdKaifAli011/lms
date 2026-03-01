"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GradientBgProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "vibrant" | "dark" | "light" | "purple" | "blue" | "green" | "pink";
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
  children?: React.ReactNode;
}

const gradientVariants: Record<string, string> = {
  default: "from-purple-600 via-pink-600 to-indigo-600",
  subtle: "from-purple-100 via-pink-100 to-indigo-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20",
  vibrant: "from-purple-500 via-pink-500 to-indigo-500",
  dark: "from-gray-900 via-gray-800 to-gray-900",
  light: "from-gray-50 via-white to-gray-50",
  purple: "from-purple-600 via-purple-500 to-indigo-600",
  blue: "from-blue-600 via-cyan-600 to-indigo-600",
  green: "from-green-600 via-emerald-600 to-teal-600",
  pink: "from-pink-600 via-rose-600 to-purple-600",
};

const intensityVariants: Record<string, string> = {
  low: "opacity-10",
  medium: "opacity-20",
  high: "opacity-30",
};

export function GradientBg({
  className,
  variant = "default",
  intensity = "medium",
  animated = false,
  children,
  ...props
}: GradientBgProps) {
  const variantClass = gradientVariants[variant] ?? gradientVariants.default;
  const intensityClass = intensityVariants[intensity] ?? intensityVariants.medium;

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* Background gradient layer */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          variantClass,
          intensityClass,
          animated && "animate-pulse"
        )}
      />
      {/* Optional animated overlay */}
      {animated && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-tr",
            variantClass,
            "opacity-20 animate-pulse"
          )}
          style={{ animationDelay: "1s" }}
        />
      )}
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* Border gradient */
interface GradientBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "vibrant" | "purple" | "blue" | "green" | "pink";
  borderWidth?: number;
  children: React.ReactNode;
}

export function GradientBorder({
  className,
  variant = "default",
  borderWidth = 1,
  children,
  ...props
}: GradientBorderProps) {
  const variantClass = gradientVariants[variant] ?? gradientVariants.default;
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)} {...props}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", variantClass)} />
      <div
        className="relative bg-white dark:bg-gray-900 rounded-xl"
        style={{ padding: `${borderWidth}px` }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-[calc(0.75rem-1px)]">{children}</div>
      </div>
    </div>
  );
}

/* Text gradient */
interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "subtle" | "vibrant" | "purple" | "blue" | "green" | "pink";
  children: React.ReactNode;
}

export function GradientText({
  className,
  variant = "default",
  children,
  ...props
}: GradientTextProps) {
  const variantClass = gradientVariants[variant] ?? gradientVariants.default;
  return (
    <span
      className={cn("bg-gradient-to-r bg-clip-text text-transparent", variantClass, className)}
      {...props}
    >
      {children}
    </span>
  );
}

/* Button gradient */
interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "subtle" | "vibrant" | "purple" | "blue" | "green" | "pink";
  children: React.ReactNode;
}

export function GradientButton({
  className,
  variant = "default",
  children,
  ...props
}: GradientButtonProps) {
  const variantClass = gradientVariants[variant] ?? gradientVariants.default;
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-lg px-4 py-2 font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        "bg-gradient-to-r",
        variantClass,
        "shadow-lg hover:shadow-xl",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

/* Card gradient */
interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "vibrant" | "purple" | "blue" | "green" | "pink";
  children: React.ReactNode;
}

export function GradientCard({
  className,
  variant = "default",
  children,
  ...props
}: GradientCardProps) {
  const variantClass = gradientVariants[variant] ?? gradientVariants.default;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border",
        "bg-card shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className={cn("h-1 bg-gradient-to-r", variantClass)} />
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

export { gradientVariants, intensityVariants };
