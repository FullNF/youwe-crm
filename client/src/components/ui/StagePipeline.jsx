import { LEAD_STAGE_PIPELINE } from '../../constants/options';

// Each stage gets its own color so you can tell at a glance where in the
// funnel a lead sits - not just "how far along" but also "what kind of step".
const STAGE_DOT_COLOR = {
  'New':            'bg-ink-faint',
  'Calling':        'bg-info shadow-[0_0_8px_rgba(59,130,246,0.6)]',
  'Contacted':      'bg-accent shadow-glow-accent animate-glowPulse',
  'Follow-up':      'bg-amber shadow-glow-amber animate-glowPulse',
  'Ready to Visit': 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]',
  'Visit Done':     'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]',
  'Negotiation':    'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.55)]',
  'Won':            'bg-success shadow-glow-success',
};

const STAGE_LINE_COLOR = {
  'New':            'bg-ink-faint/30',
  'Calling':        'bg-info/50',
  'Contacted':      'bg-accent/60',
  'Follow-up':      'bg-amber/60',
  'Ready to Visit': 'bg-purple-400/60',
  'Visit Done':     'bg-indigo-400/60',
  'Negotiation':    'bg-orange-400/60',
  'Won':            'bg-success/70',
};

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
  const currentStage = stage || 'New';
  const isWon = stage === 'Won';

  const activeDotColor = STAGE_DOT_COLOR[currentStage] || 'bg-accent shadow-glow-accent';
  const activeLineColor = STAGE_LINE_COLOR[currentStage] || 'bg-accent/60';

  if (compact) {
    // Compact (table row): dots + the current stage label as small text above
    return (
      <div className="flex flex-col gap-0.5 items-center">
        <span className={`text-[10px] font-medium leading-none ${isWon ? 'text-success' : 'text-ink-muted'}`}>
          {isWon ? '🏆 ' : ''}{currentStage}
        </span>
        <div className="flex items-center">
          {LEAD_STAGE_PIPELINE.map((step, i) => {
            const reached = currentIndex >= 0 && i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={step} className="flex items-center">
                <div
                  title={step}
                  className={`rounded-full transition-all duration-300 hover:scale-150 w-1.5 h-1.5 ${
                    isCurrent
                      ? activeDotColor
                      : reached
                      ? 'bg-accent/50'
                      : 'bg-surface-border'
                  }`}
                />
                {i < LEAD_STAGE_PIPELINE.length - 1 && (
                  <div className={`w-2.5 h-px transition-colors duration-300 ${reached && i < currentIndex ? activeLineColor : 'bg-surface-border'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full (detail page): larger dots + labels below each dot
  return (
    <div className="flex items-start">
      {LEAD_STAGE_PIPELINE.map((step, i) => {
        const reached = currentIndex >= 0 && i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} className="flex items-start">
            <div className="flex flex-col items-center gap-1">
              <div
                title={step}
                className={`rounded-full transition-all duration-300 hover:scale-125 w-2.5 h-2.5 ${
                  isCurrent
                    ? activeDotColor
                    : reached
                    ? 'bg-accent/60'
                    : 'bg-surface-border'
                }`}
              />
            </div>
            {i < LEAD_STAGE_PIPELINE.length - 1 && (
              <div className={`w-5 h-px mt-[5px] transition-colors duration-300 ${reached && i < currentIndex ? activeLineColor : 'bg-surface-border'}`} />
            )}
          </div>
        );
      })}
      <span className={`ml-2 text-xs font-medium ${isWon ? 'text-success' : 'text-ink-muted'}`}>
        {isWon ? '🏆 ' : ''}{currentStage}
      </span>
    </div>
  );
}
