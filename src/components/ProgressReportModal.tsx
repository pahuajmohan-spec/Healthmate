/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Printer,
  FileText,
  Check,
} from 'lucide-react';
import { HealthCheckInRecord, UserProfile } from '../types/health';
import { calculateHealthScore, compareThenVsNow, generate7DayPlan } from '../utils/healthCalculations';

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  history: HealthCheckInRecord[];
  savedPlanState: Record<string, boolean>;
}

export const ProgressReportModal: React.FC<ProgressReportModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  history,
  savedPlanState,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentRecord = history[0] || null;
  const baselineRecord = history.length >= 2 ? history[history.length - 1] : null;

  const scorecard = currentRecord
    ? calculateHealthScore(currentRecord, userProfile?.ageGroup || '18_29')
    : null;

  const comparison = compareThenVsNow(baselineRecord, currentRecord);
  const tasks = userProfile ? generate7DayPlan(userProfile, currentRecord) : [];
  const completedTasks = tasks.filter((t) => savedPlanState[t.id]);

  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const periodLabel = baselineRecord && currentRecord && baselineRecord.id !== currentRecord.id
    ? `${baselineRecord.dateLabel} to ${currentRecord.dateLabel}`
    : currentRecord?.dateLabel || 'Current Baseline Period';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101828]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-[#E4E7EC] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Action Bar (hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-[#18243A] flex items-center justify-between bg-[#101828] text-white no-print">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#55E6A5]" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Personalized Progress & Clinician Discussion Report
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#55E6A5] hover:bg-[#42D694] text-[#101828] text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close report"
              className="text-[#98A2B3] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 print-page">
          {/* Document Header */}
          <div className="border-b-2 border-[#101828] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#667085] mb-1">
                <span className="font-bold text-[#0F766E]">
                  HealthMate AI Report
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">Document #{Date.now().toString().slice(-6)}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#172033] tracking-tight">
                My Health Journey Progress Report
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Evaluation Period: <strong className="text-[#172033]">{periodLabel}</strong> · Generated on {reportDate}
              </p>
            </div>
            <div className="text-right sm:border-l sm:pl-4 border-[#E4E7EC]">
              <span className="text-xs text-[#667085] block">Participant / User</span>
              <span className="text-sm font-bold text-[#172033]">{userProfile?.name || 'Anonymous User'}</span>
              <span className="text-xs text-[#667085] block tabular-nums">
                Age: {userProfile?.ageNumeric || userProfile?.ageGroup || 'N/A'}
              </span>
            </div>
          </div>

          {/* Legend Distinguishing Data Sources */}
          <div className="p-3.5 bg-[#F5F7FB] rounded-xl border border-[#E4E7EC] text-[11px] text-[#667085] space-y-1.5">
            <span className="font-bold text-[#172033] block">
              Data Source Classification & Transparency Legend:
            </span>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span>
                <strong className="text-[#18243A]">[User-Reported Fact]:</strong> Directly entered self-reports & vitals.
              </span>
              <span>
                <strong className="text-[#0F766E]">[Calculated Trend]:</strong> Mathematical differences between records.
              </span>
              <span>
                <strong className="text-[#101828]">[Protocol Suggestion]:</strong> Algorithmic habit recommendations.
              </span>
            </div>
          </div>

          {/* Section 1: User-Reported Health Profile & Vitals */}
          <div className="print-card rounded-2xl border border-[#E4E7EC] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
              <h3 className="text-xs font-bold text-[#18243A]">
                01. User-Reported Baseline & Vitals [Fact]
              </h3>
              <span className="text-[11px] text-[#667085] font-semibold">
                Self-Reported
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#667085] block text-[10px]">Primary Goal</span>
                <span className="font-semibold text-[#172033] capitalize">{userProfile?.mainGoal.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-[#667085] block text-[10px]">Dietary Allergies</span>
                <span className="font-semibold text-[#172033]">{userProfile?.foodAllergies.join(', ') || 'None'}</span>
              </div>
              <div>
                <span className="text-[#667085] block text-[10px]">Diagnosed Conditions</span>
                <span className="font-semibold text-[#172033]">{userProfile?.existingConditions.join(', ') || 'None reported'}</span>
              </div>
              <div>
                <span className="text-[#667085] block text-[10px]">Blood Pressure</span>
                <span className="font-semibold text-[#172033] tabular-nums">
                  {userProfile?.vitals?.systolicBP && userProfile?.vitals?.diastolicBP
                    ? `${userProfile.vitals.systolicBP}/${userProfile.vitals.diastolicBP} mmHg`
                    : 'Not entered'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Calculated Lifestyle Progress Scorecard */}
          {scorecard && (
            <div className="print-card rounded-2xl border border-[#E4E7EC] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
                <h3 className="text-xs font-bold text-[#0F766E]">
                  02. Current Lifestyle Scorecard [Calculated Index]
                </h3>
                <span className="text-sm font-extrabold font-mono tabular-nums text-[#0F766E]">
                  Score: {scorecard.overallScore}/100
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs tabular-nums">
                <div className="p-2.5 bg-[#F5F7FB] rounded-xl">
                  <span className="text-[#667085] block text-[10px]">Sleep ({scorecard.sleepScore}/25)</span>
                  <span className="font-semibold text-[#172033]">{currentRecord?.sleepHours} hrs</span>
                </div>
                <div className="p-2.5 bg-[#F5F7FB] rounded-xl">
                  <span className="text-[#667085] block text-[10px]">Hydration ({scorecard.hydrationScore}/25)</span>
                  <span className="font-semibold text-[#172033]">{currentRecord?.hydrationLiters} L</span>
                </div>
                <div className="p-2.5 bg-[#F5F7FB] rounded-xl">
                  <span className="text-[#667085] block text-[10px]">Movement ({scorecard.activityScore}/25)</span>
                  <span className="font-semibold text-[#172033]">{currentRecord?.activeMinutes} mins</span>
                </div>
                <div className="p-2.5 bg-[#F5F7FB] rounded-xl">
                  <span className="text-[#667085] block text-[10px]">Mood & Stress ({scorecard.moodScore}/25)</span>
                  <span className="font-semibold text-[#172033]">Mood {currentRecord?.moodScore}/5 · Stress {currentRecord?.stressLevel}/5</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Verified Comparative Progress (Then vs Now) */}
          <div className="print-card rounded-2xl border border-[#E4E7EC] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
              <h3 className="text-xs font-bold text-[#0F766E]">
                03. Then vs Now Comparative Evolution [Calculated Trend]
              </h3>
              <span className="text-[11px] text-[#667085] font-semibold tabular-nums">
                {comparison.deltas.length > 0 ? `${comparison.deltas.length} Metrics Analyzed` : 'Baseline Only'}
              </span>
            </div>

            {comparison.insufficientDataReason ? (
              <p className="text-xs text-[#667085] italic">
                {comparison.insufficientDataReason}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#55E6A5]/12 p-3 rounded-xl">
                  <span className="font-bold text-[#101828] block mb-1">Improvements:</span>
                  <ul className="space-y-1 text-[#172033]">
                    {comparison.positiveHighlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/80 p-3 rounded-xl">
                  <span className="font-bold text-amber-900 block mb-1">Areas for Gentle Attention:</span>
                  <ul className="space-y-1 text-amber-950">
                    {comparison.attentionAreas.length > 0 ? (
                      comparison.attentionAreas.map((a, i) => <li key={i}>• {a}</li>)
                    ) : (
                      <li>• None currently flagged</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Action Plan Adherence */}
          <div className="print-card rounded-2xl border border-[#E4E7EC] p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
              <h3 className="text-xs font-bold text-[#101828]">
                04. Action Plan Adherence & Next Steps [Protocol Suggestion]
              </h3>
              <span className="text-xs font-bold font-mono tabular-nums text-[#18243A]">
                {completedTasks.length} of {tasks.length} Completed
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#172033]">
              {tasks.map((task) => {
                const done = !!savedPlanState[task.id];
                return (
                  <div key={task.id} className="flex items-start gap-2 p-2 bg-[#F5F7FB] rounded-xl">
                    <span className={done ? 'text-[#0F766E] font-bold' : 'text-[#667085] font-bold'}>
                      {done ? '☑' : '☐'}
                    </span>
                    <span>
                      <strong>Day {task.day} ({task.dayName}):</strong> {task.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Clinician Discussion Checklist */}
          <div className="print-card rounded-2xl border border-[#E4E7EC] p-4 sm:p-5 space-y-2 bg-[#F5F7FB]">
            <span className="text-xs font-bold text-[#172033] block">
              Suggested Discussion Points with Your Healthcare Provider:
            </span>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#667085]">
              <li>Review changes in sleep latency and daytime fatigue levels.</li>
              <li>Confirm current blood pressure and resting pulse ranges are appropriate for your age.</li>
              <li>Discuss any new symptoms or medication adjustments directly with your physician.</li>
            </ul>
          </div>

          {/* Mandatory Non-Diagnostic Footnote */}
          <div className="border-t border-[#E4E7EC] pt-3 text-[10px] text-[#667085] leading-relaxed">
            <strong className="text-[#172033]">Legal & Clinical Disclaimer:</strong> This document was prepared by HealthMate AI for lifestyle habit tracking and self-reflection only. It does not constitute medical advice, clinical diagnosis, or a therapeutic regimen. Never disregard professional medical consultation or delay seeking care because of this summary.
          </div>
        </div>
      </div>
    </div>
  );
};
