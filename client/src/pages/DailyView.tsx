import { useEffect, useMemo, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { format, addDays, subDays, parseISO, isSameDay } from "date-fns";
import { useDay, useCreateDay, useUpdateDay, useDeleteMeal } from "@/hooks/use-tracker";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AddMealDialog } from "@/components/AddMealDialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Dumbbell, 
  Footprints, 
  Check, 
  Trash2,
  CalendarDays,
  Utensils
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

// Group meals by type helper
const groupMeals = (meals: any[]) => {
  const groups: Record<string, any[]> = {
    breakfast: [],
    morning_snack: [],
    lunch: [],
    evening_snack: [],
    dinner: []
  };
  
  meals?.forEach(meal => {
    if (groups[meal.mealType]) {
      groups[meal.mealType].push(meal);
    }
  });
  
  return groups;
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  morning_snack: "Morning Snack",
  lunch: "Lunch",
  evening_snack: "Evening Snack",
  dinner: "Dinner"
};

export default function DailyView() {
  const [match, params] = useRoute("/day/:date");
  const [, setLocation] = useLocation();
  const dateStr = params?.date || format(new Date(), "yyyy-MM-dd");
  
  const { data: day, isLoading, error } = useDay(dateStr);
  const createDay = useCreateDay();
  const updateDay = useUpdateDay();
  
  // Auto-create day if it doesn't exist (null response)
  useEffect(() => {
    if (!isLoading && day === null) {
      createDay.mutate(dateStr);
    }
  }, [day, isLoading, dateStr]);

  // Handle navigation
  const goToPrev = () => setLocation(`/day/${format(subDays(parseISO(dateStr), 1), "yyyy-MM-dd")}`);
  const goToNext = () => setLocation(`/day/${format(addDays(parseISO(dateStr), 1), "yyyy-MM-dd")}`);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading your day...</p>
        </div>
      </Layout>
    );
  }

  // Calculate Totals
  const totals = (day?.meals || []).reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <Layout>
      <header className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={goToPrev} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-display font-bold">
            {isSameDay(parseISO(dateStr), new Date()) ? "Today" : format(parseISO(dateStr), "EEE, MMM d")}
          </h1>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
            Overview
          </p>
        </div>

        <Button variant="ghost" size="icon" onClick={goToNext} className="rounded-full">
          <ChevronRight className="w-6 h-6" />
        </Button>
      </header>

      <div className="space-y-6">
        {/* SUMMARY CARD */}
        <Card className="bg-primary text-primary-foreground border-none shadow-xl shadow-primary/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <CardContent className="pt-6 relative z-10">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-primary-foreground/80 text-sm font-medium mb-1">Calories Consumed</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-display font-bold">{totals.calories}</span>
                  <span className="text-lg opacity-80">kcal</span>
                </div>
              </div>
              <Flame className="w-12 h-12 text-primary-foreground/20" />
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-black/10 rounded-xl backdrop-blur-sm">
              <MacroItem label="Protein" value={totals.protein} unit="g" />
              <MacroItem label="Carbs" value={totals.carbs} unit="g" />
              <MacroItem label="Fat" value={totals.fat} unit="g" />
            </div>
          </CardContent>
        </Card>

        {/* WEIGHT & ACTIVITY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Weight
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="text-2xl font-display font-bold h-16"
                  value={day?.weight || ''}
                  onChange={(e) => updateDay.mutate({ date: dateStr, weight: e.target.value })}
                />
                <span className="text-xl font-medium text-muted-foreground">kg</span>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Footprints className="w-4 h-4" />
                Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input 
                type="number"
                placeholder="0"
                className="text-lg font-medium h-16"
                value={day?.steps || ''}
                onChange={(e) => updateDay.mutate({ date: dateStr, steps: parseInt(e.target.value) || 0 })}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* STRENGTH TRAINING TOGGLE */}
        <div 
          className={clsx(
            "flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
            day?.strengthTraining 
              ? "bg-accent/10 border-accent text-accent-foreground" 
              : "bg-card border-border hover:border-border/80"
          )}
          onClick={() => updateDay.mutate({ date: dateStr, strengthTraining: !day?.strengthTraining })}
        >
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
              day?.strengthTraining ? "bg-accent text-white" : "bg-muted text-muted-foreground"
            )}>
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-foreground">Strength Training</p>
              <p className="text-xs text-muted-foreground">Did you lift today?</p>
            </div>
          </div>
          {day?.strengthTraining && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Check className="w-6 h-6 text-accent" />
            </motion.div>
          )}
        </div>

        {/* MEALS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              Meals
            </h2>
            <AddMealDialog date={dateStr} />
          </div>

          <div className="space-y-4">
            {Object.entries(groupMeals(day?.meals || [])).map(([type, items]) => (
              <MealGroup 
                key={type} 
                type={type} 
                items={items} 
                date={dateStr}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function MacroItem({ label, value, unit }: { label: string, value: number, unit: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs opacity-70 mb-0.5 uppercase tracking-wide">{label}</span>
      <span className="font-bold text-lg leading-none">
        {value}<span className="text-xs font-normal opacity-70 ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function MealGroup({ type, items, date }: { type: string, items: any[], date: string }) {
  const deleteMeal = useDeleteMeal();

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-muted/30 flex items-center justify-between border-b border-border/50">
        <h3 className="font-semibold text-sm">{MEAL_LABELS[type]}</h3>
        <div className="text-xs font-mono text-muted-foreground">
          {items.reduce((sum, item) => sum + (item.calories || 0), 0)} kcal
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-3">No meals logged</p>
          <AddMealDialog date={date} defaultType={type} />
        </div>
      ) : (
        <div className="divide-y divide-border/30">
          {items.map((meal) => (
            <div key={meal.id} className="p-4 flex items-center justify-between group hover:bg-muted/10 transition-colors">
              <div>
                <p className="font-medium text-sm text-foreground">{meal.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                    {meal.quantity || '1 serving'}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {meal.calories} kcal
                  </span>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteMeal.mutate({ id: meal.id, date })}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <div className="p-2 bg-muted/10 flex justify-center">
             <AddMealDialog date={date} defaultType={type} />
          </div>
        </div>
      )}
    </div>
  );
}
