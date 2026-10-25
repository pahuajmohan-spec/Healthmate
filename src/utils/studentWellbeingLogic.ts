/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AfterSchoolRoutineInput,
  CoachMessage,
  ExamRescueInput,
  ExamRescuePlan,
  ExamRescueStep,
  HomeworkTaskItem,
  RecoveryPlanOutput,
  ScheduleSlot,
  SchoolFuelInput,
  SchoolFuelOutput,
  SchoolFuelSuggestion,
  SmallWinChallenge,
  StudentBadge,
  StudentDailyActivityLog,
  StudentDailyCheckIn,
  StudentSafetyEvaluation,
} from '../types/studentWellbeing';

export const STUDENT_BOTHERING_OPTIONS = [
  'I feel exhausted.',
  'I am hungry.',
  'I feel stressed about studies.',
  'I have too much homework.',
  'I have an upcoming exam.',
  'I have a headache.',
  'I feel sleepy.',
  'I cannot concentrate.',
  'I feel anxious or overwhelmed.',
  'I just want to relax.',
];

/**
 * Evaluates student input for acute emergencies vs ongoing medical/emotional concerns.
 */
export function evaluateStudentSafety(
  ownWords: string = '',
  botheringOptions: string[] = [],
  stressLevel: number = 5,
  tirednessLevel: number = 5
): StudentSafetyEvaluation {
  const combined = `${ownWords} ${botheringOptions.join(' ')}`.toLowerCase();

  const emergencyKeywords = [
    'hurt myself',
    'self harm',
    'self-harm',
    'suicide',
    'end my life',
    'want to die',
    'cannot breathe',
    "can't breathe",
    'chest pain',
    'fainted',
    'passed out',
    'unsafe at home',
    'immediate danger',
    'overdose',
  ];

  if (emergencyKeywords.some((kw) => combined.includes(kw))) {
    return {
      level: 'emergency',
      headline: 'Immediate Support & Urgent Help Comes First',
      message:
        'What you described sounds urgent. Please pause schoolwork and reach out for immediate help right away—you do not have to handle this alone.',
      actionItems: [
        'Tell a parent, guardian, school counselor, or trusted adult near you immediately.',
        'For medical emergencies, call your local emergency number right away (911 in US/Canada, 112 in India/EU, 999 in UK).',
        'If you feel unsafe or in emotional crisis, call or text 988 (US/Canada), Childline 1098 (India), or your local crisis helpline immediately.',
      ],
    };
  }

  const ongoingConcernKeywords = [
    'every day headache',
    'constant headache',
    'recurring headache',
    'migraine',
    'always exhausted',
    'exhausted every day',
    'panic attack',
    'severe anxiety',
    'dizzy',
    'not sleeping for days',
    'crying every day',
    'hopeless',
  ];

  const hasHeadache = botheringOptions.includes('I have a headache.') || combined.includes('headache');
  const highDistress = stressLevel >= 9 || (tirednessLevel >= 9 && hasHeadache);

  if (ongoingConcernKeywords.some((kw) => combined.includes(kw)) || highDistress) {
    return {
      level: 'ongoing_concern',
      headline: 'Check In With a Trusted Adult & Healthcare Professional',
      message:
        'When strong exhaustion, headaches, or intense anxiety feel heavy or keep coming back, everyday study tips are not enough on their own. Sharing how you feel with a parent, guardian, school nurse, or doctor can really help.',
      actionItems: [
        'Let a trusted adult (parent, family member, teacher, or school counselor) know how drained or overwhelmed you are feeling today.',
        'If headaches, dizziness, or constant tiredness continue, ask a qualified healthcare professional for a proper checkup.',
        'Give yourself permission to rest right now rather than forcing heavy study sessions.',
      ],
    };
  }

  return {
    level: 'supportive',
    headline: 'Supportive After-School Check-In',
    message:
      'Feeling tired or stretched after a full school day is completely normal. Let us take care of your rest, food, hydration, and pace step by step.',
    actionItems: [],
  };
}

/**
 * Parses "HH:MM" (24h) into minutes since midnight. Defaults safely if malformed.
 */
export function parseTimeToMinutes(time24: string, fallbackMinutes: number = 14 * 60 + 30): number {
  if (!time24 || !time24.includes(':')) return fallbackMinutes;
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return fallbackMinutes;
  }
  return h * 60 + m;
}

/**
 * Formats minutes since midnight into "2:30 PM" human-readable clock label.
 */
export function formatMinutesToClock(totalMinutes: number): string {
  const normalized = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const paddedMins = mins < 10 ? `0${mins}` : `${mins}`;
  return `${h12}:${paddedMins} ${period}`;
}

interface MealCandidate {
  name: string;
  ingredients: string;
  whyItHelps: string;
  diets: Array<StudentDailyCheckIn['dietaryPreference']>;
  allergens: string[];
  type: 'snack' | 'meal';
  timings: Array<'before_school' | 'during_school' | 'after_school' | 'before_studying' | 'exam_prep' | 'before_bedtime'>;
  keywords: string[];
}

