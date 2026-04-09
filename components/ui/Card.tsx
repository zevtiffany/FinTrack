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
        // Base glass card
        "relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden",
        "bg-white/[0.025] backdrop-blur-sm border-white/[0.07]",
        "hover:bg-white/[0.04] hover:border-white/[0.1] hover:-translate-y-0.5",
        // Variants
        variant === "danger"  && "border-red-500/20 bg-red-500/[0.04] hover:bg-red-500/[0.06]",
        variant === "warning" && "border-yellow-500/20 bg-yellow-500/[0.04] hover:bg-yellow-500/[0.06]",
        variant === "success" && "border-emerald-500/20 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.06]",
        // Glow
        glow && variant === "danger"  && "glow-red",
        glow && variant === "warning" && "glow-yellow",
        glow && variant === "success" && "glow-emerald",
        className
      )}
      {...props}
    >
      {/* Subtle inner highlight on top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
    <h3 className={cn("text-[10px] font-bold uppercase tracking-[0.15em] text-white/40", className)} {...props}>
      {children}
    </h3>
  );
}
