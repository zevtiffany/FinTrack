"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Transaction, Category, EmotionalTagKey, TransactionType, FrequencyType } from "@/types";
import { exportTransactionsToCSV } from "@/lib/utils/exportCsv";
import { format, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const CATEGORIES: Category[] = ["Food","Transport","Entertainment","Shopping","Health","Education","Utilities","Housing","Savings","Investment","Salary","Freelance","Other"];
const CAT_LABELS: Record<string, string> = { Food:"Makanan",Transport:"Transportasi",Entertainment:"Hiburan",Shopping:"Belanja",Health:"Kesehatan",Education:"Pendidikan",Utilities:"Utilitas",Housing:"Hunian",Savings:"Tabungan",Investment:"Investasi",Salary:"Gaji",Freelance:"Freelance",Other:"Lainnya" };
const TAG_BADGE: Record<EmotionalTagKey, { variant: "success"|"warning"|"danger"; label: string }> = { Needs:{variant:"success",label:"Kebutuhan"},Planned:{variant:"warning",label:"Terencana"},Impulsive:{variant:"danger",label:"Impulsif"} };
const FREQ_LABELS: Record<FrequencyType, string> = { daily:"Setiap Hari", weekly:"Setiap Minggu", monthly:"Setiap Bulan" };
const PAGE_SIZE = 25;

const defaultForm = {
  type: "expense" as TransactionType,
  amount: "",
  category: "Food" as Category,
  emotionalTag: "Needs" as EmotionalTagKey,
  date: format(new Date(), "yyyy-MM-dd"),
  note: "",
};

// Build last-7-months options for month filter
function buildMonthOptions() {
  const options: { value: string; label: string }[] = [{ value: "all", label: "Semua Bulan" }];
  for (let i = 0; i < 7; i++) {
    const d = subMonths(new Date(), i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = format(d, "MMMM yyyy", { locale: idLocale });
    options.push({ value, label });
  }
  return options;
}

const MONTH_OPTIONS = buildMonthOptions();

export default function TransactionsPage() {
  const {
    transactions, addTransaction, updateTransaction, deleteTransaction,
    recurringTransactions, addRecurring, deleteRecurring, updateRecurring,
    customCategories, settings,
  } = useFinanceStore();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<"all"|"income"|"expense">("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterTag, setFilterTag] = useState<"all"|EmotionalTagKey>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [recurringForm, setRecurringForm] = useState({
    title: "", type: "expense" as TransactionType, amount: "",
    category: "Food" as Category, emotionalTag: "Needs" as EmotionalTagKey,
    frequency: "monthly" as FrequencyType, dayOfMonth: "1", note: "",
  });

  const allCategories = [...CATEGORIES, ...customCategories.map((c) => c.name as Category)];
  const mask = settings.silentWealthMode;

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterMonth !== "all" && !t.date.startsWith(filterMonth)) return false;
    if (filterTag !== "all" && t.emotionalTag !== filterTag) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.note.toLowerCase().includes(q) &&
        !t.category.toLowerCase().includes(q) &&
        !(CAT_LABELS[t.category]?.toLowerCase().includes(q))
      ) return false;
    }
    return true;
  }), [transactions, filterType, filterMonth, filterTag, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Summary of filtered ────────────────────────────────────────────────────
  const filteredIncome  = filtered.filter(t => t.type === "income").reduce((s,t) => s+t.amount, 0);
  const filteredExpense = filtered.filter(t => t.type === "expense").reduce((s,t) => s+t.amount, 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const resetPaging = () => setPage(1);

  const openAdd = () => { setEditingId(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (tx: Transaction) => {
    setEditingId(tx.id ?? null);
    setForm({ type: tx.type, amount: String(tx.amount), category: tx.category as Category, emotionalTag: tx.emotionalTag, date: tx.date, note: tx.note });
    setOpen(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(form.amount.replace(/\D/g, ""));
    if (!amount || amount <= 0) return;
    setSaving(true);
    if (editingId) {
      await updateTransaction(editingId, { type: form.type, amount, category: form.category, emotionalTag: form.emotionalTag, date: form.date, note: form.note });
    } else {
      await addTransaction({ type: form.type, amount, category: form.category, emotionalTag: form.emotionalTag, date: form.date, note: form.note, createdAt: Date.now() });
    }
    setSaving(false);
    setOpen(false);
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus transaksi ini?")) await deleteTransaction(id);
  };

  const handleAddRecurring = async () => {
    const amount = parseFloat(recurringForm.amount) || 0;
    if (!amount || !recurringForm.title) return;
    await addRecurring({ ...recurringForm, amount, dayOfMonth: parseInt(recurringForm.dayOfMonth) || 1, isActive: true, createdAt: Date.now() });
    setRecurringOpen(false);
    setRecurringForm({ title: "", type: "expense", amount: "", category: "Food", emotionalTag: "Needs", frequency: "monthly", dayOfMonth: "1", note: "" });
  };

  const setF  = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setRF = (k: keyof typeof recurringForm, v: string) => setRecurringForm((f) => ({ ...f, [k]: v }));

  const formatIDRLocal = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

  return (
    <>
      <Header title="Transaksi" subtitle="Semua catatan pemasukan & pengeluaran" />
      <div className="px-4 py-4 sm:px-6 sm:py-6 max-w-4xl mx-auto">

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="space-y-3 mb-5">
          {/* Row 1: Type filter + search + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex gap-1.5 flex-shrink-0">
              {(["all","income","expense"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilterType(f); resetPaging(); }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
                    filterType === f
                      ? f === "income"  ? "border-emerald-500/40 text-emerald-400" :
                        f === "expense" ? "border-red-500/40 text-red-400" :
                        "border-white/20 text-white"
                      : "border-white/[0.07] text-white/30 hover:text-white/60"
                  }`}
                  style={filterType === f ? {
                    background: f === "income"  ? "rgba(16,185,129,0.1)" :
                                f === "expense" ? "rgba(239,68,68,0.1)"  : "rgba(255,255,255,0.06)"
                  } : {}}
                >
                  {f === "all" ? "Semua" : f === "income" ? "Pemasukan" : "Pengeluaran"}
                </button>
              ))}
            </div>
            <input
              placeholder="🔍  Cari kategori, catatan..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPaging(); }}
              className="flex-1 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            />
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={() => exportTransactionsToCSV(filtered)}>⬇️ CSV</Button>
              <Button variant="outline" size="sm" onClick={() => setRecurringOpen(true)} title="Transaksi Rutin">🔄 Rutin</Button>
              <Button id="add-transaction-btn" onClick={openAdd} size="sm">+ Tambah</Button>
            </div>
          </div>

          {/* Row 2: Month + Tag filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filterMonth}
              onChange={(e) => { setFilterMonth(e.target.value); resetPaging(); }}
              className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white/60 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {MONTH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} style={{ background: "#0a0a0f" }}>{o.label}</option>
              ))}
            </select>

            {filterType !== "income" && (
              <div className="flex gap-1.5">
                {(["all", "Needs", "Planned", "Impulsive"] as const).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setFilterTag(tag as "all" | EmotionalTagKey); resetPaging(); }}
                    className={`rounded-xl px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide border transition-all ${
                      filterTag === tag
                        ? tag === "Needs"    ? "border-emerald-500/40 text-emerald-400" :
                          tag === "Planned"  ? "border-yellow-500/40 text-yellow-400" :
                          tag === "Impulsive"? "border-red-500/40 text-red-400" :
                          "border-white/20 text-white"
                        : "border-white/[0.07] text-white/25 hover:text-white/50"
                    }`}
                    style={filterTag === tag ? {
                      background: tag === "Needs"    ? "rgba(16,185,129,0.1)" :
                                  tag === "Planned"  ? "rgba(234,179,8,0.1)"  :
                                  tag === "Impulsive"? "rgba(239,68,68,0.1)"  : "rgba(255,255,255,0.06)"
                    } : {}}
                  >
                    {tag === "all" ? "Semua Tag" : tag === "Needs" ? "Kebutuhan" : tag === "Planned" ? "Terencana" : "Impulsif"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Summary Bar ─────────────────────────────────────────────────── */}
        {filtered.length > 0 && (
          <div
            className="mb-4 rounded-xl px-4 py-3 grid grid-cols-3 gap-2"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Total Transaksi</p>
              <p className="text-sm font-black text-white">{filtered.length}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Pemasukan</p>
              <p className="text-sm font-black text-emerald-400">{mask ? "Rp ••••" : filteredIncome > 0 ? formatIDRLocal(filteredIncome) : "—"}</p>
            </div>
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-widest mb-0.5">Pengeluaran</p>
              <p className="text-sm font-black text-red-400">{mask ? "Rp ••••" : filteredExpense > 0 ? formatIDRLocal(filteredExpense) : "—"}</p>
            </div>
          </div>
        )}

        {/* ── List ────────────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div
            className="rounded-2xl py-20 text-center"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm text-white/30">Tidak ada transaksi yang cocok.</p>
            {(search || filterType !== "all" || filterMonth !== "all" || filterTag !== "all") && (
              <button
                onClick={() => { setSearch(""); setFilterType("all"); setFilterMonth("all"); setFilterTag("all"); }}
                className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors"
              >
                Reset filter →
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginated.map((tx) => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  mask={mask}
                  onEdit={() => openEdit(tx)}
                  onDelete={() => tx.id && handleDelete(tx.id)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-xs text-white/30">{filtered.length} transaksi · Hal {page}/{totalPages}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page <= 1}>← Prev</Button>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page >= totalPages}>Next →</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────── */}
      <Modal open={open} onClose={() => { setOpen(false); setEditingId(null); }} title={editingId ? "✏️ Edit Transaksi" : "➕ Tambah Transaksi"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["income","expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setF("type", t)}
                className={`rounded-xl py-2.5 text-sm font-bold border transition-all ${
                  form.type === t
                    ? t === "income" ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400"
                    : "border-white/[0.07] text-white/30"
                }`}
                style={form.type === t ? {
                  background: t === "income" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"
                } : { background: "rgba(255,255,255,0.03)" }}
              >
                {t === "income" ? "💚 Pemasukan" : "🔴 Pengeluaran"}
              </button>
            ))}
          </div>
          <Input id="tx-amount" label="Jumlah (Rp)" prefix="Rp" type="number" placeholder="50.000" min={0} value={form.amount} onChange={(e) => setF("amount", e.target.value)} />
          <Select id="tx-category" label="Kategori" value={form.category} onChange={(e) => setF("category", e.target.value)} options={allCategories.map((c) => ({ value: c, label: CAT_LABELS[c] ?? c }))} />
          {form.type === "expense" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Tag Emosional</p>
              <div className="grid grid-cols-3 gap-2">
                {(["Needs","Planned","Impulsive"] as EmotionalTagKey[]).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setF("emotionalTag", tag)}
                    className={`rounded-xl border p-2 text-xs text-center transition-all ${
                      form.emotionalTag === tag
                        ? tag === "Needs"    ? "border-emerald-500/40 text-emerald-400" :
                          tag === "Planned"  ? "border-yellow-500/40 text-yellow-400" :
                          "border-red-500/40 text-red-400"
                        : "border-white/[0.07] text-white/30"
                    }`}
                    style={form.emotionalTag === tag ? {
                      background: tag === "Needs"    ? "rgba(16,185,129,0.1)" :
                                  tag === "Planned"  ? "rgba(234,179,8,0.1)"  : "rgba(239,68,68,0.1)"
                    } : { background: "rgba(255,255,255,0.02)" }}
                  >
                    <p className="font-bold">{tag === "Needs" ? "Kebutuhan" : tag === "Planned" ? "Terencana" : "Impulsif"}</p>
                    <p className="text-[9px] opacity-50 mt-0.5">{tag === "Needs" ? "Wajib" : tag === "Planned" ? "Rencana" : "Dadakan"}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          <Input id="tx-date" label="Tanggal" type="date" value={form.date} onChange={(e) => setF("date", e.target.value)} />
          <Input id="tx-note" label="Catatan (opsional)" type="text" placeholder="Makan siang, isi bensin..." value={form.note} onChange={(e) => setF("note", e.target.value)} />
          <Button id="tx-save-btn" className="w-full" onClick={handleSave} loading={saving}>
            {editingId ? "Simpan Perubahan ✓" : "Simpan Transaksi"}
          </Button>
        </div>
      </Modal>

      {/* ── Recurring Modal ──────────────────────────────────────────────── */}
      <Modal open={recurringOpen} onClose={() => setRecurringOpen(false)} title="🔄 Transaksi Berulang">
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {recurringTransactions.length > 0 && (
            <div className="space-y-2 mb-2">
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-bold">Aktif</p>
              {recurringTransactions.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.isActive ? "bg-emerald-500" : "bg-white/15"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{r.title}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {FREQ_LABELS[r.frequency]} · Rp {r.amount.toLocaleString("id-ID")}
                      {r.frequency === "monthly" ? ` · Tgl ${r.dayOfMonth}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => r.id && updateRecurring(r.id, { isActive: !r.isActive })}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${r.isActive ? "border-emerald-500/30 text-emerald-400" : "border-white/10 text-white/25"}`}
                  >
                    {r.isActive ? "Aktif" : "Nonaktif"}
                  </button>
                  <button onClick={() => r.id && deleteRecurring(r.id)} className="text-white/20 hover:text-red-400 transition-colors text-base leading-none">×</button>
                </div>
              ))}
              <div className="h-px mt-3 mb-1" style={{ background: "rgba(255,255,255,0.05)" }} />
            </div>
          )}
          <p className="text-sm font-bold text-white">+ Tambah Transaksi Rutin</p>
          <Input id="rec-title" label="Nama/Label" placeholder="Bayar Kos, Netflix, Cicilan..." value={recurringForm.title} onChange={(e) => setRF("title", e.target.value)} type="text" />
          <div className="grid grid-cols-2 gap-2">
            {(["income","expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRF("type", t)}
                className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                  recurringForm.type === t
                    ? t === "income" ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400"
                    : "border-white/[0.07] text-white/30"
                }`}
                style={recurringForm.type === t ? {
                  background: t === "income" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"
                } : { background: "rgba(255,255,255,0.03)" }}
              >
                {t === "income" ? "💚 Pemasukan" : "🔴 Pengeluaran"}
              </button>
            ))}
          </div>
          <Input id="rec-amount" label="Jumlah (Rp)" prefix="Rp" type="number" value={recurringForm.amount} onChange={(e) => setRF("amount", e.target.value)} placeholder="1.500.000" />
          <Select id="rec-freq" label="Frekuensi" value={recurringForm.frequency} onChange={(e) => setRF("frequency", e.target.value)} options={[{value:"daily",label:"Setiap Hari"},{value:"weekly",label:"Setiap Minggu"},{value:"monthly",label:"Setiap Bulan"}]} />
          {recurringForm.frequency === "monthly" && (
            <Input id="rec-day" label="Tanggal Setiap Bulan (1-28)" type="number" min={1} max={28} value={recurringForm.dayOfMonth} onChange={(e) => setRF("dayOfMonth", e.target.value)} />
          )}
          <Input id="rec-note" label="Catatan (opsional)" type="text" value={recurringForm.note} onChange={(e) => setRF("note", e.target.value)} placeholder="..." />
          <Button className="w-full" onClick={handleAddRecurring}>Tambah Transaksi Rutin</Button>
        </div>
      </Modal>
    </>
  );
}

function TxRow({ tx, mask, onEdit, onDelete }: { tx: Transaction; mask: boolean; onEdit: () => void; onDelete: () => void }) {
  const tagInfo = TAG_BADGE[tx.emotionalTag];
  const isRecurring = tx.note?.startsWith("[Rutin]");
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-150 group hover:-translate-y-px"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-base"
        style={{
          background: tx.type === "income" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
        }}
      >
        {tx.type === "income" ? "💚" : "🔴"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white/90 truncate">{CAT_LABELS[tx.category] ?? tx.category}</span>
          {tx.type === "expense" && <Badge label={tagInfo.label} variant={tagInfo.variant} />}
          {isRecurring && <Badge label="Rutin" variant="info" />}
        </div>
        {tx.note && !isRecurring && <p className="text-xs text-white/30 truncate mt-0.5">{tx.note}</p>}
        <p className="text-[10px] text-white/20 mt-0.5">{tx.date}</p>
      </div>

      {/* Amount */}
      <p className={`text-sm font-black flex-shrink-0 ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
        {tx.type === "income" ? "+" : "−"}
        {mask ? " ••••••" : ` Rp ${tx.amount.toLocaleString("id-ID")}`}
      </p>

      {/* Actions */}
      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1 items-center">
        <button
          onClick={onEdit}
          className="text-white/25 hover:text-white/70 text-xs px-2 py-1.5 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          title="Edit"
        >
          ✏️
        </button>
        <button
          onClick={onDelete}
          className="text-white/25 hover:text-red-400 text-xs px-2 py-1.5 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          title="Hapus"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