const FAMILIAR_STUDENT_FOODS: MealCandidate[] = [
  {
    name: 'Roasted Chana or Boiled Chana Chaat with Roti',
    ingredients: 'Chickpeas (chana), whole-wheat roti, cucumber, tomato, lemon squeeze',
    whyItHelps: 'Combines steady complex carbs from roti with plant protein and fiber from chana so your energy stays even during homework.',
    diets: ['vegetarian', 'eggetarian', 'omnivore', 'vegan', 'halal'],
    allergens: ['gluten'],
    type: 'meal',
    timings: ['after_school', 'during_school', 'exam_prep'],
    keywords: ['chana', 'chickpea', 'roti', 'chapati'],
  },
  {
    name: 'Warm Daal with Soft Roti or Rice',
    ingredients: 'Yellow or masoor daal (lentils), whole-wheat roti or steamed rice, light homemade seasoning',
    whyItHelps: 'Comforting, easy to digest, and rich in slow-release energy and iron to replenish you after a long school day.',
    diets: ['vegetarian', 'eggetarian', 'omnivore', 'vegan', 'halal'],
    allergens: ['gluten'],
    type: 'meal',
    timings: ['after_school', 'before_school', 'exam_prep'],
    keywords: ['daal', 'dal', 'lentil', 'roti', 'rice'],
  },
  {
    name: 'Scrambled or Boiled Egg Wrap with Roti',
    ingredients: '1–2 eggs, whole-wheat roti, sliced onion or cucumber',
    whyItHelps: 'Eggs provide choline and complete protein alongside steady grain energy from roti to keep hunger away while studying.',
    diets: ['eggetarian', 'omnivore', 'halal'],
    allergens: ['eggs', 'gluten'],
    type: 'meal',
    timings: ['before_school', 'after_school', 'before_studying'],
    keywords: ['egg', 'eggs', 'roti', 'omelette'],
  },
  {
    name: 'Fresh Seasonal Fruit with a Handful of Nuts or Seeds',
    ingredients: 'Banana, apple, or guava paired with almonds, walnuts, or roasted pumpkin seeds',
    whyItHelps: 'Natural fruit sugars refresh tired brains quickly while healthy fats from nuts/seeds keep you satisfied longer.',
    diets: ['vegetarian', 'eggetarian', 'omnivore', 'vegan', 'halal'],
    allergens: ['nuts', 'peanuts'],
    type: 'snack',
    timings: ['after_school', 'before_studying', 'during_school', 'exam_prep'],
    keywords: ['fruit', 'banana', 'apple', 'nuts', 'almonds', 'seeds'],
  },
  {
    name: 'Fruit & Yogurt / Milk Smoothie or Banana with Warm Milk',
    ingredients: '1 cup milk (or soy/oat milk), 1 ripe banana, pinch of cardamom or oats',
    whyItHelps: 'Gentle hydration, calcium, and carbohydrates—especially soothing after school or 60 minutes before bedtime.',
    diets: ['vegetarian', 'eggetarian', 'omnivore', 'halal'],
    allergens: ['dairy'],
    type: 'snack',
    timings: ['before_school', 'after_school', 'before_bedtime'],
    keywords: ['milk', 'banana', 'yogurt', 'curd', 'oats', 'fruit'],
  },
  {
    name: 'Spiced Roasted Makhana / Poha or Sprouts Bowl',
    ingredients: 'Flattened rice (poha) with peas & lemon, or steamed moong sprouts with chopped veggies',
    whyItHelps: 'Light, gluten-free, affordable local option that satisfies after-school hunger without making you feel overly heavy.',
    diets: ['vegetarian', 'eggetarian', 'omnivore', 'vegan', 'halal'],
    allergens: [],
    type: 'snack',
    timings: ['before_school', 'during_school', 'after_school', 'before_studying', 'exam_prep'],
    keywords: ['poha', 'sprouts', 'moong', 'makhana', 'rice'],
  },
  {
    name: 'Warm Oats Porridge with Chopped Apple or Dates',
    ingredients: 'Rolled oats cooked in water or plant/dairy milk, topped with apple slices or 2 dates',
    whyItHelps: 'Gentle fiber supports steady focus during morning classes or calm evening wind-down.',
    diets: ['vegetarian', 'eggetarian', 'omnivore', 'vegan', 'halal'],
    allergens: [],
    type: 'meal',
    timings: ['before_school', 'before_bedtime', 'exam_prep'],
    keywords: ['oats', 'apple', 'dates', 'porridge'],
  },
];

function filterSafeFoods(
  preference: StudentDailyCheckIn['dietaryPreference'],
  allergies: string[]
): MealCandidate[] {
  const normalizedAllergies = allergies.map((a) => a.toLowerCase());
  return FAMILIAR_STUDENT_FOODS.filter((item) => {
    if (!item.diets.includes(preference)) return false;
    const hasAllergen = item.allergens.some((al) =>
      normalizedAllergies.some((ua) => ua !== 'none' && (ua.includes(al) || al.includes(ua)))
    );
    return !hasAllergen;
  });
}

/**
 * Generates the 5-part Personalized After-School Recovery Plan from a Student Daily Check-In.
 */
