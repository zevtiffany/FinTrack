"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export function SpendingTrendChart() {
  const { transactions } = useFinanceStore();

  // Build last 30 days aggregated daily data
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayTransactions = transactions.filter(
      (t) => t.date === dateStr && t.type === "expense"
    );
    const income = transactions
      .filter((t) => t.date === dateStr && t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = dayTransactions.reduce((s, t) => s + t.amount, 0);
    return {
      date: format(date, "d MMM", { locale: idLocale }),
      Pengeluaran: expense,
      Pemasukan: income,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#6b7280", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}rb`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111827",
            border: "1px solid #1f2937",
            borderRadius: "0.75rem",
            fontSize: "12px",
            color: "#fff",
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => `Rp ${Number(v).toLocaleString("id-ID")}`}
        />
        <Area
          type="monotone"
          dataKey="Pemasukan"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#incomeGrad)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="Pengeluaran"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#expenseGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
