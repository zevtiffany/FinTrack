"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatIDR } from "@/lib/utils/formatCurrency";

function RingProgress({ pct, color }: { pct: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(pct / 100, 1)) * circ;
  return (
    <svg width="72" height="72" className="rotate-[-90deg] flex-shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
      <circle
        cx="36" cy="36" r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})`, transition: "stroke-dasharray 0.7s ease" }}
      />
    </svg>
  );
}

export function AllowanceCard() {
  const { metrics, settings, user } = useFinanceStore();
  const allowance = metrics.allowance;

  if (!allowance) {
    return (
      <Card>
        <CardHeader><CardTitle>💸 Jatah Harian</CardTitle></CardHeader>
        <p className="text-sm text-white/30 mt-2">Atur profil keuangan terlebih dahulu.</p>
      </Card>
    );
  }

  const exceeded = allowance.adjusted_allowance <= 0;
  const penaltyActive = allowance.penalty_factor > 1;
  const variant = exceeded ? "danger" : penaltyActive ? "warning" : "success";

  const safeDailyBase = allowance.daily_allowance || 1;
  const pct = exceeded ? 0 : Math.min((allowance.adjusted_allowance / safeDailyBase) * 100, 100);
  const ringColor = exceeded ? "#ef4444" : penaltyActive ? "#eab308" : "#10b981";
  const textClass = exceeded ? "gradient-text-red" : penaltyActive ? "gradient-text-yellow" : "gradient-text-emerald";

  return (
    <Card variant={variant} glow={exceeded}>
      <CardHeader>
        <CardTitle>💸 Jatah Harian</CardTitle>
        <Badge label={exceeded ? "Kelebihan" : penaltyActive ? "Penalti" : "Normal"} variant={variant} />
      </CardHeader>

      <div className="mt-2 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className={`text-2xl font-black tracking-tight animate-count ${textClass}`}>
            {settings.silentWealthMode ? "Rp ••••••" : formatIDR(Math.max(allowance.adjusted_allowance, 0))}
          </p>
          <p className="text-[10px] text-white/30 mt-0.5 font-medium uppercase tracking-widest">per hari</p>
        </div>
        <RingProgress pct={pct} color={ringColor} />
      </div>

      {penaltyActive && (
        <div
          className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}
        >
          <span className="text-yellow-400 text-sm flex-shrink-0">⚡</span>
          <p className="text-xs text-yellow-400/80">
            Penalti ×{allowance.penalty_factor.toFixed(2)} — overspending bulan ini
          </p>
        </div>
      )}

      {!settings.silentWealthMode && user && (
        <div className="mt-3 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/25 uppercase tracking-widest">Penghasilan</p>
            <p className="text-xs font-semibold text-white/50">{formatIDR(user.monthlyIncome)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/25 uppercase tracking-widest">Tabungan dikunci</p>
            <p className="text-xs font-semibold text-yellow-400/60">− {formatIDR(user.targetSavings)}</p>
          </div>
          <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: "0.5rem" }}>
            <p className="text-[10px] text-white/25 uppercase tracking-widest">Sisa anggaran</p>
            <p className={`text-xs font-bold ${allowance.remaining_budget < 0 ? "text-red-400" : "text-white/60"}`}>
              {formatIDR(allowance.remaining_budget)}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