export function generateAfterSchoolRecoveryPlan(checkIn: StudentDailyCheckIn): RecoveryPlanOutput {
  const safetyAlert = evaluateStudentSafety(
    checkIn.ownWordsSituation,
    checkIn.botheringOptions,
    checkIn.stressLevel,
    checkIn.tirednessLevel
  );

  const isVeryTired =
    checkIn.tirednessLevel >= 7 ||
    checkIn.sleepHoursLastNight < 7 ||
    checkIn.botheringOptions.includes('I feel exhausted.') ||
    checkIn.botheringOptions.includes('I feel sleepy.');

  const hasHeadache = checkIn.botheringOptions.includes('I have a headache.');
  const isHungry =
    checkIn.eatenSinceSchool === 'no' || checkIn.botheringOptions.includes('I am hungry.');

  // A. Recover Your Energy
  const restDurationMinutes = isVeryTired ? 25 : checkIn.tirednessLevel >= 4 ? 15 : 10;
  const restSuggestion = isVeryTired
    ? `Change into comfortable clothes, dim bright screens, and take a ${restDurationMinutes}-minute quiet rest or short power nap (keep naps under 30 minutes so tonight's sleep stays smooth).`
    : `Take ${restDurationMinutes} minutes away from school bags and phones to sit comfortably and let your mind switch out of classroom mode.`;

  const movementSuggestion = hasHeadache
    ? 'Skip intense activity right now—do 2 minutes of gentle neck/shoulder rolls in a quiet, softly lit room.'
    : isVeryTired
    ? 'After resting, do 3–5 minutes of gentle shoulder, back, and ankle stretches to wake up stiff muscles softly.'
    : 'Try 5–10 minutes of easy stretching or a relaxed walk around your room or courtyard before sitting down again.';

  const transitionTip =
    'Clear just one small corner of your desk, place a glass of water nearby, and start with a 5-minute easy review task rather than jumping straight into the hardest chapter.';

  // B. What Should I Eat?
  const safeFoods = filterSafeFoods(checkIn.dietaryPreference, checkIn.allergies);
  const preferredPool = isHungry
    ? safeFoods
    : safeFoods.filter((f) => f.type === 'snack').concat(safeFoods.filter((f) => f.type === 'meal'));
  const selectedFoods = (preferredPool.length > 0 ? preferredPool : FAMILIAR_STUDENT_FOODS).slice(0, 3);

  const statusSummary =
    checkIn.eatenSinceSchool === 'no'
      ? 'You have not eaten since school—refueling first will noticeably help your mood, focus, and patience with homework.'
      : checkIn.eatenSinceSchool === 'yes_snack'
      ? 'You had a light snack earlier. Keep a balanced plate in mind for your next meal so your energy does not dip.'
      : 'Great job eating after school! Steady nourishment gives your brain reliable fuel for the evening.';

  // C. Hydration Assistant
  const hydrationMain =
    checkIn.waterSinceSchool === 'no'
      ? 'Start with 1 comfortable glass of plain water right now, and keep a filled bottle or tumbler within arm’s reach at your desk.'
      : checkIn.waterSinceSchool === 'a_little'
      ? 'Have a few refreshing sips of water before starting your next task, and drink naturally whenever you feel thirsty.'
      : 'You have already had water since school—simply keep water nearby and sip comfortably when thirsty.';

  const contextAdjustment = checkIn.hotWeatherOrSport
    ? 'Because of warm weather or physical activity today, include steady sips of water or homemade nimbu pani / buttermilk alongside snacks to replace sweat gently.'
    : 'On regular indoor afternoons, sipping plain water when thirsty is plenty—there is no need to force huge amounts at once.';

  // D. Stress Relief
  const highStress =
    checkIn.stressLevel >= 7 ||
    checkIn.botheringOptions.includes('I feel stressed about studies.') ||
    checkIn.botheringOptions.includes('I feel anxious or overwhelmed.');

  const encouragingOpening = highStress
    ? 'It makes complete sense to feel stretched when homework, tests, and tiredness pile up at the same time. You do not need to finish everything in the next ten minutes.'
    : 'Taking two calm minutes to reset your breathing helps you concentrate with less effort.';

  // E. Study Readiness
  const availableMins = Math.max(15, checkIn.freeTimeMinutes || 60);
  const sessionMins = isVeryTired || checkIn.botheringOptions.includes('I cannot concentrate.') ? 20 : 25;
  const breakMins = 5;
  const maxBlocks = Math.min(4, Math.max(1, Math.floor(availableMins / (sessionMins + breakMins))));

  const subjectName = checkIn.subjectToWorkOn?.trim() || 'Main Subject';
  const suggestedChecklist: HomeworkTaskItem[] = [];

  if (checkIn.academicWorkload === 'none' || checkIn.botheringOptions.includes('I just want to relax.')) {
    suggestedChecklist.push({
      id: 'hw-1',
      subject: subjectName,
      task: 'Pack tomorrow’s school bag and check timetable (10 mins)',
      urgency: 'due_tomorrow',
      difficulty: 'light',
      estimatedMinutes: 10,
      completed: false,
    });
  } else {
    if (
      checkIn.academicWorkload === 'upcoming_test' ||
      checkIn.academicWorkload === 'major_exam' ||
      checkIn.academicWorkload === 'homework_and_exam' ||
      checkIn.botheringOptions.includes('I have an upcoming exam.')
    ) {
      suggestedChecklist.push({
        id: 'hw-1',
        subject: subjectName,
        task: `Review key formulas/definitions & solve 3 practice questions (${sessionMins} mins)`,
        urgency: 'due_tomorrow',
        difficulty: 'hard',
        estimatedMinutes: sessionMins,
        completed: false,
      });
    }
    suggestedChecklist.push({
      id: 'hw-2',
      subject: subjectName,
      task: `Complete highest-priority homework section (${sessionMins} mins)`,
      urgency: 'due_tomorrow',
      difficulty: 'medium',
      estimatedMinutes: sessionMins,
      completed: false,
    });
    suggestedChecklist.push({
      id: 'hw-3',
      subject: 'Wrap-Up',
      task: 'Note down any stuck questions to ask your teacher tomorrow (5 mins)',
      urgency: 'this_week',
      difficulty: 'light',
      estimatedMinutes: 5,
      completed: false,
    });
  }

  return {
    safetyAlert,
    energyRecovery: {
      restDurationMinutes,
      restSuggestion,
      movementSuggestion,
      transitionTip,
      cautionNote:
        'Avoid relying on coffee, energy drinks, or exhausting workouts when tired—they often increase jitters and disrupt tonight’s sleep.',
    },
    foodGuidance: {
      statusSummary,
      recommendedOptions: selectedFoods.map((f) => ({
        name: f.name,
        ingredients: f.ingredients,
        whyItHelps: f.whyItHelps,
      })),
      nutritionExplanation:
        'Your brain uses steady glucose and nutrients to focus and remember lessons. Regular, familiar meals prevent sudden energy crashes and irritability.',
      reassuranceNote:
        'Growing students need consistent nourishment—never skip meals or follow restrictive weight-loss diets.',
    },
    hydrationGuidance: {
      promptQuestion:
        checkIn.waterSinceSchool === 'no'
          ? 'Could you pause for 30 seconds to pour a glass of water before reading further?'
          : 'Is your water bottle or glass within easy reach of your study spot?',
      mainAdvice: hydrationMain,
      contextAdjustment,
      balanceReminder: 'Drink comfortably according to thirst—steady sips work much better than chugging.',
    },
    stressRelief: {
      encouragingOpening,
      breathingPattern: {
        inhale: 4,
        hold: 4,
        exhale: 6,
        label: '4s Inhale · 4s Hold · 6s Slow Exhale (3 rounds)',
      },
      calmingOptions: [
        'Step away from phone notifications and bright screens for 10 minutes.',
        'Listen to one calm instrumental track or nature sounds while tidying your desk.',
        'Write down the 3 things on your mind on scrap paper so you do not have to hold them all in your head.',
        'Talk for 5 minutes with a parent, sibling, friend, or trusted adult about how your day went.',
      ],
      microStepAdvice:
        'Shrink the mountain: pick ONLY the first 15–20 minutes of one assignment. Starting small breaks the freeze response.',
      trustedAdultNote:
        safetyAlert.level !== 'supportive'
          ? 'Please remember: serious or lasting emotional distress deserves real care from a trusted adult, school counselor, or healthcare professional—not just study productivity tips.'
          : undefined,
    },
    studyReadiness: {
      recommendedSessionMinutes: sessionMins,
      recommendedBreakMinutes: breakMins,
      maxEveningBlocks: maxBlocks,
      prioritizationAdvice: `With ~${availableMins} mins available, aim for ${maxBlocks} focused block${
        maxBlocks > 1 ? 's' : ''
      } of ${sessionMins} mins separated by ${breakMins}-min stretch/water breaks. Tackle urgent tomorrow items first.`,
      sleepProtectionNote:
        checkIn.sleepHoursLastNight < 7.5
          ? `You slept ${checkIn.sleepHoursLastNight} hrs last night. Protect an on-time bedtime tonight—sleep locks in memory far better than exhausted late-night cramming.`
          : 'Stop studying at least 30–45 minutes before bedtime so your mind can wind down peacefully.',
      suggestedChecklist,
    },
  };
}

