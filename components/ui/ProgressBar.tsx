import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface ProgressBarProps {
  value: number;   // 0–100
  className?: string;
  colorOverride?: string;
  showLabel?: boolean;
  height?: "sm" | "md" | "lg";
  animated?: boolean;
}

export function ProgressBar({
  value,
  className,
  colorOverride,
  showLabel,
  height = "md",
  animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  // Auto color based on value (urgency scale)
  const autoColor =
    clamped > 70
      ? "bg-emerald-500"
      : clamped > 40
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-gray-800",
          height === "sm" && "h-1.5",
          height === "md" && "h-2.5",
          height === "lg" && "h-4"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorOverride ?? autoColor,
            animated && "relative overflow-hidden"
          )}
          style={{ width: `${clamped}%` }}
        >
          {animated && (
            <span className="absolute inset-0 animate-pulse opacity-30 bg-white/30" />
          )}
        </div>
      </div>
      {showLabel && (
        <p className="mt-1 text-right text-xs text-gray-500">{clamped.toFixed(0)}%</p>
      )}
    </div>
  );
}
