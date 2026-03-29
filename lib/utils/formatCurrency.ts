// ─────────────────────────────────────────────
// Currency formatter — IDR
// ─────────────────────────────────────────────

export function formatIDR(
  amount: number,
  options?: { compact?: boolean; masked?: boolean }
): string {
  if (options?.masked) return "Rp ••••••";

  if (options?.compact) {
    if (Math.abs(amount) >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `Rp ${(amount / 1_000).toFixed(0)}rb`;
    }
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
