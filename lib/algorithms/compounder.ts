import type { FutureValueResult } from "@/types";

// ─────────────────────────────────────────────
// Anti-Coffee Compounder
// ─────────────────────────────────────────────
// FV = X * (1 + r)^t
// ─────────────────────────────────────────────

export function calculateFutureValue(
  X: number,        // Principal amount
  r: number = 0.08, // Annual interest rate (default 8%)
  t: number = 5     // Time in years (default 5)
): FutureValueResult {
  const futureValue = X * Math.pow(1 + r, t);
  const gain = futureValue - X;

  return { futureValue, gain, principal: X };
}
