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
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const days = await storage.getDailyEntries(userId);
    res.json(days);
  });

  app.get(api.days.get.path, async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const date = req.params.date;
    const entry = await storage.getDailyEntry(userId, date);
    if (!entry) {
      return res.status(404).json({ message: "Daily entry not found" });
    }
    res.json(entry);
  });

  app.post(api.days.create.path, async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const input = api.days.create.input.parse(req.body);
      const entry = await storage.createDailyEntry(userId, input);
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
      const userId = req.headers['x-user-id'] as string;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const date = req.params.date;
      const input = api.days.update.input.parse(req.body);
      const updated = await storage.updateDailyEntry(userId, date, input);
      res.json(updated);
    } catch (err) {
       if (err instanceof Error && err.message === "Entry not found") {
         return res.status(404).json({ message: "Entry not found" });
       }
       throw err;
    }
  });

  app.delete(api.days.delete.path, async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const date = req.params.date;
    await storage.deleteDailyEntry(userId, date);
    res.status(204).send();
  });

  app.post(api.meals.create.path, async (req, res) => {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const date = req.params.date;
      let day = await storage.getDailyEntry(userId, date);
      if (!day) {
        day = await storage.createDailyEntry(userId, { date });
      }

      const input = api.meals.create.input.parse(req.body);
      const meal = { ...input, dailyEntryId: day.id };
      
      const updatedDay = await storage.createMeal(userId, meal);
      const createdMeal = updatedDay.meals[updatedDay.meals.length - 1];
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
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const id = parseInt(req.params.id);
    await storage.deleteMeal(userId, id);
    res.status(204).send();
  });

  app.get(api.trends.get.path, async (req, res) => {
    const userId = req.headers['x-user-id'] as string;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const trends = await storage.getTrends(userId);
    res.json(trends);
  });

  // Seed data function
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  // Seed data is now per-user, so skip seeding
  // Users start with empty data when they first log in
}
