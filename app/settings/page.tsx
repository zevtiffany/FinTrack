"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { useFinanceStore } from "@/store/useFinanceStore";
import { useTheme } from "@/components/ThemeProvider";
import type { User, Category } from "@/types";
import { formatIDR } from "@/lib/utils/formatCurrency";

const CATEGORIES: Category[] = ["Food","Transport","Entertainment","Shopping","Health","Education","Utilities","Housing","Savings","Investment","Salary","Freelance","Other"];
const CAT_LABELS: Record<string, string> = { Food:"Makanan",Transport:"Transportasi",Entertainment:"Hiburan",Shopping:"Belanja",Health:"Kesehatan",Education:"Pendidikan",Utilities:"Utilitas",Housing:"Hunian",Savings:"Tabungan",Investment:"Investasi",Salary:"Gaji",Freelance:"Freelance",Other:"Lainnya" };

export default function SettingsPage() {
  const { user, updateUser, settings, updateSettings, categoryBudgets, setCategoryBudget, deleteCategoryBudget, customCategories, addCustomCategory, deleteCustomCategory, transactions } = useFinanceStore();
  const { theme, toggleTheme } = useTheme();

  const [form, setForm] = useState<Omit<User,"id">>({ name:"", monthlyIncome:0, currentSavings:0, cityAvgIncome:0, monthlyBudget:0, targetSavings:0 });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newBudgetCat, setNewBudgetCat] = useState("Food");
  const [newBudgetAmt, setNewBudgetAmt] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("📌");

  const prefix = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}`;
  const allCategories = [...CATEGORIES, ...customCategories.map((c) => c.name as Category)];

  useEffect(() => {
    if (user) setForm({ name:user.name, monthlyIncome:user.monthlyIncome, currentSavings:user.currentSavings, cityAvgIncome:user.cityAvgIncome, monthlyBudget:user.monthlyBudget, targetSavings:user.targetSavings });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    await updateUser(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key: keyof typeof form, v: string) => setForm((f) => ({ ...f, [key]: typeof form[key]==="string" ? v : parseFloat(v)||0 }));

  const handleAddBudget = async () => {
    const amt = parseFloat(newBudgetAmt) || 0;
    if (!amt) return;
    await setCategoryBudget(newBudgetCat, amt);
    setNewBudgetAmt("");
  };

  const handleAddCustomCat = async () => {
    if (!newCatName.trim()) return;
    await addCustomCategory({ name: newCatName.trim(), emoji: newCatEmoji, createdAt: Date.now() });
    setNewCatName("");
    setNewCatEmoji("📌");
  };

  return (
    <>
      <Header title="Pengaturan" subtitle="Profil keuangan & konfigurasi aplikasi" />
      <div className="px-6 py-6 max-w-2xl mx-auto space-y-6">

        {/* Profil */}
        <Card>
          <CardHeader><CardTitle>👤 Profil Keuangan</CardTitle></CardHeader>
          <div className="space-y-4 mt-2">
            <Input id="s-name" label="Nama" placeholder="Nama kamu" value={form.name} onChange={(e)=>set("name",e.target.value)} type="text" />
            <Input id="s-income" label="Penghasilan Bulanan (Rp)" prefix="Rp" placeholder="5.000.000" type="number" value={form.monthlyIncome||""} onChange={(e)=>set("monthlyIncome",e.target.value)} />
            <Input id="s-budget" label="Budget Bulanan / M (Rp)" prefix="Rp" placeholder="4.000.000" type="number" value={form.monthlyBudget||""} onChange={(e)=>set("monthlyBudget",e.target.value)} />
            <Input id="s-savings" label="Tabungan Saat Ini / S (Rp)" prefix="Rp" placeholder="10.000.000" type="number" value={form.currentSavings||""} onChange={(e)=>set("currentSavings",e.target.value)} />
            <Input id="s-target" label="Target Tabungan / T (Rp)" prefix="Rp" placeholder="2.000.000" type="number" value={form.targetSavings||""} onChange={(e)=>set("targetSavings",e.target.value)} />
            <Input id="s-city" label="Rata-rata Penghasilan Kotamu (Rp)" prefix="Rp" placeholder="Jakarta~5jt / Surabaya~4.5jt / Malang~3.5jt" type="number" value={form.cityAvgIncome||""} onChange={(e)=>set("cityAvgIncome",e.target.value)} />
            <Button id="s-save" onClick={handleSave} loading={saving} className="w-full">{saved?"✅ Tersimpan!":"Simpan Perubahan"}</Button>
          </div>
        </Card>

        {/* Category Budgets */}
        <Card>
          <CardHeader><CardTitle>🎯 Budget per Kategori</CardTitle></CardHeader>
          <div className="space-y-3 mt-2">
            {categoryBudgets.length > 0 && (
              <div className="space-y-2">
                {categoryBudgets.map((b) => {
                  const spent = transactions.filter((t)=>t.type==="expense"&&t.category===b.category&&t.date.startsWith(prefix)).reduce((s,t)=>s+t.amount,0);
                  const pct = b.monthlyLimit>0?(spent/b.monthlyLimit)*100:0;
                  const over = pct >= 100;
                  return (
                    <div key={b.id} className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{CAT_LABELS[b.category]??b.category}</p>
                          {over && <Badge label="Habis" variant="danger" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{formatIDR(spent,{compact:true})} / {formatIDR(b.monthlyLimit,{compact:true})} ({pct.toFixed(0)}%)</p>
                      </div>
                      <button onClick={()=>b.id&&deleteCategoryBudget(b.id)} className="text-gray-600 hover:text-red-400 text-lg leading-none">×</button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2">
              <select value={newBudgetCat} onChange={(e)=>setNewBudgetCat(e.target.value)} className="flex-1 rounded-xl border border-gray-700 bg-gray-800/70 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50">
                {allCategories.map((c)=><option key={c} value={c} className="bg-gray-900">{CAT_LABELS[c]??c}</option>)}
              </select>
              <Input id="s-budget-amt" prefix="Rp" type="number" placeholder="500.000" value={newBudgetAmt} onChange={(e)=>setNewBudgetAmt(e.target.value)} className="flex-1" />
              <Button size="md" onClick={handleAddBudget} className="flex-shrink-0">Set</Button>
            </div>
          </div>
        </Card>

        {/* Custom Categories */}
        <Card>
          <CardHeader><CardTitle>🏷️ Kategori Custom</CardTitle></CardHeader>
          <div className="space-y-3 mt-2">
            {customCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {customCategories.map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800 px-3 py-1.5">
                    <span>{c.emoji}</span>
                    <span className="text-sm text-white">{c.name}</span>
                    <button onClick={()=>c.id&&deleteCustomCategory(c.id)} className="text-gray-600 hover:text-red-400 ml-1 text-base leading-none">×</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input id="s-cat-emoji" placeholder="📌" value={newCatEmoji} onChange={(e)=>setNewCatEmoji(e.target.value)} className="w-16 text-center" />
              <Input id="s-cat-name" placeholder="Nama kategori baru..." value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} type="text" className="flex-1" />
              <Button size="md" onClick={handleAddCustomCat} className="flex-shrink-0">Tambah</Button>
            </div>
          </div>
        </Card>

        {/* Tampilan */}
        <Card>
          <CardHeader><CardTitle>🎨 Tampilan</CardTitle></CardHeader>
          <div className="space-y-3 mt-2">
            <Toggle id="theme-toggle" label={`Mode ${theme === "dark" ? "Gelap 🌑" : "Terang ☀️"}`} description="Ganti antara mode gelap dan terang" checked={theme === "light"} onChange={toggleTheme} />
            <Toggle id="silent-toggle" label="Silent Wealth Mode" description="Sembunyikan semua nominal dan saldo" checked={settings.silentWealthMode} onChange={(v)=>updateSettings({silentWealthMode:v})} />
          </div>
        </Card>

        {/* Supabase */}
        <Card>
          <CardHeader><CardTitle>☁️ Sinkronisasi Supabase (Opsional)</CardTitle></CardHeader>
          <div className="space-y-3 mt-2">
            <Toggle id="supabase-toggle" label="Aktifkan Supabase Sync" description="Sinkronkan data ke cloud" checked={settings.supabaseEnabled} onChange={(v)=>updateSettings({supabaseEnabled:v})} />
            {settings.supabaseEnabled && (
              <div className="space-y-3 pt-2 border-t border-gray-800 animate-in fade-in duration-200">
                <Input id="sb-url" label="Supabase URL" placeholder="https://xxxx.supabase.co" value={settings.supabaseUrl} onChange={(e)=>updateSettings({supabaseUrl:e.target.value})} type="url" />
                <Input id="sb-key" label="Supabase Anon Key" placeholder="eyJ..." value={settings.supabaseKey} onChange={(e)=>updateSettings({supabaseKey:e.target.value})} type="password" />
                <p className="text-xs text-yellow-400 bg-yellow-950/20 border border-yellow-800/40 rounded-xl px-3 py-2">⚠️ Supabase sync saat ini mode stub. Konfigurasi tabel diperlukan untuk sinkronisasi penuh.</p>
              </div>
            )}
          </div>
        </Card>

        {/* About */}
        <Card>
          <CardHeader><CardTitle>ℹ️ Tentang</CardTitle></CardHeader>
          <div className="space-y-1 mt-1">
            {[["Versi","2.0.0"],["Storage","IndexedDB (Offline-first)"],["AI","❌ Tidak ada. Murni logika."],["Stack","Next.js · Zustand · Dexie · Recharts"],["PWA","✅ Installable"]].map(([k,v])=>(
              <div key={k} className="flex justify-between py-2 border-b border-gray-800 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm text-gray-300 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
