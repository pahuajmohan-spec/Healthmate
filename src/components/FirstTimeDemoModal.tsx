/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  UserCheck,
  Sparkles,
  FileText,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  X,
  Play,
} from 'lucide-react';
import { DEMO_PERSONAS, DemoPersona } from '../data/demoPersonas';

interface FirstTimeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnboarding: () => void;
  onSelectPersona: (persona: DemoPersona) => void;
}

export const FirstTimeDemoModal: React.FC<FirstTimeDemoModalProps> = ({
  isOpen,
  onClose,
  onStartOnboarding,
  onSelectPersona,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to HealthMate AI',
      subtitle: 'Your intelligent companion for measurable wellbeing progress',
      description:
        'HealthMate AI helps you track sleep, stress, hydration, and nutrition. Whether you are a student recovering after school or an adult managing daily wellness, HealthMate provides personalized, actionable insights.',
      icon: Activity,
      badge: 'Platform Overview',
      visual: (
        <div className="bg-[#101828] text-white p-6 rounded-2xl border border-[#55E6A5]/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-[#55E6A5] tracking-wider">HealthMate AI v2.5</span>
            <span className="bg-[#55E6A5]/20 text-[#55E6A5] text-[10px] font-bold px-2.5 py-1 rounded-full">Interactive Demo</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-[#18243A] p-3 rounded-xl border border-white/5">
              <div className="text-[11px] text-[#98A2B3]">Overall Health Score</div>
              <div className="text-xl font-extrabold text-[#55E6A5]">84 / 100</div>
            </div>
            <div className="bg-[#18243A] p-3 rounded-xl border border-white/5">
              <div className="text-[11px] text-[#98A2B3]">Active Plan</div>
              <div className="text-xl font-extrabold text-[#64D9F5]">7-Day Recovery</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Scorecard & Daily Check-In',
      subtitle: 'Measure key pillars of your daily wellbeing',
      description:
        'Log your daily sleep hours, hydration glasses, stress level (1-10), and energy. HealthMate instantly calculates your weighted wellbeing score and provides tailored recommendations.',
      icon: UserCheck,
      badge: 'Pillar 1',
      visual: (
        <div className="bg-white text-[#172033] p-6 rounded-2xl border border-[#D0D5DD] shadow-md space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0F766E]">
            <CheckCircle2 className="w-4 h-4 text-[#0F766E]" /> Daily Health Scorecard
          </div>
          <div className="space-y-2 text-xs text-[#667085]">
            <div className="flex justify-between p-2 bg-[#F5F7FB] rounded-lg">
              <span>Sleep Quality (7.5 hrs)</span>
              <span className="font-bold text-[#172033]">Optimal</span>
            </div>
            <div className="flex justify-between p-2 bg-[#F5F7FB] rounded-lg">
              <span>Hydration (6 glasses)</span>
              <span className="font-bold text-amber-600">Good</span>
            </div>
            <div className="flex justify-between p-2 bg-[#F5F7FB] rounded-lg">
              <span>Stress Level (4/10)</span>
              <span className="font-bold text-[#55E6A5]">Balanced</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Then vs Now Comparisons',
      subtitle: 'Verify your lifestyle delta over time',
      description:
        'Compare your starting baseline metrics against your latest check-in. See clear percentage improvements in sleep consistency, stress reduction, and hydration habits.',
      icon: Sparkles,
      badge: 'Pillar 2',
      visual: (
        <div className="bg-white text-[#172033] p-6 rounded-2xl border border-[#D0D5DD] shadow-md space-y-3 text-left">
          <div className="text-xs font-bold text-[#101828] uppercase tracking-wide">Verified Progress Delta</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F5F7FB] rounded-xl border border-[#E4E7EC]">
              <div className="text-[10px] text-[#667085]">Sleep Consistency</div>
              <div className="text-lg font-bold text-[#0F766E]">+22.5%</div>
            </div>
            <div className="p-3 bg-[#F5F7FB] rounded-xl border border-[#E4E7EC]">
              <div className="text-[10px] text-[#667085]">Stress Reduction</div>
              <div className="text-lg font-bold text-[#55E6A5]">-35.0%</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Student Wellbeing Zone',
      subtitle: 'Specialized support for school fatigue and academic stress',
      description:
        'Designed for students returning home tired from school. Answer quick prompts about homework, energy levels, and hunger to receive an instant after-school recovery plan and balanced snack guide.',
      icon: GraduationCap,
      badge: 'Specialized Zone',
      visual: (
        <div className="bg-gradient-to-br from-[#101828] to-[#18243A] text-white p-6 rounded-2xl border border-[#64D9F5]/30 shadow-lg space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64D9F5]">
            <GraduationCap className="w-4 h-4 text-[#55E6A5]" /> Student After-School Recovery
          </div>
          <p className="text-xs text-[#98A2B3] leading-relaxed">
            Suggests restorative rest, light stretching, manageable homework transition, and nutritious local snacks (e.g. fruit with nuts, roti with egg/chana).
          </p>
          <div className="bg-white/10 p-2.5 rounded-xl text-[11px] font-medium text-[#55E6A5]">
            Instant recovery plan generated in 1 click!
          </div>
        </div>
      ),
    },
    {
      title: 'Smart Food Guide & Safety',
      subtitle: 'Cultural nutrition intelligence & clinical screening',
      description:
        'Explore smart food recommendations tailored to your dietary preferences, allergies, and regional ingredients. Includes red-flag safety guidance and complete local privacy compliance.',
      icon: FileText,
      badge: 'Nutrition & Safety',
      visual: (
        <div className="bg-white text-[#172033] p-6 rounded-2xl border border-[#D0D5DD] shadow-md space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-[#101828]">
            <ShieldCheck className="w-4 h-4 text-[#55E6A5]" /> Clinical Safety & Privacy
          </div>
          <div className="text-xs text-[#667085] space-y-1">
            <div>• 100% Client-side local data privacy</div>
            <div>• Red-flag medical symptom screening</div>
            <div>• Cultural food intelligence for local meals</div>
          </div>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#101828]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D0D5DD] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#101828] text-white px-6 py-5 flex items-center justify-between border-b border-[#18243A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18243A] border border-[#55E6A5]/30 flex items-center justify-center text-[#55E6A5]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#55E6A5]">
                Platform Demo & Walkthrough ({currentStep + 1} of {steps.length})
              </div>
              <h2 className="text-lg font-extrabold text-white">How to Use HealthMate AI</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            aria-label="Close demo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          <div className="flex items-center gap-2">
            <span className="bg-[#55E6A5]/15 text-[#0F766E] text-xs font-bold px-3 py-1 rounded-full border border-[#55E6A5]/30">
              {current.badge}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-extrabold text-[#172033] tracking-tight mb-1">
              {current.title}
            </h3>
            <p className="text-sm font-semibold text-[#0F766E] mb-3">
              {current.subtitle}
            </p>
            <p className="text-sm text-[#667085] leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Visual Showcase */}
          <div className="py-2">
            {current.visual}
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-1.5 pt-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-8 bg-[#101828]' : 'w-2 bg-[#D0D5DD]'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#F5F7FB] px-6 py-4 border-t border-[#E4E7EC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="bg-white hover:bg-[#E4E7EC] text-[#172033] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#D0D5DD] flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-[#667085] hover:text-[#172033] text-xs font-semibold px-3 py-2"
            >
              Skip Demo
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                onSelectPersona(DEMO_PERSONAS[0]);
                onClose();
              }}
              className="bg-white hover:bg-[#101828] hover:text-white text-[#101828] border border-[#101828] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 text-[#55E6A5]" /> Explore Judge Demo
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-sm border border-[#18243A] flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartOnboarding();
                }}
                className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md border border-[#55E6A5]/30 flex items-center gap-2"
              >
                Get Started Now <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
