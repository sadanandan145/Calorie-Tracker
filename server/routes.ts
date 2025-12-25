import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertDailyEntrySchema, insertMealSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Nutrition lookup via AI
  app.post(api.meals.getNutrition.path, async (req, res) => {
    try {
      const input = api.meals.getNutrition.input.parse(req.body);
      
      const prompt = `You are a nutrition expert. Analyze the following meal and provide accurate nutritional information per serving. Return ONLY a JSON object with numbers (no text).

Meal: ${input.description}${input.quantity ? ` (${input.quantity})` : ''}

Return JSON with: calories (kcal), protein (g), carbs (g), fat (g), fiber (g)
Example: {"calories": 350, "protein": 12, "carbs": 60, "fat": 6, "fiber": 8}`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 200,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const nutrition = JSON.parse(content);
      
      res.json({
        calories: Math.round(nutrition.calories) || 0,
        protein: Math.round(nutrition.protein) || 0,
        carbs: Math.round(nutrition.carbs) || 0,
        fat: Math.round(nutrition.fat) || 0,
        fiber: Math.round(nutrition.fiber) || 0,
      });
    } catch (err) {
      console.error("Nutrition lookup error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to calculate nutrition" });
    }
  });

  app.get(api.days.list.path, async (req, res) => {
    const days = await storage.getDailyEntries();
    res.json(days);
  });

  app.get(api.days.get.path, async (req, res) => {
    const date = req.params.date;
    const entry = await storage.getDailyEntry(date);
    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }
    res.json(entry);
  });

  app.post(api.days.create.path, async (req, res) => {
    try {
      const input = api.days.create.input.parse(req.body);
      const entry = await storage.createDailyEntry(input);
      res.status(201).json(entry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.days.update.path, async (req, res) => {
    try {
      const date = req.params.date;
      const input = api.days.update.input.parse(req.body);
      const updated = await storage.updateDailyEntry(date, input);
      res.json(updated);
    } catch (err) {
       // ... error handling
       if (err instanceof Error && err.message === "Entry not found") {
         return res.status(404).json({ message: "Entry not found" });
       }
       throw err;
    }
  });

  app.delete(api.days.delete.path, async (req, res) => {
    const date = req.params.date;
    await storage.deleteDailyEntry(date);
    res.status(204).send();
  });

  app.post(api.meals.create.path, async (req, res) => {
    try {
      const date = req.params.date;
      // Ensure day exists or find it
      let day = await storage.getDailyEntry(date);
      if (!day) {
        // Create implicitly if adding meal to new day? 
        // Better to require day creation first, but for UX, let's auto-create if needed or fail.
        // For simplicity, strict adherence: fail if day not found, user should pick date first.
        // Actually, frontend should ensure day exists. 
        // Let's safe-guard:
        day = await storage.createDailyEntry({ date });
      }

      const input = api.meals.create.input.parse(req.body);
      const meal = { ...input, dailyEntryId: day.id };
      
      const updatedDay = await storage.createMeal(meal);
      // Return the *created meal* per schema? No, route definition says it returns the meal select type.
      // But wait, my implementation in storage returns the DailyEntryResponse. 
      // Let's adjust storage to return the meal, OR adjust route.
      // Shared route says: 201: z.custom<typeof meals.$inferSelect>()
      // Storage says: Promise<DailyEntryResponse>
      // Mismatch!
      // Let's fix this in route handler.
      const createdMeal = updatedDay.meals[updatedDay.meals.length - 1]; // Naive but works for now
      res.status(201).json(createdMeal);

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
           message: err.errors[0].message,
           field: err.errors[0].path.join('.')
        });
      }
      throw err;
    }
  });

  app.delete(api.meals.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteMeal(id);
    res.status(204).send();
  });

  app.get(api.trends.get.path, async (req, res) => {
    const trends = await storage.getTrends();
    res.json(trends);
  });

  // Seed data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getDailyEntries();
  if (existing.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    
    // Create today
    const day = await storage.createDailyEntry({ 
      date: today,
      weight: "85.5",
      steps: 5400,
      walkingMinutes: 45,
      strengthTraining: true,
      strengthNotes: "Upper body workout"
    });

    await storage.createMeal({
      dailyEntryId: day.id,
      mealType: "breakfast",
      description: "Oatmeal with berries",
      quantity: "1 bowl",
      calories: 350,
      protein: 12,
      carbs: 60,
      fat: 6,
      fiber: 8
    });

    await storage.createMeal({
      dailyEntryId: day.id,
      mealType: "lunch", 
      description: "Chicken Salad",
      quantity: "1 plate",
      calories: 450,
      protein: 40,
      carbs: 10,
      fat: 20,
      fiber: 5
    });
  }
}
