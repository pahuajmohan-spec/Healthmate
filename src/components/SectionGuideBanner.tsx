/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Sparkles, X, ChevronRight, CheckCircle2 } from 'lucide-react';

interface SectionGuideBannerProps {
  sectionTitle: string;
  description: string;
  steps: { title: string; detail: string }[];
}

export const SectionGuideBanner: React.FC<SectionGuideBannerProps> = ({
  sectionTitle,
  description,
  steps,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-[#101828] to-[#18243A] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#55E6A5]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#18243A] border border-[#55E6A5]/40 flex items-center justify-center text-[#55E6A5] shrink-0 mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-[#55E6A5]/20 text-[#55E6A5] px-2 py-0.5 rounded-full font-bold">
              Quick Guide & Demo
            </span>
            <span className="text-xs text-[#98A2B3]">Don't know how to use? Here is how:</span>
          </div>
          <h4 className="text-sm sm:text-base font-bold text-white">
            How to use {sectionTitle}
          </h4>
          <p className="text-xs text-[#D0D5DD] leading-relaxed max-w-xl">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-[#55E6A5] hover:bg-[#40c98f] text-[#101828] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 self-end sm:self-center"
      >
        <Sparkles className="w-3.5 h-3.5" /> View Step-by-Step Demo
      </button>

      {/* Modal Dialog for Guide */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#101828]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-[#172033] w-full max-w-lg rounded-3xl shadow-2xl border border-[#D0D5DD] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="bg-[#101828] text-white px-6 py-4 flex items-center justify-between border-b border-[#18243A]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#55E6A5]" />
                <h3 className="text-base font-extrabold text-white">Guide: {sectionTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                aria-label="Close guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-[#667085] leading-relaxed">
                Follow these simple steps to make the most of this section in HealthMate AI:
              </p>

              <div className="space-y-3">
                {steps.map((st, idx) => (
                  <div key={idx} className="bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EC] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#101828] text-[#55E6A5] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-[#172033]">{st.title}</h5>
                      <p className="text-xs text-[#667085] leading-relaxed">{st.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F5F7FB] px-6 py-3.5 border-t border-[#E4E7EC] flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-[#101828] hover:bg-[#18243A] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Got it, let's use it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
