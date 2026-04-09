"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  Needs: "#10b981",
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
  const pctColor = impulsivePct > 50 ? "gradient-text-red" : impulsivePct > 25 ? "gradient-text-yellow" : "gradient-text-emerald";

  return (
    <Card variant={variant}>
      <CardHeader>
        <CardTitle>😬 Regret Meter</CardTitle>
        <span className={`text-sm font-black ${pctColor}`}>
          {impulsivePct.toFixed(1)}%
        </span>
      </CardHeader>

      {chartData.length > 0 ? (
        <div className="relative">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" cy="50%"
                innerRadius={48} outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.color}
                    style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(6,6,8,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.75rem",
                  fontSize: "11px",
                  color: "#fff",
                }}
                formatter={(v: unknown) => `Rp ${Number(v).toLocaleString("id-ID")}`}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">impulsif</p>
            <p className={`text-xl font-black ${pctColor}`}>{impulsivePct.toFixed(0)}%</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-white/25">Belum ada pengeluaran bulan ini.</p>
        </div>
      )}

      {/* Legend */}
      {chartData.length > 0 && (
        <div className="mt-2 flex items-center justify-center gap-4">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="text-[10px] text-white/40">{d.name}</span>
            </div>
          ))}
        </div>
      )}

      {regret && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] text-white/25 uppercase tracking-widest">Skor penyesalan</p>
          <p className="text-xs font-bold text-white/60">
            Rp {Math.round(regret.totalRegret).toLocaleString("id-ID")}
          </p>
        </div>
      )}
    </Card>
  );
}
