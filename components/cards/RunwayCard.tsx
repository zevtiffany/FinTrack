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
      <Card className="sm:col-span-2 lg:col-span-full">
        <CardHeader><CardTitle>🛸 Survival Runway</CardTitle></CardHeader>
        <p className="text-sm text-white/30 mt-2">Atur profil keuangan di Pengaturan terlebih dahulu.</p>
      </Card>
    );
  }

  const isInfinite = runway.isInfinite;
  const days = isInfinite ? Infinity : runway.days;
  const variant = isInfinite || days > 90 ? "success" : days > 30 ? "warning" : "danger";
  const glow = variant === "danger";

  const progressValue = isInfinite ? 100 : Math.min((runway.days / 180) * 100, 100);

  const statusText = isInfinite ? "Tak Terbatas" : days > 90 ? "Aman" : days > 30 ? "Waspada" : "Kritis";
  const textClass = variant === "success" ? "gradient-text-emerald" : variant === "warning" ? "gradient-text-yellow" : "gradient-text-red";

  return (
    <Card variant={variant} glow={glow} className="sm:col-span-2 lg:col-span-full">
      <CardHeader>
        <CardTitle>🛸 Survival Runway</CardTitle>
        <Badge label={statusText} variant={variant} />
      </CardHeader>

      <div className="mt-2 flex items-end gap-3">
        {settings.silentWealthMode ? (
          <span className="text-4xl font-black text-white/60 tracking-tight">••••</span>
        ) : isInfinite ? (
          <span className={`text-5xl font-black tracking-tight ${textClass}`}>∞</span>
        ) : (
          <>
            <span className={`text-5xl font-black tracking-tight animate-count ${textClass}`}>{runway.days}</span>
            <span className="text-lg text-white/40 mb-1.5">hari</span>
            <span className="text-3xl font-bold text-white/60">{runway.hours}</span>
            <span className="text-lg text-white/40 mb-1.5">jam</span>
          </>
        )}
      </div>

      <ProgressBar value={progressValue} className="mt-4" height="md" animated />

      {!isInfinite && !settings.silentWealthMode && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] text-white/25 uppercase tracking-widest">Rata-rata harian</p>
          <p className="text-xs font-bold text-white/50">
            Rp {Math.round(runway.E_avg).toLocaleString("id-ID")}
          </p>
        </div>
      )}
    </Card>
  );
}