/**
 * Generates a dynamic, realistic timetable from the student's actual arrival, dinner, tuition, and bedtime.
 */
export function generateAfterSchoolSchedule(input: AfterSchoolRoutineInput): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  let cursor = parseTimeToMinutes(input.arrivalHomeTime, 14 * 60 + 30);
  const dinnerMins = parseTimeToMinutes(input.dinnerTime, 20 * 60);
  let bedtimeMins = parseTimeToMinutes(input.bedtime, 22 * 60);
  if (bedtimeMins <= cursor) {
    bedtimeMins += 24 * 60; // handle midnight wrap safely
  }

  const tuitionStart = input.tuitionOrExtracurricular.trim()
    ? parseTimeToMinutes(input.tuitionStartTime || '17:00', 17 * 60)
    : null;
  const tuitionDuration = input.tuitionOrExtracurricular.trim()
    ? Math.max(30, input.tuitionDurationMinutes || 60)
    : 0;

  let slotIndex = 1;
  const pushSlot = (
    duration: number,
    title: string,
    category: ScheduleSlot['category'],
    detail: string
  ) => {
    if (duration <= 0) return;
    const start = cursor;
    const end = cursor + duration;
    slots.push({
      id: `slot-${slotIndex++}`,
      startTime: formatMinutesToClock(start),
      endTime: formatMinutesToClock(end),
      title,
      category,
      detail,
      completed: false,
    });
    cursor = end;
  };

  // 1. Arrival & Snack
  pushSlot(
    15,
    'Arrive Home, Freshen Up & Have a Balanced Snack',
    'nutrition',
    'Wash face/hands, change out of uniform, drink water, and have a nourishing snack (like fruit, nuts, egg, or chana).'
  );

  // 2. Rest Period
  const restMins = Math.min(45, Math.max(10, input.preferredRestMinutes || (input.isExhausted ? 25 : 15)));
  pushSlot(
    restMins,
    input.isExhausted ? 'Comfortable Post-School Recovery Rest' : 'Unplug & Decompress Break',
    'recovery',
    'Step away from school stress and social media feeds so your brain resets before homework.'
  );

  // Determine study blocks needed
  const studyBudgetMinutes = Math.min(
    Math.max(25, Math.round((input.availableStudyHours || 1.5) * 60)),
    Math.max(30, bedtimeMins - cursor - 75)
  );
  const blockLen = input.isExhausted ? 25 : 30;
  let remainingStudy = studyBudgetMinutes;
  const hasTest = input.upcomingTestInfo.trim().length > 0;
  let studyBlockCounter = 1;
  let tuitionInserted = false;
  let dinnerInserted = false;

  while (remainingStudy > 0 && cursor < bedtimeMins - 40 && slots.length < 14) {
    // Check if tuition starts soon
    if (
      !tuitionInserted &&
      tuitionStart !== null &&
      cursor >= tuitionStart - 10
    ) {
      if (cursor < tuitionStart) {
        pushSlot(tuitionStart - cursor, 'Prep & Transition for Activity', 'break', 'Gather books or gear calmly.');
      }
      pushSlot(
        tuitionDuration,
        input.tuitionOrExtracurricular.trim(),
        'commitment',
        'Scheduled tuition, coaching, sports, or extracurricular commitment.'
      );
      pushSlot(15, 'Short Breather & Water Refill', 'break', 'Rest your eyes and hydrate after returning.');
      tuitionInserted = true;
      continue;
    }

    // Check if dinner time reached
    if (!dinnerInserted && cursor >= dinnerMins - 10 && dinnerMins < bedtimeMins) {
      if (cursor < dinnerMins) {
        pushSlot(dinnerMins - cursor, 'Tidy Desk & Wash Up for Dinner', 'break', 'Wrap up current page.');
      }
      pushSlot(
        35,
        'Balanced Dinner & Family Time',
        'nutrition',
        'Eat a calm, nourishing dinner away from textbooks and screens.'
      );
      dinnerInserted = true;
      continue;
    }

    const thisBlock = Math.min(blockLen, remainingStudy);
    const isTestBlock = hasTest && studyBlockCounter <= 2;
    const blockTitle = isTestBlock
      ? `Focused Revision Session #${studyBlockCounter} (${input.upcomingTestInfo.trim()})`
      : `Homework Session #${studyBlockCounter} (${input.homeworkWorkload} workload)`;
    const blockDetail =
      studyBlockCounter === 1
        ? 'Start with key concepts or your highest-priority assignment while fresh.'
        : isTestBlock
        ? 'Use active recall and practice questions rather than passive re-reading.'
        : 'Complete remaining written exercises and check off finished items.';

    pushSlot(thisBlock, blockTitle, 'study', blockDetail);
    remainingStudy -= thisBlock;
    studyBlockCounter++;

    if (remainingStudy > 0 && cursor < bedtimeMins - 45) {
      pushSlot(
        10,
        'Short Stretch & Hydration Break',
        'break',
        'Stand up, stretch shoulders, rest eyes from close focus, and sip water.'
      );
    }
  }

  // Insert tuition if it hasn't happened yet and fits before bedtime
  if (!tuitionInserted && tuitionStart !== null && cursor < bedtimeMins - 30) {
    if (tuitionStart > cursor && tuitionStart < bedtimeMins - tuitionDuration) {
      pushSlot(tuitionStart - cursor, 'Free Time / Light Relaxation', 'break', 'Unwind before your commitment.');
    }
    pushSlot(
      Math.min(tuitionDuration, Math.max(20, bedtimeMins - cursor - 30)),
      input.tuitionOrExtracurricular.trim(),
      'commitment',
      'Scheduled tuition or extracurricular session.'
    );
  }

  // Insert dinner if not yet added and before bedtime
  if (!dinnerInserted && cursor < bedtimeMins - 25) {
    if (dinnerMins > cursor && dinnerMins < bedtimeMins - 35) {
      pushSlot(
        dinnerMins - cursor,
        'Relaxation & Personal Free Time',
        'recovery',
        'Enjoy hobbies, music, light chat, or a gentle walk.'
      );
    }
    pushSlot(
      30,
      'Balanced Dinner & Unwind',
      'nutrition',
      'Nourishing evening meal to support overnight recovery.'
    );
  }

  // Wind-down before bedtime
  const remainingBeforeBed = bedtimeMins - cursor;
  if (remainingBeforeBed > 30) {
    pushSlot(
      remainingBeforeBed - 25,
      'Relaxation & Personal Down-Time',
      'recovery',
      'No heavy studying—chat with family, listen to music, or enjoy quiet free time.'
    );
  }

  const windDownLen = Math.max(15, Math.min(30, bedtimeMins - cursor));
  if (windDownLen > 0) {
    pushSlot(
      windDownLen,
      'Pack Bag & Screen-Free Bedtime Wind-Down',
      'sleep',
      `Pack tomorrow's books, put devices away, and settle in for sleep by ${formatMinutesToClock(bedtimeMins)}.`
    );
  }

  return slots;
}

