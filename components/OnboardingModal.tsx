"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type Step = 1 | 2 | 3;

export function OnboardingModal() {
  const { user, updateUser } = useFinanceStore();
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    monthlyIncome: "",
    monthlyBudget: "",
    currentSavings: "",
    targetSavings: "",
    cityAvgIncome: "",
  });

  // Only show if no user profile AND not dismissed
  if (user || dismissed) return null;

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFinish = async () => {
    setSaving(true);
    await updateUser({
      name: form.name || "Pengguna",
      monthlyIncome: parseFloat(form.monthlyIncome) || 0,
      monthlyBudget: parseFloat(form.monthlyBudget) || 0,
      currentSavings: parseFloat(form.currentSavings) || 0,
      targetSavings: parseFloat(form.targetSavings) || 0,
      cityAvgIncome: parseFloat(form.cityAvgIncome) || 0,
    });
    setSaving(false);
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl border border-gray-800 bg-gray-950 shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Step indicator */}
          <p className="text-xs text-gray-500 mb-6 font-medium uppercase tracking-widest">
            Langkah {step} dari 3
          </p>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="text-4xl mb-3">👋</div>
                <h2 className="text-2xl font-black text-white">Selamat datang!</h2>
                <p className="text-sm text-gray-400 mt-2">
                  FinTrack Teakillah membantu kamu lacak keuangan dengan logika nyata — tanpa AI, tanpa BS.
                </p>
              </div>
              <Input
                id="ob-name"
                label="Siapa namamu?"
                placeholder="Masukkan namamu..."
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                type="text"
              />
              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Lanjut →
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <div className="text-3xl mb-2">💰</div>
                <h2 className="text-xl font-black text-white">Set anggaran bulanan</h2>
                <p className="text-xs text-gray-500 mt-1">Bisa diubah kapan saja di Pengaturan</p>
              </div>
              <Input
                id="ob-income"
                label="Penghasilan Bulanan (Rp)"
                prefix="Rp"
                placeholder="5.000.000"
                type="number"
                value={form.monthlyIncome}
                onChange={(e) => set("monthlyIncome", e.target.value)}
              />
              <Input
                id="ob-budget"
                label="Budget Bulanan / M (Rp)"
                prefix="Rp"
                placeholder="4.000.000"
                type="number"
                value={form.monthlyBudget}
                onChange={(e) => set("monthlyBudget", e.target.value)}
              />
              <Input
                id="ob-savings"
                label="Tabungan Saat Ini / S (Rp)"
                prefix="Rp"
                placeholder="10.000.000"
                type="number"
                value={form.currentSavings}
                onChange={(e) => set("currentSavings", e.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">← Kembali</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Lanjut →</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <div className="text-3xl mb-2">🏙️</div>
                <h2 className="text-xl font-black text-white">Benchmark kota</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Untuk kalkulasi Skor Keuangan vs rata-rata kota kamu
                </p>
              </div>
              <Input
                id="ob-target"
                label="Target Tabungan / T (Rp)"
                prefix="Rp"
                placeholder="2.000.000"
                type="number"
                value={form.targetSavings}
                onChange={(e) => set("targetSavings", e.target.value)}
              />
              <Input
                id="ob-city"
                label="Rata-rata Penghasilan Kotamu (Rp)"
                prefix="Rp"
                placeholder="Jkt ~5jt / Sby ~4.5jt / Mlg ~3.5jt"
                type="number"
                value={form.cityAvgIncome}
                onChange={(e) => set("cityAvgIncome", e.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1">← Kembali</Button>
                <Button onClick={handleFinish} loading={saving} className="flex-1">
                  Mulai Lacak 🚀
                </Button>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-colors mt-2"
              >
                Lewati untuk sekarang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
