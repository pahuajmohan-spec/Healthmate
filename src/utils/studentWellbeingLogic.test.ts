/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateStudentSafety,
  generateAfterSchoolRecoveryPlan,
  generateAfterSchoolSchedule,
  generateExamRescuePlan,
  getSchoolDayFuelSuggestions,
  generateFallbackCoachResponse,
  analyzeStudentWeeklyProgress,
  computeStudentBadges,
  DEFAULT_SMALL_WINS_POOL,
} from './studentWellbeingLogic';
import { StudentDailyCheckIn, StudentDailyActivityLog } from '../types/studentWellbeing';

test('evaluateStudentSafety flags acute emergency phrases immediately', () => {
  const emergency = evaluateStudentSafety('I cannot breathe and have severe chest pain', [], 8, 7);
  assert.equal(emergency.level, 'emergency');
  assert.ok(emergency.actionItems.some((a) => a.includes('911') || a.includes('112')));
});

test('evaluateStudentSafety recommends trusted adult & healthcare check for ongoing/high distress', () => {
  const ongoing = evaluateStudentSafety('I have a constant headache every day', ['I have a headache.'], 8, 9);
  assert.equal(ongoing.level, 'ongoing_concern');
  assert.ok(ongoing.message.toLowerCase().includes('healthcare professional') || ongoing.message.toLowerCase().includes('doctor'));
});

test('generateAfterSchoolRecoveryPlan creates 5-part plan respecting allergies and avoiding diet/caffeine advice', () => {
  const checkIn: StudentDailyCheckIn = {
    id: 'ci-1',
    timestamp: '2026-10-24T15:00:00Z',
    dateLabel: 'Oct 24, 2026',
    returnHomeTime: '14:30',
    tirednessLevel: 8,
    stressLevel: 7,
    eatenSinceSchool: 'no',
    waterSinceSchool: 'no',
    sleepHoursLastNight: 6,
    academicWorkload: 'homework_and_exam',
    freeTimeMinutes: 90,
    botheringOptions: ['I feel exhausted.', 'I am hungry.', 'I have an upcoming exam.'],
    ownWordsSituation: 'Tired after maths & science classes',
    dietaryPreference: 'vegetarian',
    allergies: ['nuts', 'dairy'],
    hotWeatherOrSport: true,
    subjectToWorkOn: 'Mathematics',
  };

  const plan = generateAfterSchoolRecoveryPlan(checkIn);
  assert.equal(plan.energyRecovery.restDurationMinutes, 25);
  assert.ok(plan.energyRecovery.cautionNote.toLowerCase().includes('coffee'));
  // Ensure no nut or dairy recipes slipped into food options
  for (const food of plan.foodGuidance.recommendedOptions) {
    assert.ok(!food.ingredients.toLowerCase().includes('almonds'));
    assert.ok(!food.ingredients.toLowerCase().includes('1 cup milk'));
  }
  assert.ok(plan.hydrationGuidance.contextAdjustment.toLowerCase().includes('warm weather'));
  assert.ok(plan.studyReadiness.suggestedChecklist.length >= 2);
});

test('generateAfterSchoolSchedule calculates dynamic times from student arrival & bedtime', () => {
  const slots = generateAfterSchoolSchedule({
    schoolFinishTime: '14:00',
    arrivalHomeTime: '14:30',
    homeworkWorkload: 'moderate',
    upcomingTestInfo: 'Physics Quiz',
    tuitionOrExtracurricular: 'Badminton Coaching',
    tuitionStartTime: '17:00',
    tuitionDurationMinutes: 60,
    preferredRestMinutes: 20,
    dinnerTime: '20:00',
    bedtime: '22:00',
    availableStudyHours: 1.5,
    isExhausted: true,
  });

  assert.ok(slots.length >= 5);
  assert.equal(slots[0].startTime, '2:30 PM');
  assert.equal(slots[0].endTime, '2:45 PM');
  assert.equal(slots[1].startTime, '2:45 PM');
  assert.equal(slots[1].endTime, '3:05 PM');
  assert.ok(slots.some((s) => s.category === 'study'));
  assert.ok(slots.some((s) => s.category === 'sleep'));
});

