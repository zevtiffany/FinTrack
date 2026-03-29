"use client";
import { useFinanceStore } from "@/store/useFinanceStore";

export function BurnRateAlert() {
  const { metrics } = useFinanceStore();
  const runway = metrics.runway;

  if (!runway || runway.isInfinite || runway.days >= 30) return null;

  const isEmergency = runway.days < 7;

  return (
    <div
      className={`
        flex items-center gap-3 rounded-2xl border px-5 py-4 mb-6
        animate-in slide-in-from-top-2 duration-300
        ${isEmergency
          ? "border-red-700/60 bg-red-950/30 shadow-[0_0_24px_-4px_rgba(239,68,68,0.4)]"
          : "border-yellow-700/50 bg-yellow-950/20"
        }
      `}
    >
      <span className="text-2xl flex-shrink-0">{isEmergency ? "🚨" : "⚠️"}</span>
      <div>
        <p className={`text-sm font-bold ${isEmergency ? "text-red-400" : "text-yellow-400"}`}>
          {isEmergency
            ? "DARURAT: Survival Runway < 7 Hari!"
            : `Peringatan: Runway hanya ${runway.days} hari`}
        </p>
        <p className={`text-xs mt-0.5 ${isEmergency ? "text-red-400/70" : "text-yellow-400/70"}`}>
          {isEmergency
            ? "Segera kurangi pengeluaran atau cari sumber pendapatan baru."
            : "Kamu mulai memasuki zona bahaya. Perketat anggaran sekarang."}
        </p>
      </div>
    </div>
  );
}
