"use client";
import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Transaction, Category, EmotionalTagKey, TransactionType, RecurringTransaction, FrequencyType } from "@/types";
import { exportTransactionsToCSV } from "@/lib/utils/exportCsv";
import { format } from "date-fns";

const CATEGORIES: Category[] = ["Food","Transport","Entertainment","Shopping","Health","Education","Utilities","Housing","Savings","Investment","Salary","Freelance","Other"];
const CAT_LABELS: Record<string, string> = { Food:"Makanan",Transport:"Transportasi",Entertainment:"Hiburan",Shopping:"Belanja",Health:"Kesehatan",Education:"Pendidikan",Utilities:"Utilitas",Housing:"Hunian",Savings:"Tabungan",Investment:"Investasi",Salary:"Gaji",Freelance:"Freelance",Other:"Lainnya" };
const TAG_BADGE: Record<EmotionalTagKey, { variant: "success"|"warning"|"danger"; label: string }> = { Needs:{variant:"success",label:"Kebutuhan"},Planned:{variant:"warning",label:"Terencana"},Impulsive:{variant:"danger",label:"Impulsif"} };
const FREQ_LABELS: Record<FrequencyType, string> = { daily:"Setiap Hari", weekly:"Setiap Minggu", monthly:"Setiap Bulan" };
const PAGE_SIZE = 20;