/**
 * Generates an Exam & Homework Rescue Plan tailored to subject, time left, and difficulty type.
 */
export function generateExamRescuePlan(input: ExamRescueInput): ExamRescuePlan {
  const subject = input.subject.trim() || 'Your Subject';
  const mode = input.quickMode || 'standard';
  const workDesc = input.remainingWork.trim() || 'core syllabus topics';

  const difficultyTips: Record<ExamRescueInput['biggestDifficulty'], string> = {
    understanding_concepts:
      'Concept Clarity Strategy: Read one worked example slowly, explain "why each step happens" out loud in plain words, then try one similar problem with the book closed.',
    remembering_info:
      'Active Recall Strategy: Close your notes after each sub-topic and jot down 3 key points from memory on a blank sheet, then check what you missed.',
    concentration:
      'Focus Rescue Strategy: Put your phone in another room, set a short 15-minute timer, and commit only to finishing 2 small questions before taking a breather.',
    time_management:
      'Triage Strategy: Circle high-weight topics your teacher emphasized most. Spend 70% of your time practicing those rather than getting stuck on minor details.',
  };

  if (mode === 'only_30_min') {
    const steps: ExamRescueStep[] = [
      {
        id: 'er-30-1',
        stepNumber: 1,
        durationMinutes: 5,
        title: `Pinpoint Top 2 Must-Know Items in ${subject}`,
        methodTag: 'Prioritize',
        instruction: `Scan "${workDesc}" and pick ONLY the 2 most important concepts, formulas, or homework questions. Ignore the rest for these 30 minutes.`,
        completed: false,
      },
      {
        id: 'er-30-2',
        stepNumber: 2,
        durationMinutes: 15,
        title: 'Focused Active Practice (Book Closed)',
        methodTag: 'Active Recall',
        instruction:
          'Work through 2–3 representative questions or write summary bullet points from memory without looking at answers immediately.',
        completed: false,
      },
      {
        id: 'er-30-3',
        stepNumber: 3,
        durationMinutes: 7,
        title: 'Quick Mistake Check & Correction',
        methodTag: 'Feedback',
        instruction:
          'Compare with your notes/solutions, highlight any one mistake in a different color, and note the fix.',
        completed: false,
      },
      {
        id: 'er-30-4',
        stepNumber: 4,
        durationMinutes: 3,
        title: 'Write Tomorrow’s 1-Line Next Step & Rest',
        methodTag: 'Wrap Up',
        instruction: 'Jot down where to pick up next time so you feel organized, then step away guilt-free.',
        completed: false,
      },
    ];

    return {
      modeLabel: '30-Minute Focused Sprint',
      strategyHeadline: `High-Impact 30-Minute Rescue for ${subject}`,
      difficultyTargetedTip: difficultyTips[input.biggestDifficulty],
      steps,
      sleepBoundaryMessage:
        '30 focused minutes beats 2 hours of distracted worrying. Once this sprint is done, let yourself rest.',
      wellbeingReassurance:
        'Remember: your health, kindness to yourself, and wellbeing matter far more than any single homework mark or test score.',
    };
  }

  if (mode === 'exam_tomorrow') {
    const totalMins = Math.min(150, Math.max(40, input.availableMinutesToday || 90));
    const coreBlock = Math.round(totalMins * 0.45);
    const practiceBlock = Math.round(totalMins * 0.35);

    const steps: ExamRescueStep[] = [
      {
        id: 'er-tmw-1',
        stepNumber: 1,
        durationMinutes: 10,
        title: `Essential Triage of "${workDesc}"`,
        methodTag: 'High-Yield Triage',
        instruction:
          'List the top 3–4 chapters/types of questions most likely to appear. Do NOT try to learn brand-new minor footnotes tonight.',
        completed: false,
      },
      {
        id: 'er-tmw-2',
        stepNumber: 2,
        durationMinutes: coreBlock,
        title: 'Review Summaries, Formulas & Key Definitions',
        methodTag: 'Spaced Summary',
        instruction:
          'Test yourself out loud on core definitions, diagrams, or formulas. Keep a single "cheat-sheet summary page" for tomorrow morning.',
        completed: false,
      },
      {
        id: 'er-tmw-3',
        stepNumber: 3,
        durationMinutes: 10,
        title: 'Brain Reset Break (Water + Stretch)',
        methodTag: 'Recovery Break',
        instruction: 'Walk away from your desk, sip water, relax your shoulders, and take 3 slow breaths.',
        completed: false,
      },
      {
        id: 'er-tmw-4',
        stepNumber: 4,
        durationMinutes: practiceBlock,
        title: 'Solve Past/Sample Questions Under Calm Timing',
        methodTag: 'Practice Questions',
        instruction:
          'Practice 3–5 standard questions you already mostly know how to do—this builds confidence and exam readiness.',
        completed: false,
      },
      {
        id: 'er-tmw-5',
        stepNumber: 5,
        durationMinutes: 10,
        title: 'Pack Stationery & Protect Full Sleep (No All-Nighter)',
        methodTag: 'Sleep First',
        instruction:
          'Lay out pens, ID/admit card, and water bottle now, then go to sleep on time so your brain can recall what you studied.',
        completed: false,
      },
    ];

    return {
      modeLabel: 'Exam Tomorrow — Essential Triage (No All-Nighter)',
      strategyHeadline: `Calm, Sleep-Safe Eve-of-Exam Plan for ${subject}`,
      difficultyTargetedTip: difficultyTips[input.biggestDifficulty],
      steps,
      sleepBoundaryMessage:
        'Skip all-nighters completely: sleeping 7.5–9 hours tonight strengthens memory recall and prevents blanking out in the exam hall.',
      wellbeingReassurance:
        'One test never defines your worth or your future. Do what fits calmly tonight, protect your sleep, and be proud of showing up.',
    };
  }

  // Standard multi-chunk revision plan
  const totalMins = Math.min(210, Math.max(30, input.availableMinutesToday || 75));
  const chunkCount = Math.max(2, Math.min(4, Math.round(totalMins / 30)));
  const studyChunk = Math.max(20, Math.floor((totalMins - (chunkCount - 1) * 5) / chunkCount));

  const steps: ExamRescueStep[] = [];
  for (let i = 1; i <= chunkCount; i++) {
    steps.push({
      id: `er-std-${i}`,
      stepNumber: i,
      durationMinutes: studyChunk,
      title:
        i === 1
          ? `Part 1: Break "${workDesc}" into Small Checkpoints & Core Concepts`
          : i === chunkCount
          ? `Part ${i}: Self-Quiz & Spaced Revision Check`
          : `Part ${i}: Practice Questions & Worked Problems (${subject})`,
      methodTag: i === 1 ? 'Chunking' : i === chunkCount ? 'Spaced Recall' : 'Practice',
      instruction:
        i === 1
          ? `Divide "${workDesc}" into ${chunkCount} bite-sized pieces (deadline: ${input.deadlineLabel}). Tackle piece #1 now.`
          : i === chunkCount
          ? 'Close your textbook, write down the main takeaways or solve 2 recap problems from memory, then take a 5-min break.'
          : 'Practice applying the topic with 3–4 textbook or past-paper questions, followed by a 5-minute stretch & water break.',
      completed: false,
    });
  }

  return {
    modeLabel: `Balanced Revision Plan (${totalMins} mins total)`,
    strategyHeadline: `Step-by-Step ${subject} Plan (Target: ${input.deadlineLabel})`,
    difficultyTargetedTip: difficultyTips[input.biggestDifficulty],
    steps,
    sleepBoundaryMessage:
      'Keep evening study bounded with 5-minute breaks between blocks, and wrap up early enough for a full night of rest.',
    wellbeingReassurance:
      'Steady small steps beat perfectionism. Your wellbeing always comes before academic pressure.',
  };
}

