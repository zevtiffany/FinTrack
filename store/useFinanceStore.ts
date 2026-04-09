"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  Transaction, User, Settings, FinancialMetrics,
  RunwayResult, AllowanceResult, RegretResult, FinancialScoreResult, StreakResult,
  RecurringTransaction, CategoryBudget, CustomCategory, SavingGoal, VirtualInvestment,
} from "@/types";
import { calculateRunway } from "@/lib/algorithms/runway";
import { calculateAllowance } from "@/lib/algorithms/allowance";
import { calculateRegret } from "@/lib/algorithms/regret";
import { calculateFinancialScore } from "@/lib/algorithms/benchmark";
import { calculateStreak } from "@/lib/algorithms/streak";
import {
  getAllTransactions, addTransaction as dbAddTx, deleteTransaction as dbDeleteTx,
  updateTransaction as dbUpdateTx, getUser, saveUser as dbSaveUser,
  getAllGoals, addGoal as dbAddGoal, updateGoal as dbUpdateGoal, deleteGoal as dbDeleteGoal,
  getAllInvestments, addInvestment as dbAddInvestment, deleteInvestment as dbDeleteInvestment,
  getAllRecurring, addRecurring as dbAddRecurring, updateRecurring as dbUpdateRecurring, deleteRecurring as dbDeleteRecurring,
  getAllCategoryBudgets, setCategoryBudget as dbSetBudget, deleteCategoryBudget as dbDeleteBudget,
  getAllCustomCategories, addCustomCategory as dbAddCustomCat, deleteCustomCategory as dbDeleteCustomCat,
} from "@/lib/db/queries";
import { getDaysInMonth, format, parseISO } from "date-fns";
import { notifyOverspending, notifyRunwayDanger } from "@/lib/utils/notifications";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function currentMonthPrefix(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function computeMetrics(transactions: Transaction[], user: User | null): FinancialMetrics {
  if (!user) return { runway: null, allowance: null, regret: null, score: null, streak: null };

  const now = new Date();
  const totalDays = getDaysInMonth(now);
  const dayOfMonth = now.getDate();
  const daysLeft = totalDays - dayOfMonth;
  const prefix = currentMonthPrefix();

  const monthExpenses = transactions.filter((t) => t.type === "expense" && t.date.startsWith(prefix));
  const E_used = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const monthIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith(prefix))
    .reduce((s, t) => s + t.amount, 0);

  const runway = calculateRunway(user.currentSavings, transactions);
  const allowance = calculateAllowance(user.monthlyIncome, E_used, user.targetSavings, daysLeft, dayOfMonth, totalDays);
  const regret = calculateRegret(monthExpenses);
  const score = calculateFinancialScore(monthIncome || user.monthlyIncome, E_used, user.cityAvgIncome);
  const streak = calculateStreak(transactions);

  return { runway, allowance, regret, score, streak };
}

// Recurring transaction processing
function isDue(r: RecurringTransaction, todayStr: string): boolean {
  if (!r.isActive) return false;
  if (r.lastApplied === todayStr) return false;
  const today = parseISO(todayStr);
  if (r.frequency === "daily") return true;
  if (r.frequency === "weekly") return today.getDay() === (r.dayOfWeek ?? 1);
  if (r.frequency === "monthly") {
    if (today.getDate() !== (r.dayOfMonth ?? 1)) return false;
    if (!r.lastApplied) return true;
    return parseISO(r.lastApplied).getMonth() !== today.getMonth();
  }
  return false;
}

// ─────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────

interface FinanceState {
  transactions: Transaction[];
  user: User | null;
  savingGoals: SavingGoal[];
  virtualInvestments: VirtualInvestment[];
  recurringTransactions: RecurringTransaction[];
  categoryBudgets: CategoryBudget[];
  customCategories: CustomCategory[];
  settings: Settings;
  metrics: FinancialMetrics;
  isLoading: boolean;
  isInitialized: boolean;

