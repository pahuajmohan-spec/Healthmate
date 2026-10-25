/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AgeGroup = 'under_18' | '18_29' | '30_49' | '50_64' | '65_plus';

export type MainGoal =
  | 'improve_sleep'
  | 'increase_activity'
  | 'stay_hydrated'
  | 'manage_stress'
  | 'balanced_nutrition'
  | 'general_wellness';

export interface VitalsData {
  systolicBP?: number;
  diastolicBP?: number;
  bpUnit?: string;
  bpDate?: string;
  restingHeartRate?: number;
  hrUnit?: string;
  hrDate?: string;
  bloodGlucose?: number;
  glucoseUnit?: string;
  glucoseDate?: string;
}

export interface UserProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  ageGroup: AgeGroup;
  ageNumeric?: number;
  name?: string;
  mainGoal: MainGoal;
  heightCm?: number;
  weightKg?: number;
  dailyRoutine: 'student_schedule' | 'sedentary_desk' | 'active_standing' | 'shift_work' | 'flexible';
  foodPreferences: string[];
  foodAllergies: string[];
  existingConditions: string[];
  medications?: string;
  currentSymptoms: string[];
  vitals?: VitalsData;
  receivingMedicalCare: 'yes' | 'no' | 'prefer_not_to_say';
  consentGiven: boolean;
  consentTimestamp?: string;
  isDemo?: boolean;
}

export interface HealthCheckInRecord {
  id: string;
  timestamp: string; // ISO date
  dateLabel: string;
  weekLabel: string;
  sleepHours: number;
  sleepQuality: number; // 1-5
  activeMinutes: number; // minutes of movement
  hydrationLiters: number; // in Liters
  stressLevel: number; // 1-5 (1=low, 5=high)
  moodScore: number; // 1-5 (1=low, 5=energized/happy)
  eatingRoutineNotes?: string;
  symptomsReported?: string[];
  notes?: string;
  isDemoRecord?: boolean;
}

export interface ScorecardBreakdown {
  overallScore: number; // 0-100
  sleepScore: number; // 0-25
  hydrationScore: number; // 0-25
  activityScore: number; // 0-25
  moodScore: number; // 0-25
  sleepExplanation: string;
  hydrationExplanation: string;
  activityExplanation: string;
  moodExplanation: string;
  methodology: string;
  medicalDisclaimer: string;
}

export interface ComparisonDelta {
  metricKey: keyof HealthCheckInRecord;
  label: string;
  unit: string;
  previousValue: number;
  currentValue: number;
  difference: number;
  percentageChange: number | null;
  status: 'positive' | 'needs_attention' | 'stable' | 'insufficient_data';
  insight: string;
  clinicalMeaning: string;
}

export interface ThenVsNowAnalysis {
  deltas: ComparisonDelta[];
  positiveHighlights: string[];
  attentionAreas: string[];
  stableMetrics: string[];
  insufficientDataReason?: string;
  baselineDate?: string;
  currentDate?: string;
}

export interface ActionPlanTask {
  id: string;
  day: number;
  dayName: string;
  title: string;
  category: 'sleep' | 'hydration' | 'activity' | 'nutrition' | 'mindfulness';
  description: string;
  durationMinutes?: number;
  completed: boolean;
  targetMetric: string;
}

export interface DailyRecommendation {
  situation: string;
  headline: string;
  recommendation: string;
  actionableSteps: string[];
  safetyBoundaries: string; // explicitly explains what NOT to do (no extreme water, no unverified supplements, etc.)
  ageRelevance: string;
}

export interface RedFlagCheckResult {
  isUrgent: boolean;
  severity: 'emergency' | 'concerning' | 'normal';
  title: string;
  description: string;
  immediateActions: string[];
  recommendedCareLevel: 'emergency_services' | 'urgent_care' | 'primary_doctor' | 'routine';
  flaggedSymptoms: string[];
  vitalsWarning?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
}

export interface FoodGuideItem {
  id: string;
  name: string;
  culturalOrigin?: string;
  portion: string;
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  ingredients?: RecipeIngredient[];
  instructions?: string[];
  equipment?: string[];
  substitutions?: string[];
  cookingTips?: string[];
  macronutrients: {
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
  };
  keyMicronutrients: string[];
  potentialBenefits: string[];
  allergyWarnings: string[];
  balancedMealPairing: string;
  nonMoralizingPhilosophy: string;
  isAiGenerated?: boolean;
}

