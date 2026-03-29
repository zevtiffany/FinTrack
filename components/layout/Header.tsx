"use client";
import { useFinanceStore } from "@/store/useFinanceStore";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { settings, updateSettings } = useFinanceStore();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {/* Silent Wealth toggle */}
        <button
          onClick={() => updateSettings({ silentWealthMode: !settings.silentWealthMode })}
          title={settings.silentWealthMode ? "Tampilkan saldo" : "Sembunyikan saldo"}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all border",
            settings.silentWealthMode
              ? "border-yellow-700/50 bg-yellow-900/20 text-yellow-400"
              : "border-gray-700 bg-gray-800 text-gray-400 hover:text-white"
          )}
        >
          {settings.silentWealthMode ? (
            <>
              <EyeOff /> Silent Mode
            </>
          ) : (
            <>
              <Eye /> Visible
            </>
          )}
        </button>
      </div>
    </header>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20C5 20 1 12 1 12a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" />
    </svg>
  );
}
