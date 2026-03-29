import type { Transaction, StreakResult } from "@/types";
import { parseISO, subDays, format, isAfter } from "date-fns";

// ─────────────────────────────────────────────
// Streak Tracker
// ─────────────────────────────────────────────
// A "streak day" = a day where NO expense has emotionalTag === Impulsive
// Days with no expenses at all count as clean days
// ─────────────────────────────────────────────

export function calculateStreak(transactions: Transaction[]): StreakResult {
  const expenses = transactions.filter((t) => t.type === "expense");

  // Build a Set of dates that had impulsive spending
  const impulsiveDates = new Set<string>(
    expenses.filter((t) => t.emotionalTag === "Impulsive").map((t) => t.date)
  );

  const today = new Date();
  let streak = 0;
  let lastBrokenDate: string | undefined;

  // Walk backwards from today, count clean days
  for (let i = 0; i < 365; i++) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    if (impulsiveDates.has(date)) {
      lastBrokenDate = date;
      break;
    }
    streak++;
  }

  // Only count streak if user has at least some transaction history
  const hasAnyTransaction = transactions.length > 0;

  return {
    days: hasAnyTransaction ? streak : 0,
    isActive: hasAnyTransaction && !lastBrokenDate,
    lastBrokenDate,
  };
}
