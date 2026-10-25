/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Check,
} from 'lucide-react';
import { HealthCheckInRecord, ThenVsNowAnalysis } from '../types/health';
import { compareThenVsNow } from '../utils/healthCalculations';

import { SectionGuideBanner } from './SectionGuideBanner';

interface ThenVsNowViewProps {
  history: HealthCheckInRecord[];
  onOpenCheckIn: () => void;
}

export const ThenVsNowView: React.FC<ThenVsNowViewProps> = ({ history, onOpenCheckIn }) => {
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>(
    history.length >= 2 ? history[history.length - 1].id : ''
  );
  const [selectedCurrentId, setSelectedCurrentId] = useState<string>(
    history.length >= 1 ? history[0].id : ''
  );
  const [filterCategory, setFilterCategory] = useState<'all' | 'positive' | 'needs_attention' | 'stable'>('all');

  const guideSteps = [
    {
      title: 'Compare Baseline vs Current',
      detail: 'Select a past baseline check-in and your current check-in to analyze your lifestyle habit delta.',
    },
    {
      title: 'Verified Percentage Trends',
      detail: 'Inspect changes in sleep duration, water consumption, physical activity, and stress levels with rigorous data integrity.',
    },
    {
      title: 'Positive Highlights & Focus Areas',
      detail: 'Celebrate healthy progress and receive gentle evidence-based suggestions for metrics needing attention.',
    },
  ];

  const currentRecord = history.find((r) => r.id === selectedCurrentId) || history[0] || null;
  const previousRecord = history.find((r) => r.id === selectedBaselineId) || (history.length >= 2 ? history[1] : null);

  const isIdenticalRecord = currentRecord && previousRecord && currentRecord.id === previousRecord.id;
  const effectivePrevious = isIdenticalRecord ? null : previousRecord;

  const analysis: ThenVsNowAnalysis = compareThenVsNow(effectivePrevious, currentRecord);

  // Insufficient data empty state
  if (analysis.insufficientDataReason || history.length < 2) {
    return (
      <div className="space-y-6">
        <SectionGuideBanner
          sectionTitle="Then vs Now Progress Comparison"
          description="Analyze your lifestyle delta by comparing past baseline check-ins against your latest entries."
          steps={guideSteps}
        />
      <div className="hm-card rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-6">
        <div className="w-16 h-16 bg-[#101828] text-[#64D9F5] rounded-2xl flex items-center justify-center mx-auto border border-[#64D9F5]/30">
          <HelpCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#0F766E]">
            Scientific Data Integrity
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">
            Insufficient Historical Records for Comparison
          </h2>
          <p className="text-sm text-[#667085] max-w-lg mx-auto leading-relaxed">
            HealthMate AI follows strict scientific integrity: <strong className="text-[#172033]">we never claim progress or improvement without verified historical baseline data</strong>. You currently have {history.length} check-in recorded. Log at least one returning check-in to unlock Then vs Now comparative analytics.
          </p>
        </div>

        <div className="p-4 bg-[#F5F7FB] rounded-xl border border-[#E4E7EC] text-left text-xs text-[#667085] space-y-2 max-w-md mx-auto">
          <span className="font-bold text-[#172033] block">How progress comparison works:</span>
          <p>• Week 1 establishes your baseline habit benchmark.</p>
          <p>• Week 2+ logs calculate percentage changes, delta trends, and habit stability.</p>
          <p>• Clear categorization distinguishes real improvements from areas needing gentle attention.</p>
        </div>

        <div className="pt-2">
          <button
            onClick={onOpenCheckIn}
            className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold px-6 py-3 rounded-xl shadow-md transition inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Add Returning Check-in Now
          </button>
        </div>
      </div>
      </div>
    );
  }

  const filteredDeltas = analysis.deltas.filter((d) => {
    if (filterCategory === 'all') return true;
    return d.status === filterCategory;
  });

  return (
    <div className="space-y-6">
      <SectionGuideBanner
        sectionTitle="Then vs Now Progress Comparison"
        description="Analyze your lifestyle delta by comparing past baseline check-ins against your latest entries."
        steps={guideSteps}
      />

      {/* Header & Baseline Selectors */}
      <div className="hm-dark-hero rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#98A2B3]">
              <span className="text-[#55E6A5] font-semibold">
                Then vs Now Analysis
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Comparing <strong className="text-white">{analysis.baselineDate}</strong> &rarr; <strong className="text-white">{analysis.currentDate}</strong>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight">
              Habit Evolution & Delta Tracking
            </h2>
            <p className="text-xs sm:text-sm text-[#D0D5DD] mt-1">
              Real mathematical comparisons between your past check-in and current routine.
            </p>
          </div>

          {/* Baseline and Current Pickers */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="bg-[#101828]/80 px-3.5 py-2.5 rounded-xl border border-white/15">
              <label className="block text-[10px] font-semibold text-[#64D9F5] mb-0.5">
                Baseline (Then)
              </label>
              <select
                aria-label="Select Baseline Check-in"
                value={selectedBaselineId}
                onChange={(e) => setSelectedBaselineId(e.target.value)}
                className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer"
              >
                {history.map((r) => (
                  <option key={r.id} value={r.id} className="text-[#172033]">
                    {r.weekLabel} ({r.dateLabel})
                  </option>
                ))}
              </select>
            </div>

            <ArrowRight className="w-4 h-4 text-[#55E6A5] shrink-0" />

            <div className="bg-[#101828]/80 px-3.5 py-2.5 rounded-xl border border-white/15">
              <label className="block text-[10px] font-semibold text-[#55E6A5] mb-0.5">
                Target (Now)
              </label>
              <select
                aria-label="Select Target Check-in"
                value={selectedCurrentId}
                onChange={(e) => setSelectedCurrentId(e.target.value)}
                className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer"
              >
                {history.map((r) => (
                  <option key={r.id} value={r.id} className="text-[#172033]">
                    {r.weekLabel} ({r.dateLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Category Filters (Functional interactive segmented filter buttons) */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
          <span className="text-xs font-medium text-[#98A2B3] mr-1">Filter metrics:</span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`text-xs px-3.5 py-1.5 rounded-lg border transition whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-[#55E6A5] text-[#101828] border-[#55E6A5] font-bold'
                : 'bg-white/5 text-[#D0D5DD] border-white/10 hover:bg-white/10'
            }`}
          >
            All Metrics ({analysis.deltas.length})
          </button>
          <button
            onClick={() => setFilterCategory('positive')}
            className={`text-xs px-3.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 whitespace-nowrap ${
              filterCategory === 'positive'
                ? 'bg-[#55E6A5] text-[#101828] border-[#55E6A5] font-bold'
                : 'bg-white/5 text-[#D0D5DD] border-white/10 hover:bg-white/10'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Positive Changes ({analysis.positiveHighlights.length})
          </button>
          <button
            onClick={() => setFilterCategory('needs_attention')}
            className={`text-xs px-3.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 whitespace-nowrap ${
              filterCategory === 'needs_attention'
                ? 'bg-rose-500 text-white border-rose-500 font-bold'
                : 'bg-white/5 text-[#D0D5DD] border-white/10 hover:bg-white/10'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Attention ({analysis.attentionAreas.length})
          </button>
          <button
            onClick={() => setFilterCategory('stable')}
            className={`text-xs px-3.5 py-1.5 rounded-lg border transition flex items-center gap-1.5 whitespace-nowrap ${
              filterCategory === 'stable'
                ? 'bg-[#64D9F5] text-[#101828] border-[#64D9F5] font-bold'
                : 'bg-white/5 text-[#D0D5DD] border-white/10 hover:bg-white/10'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
            Stable ({analysis.stableMetrics.length})
          </button>
        </div>
      </div>

      {/* Highlights Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Positive Changes */}
        <div className="hm-card rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[#0F766E] font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            Positive Improvements
          </div>
          {analysis.positiveHighlights.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-[#172033]">
              {analysis.positiveHighlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#667085] italic">No significant improvements detected in this interval.</p>
          )}
        </div>

        {/* 2. Areas Needing Attention */}
        <div className="hm-card rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            Areas Needing Attention
          </div>
          {analysis.attentionAreas.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-[#172033]">
              {analysis.attentionAreas.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#667085] italic">No declining metrics identified. Well done!</p>
          )}
        </div>

        {/* 3. Stable Habits */}
        <div className="hm-card rounded-2xl p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[#18243A] font-bold text-xs">
            <Minus className="w-4 h-4 text-[#667085]" />
            Stable Habits (Within ±5–10%)
          </div>
          {analysis.stableMetrics.length > 0 ? (
            <ul className="space-y-1.5 text-xs text-[#667085]">
              {analysis.stableMetrics.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#98A2B3] font-bold">•</span>
                  <span className="text-[#172033]">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#667085] italic">All measured metrics fluctuated outside stable thresholds.</p>
          )}
        </div>
      </div>

      {/* Detailed Metric Cards with Visual Progress Bar & % change */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDeltas.map((delta) => {
          const isPos = delta.status === 'positive';
          const isNeg = delta.status === 'needs_attention';
          const isStable = delta.status === 'stable';

          return (
            <div
              key={delta.label}
              className="hm-card-interactive rounded-2xl p-5 space-y-3.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#667085]">
                    {delta.label}
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5 tabular-nums">
                    <span className="text-2xl font-extrabold text-[#172033] font-mono">
                      {delta.currentValue} {delta.unit}
                    </span>
                    <span className="text-xs text-[#667085]">
                      from {delta.previousValue} {delta.unit}
                    </span>
                  </div>
                </div>

                {/* Delta Status Indicator (Unboxed semantic status with icon + tabular text) */}
                <div
                  className={`flex items-center gap-1 text-xs font-bold font-mono tabular-nums ${
                    isPos
                      ? 'text-[#0F766E]'
                      : isNeg
                      ? 'text-rose-700'
                      : 'text-[#667085]'
                  }`}
                >
                  {isPos && <TrendingUp className="w-4 h-4 text-[#10B981]" />}
                  {isNeg && <TrendingDown className="w-4 h-4 text-rose-600" />}
                  {isStable && <Minus className="w-4 h-4" />}
                  <span>
                    {delta.percentageChange !== null
                      ? `${delta.percentageChange > 0 ? '+' : ''}${delta.percentageChange}%`
                      : delta.status}
                  </span>
                </div>
              </div>

              {/* Visual Visualizer: Then vs Now Bar Comparison */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-[#667085] tabular-nums">
                  <span>Then ({previousRecord?.weekLabel}): {delta.previousValue} {delta.unit}</span>
                  <span className="font-semibold text-[#172033]">
                    Now ({currentRecord?.weekLabel}): {delta.currentValue} {delta.unit}
                  </span>
                </div>
                <div className="w-full bg-[#F5F7FB] h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#CBD5E1] h-full rounded-l-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(10, (delta.previousValue / (Math.max(delta.previousValue, delta.currentValue) * 1.2 || 1)) * 100)
                      )}%`,
                    }}
                  />
                  <div
                    className={`h-full ${
                      isPos ? 'bg-[#10B981]' : isNeg ? 'bg-rose-500' : 'bg-[#18243A]'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(10, (delta.currentValue / (Math.max(delta.previousValue, delta.currentValue) * 1.2 || 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-[#172033] bg-[#F5F7FB] p-3 rounded-xl">
                <strong>Insight:</strong> {delta.insight}
              </p>

              <p className="text-[11px] text-[#667085]">
                {delta.clinicalMeaning}
              </p>
            </div>
          );
        })}
      </div>

      {/* Multi-Week Trend Chart Component */}
      {history.length >= 2 && (
        <div className="hm-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#0F766E]" />
            <h3 className="text-sm font-bold text-[#172033]">
              Chronological Trend Overview Across All {history.length} Check-ins
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Chart 1: Sleep Duration (hrs) */}
            <div className="p-5 bg-[#F5F7FB] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#172033] block">Sleep Duration Trend (Hours)</span>
              <div className="h-32 flex items-end justify-between gap-2.5 pt-4 px-2">
                {[...history].reverse().map((rec) => {
                  const heightPct = Math.min(100, (rec.sleepHours / 10) * 100);
                  return (
                    <div key={rec.id} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-[11px] font-bold font-mono tabular-nums text-[#18243A]">
                        {rec.sleepHours}h
                      </span>
                      <div
                        className="w-full bg-[#18243A] group-hover:bg-[#101828] rounded-t-lg transition-transform duration-150"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[10px] text-[#667085] truncate max-w-full">
                        {rec.weekLabel.split(' ')[0]} {rec.weekLabel.split(' ')[1] || ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Active Movement (mins) */}
            <div className="p-5 bg-[#F5F7FB] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#172033] block">Daily Active Minutes</span>
              <div className="h-32 flex items-end justify-between gap-2.5 pt-4 px-2">
                {[...history].reverse().map((rec) => {
                  const heightPct = Math.min(100, (rec.activeMinutes / 60) * 100);
                  return (
                    <div key={rec.id} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-[11px] font-bold font-mono tabular-nums text-[#0F766E]">
                        {rec.activeMinutes}m
                      </span>
                      <div
                        className="w-full bg-[#55E6A5] group-hover:bg-[#3BD693] rounded-t-lg transition-transform duration-150"
                        style={{ height: `${Math.max(10, heightPct)}%` }}
                      />
                      <span className="text-[10px] text-[#667085] truncate max-w-full">
                        {rec.weekLabel.split(' ')[0]} {rec.weekLabel.split(' ')[1] || ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
