/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  RefreshCw,
  Edit3,
  Plus,
  Check,
  X,
} from 'lucide-react';
import {
  AfterSchoolRoutineInput,
  ScheduleSlot,
  StudentDailyCheckIn,
} from '../../types/studentWellbeing';
import { generateAfterSchoolSchedule } from '../../utils/studentWellbeingLogic';
import { HealthMateAiOpinionBox } from './HealthMateAiOpinionBox';

interface AfterSchoolRoutineBuilderProps {
  scheduleSlots: ScheduleSlot[];
  onUpdateSchedule: (slots: ScheduleSlot[]) => void;
  recentCheckIn: StudentDailyCheckIn;
  onLogStudySessionCompleted: () => void;
  onLogBreakTaken: () => void;
}

export const AfterSchoolRoutineBuilder: React.FC<AfterSchoolRoutineBuilderProps> = ({
  scheduleSlots,
  onUpdateSchedule,
  recentCheckIn,
  onLogStudySessionCompleted,
  onLogBreakTaken,
}) => {
  const [schoolFinishTime, setSchoolFinishTime] = useState('14:00');
  const [arrivalHomeTime, setArrivalHomeTime] = useState(recentCheckIn.returnHomeTime || '14:30');
  const [homeworkWorkload, setHomeworkWorkload] = useState<'light' | 'moderate' | 'heavy'>(
    recentCheckIn.academicWorkload === 'none'
      ? 'light'
      : recentCheckIn.academicWorkload === 'homework_and_exam' ||
        recentCheckIn.academicWorkload === 'major_exam'
      ? 'heavy'
      : 'moderate'
  );
  const [upcomingTestInfo, setUpcomingTestInfo] = useState(
    recentCheckIn.academicWorkload === 'upcoming_test' ||
      recentCheckIn.academicWorkload === 'homework_and_exam'
      ? `${recentCheckIn.subjectToWorkOn || 'Class'} Test`
      : ''
  );
  const [tuitionOrExtracurricular, setTuitionOrExtracurricular] = useState('');
  const [tuitionStartTime, setTuitionStartTime] = useState('17:30');
  const [tuitionDurationText, setTuitionDurationText] = useState('60');
  const [preferredRestText, setPreferredRestText] = useState(
    recentCheckIn.tirednessLevel >= 7 ? '25' : '20'
  );
  const [dinnerTime, setDinnerTime] = useState('20:00');
  const [bedtime, setBedtime] = useState('22:00');
  const [availableStudyHoursText, setAvailableStudyHoursText] = useState('1.5');
  const [isExhausted, setIsExhausted] = useState(recentCheckIn.tirednessLevel >= 7);
  const [validationError, setValidationError] = useState('');

  // Inline slot editor state
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDetail, setEditDetail] = useState('');

  // Custom slot creator state
  const [customSlotTime, setCustomSlotTime] = useState('');
  const [customSlotTitle, setCustomSlotTitle] = useState('');

  const handleGenerateRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    const restMins = Number(preferredRestText);
    const studyHrs = Number(availableStudyHoursText);
    const tuitionMins = Number(tuitionDurationText);

    if (!arrivalHomeTime || !dinnerTime || !bedtime) {
      setValidationError('Please provide arrival time, dinner time, and bedtime.');
      return;
    }
    if (Number.isNaN(restMins) || restMins < 5 || restMins > 120) {
      setValidationError('Preferred rest time should be between 5 and 120 minutes.');
      return;
    }
    if (Number.isNaN(studyHrs) || studyHrs < 0.25 || studyHrs > 6) {
      setValidationError('Available study hours should be between 0.25 and 6 hours.');
      return;
    }

    setValidationError('');
    const input: AfterSchoolRoutineInput = {
      schoolFinishTime,
      arrivalHomeTime,
      homeworkWorkload,
      upcomingTestInfo,
      tuitionOrExtracurricular,
      tuitionStartTime,
      tuitionDurationMinutes: Number.isNaN(tuitionMins) ? 60 : tuitionMins,
      preferredRestMinutes: restMins,
      dinnerTime,
      bedtime,
      availableStudyHours: studyHrs,
      isExhausted,
    };

    const generated = generateAfterSchoolSchedule(input);
    onUpdateSchedule(generated);
    setEditingSlotId(null);
  };

  const handleToggleComplete = (slotId: string) => {
    const next = scheduleSlots.map((slot) => {
      if (slot.id === slotId) {
        const nextDone = !slot.completed;
        if (nextDone) {
          if (slot.category === 'study') onLogStudySessionCompleted();
          if (slot.category === 'break' || slot.category === 'recovery') onLogBreakTaken();
        }
        return { ...slot, completed: nextDone };
      }
      return slot;
    });
    onUpdateSchedule(next);
  };

  const startEditingSlot = (slot: ScheduleSlot) => {
    setEditingSlotId(slot.id);
    setEditStartTime(slot.startTime);
    setEditEndTime(slot.endTime);
    setEditTitle(slot.title);
    setEditDetail(slot.detail);
  };

  const saveEditedSlot = (slotId: string) => {
    if (!editTitle.trim()) return;
    const next = scheduleSlots.map((slot) =>
      slot.id === slotId
        ? {
            ...slot,
            startTime: editStartTime.trim() || slot.startTime,
            endTime: editEndTime.trim() || slot.endTime,
            title: editTitle.trim(),
            detail: editDetail.trim(),
          }
        : slot
    );
    onUpdateSchedule(next);
    setEditingSlotId(null);
  };

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSlotTitle.trim()) return;
    const label = customSlotTime.trim() || 'Evening';
    const newSlot: ScheduleSlot = {
      id: `slot-custom-${Date.now()}`,
      startTime: label,
      endTime: 'Custom',
      title: customSlotTitle.trim(),
      category: 'recovery',
      detail: 'Added by student to customize today’s evening routine.',
      completed: false,
    };
    onUpdateSchedule([...scheduleSlots, newSlot]);
    setCustomSlotTime('');
    setCustomSlotTitle('');
  };

  const completedCount = scheduleSlots.filter((s) => s.completed).length;

  return (
    <div className="space-y-8">
      {/* Routine Generator Form */}
      <section
        aria-labelledby="routine-builder-heading"
        className="hm-card rounded-2xl p-6 sm:p-8"
      >
        <div className="mb-6">
          <div className="text-xs font-medium text-[#667085]">
            03. Build My After-School Routine · Dynamic Clock-Time Planner
          </div>
          <h3 id="routine-builder-heading" className="text-2xl font-bold text-[#172033] mt-1">
            Generate a Realistic Evening Timetable
          </h3>
          <p className="text-sm text-[#667085] mt-1 max-w-2xl">
            Calculated directly from your arrival time, energy level, commitments, dinner, and bedtime—never overloaded, and always protecting sleep.
          </p>
        </div>

        <form onSubmit={handleGenerateRoutine} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="rb-school-finish" className="block text-xs font-semibold text-[#172033] mb-1.5">
                School finish time
              </label>
              <input
                id="rb-school-finish"
                type="time"
                value={schoolFinishTime}
                onChange={(e) => setSchoolFinishTime(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="rb-arrival-home" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Arrival home time
              </label>
              <input
                id="rb-arrival-home"
                type="time"
                value={arrivalHomeTime}
                onChange={(e) => setArrivalHomeTime(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="rb-dinner-time" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Dinner time
              </label>
              <input
                id="rb-dinner-time"
                type="time"
                value={dinnerTime}
                onChange={(e) => setDinnerTime(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="rb-bedtime" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Target bedtime
              </label>
              <input
                id="rb-bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="rb-workload" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Homework workload
              </label>
              <select
                id="rb-workload"
                value={homeworkWorkload}
                onChange={(e) =>
                  setHomeworkWorkload(e.target.value as 'light' | 'moderate' | 'heavy')
                }
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm"
              >
                <option value="light">Light workload</option>
                <option value="moderate">Moderate workload</option>
                <option value="heavy">Heavy workload</option>
              </select>
            </div>

            <div>
              <label htmlFor="rb-rest-mins" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Preferred post-school rest (mins)
              </label>
              <input
                id="rb-rest-mins"
                type="number"
                min="5"
                max="120"
                step="5"
                value={preferredRestText}
                onChange={(e) => setPreferredRestText(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="rb-study-hours" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Available study hours today
              </label>
              <input
                id="rb-study-hours"
                type="number"
                min="0.25"
                max="6"
                step="0.25"
                value={availableStudyHoursText}
                onChange={(e) => setAvailableStudyHoursText(e.target.value)}
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="rb-test-info" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Upcoming test / exam (optional)
              </label>
              <input
                id="rb-test-info"
                type="text"
                value={upcomingTestInfo}
                onChange={(e) => setUpcomingTestInfo(e.target.value)}
                placeholder="e.g. Maths Quiz Friday"
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E4E7EC]">
            <div>
              <label htmlFor="rb-tuition" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Tuition / Sport / Extracurricular (optional)
              </label>
              <input
                id="rb-tuition"
                type="text"
                value={tuitionOrExtracurricular}
                onChange={(e) => setTuitionOrExtracurricular(e.target.value)}
                placeholder="e.g. Science Tuition or Football"
                className="w-full hm-input rounded-xl px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label htmlFor="rb-tuition-start" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Activity start time (if any)
              </label>
              <input
                id="rb-tuition-start"
                type="time"
                value={tuitionStartTime}
                onChange={(e) => setTuitionStartTime(e.target.value)}
                disabled={!tuitionOrExtracurricular.trim()}
                className="w-full hm-input disabled:opacity-50 rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>

            <div>
              <label htmlFor="rb-tuition-duration" className="block text-xs font-semibold text-[#172033] mb-1.5">
                Activity duration (mins)
              </label>
              <input
                id="rb-tuition-duration"
                type="number"
                min="15"
                max="180"
                step="15"
                value={tuitionDurationText}
                onChange={(e) => setTuitionDurationText(e.target.value)}
                disabled={!tuitionOrExtracurricular.trim()}
                className="w-full hm-input disabled:opacity-50 rounded-xl px-3.5 py-2.5 text-sm tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <label className="inline-flex items-center gap-2.5 text-sm text-[#172033] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isExhausted}
                onChange={(e) => setIsExhausted(e.target.checked)}
                className="w-4 h-4 accent-[#101828] rounded"
              />
              <span>I feel very tired today (shorten study blocks & prioritize extra recovery)</span>
            </label>

            <button
              type="submit"
              className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-sm px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 transition shadow-xs whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Build / Regenerate My Routine
            </button>
          </div>

          {validationError && (
            <p role="alert" className="text-sm text-rose-700 font-medium">
              {validationError}
            </p>
          )}
        </form>
      </section>

      {/* Generated Interactive Schedule */}
      <section
        aria-labelledby="generated-schedule-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-[#667085]">
              Editable Evening Timetable · Check off blocks as you go
            </div>
            <h4 id="generated-schedule-heading" className="text-xl font-bold text-[#172033] mt-0.5">
              Today’s Balanced Schedule
            </h4>
          </div>
          <div className="text-sm font-mono font-semibold text-[#0F766E] tabular-nums">
            {completedCount}/{scheduleSlots.length} blocks completed
          </div>
        </div>

        <div className="divide-y divide-[#E4E7EC] border-t border-b border-[#E4E7EC]">
          {scheduleSlots.map((slot) => {
            const isEditing = editingSlotId === slot.id;
            return (
              <div key={slot.id} className="py-4 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="sm:w-44 shrink-0 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(slot.id)}
                    aria-label={`Mark "${slot.title}" as ${slot.completed ? 'incomplete' : 'complete'}`}
                    className="text-[#0F766E] hover:text-[#101828] transition"
                  >
                    {slot.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#667085]" />
                    )}
                  </button>
                  <span className="text-xs font-mono font-semibold text-[#172033] tabular-nums">
                    {slot.startTime} – {slot.endTime}
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex-1 space-y-2.5 bg-[#F5F7FB] border border-[#E4E7EC] p-4 rounded-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        aria-label="Edit start time"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#172033] tabular-nums"
                      />
                      <input
                        type="text"
                        aria-label="Edit end time"
                        value={editEndTime}
                        onChange={(e) => setEditEndTime(e.target.value)}
                        className="bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#172033] tabular-nums"
                      />
                      <input
                        type="text"
                        aria-label="Edit block title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="col-span-2 bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#172033]"
                      />
                    </div>
                    <input
                      type="text"
                      aria-label="Edit block notes"
                      value={editDetail}
                      onChange={(e) => setEditDetail(e.target.value)}
                      className="w-full bg-white border border-[#D0D5DD] rounded-lg px-2.5 py-1.5 text-xs text-[#172033]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEditedSlot(slot.id)}
                        className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save Slot
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSlotId(null)}
                        className="bg-white border border-[#D0D5DD] text-[#172033] text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-start justify-between gap-3">
                    <div>
                      <div
                        className={`text-sm font-bold ${
                          slot.completed ? 'line-through text-[#667085]' : 'text-[#172033]'
                        }`}
                      >
                        {slot.title}
                      </div>
                      <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">{slot.detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEditingSlot(slot)}
                      aria-label={`Edit schedule block "${slot.title}"`}
                      className="text-xs text-[#667085] hover:text-[#172033] font-medium inline-flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg hover:bg-[#F5F7FB]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Custom Slot */}
        <form onSubmit={handleAddCustomSlot} className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <label htmlFor="custom-slot-time" className="sr-only">
            Custom slot time
          </label>
          <input
            id="custom-slot-time"
            type="text"
            value={customSlotTime}
            onChange={(e) => setCustomSlotTime(e.target.value)}
            placeholder="Time (e.g. 6:30 PM)"
            className="sm:w-40 hm-input rounded-xl px-3.5 py-2 text-sm tabular-nums"
          />
          <label htmlFor="custom-slot-title" className="sr-only">
            Custom slot activity
          </label>
          <input
            id="custom-slot-title"
            type="text"
            value={customSlotTitle}
            onChange={(e) => setCustomSlotTitle(e.target.value)}
            placeholder="Add your own block (e.g. Guitar practice or Walk dog)..."
            className="flex-1 hm-input rounded-xl px-3.5 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-[#18243A] hover:bg-[#101828] text-white text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center justify-center gap-1.5 transition shrink-0"
          >
            <Plus className="w-4 h-4 text-[#55E6A5]" />
            Add Block
          </button>
        </form>
      </section>

      <HealthMateAiOpinionBox
        sectionTitle="After-School Schedule"
        promptPlaceholder="Have an unusual evening constraint (e.g. family guests visiting or two back-to-back classes)? Ask HealthMate AI..."
        recentCheckIn={recentCheckIn}
        contextData={{
          arrivalHomeTime,
          dinnerTime,
          bedtime,
          homeworkWorkload,
          upcomingTestInfo,
        }}
      />
    </div>
  );
};