/**
 * Generates "Fuel Your School Day" practical, affordable suggestions based on timing, diet, allergies, and pantry.
 */
export function getSchoolDayFuelSuggestions(input: SchoolFuelInput): SchoolFuelOutput {
  const situationLabels: Record<SchoolFuelInput['situation'], string> = {
    before_school: 'Before School (Morning Fuel)',
    during_school: 'During School (Tiffin / Lunch Break)',
    after_school: 'Right After School (Afternoon Recharge)',
    before_studying: 'Before Studying (Focus Snack)',
    exam_prep: 'During Exam Preparation (Steady Brain Fuel)',
    before_bedtime: 'Before Bedtime (Light Evening Comfort)',
  };

  const safePool = filterSafeFoods(input.dietaryPreference, input.allergies);
  const byTiming = safePool.filter((f) => f.timings.includes(input.situation));
  const byPortion = byTiming.filter((f) =>
    input.portionNeed === 'quick_snack' ? f.type === 'snack' : f.type === 'meal'
  );

  const candidates = byPortion.length > 0 ? byPortion : byTiming.length > 0 ? byTiming : safePool;

  const rawPhrases = input.availableFoodsText
    .toLowerCase()
    .split(/[,;\n]+|\band\b/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 2);

  const itemMatchesPhrase = (item: MealCandidate, phrase: string): boolean => {
    // Avoid false match where "rice cakes" matches steamed/flattened "rice"
    if (phrase.includes('rice cake')) return false;
    return (
      item.keywords.some((kw) => phrase === kw || phrase.includes(kw)) ||
      item.ingredients.toLowerCase().includes(phrase)
    );
  };

  const pantryMatched =
    rawPhrases.length > 0
      ? candidates.filter((item) => rawPhrases.some((phrase) => itemMatchesPhrase(item, phrase)))
      : [];

  const matchedPhraseCount = rawPhrases.filter((phrase) =>
    candidates.some((item) => itemMatchesPhrase(item, phrase))
  ).length;

  const finalItems = (pantryMatched.length > 0 ? pantryMatched : candidates).slice(0, 3);
  const needsAiCustomHelp =
    rawPhrases.length > 0 && (pantryMatched.length === 0 || matchedPhraseCount < Math.ceil(rawPhrases.length / 2));

  const hydrationByTiming: Record<SchoolFuelInput['situation'], string> = {
    before_school: 'Have a glass of water after waking up and pack a clean water bottle in your school bag.',
    during_school: 'Take regular sips of water during break times, especially after outdoor PE or warm classrooms.',
    after_school: 'Drink a glass of water when you get home to refresh yourself before starting homework.',
    before_studying: 'Keep plain water on your desk; avoid sugary sodas or late caffeine.',
    exam_prep: 'Sip water steadily when thirsty—skip energy drinks that disturb sleep and cause jitters.',
    before_bedtime: 'Keep fluids light right before sleep so you can rest comfortably through the night.',
  };

  const suggestions: SchoolFuelSuggestion[] = finalItems.map((item) => ({
    title: item.name,
    ingredientsSummary: item.ingredients,
    prepTime: item.type === 'snack' ? '5–10 mins' : '15–20 mins',
    simpleExplanation: item.whyItHelps,
    hydrationTip: hydrationByTiming[input.situation],
  }));

  return {
    situationLabel: situationLabels[input.situation],
    matchedFromPantry: pantryMatched.length > 0,
    needsAiCustomHelp,
    suggestions,
    honestHealthNote:
      'Regular balanced meals and hydration support everyday energy and alertness, though no specific food cures fatigue, anxiety, headaches, or medical conditions. Never use supplements or medications without a doctor’s guidance.',
  };
}

/**
 * Honest rules-based fallback for "Talk to Your Wellbeing Coach" when live Gemini API is unavailable.
 */
