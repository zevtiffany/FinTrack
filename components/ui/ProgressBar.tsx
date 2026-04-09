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

  const autoColor =
    clamped > 70
      ? "gradient-bar-emerald"
      : clamped > 40
      ? "gradient-bar-yellow"
      : "gradient-bar-red";

  const glowColor =
    clamped > 70
      ? "shadow-[0_0_8px_rgba(16,185,129,0.5)]"
      : clamped > 40
      ? "shadow-[0_0_8px_rgba(234,179,8,0.5)]"
      : "shadow-[0_0_8px_rgba(239,68,68,0.5)]";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full",
          "bg-white/[0.06]",
          height === "sm" && "h-1",
          height === "md" && "h-2",
          height === "lg" && "h-3"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            colorOverride ?? autoColor,
            animated && glowColor,
          )}
          style={{ width: `${clamped}%` }}
        >
          {animated && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                animation: "shimmer 2s infinite",
              }}
            />
          )}
        </div>
      </div>
      {showLabel && (
        <p className="mt-1 text-right text-xs text-white/30">{clamped.toFixed(0)}%</p>
      )}
    </div>
  );
}
