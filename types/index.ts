// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum EmotionalTag {
  Needs = 0,
  Planned = 0.3,
  Impulsive = 1,
}

export type EmotionalTagKey = keyof typeof EmotionalTag;
export type TransactionType = "income" | "expense";
export type FrequencyType = "daily" | "weekly" | "monthly";
export type Theme = "dark" | "light";

export type Category =
  | "Food" | "Transport" | "Entertainment" | "Shopping"
  | "Health" | "Education" | "Utilities" | "Housing"
  | "Savings" | "Investment" | "Salary" | "Freelance" | "Other";

export type FinancialScoreCategory = "Above Average" | "At Risk" | "Critical";

// ─────────────────────────────────────────────
// Core Models
// ─────────────────────────────────────────────

export interface Transaction {
  id?: number;
  type: TransactionType;
  amount: number;
  category: Category | string;
  emotionalTag: EmotionalTagKey;
  date: string;
  note: string;
  createdAt: number;
}

export interface RecurringTransaction {
  id?: number;
  title: string;
  type: TransactionType;
  amount: number;
  category: Category | string;
  emotionalTag: EmotionalTagKey;
  note: string;
  frequency: FrequencyType;
  dayOfMonth?: number;   // 1-31 (for monthly)
  dayOfWeek?: number;    // 0-6  (for weekly)
  isActive: boolean;
  lastApplied?: string;  // YYYY-MM-DD
  createdAt: number;
}

export interface CategoryBudget {
  id?: number;
  category: string;
  monthlyLimit: number;
}

export interface CustomCategory {
  id?: number;
  name: string;
  emoji: string;
  createdAt: number;
}

export interface User {
  id?: number;
  name: string;
  monthlyIncome: number;
  currentSavings: number;
  cityAvgIncome: number;
  monthlyBudget: number;
  targetSavings: number;
}

export interface SavingGoal {
  id?: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: number;
}

export interface VirtualInvestment {
  id?: number;
  name: string;
  principal: number;
  rate: number;
  years: number;
  createdAt: number;
}

// ─────────────────────────────────────────────
// Algorithm return types
// ─────────────────────────────────────────────

export interface RunwayResult {
  days: number;
  hours: number;
  E_avg: number;
  isInfinite: boolean;
}

export interface AllowanceResult {
  daily_allowance: number;
  adjusted_allowance: number;
  penalty_factor: number;
  remaining_budget: number;
}

export interface RegretResult {
  totalRegret: number;
  impulsivePercent: number;
  breakdown: { needs: number; planned: number; impulsive: number };
}

export interface FutureValueResult {
  futureValue: number;
  gain: number;
  principal: number;
}

export interface FinancialScoreResult {
  score: number;
  category: FinancialScoreCategory;
  savings_rate: number;
}

export interface StreakResult {
  days: number;
  isActive: boolean;
  lastBrokenDate?: string;
}

// ─────────────────────────────────────────────
// Store / UI State
// ─────────────────────────────────────────────

export interface Settings {
  silentWealthMode: boolean;
  supabaseEnabled: boolean;
  supabaseUrl: string;
  supabaseKey: string;
  currency: string;
  theme: Theme;
  notificationsEnabled: boolean;
}

export interface FinancialMetrics {
  runway: RunwayResult | null;
  allowance: AllowanceResult | null;
  regret: RegretResult | null;
  score: FinancialScoreResult | null;
  streak: StreakResult | null;
}
