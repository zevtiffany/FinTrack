import type { Transaction } from "@/types";
import { format } from "date-fns";

// ─────────────────────────────────────────────
// Export transactions to CSV
// ─────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  Food: "Makanan", Transport: "Transportasi", Entertainment: "Hiburan",
  Shopping: "Belanja", Health: "Kesehatan", Education: "Pendidikan",
  Utilities: "Utilitas", Housing: "Hunian", Savings: "Tabungan",
  Investment: "Investasi", Salary: "Gaji", Freelance: "Freelance", Other: "Lainnya",
};

const TAG_LABELS: Record<string, string> = {
  Needs: "Kebutuhan", Planned: "Terencana", Impulsive: "Impulsif",
};

export function exportTransactionsToCSV(transactions: Transaction[]): void {
  const headers = ["Tanggal", "Tipe", "Jumlah (Rp)", "Kategori", "Tag Emosional", "Catatan"];

  const rows = transactions.map((t) => [
    t.date,
    t.type === "income" ? "Pemasukan" : "Pengeluaran",
    t.amount.toString(),
    CATEGORY_LABELS[t.category] ?? t.category,
    TAG_LABELS[t.emotionalTag] ?? t.emotionalTag,
    `"${t.note.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fintrack-transaksi-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
