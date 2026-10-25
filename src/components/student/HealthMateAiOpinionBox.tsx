/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import { StudentDailyCheckIn } from '../../types/studentWellbeing';
import {
  evaluateStudentSafety,
  generateFallbackCoachResponse,
} from '../../utils/studentWellbeingLogic';

interface HealthMateAiOpinionBoxProps {
  sectionTitle: string;
  promptPlaceholder: string;
  defaultPrompt?: string;
  highlighted?: boolean;
  highlightReason?: string;
  contextData?: Record<string, unknown>;
  recentCheckIn?: StudentDailyCheckIn | null;
}

interface OpinionResult {
  source: 'healthmate_ai' | 'rules_engine';
  fallbackNotice?: string;
  text: string;
  followUpQuestion?: string;
  actionSteps: string[];
  safetyLevel: 'emergency' | 'ongoing_concern' | 'supportive';
}

export const HealthMateAiOpinionBox: React.FC<HealthMateAiOpinionBoxProps> = ({
  sectionTitle,
  promptPlaceholder,
  defaultPrompt = '',
  highlighted = false,
  highlightReason,
  contextData,
  recentCheckIn,
}) => {
  const [query, setQuery] = useState<string>(defaultPrompt);
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [result, setResult] = useState<OpinionResult | null>(null);
  const [chosenStep, setChosenStep] = useState<string>('');

  const handleAskHealthMate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setValidationError('Please describe your situation, ingredients, or question first.');
      return;
    }
    setValidationError('');
    setChosenStep('');

    const safety = evaluateStudentSafety(
      trimmed,
      recentCheckIn?.botheringOptions || [],
      recentCheckIn?.stressLevel || 5,
      recentCheckIn?.tirednessLevel || 5
    );

    if (safety.level === 'emergency') {
      setResult({
        source: 'rules_engine',
        text: `${safety.headline}: ${safety.message}`,
        actionSteps: safety.actionItems,
        safetyLevel: 'emergency',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/student-wellbeing-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'healthmate_opinion',
          studentQuery: trimmed,
          context: {
            section: sectionTitle,
            ...contextData,
          },
        }),
      });

      const data = await response.json();
      if (data && data.available && data.source === 'healthmate_ai') {
        setResult({
          source: 'healthmate_ai',
          text: data.text,
          followUpQuestion: data.followUpQuestion,
          actionSteps: Array.isArray(data.actionSteps) ? data.actionSteps : [],
          safetyLevel: safety.level,
        });
      } else {
        const fallback = generateFallbackCoachResponse(trimmed, recentCheckIn);
        setResult({
          source: 'rules_engine',
          fallbackNotice:
            data?.message ||
            'Live HealthMate AI API is currently unavailable—showing safe HealthMate rules-based guidance instead.',
          text: fallback.text,
          followUpQuestion: fallback.followUpQuestion,
          actionSteps: fallback.actionSteps || [],
          safetyLevel: fallback.safetyLevel || safety.level,
        });
      }
    } catch {
      const fallback = generateFallbackCoachResponse(trimmed, recentCheckIn);
      setResult({
        source: 'rules_engine',
        fallbackNotice:
          'Could not connect to live HealthMate AI right now—showing safe HealthMate rules-based guidance instead.',
        text: fallback.text,
        followUpQuestion: fallback.followUpQuestion,
        actionSteps: fallback.actionSteps || [],
        safetyLevel: fallback.safetyLevel || safety.level,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-label={`HealthMate AI Opinion for ${sectionTitle}`}
      className={`rounded-2xl p-6 transition ${
        highlighted
          ? 'bg-[#64D9F5]/12 border border-[#64D9F5]/45'
          : 'hm-card'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <div className="text-xs text-[#0F766E] font-semibold">
            HealthMate AI · Custom Student Opinion
          </div>
          <h4 className="text-lg font-bold text-[#172033] mt-0.5">
            Need a tailored suggestion for {sectionTitle}?
          </h4>
        </div>
      </div>

      {highlightReason && (
        <p className="text-sm text-[#172033] mb-3 leading-relaxed font-medium">
          {highlightReason}
        </p>
      )}

      <p className="text-sm text-[#667085] mb-4">
        If the preset options above do not match your exact home ingredients, subject, or schedule, ask{' '}
        <strong className="text-[#172033]">HealthMate AI</strong> for a safe, personalized student opinion.
      </p>

      <form onSubmit={handleAskHealthMate} className="space-y-3">
        <div>
          <label
            htmlFor={`hm-ai-input-${sectionTitle.replace(/\s+/g, '-').toLowerCase()}`}
            className="sr-only"
          >
            Ask HealthMate AI about {sectionTitle}
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id={`hm-ai-input-${sectionTitle.replace(/\s+/g, '-').toLowerCase()}`}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder={promptPlaceholder}
              className="hm-input flex-1 rounded-xl px-4 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#101828] hover:bg-[#18243A] disabled:opacity-60 text-[#55E6A5] text-sm font-bold px-5 py-2.5 rounded-xl transition inline-flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Ask HealthMate AI
                </>
              )}
            </button>
          </div>
          {validationError && (
            <p role="alert" className="text-xs text-rose-700 mt-1.5 font-medium">
              {validationError}
            </p>
          )}
        </div>
      </form>

      {result && (
        <div className="mt-5 pt-5 border-t border-[#E4E7EC] space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
            <span className="font-semibold text-[#172033]">
              {result.source === 'healthmate_ai'
                ? 'Source: HealthMate AI (Live Gemini Model)'
                : 'Source: HealthMate Rules Guide (Transparent Local Fallback)'}
            </span>
            {result.fallbackNotice && (
              <>
                <span aria-hidden="true">·</span>
                <span>{result.fallbackNotice}</span>
              </>
            )}
          </div>

          {result.safetyLevel === 'emergency' && (
            <div
              role="alert"
              className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-950 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                Urgent Support Needed Right Now
              </div>
              <p className="text-sm leading-relaxed">{result.text}</p>
            </div>
          )}

          {result.safetyLevel !== 'emergency' && (
            <p className="text-sm text-[#172033] leading-relaxed">{result.text}</p>
          )}

          {result.actionSteps.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#667085]">
                Suggested Next Steps (click one to commit to trying first):
              </div>
              <div className="space-y-1.5">
                {result.actionSteps.map((step, idx) => {
                  const isSelected = chosenStep === step;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setChosenStep(step)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm border transition flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#101828] border-[#101828] text-white font-medium'
                          : 'bg-[#F5F7FB] border-[#E4E7EC] text-[#172033] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <span className={`font-mono text-xs mt-0.5 tabular-nums ${isSelected ? 'text-[#55E6A5]' : 'text-[#0F766E]'}`}>
                        0{idx + 1}.
                      </span>
                      <span>{step}</span>
                    </button>
                  );
                })}
              </div>
              {chosenStep && (
                <p className="text-xs text-[#0F766E] font-semibold pt-1">
                  Great choice—starting with just that single step keeps things calm and doable.
                </p>
              )}
            </div>
          )}

          {result.followUpQuestion && (
            <p className="text-xs text-[#667085] italic pt-1">
              Coach reflection: {result.followUpQuestion}
            </p>
          )}
        </div>
      )}
    </section>
  );
};
