/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Award,
  Shield,
  Trash2,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  SmallWinChallenge,
  StudentDailyActivityLog,
  StudentDailyCheckIn,
} from '../../types/studentWellbeing';
import {
  analyzeStudentWeeklyProgress,
  computeStudentBadges,
} from '../../utils/studentWellbeingLogic';

interface StudentScorecardAndWinsProps {
  logs: StudentDailyActivityLog[];
  smallWins: SmallWinChallenge[];
  savedCheckIns: StudentDailyCheckIn[];
  onToggleSelectWin: (id: string) => void;
  onToggleCompleteWin: (id: string) => void;
  onAddCustomWin: (title: string) => void;
  isDemoMode: boolean;
  storageAvailable: boolean;
  saveConsent: boolean;
  onChangeConsent: (consent: boolean) => void;
  onDeleteAllRecords: () => void;
}

export const StudentScorecardAndWins: React.FC<StudentScorecardAndWinsProps> = ({
  logs,
  smallWins,
  savedCheckIns,
  onToggleSelectWin,
  onToggleCompleteWin,
  onAddCustomWin,
  isDemoMode,
  storageAvailable,
  saveConsent,
  onChangeConsent,
  onDeleteAllRecords,
}) => {
  const [customWinTitle, setCustomWinTitle] = useState('');
  const [selectionWarning, setSelectionWarning] = useState('');
  const [showSavedRecords, setShowSavedRecords] = useState(false);
  const [confirmDeleteStep, setConfirmDeleteStep] = useState(false);

  const summary = analyzeStudentWeeklyProgress(logs);
  const badges = computeStudentBadges(smallWins, logs);

  const selectedWins = smallWins.filter((w) => w.selected);
  const completedWinsCount = smallWins.filter((w) => w.completed).length;

  const handleTogglePick = (id: string) => {
    const target = smallWins.find((w) => w.id === id);
    if (!target) return;
    if (!target.selected && selectedWins.length >= 3) {
      setSelectionWarning(
        'Keep it calm and realistic: unselect one of your 3 daily Small Wins first before swapping in another.'
      );
      return;
    }
    setSelectionWarning('');
    onToggleSelectWin(id);
  };

  const handleAddWinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customWinTitle.trim();
    if (!trimmed) return;
    onAddCustomWin(trimmed);
    setCustomWinTitle('');
    setSelectionWarning('');
  };

  return (
    <div className="space-y-8">
      {/* 7. MY STUDENT WELLBEING SCORECARD */}
      <section
        aria-labelledby="student-scorecard-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div>
          <div className="text-xs font-medium text-[#667085]">
            07. My Student Wellbeing Scorecard · Supportive Self-Reported Routine Tracker
          </div>
          <h3
            id="student-scorecard-heading"
            className="text-2xl font-bold text-[#172033] mt-1"
          >
            Your Weekly Energy, Sleep & Study Balance
          </h3>
          <p className="text-sm text-[#667085] mt-1 max-w-2xl">
            Reflects your self-reported daily routines so you can spot helpful patterns—never a grade, medical score, or judgment.
          </p>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
          <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4">
            <div className="text-xs text-[#667085]">Avg Sleep</div>
            <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums mt-1">
              {summary.currentAvgSleep > 0 ? `${summary.currentAvgSleep}h` : '—'}
            </div>
            <div className="text-[11px] text-[#667085] mt-0.5 tabular-nums">
              {summary.sleepConsistencyRangeHours > 0
                ? `±${summary.sleepConsistencyRangeHours}h range`
                : 'Self-reported'}
            </div>
          </div>

          <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4">
            <div className="text-xs text-[#667085]">Afternoon Energy</div>
            <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums mt-1">
              {summary.currentAvgEnergy > 0 ? `${summary.currentAvgEnergy}/10` : '—'}
            </div>
            <div className="text-[11px] text-[#667085] mt-0.5">Current week avg</div>
          </div>

          <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4">
            <div className="text-xs text-[#667085]">Stress Check-In</div>
            <div className="text-2xl font-bold text-[#172033] font-mono tabular-nums mt-1">
              {summary.currentAvgStress > 0 ? `${summary.currentAvgStress}/10` : '—'}
            </div>
            <div className="text-[11px] text-[#667085] mt-0.5">Lower feels calmer</div>
          </div>

          <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4">
            <div className="text-xs text-[#667085]">Study Blocks</div>
            <div className="text-2xl font-bold text-[#0F766E] font-mono tabular-nums mt-1">
              {summary.totalStudySessions}
            </div>
            <div className="text-[11px] text-[#667085] mt-0.5">Focused sessions</div>
          </div>

          <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4">
            <div className="text-xs text-[#667085]">Breaks Taken</div>
            <div className="text-2xl font-bold text-[#0E7490] font-mono tabular-nums mt-1">
              {summary.totalBreaksTaken}
            </div>
            <div className="text-[11px] text-[#667085] mt-0.5">Rest & breathers</div>
          </div>

          <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4">
            <div className="text-xs text-[#667085]">Small Wins</div>
            <div className="text-2xl font-bold text-[#0F766E] font-mono tabular-nums mt-1">
              {summary.totalGoalsCompleted}
            </div>
            <div className="text-[11px] text-[#667085] mt-0.5 tabular-nums">
              {summary.totalCheckIns} check-ins logged
            </div>
          </div>
        </div>

        {/* SVG Weekly Chart */}
        {logs.length > 0 && (
          <div className="pt-4 border-t border-[#E4E7EC] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-[#172033]">
                Logged Sleep, Energy & Stress Across Recent Days
              </h4>
              <div className="flex items-center gap-3 text-xs text-[#667085]">
                <span>Deep Navy: Sleep (hrs)</span>
                <span aria-hidden="true">·</span>
                <span>Teal: Energy (1–10)</span>
                <span aria-hidden="true">·</span>
                <span>Amber: Stress (1–10)</span>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${Math.max(520, logs.length * 88)} 190`}
                className="w-full h-48 bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-2"
                role="img"
                aria-label="Weekly bar chart comparing daily sleep hours, energy level, and stress level"
              >
                {/* Horizontal guide lines */}
                {[2, 5, 8, 10].map((val) => {
                  const y = 150 - (val / 10) * 120;
                  return (
                    <g key={val}>
                      <line
                        x1={36}
                        y1={y}
                        x2={Math.max(500, logs.length * 88 - 16)}
                        y2={y}
                        stroke="#DCE2EC"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={10}
                        y={y + 4}
                        fontSize="10"
                        fill="#667085"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {logs.map((log, index) => {
                  const groupX = 52 + index * 78;
                  const sleepH = Math.min(120, (log.sleepHours / 10) * 120);
                  const energyH = Math.min(120, (log.energyLevel / 10) * 120);
                  const stressH = Math.min(120, (log.stressLevel / 10) * 120);

                  return (
                    <g key={log.id}>
                      {/* Sleep bar */}
                      <rect
                        x={groupX}
                        y={150 - sleepH}
                        width={14}
                        height={sleepH}
                        rx={3}
                        fill="#101828"
                      />
                      {/* Energy bar */}
                      <rect
                        x={groupX + 17}
                        y={150 - energyH}
                        width={14}
                        height={energyH}
                        rx={3}
                        fill="#0D9488"
                      />
                      {/* Stress bar */}
                      <rect
                        x={groupX + 34}
                        y={150 - stressH}
                        width={14}
                        height={stressH}
                        rx={3}
                        fill="#D97706"
                      />
                      <text
                        x={groupX + 24}
                        y={168}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#172033"
                      >
                        {log.dateLabel.replace(/20\d\d/, '').trim()}
                      </text>
                      <text
                        x={groupX + 24}
                        y={181}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#667085"
                      >
                        {log.weekKey === 'Previous Week' ? 'Prev Wk' : 'This Wk'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Week-over-Week Supportive Reflections */}
        <div className="pt-4 border-t border-[#E4E7EC] space-y-2.5">
          <div className="text-xs font-semibold text-[#0F766E]">
            {summary.hasPreviousWeekComparison
              ? 'Week-to-Week Routine Comparison (Previous Week vs Current Week)'
              : 'Gentle Weekly Reflection'}
          </div>
          <ul className="space-y-2 text-sm text-[#172033]/90 list-disc pl-5">
            {summary.habitObservations.map((obs, idx) => (
              <li key={idx}>{obs}</li>
            ))}
          </ul>
          <p className="text-xs text-[#667085] pt-2">{summary.disclaimerNote}</p>
        </div>
      </section>

      {/* 8. DAILY STUDENT CHALLENGES ("SMALL WINS") */}
      <section
        aria-labelledby="small-wins-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-[#667085]">
              08. Daily Student Challenges · Non-Competitive Personal Small Wins
            </div>
            <h3
              id="small-wins-heading"
              className="text-2xl font-bold text-[#172033] mt-1"
            >
              Choose 3 Small Wins for Today
            </h3>
            <p className="text-sm text-[#667085] mt-1 max-w-2xl">
              Pick up to 3 gentle daily habits and check them off at your own pace. Missed a goal? Zero stress—tomorrow is always a fresh page, and there are no leaderboards.
            </p>
          </div>
          <div className="text-xs font-mono font-semibold text-[#0F766E] tabular-nums">
            {selectedWins.length}/3 chosen · {completedWinsCount} completed today
          </div>
        </div>

        {selectionWarning && (
          <p role="alert" className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            {selectionWarning}
          </p>
        )}

        {/* Today's Chosen 3 Goals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedWins.map((win) => (
            <div
              key={win.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 transition ${
                win.completed
                  ? 'bg-[#55E6A5]/12 border-[#55E6A5]/50'
                  : 'bg-[#F5F7FB] border-[#E4E7EC]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#667085]">
                  <span className="capitalize font-semibold text-[#0F766E]">
                    {win.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePick(win.id)}
                    className="text-xs text-[#667085] hover:text-[#172033] underline"
                  >
                    Swap out
                  </button>
                </div>
                <div
                  className={`text-sm font-bold ${
                    win.completed ? 'line-through text-[#667085]' : 'text-[#172033]'
                  }`}
                >
                  {win.title}
                </div>
                <p className="text-xs text-[#667085]">{win.whyItMatters}</p>
              </div>

              <button
                type="button"
                onClick={() => onToggleCompleteWin(win.id)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition ${
                  win.completed
                    ? 'bg-[#101828] text-[#55E6A5]'
                    : 'bg-white border border-[#D0D5DD] text-[#172033] hover:border-[#101828]'
                }`}
              >
                {win.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Completed Today
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    Mark Complete
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* More Goal Ideas Pool + Add Custom */}
        <div className="pt-4 border-t border-[#E4E7EC] space-y-3">
          <div className="text-xs font-semibold text-[#172033]">
            More Small Win Ideas (click to add to your 3 daily choices):
          </div>
          <div className="flex flex-wrap gap-2">
            {smallWins
              .filter((w) => !w.selected)
              .map((win) => (
                <button
                  key={win.id}
                  type="button"
                  onClick={() => handleTogglePick(win.id)}
                  className="text-left text-xs bg-[#F5F7FB] hover:bg-[#18243A] hover:text-white border border-[#E4E7EC] hover:border-[#18243A] rounded-xl px-3.5 py-2 text-[#172033] transition inline-flex items-center gap-1.5 group"
                >
                  <Plus className="w-3.5 h-3.5 text-[#0F766E] group-hover:text-[#55E6A5]" />
                  <span>{win.title}</span>
                </button>
              ))}
          </div>

          <form onSubmit={handleAddWinSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <label htmlFor="custom-small-win-input" className="sr-only">
              Create your own Small Win goal
            </label>
            <input
              id="custom-small-win-input"
              type="text"
              value={customWinTitle}
              onChange={(e) => setCustomWinTitle(e.target.value)}
              placeholder="Write your own gentle Small Win (e.g. Stretch for 5 mins after Maths)..."
              className="flex-1 hm-input rounded-xl px-3.5 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-[#18243A] hover:bg-[#101828] text-white text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center justify-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-4 h-4 text-[#55E6A5]" />
              Add Custom Win
            </button>
          </form>
        </div>

        {/* Personal Non-Competitive Badges */}
        <div className="pt-4 border-t border-[#E4E7EC] space-y-3">
          <div className="text-xs font-semibold text-[#172033]">
            Personal Milestone Badges (Private to You — No Leaderboards):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-xl p-4 border ${
                  badge.earned
                    ? 'bg-[#101828] border-[#18243A] text-white'
                    : 'bg-[#F5F7FB] border-[#E4E7EC] text-[#667085]'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Award
                    className={`w-4 h-4 shrink-0 ${
                      badge.earned ? 'text-[#55E6A5]' : 'text-[#667085]'
                    }`}
                  />
                  <span>{badge.title}</span>
                </div>
                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    badge.earned ? 'text-slate-300' : 'text-[#667085]'
                  }`}
                >
                  {badge.description}
                </p>
                <div
                  className={`text-[11px] font-mono mt-2 ${
                    badge.earned ? 'text-[#64D9F5]' : 'text-[#667085]'
                  }`}
                >
                  {badge.earned ? 'Unlocked' : badge.criteriaText}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. STUDENT PRIVACY & SAFETY CONTROLS */}
      <section
        aria-labelledby="student-privacy-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#0F766E] shrink-0 mt-1" />
          <div>
            <div className="text-xs font-medium text-[#667085]">
              09. Student Privacy & Safety · Full Control Over Your Information
            </div>
            <h3
              id="student-privacy-heading"
              className="text-xl font-bold text-[#172033] mt-0.5"
            >
              Private By Default — You Choose Whether Anything Is Saved
            </h3>
            <p className="text-sm text-[#667085] mt-1 max-w-2xl">
              Sensitive details are always optional. Student records stay strictly inside your own browser (never published or shared publicly), and you can inspect or erase them anytime.
            </p>
          </div>
        </div>

        {!storageAvailable && (
          <p role="status" className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-4">
            Browser local storage is unavailable in this window—your Student Wellbeing Zone is running safely in temporary session-only mode and will clear automatically when you close the tab.
          </p>
        )}

        {storageAvailable && (
          <div className="bg-[#F5F7FB] border border-[#E4E7EC] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <label className="inline-flex items-start sm:items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveConsent}
                disabled={isDemoMode}
                onChange={(e) => onChangeConsent(e.target.checked)}
                className="w-4 h-4 accent-[#101828] rounded mt-1 sm:mt-0"
              />
              <span className="text-sm text-[#172033]">
                <strong>Permission to save on this device:</strong> Allow HealthMate to store my personal Student Wellbeing check-ins and Small Wins in browser{' '}
                <code className="text-xs bg-white border border-[#E4E7EC] px-1.5 py-0.5 rounded font-mono">
                  localStorage
                </code>
                .
                {isDemoMode && (
                  <span className="block text-xs text-[#667085] mt-0.5">
                    (Switch off Fictional Demo Mode at the top of this page to record and save your own personal progress.)
                  </span>
                )}
              </span>
            </label>

            <span className="text-xs font-mono text-[#667085] shrink-0">
              {isDemoMode
                ? 'Mode: Fictional Demo'
                : saveConsent
                ? 'Mode: Saved Locally'
                : 'Mode: Session-Only (Unsaved)'}
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setShowSavedRecords((prev) => !prev)}
            className="bg-white border border-[#D0D5DD] hover:border-[#101828] text-[#172033] text-xs font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition"
          >
            {showSavedRecords ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Saved Student Records
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                View My Student Records ({savedCheckIns.length} check-ins, {logs.length} daily logs)
              </>
            )}
          </button>

          {!confirmDeleteStep ? (
            <button
              type="button"
              onClick={() => setConfirmDeleteStep(true)}
              className="border border-rose-300 hover:bg-rose-50 text-rose-800 text-xs font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-4 h-4" />
              Delete Saved Student Data
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
              <span className="text-xs text-rose-900 font-medium">
                Erase all saved student records?
              </span>
              <button
                type="button"
                onClick={() => {
                  onDeleteAllRecords();
                  setConfirmDeleteStep(false);
                }}
                className="bg-rose-700 text-white text-xs font-semibold px-3 py-1 rounded-lg"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteStep(false)}
                className="text-xs text-[#172033] font-semibold px-2 py-1"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {showSavedRecords && (
          <div className="bg-[#F5F7FB] rounded-xl p-4 space-y-3 text-xs text-[#172033] border border-[#E4E7EC]">
            <div className="font-bold text-[#172033]">
              Current Active Records ({isDemoMode ? 'Fictional Student Demo Dataset' : 'Your Personal Session / Saved Data'}):
            </div>
            {savedCheckIns.length === 0 && logs.length === 0 ? (
              <p className="text-[#667085]">No student check-ins or weekly logs stored right now.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-1.5 border-b border-[#E4E7EC] last:border-none"
                  >
                    <span className="font-semibold text-[#172033]">
                      {l.dateLabel} ({l.weekKey})
                    </span>
                    <span className="font-mono tabular-nums text-[#667085]">
                      Sleep {l.sleepHours}h · Energy {l.energyLevel}/10 · Stress {l.stressLevel}/10 · Study {l.studySessionsCompleted} · Breaks {l.breaksTaken}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
