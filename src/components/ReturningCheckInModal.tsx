/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Activity,
  Clock,
  Droplet,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { HealthCheckInRecord, UserProfile } from '../types/health';
import { screenRedFlags } from '../utils/healthCalculations';

interface ReturningCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCheckIn: (record: HealthCheckInRecord, updatedProfile?: Partial<UserProfile>) => void;
  latestRecord?: HealthCheckInRecord | null;
  historyCount: number;
}

export const ReturningCheckInModal: React.FC<ReturningCheckInModalProps> = ({
  isOpen,
  onClose,
  onSubmitCheckIn,
  latestRecord,
  historyCount,
}) => {
  const [sleepHours, setSleepHours] = useState<number>(latestRecord?.sleepHours || 7.5);
  const [sleepQuality] = useState<number>(latestRecord?.sleepQuality || 3);
  const [activeMinutes, setActiveMinutes] = useState<number>(latestRecord?.activeMinutes || 30);
  const [hydrationLiters, setHydrationLiters] = useState<number>(latestRecord?.hydrationLiters || 2.0);
  const [stressLevel, setStressLevel] = useState<number>(latestRecord?.stressLevel || 3);
  const [moodScore, setMoodScore] = useState<number>(latestRecord?.moodScore || 3);

  const [feelingSinceLast, setFeelingSinceLast] = useState<string>('');
  const [habitsFollowed, setHabitsFollowed] = useState<string>('');
  const [symptomChanges, setSymptomChanges] = useState<string>('');
  const [updateVitals, setUpdateVitals] = useState<boolean>(false);
  const [systolicBP, setSystolicBP] = useState<string>('');
  const [diastolicBP, setDiastolicBP] = useState<string>('');
  const [restingHR, setRestingHR] = useState<string>('');
  const [glucose] = useState<string>('');

  if (!isOpen) return null;

  const redFlags = screenRedFlags(
    symptomChanges ? symptomChanges.split(',').map((s) => s.trim()) : [],
    updateVitals
      ? {
          systolicBP: systolicBP ? Number(systolicBP) : undefined,
          diastolicBP: diastolicBP ? Number(diastolicBP) : undefined,
          restingHeartRate: restingHR ? Number(restingHR) : undefined,
          bloodGlucose: glucose ? Number(glucose) : undefined,
        }
      : undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const weekNumber = historyCount + 1;

    const newRecord: HealthCheckInRecord = {
      id: `checkin-${Date.now()}`,
      timestamp: now.toISOString(),
      dateLabel,
      weekLabel: `Week ${weekNumber}`,
      sleepHours,
      sleepQuality,
      activeMinutes,
      hydrationLiters,
      stressLevel,
      moodScore,
      eatingRoutineNotes: feelingSinceLast.trim(),
      symptomsReported: symptomChanges ? symptomChanges.split(',').map((s) => s.trim()).filter(Boolean) : [],
      notes: habitsFollowed.trim() ? `Habits followed: ${habitsFollowed}` : undefined,
      isDemoRecord: false,
    };

    let updatedProfileVitals: Partial<UserProfile> | undefined;
    if (updateVitals && (systolicBP || restingHR || glucose)) {
      updatedProfileVitals = {
        vitals: {
          systolicBP: systolicBP ? Number(systolicBP) : undefined,
          diastolicBP: diastolicBP ? Number(diastolicBP) : undefined,
          bpUnit: 'mmHg',
          bpDate: dateLabel,
          restingHeartRate: restingHR ? Number(restingHR) : undefined,
          hrUnit: 'bpm',
          hrDate: dateLabel,
          bloodGlucose: glucose ? Number(glucose) : undefined,
          glucoseUnit: 'mg/dL',
          glucoseDate: dateLabel,
        },
      };
    }

    onSubmitCheckIn(newRecord, updatedProfileVitals);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101828]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-[#E4E7EC] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#18243A] flex items-center justify-between bg-[#101828] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18243A] border border-[#55E6A5]/30 text-[#55E6A5] flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Returning User Health Check-in
              </h2>
              <p className="text-xs text-[#98A2B3]">
                Log your latest week to update your score and generate Then vs Now comparisons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#98A2B3] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {redFlags.isUrgent && (
            <div className="p-3.5 bg-rose-600 text-white rounded-xl text-xs space-y-1 font-semibold">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Urgent Safety Alert: Potential Medical Emergency</span>
              </div>
              <p className="text-[11px] font-normal text-rose-100">
                {redFlags.description} Please stop and contact emergency medical services.
              </p>
            </div>
          )}

          {/* Question 1 */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              1. How have you been feeling since your last check-in?
            </label>
            <input
              type="text"
              value={feelingSinceLast}
              onChange={(e) => setFeelingSinceLast(e.target.value)}
              placeholder="e.g. Energetic mornings, less study headache, better focus"
              className="hm-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl"
            />
          </div>

          {/* Question 2 */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              2. Which suggested habits from your action plan were you able to follow?
            </label>
            <input
              type="text"
              value={habitsFollowed}
              onChange={(e) => setHabitsFollowed(e.target.value)}
              placeholder="e.g. 30-min phone sunset, carried water bottle, lunch walk"
              className="hm-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl"
            />
          </div>

          {/* Question 3 */}
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              3. Have any of your symptoms or concerns changed?
            </label>
            <input
              type="text"
              value={symptomChanges}
              onChange={(e) => setSymptomChanges(e.target.value)}
              placeholder="e.g. Neck stiffness improved, or no changes"
              className="hm-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl"
            />
          </div>

          {/* Numerical Lifestyle Sliders */}
          <div className="bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EC] space-y-4">
            <span className="text-xs font-bold text-[#172033] block">
              Current Weekly Average Lifestyle Metrics
            </span>

            {/* Sleep */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-[#172033] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#18243A]" />
                  Average Sleep Duration
                </span>
                <span className="font-bold text-[#172033] font-mono tabular-nums">{sleepHours} hrs</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-[#101828] cursor-pointer"
              />
            </div>

            {/* Activity & Hydration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-[#172033] flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-[#0F766E]" />
                    Activity
                  </span>
                  <span className="font-bold text-[#0F766E] font-mono tabular-nums">{activeMinutes}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={activeMinutes}
                  onChange={(e) => setActiveMinutes(Number(e.target.value))}
                  className="w-full accent-[#101828] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-semibold text-[#172033] flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-[#0E7490]" />
                    Hydration
                  </span>
                  <span className="font-bold text-[#0E7490] font-mono tabular-nums">{hydrationLiters}L</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.0"
                  step="0.1"
                  value={hydrationLiters}
                  onChange={(e) => setHydrationLiters(Number(e.target.value))}
                  className="w-full accent-[#101828] cursor-pointer"
                />
              </div>
            </div>

            {/* Stress & Mood */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#667085] mb-1.5">
                  Stress (1 = Low, 5 = High)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setStressLevel(lvl)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border font-semibold tabular-nums ${
                        stressLevel === lvl
                          ? 'bg-[#101828] text-[#55E6A5] border-[#101828]'
                          : 'bg-white text-[#172033] border-[#D0D5DD]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#667085] mb-1.5">
                  Mood (1 = Low, 5 = Energized)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setMoodScore(lvl)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border font-semibold tabular-nums ${
                        moodScore === lvl
                          ? 'bg-[#101828] text-[#64D9F5] border-[#101828]'
                          : 'bg-white text-[#172033] border-[#D0D5DD]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Optional Vitals Update */}
          <div className="border border-[#E4E7EC] rounded-2xl p-3.5 bg-[#F5F7FB]">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#172033]">
              <input
                type="checkbox"
                checked={updateVitals}
                onChange={(e) => setUpdateVitals(e.target.checked)}
                className="rounded accent-[#101828]"
              />
              <span>Would you like to update your clinical measurements (BP, Heart Rate)?</span>
            </label>

            {updateVitals && (
              <div className="grid grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-[#E4E7EC]">
                <div>
                  <label className="block text-[11px] text-[#667085] mb-0.5">Systolic BP</label>
                  <input
                    type="number"
                    value={systolicBP}
                    onChange={(e) => setSystolicBP(e.target.value)}
                    placeholder="120"
                    className="w-full text-xs px-2.5 py-1.5 border border-[#D0D5DD] rounded-lg bg-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#667085] mb-0.5">Diastolic BP</label>
                  <input
                    type="number"
                    value={diastolicBP}
                    onChange={(e) => setDiastolicBP(e.target.value)}
                    placeholder="80"
                    className="w-full text-xs px-2.5 py-1.5 border border-[#D0D5DD] rounded-lg bg-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#667085] mb-0.5">Resting HR</label>
                  <input
                    type="number"
                    value={restingHR}
                    onChange={(e) => setRestingHR(e.target.value)}
                    placeholder="70"
                    className="w-full text-xs px-2.5 py-1.5 border border-[#D0D5DD] rounded-lg bg-white tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-[#667085] hover:text-[#172033] text-xs font-semibold px-3 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Check-in & Compare Progress</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
