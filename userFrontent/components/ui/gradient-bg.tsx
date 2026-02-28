"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientBgProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "vibrant" | "dark" | "light" | "purple" | "blue" | "green" | "pink"
  intensity?: "low" | "medium" | "high"
  animated?: boolean
  children?: React.ReactNode
}

const gradientVariants = {
  default: "from-purple-600 via-pink-600 to-indigo-600",
  subtle: "from-purple-100 via-pink-100 to-indigo-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20",
  vibrant: "from-purple-500 via-pink-500 to-indigo-500",
  dark: "from-gray-900 via-gray-800 to-gray-900",
  light: "from-gray-50 via-white to-gray-50",
  purple: "from-purple-600 via-purple-500 to-indigo-600",
  blue: "from-blue-600 via-cyan-600 to-indigo-600",
  green: "from-green-600 via-emerald-600 to-teal-600",
  pink: "from-pink-600 via-rose-600 to-purple-600"
}

const intensityVariants = {
  low: "opacity-10",
  medium: "opacity-20",
  high: "opacity-30"
}

export function GradientBg({
  className,
  variant = "default",
  intensity = "medium",
  animated = false,
  children,
  ...props
}: GradientBgProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          gradientVariants[variant],
          intensityVariants[intensity],
          animated && "animate-pulse"
        )}
      />

      {/* Additional animated overlay for enhanced effect */}
      {animated && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-tr",
            gradientVariants[variant],
            "opacity-20 animate-pulse",
            "animation-delay-1000"
          )}
          style={{ animationDelay: "1s" }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

/* Border Gradient Component */
interface GradientBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "vibrant" | "purple" | "blue" | "green" | "pink"
  borderWidth?: number
  children: React.ReactNode
}

export function GradientBorder({
  className,
  variant = "default",
  borderWidth = 1,
  children,
  ...props
}: GradientBorderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        className
      )}
      {...props}
    >
      {/* Gradient Border */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          gradientVariants[variant]
        )}
      />

      {/* Inner Content Area */}
      <div
        className="relative bg-white dark:bg-gray-900"
        style={{ padding: `${borderWidth}px` }}
      >
        <div className="bg-white dark:bg-gray-900">
          {children}
        </div>
      </div>
    </div>
  )
}

/* Text Gradient Component */
interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "subtle" | "vibrant" | "purple" | "blue" | "green" | "pink"
  children: React.ReactNode
}

export function GradientText({
  className,
  variant = "default",
  children,
  ...props
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r bg-clip-text text-transparent",
        gradientVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

/* Button Gradient Component */
interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "subtle" | "vibrant" | "purple" | "blue" | "green" | "pink"
  children: React.ReactNode
}

export function GradientButton({
  className,
  variant = "default",
  children,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-lg px-4 py-2 font-medium text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        "bg-gradient-to-r",
        gradientVariants[variant],
        "shadow-lg hover:shadow-xl",
        className
      )}
      {...props}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

/* Card Gradient Component */
interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "vibrant" | "purple" | "blue" | "green" | "pink"
  children: React.ReactNode
}

export function GradientCard({
  className,
  variant = "default",
  children,
  ...props
}: GradientCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800",
        "bg-white dark:bg-gray-900",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}
      {...props}
    >
      {/* Top gradient accent */}
      <div
        className={cn(
          "h-1 bg-gradient-to-r",
          gradientVariants[variant]
        )}
      />

      {/* Content */}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  )
}

export { gradientVariants, intensityVariants }
