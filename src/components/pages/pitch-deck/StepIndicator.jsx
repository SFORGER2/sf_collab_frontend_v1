
import React from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const TOTAL_STEPS = 5;

const STEP_LABELS = [
  'Template',
  'Company',
  'Problem & Solution',
  'Product',
  'Team & Funding',
];


export default function StepIndicator({
  currentStep,
  onNext,
  onPrev,
  onGenerate,
  canProceed = true,
  isGenerating = false,
}) {
  const isFirst = currentStep === 1;
  const isLast = currentStep === TOTAL_STEPS;
  const progress = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="w-full flex flex-col gap-6">

      {/* Step dots + progress bar */}
      <div className="relative flex items-center justify-between">

        {/* Background track */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px]"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          aria-hidden="true"
        />

        {/* Filled progress */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, oklch(77.1% 0.095 203), oklch(55% 0.095 288))',
          }}
          aria-hidden="true"
        />

        {/* Step dots */}
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <div
              key={step}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              {/* Dot */}
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                  'transition-all duration-300 ease-out',
                  isCompleted
                    ? 'text-black'
                    : isActive
                      ? 'text-black ring-2 ring-offset-2 ring-offset-black'
                      : 'text-white/40 border border-white/20',
                ].join(' ')}
                style={{
                  background: isCompleted || isActive
                    ? 'linear-gradient(135deg, oklch(77.1% 0.095 203), oklch(55% 0.095 288))'
                    : 'rgba(255,255,255,0.06)',
                  ringColor: isActive ? 'oklch(77.1% 0.095 203)' : undefined,
                  boxShadow: isActive
                    ? '0 0 16px oklch(77.1% 0.095 203 / 0.5)'
                    : isCompleted
                      ? '0 0 8px oklch(77.1% 0.095 203 / 0.25)'
                      : 'none',
                }}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  /* Checkmark */
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 7l4 4 6-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>

              {/* Label */}
              <span
                className={[
                  'hidden sm:block text-[10px] font-medium tracking-wide whitespace-nowrap',
                  'transition-colors duration-200',
                  isActive ? 'text-white' : isCompleted ? 'text-white/60' : 'text-white/30',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* "Step X of Y" label */}
      <p
        className="text-center text-sm font-medium"
        style={{ color: 'oklch(77.1% 0.095 203)' }}
        aria-live="polite"
      >
        Step {currentStep} of {TOTAL_STEPS}
        <span className="text-white/40 font-normal"> — {STEP_LABELS[currentStep - 1]}</span>
      </p>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3">

        {/* Previous */}
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst || isGenerating}
          className={[
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium',
            'border transition-all duration-200',
            isFirst || isGenerating
              ? 'opacity-30 cursor-not-allowed border-white/10 text-white/40'
              : 'border-white/20 text-white/80 hover:border-white/40 hover:text-white hover:bg-white/5',
          ].join(' ')}
          aria-label="Go to previous step"
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Previous
        </button>

        {/* Next or Generate */}
        {isLast ? (
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canProceed || isGenerating}
            className={[
              'flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold',
              'transition-all duration-200 relative overflow-hidden',
              !canProceed || isGenerating
                ? 'opacity-40 cursor-not-allowed text-black/60'
                : 'text-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]',
            ].join(' ')}
            style={{
              background:
                !canProceed || isGenerating
                  ? 'rgba(255,255,255,0.15)'
                  : 'linear-gradient(135deg, oklch(77.1% 0.095 203), oklch(55% 0.095 288))',
              boxShadow:
                canProceed && !isGenerating
                  ? '0 0 24px oklch(77.1% 0.095 203 / 0.4)'
                  : 'none',
            }}
            aria-label="Generate pitch deck"
            aria-busy={isGenerating}
          >
            <Sparkles size={16} aria-hidden="true" />
            {isGenerating ? 'Generating…' : 'Generate Deck'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isGenerating}
            className={[
              'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold',
              'transition-all duration-200',
              !canProceed || isGenerating
                ? 'opacity-40 cursor-not-allowed text-black/60'
                : 'text-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]',
            ].join(' ')}
            style={{
              background:
                !canProceed || isGenerating
                  ? 'rgba(255,255,255,0.15)'
                  : 'linear-gradient(135deg, oklch(77.1% 0.095 203), oklch(55% 0.095 288))',
            }}
            aria-label="Go to next step"
          >
            Next
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Reduced-motion: */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .transition-all, .transition-colors, .transition-\\[width\\] {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
