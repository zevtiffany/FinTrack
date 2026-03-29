"use client";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { useFinanceStore } from "@/store/useFinanceStore";
import { calculateFutureValue } from "@/lib/algorithms/compounder";
import { formatIDR } from "@/lib/utils/formatCurrency";
import { format } from "date-fns";

// ── Saving Goals ──────────────────────────────────────────────────────────────

function GoalsTab() {
  const { savingGoals, addGoal, updateGoal, deleteGoal, settings } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [addingAmount, setAddingAmount] = useState<{ id: number; val: string } | null>(null);
  const [form, setForm] = useState({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await addGoal({
      name: form.name,
      targetAmount: parseFloat(form.targetAmount) || 0,
      currentAmount: parseFloat(form.currentAmount) || 0,
      deadline: form.deadline,
      createdAt: Date.now(),
    });
    setSaving(false);
    setOpen(false);
    setForm({ name: "", targetAmount: "", currentAmount: "", deadline: "" });
  };

  const handleAddProgress = async (id: number, current: number) => {
    const extra = parseFloat(addingAmount?.val ?? "0") || 0;
    await updateGoal(id, { currentAmount: current + extra });
    setAddingAmount(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button id="add-goal-btn" onClick={() => setOpen(true)} size="sm">+ Tambah Goal</Button>
      </div>

      {savingGoals.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 py-16 text-center">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-sm text-gray-400">Belum ada target tabungan.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {savingGoals.map((goal) => {
            const pct = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            const done = pct >= 100;
            return (
              <Card key={goal.id} variant={done ? "success" : "default"}>
                <CardHeader>
                  <div>
                    <p className="text-sm font-bold text-white">{goal.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Deadline: {goal.deadline || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {done && <Badge label="Tercapai! 🎉" variant="success" />}
                    <button
                      onClick={() => goal.id && deleteGoal(goal.id)}
                      className="text-gray-600 hover:text-red-400 text-lg leading-none"
                    >×</button>
                  </div>
                </CardHeader>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>{settings.silentWealthMode ? "Rp ••••" : formatIDR(goal.currentAmount, { compact: true })}</span>
                    <span>{settings.silentWealthMode ? "Rp ••••" : formatIDR(goal.targetAmount, { compact: true })}</span>
                  </div>
                  <ProgressBar value={pct} height="md" />
                  <p className="text-right text-xs text-gray-500 mt-1">{pct.toFixed(1)}%</p>
                </div>
                {!done && (
                  <div className="mt-3 flex gap-2">
                    {addingAmount?.id === goal.id ? (
                      <>
                        <Input
                          id={`goal-add-${goal.id}`}
                          prefix="Rp"
                          placeholder="Jumlah"
                          type="number"
                          value={addingAmount?.val ?? ""}
                          onChange={(e) => setAddingAmount({ id: goal.id!, val: e.target.value })}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => goal.id && handleAddProgress(goal.id, goal.currentAmount)}>✓</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingAmount(null)}>✕</Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full" onClick={() => setAddingAmount({ id: goal.id!, val: "" })}>
                        + Tambah Progress
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah Saving Goal">
        <div className="space-y-4">
          <Input id="goal-name" label="Nama Goal" placeholder="Dana Darurat, Liburan, Laptop..." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} type="text" />
          <Input id="goal-target" label="Target (Rp)" prefix="Rp" type="number" placeholder="10.000.000" value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} />
          <Input id="goal-current" label="Sudah terkumpul (Rp)" prefix="Rp" type="number" placeholder="0" value={form.currentAmount} onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))} />
          <Input id="goal-deadline" label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
          <Button id="goal-save" className="w-full" onClick={handleAdd} loading={saving}>Simpan Goal</Button>
        </div>
      </Modal>
    </div>
  );
}

// ── Virtual Investments ───────────────────────────────────────────────────────

function InvestmentsTab() {
  const { virtualInvestments, addInvestment, deleteInvestment, settings } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", principal: "", rate: "8", years: "5" });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    await addInvestment({
      name: form.name,
      principal: parseFloat(form.principal) || 0,
      rate: parseFloat(form.rate) / 100,
      years: parseFloat(form.years) || 5,
      createdAt: Date.now(),
    });
    setSaving(false);
    setOpen(false);
    setForm({ name: "", principal: "", rate: "8", years: "5" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button id="add-invest-btn" onClick={() => setOpen(true)} size="sm">+ Simulasi Investasi</Button>
      </div>

      {virtualInvestments.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 py-16 text-center">
          <p className="text-3xl mb-2">📈</p>
          <p className="text-sm text-gray-400">Belum ada simulasi investasi.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {virtualInvestments.map((inv) => {
            const { futureValue, gain } = calculateFutureValue(inv.principal, inv.rate, inv.years);
            const multiplier = inv.principal > 0 ? futureValue / inv.principal : 0;
            return (
              <Card key={inv.id} variant="success">
                <CardHeader>
                  <p className="text-sm font-bold text-white">{inv.name}</p>
                  <button onClick={() => inv.id && deleteInvestment(inv.id)} className="text-gray-600 hover:text-red-400 text-lg leading-none">×</button>
                </CardHeader>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Modal Awal</span>
                    <span className="text-white font-medium">{settings.silentWealthMode ? "Rp ••••" : formatIDR(inv.principal)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Return / Tahun</span>
                    <span className="text-white">{(inv.rate * 100).toFixed(1)}% × {inv.years} tahun</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Keuntungan</span>
                    <span className="text-emerald-400 font-medium">{settings.silentWealthMode ? "Rp ••••" : `+${formatIDR(gain)}`}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-800 pt-2">
                    <span className="text-sm font-semibold text-white">Nilai Akhir</span>
                    <div className="text-right">
                      <p className="text-base font-black text-emerald-400">{settings.silentWealthMode ? "Rp ••••••" : formatIDR(futureValue)}</p>
                      <p className="text-[10px] text-gray-500">{multiplier.toFixed(2)}× lipat</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Simulasi Investasi">
        <div className="space-y-4">
          <Input id="inv-name" label="Nama Investasi" placeholder="Reksa Dana, Saham, Deposito..." value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} type="text" />
          <Input id="inv-principal" label="Modal Awal (Rp)" prefix="Rp" type="number" value={form.principal} onChange={(e) => setForm((f) => ({ ...f, principal: e.target.value }))} placeholder="5.000.000" />
          <div className="grid grid-cols-2 gap-3">
            <Input id="inv-rate" label="Return (%/tahun)" type="number" value={form.rate} onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))} placeholder="8" />
            <Input id="inv-years" label="Durasi (tahun)" type="number" value={form.years} onChange={(e) => setForm((f) => ({ ...f, years: e.target.value }))} placeholder="5" />
          </div>
          {form.principal && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-800/40 p-3 text-sm">
              <p className="text-gray-400">Proyeksi nilai akhir:</p>
              <p className="text-emerald-400 font-black text-lg mt-1">
                {formatIDR(calculateFutureValue(parseFloat(form.principal) || 0, parseFloat(form.rate) / 100 || 0.08, parseFloat(form.years) || 5).futureValue)}
              </p>
            </div>
          )}
          <Button id="inv-save" className="w-full" onClick={handleAdd} loading={saving}>Simpan Simulasi</Button>
        </div>
      </Modal>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const [tab, setTab] = useState<"goals" | "investments">("goals");
  const { savingGoals, virtualInvestments } = useFinanceStore();

  return (
    <>
      <Header title="Target & Investasi" subtitle="Saving goals & simulasi investasi virtual" />
      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("goals")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition-colors ${tab === "goals" ? "border-emerald-700 bg-emerald-900/30 text-emerald-400" : "border-gray-800 text-gray-400 hover:text-white"}`}
          >
            🎯 Saving Goals
            {savingGoals.length > 0 && <span className="rounded-full bg-emerald-900/50 px-1.5 py-0.5 text-[10px] text-emerald-400">{savingGoals.length}</span>}
          </button>
          <button
            onClick={() => setTab("investments")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition-colors ${tab === "investments" ? "border-emerald-700 bg-emerald-900/30 text-emerald-400" : "border-gray-800 text-gray-400 hover:text-white"}`}
          >
            📈 Investasi Virtual
            {virtualInvestments.length > 0 && <span className="rounded-full bg-emerald-900/50 px-1.5 py-0.5 text-[10px] text-emerald-400">{virtualInvestments.length}</span>}
          </button>
        </div>

        {tab === "goals" ? <GoalsTab /> : <InvestmentsTab />}
      </div>
    </>
  );
}
