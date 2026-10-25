/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AcademicObligation = 'none' | 'homework' | 'upcoming_test' | 'major_exam' | 'homework_and_exam';

export type SchoolDayTiming =
  | 'before_school'
  | 'during_school'
  | 'after_school'
  | 'before_studying'
  | 'exam_prep'
  | 'before_bedtime';

export type StudyDifficultyType =
  | 'understanding_concepts'
  | 'remembering_info'
  | 'concentration'
  | 'time_management';

export interface StudentDailyCheckIn {
  id: string;
  timestamp: string;
  dateLabel: string;
  returnHomeTime: string; // e.g. "14:30"
  tirednessLevel: number; // 1-10
  stressLevel: number; // 1-10
  eatenSinceSchool: 'yes_meal' | 'yes_snack' | 'no';
  waterSinceSchool: 'yes' | 'a_little' | 'no';
  sleepHoursLastNight: number;
  academicWorkload: AcademicObligation;
  freeTimeMinutes: number;
  botheringOptions: string[];
  ownWordsSituation: string;
  dietaryPreference: 'vegetarian' | 'eggetarian' | 'omnivore' | 'vegan' | 'halal';
  allergies: string[];
  hotWeatherOrSport: boolean;
  subjectToWorkOn: string;
  isDemo?: boolean;
}

export interface HomeworkTaskItem {
  id: string;
  subject: string;
  task: string;
  urgency: 'due_tomorrow' | 'this_week' | 'later';
  difficulty: 'hard' | 'medium' | 'light';
  estimatedMinutes: number;
  completed: boolean;
}

export interface RecoveryPlanOutput {
  safetyAlert: StudentSafetyEvaluation;
  energyRecovery: {
    restDurationMinutes: number;
    restSuggestion: string;
    movementSuggestion: string;
    transitionTip: string;
    cautionNote: string;
  };
  foodGuidance: {
    statusSummary: string;
    recommendedOptions: {
      name: string;
      ingredients: string;
      whyItHelps: string;
    }[];
    nutritionExplanation: string;
    reassuranceNote: string;
  };
  hydrationGuidance: {
    promptQuestion: string;
    mainAdvice: string;
    contextAdjustment: string;
    balanceReminder: string;
  };
  stressRelief: {
    encouragingOpening: string;
    breathingPattern: { inhale: number; hold: number; exhale: number; label: string };
    calmingOptions: string[];
    microStepAdvice: string;
    trustedAdultNote?: string;
  };
  studyReadiness: {
    recommendedSessionMinutes: number;
    recommendedBreakMinutes: number;
    maxEveningBlocks: number;
    prioritizationAdvice: string;
    sleepProtectionNote: string;
    suggestedChecklist: HomeworkTaskItem[];
  };
}

export interface StudentSafetyEvaluation {
  level: 'emergency' | 'ongoing_concern' | 'supportive';
  headline: string;
  message: string;
  actionItems: string[];
}

export interface AfterSchoolRoutineInput {
  schoolFinishTime: string; // "14:00"
  arrivalHomeTime: string; // "14:30"
  homeworkWorkload: 'light' | 'moderate' | 'heavy';
  upcomingTestInfo: string; // e.g., "Maths test tomorrow" or ""
  tuitionOrExtracurricular: string; // e.g., "Football practice" or ""
  tuitionStartTime?: string; // optional "17:00"
  tuitionDurationMinutes?: number;
  preferredRestMinutes: number; // e.g., 20
  dinnerTime: string; // "20:00"
  bedtime: string; // "22:00"
  availableStudyHours: number;
  isExhausted: boolean;
}

export interface ScheduleSlot {
  id: string;
  startTime: string; // "2:30 PM"
  endTime: string; // "2:45 PM"
  title: string;
  category: 'recovery' | 'nutrition' | 'study' | 'break' | 'commitment' | 'sleep';
  detail: string;
  completed: boolean;
}

export interface ExamRescueInput {
  subject: string;
  deadlineLabel: string; // e.g., "Tomorrow morning", "In 3 days", "Friday"
  remainingWork: string; // e.g., "3 chapters of quadratic equations & graphs"
  availableMinutesToday: number;
  biggestDifficulty: StudyDifficultyType;
  quickMode?: 'standard' | 'only_30_min' | 'exam_tomorrow';
}

export interface ExamRescueStep {
  id: string;
  stepNumber: number;
  durationMinutes: number;
  title: string;
  methodTag: string;
  instruction: string;
  completed: boolean;
}

export interface ExamRescuePlan {
  modeLabel: string;
  strategyHeadline: string;
  difficultyTargetedTip: string;
  steps: ExamRescueStep[];
  sleepBoundaryMessage: string;
  wellbeingReassurance: string;
}

export interface SchoolFuelInput {
  situation: SchoolDayTiming;
  dietaryPreference: 'vegetarian' | 'eggetarian' | 'omnivore' | 'vegan' | 'halal';
  allergies: string[];
  availableFoodsText: string;
  portionNeed: 'quick_snack' | 'full_meal';
}

export interface SchoolFuelSuggestion {
  title: string;
  ingredientsSummary: string;
  prepTime: string;
  simpleExplanation: string;
  hydrationTip: string;
}

export interface SchoolFuelOutput {
  situationLabel: string;
  matchedFromPantry: boolean;
  needsAiCustomHelp: boolean;
  suggestions: SchoolFuelSuggestion[];
  honestHealthNote: string;
}

export interface CoachMessage {
  id: string;
  role: 'student' | 'coach';
  text: string;
  timestamp: string;
  source?: 'healthmate_ai' | 'rules_engine';
  followUpQuestion?: string;
  actionSteps?: string[];
  easiestFirstPrompt?: boolean;
  selectedFirstStep?: string;
  safetyLevel?: 'emergency' | 'ongoing_concern' | 'supportive';
}

export interface StudentDailyActivityLog {
  id: string;
  dateISO: string; // YYYY-MM-DD
  dateLabel: string;
  weekKey: string; // e.g., "Current Week" or "Previous Week"
  energyLevel: number; // 1-10 (inverted from tiredness or direct)
  stressLevel: number; // 1-10
  sleepHours: number;
  studySessionsCompleted: number;
  breaksTaken: number;
  checkInCompleted: boolean;
  goalsCompleted: number;
  isDemo?: boolean;
}

export interface SmallWinChallenge {
  id: string;
  title: string;
  category: 'rest' | 'hydration' | 'study' | 'connection' | 'sleep';
  whyItMatters: string;
  selected: boolean;
  completed: boolean;
}

export interface StudentBadge {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  criteriaText: string;
}
