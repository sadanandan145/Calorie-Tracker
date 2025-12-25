import { z } from 'zod';
import { insertDailyEntrySchema, insertMealSchema, dailyEntries, meals } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  days: {
    list: {
      method: 'GET' as const,
      path: '/api/days',
      responses: {
        200: z.array(z.custom<typeof dailyEntries.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/days/:date', // Use date string as ID for easier frontend routing
      responses: {
        200: z.custom<typeof dailyEntries.$inferSelect & { meals: typeof meals.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/days',
      input: z.object({ date: z.string() }),
      responses: {
        201: z.custom<typeof dailyEntries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/days/:date',
      input: insertDailyEntrySchema.partial(),
      responses: {
        200: z.custom<typeof dailyEntries.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/days/:date',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    }
  },
  meals: {
    create: {
      method: 'POST' as const,
      path: '/api/days/:date/meals',
      input: insertMealSchema.omit({ dailyEntryId: true }), // We infer dailyEntryId from the date
      responses: {
        201: z.custom<typeof meals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/meals/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    getNutrition: {
      method: 'POST' as const,
      path: '/api/nutrition-lookup',
      input: z.object({
        description: z.string(),
        quantity: z.string().optional(),
      }),
      responses: {
        200: z.object({
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
          fiber: z.number(),
        }),
        400: errorSchemas.validation,
      },
    },
  },
  trends: {
    get: {
      method: 'GET' as const,
      path: '/api/trends',
      responses: {
        200: z.array(z.object({
          date: z.string(),
          weight: z.number().nullable(),
          calories: z.number(),
          protein: z.number(),
        })),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
