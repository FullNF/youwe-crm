import { LEAD_STAGE_PIPELINE } from '../../constants/options';

/**
 * Signature visual element of the CRM: every lead's progress is shown as a
 * row of connected dots (mirrors the literal Created -> Called -> ... -> Won
 * timeline from the spec). Used in compact form in table rows, and in full
 * form with labels on the Lead Details page.
 */
export default function StagePipeline({ stage, compact = false }) {
  if (stage === 'Lost') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-danger shadow-glow-danger" />
        <span className="text-xs text-danger font-medium">Lost</span>
      </div>
    );
  }

  if (stage === 'Hold') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-amber shadow-glow-amber" />
        <span className="text-xs text-amber font-medium">On Hold</span>
      </div>
    );
  }

  const currentIndex = LEAD_STAGE_PIPELINE.indexOf(stage);
  const isWon = stage === 'Won';

  return (
    <div className="flex items-center">
      {LEAD_STAGE_PIPELINE.map((step, i) => {
        const reached = currentIndex >= 0 && i <= currentIndex;
        const isCurrent = i === currentIndex;
        const stepIsWon = step === 'Won' && reached;
        return (
          <div key={step} className="flex items-center">
            <div
              title={step}
              className={`rounded-full transition-all duration-300 ${compact ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'} ${
                stepIsWon
                  ? 'bg-success shadow-glow-success'
                  : reached
                  ? isCurrent
                    ? 'bg-accent shadow-glow-accent animate-glowPulse'
                    : 'bg-accent/70'
                  : 'bg-surface-border'
              }`}
            />
            {i < LEAD_STAGE_PIPELINE.length - 1 && (
              <div className={`${compact ? 'w-2.5 h-px' : 'w-4 h-px'} ${reached && i < currentIndex ? 'bg-accent/70' : 'bg-surface-border'}`} />
            )}
          </div>
        );
      })}
      {!compact && (
        <span className={`ml-2 text-xs font-medium ${isWon ? 'text-success' : 'text-ink-muted'}`}>
          {isWon ? '🏆 ' : ''}{stage || 'New'}
        </span>
      )}
    </div>
  );
}
