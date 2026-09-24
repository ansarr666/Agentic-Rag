import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { AgentStep } from '../../types';

export interface AgentActivityTraceProps {
  steps?: AgentStep[];
}

export const AgentActivityTrace: React.FC<AgentActivityTraceProps> = ({ steps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const isAllDone = completedCount === steps.length;

  return (
    <div className="mt-3 border border-border/70 rounded-lg overflow-hidden bg-slate-950/40 text-xs transition-all">
      {/* Collapsible toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2 flex items-center justify-between text-slate-400 hover:text-slate-200 hover:bg-surface-elevated/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isAllDone ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
          )}
          <span className="font-medium text-slate-300">
            Agent Execution Activity
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            ({completedCount}/{steps.length} steps)
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>{isExpanded ? 'Hide' : 'Details'}</span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Expanded list */}
      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-border/50 space-y-2 animate-in fade-in duration-150">
          {steps.map((step, idx) => (
            <div key={step.id || idx} className="flex items-start gap-2 text-slate-300">
              <span className="text-emerald-400 font-bold shrink-0 mt-0.5 text-[11px]">✓</span>
              <div className="flex-1">
                <span className="text-slate-300 text-[11px] leading-relaxed">
                  {step.label}
                </span>
                {step.details && (
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {step.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
