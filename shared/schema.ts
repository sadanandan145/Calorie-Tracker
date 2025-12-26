import { pgTable, text, serial, integer, boolean, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const dailyEntries = pgTable("daily_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Username as user identifier
  date: date("date").notNull(), // YYYY-MM-DD
  weight: decimal("weight", { precision: 5, scale: 2 }), // e.g., 85.50
  steps: integer("steps").default(0),
  walkingMinutes: integer("walking_minutes").default(0),
  strengthTraining: boolean("strength_training").default(false),
  strengthNotes: text("strength_notes"),
  createdAt: date("created_at").defaultNow(),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  dailyEntryId: integer("daily_entry_id").notNull(), // FK reference added in relations
  mealType: text("meal_type").notNull(), // breakfast, morning_snack, lunch, evening_snack, dinner
  description: text("description").notNull(),
  quantity: text("quantity"), // e.g., "200g"
  calories: integer("calories").default(0),
  protein: integer("protein").default(0),
  carbs: integer("carbs").default(0),
  fat: integer("fat").default(0),
  fiber: integer("fiber").default(0),
});

// === RELATIONS ===

export const dailyEntriesRelations = relations(dailyEntries, ({ many }) => ({
  meals: many(meals),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
  dailyEntry: one(dailyEntries, {
    fields: [meals.dailyEntryId],
    references: [dailyEntries.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertDailyEntrySchema = createInsertSchema(dailyEntries).omit({ id: true, createdAt: true });
export const insertMealSchema = createInsertSchema(meals).omit({ id: true });

// Profile schema for user settings (stored locally in free tier)
export const profileSchema = z.object({
  height: z.number().optional(), // cm
  username: z.string().optional(),
});
export type Profile = z.infer<typeof profileSchema>;

// === EXPLICIT API CONTRACT TYPES ===

export type DailyEntry = typeof dailyEntries.$inferSelect;
export type Meal = typeof meals.$inferSelect;

export type InsertDailyEntry = z.infer<typeof insertDailyEntrySchema>;
export type InsertMeal = z.infer<typeof insertMealSchema>;

export type CreateDailyEntryRequest = { date: string }; // Just start with a date
export type UpdateDailyEntryRequest = Partial<InsertDailyEntry>;
export type CreateMealRequest = InsertMeal;

// Response includes meals
export type DailyEntryResponse = DailyEntry & { meals: Meal[] };
export type DaysListResponse = DailyEntry[]; // Simplified list for calendar/history

// Trends response
export interface TrendDataPoint {
  date: string;
  weight: number | null;
  calories: number;
  protein: number;
}

// Export chat tables for integration
export { conversations, messages } from "./models/chat";
