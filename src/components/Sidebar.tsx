/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Activity,
  UserCheck,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const coreItems = [
    { id: 'scorecard', label: 'Scorecard', icon: Activity },
    { id: 'comparison', label: 'Then vs Now', icon: UserCheck },
    { id: 'action-plan', label: '7-Day Plan', icon: Sparkles },
    { id: 'today', label: 'What Should I Do Today?', icon: HelpCircle },
    { id: 'food-guide', label: 'Smart Food Guide', icon: FileText },
    { id: 'timeline', label: 'Journey Timeline', icon: Clock },
  ];

  const studentItem = {
    id: 'student-zone',
    label: 'Student Wellbeing Zone',
    icon: GraduationCap,
  };

  return (
    <aside className="bg-[#101828] text-white border-b md:border-b-0 md:border-r border-[#18243A] p-4 sm:p-6 md:p-7 flex flex-col justify-between md:h-screen shrink-0 select-none">
      <div>
        {/* Brand Lockup (strictly preserving "HealthMate" h2 text) */}
        <div className="flex items-center gap-3 mb-5 md:mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#18243A] border border-[#55E6A5]/30 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-[#55E6A5]" />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
            HealthMate
          </h2>
        </div>

        <nav aria-label="Main navigation" className="space-y-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085] mb-2.5 px-2 hidden md:block">
              Health Intelligence
            </div>
            <div className="flex flex-row md:flex-col flex-wrap gap-1.5">
              {coreItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-3 text-xs sm:text-sm text-left px-3 py-2.5 rounded-xl transition ${
                      active
                        ? 'bg-[#18243A] text-white font-semibold border border-[#55E6A5]/30 shadow-xs'
                        : 'text-[#98A2B3] hover:text-white hover:bg-[#18243A]/60 font-medium border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-[#55E6A5]' : 'text-[#667085]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated Student Zone Highlight */}
          <div className="pt-2 md:pt-4 md:border-t md:border-white/10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#64D9F5]/80 mb-2 px-2 hidden md:block">
              Student Support
            </div>
            <button
              type="button"
              onClick={() => setActiveTab(studentItem.id)}
              aria-current={activeTab === studentItem.id ? 'page' : undefined}
              className={`w-full flex items-center gap-3 text-xs sm:text-sm text-left px-3 py-2.5 rounded-xl transition ${
                activeTab === studentItem.id
                  ? 'bg-gradient-to-r from-[#55E6A5]/20 to-[#64D9F5]/15 text-white font-semibold border border-[#55E6A5]/50 shadow-xs'
                  : 'bg-[#18243A]/50 text-[#D0D5DD] hover:text-white hover:bg-[#18243A] font-medium border border-white/5'
              }`}
            >
              <GraduationCap
                className={`w-4 h-4 shrink-0 ${
                  activeTab === studentItem.id ? 'text-[#55E6A5]' : 'text-[#64D9F5]'
                }`}
              />
              <span>{studentItem.label}</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Subtle Privacy Note on Desktop */}
      <div className="hidden md:block pt-6 border-t border-white/10 text-[11px] text-[#98A2B3] leading-relaxed">
        Local-first wellbeing intelligence. Non-diagnostic lifestyle support.
      </div>
    </aside>
  );
};
