/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Heart,
  Activity,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AgeGroup, MainGoal, UserProfile, HealthCheckInRecord } from '../types/health';
import { screenRedFlags } from '../utils/healthCalculations';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile, initialRecord: HealthCheckInRecord) => void;
  initialProfile?: UserProfile | null;
  setActiveTab: (tab: string) => void;
}

const GOAL_OPTIONS: { id: MainGoal; label: string; desc: string }[] = [
  { id: 'improve_sleep', label: 'Restorative Sleep', desc: 'Consistent bedtime, latency reduction & refreshing rest' },
  { id: 'manage_stress', label: 'Stress & Mental Balance', desc: 'Mindful breathing, work decompression & emotional equilibrium' },
  { id: 'increase_activity', label: 'Active Movement', desc: 'Daily joyful movement, posture breaks & cardiovascular vitality' },
  { id: 'stay_hydrated', label: 'Optimal Hydration', desc: 'Regular cellular water intake throughout the day' },
  { id: 'balanced_nutrition', label: 'Nourishing Nutrition', desc: 'Balanced, non-restrictive cultural fuel and whole foods' },
  { id: 'general_wellness', label: 'Holistic Wellbeing', desc: 'Sustainable, balanced daily lifestyle routines' },
];

const ROUTINE_OPTIONS = [
  { id: 'student_schedule', label: 'Student Schedule (Classes, studying, screen time)' },
  { id: 'sedentary_desk', label: 'Desk / Office Worker (Prolonged seated computer work)' },
  { id: 'active_standing', label: 'Active / Standing (Retail, healthcare, trades)' },
  { id: 'shift_work', label: 'Shift / Irregular Hours (Rotating night/day schedules)' },
  { id: 'flexible', label: 'Flexible / Hybrid Schedule' },
];

const FOOD_PREF_OPTIONS = [
  'Omnivore',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Mediterranean',
  'High-Fiber',
  'Low-Sodium',
  'Gluten-Conscious',
];

