import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type DailyEntryResponse, type CreateMealRequest, type UpdateDailyEntryRequest, type TrendDataPoint } from "@shared/routes";
import { format } from "date-fns";

// ============================================
// DAILY ENTRIES
// ============================================

export function useDay(date: string) {
  // Ensure we fetch even if the day doesn't exist yet (API should handle 404 or return default)
  // However, our API returns 404 if not found. We might want to handle that gracefully in UI 
  // or auto-create. For this app, the UI will likely check query.error or query.data
  return useQuery({
    queryKey: [api.days.get.path, date],
    queryFn: async () => {
      const url = buildUrl(api.days.get.path, { date });
      const res = await fetch(url, { credentials: "include" });
      
      // If 404, we return null to signal "not created yet"
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch day');
      
      return api.days.get.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (date: string) => {
      const res = await fetch(api.days.create.path, {
        method: api.days.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to create day');
      return api.days.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, date) => {
      queryClient.invalidateQueries({ queryKey: [api.days.get.path, date] });
      queryClient.invalidateQueries({ queryKey: [api.trends.get.path] });
    },
  });
}

export function useUpdateDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, ...updates }: { date: string } & UpdateDailyEntryRequest) => {
      const url = buildUrl(api.days.update.path, { date });
      const res = await fetch(url, {
        method: api.days.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to update day');
      return api.days.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: [api.days.get.path, date] });
      queryClient.invalidateQueries({ queryKey: [api.trends.get.path] });
    },
  });
}

// ============================================
// MEALS
// ============================================

export function useAddMeal(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (meal: CreateMealRequest) => {
      const url = buildUrl(api.meals.create.path, { date });
      const res = await fetch(url, {
        method: api.meals.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meal),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to add meal');
      return api.meals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.days.get.path, date] });
      queryClient.invalidateQueries({ queryKey: [api.trends.get.path] });
    },
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date }: { id: number, date: string }) => {
      const url = buildUrl(api.meals.delete.path, { id });
      const res = await fetch(url, { 
        method: api.meals.delete.method, 
        credentials: "include" 
      });
      if (!res.ok) throw new Error('Failed to delete meal');
    },
    onSuccess: (_, { date }) => {
      queryClient.invalidateQueries({ queryKey: [api.days.get.path, date] });
      queryClient.invalidateQueries({ queryKey: [api.trends.get.path] });
    },
  });
}

// ============================================
// TRENDS
// ============================================

export function useTrends() {
  return useQuery({
    queryKey: [api.trends.get.path],
    queryFn: async () => {
      const res = await fetch(api.trends.get.path, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch trends');
      return api.trends.get.responses[200].parse(await res.json());
    },
  });
}
