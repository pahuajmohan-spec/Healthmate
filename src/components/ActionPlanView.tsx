/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Sliders,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ActionPlanTask, HealthCheckInRecord, UserProfile } from '../types/health';
import { generate7DayPlan } from '../utils/healthCalculations';
import { SectionGuideBanner } from './SectionGuideBanner';

interface ActionPlanViewProps {
  userProfile: UserProfile | null;
  latestRecord: HealthCheckInRecord | null;
  savedPlanState: Record<string, boolean>;
  onToggleTask: (taskId: string) => void;
  onOpenCheckIn: () => void;
}

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({
  userProfile,
  latestRecord,
  savedPlanState,
  onToggleTask,
  onOpenCheckIn,
}) => {
  const [adaptFilter, setAdaptFilter] = useState<'all' | 'uncompleted' | 'completed'>('all');
  const [userPacePreference, setUserPacePreference] = useState<'gentle' | 'standard' | 'focused'>('standard');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const guideSteps = [
    {
      title: '7-Day Micro-Habit Protocol',
      detail: 'Follow one gentle, achievable wellbeing action each day across sleep, hydration, movement, and mindfulness.',
    },
    {
      title: 'Check Off Completed Tasks',
      detail: 'Click checkboxes as you complete daily routines to track your weekly completion percentage in real time.',
    },
    {
      title: 'Adjust Pace & Intensity',
      detail: 'Use pace toggles to switch between Gentle, Standard, or Focused habit pacing based on your current energy.',
    },
  ];

  if (!userProfile) {
    return (
      <div className="space-y-6">
        <SectionGuideBanner
          sectionTitle="7-Day Action Plan"
          description="Your personalized weekly wellbeing routine designed around your goals and age group."
          steps={guideSteps}
        />
        <div className="hm-card rounded-3xl p-8 text-center max-w-lg mx-auto my-8">
          <Sparkles className="w-10 h-10 text-[#0F766E] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#172033] mb-2">No Active Action Plan</h3>
          <p className="text-xs text-[#667085] mb-5 leading-relaxed">
            Complete your health profile to generate a personalized, achievable 7-day wellbeing plan tailored to your routine and age.
          </p>
          <button
            onClick={onOpenCheckIn}
            className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-xs px-5 py-2.5 rounded-xl"
          >
            Generate 7-Day Plan
          </button>
        </div>
      </div>
    );
  }

  const tasks: ActionPlanTask[] = generate7DayPlan(userProfile, latestRecord).map((t) => ({
    ...t,
    completed: !!savedPlanState[t.id],
    durationMinutes:
      userPacePreference === 'gentle'
        ? Math.max(5, Math.round((t.durationMinutes || 20) * 0.6))
        : t.durationMinutes,
  }));

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  const displayedTasks = tasks.filter((t) => {
    if (adaptFilter === 'completed') return t.completed;
    if (adaptFilter === 'uncompleted') return !t.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <SectionGuideBanner
        sectionTitle="7-Day Action Plan"
        description="Your personalized weekly wellbeing routine designed around your goals and age group."
        steps={guideSteps}
      />
      {/* Banner & Weekly Completion Meter */}
      <div className="hm-dark-hero rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#98A2B3]">
              <span className="text-[#55E6A5] font-semibold">
                Adaptive 7-Day Protocol
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Tailored for: <strong className="text-white">{userProfile.name || 'You'}</strong> ({userProfile.ageGroup === 'under_18' ? 'Youth Safe Mode' : 'Adult'})
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white text-balance">
              Small Daily Habits, Achievable Momentum
            </h2>
            <p className="text-xs sm:text-sm text-[#D0D5DD] leading-relaxed">
              Designed around your primary goal (<strong className="text-white">{userProfile.mainGoal.replace('_', ' ')}</strong>) and daily routine. Never overwhelming, restrictive, or punitive.
            </p>
          </div>

          {/* Progress meter */}
          <div className="bg-[#101828]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/12 min-w-[220px] space-y-2.5">
            <div className="flex justify-between items-center text-xs font-semibold text-[#D0D5DD]">
              <span>Weekly Completion</span>
              <span className="font-bold text-[#55E6A5] font-mono tabular-nums">{completedCount} of 7 Done</span>
            </div>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#55E6A5] to-[#64D9F5] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-[#98A2B3]">
              {progressPercent === 100
                ? 'Incredible week! All 7 days completed.'
                : progressPercent >= 50
                ? 'Terrific momentum! Over halfway through.'
                : 'Take it one micro-action at a time.'}
            </p>
          </div>
        </div>

        {/* Adaptive pace controls */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <Sliders className="w-3.5 h-3.5 text-[#55E6A5]" />
            <span className="text-[#D0D5DD] font-semibold">Adapt plan intensity:</span>
            <div className="flex bg-[#101828]/80 rounded-xl p-1 border border-white/10">
              {(['gentle', 'standard', 'focused'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setUserPacePreference(p);
                    setFeedbackSubmitted(true);
                  }}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition whitespace-nowrap ${
                    userPacePreference === p
                      ? 'bg-[#55E6A5] text-[#101828] font-bold shadow-xs'
                      : 'text-[#98A2B3] hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#101828]/80 rounded-xl p-1 border border-white/10">
            {([
              { id: 'all', label: 'All' },
              { id: 'uncompleted', label: 'Remaining' },
              { id: 'completed', label: 'Completed' },
            ] as const).map((f) => (
              <button
                key={f.id}
                onClick={() => setAdaptFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs transition whitespace-nowrap ${
                  adaptFilter === f.id
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-[#98A2B3] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {feedbackSubmitted && (
        <div className="p-3.5 bg-[#55E6A5]/15 border border-[#55E6A5]/40 rounded-2xl text-xs text-[#172033] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#0F766E]" />
            <span>Plan dynamically adjusted to <strong>{userPacePreference}</strong> duration and intensity.</span>
          </div>
          <button
            onClick={() => setFeedbackSubmitted(false)}
            className="text-[#0F766E] hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 7-Day Action Plan Cards */}
      <div className="space-y-3">
        {displayedTasks.map((task) => {
          const isDone = task.completed;
          const categoryColors = {
            sleep: 'text-[#18243A]',
            hydration: 'text-[#0E7490]',
            activity: 'text-[#0F766E]',
            mindfulness: 'text-[#0D9488]',
            nutrition: 'text-amber-700',
          }[task.category];

          return (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                isDone
                  ? 'bg-[#F5F7FB] border-[#E4E7EC] opacity-80'
                  : 'hm-card-interactive'
              }`}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTask(task.id);
                }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition ${
                  isDone
                    ? 'bg-[#101828] text-[#55E6A5] shadow-xs'
                    : 'border-2 border-[#D0D5DD] hover:border-[#101828] bg-white text-transparent'
                }`}
                aria-label={`Mark day ${task.day} ${task.dayName} as ${isDone ? 'incomplete' : 'complete'}`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Task Details */}
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-[#172033]">
                    Day {task.day} · {task.dayName}
                  </span>
                  <span className="text-[#98A2B3]" aria-hidden="true">·</span>
                  <span className={`font-semibold capitalize ${categoryColors}`}>
                    {task.category}
                  </span>
                  {task.durationMinutes && (
                    <>
                      <span className="text-[#98A2B3]" aria-hidden="true">·</span>
                      <span className="text-[#667085] flex items-center gap-1 tabular-nums">
                        <Clock className="w-3 h-3" />
                        ~{task.durationMinutes} mins
                      </span>
                    </>
                  )}
                </div>

                <h4 className={`text-sm sm:text-base font-bold ${isDone ? 'line-through text-[#667085]' : 'text-[#172033]'}`}>
                  {task.title}
                </h4>

                <p className="text-xs text-[#667085] leading-relaxed">
                  {task.description}
                </p>

                <div className="pt-1 text-[11px] font-medium text-[#18243A]">
                  Target: {task.targetMetric}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Guardrail reminder for action plans */}
      <div className="p-4 hm-card rounded-2xl flex items-center gap-3 text-xs text-[#667085]">
        <ShieldCheck className="w-5 h-5 text-[#0F766E] shrink-0" />
        <span>
          <strong className="text-[#172033]">Responsible Action Guidance:</strong> Tasks are designed to build gentle consistency. If you ever feel exhausted, unwell, or strained, rest takes precedence. Never force exercise or ignore physical pain.
        </span>
      </div>
    </div>
  );
};
