"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart";
import { RegretMeterCard } from "@/components/cards/RegretMeterCard";
import { useFinanceStore } from "@/store/useFinanceStore";
import { formatIDR } from "@/lib/utils/formatCurrency";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Period = "current" | "3m" | "6m";

const PERIOD_LABELS: Record<Period, string> = {
  current: "Bulan Ini",
  "3m": "3 Bulan Terakhir",
  "6m": "6 Bulan Terakhir",
};

export default function AnalyticsPage() {
  const { transactions, settings } = useFinanceStore();
  const [period, setPeriod] = useState<Period>("current");

  const now = new Date();
  const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Current month
  const monthExp = transactions.filter((t) => t.type === "expense" && t.date.startsWith(prefix));
  const monthInc = transactions.filter((t) => t.type === "income" && t.date.startsWith(prefix));
  const totalExpense = monthExp.reduce((s, t) => s + t.amount, 0);
  const totalIncome = monthInc.reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpense;
  const impulsiveTotal = monthExp.filter((t) => t.emotionalTag === "Impulsive").reduce((s, t) => s + t.amount, 0);

  // Monthly breakdown table (last 6 months)
  const monthlyRows = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, i);
      const p = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const inc = transactions.filter((t) => t.type === "income" && t.date.startsWith(p)).reduce((s, t) => s + t.amount, 0);
      const exp = transactions.filter((t) => t.type === "expense" && t.date.startsWith(p)).reduce((s, t) => s + t.amount, 0);
      return { label: format(d, "MMM yyyy", { locale: idLocale }), income: inc, expense: exp, net: inc - exp };
    });
  }, [transactions]);

  const mask = settings.silentWealthMode;

  return (
    <>
      <Header title="Analitik" subtitle="Tren keuangan & pola pengeluaran" />
      <div className="px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* Period Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">Periode:</span>
          {(["current", "3m", "6m"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${period===p?"border-emerald-700 bg-emerald-900/30 text-emerald-400":"border-gray-800 text-gray-500 hover:text-white"}`}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Pemasukan" value={mask ? "Rp ••••••" : formatIDR(totalIncome)} color="emerald" />
          <StatCard label="Total Pengeluaran" value={mask ? "Rp ••••••" : formatIDR(totalExpense)} color="red" />
          <StatCard label="Arus Kas Bersih" value={mask ? "Rp ••••••" : formatIDR(netFlow)} color={netFlow >= 0 ? "emerald" : "red"} />
          <StatCard label="Pengeluaran Impulsif" value={mask ? "Rp ••••••" : formatIDR(impulsiveTotal)} color="yellow" />
        </div>

        {/* Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle>📈 Tren Pengeluaran vs Pemasukan (30 Hari)</CardTitle>
          </CardHeader>
          <SpendingTrendChart />
        </Card>

        {/* Category + Regret */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card>
            <CardHeader><CardTitle>🏷️ Pengeluaran per Kategori (Bulan Ini)</CardTitle></CardHeader>
            <CategoryBreakdownChart />
          </Card>
          <RegretMeterCard />
        </div>

        {/* Monthly Summary Table */}
        <Card>
          <CardHeader><CardTitle>📅 Ringkasan Bulanan (6 Bulan Terakhir)</CardTitle></CardHeader>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-2 text-left text-xs text-gray-500 font-medium">Bulan</th>
                  <th className="py-2 text-right text-xs text-gray-500 font-medium">Pemasukan</th>
                  <th className="py-2 text-right text-xs text-gray-500 font-medium">Pengeluaran</th>
                  <th className="py-2 text-right text-xs text-gray-500 font-medium">Selisih</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 text-gray-300 font-medium">{row.label}</td>
                    <td className="py-2.5 text-right text-emerald-400">{mask ? "••••" : formatIDR(row.income, { compact: true })}</td>
                    <td className="py-2.5 text-right text-red-400">{mask ? "••••" : formatIDR(row.expense, { compact: true })}</td>
                    <td className={`py-2.5 text-right font-semibold ${row.net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {mask ? "••••" : `${row.net >= 0 ? "+" : ""}${formatIDR(row.net, { compact: true })}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "emerald"|"red"|"yellow" }) {
  const colorMap = { emerald:"text-emerald-400", red:"text-red-400", yellow:"text-yellow-400" };
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-3">
      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-sm font-bold ${colorMap[color]} truncate`}>{value}</p>
    </div>
  );
}
