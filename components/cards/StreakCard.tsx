"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

const MILESTONES = [3, 7, 14, 30];

export function StreakCard() {
  const { metrics } = useFinanceStore();
  const streak = metrics.streak;

  if (!streak) {
    return (
      <Card>
        <CardHeader><CardTitle>🔥 Streak Bebas Impulsif</CardTitle></CardHeader>
        <p className="text-sm text-white/30 mt-2">Tambahkan transaksi untuk mulai streak.</p>
      </Card>
    );
  }

  const { isActive, days } = streak;

  const emoji = days >= 30 ? "🏆" : days >= 14 ? "🔥" : days >= 7 ? "⚡" : days >= 3 ? "✨" : "🌱";
  const message =
    days === 0 ? "Belanja impulsif hari ini. Mulai streak baru besok!"
    : days === 1 ? "1 hari bersih! Terus pertahankan."
    : `${days} hari tanpa belanja impulsif!`;

  const variant = days >= 14 ? "success" : days >= 7 ? "warning" : days >= 1 ? "default" : "danger";
  const numColor = days >= 14 ? "gradient-text-emerald" : days >= 7 ? "gradient-text-yellow" : days >= 1 ? "text-white" : "gradient-text-red";

  return (
    <Card variant={variant === "default" ? "default" : variant}>
      <CardHeader>
        <CardTitle>🔥 Streak Bebas Impulsif</CardTitle>
        {isActive && days > 0 && (
          <span
            className="text-[9px] font-bold text-emerald-400 rounded-full px-2 py-0.5"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
          >
            AKTIF
          </span>
        )}
      </CardHeader>

      <div className="mt-2 flex items-center gap-4">
        <span className={`text-4xl ${isActive && days > 0 ? "animate-float" : ""}`}>{emoji}</span>
        <div>
          <p className={`text-5xl font-black leading-none animate-count ${numColor}`}>{days}</p>
          <p className="text-xs text-white/30 mt-0.5">hari</p>
        </div>
      </div>

      <p className="mt-3 text-xs text-white/40 leading-relaxed">{message}</p>

      {/* Milestone track */}
      <div className="mt-4 flex items-center gap-2">
        {MILESTONES.map((m) => {
          const hit = days >= m;
          return (
            <div key={m} className="flex-1 text-center">
              <div
                className="h-1 rounded-full mb-1.5 transition-all duration-500"
                style={{ background: hit ? "linear-gradient(90deg, #059669, #10b981)" : "rgba(255,255,255,0.06)" }}
              />
              <p className={`text-[9px] font-bold ${hit ? "text-emerald-400" : "text-white/20"}`}>{m}h</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
