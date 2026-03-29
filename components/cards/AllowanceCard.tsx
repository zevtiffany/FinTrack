"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatIDR } from "@/lib/utils/formatCurrency";

export function AllowanceCard() {
  const { metrics, settings } = useFinanceStore();
  const allowance = metrics.allowance;

  if (!allowance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jatah Harian</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500">Belum ada data.</p>
      </Card>
    );
  }

  const exceeded = allowance.adjusted_allowance <= 0;
  const penaltyActive = allowance.penalty_factor > 1;
  const variant = exceeded ? "danger" : penaltyActive ? "warning" : "success";

  return (
    <Card variant={variant} glow={exceeded}>
      <CardHeader>
        <CardTitle>💸 Jatah Harian</CardTitle>
        <Badge
          label={exceeded ? "Kelebihan" : penaltyActive ? "Penalti" : "Normal"}
          variant={variant}
        />
      </CardHeader>

      <div className="mt-2">
        <p className="text-3xl font-black text-white tracking-tight">
          {settings.silentWealthMode
            ? "Rp ••••••"
            : formatIDR(Math.max(allowance.adjusted_allowance, 0))}
        </p>
        <p className="text-xs text-gray-500 mt-1">hari ini</p>
      </div>

      {penaltyActive && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-yellow-900/20 border border-yellow-800/40 px-3 py-2">
          <span className="text-yellow-400 text-sm">⚠️</span>
          <p className="text-xs text-yellow-400">
            Penalti aktif (×{allowance.penalty_factor.toFixed(2)}). Kamu overspending bulan ini.
          </p>
        </div>
      )}

      {!settings.silentWealthMode && (
        <p className="mt-3 text-xs text-gray-500">
          Sisa anggaran:{" "}
          <span className={allowance.remaining_budget < 0 ? "text-red-400 font-medium" : "text-gray-300 font-medium"}>
            {formatIDR(allowance.remaining_budget)}
          </span>
        </p>
      )}
    </Card>
  );
}
