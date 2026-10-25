/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, BookOpen, ShieldCheck } from 'lucide-react';
import {
  ExamRescueInput,
  ExamRescuePlan,
  StudyDifficultyType,
  StudentDailyCheckIn,
} from '../../types/studentWellbeing';
import { generateExamRescuePlan } from '../../utils/studentWellbeingLogic';
import { HealthMateAiOpinionBox } from './HealthMateAiOpinionBox';

interface ExamHomeworkRescueProps {
  recentCheckIn: StudentDailyCheckIn;
  onLogStudySessionCompleted: () => void;
}

export const ExamHomeworkRescue: React.FC<ExamHomeworkRescueProps> = ({
  recentCheckIn,
  onLogStudySessionCompleted,
}) => {
  const [subject, setSubject] = useState(
    recentCheckIn.subjectToWorkOn || 'Mathematics'
  );
  const [deadlineLabel, setDeadlineLabel] = useState('Tomorrow morning');
  const [remainingWork, setRemainingWork] = useState(
    '2 chapters of core problems and key formulas'
  );
  const [availableMinutesText, setAvailableMinutesText] = useState(
    String(recentCheckIn.freeTimeMinutes || 75)
  );
  const [biggestDifficulty, setBiggestDifficulty] =
    useState<StudyDifficultyType>('concentration');
  const [quickMode, setQuickMode] = useState<
    'standard' | 'only_30_min' | 'exam_tomorrow'
  >('standard');
  const [validationError, setValidationError] = useState('');

  const [rescuePlan, setRescuePlan] = useState<ExamRescuePlan>(() =>
    generateExamRescuePlan({
      subject: recentCheckIn.subjectToWorkOn || 'Mathematics',
      deadlineLabel: 'Tomorrow morning',
      remainingWork: '2 chapters of core problems and key formulas',
      availableMinutesToday: recentCheckIn.freeTimeMinutes || 75,
      biggestDifficulty: 'concentration',
      quickMode: 'standard',
    })
  );

  const buildPlan = (
    overrideMode?: 'standard' | 'only_30_min' | 'exam_tomorrow'
  ) => {
    const activeMode = overrideMode || quickMode;
    const parsedMins =
      activeMode === 'only_30_min' ? 30 : Number(availableMinutesText);

    if (!subject.trim()) {
      setValidationError('Please enter the subject you are working on.');
      return;
    }
    if (
      activeMode !== 'only_30_min' &&
      (Number.isNaN(parsedMins) || parsedMins < 15 || parsedMins > 360)
    ) {
      setValidationError('Please enter study time between 15 and 360 minutes.');
      return;
    }

    setValidationError('');
    setQuickMode(activeMode);
    if (activeMode === 'only_30_min') {
      setAvailableMinutesText('30');
    }
    if (activeMode === 'exam_tomorrow') {
      setDeadlineLabel('Tomorrow morning');
    }

    const input: ExamRescueInput = {
      subject: subject.trim(),
      deadlineLabel:
        activeMode === 'exam_tomorrow' ? 'Tomorrow morning' : deadlineLabel,
      remainingWork: remainingWork.trim() || 'Core syllabus topics',
      availableMinutesToday: parsedMins,
      biggestDifficulty,
      quickMode: activeMode,
    };

    setRescuePlan(generateExamRescuePlan(input));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buildPlan(quickMode);
  };

  const toggleStepComplete = (stepId: string) => {
    setRescuePlan((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id === stepId) {
          const nextDone = !s.completed;
          if (nextDone) onLogStudySessionCompleted();
          return { ...s, completed: nextDone };
        }
        return s;
      }),
    }));
  };

  const totalStepMinutes = rescuePlan.steps.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );

  return (
    <div className="space-y-8">
      {/* Input & Quick Rescue Modes */}
      <section
        aria-labelledby="exam-rescue-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-xs text-[#0F766E] font-semibold">
              04. Exam & Homework Rescue · Evidence-Based Study Triage
            </div>
            <h3
              id="exam-rescue-heading"
              className="text-2xl font-bold text-[#172033] mt-1"
            >
              Calm Step-by-Step Study Rescue
            </h3>
            <p className="text-sm text-[#667085] mt-1 max-w-2xl">
              Break heavy homework or exam chapters into realistic chunks using active recall, spaced revision, and sleep-safe boundaries—never all-nighters.
            </p>
          </div>

          {/* Quick-Action Rescue Mode Buttons */}
          <div
            role="group"
            aria-label="Quick rescue study modes"
            className="flex flex-wrap gap-2 bg-[#F5F7FB] p-1.5 rounded-xl border border-[#E4E7EC]"
          >
            <button
              type="button"
              onClick={() => buildPlan('standard')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                quickMode === 'standard'
                  ? 'bg-[#101828] text-[#55E6A5]'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              Balanced Plan
            </button>
            <button
              type="button"
              onClick={() => buildPlan('only_30_min')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                quickMode === 'only_30_min'
                  ? 'bg-[#101828] text-[#64D9F5]'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              I Have Only 30 Minutes
            </button>
            <button
              type="button"
              onClick={() => buildPlan('exam_tomorrow')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                quickMode === 'exam_tomorrow'
                  ? 'bg-[#18243A] text-[#55E6A5]'
                  : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              My Exam Is Tomorrow
            </button>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 border-t border-[#E4E7EC]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="er-subject"
                className="block text-xs font-semibold text-[#172033] mb-1.5"
              >
                Subject
              </label>
              <input
                id="er-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Physics, History, Maths"
                className="hm-input w-full rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="er-deadline"
                className="block text-xs font-semibold text-[#172033] mb-1.5"
              >
                Deadline / Test date
              </label>
              <input
                id="er-deadline"
                type="text"
                value={deadlineLabel}
                onChange={(e) => setDeadlineLabel(e.target.value)}
                placeholder="e.g. Tomorrow morning, Friday"
                className="hm-input w-full rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="er-minutes"
                className="block text-xs font-semibold text-[#172033] mb-1.5"
              >
                Minutes you can study today
              </label>
              <input
                id="er-minutes"
                type="number"
                min="15"
                max="360"
                step="5"
                value={availableMinutesText}
                onChange={(e) => setAvailableMinutesText(e.target.value)}
                className="hm-input w-full rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="er-difficulty"
                className="block text-xs font-semibold text-[#172033] mb-1.5"
              >
                Biggest difficulty right now
              </label>
              <select
                id="er-difficulty"
                value={biggestDifficulty}
                onChange={(e) =>
                  setBiggestDifficulty(e.target.value as StudyDifficultyType)
                }
                className="hm-input w-full rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="understanding_concepts">Understanding concepts</option>
                <option value="remembering_info">Remembering information</option>
                <option value="concentration">Concentration</option>
                <option value="time_management">Time management</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="er-remaining-work"
              className="block text-xs font-semibold text-[#172033] mb-1.5"
            >
              How much work or syllabus remains?
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="er-remaining-work"
                type="text"
                value={remainingWork}
                onChange={(e) => setRemainingWork(e.target.value)}
                placeholder="e.g. 3 chapters of quadratic equations, 15 homework sums, or 2 essay outlines..."
                className="hm-input flex-1 rounded-xl px-4 py-2.5 text-sm"
              />
              <button
                type="submit"
                className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-sm px-6 py-2.5 rounded-xl transition shrink-0"
              >
                Update Rescue Plan
              </button>
            </div>
          </div>

          {validationError && (
            <p role="alert" className="text-sm text-rose-700 font-medium">
              {validationError}
            </p>
          )}
        </form>
      </section>

      {/* Rescue Plan Output */}
      <section
        aria-labelledby="rescue-output-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs text-[#0F766E] font-semibold">
              {rescuePlan.modeLabel} · Total {totalStepMinutes} mins
            </div>
            <h4
              id="rescue-output-heading"
              className="text-xl font-bold text-[#172033] mt-0.5"
            >
              {rescuePlan.strategyHeadline}
            </h4>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#667085] font-mono tabular-nums">
            <Clock className="w-4 h-4 text-[#0F766E]" />
            <span>
              {rescuePlan.steps.filter((s) => s.completed).length}/
              {rescuePlan.steps.length} steps checked
            </span>
          </div>
        </div>

        <p className="text-sm text-[#172033] bg-[#F5F7FB] rounded-xl p-4 leading-relaxed">
          <BookOpen className="w-4 h-4 text-[#0F766E] inline mr-2 -mt-0.5" />
          {rescuePlan.difficultyTargetedTip}
        </p>

        <div className="divide-y divide-[#E4E7EC] border-t border-b border-[#E4E7EC]">
          {rescuePlan.steps.map((step) => (
            <button
              key={step.id}
              type="button"
              onClick={() => toggleStepComplete(step.id)}
              className="w-full text-left py-4 flex items-start gap-4 hover:bg-[#F5F7FB] transition px-2 rounded-xl"
            >
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-[#98A2B3] shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085] mb-0.5">
                  <span className="font-mono font-semibold text-[#0F766E] tabular-nums">
                    Step 0{step.stepNumber} · {step.durationMinutes} mins
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{step.methodTag}</span>
                </div>
                <div
                  className={`text-sm font-bold ${
                    step.completed
                      ? 'line-through text-[#667085]'
                      : 'text-[#172033]'
                  }`}
                >
                  {step.title}
                </div>
                <p className="text-sm text-[#667085] mt-1 leading-relaxed">
                  {step.instruction}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="bg-[#64D9F5]/12 rounded-xl p-4 text-sm text-[#172033]">
            <strong>Sleep-First Boundary:</strong> {rescuePlan.sleepBoundaryMessage}
          </div>
          <div className="bg-[#55E6A5]/12 rounded-xl p-4 text-sm text-[#172033] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
            <span>{rescuePlan.wellbeingReassurance}</span>
          </div>
        </div>
      </section>

      <HealthMateAiOpinionBox
        sectionTitle="Exam & Homework Rescue"
        promptPlaceholder="Stuck on how to revise a tricky topic (e.g. 'How do I memorize French verbs or Organic Chemistry reactions in 40 mins?')? Ask HealthMate AI..."
        recentCheckIn={recentCheckIn}
        contextData={{
          subject,
          deadlineLabel,
          remainingWork,
          biggestDifficulty,
          quickMode,
        }}
      />
    </div>
  );
};
