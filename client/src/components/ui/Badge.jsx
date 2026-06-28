const VARIANT_CLASSES = {
  accent: 'bg-accent/15 text-accent border border-accent/30',
  amber: 'bg-amber/15 text-amber border border-amber/30',
  success: 'bg-success/15 text-success border border-success/30',
  danger: 'bg-danger/15 text-danger border border-danger/30',
  info: 'bg-info/15 text-info border border-info/30',
  neutral: 'bg-surface-hover text-ink-muted border border-surface-border',
};

const PULSE_CLASS = {
  danger: 'animate-dangerPulse',
  amber: 'animate-glowPulse',
  accent: 'animate-glowPulse',
  success: '',
  info: '',
  neutral: '',
};

export default function Badge({ variant = 'neutral', children, className = '', pulse = false }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral} ${pulse ? PULSE_CLASS[variant] || '' : ''} ${className}`}>
      {children}
    </span>
  );
}