  // Core
  initialize: () => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (id: number, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  updateUser: (user: Omit<User, "id">) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;

  // Goals
  addGoal: (goal: Omit<SavingGoal, "id">) => Promise<void>;
  updateGoal: (id: number, data: Partial<SavingGoal>) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;

  // Investments
  addInvestment: (inv: Omit<VirtualInvestment, "id">) => Promise<void>;
  deleteInvestment: (id: number) => Promise<void>;

  // Recurring
  addRecurring: (r: Omit<RecurringTransaction, "id">) => Promise<void>;
  updateRecurring: (id: number, data: Partial<RecurringTransaction>) => Promise<void>;
  deleteRecurring: (id: number) => Promise<void>;

  // Category Budgets
  setCategoryBudget: (category: string, limit: number) => Promise<void>;
  deleteCategoryBudget: (id: number) => Promise<void>;

  // Custom Categories
  addCustomCategory: (cat: Omit<CustomCategory, "id">) => Promise<void>;
  deleteCustomCategory: (id: number) => Promise<void>;
}

const defaultSettings: Settings = {
  silentWealthMode: false,
  supabaseEnabled: false,
  supabaseUrl: "",
  supabaseKey: "",
  currency: "IDR",
  theme: "dark",
  notificationsEnabled: false,
};

const emptyMetrics: FinancialMetrics = {
  runway: null, allowance: null, regret: null, score: null, streak: null,
};

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────

export const useFinanceStore = create<FinanceState>()(
  immer((set, get) => ({
    transactions: [],
    user: null,
    savingGoals: [],
    virtualInvestments: [],
    recurringTransactions: [],
    categoryBudgets: [],
    customCategories: [],
    settings: defaultSettings,
    metrics: emptyMetrics,
    isLoading: false,
    isInitialized: false,

    initialize: async () => {
      set((s) => { s.isLoading = true; });
      try {
        const [transactions, user, goals, investments, recurring, budgets, customCats] = await Promise.all([
          getAllTransactions(),
          getUser(),
          getAllGoals(),
          getAllInvestments(),
          getAllRecurring(),
          getAllCategoryBudgets(),
          getAllCustomCategories(),
        ]);

        // Process recurring transactions due today
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const dueRecurring = recurring.filter((r) => isDue(r, todayStr));
        const newTxIds: Transaction[] = [];

        for (const r of dueRecurring) {
          const tx: Omit<Transaction, "id"> = {
            type: r.type, amount: r.amount, category: r.category,
            emotionalTag: r.emotionalTag, date: todayStr, note: `[Rutin] ${r.title}`, createdAt: Date.now(),
          };
          const id = await dbAddTx(tx);
          newTxIds.push({ ...tx, id });
          await dbUpdateRecurring(r.id!, { lastApplied: todayStr });
        }

        const allTransactions = [...newTxIds, ...transactions];
        const currentUser = user ?? null;
        const metrics = computeMetrics(allTransactions, currentUser);

        // Send notifications if enabled
        const storedSettings = localStorage.getItem("fintrack-settings");
        const savedSettings: Partial<Settings> = storedSettings ? JSON.parse(storedSettings) : {};

        if (savedSettings.notificationsEnabled && metrics.allowance) {
          notifyOverspending(metrics.allowance.adjusted_allowance);
        }
        if (savedSettings.notificationsEnabled && metrics.runway && !metrics.runway.isInfinite) {
          notifyRunwayDanger(metrics.runway.days);
        }

        set((s) => {
          s.transactions = allTransactions;
          s.user = currentUser;
          s.savingGoals = goals;
          s.virtualInvestments = investments;
          s.recurringTransactions = recurring.map((r) => {
            const updated = dueRecurring.find((d) => d.id === r.id);
            return updated ? { ...r, lastApplied: todayStr } : r;
          });
          s.categoryBudgets = budgets;
          s.customCategories = customCats;
          s.metrics = metrics;
          s.settings = { ...defaultSettings, ...savedSettings };
          s.isLoading = false;
          s.isInitialized = true;
        });
      } catch (err) {
        console.error("Store init error:", err);
        set((s) => { s.isLoading = false; s.isInitialized = true; });
      }
    },

    addTransaction: async (tx) => {
      const id = await dbAddTx(tx);
      const full: Transaction = { ...tx, id };
      set((s) => {
        s.transactions.unshift(full);
        s.metrics = computeMetrics(s.transactions, s.user);
      });
    },

    updateTransaction: async (id, data) => {
      await dbUpdateTx(id, data);
      set((s) => {
        const idx = s.transactions.findIndex((t) => t.id === id);
        if (idx !== -1) Object.assign(s.transactions[idx], data);
        s.metrics = computeMetrics(s.transactions, s.user);
      });
    },

    deleteTransaction: async (id) => {
      await dbDeleteTx(id);
      set((s) => {
        s.transactions = s.transactions.filter((t) => t.id !== id);
        s.metrics = computeMetrics(s.transactions, s.user);
      });
    },

    updateUser: async (user) => {
      await dbSaveUser(user);
      set((s) => {
        s.user = user as User;
        s.metrics = computeMetrics(s.transactions, s.user);
      });
    },

    updateSettings: (partial) => {
      set((s) => { Object.assign(s.settings, partial); });
      const { settings } = get();
      localStorage.setItem("fintrack-settings", JSON.stringify({ ...settings, ...partial }));
    },

    // Goals
    addGoal: async (goal) => {
      const id = await dbAddGoal(goal);
      set((s) => { s.savingGoals.push({ ...goal, id }); });
    },
    updateGoal: async (id, data) => {
      await dbUpdateGoal(id, data);
      set((s) => {
        const idx = s.savingGoals.findIndex((g) => g.id === id);
        if (idx !== -1) Object.assign(s.savingGoals[idx], data);
      });
    },
    deleteGoal: async (id) => {
      await dbDeleteGoal(id);
      set((s) => { s.savingGoals = s.savingGoals.filter((g) => g.id !== id); });
    },

    // Investments
    addInvestment: async (inv) => {
      const id = await dbAddInvestment(inv);
      set((s) => { s.virtualInvestments.unshift({ ...inv, id }); });
    },
    deleteInvestment: async (id) => {
      await dbDeleteInvestment(id);
      set((s) => { s.virtualInvestments = s.virtualInvestments.filter((v) => v.id !== id); });
    },

    // Recurring
    addRecurring: async (r) => {
      const id = await dbAddRecurring(r);
      set((s) => { s.recurringTransactions.unshift({ ...r, id }); });
    },
    updateRecurring: async (id, data) => {
      await dbUpdateRecurring(id, data);
      set((s) => {
        const idx = s.recurringTransactions.findIndex((r) => r.id === id);
        if (idx !== -1) Object.assign(s.recurringTransactions[idx], data);
      });
    },
    deleteRecurring: async (id) => {
      await dbDeleteRecurring(id);
      set((s) => { s.recurringTransactions = s.recurringTransactions.filter((r) => r.id !== id); });
    },

    // Category Budgets
    setCategoryBudget: async (category, limit) => {
      await dbSetBudget(category, limit);
      const budgets = await getAllCategoryBudgets();
      set((s) => { s.categoryBudgets = budgets; });
    },
    deleteCategoryBudget: async (id) => {
      await dbDeleteBudget(id);
      set((s) => { s.categoryBudgets = s.categoryBudgets.filter((b) => b.id !== id); });
    },

    // Custom Categories
    addCustomCategory: async (cat) => {
      const id = await dbAddCustomCat(cat);
      set((s) => { s.customCategories.push({ ...cat, id }); });
    },
    deleteCustomCategory: async (id) => {
      await dbDeleteCustomCat(id);
      set((s) => { s.customCategories = s.customCategories.filter((c) => c.id !== id); });
    },
  }))
);
