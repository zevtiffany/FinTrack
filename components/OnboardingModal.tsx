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

  const steps = [
    { label: "Profil" },
    { label: "Keuangan" },
    { label: "Benchmark" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }}>
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{
          background: "rgba(10,10,15,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 80px rgba(16,185,129,0.1), 0 20px 60px rgba(0,0,0,0.8)",
        }}
      >
        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)" }} />

        {/* Progress steps */}
        <div className="flex items-center gap-0 px-6 pt-6 pb-4">
          {steps.map((s, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 transition-all duration-300"
                  style={{
                    background: done ? "linear-gradient(135deg,#059669,#10b981)"
                      : active ? "rgba(16,185,129,0.15)"
                      : "rgba(255,255,255,0.04)",
                    border: done ? "none"
                      : active ? "1px solid rgba(16,185,129,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: done ? "#fff" : active ? "#10b981" : "rgba(255,255,255,0.2)",
                  }}
                >
                  {done ? "✓" : idx}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="flex-1 h-px mx-2 transition-all duration-500"
                    style={{ background: done ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-6 space-y-5">
          {step === 1 && (
            <div className="space-y-5 animate-in slide-up">
              <div>
                <div className="text-3xl mb-3">👋</div>
                <h2 className="text-xl font-black text-white">Selamat datang!</h2>
                <p className="text-sm text-white/40 mt-1.5">
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
                Mulai →
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in slide-up">
              <div>
                <div className="text-2xl mb-2">💰</div>
                <h2 className="text-lg font-black text-white">Set keuangan bulanan</h2>
                <p className="text-xs text-white/30 mt-1">Bisa diubah kapan saja di Pengaturan</p>
              </div>
              <div>
                <Input
                  id="ob-income"
                  label="Penghasilan Bulanan (Rp)"
                  prefix="Rp"
                  placeholder="5.000.000"
                  type="number"
                  value={form.monthlyIncome}
                  onChange={(e) => set("monthlyIncome", e.target.value)}
                />
                <p className="mt-1 text-[10px] text-white/25">💡 Basis utama kalkulasi jatah harian.</p>
              </div>
              <div>
                <Input
                  id="ob-budget"
                  label="Batas Budget Belanja per Bulan (Rp) — Opsional"
                  prefix="Rp"
                  placeholder="4.000.000"
                  type="number"
                  value={form.monthlyBudget}
                  onChange={(e) => set("monthlyBudget", e.target.value)}
                />
                <p className="mt-1 text-[10px] text-white/25">💡 Batas maksimal belanja. Kosongkan jika tidak ada batas khusus.</p>
              </div>
              <div>
                <Input
                  id="ob-savings"
                  label="Tabungan Saat Ini (Rp)"
                  prefix="Rp"
                  placeholder="10.000.000"
                  type="number"
                  value={form.currentSavings}
                  onChange={(e) => set("currentSavings", e.target.value)}
                />
                <p className="mt-1 text-[10px] text-white/25">💡 Untuk menghitung Survival Runway — berapa lama uangmu bisa bertahan.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1">← Kembali</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Lanjut →</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in slide-up">
              <div>
                <div className="text-2xl mb-2">🏙️</div>
                <h2 className="text-lg font-black text-white">Benchmark kota</h2>
                <p className="text-xs text-white/30 mt-1">Untuk Skor Keuangan vs rata-rata kotamu</p>
              </div>
              <div>
                <Input
                  id="ob-target"
                  label="Target Tabungan per Bulan (Rp)"
                  prefix="Rp"
                  placeholder="1.000.000"
                  type="number"
                  value={form.targetSavings}
                  onChange={(e) => set("targetSavings", e.target.value)}
                />
                <p className="mt-1.5 text-[10px] text-white/25 leading-relaxed">
                  💡 Jumlah ini disisihkan otomatis tiap bulan sebelum jatah harianmu dihitung. Isi sesuai kemampuan, bukan target ambisius.
                </p>
              </div>
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
                className="w-full text-center text-xs text-white/15 hover:text-white/30 transition-colors mt-2"
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
