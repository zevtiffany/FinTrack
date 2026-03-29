"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export function StreakCard() {
  const { metrics } = useFinanceStore();
  const streak = metrics.streak;

  if (!streak) {
    return (
      <Card>
        <CardHeader><CardTitle>🔥 Streak Bebas Impulsif</CardTitle></CardHeader>
        <p className="text-sm text-gray-500">Tambahkan transaksi untuk mulai streak.</p>
      </Card>
    );
  }

  const isActive = streak.isActive;
  const days = streak.days;

  const emoji =
    days >= 30 ? "🏆" : days >= 14 ? "🔥" : days >= 7 ? "⚡" : days >= 3 ? "✨" : "🌱";

  const message =
    days === 0
      ? "Belanja impulsif hari ini. Mulai streak baru besok!"
      : days === 1
      ? "1 hari bersih! Pertahankan."
      : `${days} hari tanpa belanja impulsif!`;

  const variant = days >= 14 ? "success" : days >= 7 ? "warning" : days >= 1 ? "default" : "danger";

  return (
    <Card variant={variant === "default" ? "default" : variant}>
      <CardHeader>
        <CardTitle>🔥 Streak Bebas Impulsif</CardTitle>
        {isActive && days > 0 && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 rounded-full px-2 py-0.5">
            AKTIF
          </span>
        )}
      </CardHeader>

      <div className="mt-2 flex items-end gap-3">
        <span className="text-5xl">{emoji}</span>
        <div>
          <p className="text-4xl font-black text-white leading-none">{days}</p>
          <p className="text-sm text-gray-400">hari</p>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-400">{message}</p>

      {/* Milestone bar */}
      <div className="mt-4 flex items-center gap-1.5">
        {[3, 7, 14, 30].map((milestone) => (
          <div key={milestone} className="flex-1 text-center">
            <div
              className={`h-1.5 rounded-full mb-1 transition-colors ${
                days >= milestone ? "bg-emerald-500" : "bg-gray-800"
              }`}
            />
            <p className={`text-[9px] font-medium ${days >= milestone ? "text-emerald-400" : "text-gray-600"}`}>
              {milestone}h
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
