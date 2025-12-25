import { db } from "./db";
import { dailyEntries, meals, type InsertDailyEntry, type InsertMeal, type DailyEntryResponse, type DaysListResponse, type TrendDataPoint } from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Days
  getDailyEntries(): Promise<DaysListResponse>;
  getDailyEntry(date: string): Promise<DailyEntryResponse | undefined>;
  createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntryResponse>;
  updateDailyEntry(date: string, updates: Partial<InsertDailyEntry>): Promise<DailyEntryResponse>;
  deleteDailyEntry(date: string): Promise<void>;

  // Meals
  createMeal(meal: InsertMeal): Promise<DailyEntryResponse>; // Returns updated day
  deleteMeal(id: number): Promise<void>;

  // Trends
  getTrends(): Promise<TrendDataPoint[]>;
}

export class DatabaseStorage implements IStorage {
  async getDailyEntries(): Promise<DaysListResponse> {
    return await db.select().from(dailyEntries).orderBy(desc(dailyEntries.date));
  }

  async getDailyEntry(date: string): Promise<DailyEntryResponse | undefined> {
    const [entry] = await db.select().from(dailyEntries).where(eq(dailyEntries.date, date));
    if (!entry) return undefined;

    const entryMeals = await db.select().from(meals).where(eq(meals.dailyEntryId, entry.id));
    return { ...entry, meals: entryMeals };
  }

  async createDailyEntry(entry: InsertDailyEntry): Promise<DailyEntryResponse> {
    // Check if exists first to be safe, though unique constraint handles it
    const existing = await this.getDailyEntry(entry.date);
    if (existing) return existing;

    const [newEntry] = await db.insert(dailyEntries).values(entry).returning();
    return { ...newEntry, meals: [] };
  }

  async updateDailyEntry(date: string, updates: Partial<InsertDailyEntry>): Promise<DailyEntryResponse> {
    const [updated] = await db.update(dailyEntries)
      .set(updates)
      .where(eq(dailyEntries.date, date))
      .returning();
    
    if (!updated) throw new Error("Entry not found");
    
    const entryMeals = await db.select().from(meals).where(eq(meals.dailyEntryId, updated.id));
    return { ...updated, meals: entryMeals };
  }

  async deleteDailyEntry(date: string): Promise<void> {
     // Meals should cascade delete if FK configured, but manual cleanup is safer if not
     const entry = await db.select().from(dailyEntries).where(eq(dailyEntries.date, date)).limit(1);
     if (entry.length > 0) {
       await db.delete(meals).where(eq(meals.dailyEntryId, entry[0].id));
       await db.delete(dailyEntries).where(eq(dailyEntries.date, date));
     }
  }

  async createMeal(meal: InsertMeal): Promise<DailyEntryResponse> {
    await db.insert(meals).values(meal);
    
    // Fetch updated daily entry to return
    const [entry] = await db.select().from(dailyEntries).where(eq(dailyEntries.id, meal.dailyEntryId));
    return this.getDailyEntry(entry.date) as Promise<DailyEntryResponse>;
  }

  async deleteMeal(id: number): Promise<void> {
    await db.delete(meals).where(eq(meals.id, id));
  }

  async getTrends(): Promise<TrendDataPoint[]> {
    const entries = await db.select().from(dailyEntries).orderBy(asc(dailyEntries.date));
    
    const results: TrendDataPoint[] = [];
    
    for (const entry of entries) {
      const dayMeals = await db.select().from(meals).where(eq(meals.dailyEntryId, entry.id));
      const calories = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
      const protein = dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
      
      results.push({
        date: entry.date,
        weight: entry.weight ? Number(entry.weight) : null,
        calories,
        protein
      });
    }
    
    return results;
  }
}

export const storage = new DatabaseStorage();
