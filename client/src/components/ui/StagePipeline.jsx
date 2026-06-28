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
        <span className="w-2 h-2 rounded-full bg-danger" />
        <span className="text-xs text-danger font-medium">Lost</span>
      </div>
    );
  }

  const currentIndex = LEAD_STAGE_PIPELINE.indexOf(stage);

  return (
    <div className="flex items-center">
      {LEAD_STAGE_PIPELINE.map((step, i) => {
        const reached = currentIndex >= 0 && i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} className="flex items-center">
            <div
              title={step}
              className={`rounded-full transition-colors ${compact ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'} ${
                reached ? (isCurrent ? 'bg-accent ring-2 ring-accent/30' : 'bg-accent/70') : 'bg-surface-border'
              }`}
            />
            {i < LEAD_STAGE_PIPELINE.length - 1 && (
              <div className={`${compact ? 'w-2.5 h-px' : 'w-4 h-px'} ${reached && i < currentIndex ? 'bg-accent/70' : 'bg-surface-border'}`} />
            )}
          </div>
        );
      })}
      {!compact && <span className="ml-2 text-xs text-ink-muted">{stage || 'New'}</span>}
    </div>
  );
}
