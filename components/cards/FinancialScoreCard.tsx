"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const SCORE_LABELS = {
  "Above Average": { label: "Di Atas Rata-rata", color: "emerald", emoji: "🚀" },
  "At Risk": { label: "Berisiko", color: "yellow", emoji: "⚠️" },
  "Critical": { label: "Kritis", color: "red", emoji: "🔴" },
};

export function FinancialScoreCard() {
  const { metrics, settings } = useFinanceStore();
  const score = metrics.score;

  if (!score) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skor Keuangan</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500">Atur profil keuangan terlebih dahulu.</p>
      </Card>
    );
  }

  const info = SCORE_LABELS[score.category];
  const variant =
    score.category === "Above Average"
      ? "success"
      : score.category === "At Risk"
      ? "warning"
      : "danger";

  // Normalize score to 0-100 for display
  const displayScore = Math.min(Math.round(score.score * 100), 999);
  const savingsRatePct = (score.savings_rate * 100).toFixed(1);

  return (
    <Card variant={variant}>
      <CardHeader>
        <CardTitle>📊 Skor Keuangan</CardTitle>
        <Badge label={info.label} variant={variant} />
      </CardHeader>

      <div className="mt-2 flex items-end gap-2">
        <span className="text-5xl font-black text-white tracking-tight">
          {settings.silentWealthMode ? "•••" : displayScore}
        </span>
        <span className="text-xl mb-1">{info.emoji}</span>
      </div>

      {!settings.silentWealthMode && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Tingkat tabungan</span>
            <span className={score.savings_rate >= 0.2 ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
              {savingsRatePct}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Perbandingan kota</span>
            <span className="text-gray-300 font-medium">
              {(score.score * 100).toFixed(0)} / 100
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
