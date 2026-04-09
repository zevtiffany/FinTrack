"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SCORE_LABELS = {
  "Above Average": { label: "Di Atas Rata-rata", emoji: "🚀" },
  "At Risk":       { label: "Berisiko",          emoji: "⚠️" },
  "Critical":      { label: "Kritis",             emoji: "🔴" },
};

export function FinancialScoreCard() {
  const { metrics, settings } = useFinanceStore();
  const score = metrics.score;

  if (!score) {
    return (
      <Card>
        <CardHeader><CardTitle>📊 Skor Keuangan</CardTitle></CardHeader>
        <p className="text-sm text-white/30 mt-2">Atur profil keuangan terlebih dahulu.</p>
      </Card>
    );
  }

  const info = SCORE_LABELS[score.category];
  const variant =
    score.category === "Above Average" ? "success"
    : score.category === "At Risk" ? "warning"
    : "danger";

  const displayScore = Math.min(Math.round(score.score * 100), 999);
  const savingsRatePct = (score.savings_rate * 100).toFixed(1);
  const scoreColor = variant === "success" ? "gradient-text-emerald" : variant === "warning" ? "gradient-text-yellow" : "gradient-text-red";

  // Gauge bar: score as pct of 100
  const gaugePct = Math.min(displayScore, 100);

  return (
    <Card variant={variant}>
      <CardHeader>
        <CardTitle>📊 Skor Keuangan</CardTitle>
        <Badge label={info.label} variant={variant} />
      </CardHeader>

      <div className="mt-2 flex items-end gap-2">
        <span className={`text-5xl font-black tracking-tight animate-count ${scoreColor}`}>
          {settings.silentWealthMode ? "•••" : displayScore}
        </span>
        <span className="text-2xl mb-1">{info.emoji}</span>
      </div>

      {/* Gauge bar */}
      {!settings.silentWealthMode && (
        <div className="mt-4">
          <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${gaugePct}%`,
                background: variant === "success"
                  ? "linear-gradient(90deg, #059669, #10b981, #34d399)"
                  : variant === "warning"
                  ? "linear-gradient(90deg, #d97706, #eab308)"
                  : "linear-gradient(90deg, #dc2626, #ef4444)",
              }}
            />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-white/25 uppercase tracking-widest">Tingkat tabungan</p>
              <p className={`text-xs font-bold ${score.savings_rate >= 0.2 ? "text-emerald-400" : "text-red-400"}`}>
                {savingsRatePct}%
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-white/25 uppercase tracking-widest">vs kota</p>
              <p className="text-xs font-bold text-white/50">{(score.score * 100).toFixed(0)} / 100</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
