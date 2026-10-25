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
import { DEFAULT_SMALL_WINS_POOL } from './studentWellbeingLogic';

const STUDENT_CONSENT_KEY = 'healthmate_student_consent_v1';
const STUDENT_CHECKINS_KEY = 'healthmate_student_checkins_v1';
const STUDENT_LOGS_KEY = 'healthmate_student_weekly_logs_v1';
const STUDENT_WINS_KEY = 'healthmate_student_small_wins_v1';
const STUDENT_SCHEDULE_KEY = 'healthmate_student_schedule_v1';

export function isLocalStorageAvailable(): boolean {
  try {
    const probe = '__hm_student_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function getStudentSaveConsent(): boolean {
  try {
    return localStorage.getItem(STUDENT_CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStudentSaveConsent(consent: boolean): void {
  try {
    if (consent) {
      localStorage.setItem(STUDENT_CONSENT_KEY, 'true');
    } else {
      localStorage.removeItem(STUDENT_CONSENT_KEY);
    }
  } catch {
    // Storage unavailable; handled gracefully in UI
  }
}

export function getSavedStudentCheckIns(): StudentDailyCheckIn[] {
  try {
    const raw = localStorage.getItem(STUDENT_CHECKINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudentCheckIns(items: StudentDailyCheckIn[], consent: boolean): void {
  if (!consent) return;
  try {
    localStorage.setItem(STUDENT_CHECKINS_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota/storage errors safely
  }
}

export function getSavedStudentActivityLogs(): StudentDailyActivityLog[] {
  try {
    const raw = localStorage.getItem(STUDENT_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudentActivityLogs(logs: StudentDailyActivityLog[], consent: boolean): void {
  if (!consent) return;
  try {
    localStorage.setItem(STUDENT_LOGS_KEY, JSON.stringify(logs));
  } catch {
    // Ignore
  }
}

export function getSavedSmallWins(): SmallWinChallenge[] {
  try {
    const raw = localStorage.getItem(STUDENT_WINS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_SMALL_WINS_POOL;
  } catch {
    return DEFAULT_SMALL_WINS_POOL;
  }
}

export function saveSmallWins(wins: SmallWinChallenge[], consent: boolean): void {
  if (!consent) return;
  try {
    localStorage.setItem(STUDENT_WINS_KEY, JSON.stringify(wins));
  } catch {
    // Ignore
  }
}

export function getSavedStudentSchedule(): ScheduleSlot[] {
  try {
    const raw = localStorage.getItem(STUDENT_SCHEDULE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudentSchedule(slots: ScheduleSlot[], consent: boolean): void {
  if (!consent) return;
  try {
    localStorage.setItem(STUDENT_SCHEDULE_KEY, JSON.stringify(slots));
  } catch {
    // Ignore
  }
}

export function deleteAllStudentRecords(): void {
  try {
    localStorage.removeItem(STUDENT_CONSENT_KEY);
    localStorage.removeItem(STUDENT_CHECKINS_KEY);
    localStorage.removeItem(STUDENT_LOGS_KEY);
    localStorage.removeItem(STUDENT_WINS_KEY);
    localStorage.removeItem(STUDENT_SCHEDULE_KEY);
  } catch {
    // Ignore
  }
}
