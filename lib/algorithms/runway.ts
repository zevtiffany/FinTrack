import type { Transaction, RunwayResult } from "@/types";
import { subDays, isAfter, parseISO } from "date-fns";

// ─────────────────────────────────────────────
// Survival Runway Calculation
// ─────────────────────────────────────────────
// E_avg = (0.5 * avg_7) + (0.3 * avg_14) + (0.2 * avg_30)
// days  = S / E_avg
// ─────────────────────────────────────────────

function getExpensesInWindow(
  transactions: Transaction[],
  days: number
): number[] {
  const cutoff = subDays(new Date(), days);
  return transactions
    .filter(
      (t) => t.type === "expense" && isAfter(parseISO(t.date), cutoff)
    )
    .map((t) => t.amount);
}

function dailyAverage(amounts: number[], windowDays: number): number {
  const total = amounts.reduce((sum, a) => sum + a, 0);
  return total / windowDays;
}

export function calculateRunway(
  savings: number,
  transactions: Transaction[]
): RunwayResult {
  const amounts7 = getExpensesInWindow(transactions, 7);
  const amounts14 = getExpensesInWindow(transactions, 14);
  const amounts30 = getExpensesInWindow(transactions, 30);

  const avg7 = dailyAverage(amounts7, 7);
  const avg14 = dailyAverage(amounts14, 14);
  const avg30 = dailyAverage(amounts30, 30);

  const E_avg = 0.5 * avg7 + 0.3 * avg14 + 0.2 * avg30;

  if (E_avg === 0) {
    return { days: Infinity, hours: 0, E_avg: 0, isInfinite: true };
  }

  const totalDays = savings / E_avg;
  const days = Math.floor(totalDays);
  const hours = Math.floor((totalDays % 1) * 24);

  return { days, hours, E_avg, isInfinite: false };
}
