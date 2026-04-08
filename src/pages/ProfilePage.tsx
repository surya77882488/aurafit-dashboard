import { useAura } from '@/contexts/AuraContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, LogIn, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const { userId, baseGoal, setBaseGoal } = useAura();
  const queryClient = useQueryClient();
  const [goal, setGoal] = useState(baseGoal.toString());
  const [weight, setWeight] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
      return data;
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (profile) {
      setGoal(profile.goal.toString());
      setWeight(profile.weight?.toString() ?? '');
    }
  }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const g = parseInt(goal) || 2000;
      const w = parseFloat(weight) || null;
      await supabase.from('profiles').upsert(
        { user_id: userId, goal: g, weight: w },
        { onConflict: 'user_id' }
      );
      setBaseGoal(g);
    },
    onSuccess: () => { toast.success('Profile saved!'); queryClient.invalidateQueries({ queryKey: ['profile'] }); },
    onError: () => toast.error('Failed to save'),
  });

  const handleAuth = async () => {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) toast.error(error.message);
      else toast.success('Check your email to confirm!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
  };

  if (!userId) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-6 pb-24 flex flex-col items-center">
        <h2 className="text-xl font-display font-bold text-foreground mb-6">Welcome to AuraFit</h2>
        <div className="glass rounded-xl p-6 w-full max-w-sm space-y-4">
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          <button onClick={handleAuth} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-display font-semibold flex items-center justify-center gap-2 glow-primary">
            <LogIn size={16} /> {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <button onClick={() => setIsSignUp(!isSignUp)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 pt-6 pb-24">
      <h2 className="text-xl font-display font-bold text-foreground mb-4">Profile</h2>
      <div className="glass rounded-xl p-6 space-y-5 max-w-sm mx-auto">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Base Calorie Goal</label>
          <input type="number" value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2.5 text-foreground font-display outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Target Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-muted rounded-lg px-3 py-2.5 text-foreground font-display outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <button
          onClick={() => saveProfile.mutate()}
          disabled={saveProfile.isPending}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-display font-semibold flex items-center justify-center gap-2 glow-primary disabled:opacity-50"
        >
          {saveProfile.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
        <button onClick={handleSignOut} className="w-full bg-muted text-muted-foreground py-2.5 rounded-lg font-display flex items-center justify-center gap-2 hover:text-foreground transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </motion.div>
  );
}
