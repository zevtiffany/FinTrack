import Dexie, { type EntityTable } from "dexie";
import type {
  Transaction, User, SavingGoal, VirtualInvestment,
  RecurringTransaction, CategoryBudget, CustomCategory,
} from "@/types";

interface EmotionalTagRecord {
  id?: number;
  key: string;
  weight: number;
  label: string;
}

class FinTrackDB extends Dexie {
  transactions!: EntityTable<Transaction, "id">;
  users!: EntityTable<User, "id">;
  emotionalTags!: EntityTable<EmotionalTagRecord, "id">;
  savingGoals!: EntityTable<SavingGoal, "id">;
  virtualInvestments!: EntityTable<VirtualInvestment, "id">;
  recurringTransactions!: EntityTable<RecurringTransaction, "id">;
  categoryBudgets!: EntityTable<CategoryBudget, "id">;
  customCategories!: EntityTable<CustomCategory, "id">;

  constructor() {
    super("FinTrackDB");

    this.version(1).stores({
      transactions: "++id, type, date, category, emotionalTag, createdAt",
      users: "++id",
      emotionalTags: "++id, key",
      savingGoals: "++id, deadline, createdAt",
      virtualInvestments: "++id, createdAt",
    });

    this.version(2).stores({
      transactions: "++id, type, date, category, emotionalTag, createdAt",
      users: "++id",
      emotionalTags: "++id, key",
      savingGoals: "++id, deadline, createdAt",
      virtualInvestments: "++id, createdAt",
      recurringTransactions: "++id, frequency, isActive, createdAt",
      categoryBudgets: "++id, category",
      customCategories: "++id, name, createdAt",
    });
  }
}

export const db = new FinTrackDB();

db.on("ready", async () => {
  const count = await db.emotionalTags.count();
  if (count === 0) {
    await db.emotionalTags.bulkAdd([
      { key: "Needs", weight: 0, label: "Kebutuhan" },
      { key: "Planned", weight: 0.3, label: "Terencana" },
      { key: "Impulsive", weight: 1, label: "Impulsif" },
    ]);
  }
});
