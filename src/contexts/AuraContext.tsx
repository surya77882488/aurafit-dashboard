import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { useStepCounter } from '@/hooks/useStepCounter';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AuraContextType {
  steps: number;
  baseGoal: number;
  dailyTarget: number;
  caloriesIn: number;
  remainingCalories: number;
  sensorAvailable: boolean;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
  addManualSteps: (count: number) => void;
  setManualSteps: (count: number) => void;
  setBaseGoal: (goal: number) => void;
  addCalories: (amount: number) => void;
  userId: string | null;
  isLoading: boolean;
  stepsJustAdded: boolean;
}

const AuraContext = createContext<AuraContextType | null>(null);

export function AuraProvider({ children }: { children: React.ReactNode }) {
  const { steps, sensorAvailable, permissionGranted, requestPermission, addManualSteps, setManualSteps } = useStepCounter();
  const [userId, setUserId] = useState<string | null>(null);
  const [baseGoal, setBaseGoal] = useState(2000);
  const [caloriesIn, setCaloriesIn] = useState(0);
  const [stepsJustAdded, setStepsJustAdded] = useState(false);
  const queryClient = useQueryClient();
  const initialLoadDone = useRef(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
      if (data) setBaseGoal(data.goal);
      return data;
    },
    enabled: !!userId,
  });

  const { isLoading: metricsLoading } = useQuery({
    queryKey: ['daily_metrics', userId, today],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from('daily_metrics').select('*').eq('user_id', userId).eq('date', today).maybeSingle();
      if (data) {
        setManualSteps(data.steps);
        setCaloriesIn(data.calories_in);
      }
      initialLoadDone.current = true;
      return data;
    },
    enabled: !!userId,
  });

  const syncMetrics = useMutation({
    mutationFn: async ({ s, c }: { s: number; c: number }) => {
      if (!userId) return;
      await supabase.from('daily_metrics').upsert(
        { user_id: userId, date: today, steps: s, calories_in: c },
        { onConflict: 'user_id,date' }
      );
    },
  });

  useEffect(() => {
    if (!userId || !initialLoadDone.current) return;
    const timer = setTimeout(() => {
      syncMetrics.mutate({ s: steps, c: caloriesIn });
    }, 800);
    return () => clearTimeout(timer);
  }, [steps, caloriesIn, userId]);

  // Flash stepsJustAdded for glow effect
  const wrappedAddManualSteps = (count: number) => {
    addManualSteps(count);
    setStepsJustAdded(true);
    setTimeout(() => setStepsJustAdded(false), 1200);
  };

  const dailyTarget = useMemo(() => baseGoal + Math.round(steps * 0.04), [baseGoal, steps]);
  const remainingCalories = useMemo(() => Math.max(0, dailyTarget - caloriesIn), [dailyTarget, caloriesIn]);

  const addCalories = (amount: number) => setCaloriesIn(prev => prev + amount);

  return (
    <AuraContext.Provider value={{
      steps, baseGoal, dailyTarget, caloriesIn, remainingCalories,
      sensorAvailable, permissionGranted, requestPermission,
      addManualSteps: wrappedAddManualSteps, setManualSteps, setBaseGoal, addCalories,
      userId, isLoading: profileLoading || metricsLoading, stepsJustAdded,
    }}>
      {children}
    </AuraContext.Provider>
  );
}

export function useAura() {
  const ctx = useContext(AuraContext);
  if (!ctx) throw new Error('useAura must be used within AuraProvider');
  return ctx;
}
