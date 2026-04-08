import { useAura } from '@/contexts/AuraContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, UtensilsCrossed } from 'lucide-react';

interface FoodEntry {
  id: number;
  name: string;
  calories: number;
}

export function NutritionPage() {
  const { caloriesIn, dailyTarget, remainingCalories, addCalories, userId } = useAura();
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [quickCal, setQuickCal] = useState('');
  const [foodName, setFoodName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    const cal = parseInt(quickCal);
    if (!cal || cal <= 0) return;
    const entry: FoodEntry = { id: Date.now(), name: foodName.trim() || 'Quick Add', calories: cal };
    setEntries(prev => [entry, ...prev]);
    addCalories(cal);
    setQuickCal('');
    setFoodName('');
    setShowForm(false);
  };

  if (!userId) return <div className="flex items-center justify-center h-64 text-muted-foreground">Sign in to track nutrition</div>;

  const progress = dailyTarget > 0 ? (caloriesIn / dailyTarget) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="px-4 pt-6 pb-24">
      <h2 className="text-xl font-display font-bold text-foreground mb-4">Nutrition</h2>

      {/* Summary bar */}
      <div className="glass rounded-xl p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Consumed</span>
          <span className="text-foreground font-display font-semibold">{caloriesIn} / {dailyTarget} kcal</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ boxShadow: 'var(--glow-primary)' }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          <Flame size={12} className="inline text-secondary mr-1" />
          {remainingCalories} kcal remaining
        </p>
      </div>

      {/* Food list */}
      <div className="space-y-2 mb-4">
        {entries.length === 0 && (
          <div className="glass rounded-xl p-6 text-center">
            <UtensilsCrossed size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No food logged today</p>
          </div>
        )}
        {entries.map(entry => (
          <div key={entry.id} className="glass rounded-xl p-3 flex justify-between items-center">
            <span className="text-sm text-foreground">{entry.name}</span>
            <span className="text-sm font-display font-semibold text-primary">{entry.calories} kcal</span>
          </div>
        ))}
      </div>

      {/* Quick add */}
      {showForm ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-4 space-y-3">
          <input
            placeholder="Food name (optional)"
            value={foodName}
            onChange={e => setFoodName(e.target.value)}
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <input
            type="number"
            placeholder="Calories"
            value={quickCal}
            onChange={e => setQuickCal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 bg-muted text-muted-foreground py-2 rounded-lg text-sm font-display">Cancel</button>
            <button onClick={handleAdd} className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-display font-semibold glow-primary">Add</button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-display font-semibold flex items-center justify-center gap-2 glow-primary"
        >
          <Plus size={18} /> Quick Add Calories
        </button>
      )}
    </motion.div>
  );
}
