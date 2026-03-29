import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "danger" | "neutral" | "info";
  className?: string;
}

export function Badge({ label, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "success" && "bg-emerald-900/50 text-emerald-400 ring-1 ring-emerald-700/50",
        variant === "warning" && "bg-yellow-900/50 text-yellow-400 ring-1 ring-yellow-700/50",
        variant === "danger" && "bg-red-900/50 text-red-400 ring-1 ring-red-700/50",
        variant === "info" && "bg-blue-900/50 text-blue-400 ring-1 ring-blue-700/50",
        variant === "neutral" && "bg-gray-800 text-gray-400 ring-1 ring-gray-700",
        className
      )}
    >
      {label}
    </span>
  );
}
