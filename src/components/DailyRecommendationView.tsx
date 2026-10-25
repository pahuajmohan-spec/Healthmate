/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Moon,
  Zap,
  Brain,
  Monitor,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Send,
} from 'lucide-react';
import { DailyRecommendation, UserProfile } from '../types/health';
import { getDailyRecommendation } from '../utils/healthCalculations';

import { SectionGuideBanner } from './SectionGuideBanner';

interface DailyRecommendationViewProps {
  userProfile: UserProfile | null;
}

const PRESET_SITUATIONS = [
  { id: 'low_sleep', label: 'Slept Poorly / Short Sleep (<5h)', icon: Moon },
  { id: 'feeling_sluggish', label: 'Feeling Stiff & Sluggish', icon: Zap },
  { id: 'high_stress', label: 'Overwhelmed with Exam / Work Stress', icon: Brain },
  { id: 'sitting_all_day', label: 'Stuck Sitting at Desk for Hours', icon: Monitor },
];

export const DailyRecommendationView: React.FC<DailyRecommendationViewProps> = ({ userProfile }) => {
  const [selectedSituation, setSelectedSituation] = useState<string>('low_sleep');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiEnhancedResponse, setAiEnhancedResponse] = useState<string | null>(null);

  const ageGroup = userProfile?.ageGroup || '18_29';
  const recommendation: DailyRecommendation = getDailyRecommendation(selectedSituation, ageGroup);

  const guideSteps = [
    {
      title: 'Select Your Situation',
      detail: 'Choose from common daily scenarios like poor sleep, sluggishness, exam stress, or long desk sitting.',
    },
    {
      title: 'Read Actionable Safe Steps',
      detail: 'Receive science-backed, guardrailed recommendations with clear safety boundaries (no unverified supplements or extreme water).',
    },
    {
      title: 'Ask AI Custom Questions',
      detail: 'Type any specific daily wellness question to receive tailored guidance from our secure server-side assistant.',
    },
  ];

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsLoading(true);
    setAiEnhancedResponse(null);

    try {
      const res = await fetch('/api/health-ai-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'daily_recommendation',
          promptContext: {
            userQuestion: customQuestion,
            ageGroup,
            goal: userProfile?.mainGoal || 'general_wellness',
            allergies: userProfile?.foodAllergies || [],
          },
        }),
      });

      const data = await res.json();
      if (data.available && data.text) {
        setAiEnhancedResponse(data.text);
      } else {
        setAiEnhancedResponse(
          `Personalized Recommendation for "${customQuestion}": Focus on steady hydration, a 15-minute gentle mobility walk, and an early screen sunset tonight. (Local rules engine response)`
        );
      }
    } catch {
      setAiEnhancedResponse(
        `Recommendation for "${customQuestion}": Take a gentle 10-minute walk, drink a glass of fresh water, and avoid high stimulants. (Local fallback engine)`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionGuideBanner
        sectionTitle="Daily Navigator"
        description="Instant evidence-based wellbeing guidance for specific situations like poor sleep, stress, or long desk sitting."
        steps={guideSteps}
      />
      {/* Banner */}
      <div className="hm-dark-hero rounded-3xl p-6 sm:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#98A2B3]">
            <span className="text-[#55E6A5] font-semibold">
              Interactive Daily Navigator
            </span>
            <span aria-hidden="true">·</span>
            <span>Safe, Guardrailed Advice</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            What Should I Do Today?
          </h2>
          <p className="text-xs sm:text-sm text-[#D0D5DD] leading-relaxed">
            Select your current feeling or ask a specific question. Receive realistic, age-appropriate guidance that strictly avoids fad diets, unverified supplements, or excessive water intake.
          </p>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="hm-card rounded-2xl p-6 space-y-5">
        <span className="text-xs font-bold text-[#667085] block">
          Select Your Current Situation:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SITUATIONS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedSituation === preset.id && !aiEnhancedResponse;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedSituation(preset.id);
                  setAiEnhancedResponse(null);
                }}
                className={`p-4 rounded-xl border text-left transition flex flex-col gap-2.5 ${
                  isSelected
                    ? 'border-[#101828] bg-[#101828] text-white shadow-sm'
                    : 'border-[#E4E7EC] hover:border-[#CBD5E1] bg-[#F5F7FB] text-[#172033]'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-[#18243A] text-[#55E6A5]' : 'bg-white text-[#18243A] border border-[#E4E7EC]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-snug">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Question Ask Bar */}
        <div className="pt-3 border-t border-[#E4E7EC]">
          <form onSubmit={handleAskAI} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Or ask your own: e.g. I have 20 minutes between classes, what is best?"
              className="hm-input flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl"
            />
            <button
              type="submit"
              disabled={isLoading || !customQuestion.trim()}
              className="bg-[#101828] hover:bg-[#18243A] disabled:opacity-50 text-[#55E6A5] font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Ask Advice</span>
            </button>
          </form>
        </div>
      </div>

      {/* AI Enhanced Output if custom question was asked */}
      {aiEnhancedResponse && (
        <div className="hm-card rounded-2xl p-6 border-[#55E6A5] space-y-3">
          <div className="flex items-center gap-2 text-[#0F766E] font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            Personalized Daily Response
          </div>
          <div className="text-sm text-[#172033] leading-relaxed whitespace-pre-line bg-[#F5F7FB] p-4 rounded-xl">
            {aiEnhancedResponse}
          </div>
          <button
            onClick={() => setAiEnhancedResponse(null)}
            className="text-xs text-[#667085] hover:text-[#172033] hover:underline font-semibold"
          >
            ← Return to standard protocol recommendations
          </button>
        </div>
      )}

      {/* Structured Recommendation Card */}
      {!aiEnhancedResponse && (
        <div className="hm-card rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="border-b border-[#E4E7EC] pb-4">
            <span className="text-xs font-semibold text-[#0F766E]">
              Target Situation: {recommendation.situation}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-[#172033] mt-1.5">
              {recommendation.headline}
            </h3>
            <p className="text-xs sm:text-sm text-[#667085] mt-1 leading-relaxed">
              {recommendation.recommendation}
            </p>
          </div>

          {/* Actionable Steps Checklist */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-[#172033] block">
              Immediate Actionable Steps for Today:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recommendation.actionableSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F5F7FB] flex items-start gap-2.5 text-xs text-[#172033]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Boundaries & Guardrails */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 space-y-1">
              <span className="font-bold block text-amber-900">
                Ethical Health Guardrail (Do Not Do)
              </span>
              <p className="leading-relaxed">{recommendation.safetyBoundaries}</p>
              <p className="text-[11px] text-amber-800 font-medium pt-1">
                Age Context: {recommendation.ageRelevance}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
