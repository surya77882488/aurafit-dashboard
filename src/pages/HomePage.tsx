import { useAura } from '@/contexts/AuraContext';
import { AuraRing } from '@/components/AuraRing';
import { Footprints, Flame, Target, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

function ReadinessScore({ steps }: { steps: number }) {
  const level = steps > 8000 ? 'High' : steps > 4000 ? 'Med' : 'Low';
  const color = steps > 8000 ? 'text-primary' : steps > 4000 ? 'text-accent' : 'text-secondary';
  return (
    <div className="glass rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Readiness Score</p>
        <p className={`text-2xl font-display font-bold ${color}`}>{level}</p>
      </div>
      <div className={`w-3 h-3 rounded-full ${color === 'text-primary' ? 'bg-primary' : color === 'text-accent' ? 'bg-accent' : 'bg-secondary'} animate-pulse-glow`} />
    </div>
  );
}

export function HomePage() {
  const { steps, dailyTarget, caloriesIn, remainingCalories, sensorAvailable, permissionGranted, requestPermission, addManualSteps } = useAura();
  const [manualInput, setManualInput] = useState('');

  const progress = dailyTarget > 0 ? caloriesIn / dailyTarget : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center gap-6 px-4 pt-6 pb-24"
    >
      <h1 className="text-2xl font-display font-bold text-glow text-primary">AuraFit</h1>

      <ReadinessScore steps={steps} />

      <AuraRing
        progress={progress}
        label="Calories"
        value={remainingCalories.toLocaleString()}
        sublabel={`${caloriesIn} / ${dailyTarget} kcal`}
      />

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        <div className="glass rounded-xl p-3 text-center">
          <Footprints size={18} className="mx-auto text-primary mb-1" />
          <p className="text-lg font-display font-semibold text-foreground">{steps.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Steps</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Flame size={18} className="mx-auto text-secondary mb-1" />
          <p className="text-lg font-display font-semibold text-foreground">{caloriesIn}</p>
          <p className="text-[10px] text-muted-foreground">Eaten</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <Target size={18} className="mx-auto text-accent mb-1" />
          <p className="text-lg font-display font-semibold text-foreground">{dailyTarget}</p>
          <p className="text-[10px] text-muted-foreground">Target</p>
        </div>
      </div>

      {/* Step Input */}
      <div className="glass rounded-xl p-4 w-full max-w-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          {sensorAvailable && permissionGranted ? 'Step Sensor Active' : 'Manual Step Entry'}
        </p>
        {!permissionGranted && sensorAvailable && (
          <button onClick={requestPermission} className="w-full bg-primary text-primary-foreground font-display font-semibold py-2 rounded-lg mb-3 glow-primary">
            Enable Step Sensor
          </button>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => addManualSteps(-500)}
            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            placeholder="Add steps"
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && manualInput) {
                addManualSteps(parseInt(manualInput));
                setManualInput('');
              }
            }}
            className="flex-1 bg-muted rounded-lg px-3 py-2 text-center font-display text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => addManualSteps(500)}
            className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
