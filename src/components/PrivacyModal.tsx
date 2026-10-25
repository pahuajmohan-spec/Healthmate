/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Trash2,
  Download,
  Eye,
  Lock,
} from 'lucide-react';
import { HealthCheckInRecord, UserProfile } from '../types/health';
import { exportHealthDataJSON } from '../utils/storage';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  history: HealthCheckInRecord[];
  onDeleteRecord: (recordId: string) => void;
  onClearAllData: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  history,
  onDeleteRecord,
  onClearAllData,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    const jsonStr = exportHealthDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthmate-my-health-journey-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101828]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-[#E4E7EC] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#18243A] flex items-center justify-between bg-[#101828] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18243A] border border-[#55E6A5]/30 text-[#55E6A5] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Privacy Controls & Data Ownership
              </h2>
              <p className="text-xs text-[#98A2B3]">
                You own 100% of your health records. Zero telemetry, zero public URLs.
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Privacy Guarantees */}
          <div className="bg-[#55E6A5]/12 border border-[#55E6A5]/35 rounded-2xl p-4 text-xs text-[#172033] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#101828]">
              <Lock className="w-4 h-4 text-[#0F766E]" />
              <span>Privacy-First Architecture Guarantee</span>
            </div>
            <ul className="space-y-1 leading-relaxed text-[#172033]">
              <li>• <strong>Local-Only Storage:</strong> Data is saved exclusively inside your browser&apos;s isolated LocalStorage.</li>
              <li>• <strong>No URL Exposure:</strong> Health measurements and questionnaire answers are never attached to URLs or shareable links.</li>
              <li>• <strong>No Ad Networks:</strong> No cross-site tracking or third-party marketing brokers.</li>
            </ul>
          </div>

          {/* Manage Saved Check-in Records */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172033]">
                Saved Check-in Records ({history.length})
              </span>
              <button
                onClick={handleDownload}
                className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-[#667085] italic p-3 bg-[#F5F7FB] rounded-xl">
                No check-in entries saved yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {history.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-[#F5F7FB] hover:bg-[#E4E7EC]/60 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#172033]">{rec.weekLabel}</span>
                      <span className="text-[#667085] ml-2">({rec.dateLabel})</span>
                      <div className="text-[11px] text-[#667085] mt-0.5 tabular-nums">
                        {rec.sleepHours}h sleep · {rec.hydrationLiters}L water · {rec.activeMinutes}m active
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteRecord(rec.id)}
                      className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition"
                      title="Delete this record"
                      aria-label={`Delete record ${rec.weekLabel}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Raw JSON Data Viewer Toggle */}
          <div className="border-t border-[#E4E7EC] pt-3">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="text-xs font-bold text-[#667085] hover:text-[#172033] flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'Hide Raw Local JSON' : 'Inspect Raw Local JSON (Audit)'}</span>
            </button>
            {showRawJson && (
              <pre className="mt-2 p-3.5 bg-[#101828] text-[#55E6A5] text-[10px] rounded-xl overflow-x-auto max-h-48 font-mono leading-tight">
                {exportHealthDataJSON()}
              </pre>
            )}
          </div>

          {/* Clear All Data */}
          <div className="border-t border-[#E4E7EC] pt-4">
            {!confirmClearAll ? (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All My Stored Health Data (Wipe Clean)</span>
              </button>
            ) : (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5">
                <p className="text-xs text-rose-900 font-semibold">
                  Are you sure? This will permanently wipe your profile, check-in history, and action plans from this browser.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClearAllData();
                      setConfirmClearAll(false);
                      onClose();
                    }}
                    className="bg-rose-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg hover:bg-rose-700"
                  >
                    Yes, Permanently Delete
                  </button>
                  <button
                    onClick={() => setConfirmClearAll(false)}
                    className="bg-white border border-[#D0D5DD] text-[#172033] font-semibold text-xs px-3.5 py-1.5 rounded-lg hover:bg-[#F5F7FB]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E7EC] bg-[#F5F7FB] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#101828] hover:bg-[#18243A] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
