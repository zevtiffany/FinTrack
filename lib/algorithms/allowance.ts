import type { AllowanceResult } from "@/types";

// ─────────────────────────────────────────────
// Adaptive Daily Allowance
// ─────────────────────────────────────────────
// Remaining_budget   = M - E_used - T
// Daily_allowance    = Remaining_budget / D_left
// Penalty_factor     = E_used / (M * (days_passed / total_days))
// Adjusted_allowance = Daily_allowance / max(Penalty_factor, 1)
// ─────────────────────────────────────────────

export function calculateAllowance(
  M: number,          // Monthly budget / income
  E_used: number,     // Expenses spent so far this month
  T: number,          // Reserved savings target
  D_left: number,     // Days left in the month
  days_passed: number,// Days elapsed this month
  total_days: number  // Total days in this month
): AllowanceResult {
  const remaining_budget = M - E_used - T;
  const D = D_left <= 0 ? 1 : D_left; // guard division by zero

  const daily_allowance = remaining_budget / D;

  const expected_spend = M * (days_passed / total_days);
  const penalty_factor =
    expected_spend > 0 ? E_used / expected_spend : 1;

  const adjusted_allowance = daily_allowance / Math.max(penalty_factor, 1);

  return {
    daily_allowance,
    adjusted_allowance,
    penalty_factor,
    remaining_budget,
  };
}
