import { useAura } from '@/contexts/AuraContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, X, CheckCircle2, Circle, Loader2, Dumbbell } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WorkoutsPage() {
  const { userId } = useAura();
  const queryClient = useQueryClient();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newExercise, setNewExercise] = useState({ name: '', sets: '3', reps: '10' });

  const { data: workouts, isLoading } = useQuery({
    queryKey: ['workouts', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.from('workouts').select('*, exercises(*)').eq('user_id', userId).order('day_of_week');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

  const addWorkout = useMutation({
    mutationFn: async (day: number) => {
      if (!userId || !newWorkoutName.trim()) return;
      const { error } = await supabase.from('workouts').insert({ user_id: userId, name: newWorkoutName.trim(), day_of_week: day });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workouts'] }); setNewWorkoutName(''); },
  });

  const addExerciseMut = useMutation({
    mutationFn: async (workoutId: string) => {
      if (!userId || !newExercise.name.trim()) return;
      const { error } = await supabase.from('exercises').insert({
        user_id: userId, workout_id: workoutId, name: newExercise.name.trim(),
        sets: parseInt(newExercise.sets) || 3, reps: parseInt(newExercise.reps) || 10,
      });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['workouts'] }); setNewExercise({ name: '', sets: '3', reps: '10' }); },
  });

  const toggleSet = useMutation({
    mutationFn: async ({ id, completed, total }: { id: string; completed: number; total: number }) => {
      const next = completed < total ? completed + 1 : 0;
      const { error } = await supabase.from('exercises').update({ completed_sets: next }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  });

  const todayIndex = new Date().getDay();
  const dayWorkouts = workouts?.filter(w => w.day_of_week === selectedDay) ?? [];
  const hasAnyWorkouts = (workouts?.length ?? 0) > 0;

  if (!userId) return <div className="flex items-center justify-center h-64 text-muted-foreground">Sign in to track workouts</div>;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="px-4 pt-6 pb-24"
    >
      <h2 className="text-xl font-display font-bold text-foreground mb-4">Weekly Split</h2>

      {/* Timeline */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {DAYS.map((day, i) => {
          const hasWorkout = workouts?.some(w => w.day_of_week === i);
          const isToday = i === todayIndex;
          const isSelected = selectedDay === i;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : i)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[52px] ${
                isSelected ? 'bg-primary text-primary-foreground glow-primary' :
                isToday ? 'bg-muted ring-1 ring-primary/50' : 'bg-muted/50'
              }`}
            >
              <span className="text-[10px] font-body uppercase">{day}</span>
              <div className={`w-2 h-2 rounded-full ${hasWorkout ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {!isLoading && !hasAnyWorkouts && selectedDay === null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center flex flex-col items-center gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Dumbbell size={36} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-display font-bold text-foreground mb-1">Your strength journey starts here</p>
            <p className="text-sm text-muted-foreground">Tap a day above to add your first exercise!</p>
          </div>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Workout overlay */}
      <AnimatePresence mode="wait">
        {selectedDay !== null && (
          <motion.div key={selectedDay} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-foreground">{DAYS[selectedDay]} Workout</h3>
                <button onClick={() => setSelectedDay(null)} className="text-muted-foreground"><X size={18} /></button>
              </div>

              {isLoading ? (
                <Loader2 className="animate-spin text-primary mx-auto" />
              ) : (
                <>
                  {dayWorkouts.length === 0 && (
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">No workout for {DAYS[selectedDay]} yet</p>
                      <p className="text-xs text-muted-foreground">Add one below to get started</p>
                    </div>
                  )}
                  {dayWorkouts.map(workout => (
                    <div key={workout.id} className="mb-4">
                      <p className="text-sm font-display font-semibold text-primary mb-2">{workout.name}</p>
                      {(workout.exercises as any[])?.map((ex: any) => (
                        <button
                          key={ex.id}
                          onClick={() => toggleSet.mutate({ id: ex.id, completed: ex.completed_sets, total: ex.sets })}
                          className="flex items-center gap-2 w-full py-1.5 text-left"
                        >
                          {ex.completed_sets >= ex.sets ? <CheckCircle2 size={16} className="text-primary" /> : <Circle size={16} className="text-muted-foreground" />}
                          <span className={`text-sm flex-1 ${ex.completed_sets >= ex.sets ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{ex.name}</span>
                          <span className="text-xs text-muted-foreground">{ex.completed_sets}/{ex.sets} × {ex.reps}</span>
                        </button>
                      ))}
                      <div className="flex gap-2 mt-2">
                        <input placeholder="Exercise" value={newExercise.name} onChange={e => setNewExercise(p => ({ ...p, name: e.target.value }))} className="flex-1 bg-muted rounded-lg px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                        <input placeholder="Sets" value={newExercise.sets} onChange={e => setNewExercise(p => ({ ...p, sets: e.target.value }))} className="w-12 bg-muted rounded-lg px-2 py-1.5 text-sm text-center text-foreground outline-none" />
                        <input placeholder="Reps" value={newExercise.reps} onChange={e => setNewExercise(p => ({ ...p, reps: e.target.value }))} className="w-12 bg-muted rounded-lg px-2 py-1.5 text-sm text-center text-foreground outline-none" />
                        <button onClick={() => addExerciseMut.mutate(workout.id)} className="bg-primary text-primary-foreground rounded-lg px-2"><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <input placeholder="New workout name" value={newWorkoutName} onChange={e => setNewWorkoutName(e.target.value)} className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                    <button onClick={() => addWorkout.mutate(selectedDay)} className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm font-display font-semibold glow-primary">
                      <Plus size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
