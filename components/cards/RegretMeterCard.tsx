"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = {
  Needs: "#22c55e",
  Planned: "#eab308",
  Impulsive: "#ef4444",
};

export function RegretMeterCard() {
  const { metrics } = useFinanceStore();
  const regret = metrics.regret;

  const chartData = regret
    ? [
        { name: "Kebutuhan", value: regret.breakdown.needs, color: COLORS.Needs },
        { name: "Terencana", value: regret.breakdown.planned, color: COLORS.Planned },
        { name: "Impulsif", value: regret.breakdown.impulsive, color: COLORS.Impulsive },
      ].filter((d) => d.value > 0)
    : [];

  const impulsivePct = regret?.impulsivePercent ?? 0;
  const variant = impulsivePct > 50 ? "danger" : impulsivePct > 25 ? "warning" : "success";

  return (
    <Card variant={variant}>
      <CardHeader>
        <CardTitle>😬 Regret Meter</CardTitle>
        <span className="text-xs font-bold text-gray-300">
          {impulsivePct.toFixed(1)}% impulsif
        </span>
      </CardHeader>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} opacity={0.9} />
              ))}
            </Pie>
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
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-gray-500">Belum ada pengeluaran bulan ini.</p>
        </div>
      )}

      {regret && (
        <p className="mt-1 text-xs text-gray-500 text-center">
          Skor penyesalan:{" "}
          <span className="text-white font-semibold">
            Rp {Math.round(regret.totalRegret).toLocaleString("id-ID")}
          </span>
        </p>
      )}
    </Card>
  );
}
