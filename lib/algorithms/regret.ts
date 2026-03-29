import type { Transaction, RegretResult } from "@/types";
import { EmotionalTag } from "@/types";

// ─────────────────────────────────────────────
// Regret Meter
// ─────────────────────────────────────────────
// Regret_score = Σ (amount * emotional_weight)
// ─────────────────────────────────────────────

export function calculateRegret(transactions: Transaction[]): RegretResult {
  const expenses = transactions.filter((t) => t.type === "expense");

  let totalRegret = 0;
  const breakdown = { needs: 0, planned: 0, impulsive: 0 };

  for (const tx of expenses) {
    const weight = EmotionalTag[tx.emotionalTag] as unknown as number;
    totalRegret += tx.amount * weight;

    if (tx.emotionalTag === "Needs") breakdown.needs += tx.amount;
    else if (tx.emotionalTag === "Planned") breakdown.planned += tx.amount;
    else if (tx.emotionalTag === "Impulsive") breakdown.impulsive += tx.amount;
  }

  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const impulsivePercent =
    totalExpense > 0 ? (breakdown.impulsive / totalExpense) * 100 : 0;

  return { totalRegret, impulsivePercent, breakdown };
}
