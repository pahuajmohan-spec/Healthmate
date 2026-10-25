/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  FileText,
  PlusCircle,
  HelpCircle,
  UserCheck,
} from 'lucide-react';
import { DEMO_PERSONAS, DemoPersona } from '../data/demoPersonas';
import { UserProfile } from '../types/health';

interface HeaderProps {
  currentPersonaId: string | null;
  onSelectPersona: (persona: DemoPersona | null) => void;
  onOpenPrivacy: () => void;
  onOpenNewCheckIn: () => void;
  onOpenRedFlagCheck: () => void;
  onOpenReport: () => void;
  onOpenOnboarding: () => void;
  userProfile: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersonaId,
  onSelectPersona,
  onOpenPrivacy,
  onOpenNewCheckIn,
  onOpenRedFlagCheck,
  onOpenReport,
  onOpenOnboarding,
  userProfile,
  activeTab,
  setActiveTab,
}) => {
  const isDemo = currentPersonaId !== null;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      {/* Demo Mode Notice Banner for Judges */}
      {isDemo && (
        <div className="bg-amber-500 text-slate-900 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <span className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Judge Demo Mode
            </span>
            <span>
              Viewing fictional profile: <strong className="underline">{userProfile?.name}</strong>. All historical
              measurements, deltas, and progress records are simulated for demonstration.
            </span>
            <button
              onClick={() => onSelectPersona(null)}
              className="ml-auto bg-slate-900 text-white hover:bg-slate-800 px-2.5 py-0.5 rounded text-xs font-medium transition"
            >
              Exit Demo
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">HealthMate</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  AI Journey
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Transparent Wellbeing Progress & Responsible Lifestyle Intelligence
              </p>
            </div>
          </div>

          {/* Quick Demo Selector for Judges & Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Judge Demo Dropdown */}
            <div className="flex items-center bg-slate-100 hover:bg-slate-200/80 rounded-lg p-1 transition border border-slate-200">
              <span className="text-[11px] font-bold text-slate-600 px-2 hidden md:inline flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Judge Demo:
              </span>
              <select
                aria-label="Select Demo Persona"
                value={currentPersonaId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    onSelectPersona(null);
                  } else {
                    const match = DEMO_PERSONAS.find((p) => p.id === val);
                    if (match) onSelectPersona(match);
                  }
                }}
                className="text-xs font-medium text-slate-800 bg-transparent py-1 px-1.5 focus:outline-none cursor-pointer"
              >
                <option value="">👤 My Real Data</option>
                {DEMO_PERSONAS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.avatar} {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In Button */}
            <button
              onClick={userProfile ? onOpenNewCheckIn : onOpenOnboarding}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{userProfile ? 'New Check-in' : 'Start Journey'}</span>
            </button>

            {/* Red Flag Emergency Screener button */}
            <button
              onClick={onOpenRedFlagCheck}
              title="Red-flag symptom safety guidance"
              className="flex items-center gap-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-medium px-2.5 py-1.5 rounded-lg transition"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden lg:inline">Safety Screener</span>
            </button>

            {/* Progress Report */}
            <button
              onClick={onOpenReport}
              title="Download or Print Progress Report"
              className="flex items-center gap-1 text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg transition border border-slate-200"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">Report</span>
            </button>

            {/* Privacy Controls */}
            <button
              onClick={onOpenPrivacy}
              title="View, Edit, or Delete Local Health Records"
              className="flex items-center gap-1 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 p-2 rounded-lg transition"
              aria-label="Privacy settings"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 overflow-x-auto py-2 scrollbar-none text-xs sm:text-sm font-medium">
          {[
            { id: 'scorecard', label: 'Scorecard', icon: Activity },
            { id: 'comparison', label: 'Then vs Now', icon: UserCheck },
            { id: 'action-plan', label: '7-Day Plan', icon: Sparkles },
            { id: 'today', label: 'What Should I Do Today?', icon: HelpCircle },
            { id: 'food-guide', label: 'Smart Food Guide', icon: FileText },
            { id: 'timeline', label: 'Journey Timeline', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
