import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export function Input({ className, label, error, prefix, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-gray-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-sm text-gray-500 font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={cn(
            "w-full rounded-xl border border-gray-700 bg-gray-800/70 px-3 py-2.5 text-sm text-white placeholder-gray-500 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-emerald-600/60 focus:border-emerald-600/60",
            "hover:border-gray-600",
            prefix && "pl-9",
            error && "border-red-600/60 focus:ring-red-600/40",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ className, label, error, id, options, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-gray-400 uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "w-full rounded-xl border border-gray-700 bg-gray-800/70 px-3 py-2.5 text-sm text-white transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-emerald-600/60 focus:border-emerald-600/60",
          "hover:border-gray-600",
          error && "border-red-600/60 focus:ring-red-600/40",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-gray-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