export function generateFallbackCoachResponse(
  studentMessage: string,
  recentCheckIn?: StudentDailyCheckIn | null
): Omit<CoachMessage, 'id' | 'timestamp'> {
  const safety = evaluateStudentSafety(
    studentMessage,
    recentCheckIn?.botheringOptions || [],
    recentCheckIn?.stressLevel || 5,
    recentCheckIn?.tirednessLevel || 5
  );

  if (safety.level === 'emergency') {
    return {
      role: 'coach',
      source: 'rules_engine',
      safetyLevel: 'emergency',
      text: `${safety.headline}: ${safety.message}`,
      actionSteps: safety.actionItems,
      easiestFirstPrompt: false,
    };
  }

  const lower = studentMessage.toLowerCase();

  if (safety.level === 'ongoing_concern') {
    return {
      role: 'coach',
      source: 'rules_engine',
      safetyLevel: 'ongoing_concern',
      text: `Thank you for sharing how tough things feel right now. ${safety.message}`,
      followUpQuestion: 'Is there a parent, family member, teacher, or school counselor nearby you could talk with today?',
      actionSteps: [
        ...safety.actionItems,
        'Take a gentle 15-minute rest away from screens and sip some water.',
      ],
      easiestFirstPrompt: true,
    };
  }

  if (lower.includes('test') || lower.includes('exam') || lower.includes('maths') || lower.includes('concentrate')) {
    return {
      role: 'coach',
      source: 'rules_engine',
      safetyLevel: 'supportive',
      text: 'Having a test coming up when your brain refuses to concentrate is really frustrating—and very common. Forcing long hours usually backfires, so let us shrink the plan into calm, doable pieces.',
      followUpQuestion: 'Which 1 or 2 topics feel most important for your test, and how much time do you have before dinner?',
      actionSteps: [
        'Drink a glass of water, put your phone out of sight, and take 3 slow breaths (4s in, 6s out).',
        'Set a 20-minute timer to practice just 3 core questions or review key formulas.',
        'Take a 5-minute stretch break afterward, and protect a full night of sleep tonight.',
      ],
      easiestFirstPrompt: true,
    };
  }

  if (lower.includes('hungry') || lower.includes('eat') || lower.includes('food') || lower.includes('snack')) {
    return {
      role: 'coach',
      source: 'rules_engine',
      safetyLevel: 'supportive',
      text: 'Trying to study or unwind on an empty stomach makes everything feel harder! Getting a simple, familiar snack or meal first is a smart move.',
      followUpQuestion: 'Do you have simple ingredients like fruit, roti, chana, daal, eggs, or milk at home right now?',
      actionSteps: [
        'Grab an easy combo like banana/apple with nuts, roasted chana with roti, or an egg with roti.',
        'Have a comfortable glass of plain water alongside your snack.',
        'Give yourself 10–15 relaxed minutes to eat away from your textbooks.',
      ],
      easiestFirstPrompt: true,
    };
  }

  if (lower.includes('tired') || lower.includes('sleep') || lower.includes('exhausted')) {
    return {
      role: 'coach',
      source: 'rules_engine',
      safetyLevel: 'supportive',
      text: 'Coming home drained or after a short night of sleep is tough on your body and focus. Let us plan a gentle evening that protects your rest instead of pushing through exhaustion.',
      followUpQuestion: 'Did you get a chance to eat something and drink water since getting back from school?',
      actionSteps: [
        'Take a 20-minute comfortable rest (keep naps under 30 mins and skip coffee/energy drinks).',
        'Have a nourishing snack and a glass of water.',
        'Pick only your #1 must-do homework item for a 20-minute block, then wind down early for bedtime.',
      ],
      easiestFirstPrompt: true,
    };
  }

  return {
    role: 'coach',
    source: 'rules_engine',
    safetyLevel: 'supportive',
    text: 'I hear you—juggling classes, homework, and low energy after school can quickly feel overwhelming. We can organize the rest of your afternoon one gentle step at a time.',
    followUpQuestion: 'What feels heaviest right now: physical tiredness, hunger, or a specific homework/study task?',
    actionSteps: [
      'Pause for 5 minutes: drink some water and stretch your shoulders.',
      'Write down the single smallest task you need to finish today and set everything else aside for now.',
      'Work for just 15–20 calm minutes, then take a proper break.',
    ],
    easiestFirstPrompt: true,
  };
}

export interface StudentWeeklyComparisonSummary {
  hasPreviousWeekComparison: boolean;
  currentAvgEnergy: number;
  currentAvgStress: number;
  currentAvgSleep: number;
  sleepConsistencyRangeHours: number;
  totalStudySessions: number;
  totalBreaksTaken: number;
  totalCheckIns: number;
  totalGoalsCompleted: number;
  habitObservations: string[];
  disclaimerNote: string;
}

/**
 * Summarizes weekly student logs supportively without judgmental labels or medical claims.
 */
