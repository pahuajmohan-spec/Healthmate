/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Moon,
  Droplet,
  Flame,
  Smile,
  Info,
  HelpCircle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { HealthCheckInRecord, ScorecardBreakdown, UserProfile } from '../types/health';
import { calculateHealthScore } from '../utils/healthCalculations';

import { SectionGuideBanner } from './SectionGuideBanner';

interface ScorecardViewProps {
  currentRecord: HealthCheckInRecord | null;
  userProfile: UserProfile | null;
  onOpenNewCheckIn: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({
  currentRecord,
  userProfile,
  onOpenNewCheckIn,
  onNavigateTab,
}) => {
  const [showMethodology, setShowMethodology] = useState(false);

  const guideSteps = [
    {
      title: 'Complete Daily Check-In',
      detail: 'Log your sleep hours, water intake, daily movement, and stress level to update your health score instantly.',
    },
    {
      title: 'Inspect 4 Habit Pillars',
      detail: 'View weighted scores across Sleep, Hydration, Activity, and Stress Equilibrium with complete transparency.',
    },
    {
      title: 'Actionable Next Steps',
      detail: 'Click on recommendations to jump to your 7-Day Plan or Smart Food Guide for healthy habit building.',
    },
  ];

  if (!currentRecord) {
    return (
      <div className="space-y-6">
        <SectionGuideBanner
          sectionTitle="Health Scorecard"
          description="Track your daily sleep, hydration, physical movement, and stress equilibrium with a transparent 0-100 habit index."
          steps={guideSteps}
        />
      <div className="hm-card rounded-3xl p-8 sm:p-10 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-[#101828] text-[#55E6A5] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#55E6A5]/30">
          <Activity className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#172033] mb-2">No Health Data Recorded Yet</h3>
        <p className="text-sm text-[#667085] mb-6 leading-relaxed">
          Complete the personalized smart onboarding questionnaire to calculate your transparent wellbeing scorecard and unlock your customized 7-day action plan.
        </p>
        <button
          onClick={onOpenNewCheckIn}
          className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold px-6 py-3 rounded-xl shadow-md transition inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Start Health Onboarding
        </button>
      </div>
      </div>
    );
  }

  const breakdown: ScorecardBreakdown = calculateHealthScore(
    currentRecord,
    userProfile?.ageGroup || '18_29'
  );

  const getScoreMeta = (score: number) => {
    if (score >= 80) return { stroke: 'text-[#55E6A5]', label: 'Vibrant & Consistent' };
    if (score >= 60) return { stroke: 'text-[#64D9F5]', label: 'Balanced Progress' };
    if (score >= 40) return { stroke: 'text-amber-400', label: 'Developing Routines' };
    return { stroke: 'text-rose-400', label: 'Needs Gentle Support' };
  };

  const scoreMeta = getScoreMeta(breakdown.overallScore);

  return (
    <div className="space-y-6">
      <SectionGuideBanner
        sectionTitle="Health Scorecard"
        description="Track your daily sleep, hydration, physical movement, and stress equilibrium with a transparent 0-100 habit index."
        steps={guideSteps}
      />

      {/* Top Banner & Hero Scorecard */}
      <div className="hm-dark-hero rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-72 h-72 bg-[#55E6A5]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-72 h-72 bg-[#64D9F5]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#98A2B3]">
              <span className="text-[#55E6A5] font-semibold">
                Transparent Wellbeing Scorecard
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Latest Check-in: <strong className="text-white">{currentRecord.dateLabel || currentRecord.weekLabel}</strong>
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
              {userProfile?.name ? `${userProfile.name}'s Lifestyle Habit Index` : 'Personal Wellbeing Index'}
            </h2>

            <p className="text-sm text-[#D0D5DD] leading-relaxed max-w-2xl">
              An evidence-based index of your reported daily lifestyle habits across sleep, hydration, movement, and stress resilience. Calculated transparently from your personal check-in logs.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setShowMethodology(true)}
                className="text-xs font-semibold text-[#55E6A5] hover:text-[#64D9F5] underline underline-offset-4 flex items-center gap-1.5 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                How is this score calculated?
              </button>
              <span className="text-white/25" aria-hidden="true">·</span>
              <button
                onClick={() => onNavigateTab('comparison')}
                className="text-xs font-semibold text-[#64D9F5] hover:text-white flex items-center gap-1 transition"
              >
                View Then vs Now Comparison
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Overall Score Dial */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-5 bg-[#101828]/70 backdrop-blur-md rounded-2xl border border-white/10">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-white/10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * breakdown.overallScore) / 100}
                  strokeLinecap="round"
                  className={`${scoreMeta.stroke} transition-all duration-700 ease-out`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-white tracking-tight font-mono tabular-nums">
                  {breakdown.overallScore}
                </span>
                <span className="text-[11px] font-medium text-[#98A2B3]">
                  out of 100
                </span>
              </div>
            </div>
            <span className="mt-2.5 text-xs font-semibold text-[#55E6A5]">
              {scoreMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Transparent Pillars Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar 1: Sleep */}
        <div className="hm-card-interactive rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#18243A]/8 text-[#18243A] flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-xl font-extrabold text-[#172033]">{breakdown.sleepScore}</span>
              <span className="text-xs text-[#667085] font-medium">/25 pts</span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-[#172033] mb-2">Sleep & Restfulness</h4>
          <div className="w-full bg-[#F5F7FB] h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-[#18243A] h-full rounded-full"
              style={{ width: `${(breakdown.sleepScore / 25) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            {breakdown.sleepExplanation}
          </p>
        </div>

        {/* Pillar 2: Hydration */}
        <div className="hm-card-interactive rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#64D9F5]/20 text-[#0E7490] flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-xl font-extrabold text-[#172033]">{breakdown.hydrationScore}</span>
              <span className="text-xs text-[#667085] font-medium">/25 pts</span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-[#172033] mb-2">Hydration Balance</h4>
          <div className="w-full bg-[#F5F7FB] h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-[#06B6D4] h-full rounded-full"
              style={{ width: `${(breakdown.hydrationScore / 25) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            {breakdown.hydrationExplanation}
          </p>
        </div>

        {/* Pillar 3: Physical Movement */}
        <div className="hm-card-interactive rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#55E6A5]/20 text-[#0F766E] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-xl font-extrabold text-[#172033]">{breakdown.activityScore}</span>
              <span className="text-xs text-[#667085] font-medium">/25 pts</span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-[#172033] mb-2">Physical Movement</h4>
          <div className="w-full bg-[#F5F7FB] h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-[#10B981] h-full rounded-full"
              style={{ width: `${(breakdown.activityScore / 25) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            {breakdown.activityExplanation}
          </p>
        </div>

        {/* Pillar 4: Mood & Stress */}
        <div className="hm-card-interactive rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#101828]/8 text-[#101828] flex items-center justify-center">
              <Smile className="w-5 h-5" />
            </div>
            <div className="text-right font-mono tabular-nums">
              <span className="text-xl font-extrabold text-[#172033]">{breakdown.moodScore}</span>
              <span className="text-xs text-[#667085] font-medium">/25 pts</span>
            </div>
          </div>
          <h4 className="text-sm font-bold text-[#172033] mb-2">Stress & Mood Equilibrium</h4>
          <div className="w-full bg-[#F5F7FB] h-2 rounded-full overflow-hidden mb-3">
            <div
              className="bg-[#0D9488] h-full rounded-full"
              style={{ width: `${(breakdown.moodScore / 25) * 100}%` }}
            />
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            {breakdown.moodExplanation}
          </p>
        </div>
      </div>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 z-50 bg-[#101828]/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E4E7EC] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
              <h3 className="text-base font-bold text-[#172033] flex items-center gap-2">
                <Info className="w-5 h-5 text-[#0F766E]" />
                Scorecard Calculation Methodology
              </h3>
              <button
                onClick={() => setShowMethodology(false)}
                aria-label="Close methodology dialog"
                className="text-[#667085] hover:text-[#172033] text-sm font-bold px-2 py-1 rounded-lg hover:bg-[#F5F7FB]"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#172033] space-y-3 leading-relaxed">
              <p>
                The Wellbeing Progress Score totals <strong>100 possible points</strong>, divided equally across four proven lifestyle dimensions (25 points each):
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-[#667085]">
                <li>
                  <strong className="text-[#172033]">Sleep (25 pts):</strong> Up to 15 points for duration within healthy target ranges (7–9 hrs for adults, 8.5–10 hrs for youth) + up to 10 points for restfulness quality.
                </li>
                <li>
                  <strong className="text-[#172033]">Hydration (25 pts):</strong> Full points for 1.8–2.8 Liters of water daily. Intentionally caps points to discourage extreme water loading (&gt;4L).
                </li>
                <li>
                  <strong className="text-[#172033]">Movement (25 pts):</strong> Tiered points rewarding 30–45+ minutes of daily aerobic movement, walking, or mobility breaks.
                </li>
                <li>
                  <strong className="text-[#172033]">Stress & Mood (25 pts):</strong> 13 points scaled from general mood rating + 12 points inverted from perceived stress levels (lower stress = higher score).
                </li>
              </ul>
              <div className="p-3.5 bg-[#F5F7FB] rounded-xl border border-[#E4E7EC] text-[#667085] text-[11px]">
                <strong className="text-[#172033]">No Black-Box Scoring:</strong> No hidden algorithms, third-party data tracking, or arbitrary penalties. Every point is directly traceable to your self-reported logs.
              </div>
            </div>

            <div className="text-right pt-2 border-t border-[#E4E7EC]">
              <button
                onClick={() => setShowMethodology(false)}
                className="bg-[#101828] hover:bg-[#18243A] text-white font-semibold text-xs px-5 py-2 rounded-xl"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
