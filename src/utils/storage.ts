/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HealthCheckInRecord, UserProfile } from '../types/health';

const PROFILE_KEY = 'healthmate_user_profile_v1';
const HISTORY_KEY = 'healthmate_health_history_v1';
const CONSENT_KEY = 'healthmate_privacy_consent_v1';
const TASKS_KEY = 'healthmate_7day_tasks_v1';

export function getStoredConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setStoredConsent(granted: boolean): void {
  try {
    if (granted) {
      localStorage.setItem(CONSENT_KEY, 'true');
    } else {
      localStorage.removeItem(CONSENT_KEY);
    }
  } catch (e) {
    console.error('Failed to update consent in storage', e);
  }
}

export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

export function getStoredHistory(): HealthCheckInRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredHistory(history: HealthCheckInRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}

export function addCheckInRecord(record: HealthCheckInRecord): HealthCheckInRecord[] {
  const current = getStoredHistory();
  // Prepend or append chronologically
  const updated = [record, ...current.filter((r) => r.id !== record.id)];
  saveStoredHistory(updated);
  return updated;
}

export function updateCheckInRecord(updatedRecord: HealthCheckInRecord): HealthCheckInRecord[] {
  const current = getStoredHistory();
  const updated = current.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
  saveStoredHistory(updated);
  return updated;
}

export function deleteCheckInRecord(recordId: string): HealthCheckInRecord[] {
  const current = getStoredHistory();
  const updated = current.filter((r) => r.id !== recordId);
  saveStoredHistory(updated);
  return updated;
}

export function getStoredPlanTasks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveStoredPlanTasks(tasksState: Record<string, boolean>): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasksState));
  } catch (e) {
    console.error('Failed to save plan tasks', e);
  }
}

export function clearAllHealthData(): void {
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(CONSENT_KEY);
    localStorage.removeItem(TASKS_KEY);
  } catch (e) {
    console.error('Failed to clear storage', e);
  }
}

export function exportHealthDataJSON(): string {
  const data = {
    exportDate: new Date().toISOString(),
    profile: getStoredProfile(),
    history: getStoredHistory(),
    disclaimer:
      'This exported JSON contains your self-reported wellbeing habit data from HealthMate AI. Keep it confidential.',
  };
  return JSON.stringify(data, null, 2);
}
