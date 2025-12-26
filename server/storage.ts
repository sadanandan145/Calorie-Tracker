import { db } from "./db";
import { dailyEntries, meals, type InsertDailyEntry, type InsertMeal, type DailyEntryResponse, type DaysListResponse, type TrendDataPoint } from "@shared/schema";
import { eq, desc, asc, and } from "drizzle-orm";

export interface IStorage {
  // Days
  getDailyEntries(userId: string): Promise<DaysListResponse>;
  getDailyEntry(userId: string, date: string): Promise<DailyEntryResponse | undefined>;
  createDailyEntry(userId: string, entry: InsertDailyEntry): Promise<DailyEntryResponse>;
  updateDailyEntry(userId: string, date: string, updates: Partial<InsertDailyEntry>): Promise<DailyEntryResponse>;
  deleteDailyEntry(userId: string, date: string): Promise<void>;

  // Meals
  createMeal(userId: string, meal: InsertMeal): Promise<DailyEntryResponse>; // Returns updated day
  deleteMeal(userId: string, id: number): Promise<void>;

  // Trends
  getTrends(userId: string): Promise<TrendDataPoint[]>;
}

export class DatabaseStorage implements IStorage {
  async getDailyEntries(userId: string): Promise<DaysListResponse> {
    return await db.select().from(dailyEntries).where(eq(dailyEntries.userId, userId)).orderBy(desc(dailyEntries.date));
  }

  async getDailyEntry(userId: string, date: string): Promise<DailyEntryResponse | undefined> {
    const [entry] = await db.select().from(dailyEntries).where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, date)));
    if (!entry) return undefined;

    const entryMeals = await db.select().from(meals).where(eq(meals.dailyEntryId, entry.id));
    return { ...entry, meals: entryMeals };
  }

  async createDailyEntry(userId: string, entry: InsertDailyEntry): Promise<DailyEntryResponse> {
    // Check if exists first to be safe
    const existing = await this.getDailyEntry(userId, entry.date);
    if (existing) return existing;

    const [newEntry] = await db.insert(dailyEntries).values({ ...entry, userId }).returning();
    return { ...newEntry, meals: [] };
  }

  async updateDailyEntry(userId: string, date: string, updates: Partial<InsertDailyEntry>): Promise<DailyEntryResponse> {
    const [updated] = await db.update(dailyEntries)
      .set(updates)
      .where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, date)))
      .returning();
    
    if (!updated) throw new Error("Entry not found");
    
    const entryMeals = await db.select().from(meals).where(eq(meals.dailyEntryId, updated.id));
    return { ...updated, meals: entryMeals };
  }

  async deleteDailyEntry(userId: string, date: string): Promise<void> {
     const entry = await db.select().from(dailyEntries).where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, date))).limit(1);
     if (entry.length > 0) {
       await db.delete(meals).where(eq(meals.dailyEntryId, entry[0].id));
       await db.delete(dailyEntries).where(and(eq(dailyEntries.userId, userId), eq(dailyEntries.date, date)));
     }
  }

  async createMeal(userId: string, meal: InsertMeal): Promise<DailyEntryResponse> {
    await db.insert(meals).values(meal);
    
    // Fetch updated daily entry to return
    const [entry] = await db.select().from(dailyEntries).where(eq(dailyEntries.id, meal.dailyEntryId));
    return this.getDailyEntry(userId, entry.date) as Promise<DailyEntryResponse>;
  }

  async deleteMeal(userId: string, id: number): Promise<void> {
    await db.delete(meals).where(eq(meals.id, id));
  }

  async getTrends(userId: string): Promise<TrendDataPoint[]> {
    const entries = await db.select().from(dailyEntries).where(eq(dailyEntries.userId, userId)).orderBy(asc(dailyEntries.date));
    
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
