import * as React from "react";
import { cn } from "@/lib/utils/cn";

// ─────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "danger" | "warning" | "success";
  glow?: boolean;
}

export function Card({ className, variant = "default", glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 transition-all duration-300",
        // Base
        "bg-gray-900 border-gray-800",
        // Variants
        variant === "danger" && "border-red-900/60 bg-red-950/20",
        variant === "warning" && "border-yellow-900/60 bg-yellow-950/20",
        variant === "success" && "border-emerald-900/60 bg-emerald-950/20",
        // Glow effect
        glow && variant === "danger" && "shadow-[0_0_24px_-4px_rgba(239,68,68,0.3)]",
        glow && variant === "warning" && "shadow-[0_0_24px_-4px_rgba(234,179,8,0.3)]",
        glow && variant === "success" && "shadow-[0_0_24px_-4px_rgba(34,197,94,0.3)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-3 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-xs font-semibold uppercase tracking-widest text-gray-400", className)} {...props}>
      {children}
    </h3>
  );
}
