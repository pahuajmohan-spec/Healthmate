/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Wind,
  AlertTriangle,
  Plus,
  Play,
  Square,
  ArrowRight,
} from 'lucide-react';
import {
  AcademicObligation,
  HomeworkTaskItem,
  StudentDailyCheckIn,
} from '../../types/studentWellbeing';
import {
  STUDENT_BOTHERING_OPTIONS,
  generateAfterSchoolRecoveryPlan,
} from '../../utils/studentWellbeingLogic';
import { HealthMateAiOpinionBox } from './HealthMateAiOpinionBox';

interface StudentCheckInAndRecoveryProps {
  activeCheckIn: StudentDailyCheckIn;
  onSaveCheckIn: (updated: StudentDailyCheckIn) => void;
  onLogStudySessionCompleted: () => void;
  onLogBreakTaken: () => void;
  onNavigateSubTab: (subTab: string) => void;
}

const COMMON_ALLERGIES = ['dairy', 'nuts', 'peanuts', 'eggs', 'gluten', 'soy'];

export const StudentCheckInAndRecovery: React.FC<StudentCheckInAndRecoveryProps> = ({
  activeCheckIn,
  onSaveCheckIn,
  onLogStudySessionCompleted,
  onLogBreakTaken,
  onNavigateSubTab,
}) => {
  // Draft form state initialized from activeCheckIn
  const [returnHomeTime, setReturnHomeTime] = useState(activeCheckIn.returnHomeTime);
  const [tirednessLevel, setTirednessLevel] = useState(activeCheckIn.tirednessLevel);
  const [stressLevel, setStressLevel] = useState(activeCheckIn.stressLevel);
  const [eatenSinceSchool, setEatenSinceSchool] = useState(activeCheckIn.eatenSinceSchool);
  const [waterSinceSchool, setWaterSinceSchool] = useState(activeCheckIn.waterSinceSchool);
  const [sleepHoursText, setSleepHoursText] = useState(String(activeCheckIn.sleepHoursLastNight));
  const [academicWorkload, setAcademicWorkload] = useState<AcademicObligation>(
    activeCheckIn.academicWorkload
  );
  const [freeTimeText, setFreeTimeText] = useState(String(activeCheckIn.freeTimeMinutes));
  const [botheringOptions, setBotheringOptions] = useState<string[]>(
    activeCheckIn.botheringOptions
  );
  const [ownWordsSituation, setOwnWordsSituation] = useState(activeCheckIn.ownWordsSituation);
  const [dietaryPreference, setDietaryPreference] = useState(activeCheckIn.dietaryPreference);
  const [allergies, setAllergies] = useState<string[]>(activeCheckIn.allergies);
  const [hotWeatherOrSport, setHotWeatherOrSport] = useState(activeCheckIn.hotWeatherOrSport);
  const [subjectToWorkOn, setSubjectToWorkOn] = useState(activeCheckIn.subjectToWorkOn);
  const [formError, setFormError] = useState<string>('');
  const [planUpdatedNotice, setPlanUpdatedNotice] = useState<boolean>(false);

  // Sync draft when switching demo/real check-in externally
  useEffect(() => {
    setReturnHomeTime(activeCheckIn.returnHomeTime);
    setTirednessLevel(activeCheckIn.tirednessLevel);
    setStressLevel(activeCheckIn.stressLevel);
    setEatenSinceSchool(activeCheckIn.eatenSinceSchool);
    setWaterSinceSchool(activeCheckIn.waterSinceSchool);
    setSleepHoursText(String(activeCheckIn.sleepHoursLastNight));
    setAcademicWorkload(activeCheckIn.academicWorkload);
    setFreeTimeText(String(activeCheckIn.freeTimeMinutes));
    setBotheringOptions(activeCheckIn.botheringOptions);
    setOwnWordsSituation(activeCheckIn.ownWordsSituation);
    setDietaryPreference(activeCheckIn.dietaryPreference);
    setAllergies(activeCheckIn.allergies);
    setHotWeatherOrSport(activeCheckIn.hotWeatherOrSport);
    setSubjectToWorkOn(activeCheckIn.subjectToWorkOn);
  }, [activeCheckIn.id]);

  // Derived recovery plan from committed check-in
  const recoveryPlan = generateAfterSchoolRecoveryPlan(activeCheckIn);

  // Interactive Homework Checklist state
  const [checklist, setChecklist] = useState<HomeworkTaskItem[]>(
    recoveryPlan.studyReadiness.suggestedChecklist
  );
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    setChecklist(generateAfterSchoolRecoveryPlan(activeCheckIn).studyReadiness.suggestedChecklist);
  }, [
    activeCheckIn.id,
    activeCheckIn.timestamp,
    activeCheckIn.academicWorkload,
    activeCheckIn.subjectToWorkOn,
    activeCheckIn.freeTimeMinutes,
  ]);

  // Interactive Guided Breathing Timer (4s inhale - 4s hold - 6s exhale)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingTick, setBreathingTick] = useState(0);

  useEffect(() => {
    if (!breathingActive) {
      setBreathingTick(0);
      return;
    }
    const interval = window.setInterval(() => {
      setBreathingTick((prev) => {
        if (prev >= 41) {
          // 3 rounds of 14 seconds = 42 ticks
          setBreathingActive(false);
          onLogBreakTaken();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [breathingActive, onLogBreakTaken]);

  const getBreathingPhaseLabel = () => {
    const cycleSecond = breathingTick % 14;
    const round = Math.floor(breathingTick / 14) + 1;
    if (cycleSecond < 4) {
      return `Round ${round}/3 · Breathe In Gently (${4 - cycleSecond}s)`;
    }
    if (cycleSecond < 8) {
      return `Round ${round}/3 · Hold Softly (${8 - cycleSecond}s)`;
    }
    return `Round ${round}/3 · Slow Exhale (${14 - cycleSecond}s)`;
  };

  const toggleBothering = (option: string) => {
    setBotheringOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleSubmitCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSleep = Number(sleepHoursText);
    const parsedFreeTime = Number(freeTimeText);

    if (!returnHomeTime || !returnHomeTime.includes(':')) {
      setFormError('Please enter the time you returned home from school.');
      return;
    }
    if (sleepHoursText.trim() === '' || Number.isNaN(parsedSleep) || parsedSleep < 0 || parsedSleep > 16) {
      setFormError('Please enter a realistic sleep duration between 0 and 16 hours.');
      return;
    }
    if (freeTimeText.trim() === '' || Number.isNaN(parsedFreeTime) || parsedFreeTime < 5 || parsedFreeTime > 600) {
      setFormError('Please enter available free time between 5 and 600 minutes.');
      return;
    }

    setFormError('');
    const now = new Date();
    const updated: StudentDailyCheckIn = {
      id: `student-ci-${now.getTime()}`,
      timestamp: now.toISOString(),
      dateLabel: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      returnHomeTime,
      tirednessLevel,
      stressLevel,
      eatenSinceSchool,
      waterSinceSchool,
      sleepHoursLastNight: parsedSleep,
      academicWorkload,
      freeTimeMinutes: parsedFreeTime,
      botheringOptions,
      ownWordsSituation: ownWordsSituation.trim(),
      dietaryPreference,
      allergies,
      hotWeatherOrSport,
      subjectToWorkOn: subjectToWorkOn.trim() || 'Core Homework',
      isDemo: false,
    };

    onSaveCheckIn(updated);
    setPlanUpdatedNotice(true);
    window.setTimeout(() => setPlanUpdatedNotice(false), 4000);
  };

  const handleToggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          if (nextCompleted) {
            onLogStudySessionCompleted();
          }
          return { ...item, completed: nextCompleted };
        }
        return item;
      })
    );
  };

  const handleAddChecklistTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) return;
    setChecklist((prev) => [
      ...prev,
      {
        id: `hw-custom-${Date.now()}`,
        subject: subjectToWorkOn.trim() || 'Schoolwork',
        task: trimmed,
        urgency: 'due_tomorrow',
        difficulty: 'medium',
        estimatedMinutes: 20,
        completed: false,
      },
    ]);
    setNewTaskTitle('');
  };

  const completedTasksCount = checklist.filter((t) => t.completed).length;

  return (
    <div className="space-y-8">
      {/* 1. STUDENT DAILY CHECK-IN */}
      <section
        aria-labelledby="student-checkin-heading"
        className="hm-card rounded-2xl p-6 sm:p-8"
      >
        <div className="mb-6">
          <div className="text-xs font-medium text-[#667085]">
            01. Student Daily Check-In · Takes under 1 minute
          </div>
          <h3 id="student-checkin-heading" className="text-2xl font-bold text-[#172033] mt-1">
            How is your afternoon going after school?
          </h3>
          <p className="text-sm text-[#667085] mt-1 max-w-2xl">
            Share only what feels comfortable. Your answers shape a calm, practical recovery and homework plan tailored to your real energy right now.
          </p>
        </div>

        <form onSubmit={handleSubmitCheckIn} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
            <div>
              <label
                htmlFor="student-return-time"
                className="block text-xs font-semibold text-[#172033] mb-1.5"
              >
                What time did you return home?
              </label>
              <input
                id="student-return-time"
                type="time"
                value={returnHomeTime}
                onChange={(e) => setReturnHomeTime(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="student-sleep-hours"
                className="block text-xs font-semibold text-[#172033] mb-1.5"
              >
                Hours slept last night
              </label>
              <input
                id="student-sleep-hours"
                type="number"
                step="0.5"
                min="0"
                max="16"
                value={sleepHoursText}
                onChange={(e) => setSleepHoursText(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="student-free-time"
                className="block text-xs font-semibold text-[#172033] mb-1.5"
              >
                Free time available (mins)
              </label>
              <input
                id="student-free-time"
                type="number"
                step="5"
                min="5"
                max="600"
                value={freeTimeText}
                onChange={(e) => setFreeTimeText(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="student-academic-workload"
                className="block text-xs font-semibold text-[#172033] mb-1.5"
              >
                Homework, test, or exam?
              </label>
              <select
                id="student-academic-workload"
                value={academicWorkload}
                onChange={(e) => setAcademicWorkload(e.target.value as AcademicObligation)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="homework">Regular Homework</option>
                <option value="upcoming_test">Upcoming Class Test / Quiz</option>
                <option value="major_exam">Major Exam Preparation</option>
                <option value="homework_and_exam">Both Homework & Upcoming Exam</option>
                <option value="none">No Homework Today</option>
              </select>
            </div>
          </div>

          {/* Sliders for Tiredness & Stress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="student-tiredness-range" className="text-xs font-semibold text-[#172033]">
                  How tired do you feel right now? (1 = Fresh, 10 = Exhausted)
                </label>
                <span className="text-sm font-bold text-[#101828] font-mono tabular-nums">
                  {tirednessLevel}/10
                </span>
              </div>
              <input
                id="student-tiredness-range"
                type="range"
                min={1}
                max={10}
                value={tirednessLevel}
                onChange={(e) => setTirednessLevel(Number(e.target.value))}
                className="w-full accent-[#101828] cursor-pointer"
              />
            </div>

            <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="student-stress-range" className="text-xs font-semibold text-[#172033]">
                  How stressed do you feel? (1 = Calm, 10 = Very Overwhelmed)
                </label>
                <span className="text-sm font-bold text-[#101828] font-mono tabular-nums">
                  {stressLevel}/10
                </span>
              </div>
              <input
                id="student-stress-range"
                type="range"
                min={1}
                max={10}
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full accent-[#101828] cursor-pointer"
              />
            </div>
          </div>

          {/* Food, Water, Diet & Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-[#E4E7EC]">
            <div>
              <label htmlFor="student-eaten-select" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Eaten anything since school?
              </label>
              <select
                id="student-eaten-select"
                value={eatenSinceSchool}
                onChange={(e) =>
                  setEatenSinceSchool(e.target.value as StudentDailyCheckIn['eatenSinceSchool'])
                }
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="no">No, not yet</option>
                <option value="yes_snack">Yes, a light snack</option>
                <option value="yes_meal">Yes, a proper meal</option>
              </select>
            </div>

            <div>
              <label htmlFor="student-water-select" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Had any water since school?
              </label>
              <select
                id="student-water-select"
                value={waterSinceSchool}
                onChange={(e) =>
                  setWaterSinceSchool(e.target.value as StudentDailyCheckIn['waterSinceSchool'])
                }
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="no">No, not yet</option>
                <option value="a_little">Just a few sips</option>
                <option value="yes">Yes, had water</option>
              </select>
            </div>

            <div>
              <label htmlFor="student-diet-select" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Food preference (optional)
              </label>
              <select
                id="student-diet-select"
                value={dietaryPreference}
                onChange={(e) =>
                  setDietaryPreference(
                    e.target.value as StudentDailyCheckIn['dietaryPreference']
                  )
                }
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="vegetarian">Vegetarian</option>
                <option value="eggetarian">Eggetarian</option>
                <option value="omnivore">Omnivore (All foods)</option>
                <option value="halal">Halal</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>

            <div>
              <label htmlFor="student-subject-input" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Main subject today (optional)
              </label>
              <input
                id="student-subject-input"
                type="text"
                value={subjectToWorkOn}
                onChange={(e) => setSubjectToWorkOn(e.target.value)}
                placeholder="e.g. Mathematics, Biology"
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {/* Allergies & Warm Weather / Sports */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div>
              <span className="block text-xs font-semibold text-[#172033] mb-2">
                Any food allergies to exclude? (optional)
              </span>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((al) => {
                  const active = allergies.includes(al);
                  return (
                    <button
                      key={al}
                      type="button"
                      onClick={() => toggleAllergy(al)}
                      aria-pressed={active}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition capitalize ${
                        active
                          ? 'bg-[#101828] text-[#55E6A5] border-[#101828]'
                          : 'bg-[#F5F7FB] text-[#172033] border-[#E4E7EC] hover:border-slate-400'
                      }`}
                    >
                      {al}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 text-sm text-[#172033] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hotWeatherOrSport}
                onChange={(e) => setHotWeatherOrSport(e.target.checked)}
                className="w-4 h-4 accent-[#101828] rounded"
              />
              <span>Warm weather or PE / sports activity today</span>
            </label>
          </div>

          {/* Multi-select What is bothering you most right now? */}
          <div className="pt-4 border-t border-[#E4E7EC]">
            <span className="block text-xs font-semibold text-[#172033] mb-2.5">
              What is bothering you most right now? (Select all that apply)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {STUDENT_BOTHERING_OPTIONS.map((option) => {
                const selected = botheringOptions.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleBothering(option)}
                    aria-pressed={selected}
                    className={`text-left px-3.5 py-2.5 rounded-xl text-sm border transition flex items-center justify-between gap-2 ${
                      selected
                        ? 'bg-[#18243A] text-white border-[#18243A] font-medium shadow-xs'
                        : 'bg-[#F5F7FB] text-[#172033] border-[#E4E7EC] hover:border-slate-300'
                    }`}
                  >
                    <span>{option}</span>
                    {selected ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#55E6A5]" />
                    ) : (
                      <Circle className="w-4 h-4 shrink-0 text-[#667085]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Own words */}
          <div>
            <label
              htmlFor="student-own-words"
              className="block text-xs font-semibold text-[#172033] mb-1.5"
            >
              Describe your situation in your own words (optional)
            </label>
            <textarea
              id="student-own-words"
              rows={2}
              value={ownWordsSituation}
              onChange={(e) => setOwnWordsSituation(e.target.value)}
              placeholder="Example: Had double Chemistry lab today, feeling sleepy and worried about finishing Maths exercises before dinner..."
              className="w-full hm-input rounded-xl px-4 py-2.5 text-sm"
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-rose-700 font-medium">
              {formError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-sm px-6 py-3 rounded-xl transition shadow-xs"
            >
              Generate My After-School Recovery Plan
            </button>

            {planUpdatedNotice && (
              <span role="status" className="text-sm font-semibold text-[#0F766E]">
                Recovery plan updated from your check-in below.
              </span>
            )}
          </div>
        </form>
      </section>

      {/* SAFETY ALERT BANNER IF NEEDED */}
      {recoveryPlan.safetyAlert.level !== 'supportive' && (
        <section
          role="alert"
          className={`rounded-2xl p-6 border ${
            recoveryPlan.safetyAlert.level === 'emergency'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="text-lg font-bold">{recoveryPlan.safetyAlert.headline}</h4>
              <p className="text-sm leading-relaxed">{recoveryPlan.safetyAlert.message}</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {recoveryPlan.safetyAlert.actionItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 2. PERSONALIZED AFTER-SCHOOL RECOVERY PLAN */}
      <section aria-labelledby="recovery-plan-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-[#667085] tabular-nums">
              02. Personalized After-School Recovery Plan · Returned {activeCheckIn.returnHomeTime} · Tiredness {activeCheckIn.tirednessLevel}/10 · Stress {activeCheckIn.stressLevel}/10
            </div>
            <h3 id="recovery-plan-heading" className="text-2xl font-bold text-[#172033] mt-1">
              Your Step-by-Step Afternoon Reset
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSubTab('routine')}
            className="text-sm font-semibold text-[#0F766E] hover:text-[#101828] hover:underline inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            Turn this into a timed evening schedule
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grid of A, B, C */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* A. Recover Your Energy */}
          <div className="hm-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs text-[#0F766E] font-semibold tabular-nums">
                A. Recover Your Energy · {recoveryPlan.energyRecovery.restDurationMinutes} min reset
              </div>
              <h4 className="text-lg font-bold text-[#172033]">Rest & Gentle Transition</h4>
              <p className="text-sm text-[#172033]/90 leading-relaxed">
                {recoveryPlan.energyRecovery.restSuggestion}
              </p>
              <div className="pt-3 border-t border-[#E4E7EC] text-sm text-[#172033]/90 space-y-2">
                <p>
                  <strong className="text-[#172033]">Light movement:</strong> {recoveryPlan.energyRecovery.movementSuggestion}
                </p>
                <p>
                  <strong className="text-[#172033]">Desk transition:</strong> {recoveryPlan.energyRecovery.transitionTip}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#667085] pt-3 border-t border-[#E4E7EC]">
              {recoveryPlan.energyRecovery.cautionNote}
            </p>
          </div>

          {/* B. What Should I Eat? */}
          <div className="hm-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs text-[#0F766E] font-semibold">
                B. What Should I Eat? · {activeCheckIn.dietaryPreference}
              </div>
              <h4 className="text-lg font-bold text-[#172033]">Simple, Familiar Brain Fuel</h4>
              <p className="text-sm text-[#172033]/90 leading-relaxed">
                {recoveryPlan.foodGuidance.statusSummary}
              </p>
              <div className="pt-2 border-t border-[#E4E7EC] divide-y divide-[#E4E7EC]">
                {recoveryPlan.foodGuidance.recommendedOptions.map((food, idx) => (
                  <div key={idx} className="py-2.5 first:pt-1 last:pb-0">
                    <div className="text-sm font-semibold text-[#172033]">{food.name}</div>
                    <div className="text-xs text-[#667085] mt-0.5">{food.ingredients}</div>
                    <div className="text-xs text-[#0F766E] font-medium mt-1">{food.whyItHelps}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-[#667085] pt-3 border-t border-[#E4E7EC]">
              {recoveryPlan.foodGuidance.reassuranceNote}
            </p>
          </div>

          {/* C. Hydration Assistant */}
          <div className="hm-card rounded-2xl p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs text-[#0E7490] font-semibold">
                C. Hydration Assistant · Thirst-Led Balance
              </div>
              <h4 className="text-lg font-bold text-[#172033]">Refresh Without Overdoing It</h4>
              <p className="text-sm font-medium text-[#172033] bg-[#64D9F5]/12 border border-[#64D9F5]/30 rounded-xl p-3.5">
                {recoveryPlan.hydrationGuidance.promptQuestion}
              </p>
              <p className="text-sm text-[#172033]/90 leading-relaxed">
                {recoveryPlan.hydrationGuidance.mainAdvice}
              </p>
              <p className="text-sm text-[#667085] leading-relaxed pt-2 border-t border-[#E4E7EC]">
                {recoveryPlan.hydrationGuidance.contextAdjustment}
              </p>
            </div>
            <p className="text-xs text-[#667085] pt-3 border-t border-[#E4E7EC]">
              {recoveryPlan.hydrationGuidance.balanceReminder}
            </p>
          </div>
        </div>

        {/* Grid of D (Stress Relief) & E (Study Readiness) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* D. Stress Relief */}
          <div className="lg:col-span-5 hm-card rounded-2xl p-6 space-y-4">
            <div className="text-xs text-[#0F766E] font-semibold">
              D. Stress Relief · Calm Your Nervous System
            </div>
            <h4 className="text-lg font-bold text-[#172033]">Guided Breathing & Small Steps</h4>
            <p className="text-sm text-[#172033]/90 leading-relaxed">
              {recoveryPlan.stressRelief.encouragingOpening}
            </p>

            {/* Interactive Breathing Exercise */}
            <div className="bg-[#101828] text-white rounded-xl p-4 space-y-3 border border-[#18243A]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Wind className="w-4 h-4 text-[#64D9F5]" />
                  <span>{recoveryPlan.stressRelief.breathingPattern.label}</span>
                </div>
              </div>

              {breathingActive ? (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-sm font-bold text-[#55E6A5] tabular-nums">
                    {getBreathingPhaseLabel()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBreathingActive(false)}
                    className="bg-[#18243A] hover:bg-slate-700 text-white border border-white/15 text-xs font-semibold px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5" />
                    Stop
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setBreathingActive(true)}
                  className="bg-[#55E6A5] hover:bg-[#55E6A5]/90 text-[#101828] text-xs font-bold px-4 py-2.5 rounded-lg inline-flex items-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start 42-Second Calm Breathing
                </button>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E4E7EC]">
              <div className="text-xs font-semibold text-[#172033]">10-Minute Calming Ideas:</div>
              <ul className="space-y-1.5 text-sm text-[#172033]/90 list-disc pl-5">
                {recoveryPlan.stressRelief.calmingOptions.map((opt, idx) => (
                  <li key={idx}>{opt}</li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-[#667085] pt-2 border-t border-[#E4E7EC]">
              <strong className="text-[#172033]">Task un-freezer:</strong> {recoveryPlan.stressRelief.microStepAdvice}
            </p>
            {recoveryPlan.stressRelief.trustedAdultNote && (
              <p className="text-xs text-amber-900 font-medium">
                {recoveryPlan.stressRelief.trustedAdultNote}
              </p>
            )}
          </div>

          {/* E. Study Readiness */}
          <div className="lg:col-span-7 hm-card rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-[#0F766E] font-semibold tabular-nums">
                  E. Study Readiness · {recoveryPlan.studyReadiness.recommendedSessionMinutes}m Focus / {recoveryPlan.studyReadiness.recommendedBreakMinutes}m Break
                </div>
                <h4 className="text-lg font-bold text-[#172033] mt-0.5">
                  Manageable Homework & Revision Checklist
                </h4>
              </div>
              <span className="text-xs font-mono text-[#667085] tabular-nums">
                {completedTasksCount}/{checklist.length} done
              </span>
            </div>

            <p className="text-sm text-[#172033]/90 leading-relaxed">
              {recoveryPlan.studyReadiness.prioritizationAdvice}
            </p>

            {/* Interactive Checklist */}
            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleChecklistItem(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition flex items-start gap-3 ${
                    item.completed
                      ? 'bg-[#55E6A5]/12 border-[#55E6A5]/50 text-[#667085] line-through'
                      : 'bg-[#F5F7FB] border-[#E4E7EC] text-[#172033] hover:border-slate-300'
                  }`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#667085] shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{item.task}</div>
                    <div className="text-xs text-[#667085] mt-0.5 tabular-nums">
                      {item.subject} · {item.estimatedMinutes} mins · {item.difficulty} effort
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Add custom homework item */}
            <form onSubmit={handleAddChecklistTask} className="flex gap-2 pt-1">
              <label htmlFor="add-student-hw-input" className="sr-only">
                Add a homework task
              </label>
              <input
                id="add-student-hw-input"
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add another small homework task (e.g. Read History page 42)..."
                className="flex-1 hm-input rounded-xl px-3.5 py-2 text-sm"
              />
              <button
                type="submit"
                className="bg-[#18243A] hover:bg-[#101828] text-white text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition shrink-0"
              >
                <Plus className="w-4 h-4 text-[#55E6A5]" />
                Add Task
              </button>
            </form>

            <p className="text-xs text-[#172033] bg-[#55E6A5]/12 border border-[#55E6A5]/30 rounded-xl p-3.5">
              <strong>Sleep Protection:</strong> {recoveryPlan.studyReadiness.sleepProtectionNote}
            </p>
          </div>
        </div>
      </section>

      {/* HealthMate AI Custom Opinion Helper */}
      <HealthMateAiOpinionBox
        sectionTitle="After-School Recovery"
        promptPlaceholder="Ask HealthMate AI about your specific afternoon situation (e.g. 'I have choir practice and a sore throat, how should I pace tonight?')..."
        recentCheckIn={activeCheckIn}
        contextData={{
          returnHomeTime: activeCheckIn.returnHomeTime,
          tirednessLevel: activeCheckIn.tirednessLevel,
          stressLevel: activeCheckIn.stressLevel,
          sleepHoursLastNight: activeCheckIn.sleepHoursLastNight,
          eatenSinceSchool: activeCheckIn.eatenSinceSchool,
          dietaryPreference: activeCheckIn.dietaryPreference,
          allergies: activeCheckIn.allergies,
        }}
      />
    </div>
  );
};