const defaultForm = { type:"expense" as TransactionType, amount:"", category:"Food" as Category, emotionalTag:"Needs" as EmotionalTagKey, date:format(new Date(),"yyyy-MM-dd"), note:"" };

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, recurringTransactions, addRecurring, deleteRecurring, updateRecurring, customCategories } = useFinanceStore();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all"|"income"|"expense">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [recurringForm, setRecurringForm] = useState({ title:"", type:"expense" as TransactionType, amount:"", category:"Food" as Category, emotionalTag:"Needs" as EmotionalTagKey, frequency:"monthly" as FrequencyType, dayOfMonth:"1", note:"" });

  // All available categories (hardcoded + custom)
  const allCategories = [...CATEGORIES, ...customCategories.map((c) => c.name as Category)];

  // Filtered + paginated
  const filtered = useMemo(() => transactions.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.note.toLowerCase().includes(q) && !t.category.toLowerCase().includes(q) && !(CAT_LABELS[t.category]?.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [transactions, filter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setEditingId(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (tx: Transaction) => {
    setEditingId(tx.id ?? null);
    setForm({ type:tx.type, amount:String(tx.amount), category:tx.category as Category, emotionalTag:tx.emotionalTag, date:tx.date, note:tx.note });
    setOpen(true);
  };

  const handleSave = async () => {
    const amount = parseFloat(form.amount.replace(/\D/g,""));
    if (!amount || amount <= 0) return;
    setSaving(true);
    if (editingId) {
      await updateTransaction(editingId, { type:form.type, amount, category:form.category, emotionalTag:form.emotionalTag, date:form.date, note:form.note });
    } else {
      await addTransaction({ type:form.type, amount, category:form.category, emotionalTag:form.emotionalTag, date:form.date, note:form.note, createdAt:Date.now() });
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
    await addRecurring({ ...recurringForm, amount, dayOfMonth:parseInt(recurringForm.dayOfMonth)||1, isActive:true, createdAt:Date.now() });
    setRecurringOpen(false);
    setRecurringForm({ title:"",type:"expense",amount:"",category:"Food",emotionalTag:"Needs",frequency:"monthly",dayOfMonth:"1",note:"" });
  };

  const setF = (k: keyof typeof form, v: string) => setForm((f) => ({...f,[k]:v}));
  const setRF = (k: keyof typeof recurringForm, v: string) => setRecurringForm((f) => ({...f,[k]:v}));

  return (
    <>
      <Header title="Transaksi" subtitle="Semua catatan pemasukan & pengeluaran" />
      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {(["all","income","expense"] as const).map((f) => (
              <button key={f} onClick={() => { setFilter(f); setPage(1); }} className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors ${filter===f ? f==="income"?"border-emerald-700 bg-emerald-900/40 text-emerald-400":f==="expense"?"border-red-700 bg-red-900/40 text-red-400":"border-gray-700 bg-gray-800 text-white":"border-gray-800 text-gray-500 hover:text-white"}`}>
                {f==="all"?"Semua":f==="income"?"Pemasukan":"Pengeluaran"}
              </button>
            ))}
          </div>
          <input placeholder="Cari..." value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} className="flex-1 rounded-xl border border-gray-700 bg-gray-800/70 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/50" />
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => exportTransactionsToCSV(filtered)} title="Export CSV">⬇️ CSV</Button>
            <Button variant="outline" size="sm" onClick={() => setRecurringOpen(true)} title="Transaksi Rutin">🔄</Button>
            <Button id="add-transaction-btn" onClick={openAdd} size="sm">+ Tambah</Button>
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 py-16 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm text-gray-400">Belum ada transaksi.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginated.map((tx) => (
                <TxRow key={tx.id} tx={tx} onEdit={() => openEdit(tx)} onDelete={() => tx.id && handleDelete(tx.id)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5">
                <p className="text-xs text-gray-500">{filtered.length} transaksi · Hal {page}/{totalPages}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page<=1}>← Prev</Button>
                  <Button size="sm" variant="outline" onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Next →</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={open} onClose={() => { setOpen(false); setEditingId(null); }} title={editingId ? "Edit Transaksi" : "Tambah Transaksi"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["income","expense"] as const).map((t) => (
              <button key={t} onClick={() => setF("type",t)} className={`rounded-xl py-2.5 text-sm font-semibold border transition-colors ${form.type===t ? t==="income"?"border-emerald-700 bg-emerald-900/40 text-emerald-400":"border-red-700 bg-red-900/40 text-red-400":"border-gray-700 text-gray-400"}`}>
                {t==="income"?"💚 Pemasukan":"🔴 Pengeluaran"}
              </button>
            ))}
          </div>
          <Input id="tx-amount" label="Jumlah (Rp)" prefix="Rp" type="number" placeholder="50.000" min={0} value={form.amount} onChange={(e)=>setF("amount",e.target.value)} />
          <Select id="tx-category" label="Kategori" value={form.category} onChange={(e)=>setF("category",e.target.value)} options={allCategories.map((c)=>({value:c,label:CAT_LABELS[c]??c}))} />
          {form.type==="expense" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tag Emosional</p>
              <div className="grid grid-cols-3 gap-2">
                {(["Needs","Planned","Impulsive"] as EmotionalTagKey[]).map((tag) => (
                  <button key={tag} onClick={() => setF("emotionalTag",tag)} className={`rounded-xl border p-2 text-xs text-center transition-colors ${form.emotionalTag===tag ? tag==="Needs"?"border-emerald-700 bg-emerald-900/30 text-emerald-400":tag==="Planned"?"border-yellow-700 bg-yellow-900/30 text-yellow-400":"border-red-700 bg-red-900/30 text-red-400":"border-gray-700 text-gray-500"}`}>
                    <p className="font-semibold">{tag==="Needs"?"Kebutuhan":tag==="Planned"?"Terencana":"Impulsif"}</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{tag==="Needs"?"Wajib":tag==="Planned"?"Rencana":"Dadakan"}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          <Input id="tx-date" label="Tanggal" type="date" value={form.date} onChange={(e)=>setF("date",e.target.value)} />
          <Input id="tx-note" label="Catatan (opsional)" type="text" placeholder="Makan siang..." value={form.note} onChange={(e)=>setF("note",e.target.value)} />
          <Button id="tx-save-btn" className="w-full" onClick={handleSave} loading={saving}>
            {editingId ? "Simpan Perubahan" : "Simpan Transaksi"}
          </Button>
        </div>
      </Modal>

      {/* Recurring Modal */}
      <Modal open={recurringOpen} onClose={() => setRecurringOpen(false)} title="Transaksi Berulang" className="max-w-lg">
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {recurringTransactions.length > 0 && (
            <div className="space-y-2 mb-2">
              {recurringTransactions.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                    <p className="text-xs text-gray-500">{FREQ_LABELS[r.frequency]} · Rp {r.amount.toLocaleString("id-ID")}</p>
                  </div>
                  <button onClick={() => r.id && updateRecurring(r.id, { isActive: !r.isActive })} className={`text-xs px-2 py-1 rounded-lg border transition-colors ${r.isActive?"border-emerald-700 text-emerald-400":"border-gray-700 text-gray-500"}`}>
                    {r.isActive?"Aktif":"Nonaktif"}
                  </button>
                  <button onClick={() => r.id && deleteRecurring(r.id)} className="text-gray-600 hover:text-red-400 text-lg leading-none">×</button>
                </div>
              ))}
              <hr className="border-gray-800 my-3" />
            </div>
          )}
          <p className="text-sm font-semibold text-white">+ Tambah Transaksi Rutin</p>
          <Input id="rec-title" label="Nama/Label" placeholder="Bayar Kos, Langganan Netflix..." value={recurringForm.title} onChange={(e)=>setRF("title",e.target.value)} type="text" />
          <div className="grid grid-cols-2 gap-2">
            {(["income","expense"] as const).map((t) => (
              <button key={t} onClick={() => setRF("type",t)} className={`rounded-xl py-2 text-xs font-semibold border transition-colors ${recurringForm.type===t?t==="income"?"border-emerald-700 bg-emerald-900/30 text-emerald-400":"border-red-700 bg-red-900/30 text-red-400":"border-gray-700 text-gray-400"}`}>
                {t==="income"?"💚 Pemasukan":"🔴 Pengeluaran"}
              </button>
            ))}
          </div>
          <Input id="rec-amount" label="Jumlah (Rp)" prefix="Rp" type="number" value={recurringForm.amount} onChange={(e)=>setRF("amount",e.target.value)} placeholder="1.500.000" />
          <Select id="rec-freq" label="Frekuensi" value={recurringForm.frequency} onChange={(e)=>setRF("frequency",e.target.value)} options={[{value:"daily",label:"Setiap Hari"},{value:"weekly",label:"Setiap Minggu"},{value:"monthly",label:"Setiap Bulan"}]} />
          {recurringForm.frequency==="monthly" && (
            <Input id="rec-day" label="Tanggal Setiap Bulan (1-28)" type="number" min={1} max={28} value={recurringForm.dayOfMonth} onChange={(e)=>setRF("dayOfMonth",e.target.value)} />
          )}
          <Input id="rec-note" label="Catatan" type="text" value={recurringForm.note} onChange={(e)=>setRF("note",e.target.value)} placeholder="..." />
          <Button className="w-full" onClick={handleAddRecurring}>Tambah Transaksi Rutin</Button>
        </div>
      </Modal>
    </>
  );
}

function TxRow({ tx, onEdit, onDelete }: { tx: Transaction; onEdit: ()=>void; onDelete: ()=>void }) {
  const tagInfo = TAG_BADGE[tx.emotionalTag];
  const isRecurring = tx.note.startsWith("[Rutin]");
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 hover:border-gray-700 transition-colors group">
      <div className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-base ${tx.type==="income"?"bg-emerald-900/40":"bg-red-900/30"}`}>
        {tx.type==="income"?"💚":"🔴"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white truncate">{CAT_LABELS[tx.category]??tx.category}</span>
          {tx.type==="expense" && <Badge label={tagInfo.label} variant={tagInfo.variant} />}
          {isRecurring && <Badge label="Rutin" variant="info" />}
        </div>
        {tx.note && !isRecurring && <p className="text-xs text-gray-500 truncate mt-0.5">{tx.note}</p>}
        <p className="text-xs text-gray-600 mt-0.5">{tx.date}</p>
      </div>
      <p className={`text-sm font-bold flex-shrink-0 ${tx.type==="income"?"text-emerald-400":"text-red-400"}`}>
        {tx.type==="income"?"+":"-"}Rp {tx.amount.toLocaleString("id-ID")}
      </p>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button onClick={onEdit} className="text-gray-500 hover:text-blue-400 text-sm px-1.5 py-0.5 rounded" title="Edit">✏️</button>
        <button onClick={onDelete} className="text-gray-600 hover:text-red-400 text-lg leading-none ml-1" title="Hapus">×</button>
      </div>
    </div>
  );
}
