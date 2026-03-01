"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, children, ...props }, ref) => {
    const cls = cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      variant === "default" && "bg-primary text-primary-foreground hover:opacity-90",
      variant === "outline" && "border border-input bg-background hover:bg-muted",
        variant === "ghost" && "hover:bg-muted hover:text-foreground",
      size === "default" && "h-10 px-4 py-2",
      size === "sm" && "h-8 px-3 text-sm",
      className
    );
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn((children as React.ReactElement<{ className?: string }>).props?.className, cls),
      });
    }
    return (
      <button ref={ref} className={cls} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
