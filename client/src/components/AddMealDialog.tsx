import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddMeal } from "@/hooks/use-tracker";
import { Plus } from "lucide-react";
import { InsertMeal } from "@shared/schema";

interface AddMealDialogProps {
  date: string;
  defaultType?: string;
}

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "morning_snack", label: "Morning Snack" },
  { value: "lunch", label: "Lunch" },
  { value: "evening_snack", label: "Evening Snack" },
  { value: "dinner", label: "Dinner" },
];

export function AddMealDialog({ date, defaultType = "breakfast" }: AddMealDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InsertMeal>>({
    mealType: defaultType,
    description: "",
    quantity: "",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const { mutate, isPending } = useAddMeal(date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.mealType) return;

    mutate({
      mealType: formData.mealType,
      description: formData.description,
      quantity: formData.quantity || "",
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
      fiber: 0,
    }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({ ...formData, description: "", quantity: "", calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary/80 hover:bg-primary/5">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Meal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1 mb-1.5 block">
                Meal Type
              </label>
              <Select 
                value={formData.mealType} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, mealType: val }))}
              >
                <SelectTrigger className="w-full h-12 rounded-xl border-2 border-border focus:ring-primary/10 focus:border-primary">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <Input
                label="Description"
                placeholder="e.g. Oatmeal with berries"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                autoFocus
              />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <Input
                label="Quantity"
                placeholder="e.g. 1 bowl"
                value={formData.quantity}
                onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            
            <div className="col-span-2 sm:col-span-1">
              <Input
                type="number"
                label="Calories"
                placeholder="0"
                value={formData.calories || ''}
                onChange={e => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) }))}
              />
            </div>
            
            <div className="col-span-2 grid grid-cols-3 gap-4">
               <Input
                type="number"
                label="Protein (g)"
                placeholder="0"
                value={formData.protein || ''}
                onChange={e => setFormData(prev => ({ ...prev, protein: parseInt(e.target.value) }))}
              />
               <Input
                type="number"
                label="Carbs (g)"
                placeholder="0"
                value={formData.carbs || ''}
                onChange={e => setFormData(prev => ({ ...prev, carbs: parseInt(e.target.value) }))}
              />
               <Input
                type="number"
                label="Fat (g)"
                placeholder="0"
                value={formData.fat || ''}
                onChange={e => setFormData(prev => ({ ...prev, fat: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button type="submit" className="w-full" isLoading={isPending}>
              Add Entry
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
