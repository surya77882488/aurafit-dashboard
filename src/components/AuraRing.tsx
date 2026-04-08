import { motion } from 'framer-motion';

interface AuraRingProps {
  progress: number; // 0-1
  size?: number;
  label: string;
  value: string;
  sublabel?: string;
}

export function AuraRing({ progress, size = 220, label, value, sublabel }: AuraRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        {/* Glow filter */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clampedProgress) }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          filter="url(#glow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-body uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-4xl font-display font-bold text-primary text-glow">{value}</span>
        {sublabel && <span className="text-xs text-muted-foreground mt-1">{sublabel}</span>}
      </div>
    </div>
  );
}