test('generateExamRescuePlan supports 30-minute sprint and Exam Tomorrow without all-nighters', () => {
  const sprint30 = generateExamRescuePlan({
    subject: 'Chemistry',
    deadlineLabel: 'Tomorrow',
    remainingWork: 'Periodic table trends',
    availableMinutesToday: 30,
    biggestDifficulty: 'remembering_info',
    quickMode: 'only_30_min',
  });
  const total30 = sprint30.steps.reduce((acc, s) => acc + s.durationMinutes, 0);
  assert.equal(total30, 30);

  const examTmw = generateExamRescuePlan({
    subject: 'History',
    deadlineLabel: 'Tomorrow morning',
    remainingWork: '4 chapters',
    availableMinutesToday: 90,
    biggestDifficulty: 'time_management',
    quickMode: 'exam_tomorrow',
  });
  assert.ok(examTmw.sleepBoundaryMessage.toLowerCase().includes('all-nighter'));
  assert.ok(examTmw.wellbeingReassurance.length > 20);
});

test('getSchoolDayFuelSuggestions filters dietary preferences & flags unusual pantry items for AI help', () => {
  const matched = getSchoolDayFuelSuggestions({
    situation: 'after_school',
    dietaryPreference: 'eggetarian',
    allergies: [],
    availableFoodsText: 'eggs, roti, cucumber',
    portionNeed: 'full_meal',
  });
  assert.equal(matched.matchedFromPantry, true);
  assert.equal(matched.needsAiCustomHelp, false);

  const customUnmatched = getSchoolDayFuelSuggestions({
    situation: 'before_studying',
    dietaryPreference: 'vegan',
    allergies: ['gluten'],
    availableFoodsText: 'avocado, rice cakes, edamame',
    portionNeed: 'quick_snack',
  });
  assert.equal(customUnmatched.needsAiCustomHelp, true);
});

test('generateFallbackCoachResponse returns honest rules_engine source with follow-up and action steps', () => {
  const reply = generateFallbackCoachResponse('I have a maths test tomorrow and cannot concentrate.');
  assert.equal(reply.source, 'rules_engine');
  assert.equal(reply.easiestFirstPrompt, true);
  assert.ok((reply.actionSteps?.length || 0) >= 3);
});

test('analyzeStudentWeeklyProgress compares two weeks supportively and computes badges', () => {
  const logs: StudentDailyActivityLog[] = [
    {
      id: 'p1',
      dateISO: '2026-10-14',
      dateLabel: 'Wed Oct 14',
      weekKey: 'Previous Week',
      energyLevel: 4,
      stressLevel: 8,
      sleepHours: 6.5,
      studySessionsCompleted: 2,
      breaksTaken: 1,
      checkInCompleted: true,
      goalsCompleted: 1,
    },
    {
      id: 'p2',
      dateISO: '2026-10-15',
      dateLabel: 'Thu Oct 15',
      weekKey: 'Previous Week',
      energyLevel: 5,
      stressLevel: 7,
      sleepHours: 6.5,
      studySessionsCompleted: 2,
      breaksTaken: 1,
      checkInCompleted: true,
      goalsCompleted: 2,
    },
    {
      id: 'c1',
      dateISO: '2026-10-21',
      dateLabel: 'Wed Oct 21',
      weekKey: 'Current Week',
      energyLevel: 7,
      stressLevel: 5,
      sleepHours: 8.0,
      studySessionsCompleted: 3,
      breaksTaken: 3,
      checkInCompleted: true,
      goalsCompleted: 3,
    },
    {
      id: 'c2',
      dateISO: '2026-10-22',
      dateLabel: 'Thu Oct 22',
      weekKey: 'Current Week',
      energyLevel: 7,
      stressLevel: 5,
      sleepHours: 8.0,
      studySessionsCompleted: 2,
      breaksTaken: 2,
      checkInCompleted: true,
      goalsCompleted: 2,
    },
  ];

  const summary = analyzeStudentWeeklyProgress(logs);
  assert.equal(summary.hasPreviousWeekComparison, true);
  assert.equal(summary.currentAvgSleep, 8);
  assert.ok(summary.habitObservations.some((o) => o.includes('+1.5 hrs')));

  const wins = DEFAULT_SMALL_WINS_POOL.map((w, idx) => ({ ...w, completed: idx < 3 }));
  const badges = computeStudentBadges(wins, logs);
  assert.ok(badges.some((b) => b.id === 'badge-small-steps' && b.earned));
});
