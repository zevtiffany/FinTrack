import type { FinancialScoreResult } from "@/types";

// ─────────────────────────────────────────────
// Social Benchmark / Financial Health Score
// ─────────────────────────────────────────────
// savings_rate = (income - expense) / income
// score = (income / city_avg) * 0.4 + (savings_rate * 0.6)
// ─────────────────────────────────────────────

export function calculateFinancialScore(
  income: number,
  expense: number,
  city_avg: number
): FinancialScoreResult {
  const savings_rate = income > 0 ? (income - expense) / income : 0;
  const incomeRatio = city_avg > 0 ? income / city_avg : 0;

  const score = incomeRatio * 0.4 + savings_rate * 0.6;

  let category: FinancialScoreResult["category"];
  if (score >= 1.0) category = "Above Average";
  else if (score >= 0.5) category = "At Risk";
  else category = "Critical";

  return { score, category, savings_rate };
}
