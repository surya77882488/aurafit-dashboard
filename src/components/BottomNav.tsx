import { Home, Dumbbell, Apple, User } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'workouts', icon: Dumbbell, label: 'Workouts' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition' },
  { id: 'profile', icon: User, label: 'Profile' },
] as const;

export type TabId = typeof tabs[number]['id'];

interface BottomNavProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full glow-primary"
                />
              )}
              <Icon
                size={20}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className={`text-[10px] font-body ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
