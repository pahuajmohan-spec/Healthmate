/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Info,
  Sparkles,
  PlusCircle,
} from 'lucide-react';
import { HealthCheckInRecord, UserProfile } from '../types/health';
import { calculateHealthScore } from '../utils/healthCalculations';

interface JourneyTimelineViewProps {
  history: HealthCheckInRecord[];
  userProfile: UserProfile | null;
  onOpenNewCheckIn: () => void;
  onOpenOnboarding: () => void;
}

export const JourneyTimelineView: React.FC<JourneyTimelineViewProps> = ({
  history,
  userProfile,
  onOpenNewCheckIn,
  onOpenOnboarding,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  if (!userProfile || history.length === 0) {
    return (
      <div className="hm-card rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-8 space-y-4">
        <div className="w-16 h-16 bg-[#101828] text-[#55E6A5] rounded-2xl flex items-center justify-center mx-auto border border-[#55E6A5]/30">
          <Calendar className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#172033]">Your Health Journey Hasn&apos;t Begun Yet</h3>
        <p className="text-xs sm:text-sm text-[#667085] leading-relaxed max-w-md mx-auto">
          Log your initial onboarding questionnaire to create your Week 1 milestone. Your timeline will trace each step of your lifestyle evolution.
        </p>
        <button
          onClick={onOpenOnboarding}
          className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Start My Health Journey
        </button>
      </div>
    );
  }

  const chronologicalHistory = [...history].reverse();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="hm-dark-hero rounded-3xl p-6 sm:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#98A2B3]">
            <span className="text-[#55E6A5] font-semibold">
              Living Milestone Timeline
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {history.length} Milestone{history.length > 1 ? 's' : ''} Documented
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            The Story of Your Wellbeing Journey
          </h2>
          <p className="text-xs sm:text-sm text-[#D0D5DD] leading-relaxed">
            Visual milestone tracking of each check-in, habit shift, and lifestyle accomplishment from your first day to today.
          </p>
        </div>
      </div>

      {/* What the system Can and Cannot Conclude */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="hm-card rounded-2xl p-5 space-y-2 text-xs">
          <span className="font-bold text-[#0F766E] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            What This Timeline CAN Conclude
          </span>
          <ul className="space-y-1.5 text-[#172033]">
            <li>• Consistency and duration changes in your daily sleep routine.</li>
            <li>• Adherence to hydration benchmarks (1.8–2.8L) without dangerous extremes.</li>
            <li>• Trends in active minutes and subjective self-reported stress levels.</li>
            <li>• Completion rates of small, achievable 7-day habit micro-actions.</li>
          </ul>
        </div>

        <div className="hm-card rounded-2xl p-5 space-y-2 text-xs">
          <span className="font-bold text-rose-700 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-rose-600" />
            What This Timeline CANNOT Conclude
          </span>
          <ul className="space-y-1.5 text-[#667085]">
            <li>• Clinical diagnosis of underlying biological disease or pathology.</li>
            <li>• Efficacy of prescription medications or adjustments to clinical therapies.</li>
            <li>• Prognosis without in-person physical exams and laboratory blood testing.</li>
            <li>• Never claims health improvement without at least two verified records.</li>
          </ul>
        </div>
      </div>

      {/* Interactive Vertical Timeline */}
      <div className="hm-card rounded-3xl p-6 sm:p-8 relative">
        <div className="flex items-center justify-between pb-6 border-b border-[#E4E7EC]">
          <h3 className="text-base font-bold text-[#172033]">Check-in Chronology</h3>
          <button
            onClick={onOpenNewCheckIn}
            className="flex items-center gap-1.5 text-xs font-bold text-[#55E6A5] bg-[#101828] hover:bg-[#18243A] px-3.5 py-2 rounded-xl transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Log Next Milestone
          </button>
        </div>

        <div className="mt-8 relative">
          {/* Vertical central spine line */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-0.5 bg-[#E4E7EC] -translate-x-1/2" />

          <div className="space-y-8">
            {chronologicalHistory.map((rec, index) => {
              const score = calculateHealthScore(rec, userProfile.ageGroup);
              const isEven = index % 2 === 0;
              const isLatest = index === chronologicalHistory.length - 1;

              return (
                <div
                  key={rec.id}
                  className={`relative flex flex-col sm:flex-row items-start ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Node Icon */}
                  <div
                    className={`absolute left-4 sm:left-1/2 -translate-x-1/2 z-10 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-xs font-bold font-mono tabular-nums ${
                      isLatest
                        ? 'bg-[#101828] text-[#55E6A5]'
                        : 'bg-[#18243A] text-white'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Empty Spacer for desktop alternating layout */}
                  <div className="hidden sm:block sm:w-1/2" />

                  {/* Card Container */}
                  <div
                    className={`ml-12 sm:ml-0 sm:w-1/2 ${
                      isEven ? 'sm:pr-8' : 'sm:pl-8'
                    } w-full`}
                  >
                    <div className="bg-[#F5F7FB] rounded-2xl p-5 space-y-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-[#172033]">
                            {rec.weekLabel}
                          </span>
                          <span className="text-[#98A2B3]" aria-hidden="true">·</span>
                          <span className="text-[#667085]">{rec.dateLabel}</span>
                        </div>
                        <span className="text-xs font-extrabold font-mono tabular-nums text-[#0F766E]">
                          Score: {score.overallScore}/100
                        </span>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div
                          className="p-2 bg-white rounded-xl text-center relative cursor-pointer"
                          onMouseEnter={() => setActiveTooltip(`sleep-${rec.id}`)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <span className="text-[10px] text-[#667085] block">Sleep</span>
                          <span className="font-bold text-[#172033] font-mono tabular-nums">{rec.sleepHours} hrs</span>
                          {activeTooltip === `sleep-${rec.id}` && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 p-2.5 bg-[#101828] text-white text-[10px] rounded-lg shadow-lg w-40 z-20 pointer-events-none">
                              Sleep latency & duration support cognitive restoration.
                            </div>
                          )}
                        </div>

                        <div
                          className="p-2 bg-white rounded-xl text-center relative cursor-pointer"
                          onMouseEnter={() => setActiveTooltip(`hydra-${rec.id}`)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <span className="text-[10px] text-[#667085] block">Water</span>
                          <span className="font-bold text-[#172033] font-mono tabular-nums">{rec.hydrationLiters} L</span>
                          {activeTooltip === `hydra-${rec.id}` && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 p-2.5 bg-[#101828] text-white text-[10px] rounded-lg shadow-lg w-40 z-20 pointer-events-none">
                              Fluid balance supports kidney filtration and alertness.
                            </div>
                          )}
                        </div>

                        <div
                          className="p-2 bg-white rounded-xl text-center relative cursor-pointer"
                          onMouseEnter={() => setActiveTooltip(`act-${rec.id}`)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <span className="text-[10px] text-[#667085] block">Activity</span>
                          <span className="font-bold text-[#172033] font-mono tabular-nums">{rec.activeMinutes} m</span>
                          {activeTooltip === `act-${rec.id}` && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 p-2.5 bg-[#101828] text-white text-[10px] rounded-lg shadow-lg w-40 z-20 pointer-events-none">
                              Active minutes lower cortisol and elevate mood endorphins.
                            </div>
                          )}
                        </div>

                        <div
                          className="p-2 bg-white rounded-xl text-center relative cursor-pointer"
                          onMouseEnter={() => setActiveTooltip(`mood-${rec.id}`)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <span className="text-[10px] text-[#667085] block">Stress / Mood</span>
                          <span className="font-bold text-[#172033] font-mono tabular-nums">
                            {rec.stressLevel}s / {rec.moodScore}m
                          </span>
                          {activeTooltip === `mood-${rec.id}` && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 p-2.5 bg-[#101828] text-white text-[10px] rounded-lg shadow-lg w-40 z-20 pointer-events-none">
                              Perceived stress (1-5) and emotional vitality (1-5).
                            </div>
                          )}
                        </div>
                      </div>

                      {rec.eatingRoutineNotes && (
                        <p className="text-xs text-[#667085] bg-white p-2.5 rounded-xl italic">
                          &quot;{rec.eatingRoutineNotes}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
