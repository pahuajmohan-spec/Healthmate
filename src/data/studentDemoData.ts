/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ScheduleSlot,
  SmallWinChallenge,
  StudentDailyActivityLog,
  StudentDailyCheckIn,
} from '../types/studentWellbeing';
import { DEFAULT_SMALL_WINS_POOL, generateAfterSchoolSchedule } from '../utils/studentWellbeingLogic';

export const FICTIONAL_STUDENT_DEMO_NAME = 'Aarav Sharma (Fictional Demo Student — Grade 10)';

export const DEMO_STUDENT_CHECKIN: StudentDailyCheckIn = {
  id: 'demo-student-ci-today',
  timestamp: '2026-10-24T14:40:00Z',
  dateLabel: 'Oct 24, 2026',
  returnHomeTime: '14:30',
  tirednessLevel: 8,
  stressLevel: 7,
  eatenSinceSchool: 'no',
  waterSinceSchool: 'a_little',
  sleepHoursLastNight: 6.5,
  academicWorkload: 'homework_and_exam',
  freeTimeMinutes: 90,
  botheringOptions: [
    'I feel exhausted.',
    'I am hungry.',
    'I have an upcoming exam.',
    'I cannot concentrate.',
  ],
  ownWordsSituation:
    'Just got home from a long school day with back-to-back science labs, and I have a Maths test tomorrow plus English homework.',
  dietaryPreference: 'vegetarian',
  allergies: [],
  hotWeatherOrSport: true,
  subjectToWorkOn: 'Mathematics (Quadratic Equations)',
  isDemo: true,
};

export const DEMO_STUDENT_WEEKLY_LOGS: StudentDailyActivityLog[] = [
  // Previous Week (fictional records)
  {
    id: 'demo-log-p1',
    dateISO: '2026-10-13',
    dateLabel: 'Tue Oct 13',
    weekKey: 'Previous Week',
    energyLevel: 4,
    stressLevel: 8,
    sleepHours: 6.5,
    studySessionsCompleted: 2,
    breaksTaken: 1,
    checkInCompleted: true,
    goalsCompleted: 1,
    isDemo: true,
  },
  {
    id: 'demo-log-p2',
    dateISO: '2026-10-15',
    dateLabel: 'Thu Oct 15',
    weekKey: 'Previous Week',
    energyLevel: 5,
    stressLevel: 7,
    sleepHours: 6.8,
    studySessionsCompleted: 2,
    breaksTaken: 1,
    checkInCompleted: true,
    goalsCompleted: 2,
    isDemo: true,
  },
  {
    id: 'demo-log-p3',
    dateISO: '2026-10-17',
    dateLabel: 'Sat Oct 17',
    weekKey: 'Previous Week',
    energyLevel: 5,
    stressLevel: 7,
    sleepHours: 7.0,
    studySessionsCompleted: 1,
    breaksTaken: 2,
    checkInCompleted: true,
    goalsCompleted: 2,
    isDemo: true,
  },
  // Current Week (fictional records)
  {
    id: 'demo-log-c1',
    dateISO: '2026-10-20',
    dateLabel: 'Tue Oct 20',
    weekKey: 'Current Week',
    energyLevel: 6,
    stressLevel: 6,
    sleepHours: 7.5,
    studySessionsCompleted: 2,
    breaksTaken: 2,
    checkInCompleted: true,
    goalsCompleted: 2,
    isDemo: true,
  },
  {
    id: 'demo-log-c2',
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
    isDemo: true,
  },
  {
    id: 'demo-log-c3',
    dateISO: '2026-10-22',
    dateLabel: 'Thu Oct 22',
    weekKey: 'Current Week',
    energyLevel: 7,
    stressLevel: 6,
    sleepHours: 7.8,
    studySessionsCompleted: 2,
    breaksTaken: 2,
    checkInCompleted: true,
    goalsCompleted: 2,
    isDemo: true,
  },
  {
    id: 'demo-log-c4',
    dateISO: '2026-10-23',
    dateLabel: 'Fri Oct 23',
    weekKey: 'Current Week',
    energyLevel: 6,
    stressLevel: 5,
    sleepHours: 8.2,
    studySessionsCompleted: 2,
    breaksTaken: 3,
    checkInCompleted: true,
    goalsCompleted: 3,
    isDemo: true,
  },
];

export const DEMO_STUDENT_SCHEDULE: ScheduleSlot[] = generateAfterSchoolSchedule({
  schoolFinishTime: '14:00',
  arrivalHomeTime: '14:30',
  homeworkWorkload: 'moderate',
  upcomingTestInfo: 'Maths Test Tomorrow',
  tuitionOrExtracurricular: 'Evening Football Practice',
  tuitionStartTime: '17:30',
  tuitionDurationMinutes: 60,
  preferredRestMinutes: 20,
  dinnerTime: '20:00',
  bedtime: '22:00',
  availableStudyHours: 1.5,
  isExhausted: true,
}).map((s, idx) => (idx < 2 ? { ...s, completed: true } : s));

export const DEMO_SMALL_WINS: SmallWinChallenge[] = DEFAULT_SMALL_WINS_POOL.map((item, idx) => ({
  ...item,
  selected: idx < 3,
  completed: idx < 2,
}));
