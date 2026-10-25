/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { screenRedFlags } from '../utils/healthCalculations';

interface RedFlagSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RedFlagSafetyModal: React.FC<RedFlagSafetyModalProps> = ({ isOpen, onClose }) => {
  const [symptomInput, setSymptomInput] = useState('');
  const [systolicInput, setSystolicInput] = useState('');
  const [diastolicInput, setDiastolicInput] = useState('');
  const [heartRateInput] = useState('');

  if (!isOpen) return null;

  const checkResult = screenRedFlags(
    symptomInput ? symptomInput.split(',').map((s) => s.trim()) : [],
    {
      systolicBP: systolicInput ? Number(systolicInput) : undefined,
      diastolicBP: diastolicInput ? Number(diastolicInput) : undefined,
      restingHeartRate: heartRateInput ? Number(heartRateInput) : undefined,
    }
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101828]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-[#E4E7EC] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#18243A] flex items-center justify-between bg-[#101828] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                Health Red-Flag Safety Screener
              </h2>
              <p className="text-xs text-[#98A2B3]">
                Clinical safety protocol to triage acute symptoms and dangerous vitals
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-[#98A2B3] hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Priority Emergency Callout Banner */}
          <div className="bg-rose-600 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">Critical Safety Principle</span>
              <span className="text-rose-100">Never delay acute care</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold leading-relaxed">
              If you or anyone around you is experiencing life-threatening symptoms, <strong>do not complete questionnaires or wait for wellness advice</strong>. Call emergency services immediately.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-white/15 p-2 rounded-xl text-center">
                <span className="text-[10px] text-rose-100 block">US & Canada</span>
                <span className="text-base font-extrabold font-mono tabular-nums">911</span>
              </div>
              <div className="bg-white/15 p-2 rounded-xl text-center">
                <span className="text-[10px] text-rose-100 block">Europe & India</span>
                <span className="text-base font-extrabold font-mono tabular-nums">112</span>
              </div>
              <div className="bg-white/15 p-2 rounded-xl text-center">
                <span className="text-[10px] text-rose-100 block">United Kingdom</span>
                <span className="text-base font-extrabold font-mono tabular-nums">999</span>
              </div>
              <div className="bg-white/15 p-2 rounded-xl text-center">
                <span className="text-[10px] text-rose-100 block">Crisis / Mental</span>
                <span className="text-base font-extrabold font-mono tabular-nums">988</span>
              </div>
            </div>
          </div>

          {/* Interactive Screener Form */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#172033] block">
              Test or Report Symptoms for Safety Guidance:
            </label>
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              placeholder="e.g. Chest pain, shortness of breath, severe headache, dizziness..."
              className="hm-input w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl"
            />

            {/* Quick Test Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[#667085] font-medium mr-1">Simulate trigger:</span>
              <button
                type="button"
                onClick={() => setSymptomInput('Sudden chest pain and shortness of breath')}
                className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg font-medium"
              >
                Chest Pain & Dyspnea
              </button>
              <button
                type="button"
                onClick={() => {
                  setSystolicInput('185');
                  setDiastolicInput('115');
                }}
                className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg font-medium"
              >
                BP &gt; 180 (Crisis)
              </button>
              <button
                type="button"
                onClick={() => setSymptomInput('Swelling in throat and hives after eating')}
                className="text-[11px] bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-lg font-medium"
              >
                Anaphylaxis
              </button>
            </div>
          </div>

          {/* Screener Evaluation Output */}
          <div
            className={`p-4 rounded-2xl border space-y-3 transition-all ${
              checkResult.severity === 'emergency'
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : checkResult.severity === 'concerning'
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-[#55E6A5]/12 border-[#55E6A5]/40 text-[#172033]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{checkResult.title}</span>
            </div>

            <p className="text-xs leading-relaxed">{checkResult.description}</p>

            {checkResult.vitalsWarning && (
              <p className="text-xs font-bold text-rose-700 bg-white/80 p-2.5 rounded-xl border border-rose-200">
                {checkResult.vitalsWarning}
              </p>
            )}

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold block">
                Required Safety Actions:
              </span>
              <ul className="space-y-1 text-xs">
                {checkResult.immediateActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E7EC] bg-[#F5F7FB] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#101828] hover:bg-[#18243A] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
          >
            Close Safety Screener
          </button>
        </div>
      </div>
    </div>
  );
};
