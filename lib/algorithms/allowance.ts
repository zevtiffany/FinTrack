import type { AllowanceResult } from "@/types";

// ─────────────────────────────────────────────
// Adaptive Daily Allowance
// ─────────────────────────────────────────────
// Logika:
//   Spendable      = monthlyIncome - targetSavings
//   Remaining      = Spendable - E_used
//   Daily_allowance = Remaining / D_left
//
// "targetSavings" dikunci duluan dari income sebelum
// boleh belanja — prinsip Pay Yourself First.
//
// Penalty_factor     = E_used / expected_spend
// Adjusted_allowance = Daily_allowance / max(Penalty_factor, 1)
// ─────────────────────────────────────────────

export function calculateAllowance(
  monthlyIncome: number,  // Penghasilan bulanan (BUKAN budget belanja)
  E_used: number,         // Total pengeluaran bulan ini
  targetSavings: number,  // Target tabungan per bulan (dikunci duluan)
  D_left: number,         // Sisa hari bulan ini
  days_passed: number,    // Hari yang sudah berlalu
  total_days: number      // Total hari di bulan ini
): AllowanceResult {
  // Sisa yang boleh dibelanjakan setelah tabungan dikunci
  const remaining_budget = monthlyIncome - E_used - targetSavings;
  const D = D_left <= 0 ? 1 : D_left;

  const daily_allowance = remaining_budget / D;

  // Penalty: jika pengeluaran melebihi ritme normal bulan ini
  const expected_spend = (monthlyIncome - targetSavings) * (days_passed / total_days);
  const penalty_factor = expected_spend > 0 ? E_used / expected_spend : 1;

  const adjusted_allowance = daily_allowance / Math.max(penalty_factor, 1);

  return {
    daily_allowance,
    adjusted_allowance,
    penalty_factor,
    remaining_budget,
  };
}
