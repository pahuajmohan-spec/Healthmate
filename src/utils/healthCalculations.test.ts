/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHealthScore,
  compareThenVsNow,
  screenRedFlags,
  generate7DayPlan,
  analyzeFoodItem,
} from './healthCalculations';
import { HealthCheckInRecord, UserProfile } from '../types/health';

test('calculateHealthScore yields valid transparent score breakdown', () => {
  const mockRecord: HealthCheckInRecord = {
    id: 'test-1',
    timestamp: '2026-10-15T08:00:00Z',
    dateLabel: 'Oct 15, 2026',
    weekLabel: 'Week 1',
    sleepHours: 8,
    sleepQuality: 4,
    activeMinutes: 45,
    hydrationLiters: 2.2,
    stressLevel: 2,
    moodScore: 4,
  };

  const result = calculateHealthScore(mockRecord, '18_29');
  assert.ok(result.overallScore >= 0 && result.overallScore <= 100);
  assert.ok(result.sleepScore <= 25);
  assert.ok(result.hydrationScore <= 25);
  assert.ok(result.activityScore <= 25);
  assert.ok(result.moodScore <= 25);
  assert.equal(
    result.overallScore,
    result.sleepScore + result.hydrationScore + result.activityScore + result.moodScore
  );
  assert.match(result.medicalDisclaimer, /IMPORTANT DISCLAIMER/i);
});

test('calculateHealthScore adapts target sleep for youth under 18', () => {
  const youthRecord: HealthCheckInRecord = {
    id: 'youth-1',
    timestamp: '2026-10-15T08:00:00Z',
    dateLabel: 'Oct 15, 2026',
    weekLabel: 'Week 1',
    sleepHours: 7.0, // 7.0 hrs is slightly short for youth (target is 8.5-10)
    sleepQuality: 3,
    activeMinutes: 30,
    hydrationLiters: 2.0,
    stressLevel: 2,
    moodScore: 3,
  };

  const youthScore = calculateHealthScore(youthRecord, 'under_18');
  assert.ok(youthScore.sleepExplanation.includes('8.5–10 hrs for young people'));
});

test('compareThenVsNow handles insufficient data when previous record is missing', () => {
  const currentRecord: HealthCheckInRecord = {
    id: 'cur-1',
    timestamp: '2026-10-21T08:00:00Z',
    dateLabel: 'Oct 21, 2026',
    weekLabel: 'Week 2',
    sleepHours: 8,
    sleepQuality: 4,
    activeMinutes: 45,
    hydrationLiters: 2.5,
    stressLevel: 2,
    moodScore: 4,
  };

  const analysis = compareThenVsNow(null, currentRecord);
  assert.ok(analysis.insufficientDataReason);
  assert.equal(analysis.deltas.length, 0);
  assert.match(analysis.insufficientDataReason, /Insufficient historical data/i);
});

test('compareThenVsNow correctly detects improvements, declines, and stability', () => {
  const prevRecord: HealthCheckInRecord = {
    id: 'prev-1',
    timestamp: '2026-10-07T08:00:00Z',
    dateLabel: 'Oct 7, 2026',
    weekLabel: 'Week 1',
    sleepHours: 6.0,
    sleepQuality: 2,
    activeMinutes: 20,
    hydrationLiters: 1.5,
    stressLevel: 4,
    moodScore: 2,
  };

  const currRecord: HealthCheckInRecord = {
    id: 'curr-1',
    timestamp: '2026-10-21T08:00:00Z',
    dateLabel: 'Oct 21, 2026',
    weekLabel: 'Week 3',
    sleepHours: 8.0, // improved (+2.0 hrs)
    sleepQuality: 4, // improved
    activeMinutes: 21, // stable (within 10%)
    hydrationLiters: 2.2, // improved
    stressLevel: 2, // improved (lower is better)
    moodScore: 4, // improved
  };

  const analysis = compareThenVsNow(prevRecord, currRecord);
  assert.equal(analysis.insufficientDataReason, undefined);
  assert.ok(analysis.positiveHighlights.length > 0);

  const sleepDelta = analysis.deltas.find((d) => d.metricKey === 'sleepHours');
  assert.ok(sleepDelta);
  assert.equal(sleepDelta.difference, 2.0);
  assert.equal(sleepDelta.status, 'positive');
  assert.equal(sleepDelta.percentageChange, 33);

  const stressDelta = analysis.deltas.find((d) => d.metricKey === 'stressLevel');
  assert.ok(stressDelta);
  assert.equal(stressDelta.difference, -2);
  assert.equal(stressDelta.status, 'positive'); // lower stress is positive
});

test('screenRedFlags identifies emergency symptoms immediately', () => {
  const result = screenRedFlags(['Severe crushing chest pain and shortness of breath']);
  assert.equal(result.isUrgent, true);
  assert.equal(result.severity, 'emergency');
  assert.equal(result.recommendedCareLevel, 'emergency_services');
  assert.ok(result.immediateActions.length > 0);
  assert.ok(result.immediateActions[0].includes('emergency'));
});

test('screenRedFlags identifies hypertensive crisis in vitals', () => {
  const result = screenRedFlags([], { systolicBP: 195, diastolicBP: 110 });
  assert.equal(result.isUrgent, true);
  assert.equal(result.severity, 'emergency');
  assert.ok(result.vitalsWarning?.includes('Hypertensive Crisis'));
});

test('screenRedFlags approves normal lifestyle inputs', () => {
  const result = screenRedFlags([], { systolicBP: 118, diastolicBP: 76 });
  assert.equal(result.isUrgent, false);
  assert.equal(result.severity, 'normal');
});

test('generate7DayPlan creates 7 actionable tasks respecting minor safety', () => {
  const mockProfile: UserProfile = {
    id: 'user-minor',
    createdAt: '2026-10-21',
    updatedAt: '2026-10-21',
    ageGroup: 'under_18',
    mainGoal: 'improve_sleep',
    dailyRoutine: 'student_schedule',
    foodPreferences: ['Vegetarian'],
    foodAllergies: ['Peanuts'],
    existingConditions: [],
    currentSymptoms: [],
    receivingMedicalCare: 'no',
    consentGiven: true,
  };

  const plan = generate7DayPlan(mockProfile);
  assert.equal(plan.length, 7);
  // Ensure tasks do not mention extreme dieting or supplements
  plan.forEach((task) => {
    assert.ok(!task.description.toLowerCase().includes('diet pill'));
    assert.ok(!task.description.toLowerCase().includes('calorie restriction'));
  });
});

test('analyzeFoodItem identifies allergens and delivers non-moralizing tone', () => {
  const result = analyzeFoodItem('Lentil Curry (Dal) with Brown Basmati Rice', ['Legumes'], 'under_18');
  assert.ok(result.allergyWarnings.some((w) => w.includes('reported allergen: Legumes')));
  assert.ok(result.nonMoralizingPhilosophy.length > 10);
  // Check no "guilt" or "bad food" labels
  assert.ok(!result.nonMoralizingPhilosophy.includes('bad'));
});
