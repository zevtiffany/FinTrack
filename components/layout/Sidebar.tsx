"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useFinanceStore } from "@/store/useFinanceStore";

const navItems = [
  {
    href: "/dashboard", label: "Dashboard",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  },
  {
    href: "/transactions", label: "Transaksi",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path d="M8 6l4-4 4 4M16 18l-4 4-4-4M12 2v20" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    href: "/analytics", label: "Analitik",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><path d="M3 17l4-5 4 3 4-7 4 2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 21h18" strokeLinecap="round" /></svg>,
  },
  {
    href: "/goals", label: "Target",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></svg>,
  },
  {
    href: "/settings", label: "Pengaturan",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useFinanceStore();

  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 z-30"
      style={{
        background: "rgba(6,6,8,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
            boxShadow: "0 0 16px rgba(16,185,129,0.4)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth={2.2}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" strokeLinecap="round" />
            <path d="M2 12l10 5 10-5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white tracking-tight leading-none">FinTrack</p>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: "#10b981" }}>Teakillah</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "text-emerald-400"
                  : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
              )}
              style={active ? {
                background: "rgba(16,185,129,0.1)",
                boxShadow: "inset 0 0 12px rgba(16,185,129,0.05)",
              } : {}}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "linear-gradient(180deg, #10b981, #34d399)" }}
                />
              )}
              <span className={cn("flex-shrink-0", active ? "text-emerald-400" : "text-white/30")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        {user ? (
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/70 truncate">{user.name}</p>
              <p className="text-[10px] text-white/25">No AI. Pure logic.</p>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-white/20 text-center">No AI. Pure logic.</p>
        )}
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex pb-[env(safe-area-inset-bottom)]"
      style={{
        background: "rgba(6,6,8,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 py-3 transition-all duration-150",
              active ? "text-emerald-400" : "text-white/25"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150",
                active
                  ? "bg-emerald-500/15"
                  : ""
              )}
              style={active ? { boxShadow: "0 0 12px rgba(16,185,129,0.2)" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[9px] font-semibold tracking-wide">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
