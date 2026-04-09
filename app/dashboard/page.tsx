"use client";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { RunwayCard } from "@/components/cards/RunwayCard";
import { AllowanceCard } from "@/components/cards/AllowanceCard";
import { RegretMeterCard } from "@/components/cards/RegretMeterCard";
import { AntiCoffeeCard } from "@/components/cards/AntiCoffeeCard";
import { FinancialScoreCard } from "@/components/cards/FinancialScoreCard";
import { BurnRateAlert } from "@/components/cards/BurnRateAlert";
import { StreakCard } from "@/components/cards/StreakCard";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { requestNotificationPermission } from "@/lib/utils/notifications";
import { formatIDR } from "@/lib/utils/formatCurrency";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function DashboardPage() {
  const { isLoading, transactions, user, settings, updateSettings, categoryBudgets } = useFinanceStore();
  const router = useRouter();
  const [notifRequesting, setNotifRequesting] = useState(false);
  const [notifGranted, setNotifGranted] = useState(settings.notificationsEnabled);
  const today = format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale });

  const prefix = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const monthlyIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(prefix))
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith(prefix))
    .reduce((s, t) => s + t.amount, 0);

  const budgetAlerts = categoryBudgets.filter((b) => {
    const spent = transactions
      .filter((t) => t.type === "expense" && t.category === b.category && t.date.startsWith(prefix))
      .reduce((s, t) => s + t.amount, 0);
    return spent >= b.monthlyLimit * 0.8;
  });

  const handleRequestNotif = async () => {
    setNotifRequesting(true);
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    updateSettings({ notificationsEnabled: granted });
    setNotifRequesting(false);
  };

  if (isLoading) {
    return (
      <div className="px-4 py-4 sm:px-6 sm:py-6 max-w-5xl mx-auto">
        {/* Skeleton Header */}
        <div className="mb-6">
          <div className="skeleton h-7 w-48 mb-2" />
          <div className="skeleton h-4 w-32" />
        </div>
        {/* Skeleton Hero */}
        <div className="skeleton h-20 w-full mb-6 rounded-2xl" />
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title={`${getGreeting()}${user ? `, ${user.name.split(" ")[0]}` : ""} 👋`} subtitle={today} />
      <div className="relative z-10 px-4 py-4 sm:px-6 sm:py-6 max-w-5xl mx-auto">

        {/* First-time setup */}
        {!user && (
          <div
            className="mb-6 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-up"
            style={{
              background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(52,211,153,0.05) 100%)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <div>
              <p className="text-sm font-bold text-emerald-400">Atur profil keuanganmu</p>
              <p className="text-xs text-emerald-400/60 mt-1">Setup profil agar semua metrik & kalkulasi berjalan.</p>
            </div>
            <button
              onClick={() => router.push("/settings")}
              className="w-full sm:w-auto flex-shrink-0 rounded-xl px-4 py-2.5 sm:py-2 text-xs font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}
            >
              Atur Sekarang →
            </button>
          </div>
        )}

        {/* Notification CTA */}
        {!notifGranted && (
          <div
            className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl px-4 sm:px-5 py-3 animate-in slide-up"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <div>
                <p className="text-sm font-semibold text-white/80">Aktifkan Notifikasi</p>
                <p className="text-xs text-white/30">Peringatan overspending & runway bahaya</p>
              </div>
            </div>
            <button
              onClick={handleRequestNotif}
              disabled={notifRequesting}
              className="w-full sm:w-auto mt-1 sm:mt-0 flex-shrink-0 rounded-xl px-3 py-2 sm:py-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-50"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)" }}
            >
              {notifRequesting ? "..." : "Aktifkan"}
            </button>
          </div>
        )}

        {/* Category budget alerts */}
        {budgetAlerts.map((b) => {
          const spent = transactions
            .filter((t) => t.type === "expense" && t.category === b.category && t.date.startsWith(prefix))
            .reduce((s, t) => s + t.amount, 0);
          const pct = (spent / b.monthlyLimit) * 100;
          return (
            <div
              key={b.id}
              className="mb-3 flex items-center gap-3 rounded-2xl px-5 py-3"
              style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)" }}
            >
              <span className="text-lg">⚠️</span>
              <p className="text-xs text-yellow-400/90 flex-1">
                Budget <strong>{b.category}</strong> {pct >= 100 ? "habis" : `${pct.toFixed(0)}% terpakai`}
                {" "}— {settings.silentWealthMode ? "Rp ••••" : formatIDR(spent)} / {settings.silentWealthMode ? "Rp ••••" : formatIDR(b.monthlyLimit)}
              </p>
            </div>
          );
        })}

        {/* Burn Rate Alert */}
        <BurnRateAlert />

        {/* Hero Summary Bar */}
        <div
          className="mb-6 rounded-2xl p-4 animate-in slide-up"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.05]">
            <HeroStat label="Transaksi" value={String(transactions.length)} />
            <HeroStat label="Pemasukan" value={settings.silentWealthMode ? "Rp ••••" : formatIDR(monthlyIncome, { compact: true })} color="emerald" />
            <HeroStat label="Pengeluaran" value={settings.silentWealthMode ? "Rp ••••" : formatIDR(monthlyExpense, { compact: true })} color="red" />
            <HeroStat label="Tabungan" value={settings.silentWealthMode ? "Rp ••••" : user ? formatIDR(user.currentSavings, { compact: true }) : "—"} color="blue" />
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RunwayCard />
          <AllowanceCard />
          <StreakCard />
          <RegretMeterCard />
          <AntiCoffeeCard />
          <FinancialScoreCard />
        </div>

        {/* Budget Progress Summary */}
        {categoryBudgets.length > 0 && (
          <div
            className="mt-5 rounded-2xl p-4 sm:p-5"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-4">🎯 Budget per Kategori</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryBudgets.map((b) => {
                const spent = transactions
                  .filter((t) => t.type === "expense" && t.category === b.category && t.date.startsWith(prefix))
                  .reduce((s, t) => s + t.amount, 0);
                const pct = b.monthlyLimit > 0 ? Math.min((spent / b.monthlyLimit) * 100, 100) : 0;
                const isOver  = pct >= 100;
                const isWarn  = pct >= 80 && !isOver;
                const barColor = isOver ? "#ef4444" : isWarn ? "#eab308" : "#10b981";
                const CAT_LABELS_LOCAL: Record<string, string> = { Food:"Makanan",Transport:"Transportasi",Entertainment:"Hiburan",Shopping:"Belanja",Health:"Kesehatan",Education:"Pendidikan",Utilities:"Utilitas",Housing:"Hunian",Savings:"Tabungan",Investment:"Investasi",Salary:"Gaji",Freelance:"Freelance",Other:"Lainnya" };
                return (
                  <div key={b.id}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-white/70">{CAT_LABELS_LOCAL[b.category] ?? b.category}</p>
                      <p className={`text-[10px] font-bold ${ isOver ? "text-red-400" : isWarn ? "text-yellow-400" : "text-white/30" }`}>
                        {settings.silentWealthMode ? "••• / •••" : `${formatIDR(spent, { compact: true })} / ${formatIDR(b.monthlyLimit, { compact: true })}`}
                        {isOver && " 🚨"}
                      </p>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 6px ${barColor}60` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function HeroStat({ label, value, color }: { label: string; value: string; color?: "emerald" | "red" | "blue" }) {
  const colorClass =
    color === "emerald" ? "gradient-text-emerald"
    : color === "red" ? "gradient-text-red"
    : color === "blue" ? "gradient-text-blue"
    : "text-white";
  return (
    <div className="px-4 py-1 first:pl-0 last:pr-0 sm:first:pl-4 sm:last:pr-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 mb-1">{label}</p>
      <p className={`text-base font-black truncate ${colorClass}`}>{value}</p>
    </div>
  );
}

