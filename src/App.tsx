/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ScorecardView } from './components/ScorecardView';
import { ThenVsNowView } from './components/ThenVsNowView';
import { ActionPlanView } from './components/ActionPlanView';
import { DailyRecommendationView } from './components/DailyRecommendationView';
import { SmartFoodGuideView } from './components/SmartFoodGuideView';
import { JourneyTimelineView } from './components/JourneyTimelineView';
import { OnboardingModal } from './components/OnboardingModal';
import { ReturningCheckInModal } from './components/ReturningCheckInModal';
import { PrivacyModal } from './components/PrivacyModal';
import { RedFlagSafetyModal } from './components/RedFlagSafetyModal';
import { ProgressReportModal } from './components/ProgressReportModal';
import { FirstTimeDemoModal } from './components/FirstTimeDemoModal';
import { StudentWellbeingZone } from './components/student/StudentWellbeingZone';
import { DEMO_PERSONAS, DemoPersona } from './data/demoPersonas';
import { HealthCheckInRecord, UserProfile } from './types/health';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredHistory,
  saveStoredHistory,
  addCheckInRecord,
  deleteCheckInRecord,
  clearAllHealthData,
  getStoredPlanTasks,
  saveStoredPlanTasks,
} from './utils/storage';
import {
  Sparkles,
  Activity,
  UserCheck,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
    }
    return 'scorecard';
  });
  const [activePersonaId, setActivePersonaId] = useState<string | null>(null);

  // User State
  const [realProfile, setRealProfile] = useState<UserProfile | null>(null);
  const [realHistory, setRealHistory] = useState<HealthCheckInRecord[]>([]);

  // Demo Persona State (when selected)
  const [demoProfile, setDemoProfile] = useState<UserProfile | null>(null);
  const [demoHistory, setDemoHistory] = useState<HealthCheckInRecord[]>([]);

  // 7-day action tasks completion status
  const [savedPlanState, setSavedPlanState] = useState<Record<string, boolean>>({});

  // Modals
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showReturningCheckIn, setShowReturningCheckIn] = useState<boolean>(false);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);
  const [showRedFlags, setShowRedFlags] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [showFirstTimeDemo, setShowFirstTimeDemo] = useState<boolean>(false);

  // Load initial stored profile or set default demo persona for hackathon judges
  useEffect(() => {
    const storedP = getStoredProfile();
    const storedH = getStoredHistory();
    const storedTasks = getStoredPlanTasks();

    setRealProfile(storedP);
    setRealHistory(storedH);
    setSavedPlanState(storedTasks);

    // Check if first-time demo was already shown
    const demoShown = localStorage.getItem('healthmate_demo_shown');
    if (!demoShown) {
      setShowFirstTimeDemo(true);
      localStorage.setItem('healthmate_demo_shown', 'true');
    }

    // If no real profile exists yet, pre-load the student persona "Maya" for immediate judge inspection!
    if (!storedP) {
      const defaultDemo = DEMO_PERSONAS[0];
      setActivePersonaId(defaultDemo.id);
      setDemoProfile(defaultDemo.profile);
      setDemoHistory(defaultDemo.history);
      // Pre-fill a few completed tasks for demo visual richness
      setSavedPlanState({ 'day-1': true, 'day-2': true });
    }
  }, []);

  // Effective Active Data
  const isDemoActive = activePersonaId !== null;
  const currentProfile = isDemoActive ? demoProfile : realProfile;
  const currentHistory = isDemoActive ? demoHistory : realHistory;
  const latestRecord = currentHistory.length > 0 ? currentHistory[0] : null;

  // Persona Selection Handler
  const handleSelectPersona = (persona: DemoPersona | null) => {
    if (persona) {
      setActivePersonaId(persona.id);
      setDemoProfile(persona.profile);
      setDemoHistory(persona.history);
      setSavedPlanState({ 'day-1': true, 'day-2': true });
    } else {
      setActivePersonaId(null);
      setDemoProfile(null);
      setDemoHistory([]);
      const storedTasks = getStoredPlanTasks();
      setSavedPlanState(storedTasks);
    }
  };

  // Complete Onboarding
  const handleCompleteOnboarding = (profile: UserProfile, initialRecord: HealthCheckInRecord) => {
    saveStoredProfile(profile);
    const updatedHistory = addCheckInRecord(initialRecord);
    setRealProfile(profile);
    setRealHistory(updatedHistory);
    setActivePersonaId(null); // switch to real profile
    setShowOnboarding(false);
    setActiveTab('scorecard');
  };

  // Returning Check-in
  const handleReturningCheckIn = (
    newRecord: HealthCheckInRecord,
    updatedVitals?: Partial<UserProfile>
  ) => {
    if (isDemoActive) {
      // In demo mode, update demo history in-memory
      const updated = [newRecord, ...demoHistory];
      setDemoHistory(updated);
    } else {
      const updated = addCheckInRecord(newRecord);
      setRealHistory(updated);
      if (updatedVitals && realProfile) {
        const merged = { ...realProfile, ...updatedVitals };
        saveStoredProfile(merged);
        setRealProfile(merged);
      }
    }
    setShowReturningCheckIn(false);
    setActiveTab('comparison'); // navigate to comparison to see the delta!
  };

  // Toggle Action Task
  const handleToggleTask = (taskId: string) => {
    const nextState = {
      ...savedPlanState,
      [taskId]: !savedPlanState[taskId],
    };
    setSavedPlanState(nextState);
    if (!isDemoActive) {
      saveStoredPlanTasks(nextState);
    }
  };

  // Delete Individual Record
  const handleDeleteRecord = (recordId: string) => {
    if (isDemoActive) {
      setDemoHistory((prev) => prev.filter((r) => r.id !== recordId));
    } else {
      const updated = deleteCheckInRecord(recordId);
      setRealHistory(updated);
    }
  };

  // Clear All Data
  const handleClearAll = () => {
    clearAllHealthData();
    setRealProfile(null);
    setRealHistory([]);
    setSavedPlanState({});
    setActivePersonaId(null);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-[272px_1fr] min-h-screen md:h-screen bg-[#F5F7FB] text-[#172033]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="p-5 sm:p-8 lg:p-10 overflow-y-auto flex-1">
        {activeTab !== 'student-zone' && (
          <header className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-5 mb-8 pb-6 border-b border-[#E4E7EC]">
            <div>
              <div className="text-xs font-semibold tracking-wide text-[#0F766E] mb-1.5">
                HealthMate AI · Personal Wellbeing Platform
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-extrabold leading-tight tracking-tight text-[#172033] text-balance">
                My Health Journey
              </h1>
              <p className="max-w-2xl text-[#667085] text-sm sm:text-base mt-1.5 leading-relaxed">
                Transparent wellbeing progress scorecard, verified Then vs Now comparisons, adaptive 7-day action plans, daily navigator, cultural food intelligence, and clinical safety screening.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowFirstTimeDemo(true)}
                className="bg-white hover:bg-[#F5F7FB] text-[#101828] border border-[#D0D5DD] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
              >
                <HelpCircle className="w-4 h-4 text-[#0F766E]" />
                <span>Quick Tour</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentProfile) {
                    setShowReturningCheckIn(true);
                  } else {
                    setShowOnboarding(true);
                  }
                }}
                className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm border border-[#18243A] inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <span>New Check-in</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReport(true)}
                className="bg-white hover:bg-[#F5F7FB] text-[#172033] border border-[#D0D5DD] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0"
              >
                Progress Report
              </button>
              <button
                type="button"
                onClick={() => setShowRedFlags(true)}
                className="bg-white hover:bg-rose-50 text-[#172033] hover:text-rose-800 border border-[#D0D5DD] hover:border-rose-200 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0"
              >
                Safety Check
              </button>
              <button
                type="button"
                onClick={() => setShowPrivacy(true)}
                className="bg-white hover:bg-[#F5F7FB] text-[#667085] hover:text-[#172033] border border-[#D0D5DD] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0"
              >
                Privacy
              </button>
            </div>
          </header>
        )}

        {/* Student Wellbeing Zone View */}
        {activeTab === 'student-zone' && <StudentWellbeingZone />}

        {/* Existing Tab Views */}
        {activeTab !== 'student-zone' && !currentProfile && (
          <div className="hm-card rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-6">
            <div className="w-16 h-16 bg-[#101828] text-[#55E6A5] rounded-2xl flex items-center justify-center mx-auto shadow-md border border-[#55E6A5]/30">
              <Activity className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              Empowering Measurable Wellbeing Progress
            </h2>
            <p className="text-sm text-[#667085] leading-relaxed max-w-lg mx-auto">
              Go beyond ordinary health trackers. Experience a transparent lifestyle scorecard, verified Then vs Now comparisons, adaptive 7-day action plans, and clinical red-flag safety screening.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-sm px-6 py-3 rounded-xl shadow-md border border-[#55E6A5]/30"
              >
                Start Smart Onboarding
              </button>
              <button
                type="button"
                onClick={() => handleSelectPersona(DEMO_PERSONAS[0])}
                className="bg-[#F5F7FB] hover:bg-[#E4E7EC] text-[#172033] font-semibold text-sm px-6 py-3 rounded-xl border border-[#D0D5DD]"
              >
                Explore Judge Demo Mode
              </button>
            </div>
          </div>
        )}

        {activeTab !== 'student-zone' && currentProfile && (
          <>
            {activeTab === 'scorecard' && (
              <ScorecardView
                currentRecord={latestRecord}
                userProfile={currentProfile}
                onOpenNewCheckIn={() => setShowOnboarding(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'comparison' && (
              <ThenVsNowView
                history={currentHistory}
                onOpenCheckIn={() => setShowReturningCheckIn(true)}
              />
            )}
            {activeTab === 'action-plan' && (
              <ActionPlanView
                userProfile={currentProfile}
                latestRecord={latestRecord}
                savedPlanState={savedPlanState}
                onToggleTask={handleToggleTask}
                onOpenCheckIn={() => setShowReturningCheckIn(true)}
              />
            )}
            {activeTab === 'today' && (
              <DailyRecommendationView userProfile={currentProfile} />
            )}
            {activeTab === 'food-guide' && (
              <SmartFoodGuideView userProfile={currentProfile} />
            )}
            {activeTab === 'timeline' && (
              <JourneyTimelineView
                history={currentHistory}
                userProfile={currentProfile}
                onOpenNewCheckIn={() => setShowReturningCheckIn(true)}
                onOpenOnboarding={() => setShowOnboarding(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleCompleteOnboarding}
        initialProfile={realProfile}
        setActiveTab={setActiveTab}
      />

      <ReturningCheckInModal
        isOpen={showReturningCheckIn}
        onClose={() => setShowReturningCheckIn(false)}
        onSubmitCheckIn={handleReturningCheckIn}
        latestRecord={latestRecord}
        historyCount={currentHistory.length}
      />

      <PrivacyModal
        isOpen={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        userProfile={currentProfile}
        history={currentHistory}
        onDeleteRecord={handleDeleteRecord}
        onClearAllData={handleClearAll}
      />

      <RedFlagSafetyModal
        isOpen={showRedFlags}
        onClose={() => setShowRedFlags(false)}
      />

      <ProgressReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        userProfile={currentProfile}
        history={currentHistory}
        savedPlanState={savedPlanState}
      />

      <FirstTimeDemoModal
        isOpen={showFirstTimeDemo}
        onClose={() => setShowFirstTimeDemo(false)}
        onStartOnboarding={() => setShowOnboarding(true)}
        onSelectPersona={(persona) => {
          setActivePersonaId(persona.id);
          setDemoProfile(persona.profile);
          setDemoHistory(persona.history);
          setSavedPlanState({ 'day-1': true, 'day-2': true });
          setActiveTab('scorecard');
        }}
      />
    </div>
  );
}
