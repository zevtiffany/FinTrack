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

  // Category budget alerts
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Memuat data keuangan...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title="Dashboard" subtitle={today} />
      <div className="px-4 py-4 sm:px-6 sm:py-6 max-w-5xl mx-auto">

        {/* First-time setup */}
        {!user && (
          <div className="mb-6 rounded-2xl border border-emerald-800/50 bg-emerald-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-400">👋 Selamat datang di FinTrack Teakillah!</p>
              <p className="text-xs text-emerald-400/70 mt-1">Atur profil keuangan agar semua metrik berjalan.</p>
            </div>
            <button onClick={() => router.push("/settings")} className="w-full sm:w-auto flex-shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors">
              Atur Sekarang →
            </button>
          </div>
        )}

        {/* Notification CTA */}
        {!notifGranted && (
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-gray-800 bg-gray-900 px-4 sm:px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <div>
                <p className="text-sm font-medium text-white">Aktifkan Notifikasi Pain</p>
                <p className="text-xs text-gray-500">Dapatkan peringatan saat overspending atau runway bahaya</p>
              </div>
            </div>
            <button
              onClick={handleRequestNotif}
              disabled={notifRequesting}
              className="w-full sm:w-auto mt-1 sm:mt-0 flex-shrink-0 rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 sm:py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
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
            <div key={b.id} className="mb-3 flex items-center gap-3 rounded-2xl border border-yellow-800/50 bg-yellow-950/20 px-5 py-3">
              <span className="text-lg">⚠️</span>
              <p className="text-xs text-yellow-400 flex-1">
                Budget <strong>{b.category}</strong> {pct >= 100 ? "habis" : `${pct.toFixed(0)}% terpakai`}
                {" "}— {settings.silentWealthMode ? "Rp ••••" : formatIDR(spent)} / {settings.silentWealthMode ? "Rp ••••" : formatIDR(b.monthlyLimit)}
              </p>
            </div>
          );
        })}

        {/* Burn Rate Alert */}
        <BurnRateAlert />

        {/* Summary pills */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryPill label="Total Transaksi" value={String(transactions.length)} />
          <SummaryPill label="Pemasukan" value={settings.silentWealthMode ? "Rp ••••" : formatIDR(monthlyIncome, { compact: true })} green />
          <SummaryPill label="Pengeluaran" value={settings.silentWealthMode ? "Rp ••••" : formatIDR(monthlyExpense, { compact: true })} red />
          <SummaryPill label="Tabungan" value={settings.silentWealthMode ? "Rp ••••" : user ? formatIDR(user.currentSavings, { compact: true }) : "-"} />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <RunwayCard />
          <AllowanceCard />
          <StreakCard />
          <RegretMeterCard />
          <AntiCoffeeCard />
          <FinancialScoreCard />
        </div>
      </div>
    </>
  );
}

function SummaryPill({ label, value, green, red }: { label: string; value: string; green?: boolean; red?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-sm font-bold truncate ${green ? "text-emerald-400" : red ? "text-red-400" : "text-white"}`}>{value}</p>
    </div>
  );
}