export function analyzeStudentWeeklyProgress(
  logs: StudentDailyActivityLog[]
): StudentWeeklyComparisonSummary {
  const currentLogs = logs.filter((l) => l.weekKey === 'Current Week');
  const prevLogs = logs.filter((l) => l.weekKey === 'Previous Week');
  const activeSet = currentLogs.length > 0 ? currentLogs : logs;

  if (activeSet.length === 0) {
    return {
      hasPreviousWeekComparison: false,
      currentAvgEnergy: 0,
      currentAvgStress: 0,
      currentAvgSleep: 0,
      sleepConsistencyRangeHours: 0,
      totalStudySessions: 0,
      totalBreaksTaken: 0,
      totalCheckIns: 0,
      totalGoalsCompleted: 0,
      habitObservations: [
        'Complete your first Student Daily Check-In or Small Win goal to start seeing your personal weekly rhythm here.',
      ],
      disclaimerNote:
        'These reflections describe self-reported daily routines only—they are not a medical assessment and never grade you as good or bad.',
    };
  }

  const avg = (arr: number[]) =>
    Math.round((arr.reduce((sum, v) => sum + v, 0) / Math.max(1, arr.length)) * 10) / 10;

  const currentAvgEnergy = avg(activeSet.map((l) => l.energyLevel));
  const currentAvgStress = avg(activeSet.map((l) => l.stressLevel));
  const sleepValues = activeSet.map((l) => l.sleepHours);
  const currentAvgSleep = avg(sleepValues);
  const sleepConsistencyRangeHours =
    sleepValues.length >= 2
      ? Math.round((Math.max(...sleepValues) - Math.min(...sleepValues)) * 10) / 10
      : 0;

  const totalStudySessions = activeSet.reduce((s, l) => s + l.studySessionsCompleted, 0);
  const totalBreaksTaken = activeSet.reduce((s, l) => s + l.breaksTaken, 0);
  const totalCheckIns = activeSet.filter((l) => l.checkInCompleted).length;
  const totalGoalsCompleted = activeSet.reduce((s, l) => s + l.goalsCompleted, 0);

  const habitObservations: string[] = [];
  const hasPreviousWeekComparison = currentLogs.length >= 2 && prevLogs.length >= 2;

  if (hasPreviousWeekComparison) {
    const prevSleep = avg(prevLogs.map((l) => l.sleepHours));
    const prevStress = avg(prevLogs.map((l) => l.stressLevel));
    const prevEnergy = avg(prevLogs.map((l) => l.energyLevel));

    const sleepDiff = Math.round((currentAvgSleep - prevSleep) * 10) / 10;
    if (Math.abs(sleepDiff) >= 0.4) {
      habitObservations.push(
        sleepDiff > 0
          ? `Your logged sleep averaged ${currentAvgSleep} hrs this week compared with ${prevSleep} hrs last week (+${sleepDiff} hrs).`
          : `Your logged sleep averaged ${currentAvgSleep} hrs this week compared with ${prevSleep} hrs last week (${sleepDiff} hrs)—consider an earlier evening wind-down when possible.`
      );
    } else {
      habitObservations.push(`Your average sleep stayed steady around ${currentAvgSleep} hrs across both weeks.`);
    }

    const stressDiff = Math.round((currentAvgStress - prevStress) * 10) / 10;
    if (stressDiff <= -0.8) {
      habitObservations.push(
        `Self-reported stress eased from ${prevStress}/10 last week to ${currentAvgStress}/10 this week.`
      );
    } else if (stressDiff >= 0.8) {
      habitObservations.push(
        `Self-reported stress was higher this week (${currentAvgStress}/10 vs ${prevStress}/10 last week)—extra breaks and lighter blocks can help.`
      );
    }

    const energyDiff = Math.round((currentAvgEnergy - prevEnergy) * 10) / 10;
    if (Math.abs(energyDiff) >= 0.8) {
      habitObservations.push(
        energyDiff > 0
          ? `Afternoon energy check-ins rose from ${prevEnergy}/10 to ${currentAvgEnergy}/10.`
          : `Afternoon energy dipped (${currentAvgEnergy}/10 vs ${prevEnergy}/10)—check after-school snacks and rest.`
      );
    }
  } else {
    habitObservations.push(
      `Logged ${activeSet.length} day${activeSet.length > 1 ? 's' : ''} this week. Keep checking in at your own pace—week-to-week comparisons unlock automatically once two weeks of records exist.`
    );
  }

  if (sleepConsistencyRangeHours > 2) {
    habitObservations.push(
      `Sleep duration varied by ${sleepConsistencyRangeHours} hrs between nights; keeping wake and sleep times closer together can feel steadier.`
    );
  }

  return {
    hasPreviousWeekComparison,
    currentAvgEnergy,
    currentAvgStress,
    currentAvgSleep,
    sleepConsistencyRangeHours,
    totalStudySessions,
    totalBreaksTaken,
    totalCheckIns,
    totalGoalsCompleted,
    habitObservations,
    disclaimerNote:
      'These patterns reflect your self-reported daily routines only—they do not prove medical changes, and every week has natural ups and downs.',
  };
}

export const DEFAULT_SMALL_WINS_POOL: SmallWinChallenge[] = [
  {
    id: 'sw-break',
    title: 'Take a 15-minute screen-free rest break after school',
    category: 'rest',
    whyItMatters: 'Lets your eyes and nervous system recover from classroom focus.',
    selected: true,
    completed: false,
  },
  {
    id: 'sw-water',
    title: 'Drink a glass of water when thirsty & keep water on my desk',
    category: 'hydration',
    whyItMatters: 'Supports steady alertness during afternoon study.',
    selected: true,
    completed: false,
  },
  {
    id: 'sw-one-task',
    title: 'Complete one priority homework task in a 20-minute block',
    category: 'study',
    whyItMatters: 'Builds calm momentum without perfectionism.',
    selected: true,
    completed: false,
  },
  {
    id: 'sw-practice',
    title: 'Revise one topic using 3 active practice questions',
    category: 'study',
    whyItMatters: 'Active recall strengthens memory faster than passive re-reading.',
    selected: false,
    completed: false,
  },
  {
    id: 'sw-bedtime',
    title: 'Put books & phone away 30 minutes before sleep',
    category: 'sleep',
    whyItMatters: 'Helps you fall asleep more peacefully.',
    selected: false,
    completed: false,
  },
  {
    id: 'sw-talk',
    title: 'Share how my day felt with someone I trust',
    category: 'connection',
    whyItMatters: 'Talking lightens academic pressure so you never carry it alone.',
    selected: false,
    completed: false,
  },
];

export function computeStudentBadges(
  challenges: SmallWinChallenge[],
  logs: StudentDailyActivityLog[]
): StudentBadge[] {
  const completedWins = challenges.filter((c) => c.completed).length;
  const totalCheckIns = logs.filter((l) => l.checkInCompleted).length;
  const totalBreaks = logs.reduce((s, l) => s + l.breaksTaken, 0);
  const steadySleepDays = logs.filter((l) => l.sleepHours >= 7.5).length;

  return [
    {
      id: 'badge-gentle-reset',
      title: 'After-School Reset',
      description: 'Checked in on your wellbeing after school.',
      earned: totalCheckIns >= 1 || completedWins >= 1,
      criteriaText: 'Complete 1 daily check-in or Small Win',
    },
    {
      id: 'badge-mindful-pacer',
      title: 'Mindful Pacer',
      description: 'Protected study recovery by taking intentional breaks.',
      earned: totalBreaks >= 2 || challenges.some((c) => c.id === 'sw-break' && c.completed),
      criteriaText: 'Log 2+ study breaks or complete the rest break Small Win',
    },
    {
      id: 'badge-small-steps',
      title: 'Three Small Wins',
      description: 'Completed all 3 chosen daily Small Wins at your own pace.',
      earned: completedWins >= 3,
      criteriaText: 'Complete 3 chosen Small Wins in a day',
    },
    {
      id: 'badge-sleep-guardian',
      title: 'Rest & Sleep Supporter',
      description: 'Prioritized 7.5+ hours of restorative sleep across multiple nights.',
      earned: steadySleepDays >= 2 || challenges.some((c) => c.id === 'sw-bedtime' && c.completed),
      criteriaText: 'Log 2+ nights of 7.5h+ sleep or bedtime wind-down win',
    },
  ];
}
