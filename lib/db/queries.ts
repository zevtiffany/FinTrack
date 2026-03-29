import { db } from "@/lib/db/schema";
import type {
  Transaction, User, SavingGoal, VirtualInvestment,
  RecurringTransaction, CategoryBudget, CustomCategory,
} from "@/types";

// ─── Transactions ─────────────────────────────

export async function getAllTransactions(): Promise<Transaction[]> {
  return db.transactions.orderBy("createdAt").reverse().toArray();
}

export async function addTransaction(tx: Omit<Transaction, "id">): Promise<number> {
  return db.transactions.add(tx) as Promise<number>;
}

export async function updateTransaction(id: number, tx: Partial<Transaction>): Promise<void> {
  await db.transactions.update(id, tx);
}

export async function deleteTransaction(id: number): Promise<void> {
  return db.transactions.delete(id);
}

// ─── User ─────────────────────────────────────

export async function getUser(): Promise<User | undefined> {
  return db.users.toCollection().first();
}

export async function saveUser(user: Omit<User, "id">): Promise<void> {
  const existing = await db.users.toCollection().first();
  if (existing?.id) {
    await db.users.update(existing.id, user);
  } else {
    await db.users.add(user);
  }
}

// ─── Saving Goals ─────────────────────────────

export async function getAllGoals(): Promise<SavingGoal[]> {
  return db.savingGoals.orderBy("deadline").toArray();
}

export async function addGoal(goal: Omit<SavingGoal, "id">): Promise<number> {
  return db.savingGoals.add(goal) as Promise<number>;
}

export async function updateGoal(id: number, data: Partial<SavingGoal>): Promise<void> {
  await db.savingGoals.update(id, data);
}

export async function deleteGoal(id: number): Promise<void> {
  return db.savingGoals.delete(id);
}

// ─── Virtual Investments ──────────────────────

export async function getAllInvestments(): Promise<VirtualInvestment[]> {
  return db.virtualInvestments.orderBy("createdAt").reverse().toArray();
}

export async function addInvestment(inv: Omit<VirtualInvestment, "id">): Promise<number> {
  return db.virtualInvestments.add(inv) as Promise<number>;
}

export async function deleteInvestment(id: number): Promise<void> {
  return db.virtualInvestments.delete(id);
}

// ─── Recurring Transactions ───────────────────

export async function getAllRecurring(): Promise<RecurringTransaction[]> {
  return db.recurringTransactions.orderBy("createdAt").reverse().toArray();
}

export async function addRecurring(r: Omit<RecurringTransaction, "id">): Promise<number> {
  return db.recurringTransactions.add(r) as Promise<number>;
}

export async function updateRecurring(id: number, data: Partial<RecurringTransaction>): Promise<void> {
  await db.recurringTransactions.update(id, data);
}

export async function deleteRecurring(id: number): Promise<void> {
  return db.recurringTransactions.delete(id);
}

// ─── Category Budgets ─────────────────────────

export async function getAllCategoryBudgets(): Promise<CategoryBudget[]> {
  return db.categoryBudgets.toArray();
}

export async function setCategoryBudget(category: string, monthlyLimit: number): Promise<void> {
  const existing = await db.categoryBudgets.where("category").equals(category).first();
  if (existing?.id) {
    await db.categoryBudgets.update(existing.id, { monthlyLimit });
  } else {
    await db.categoryBudgets.add({ category, monthlyLimit });
  }
}

export async function deleteCategoryBudget(id: number): Promise<void> {
  return db.categoryBudgets.delete(id);
}

// ─── Custom Categories ────────────────────────

export async function getAllCustomCategories(): Promise<CustomCategory[]> {
  return db.customCategories.orderBy("createdAt").toArray();
}

export async function addCustomCategory(cat: Omit<CustomCategory, "id">): Promise<number> {
  return db.customCategories.add(cat) as Promise<number>;
}

export async function deleteCustomCategory(id: number): Promise<void> {
  return db.customCategories.delete(id);
}
