import { motion } from 'framer-motion';

interface AuraRingProps {
  progress: number; // 0-1
  size?: number;
  label: string;
  value: string;
  sublabel?: string;
  glowPulse?: boolean;
  lowReadiness?: boolean;
}

export function AuraRing({ progress, size = 220, label, value, sublabel, glowPulse, lowReadiness }: AuraRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  const strokeColor = lowReadiness ? 'hsl(var(--secondary))' : 'hsl(var(--primary))';
  const glowColor = lowReadiness ? 'hsl(330 90% 55% / 0.6)' : 'hsl(183 100% 50% / 0.6)';

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={
        glowPulse
          ? { filter: [`drop-shadow(0 0 8px ${glowColor})`, `drop-shadow(0 0 24px ${glowColor})`, `drop-shadow(0 0 8px ${glowColor})`] }
          : lowReadiness
          ? { filter: [`drop-shadow(0 0 4px ${glowColor})`, `drop-shadow(0 0 14px ${glowColor})`, `drop-shadow(0 0 4px ${glowColor})`] }
          : { filter: 'drop-shadow(0 0 0px transparent)' }
      }
      transition={
        glowPulse
          ? { duration: 1, ease: 'easeInOut' }
          : lowReadiness
          ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.3 }
      }
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <defs>
          <filter id="ring-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clampedProgress) }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          filter="url(#ring-glow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-body uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className={`text-4xl font-display font-bold ${lowReadiness ? 'text-secondary' : 'text-primary text-glow'}`}>{value}</span>
        {sublabel && <span className="text-xs text-muted-foreground mt-1">{sublabel}</span>}
      </div>
    </motion.div>
  );
}
