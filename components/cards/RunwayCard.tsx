"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";

export function RunwayCard() {
  const { metrics, settings } = useFinanceStore();
  const runway = metrics.runway;

  if (!runway) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Survival Runway</CardTitle>
        </CardHeader>
        <p className="text-sm text-gray-500">Atur profil keuangan di Pengaturan terlebih dahulu.</p>
      </Card>
    );
  }

  const isInfinite = runway.isInfinite;
  const days = isInfinite ? Infinity : runway.days;
  const variant = isInfinite || days > 90 ? "success" : days > 30 ? "warning" : "danger";
  const glow = variant === "danger";

  // Progress: 0–100 mapped to 0–180 days
  const progressValue = isInfinite ? 100 : Math.min((runway.days / 180) * 100, 100);

  return (
    <Card variant={variant} glow={glow} className="col-span-2">
      <CardHeader>
        <CardTitle>🛸 Survival Runway</CardTitle>
        <Badge
          label={variant === "success" ? "Aman" : variant === "warning" ? "Waspada" : "Kritis"}
          variant={variant}
        />
      </CardHeader>

      <div className="mt-2 flex items-baseline gap-2">
        {settings.silentWealthMode ? (
          <span className="text-4xl font-black text-white tracking-tight">••••</span>
        ) : isInfinite ? (
          <span className="text-4xl font-black text-emerald-400 tracking-tight">∞</span>
        ) : (
          <>
            <span className="text-4xl font-black text-white tracking-tight">{runway.days}</span>
            <span className="text-lg text-gray-400">hari</span>
            <span className="text-2xl font-bold text-gray-300">{runway.hours}</span>
            <span className="text-lg text-gray-400">jam</span>
          </>
        )}
      </div>

      <ProgressBar
        value={progressValue}
        className="mt-4"
        height="md"
        animated
      />

      {!isInfinite && !settings.silentWealthMode && (
        <p className="mt-2 text-xs text-gray-500">
          Pengeluaran harian rata-rata:{" "}
          <span className="text-gray-300 font-medium">
            Rp {Math.round(runway.E_avg).toLocaleString("id-ID")}
          </span>
        </p>
      )}
    </Card>
  );
}
