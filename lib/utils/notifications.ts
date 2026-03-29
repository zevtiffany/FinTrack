// ─────────────────────────────────────────────
// Browser Notification helpers
// ─────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function sendNotification(title: string, body: string): void {
  if (typeof window === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  } catch {
    // Notification API unavailable (e.g. HTTP context)
  }
}

export function notifyOverspending(adjustedAllowance: number): void {
  if (adjustedAllowance < 0) {
    sendNotification(
      "⚠️ FinTrack: Anggaran Hari Ini Habis",
      `Kamu sudah melampaui jatah harian. Jatah besok akan berkurang otomatis.`
    );
  }
}

export function notifyRunwayDanger(days: number): void {
  if (days < 7) {
    sendNotification(
      "🚨 FinTrack: DARURAT — Runway < 7 Hari",
      `Tabunganmu hanya cukup untuk ${days} hari lagi. Segera ambil tindakan!`
    );
  } else if (days < 30) {
    sendNotification(
      "⚠️ FinTrack: Runway Menipis",
      `Tabunganmu hanya cukup untuk ${days} hari. Perketat anggaran.`
    );
  }
}