const ALLERGY_OPTIONS = [
  'None',
  'Peanuts',
  'Tree Nuts',
  'Dairy / Lactose',
  'Gluten / Wheat',
  'Shellfish / Seafood',
  'Soy',
  'Eggs',
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialProfile,
  setActiveTab,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State - Part A: About You
  const [name, setName] = useState(initialProfile?.name || '');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(initialProfile?.ageGroup || '18_29');
  const [ageNumeric, setAgeNumeric] = useState<string>(
    initialProfile?.ageNumeric ? String(initialProfile.ageNumeric) : ''
  );
  const [mainGoal, setMainGoal] = useState<MainGoal>(initialProfile?.mainGoal || 'improve_sleep');
  const [heightCm, setHeightCm] = useState<string>(
    initialProfile?.heightCm ? String(initialProfile.heightCm) : ''
  );
  const [weightKg, setWeightKg] = useState<string>(
    initialProfile?.weightKg ? String(initialProfile.weightKg) : ''
  );
  const [dailyRoutine, setDailyRoutine] = useState<UserProfile['dailyRoutine']>(
    initialProfile?.dailyRoutine || 'student_schedule'
  );
  const [foodPreferences, setFoodPreferences] = useState<string[]>(
    initialProfile?.foodPreferences || ['Omnivore']
  );
  const [foodAllergies, setFoodAllergies] = useState<string[]>(
    initialProfile?.foodAllergies || ['None']
  );

  // Form State - Part B: Current Health
  const [conditionsText, setConditionsText] = useState(
    initialProfile?.existingConditions?.join(', ') || ''
  );
  const [medications, setMedications] = useState(initialProfile?.medications || '');
  const [symptomsText, setSymptomsText] = useState(
    initialProfile?.currentSymptoms?.join(', ') || ''
  );
  const [systolicBP, setSystolicBP] = useState<string>(
    initialProfile?.vitals?.systolicBP ? String(initialProfile.vitals.systolicBP) : ''
  );
  const [diastolicBP, setDiastolicBP] = useState<string>(
    initialProfile?.vitals?.diastolicBP ? String(initialProfile.vitals.diastolicBP) : ''
  );
  const [restingHR, setRestingHR] = useState<string>(
    initialProfile?.vitals?.restingHeartRate ? String(initialProfile.vitals.restingHeartRate) : ''
  );
  const [bloodGlucose, setBloodGlucose] = useState<string>(
    initialProfile?.vitals?.bloodGlucose ? String(initialProfile.vitals.bloodGlucose) : ''
  );
  const [receivingCare, setReceivingCare] = useState<UserProfile['receivingMedicalCare']>(
    initialProfile?.receivingMedicalCare || 'no'
  );

  // Form State - Part C: Lifestyle Habits (baseline check-in)
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [activeMinutes, setActiveMinutes] = useState<number>(30);
  const [hydrationLiters, setHydrationLiters] = useState<number>(2.0);
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [moodScore, setMoodScore] = useState<number>(3);
  const [eatingNotes, setEatingNotes] = useState<string>('');

  // Consent & Validation
  const [consentAgreed, setConsentAgreed] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showFoodSuggestion, setShowFoodSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');

  if (!isOpen) return null;
  if (showFoodSuggestion) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101828]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-[#E4E7EC] p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#101828] text-[#55E6A5] flex items-center justify-center mx-auto border border-[#55E6A5]/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#172033]">Personalized Food Suggestion</h2>
          <p className="text-sm text-[#667085] leading-relaxed">{suggestion}</p>
          <p className="font-semibold text-sm text-[#172033]">Would you like to go directly to the Smart Food Guide?</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setActiveTab('food-guide');
                onClose();
              }}
              className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] px-5 py-2.5 rounded-xl font-bold text-sm"
            >
              Yes
            </button>
            <button
              onClick={onClose}
              className="border border-[#D0D5DD] hover:bg-[#F5F7FB] text-[#172033] px-5 py-2.5 rounded-xl font-bold text-sm"
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Real-time red flag check
  const redFlagCheck = screenRedFlags(
    symptomsText ? symptomsText.split(',').map((s) => s.trim()) : [],
    {
      systolicBP: systolicBP ? Number(systolicBP) : undefined,
      diastolicBP: diastolicBP ? Number(diastolicBP) : undefined,
      restingHeartRate: restingHR ? Number(restingHR) : undefined,
      bloodGlucose: bloodGlucose ? Number(bloodGlucose) : undefined,
    }
  );

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      setFoodAllergies(['None']);
      return;
    }
    const filtered = foodAllergies.filter((a) => a !== 'None');
    if (filtered.includes(allergy)) {
      const next = filtered.filter((a) => a !== allergy);
      setFoodAllergies(next.length === 0 ? ['None'] : next);
    } else {
      setFoodAllergies([...filtered, allergy]);
    }
  };

  const togglePreference = (pref: string) => {
    if (foodPreferences.includes(pref)) {
      if (foodPreferences.length > 1) {
        setFoodPreferences(foodPreferences.filter((p) => p !== pref));
      }
    } else {
      setFoodPreferences([...foodPreferences, pref]);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (ageNumeric && (Number(ageNumeric) < 5 || Number(ageNumeric) > 120)) {
        setErrorMsg('Please enter a realistic age between 5 and 120 years.');
        return false;
      }
      return true;
    }
    if (currentStep === 2) {
      if (systolicBP && (Number(systolicBP) < 50 || Number(systolicBP) > 260)) {
        setErrorMsg('Systolic blood pressure should be a valid reading (50–260 mmHg).');
        return false;
      }
      if (diastolicBP && (Number(diastolicBP) < 30 || Number(diastolicBP) > 160)) {
        setErrorMsg('Diastolic blood pressure should be a valid reading (30–160 mmHg).');
        return false;
      }
      return true;
    }
    if (currentStep === 3) {
      if (sleepHours < 0 || sleepHours > 24) {
        setErrorMsg('Sleep hours must be between 0 and 24.');
        return false;
      }
      if (hydrationLiters < 0 || hydrationLiters > 10) {
        setErrorMsg('Hydration must be between 0 and 10 Liters.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    if (!consentAgreed) {
      setErrorMsg('You must agree to the privacy statement to save your health journey locally.');
      return;
    }

    const now = new Date();
    const dateLabel = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const profile: UserProfile = {
      id: initialProfile?.id || `user-${Date.now()}`,
      createdAt: initialProfile?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      name: name.trim() || 'Health Explorer',
      ageGroup,
      ageNumeric: ageNumeric ? Number(ageNumeric) : undefined,
      mainGoal,
      heightCm: heightCm ? Number(heightCm) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      dailyRoutine,
      foodPreferences,
      foodAllergies,
      existingConditions: conditionsText
        ? conditionsText.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      medications: medications.trim(),
      currentSymptoms: symptomsText
        ? symptomsText.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      vitals: {
        systolicBP: systolicBP ? Number(systolicBP) : undefined,
        diastolicBP: diastolicBP ? Number(diastolicBP) : undefined,
        bpUnit: 'mmHg',
        bpDate: systolicBP ? dateLabel : undefined,
        restingHeartRate: restingHR ? Number(restingHR) : undefined,
        hrUnit: 'bpm',
        hrDate: restingHR ? dateLabel : undefined,
        bloodGlucose: bloodGlucose ? Number(bloodGlucose) : undefined,
        glucoseUnit: 'mg/dL',
        glucoseDate: bloodGlucose ? dateLabel : undefined,
      },
      receivingMedicalCare: receivingCare,
      consentGiven: true,
      consentTimestamp: now.toISOString(),
      isDemo: false,
    };

    const initialRecord: HealthCheckInRecord = {
      id: `record-${Date.now()}`,
      timestamp: now.toISOString(),
      dateLabel,
      weekLabel: 'Week 1 (Baseline)',
      sleepHours,
      sleepQuality,
      activeMinutes,
      hydrationLiters,
      stressLevel,
      moodScore,
      eatingRoutineNotes: eatingNotes.trim(),
      symptomsReported: profile.currentSymptoms,
      notes: 'Initial onboarding baseline check-in.',
      isDemoRecord: false,
    };

    onComplete(profile, initialRecord);
    setSuggestion(`Based on your goal of ${profile.mainGoal.replace('_', ' ')}, consider incorporating nutrient-dense foods like leafy greens or lean proteins into your meals today.`);
    setShowFoodSuggestion(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101828]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-[#E4E7EC] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#18243A] flex items-center justify-between bg-[#101828] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18243A] border border-[#55E6A5]/30 text-[#55E6A5] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Personalized Health Onboarding
              </h2>
              <p className="text-xs text-[#98A2B3]">
                Step {step} of 4: {step === 1 ? 'About You' : step === 2 ? 'Your Current Health' : step === 3 ? 'Lifestyle Habits' : 'Review & Consent'}
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

        {/* Progress Bar */}
        <div className="w-full bg-[#18243A] h-1.5">
          <div
            className="bg-gradient-to-r from-[#55E6A5] to-[#64D9F5] h-1.5 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Emergency Red Flag Notice if triggered during entry */}
          {redFlagCheck.isUrgent && (
            <div className="p-4 bg-rose-500 text-white rounded-xl shadow-md space-y-2 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{redFlagCheck.title}</span>
              </div>
              <p className="text-xs leading-relaxed text-rose-100">
                {redFlagCheck.description} {redFlagCheck.vitalsWarning}
              </p>
              <div className="bg-white/10 p-2.5 rounded-lg text-xs font-semibold">
                🚨 Please stop and contact emergency services (911 / 112 / 999) immediately. Do not delay care for this questionnaire.
              </div>
            </div>
          )}

          {/* STEP 1: ABOUT YOU */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Section A: Personal Background & Preferences
                </h3>
                <p className="text-xs text-slate-500">
                  Tailors recommendations to your life stage and schedule. Sensitive fields are optional.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Name or Nickname (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya, Alex, Jordan"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age Group <span className="text-emerald-600">*</span>
                  </label>
                  <select
                    aria-label="Select Age Group"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="under_18">Under 18 (School / Youth)</option>
                    <option value="18_29">18 – 29 Years (Young Adult)</option>
                    <option value="30_49">30 – 49 Years (Adult)</option>
                    <option value="50_64">50 – 64 Years (Mature Adult)</option>
                    <option value="65_plus">65+ Years (Senior)</option>
                  </select>
                  {ageGroup === 'under_18' && (
                    <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Protected minor mode: strictly no restrictive dieting, calorie counting, or supplements.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Exact Age (Optional)
                  </label>
                  <input
                    type="number"
                    value={ageNumeric}
                    onChange={(e) => setAgeNumeric(e.target.value)}
                    placeholder="e.g. 17"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Main Health or Wellbeing Goal <span className="text-emerald-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {GOAL_OPTIONS.map((goal) => (
                    <button
                      type="button"
                      key={goal.id}
                      onClick={() => setMainGoal(goal.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        mainGoal === goal.id
                          ? 'border-[#101828] bg-[#101828] text-white'
                          : 'border-[#E4E7EC] hover:border-[#CBD5E1] bg-[#F5F7FB] text-[#172033]'
                      }`}
                    >
                      <div className={`text-xs font-bold ${mainGoal === goal.id ? 'text-[#55E6A5]' : 'text-[#172033]'}`}>{goal.label}</div>
                      <div className={`text-[11px] leading-tight mt-0.5 ${mainGoal === goal.id ? 'text-[#D0D5DD]' : 'text-[#667085]'}`}>{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Height in cm (Optional)
                  </label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="e.g. 172"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weight in kg (Optional)
                  </label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="e.g. 65"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Schedule & Routine
                </label>
                <select
                  aria-label="Select Daily Routine"
                  value={dailyRoutine}
                  onChange={(e) => setDailyRoutine(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none bg-white"
                >
                  {ROUTINE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Food Preferences & Cultural Style
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FOOD_PREF_OPTIONS.map((pref) => {
                    const sel = foodPreferences.includes(pref);
                    return (
                      <button
                        type="button"
                        key={pref}
                        onClick={() => togglePreference(pref)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                          sel
                            ? 'bg-[#101828] text-[#55E6A5] border-[#101828] font-semibold'
                            : 'bg-[#F5F7FB] text-[#172033] border-[#E4E7EC] hover:border-[#CBD5E1]'
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Food Allergies or Intolerances
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALLERGY_OPTIONS.map((allergy) => {
                    const sel = foodAllergies.includes(allergy);
                    return (
                      <button
                        type="button"
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                          sel
                            ? 'bg-[#18243A] text-[#64D9F5] border-[#18243A] font-semibold'
                            : 'bg-[#F5F7FB] text-[#172033] border-[#E4E7EC] hover:border-[#CBD5E1]'
                        }`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: YOUR CURRENT HEALTH */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Section B: Health Context & Clinical Safety
                </h3>
                <p className="text-xs text-slate-500">
                  All medical information is strictly optional. We never require disclosure of sensitive conditions.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Existing Medical Conditions (Diagnosed by a doctor)
                </label>
                <input
                  type="text"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  placeholder="e.g. Asthma, Type 2 Diabetes, Mild Hypertension, or leave blank"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Medications (Optional)
                </label>
                <input
                  type="text"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  placeholder="e.g. Inhaler as needed, Daily multivitamin, or leave blank"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-0.5">
                  We will never prescribe, recommend altering, or advise stopping medications.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Symptoms or Health Concerns
                </label>
                <textarea
                  rows={2}
                  value={symptomsText}
                  onChange={(e) => setSymptomsText(e.target.value)}
                  placeholder="e.g. Mild afternoon fatigue, tight shoulders from studying"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>

              {/* Vitals Measurements */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Health Measurements (Optional Self-Reported Vitals)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-0.5">
                      Systolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-0.5">
                      Diastolic BP (mmHg)
                    </label>
                    <input
                      type="number"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-0.5">
                      Resting HR (bpm)
                    </label>
                    <input
                      type="number"
                      value={restingHR}
                      onChange={(e) => setRestingHR(e.target.value)}
                      placeholder="e.g. 70"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 font-medium mb-0.5">
                      Blood Glucose (mg/dL)
                    </label>
                    <input
                      type="number"
                      value={bloodGlucose}
                      onChange={(e) => setBloodGlucose(e.target.value)}
                      placeholder="e.g. 95"
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Are you currently under the active care of a doctor or clinic?
                </label>
                <div className="flex gap-4">
                  {(['no', 'yes', 'prefer_not_to_say'] as const).map((opt) => (
                    <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="receivingCare"
                        checked={receivingCare === opt}
                        onChange={() => setReceivingCare(opt)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>
                        {opt === 'no' ? 'No' : opt === 'yes' ? 'Yes' : 'Prefer not to say'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: LIFESTYLE HABITS (Baseline Check-in) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Section C: Lifestyle Habits & Baseline Metrics
                </h3>
                <p className="text-xs text-slate-500">
                  This forms your starting point for the Then vs Now comparison and transparent scorecard.
                </p>
              </div>

              {/* Sleep Hours & Quality */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    How many hours do you usually sleep?
                  </label>
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {sleepHours} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    How would you rate your sleep restfulness / quality?
                  </label>
                  <div className="flex justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setSleepQuality(lvl)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition ${
                          sleepQuality === lvl
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl === 1 ? '1 (Poor)' : lvl === 5 ? '5 (Great)' : lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physical Activity & Hydration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800">
                      Physical Activity (mins/day)
                    </label>
                    <span className="text-xs font-bold text-emerald-700">
                      {activeMinutes} mins
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={activeMinutes}
                    onChange={(e) => setActiveMinutes(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Walking, biking, sports, gym, or joyful active movement.
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800">
                      Water Intake (Liters/day)
                    </label>
                    <span className="text-xs font-bold text-cyan-700">
                      {hydrationLiters} L (~{Math.round(hydrationLiters * 4)} glasses)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="4.0"
                    step="0.1"
                    value={hydrationLiters}
                    onChange={(e) => setHydrationLiters(Number(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Balanced daily hydration. Avoid forcing extreme water amounts.
                  </p>
                </div>
              </div>

              {/* Stress & Mood */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800">
                      Stress Level (1 = Low, 5 = High)
                    </label>
                    <span className="text-xs font-bold text-amber-700">
                      {stressLevel}/5
                    </span>
                  </div>
                  <div className="flex justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setStressLevel(lvl)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition ${
                          stressLevel === lvl
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800">
                      General Mood (1 = Low, 5 = Energetic)
                    </label>
                    <span className="text-xs font-bold text-teal-700">
                      {moodScore}/5
                    </span>
                  </div>
                  <div className="flex justify-between gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setMoodScore(lvl)}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition ${
                          moodScore === lvl
                            ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What does a typical day&apos;s eating routine look like? (Optional)
                </label>
                <input
                  type="text"
                  value={eatingNotes}
                  onChange={(e) => setEatingNotes(e.target.value)}
                  placeholder="e.g. Oatmeal breakfast, packed school/work lunch, family dinner"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW ANSWERS & PRIVACY CONSENT */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Section D: Review Your Answers & Privacy Consent
                </h3>
                <p className="text-xs text-slate-500">
                  Please review the summary below. You can jump back to edit any section.
                </p>
              </div>

              {/* Review Summary Cards */}
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">About You</span>
                    <p>Name: {name || 'Anonymous'}</p>
                    <p>Age: {ageNumeric ? `${ageNumeric} yrs` : ageGroup}</p>
                    <p>Goal: {GOAL_OPTIONS.find((g) => g.id === mainGoal)?.label}</p>
                    <p>Diet Preferences: {foodPreferences.join(', ')}</p>
                    <p>Allergies: {foodAllergies.join(', ')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Current Health & Vitals</span>
                    <p>Conditions: {conditionsText || 'None reported'}</p>
                    <p>Medications: {medications || 'None'}</p>
                    <p>Symptoms: {symptomsText || 'None reported'}</p>
                    <p>
                      Vitals:{' '}
                      {systolicBP && diastolicBP ? `BP ${systolicBP}/${diastolicBP} mmHg, ` : ''}
                      {restingHR ? `HR ${restingHR} bpm, ` : ''}
                      {bloodGlucose ? `Glucose ${bloodGlucose} mg/dL` : ''}
                      {!systolicBP && !restingHR && !bloodGlucose && 'None entered (Optional)'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Baseline Habits</span>
                    <p>Sleep: {sleepHours} hrs (Restfulness: {sleepQuality}/5)</p>
                    <p>Movement: {activeMinutes} active minutes/day</p>
                    <p>Hydration: {hydrationLiters} Liters/day</p>
                    <p>Stress: {stressLevel}/5 • Mood: {moodScore}/5</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Privacy Consent Agreement */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-950">
                    Privacy-First Local Storage Agreement
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  HealthMate AI stores your data strictly inside your browser’s local storage. Your health information is
                  never transmitted to third-party ad networks or exposed in public URLs. You may view, edit, or wipe all records
                  at any time via the Privacy Controls button in the header.
                </p>
                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-emerald-950">
                    I consent to saving my self-reported wellbeing data in my browser for personal tracking.
                  </span>
                </label>
              </div>

              {/* Non-Diagnostic Clinical Disclaimer */}
              <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-slate-500 mt-0.5" />
                <span>
                  <strong>Ethical AI Statement:</strong> HealthMate AI provides educational wellbeing habits. It does not
                  diagnose medical illnesses or prescribe clinical treatments. If you experience severe symptoms, consult a
                  qualified doctor or emergency services.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#E4E7EC] bg-[#F5F7FB] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-[#172033] hover:text-[#101828] px-3 py-2 rounded-xl text-xs font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="text-[#667085] hover:text-[#172033] px-3 py-2 text-xs font-medium transition"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!consentAgreed}
              className="flex items-center gap-1.5 bg-[#101828] hover:bg-[#18243A] disabled:opacity-50 text-[#55E6A5] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Generate My Health Journey
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
