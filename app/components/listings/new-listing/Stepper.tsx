'use client';

import { Check } from 'lucide-react';
import { STEP_ORDER, STEP_LABELS, type WizardStep } from './types';

interface StepperProps {
  current:        WizardStep;
  /** Furthest step the vendor has already validated their way past. */
  furthestReached: WizardStep;
  onJump:          (step: WizardStep) => void;
}

export function Stepper({ current, furthestReached, onJump }: StepperProps) {
  const currentIdx  = STEP_ORDER.indexOf(current);
  const furthestIdx = STEP_ORDER.indexOf(furthestReached);

  return (
    <div className="flex items-center mb-8" role="tablist" aria-label="Listing creation steps">
      {STEP_ORDER.map((step, i) => {
        const done      = i < currentIdx;
        const active    = step === current;
        const reachable = i <= furthestIdx; // can only jump to steps already validated
        const label     = STEP_LABELS[step];

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              role="tab"
              aria-selected={active}
              aria-current={active ? 'step' : undefined}
              disabled={!reachable}
              onClick={() => reachable && onJump(step)}
              className={`flex flex-col items-center gap-1 group
                ${reachable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center
                  text-xs font-black transition-all
                  ${done
                    ? 'bg-[#2D3B45] text-white group-hover:bg-[#3a4d5a]'
                    : active
                      ? 'bg-[#F5C842] text-[#2D3B45] ring-4 ring-[#F5C842]/25'
                      : reachable
                        ? 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-300'}`}
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide transition-colors
                  ${active ? 'text-[#2D3B45]' : reachable ? 'text-gray-500 group-hover:text-gray-700' : 'text-gray-300'}`}
              >
                {label}
              </span>
            </button>

            {i < STEP_ORDER.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 mb-4 transition-colors
                  ${i < currentIdx ? 'bg-[#2D3B45]' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}