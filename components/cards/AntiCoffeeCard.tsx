"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { calculateFutureValue } from "@/lib/algorithms/compounder";
import { formatIDR } from "@/lib/utils/formatCurrency";

export function AntiCoffeeCard() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("5");
  const [result, setResult] = useState<ReturnType<typeof calculateFutureValue> | null>(null);

  const handle = () => {
    const X = parseFloat(amount.replace(/\D/g, ""));
    const r = parseFloat(rate) / 100;
    const t = parseFloat(years);
    if (!X || X <= 0 || isNaN(r) || isNaN(t)) return;
    setResult(calculateFutureValue(X, r, t));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>☕ Anti-Coffee Compounder</CardTitle>
      </CardHeader>

      <div className="space-y-3 mt-1">
        <Input
          id="coffee-amount"
          label="Nominal (Rp)"
          prefix="Rp"
          placeholder="50.000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min={0}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="coffee-rate"
            label="Return / tahun (%)"
            placeholder="8"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            type="number"
            min={0}
            max={100}
          />
          <Input
            id="coffee-years"
            label="Tahun"
            placeholder="5"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            type="number"
            min={1}
            max={50}
          />
        </div>
        <Button
          id="coffee-calculate"
          onClick={handle}
          className="w-full"
          size="md"
        >
          Hitung Masa Depan ✨
        </Button>

        {result && (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/40 p-4 space-y-2 animate-in fade-in duration-300">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Modal awal</span>
              <span className="text-white font-medium">{formatIDR(result.principal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Keuntungan</span>
              <span className="text-emerald-400 font-medium">+{formatIDR(result.gain)}</span>
            </div>
            <div className="flex justify-between border-t border-emerald-800/40 pt-2">
              <span className="text-sm font-semibold text-white">Nilai Masa Depan</span>
              <span className="text-lg font-black text-emerald-400">{formatIDR(result.futureValue)}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
