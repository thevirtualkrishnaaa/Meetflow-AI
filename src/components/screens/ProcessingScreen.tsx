import React from 'react';
import { useMeetingFlow } from '../../context/MeetingFlowContext';
import {
  Check,
  CheckCircle2,
  Cpu,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const ProcessingScreen: React.FC = () => {
  const { processingStep, processingProgress, pendingDraft, cancelDraft } = useMeetingFlow();

  const steps = [
    { id: 1, label: 'Transcribing conversation' },
    { id: 2, label: 'Identifying key topics' },
    { id: 3, label: 'Extracting decisions' },
    { id: 4, label: 'Creating action items & owners' },
    { id: 5, label: 'Preparing executive summary' },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl p-8 space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-2xs">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
            Processing your meeting...
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            MeetingFlow AI is turning speech into actionable accountability for{' '}
            <strong className="text-neutral-800 font-medium">"{pendingDraft?.title || 'Team Meeting'}"</strong>.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>Pipeline progress</span>
            <span>{processingProgress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-3 text-xs">
          {steps.map((step) => {
            const isCompleted = processingStep > step.id;
            const isCurrent = processingStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'text-neutral-900 font-semibold'
                    : isCompleted
                    ? 'text-neutral-600'
                    : 'text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isCompleted ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : isCurrent ? (
                    <span className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
                  )}
                  <span>{step.label}</span>
                </div>

                <span className="text-[11px] font-mono">
                  {isCompleted ? 'Done' : isCurrent ? 'Active' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cancel Button */}
        <div className="text-center pt-2">
          <button
            onClick={cancelDraft}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            Cancel processing
          </button>
        </div>
      </div>
    </div>
  );
};
