/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ActionPlanTask,
  ComparisonDelta,
  DailyRecommendation,
  FoodGuideItem,
  HealthCheckInRecord,
  RedFlagCheckResult,
  ScorecardBreakdown,
  ThenVsNowAnalysis,
  UserProfile,
  VitalsData,
} from '../types/health';

/**
 * Calculates a transparent lifestyle wellbeing score (0-100)
 * Broken down into 4 transparent pillars (25 pts each):
 * 1. Sleep Consistency & Quality (0-25)
 * 2. Hydration Balance (0-25)
 * 3. Daily Physical Activity (0-25)
 * 4. Mood & Stress Equilibrium (0-25)
 */
export function calculateHealthScore(
  record: HealthCheckInRecord,
  ageGroup: UserProfile['ageGroup'] = '18_29'
): ScorecardBreakdown {
  // 1. Sleep Calculation (Max 25 pts)
  // Teens (under 18) thrive on 8.5 - 10 hours; adults 7 - 9 hours
  const isYouth = ageGroup === 'under_18';
  const targetMinSleep = isYouth ? 8.5 : 7.0;
  const targetMaxSleep = isYouth ? 10.0 : 9.0;

  let sleepHoursPts = 0;
  if (record.sleepHours >= targetMinSleep && record.sleepHours <= targetMaxSleep) {
    sleepHoursPts = 15;
  } else if (record.sleepHours >= targetMinSleep - 1.5 && record.sleepHours <= targetMaxSleep + 1.5) {
    sleepHoursPts = 10;
  } else if (record.sleepHours > 4) {
    sleepHoursPts = 5;
  } else {
    sleepHoursPts = 2;
  }

  // Sleep Quality is 1 to 5 -> maps to up to 10 points
  const sleepQualityPts = Math.min(10, Math.round(((record.sleepQuality || 3) / 5) * 10));
  const sleepTotal = Math.min(25, sleepHoursPts + sleepQualityPts);

  // 2. Hydration Calculation (Max 25 pts)
  // Healthy target: ~1.8L to 2.8L. Avoid extreme excess (>4L without endurance exercise)
  let hydrationTotal = 0;
  const l = record.hydrationLiters;
  if (l >= 1.8 && l <= 2.8) {
    hydrationTotal = 25;
  } else if ((l >= 1.4 && l < 1.8) || (l > 2.8 && l <= 3.4)) {
    hydrationTotal = 19;
  } else if (l >= 1.0 && l < 1.4) {
    hydrationTotal = 13;
  } else if (l > 0) {
    hydrationTotal = 7;
  } else {
    hydrationTotal = 0;
  }

  // 3. Physical Activity Calculation (Max 25 pts)
  // General healthy guidelines: 30-60 active minutes daily
  let activityTotal = 0;
  const mins = record.activeMinutes;
  if (mins >= 45) {
    activityTotal = 25;
  } else if (mins >= 30) {
    activityTotal = 21;
  } else if (mins >= 15) {
    activityTotal = 14;
  } else if (mins >= 5) {
    activityTotal = 8;
  } else {
    activityTotal = 4;
  }

  // 4. Mood & Stress Equilibrium (Max 25 pts)
  // Mood: 1-5 (5 = best, up to 13 pts)
  // Stress: 1-5 (1 = lowest/calm, 5 = intense; inverted, up to 12 pts)
  const moodPts = Math.min(13, Math.round(((record.moodScore || 3) / 5) * 13));
  // Invert stress: 1 -> 12pts, 2 -> 10pts, 3 -> 7pts, 4 -> 4pts, 5 -> 1pt
  const stressInvertedMap: Record<number, number> = { 1: 12, 2: 10, 3: 7, 4: 4, 5: 1 };
  const stressPts = stressInvertedMap[record.stressLevel] ?? 7;
  const moodTotal = Math.min(25, moodPts + stressPts);

  const overall = sleepTotal + hydrationTotal + activityTotal + moodTotal;

  return {
    overallScore: Math.min(100, Math.max(0, overall)),
    sleepScore: sleepTotal,
    hydrationScore: hydrationTotal,
    activityScore: activityTotal,
    moodScore: moodTotal,
    sleepExplanation: `${record.sleepHours} hrs logged with quality ${record.sleepQuality}/5 (target: ${
      isYouth ? '8.5–10 hrs for young people' : '7–9 hrs for adults'
    }). Contributed ${sleepTotal}/25 points.`,
    hydrationExplanation: `${record.hydrationLiters}L consumed today against standard lifestyle guideline (1.8–2.8L). Contributed ${hydrationTotal}/25 points.`,
    activityExplanation: `${record.activeMinutes} minutes of physical activity logged (daily target 30–45+ min). Contributed ${activityTotal}/25 points.`,
    moodExplanation: `Mood rated ${record.moodScore}/5 and stress level at ${record.stressLevel}/5. Contributed ${moodTotal}/25 points.`,
    methodology:
      'Score is calculated equally across 4 lifestyle habit dimensions (25 points each = 100 max). Points reflect adherence to general evidence-based wellbeing routines.',
    medicalDisclaimer:
      'IMPORTANT DISCLAIMER: This Wellbeing Scorecard is an educational habit-tracking index only. It does not measure clinical physiology, diagnose medical conditions, or replace professional healthcare consultation.',
  };
}

/**
 * Then vs Now comparative analysis
 * Compares past check-in with current check-in.
 * Handles "insufficient data" strictly and never claims improvement without valid records.
 */
export function compareThenVsNow(
  previousRecord?: HealthCheckInRecord | null,
  currentRecord?: HealthCheckInRecord | null
): ThenVsNowAnalysis {
  if (!previousRecord || !currentRecord) {
    return {
      deltas: [],
      positiveHighlights: [],
      attentionAreas: [],
      stableMetrics: [],
      insufficientDataReason:
        'Insufficient historical data. You need at least two check-in entries from different dates or weeks to compute verified progress trends and comparisons.',
    };
  }

  const deltas: ComparisonDelta[] = [];
  const positiveHighlights: string[] = [];
  const attentionAreas: string[] = [];
  const stableMetrics: string[] = [];

  // Helper to compute delta
  const computeMetric = (
    key: keyof HealthCheckInRecord,
    label: string,
    unit: string,
    prevVal: number,
    currVal: number,
    higherIsBetter: boolean,
    neutralThresholdPercent: number = 5,
    clinicalMeaning: string
  ) => {
    const difference = Math.round((currVal - prevVal) * 10) / 10;
    let pct: number | null = null;
    if (prevVal !== 0) {
      pct = Math.round(((currVal - prevVal) / Math.abs(prevVal)) * 100);
    }

    let status: ComparisonDelta['status'] = 'stable';
    const absPct = Math.abs(pct ?? 0);

    if (absPct <= neutralThresholdPercent) {
      status = 'stable';
      stableMetrics.push(`${label} remained steady at ${currVal} ${unit} (within ±${neutralThresholdPercent}%).`);
    } else if ((higherIsBetter && difference > 0) || (!higherIsBetter && difference < 0)) {
      status = 'positive';
      positiveHighlights.push(
        `${label} improved by ${Math.abs(difference)} ${unit} (${pct && pct > 0 ? '+' : ''}${pct}%).`
      );
    } else {
      status = 'needs_attention';
      attentionAreas.push(
        `${label} showed a decline of ${Math.abs(difference)} ${unit} (${pct}%). Consider gentle habits to support this.`
      );
    }

    let insight = '';
    if (status === 'positive') {
      insight = `Positive shift from ${prevVal} to ${currVal} ${unit}. Great consistency!`;
    } else if (status === 'needs_attention') {
      insight = `Shifted from ${prevVal} to ${currVal} ${unit}. Prioritize rest and routine here.`;
    } else {
      insight = `Consistent with your previous check-in (${prevVal} -> ${currVal} ${unit}).`;
    }

    deltas.push({
      metricKey: key,
      label,
      unit,
      previousValue: prevVal,
      currentValue: currVal,
      difference,
      percentageChange: pct,
      status,
      insight,
      clinicalMeaning,
    });
  };

  // 1. Sleep Hours (higher is generally better up to optimal range)
  computeMetric(
    'sleepHours',
    'Sleep Duration',
    'hrs',
    previousRecord.sleepHours,
    currentRecord.sleepHours,
    true,
    5,
    'Sleep supports immune function, neuroplasticity, memory retention, and emotional balance.'
  );

  // 2. Sleep Quality
  computeMetric(
    'sleepQuality',
    'Sleep Restfulness',
    '/5',
    previousRecord.sleepQuality,
    currentRecord.sleepQuality,
    true,
    0,
    'Subjective sleep quality correlates closely with cognitive sharpness and daylight energy.'
  );

  // 3. Active Minutes
  computeMetric(
    'activeMinutes',
    'Physical Movement',
    'mins',
    previousRecord.activeMinutes,
    currentRecord.activeMinutes,
    true,
    10,
    'Regular moderate aerobic movement enhances cardiovascular circulation and reduces stress hormones.'
  );

  // 4. Hydration
  computeMetric(
    'hydrationLiters',
    'Daily Hydration',
    'L',
    previousRecord.hydrationLiters,
    currentRecord.hydrationLiters,
    true,
    8,
    'Adequate cellular hydration optimizes digestion, kidney filtration, and mental clarity.'
  );

  // 5. Stress Level (Lower is better!)
  computeMetric(
    'stressLevel',
    'Perceived Stress',
    '/5',
    previousRecord.stressLevel,
    currentRecord.stressLevel,
    false,
    0,
    'Sustained high stress impacts cortisol regulation, sleep latency, and blood pressure.'
  );

  // 6. Mood Score
  computeMetric(
    'moodScore',
    'General Mood',
    '/5',
    previousRecord.moodScore,
    currentRecord.moodScore,
    true,
    0,
    'Overall subjective emotional state reflecting daily vitality and environmental balance.'
  );

  return {
    deltas,
    positiveHighlights,
    attentionAreas,
    stableMetrics,
    baselineDate: previousRecord.dateLabel || previousRecord.weekLabel,
    currentDate: currentRecord.dateLabel || currentRecord.weekLabel,
  };
}

/**
 * Health Red-Flag Safety System
 * Rapidly flags acute warning signs or concerning clinical vital ranges.
 * Directs immediately to emergency medical care without questionnaire delays.
 */
export function screenRedFlags(
  symptoms: string[] = [],
  vitals?: VitalsData,
  userNotes: string = ''
): RedFlagCheckResult {
  const combinedText = `${symptoms.join(' ')} ${userNotes}`.toLowerCase();

  const emergencySymptomTriggers = [
    {
      term: 'chest pain',
      label: 'Crushing or radiating chest pain or pressure',
    },
    {
      term: 'shortness of breath',
      label: 'Severe acute shortness of breath or inability to speak full sentences',
    },
    {
      term: 'difficulty breathing',
      label: 'Severe respiratory distress',
    },
    {
      term: 'stroke',
      label: 'Sudden facial droop, arm weakness, or slurred speech (FAST)',
    },
    {
      term: 'numbness',
      label: 'Sudden unilateral numbness or paralysis',
    },
    {
      term: 'slurred speech',
      label: 'Sudden speech impairment',
    },
    {
      term: 'allergic reaction',
      label: 'Signs of anaphylaxis: tongue/lip swelling, throat tightness, or widespread hives',
    },
    {
      term: 'throat swelling',
      label: 'Throat or airway swelling',
    },
    {
      term: 'coughing blood',
      label: 'Hemoptysis (coughing up fresh blood)',
    },
    {
      term: 'fainting',
      label: 'Unexplained syncope or sudden loss of consciousness',
    },
    {
      term: 'worst headache',
      label: 'Sudden "thunderclap" severe headache of maximal intensity',
    },
    {
      term: 'self harm',
      label: 'Crisis or self-harm thoughts',
    },
    {
      term: 'suicide',
      label: 'Crisis or self-harm thoughts',
    },
  ];

  const flaggedSymptoms: string[] = [];
  emergencySymptomTriggers.forEach((trigger) => {
    if (combinedText.includes(trigger.term)) {
      flaggedSymptoms.push(trigger.label);
    }
  });

  // Vitals emergency checks
  let vitalsWarning: string | undefined;
  let vitalsIsEmergency = false;

  if (vitals?.systolicBP !== undefined && vitals.systolicBP >= 180) {
    vitalsWarning = `Hypertensive Crisis Threshold: Systolic BP measured at ${vitals.systolicBP} mmHg (>= 180 mmHg requires urgent evaluation).`;
    vitalsIsEmergency = true;
  } else if (vitals?.diastolicBP !== undefined && vitals.diastolicBP >= 120) {
    vitalsWarning = `Hypertensive Crisis Threshold: Diastolic BP measured at ${vitals.diastolicBP} mmHg (>= 120 mmHg requires urgent evaluation).`;
    vitalsIsEmergency = true;
  } else if (vitals?.restingHeartRate !== undefined && vitals.restingHeartRate > 140) {
    vitalsWarning = `Tachycardia Alert: Resting Heart Rate of ${vitals.restingHeartRate} bpm at rest is unusually elevated.`;
    vitalsIsEmergency = true;
  } else if (vitals?.bloodGlucose !== undefined && (vitals.bloodGlucose > 300 || vitals.bloodGlucose < 55)) {
    vitalsWarning = `Critical Blood Glucose: Value ${vitals.bloodGlucose} mg/dL is outside safe physiologic range.`;
    vitalsIsEmergency = true;
  }

  if (flaggedSymptoms.length > 0 || vitalsIsEmergency) {
    return {
      isUrgent: true,
      severity: 'emergency',
      title: '🚨 Urgent Medical Attention Recommended',
      description:
        'One or more reported symptoms or clinical measurements require prompt medical evaluation rather than routine lifestyle tracking.',
      immediateActions: [
        'Call your local emergency services (911 in US/Canada, 112 in Europe, 999 in UK, or your local emergency line) immediately if you or someone else is experiencing severe distress.',
        'If experiencing chest pain, difficulty breathing, or stroke symptoms, do not drive yourself—call for an ambulance.',
        'Do not delay seeking in-person medical care to complete any online questionnaires or health plans.',
        'If having thoughts of self-harm, please dial 988 (Suicide & Crisis Lifeline in US/Canada) or contact your local hospital emergency department.',
      ],
      recommendedCareLevel: 'emergency_services',
      flaggedSymptoms,
      vitalsWarning,
    };
  }

  // Moderate concerning symptoms (e.g. persistent fever, mild chest twinges without shortness of breath, unexplained weight change)
  const concerningKeywords = ['fever', 'persistent cough', 'dizziness', 'joint swelling', 'palpitations'];
  const concerningFound = concerningKeywords.filter((k) => combinedText.includes(k));

  if (concerningFound.length > 0) {
    return {
      isUrgent: false,
      severity: 'concerning',
      title: '⚠️ Recommended Consultation with Healthcare Professional',
      description:
        'You noted symptoms that are best evaluated by a licensed primary care doctor or clinic nurse to ensure accurate diagnosis and appropriate care.',
      immediateActions: [
        'Schedule an appointment with your qualified primary care physician.',
        'Keep a written log of when symptoms occur, their severity, and what relieves or triggers them.',
        'If symptoms suddenly worsen or new red flags develop, seek urgent care immediately.',
      ],
      recommendedCareLevel: 'primary_doctor',
      flaggedSymptoms: concerningFound.map((k) => `Reported symptom: ${k}`),
    };
  }

  return {
    isUrgent: false,
    severity: 'normal',
    title: 'Routine Lifestyle Tracking',
    description: 'No acute emergency red flags identified in your current entries. Continue regular wellness habits.',
    immediateActions: [
      'Maintain balanced hydration, consistent sleep schedules, and daily physical movement.',
      'Check in with your routine doctor for periodic preventative checkups.',
    ],
    recommendedCareLevel: 'routine',
    flaggedSymptoms: [],
  };
}

/**
 * Generates an adaptive, realistic 7-Day Wellbeing Action Plan
 * Adapts to age (protects minors from diets/supplements), goals, schedule, and preferences.
 */
export function generate7DayPlan(
  profile: UserProfile,
  latestRecord?: HealthCheckInRecord | null
): ActionPlanTask[] {
  const isMinor = profile.ageGroup === 'under_18';
  const mainGoal = profile.mainGoal;

  const baseTasks: ActionPlanTask[] = [
    {
      id: 'day-1',
      day: 1,
      dayName: 'Monday',
      title: isMinor ? 'Digital Wind-Down & Bedtime Anchor' : 'Evening Tech Sunset & Sleep Sanctuary',
      category: 'sleep',
      description: isMinor
        ? 'Place phone/tablet across the room 30 minutes before sleep to help your brain rest naturally for school.'
        : 'Dim bedroom lights and turn off screens 45 minutes before sleep to support natural melatonin production.',
      durationMinutes: 30,
      completed: false,
      targetMetric: 'Target: 8+ hours restorative sleep',
    },
    {
      id: 'day-2',
      day: 2,
      dayName: 'Tuesday',
      title: 'Morning Hydration Refresh',
      category: 'hydration',
      description:
        'Drink a refreshing glass of water upon waking before caffeine or screen time to rehydrate after overnight rest.',
      durationMinutes: 5,
      completed: false,
      targetMetric: 'Target: 2 Liters throughout the day (avoid forcing excess water)',
    },
    {
      id: 'day-3',
      day: 3,
      dayName: 'Wednesday',
      title: isMinor ? 'Joyful Movement & Outdoor Fresh Air' : 'Midday Posture & Mobility Break',
      category: 'activity',
      description: isMinor
        ? 'Enjoy 30 minutes of fun physical activity: cycling, shooting hoops, dancing, or walking with friends.'
        : 'Take a 20-minute brisk walk during lunch or perform gentle hamstring and shoulder stretches to break up desk sitting.',
      durationMinutes: isMinor ? 30 : 20,
      completed: false,
      targetMetric: 'Target: 30+ active minutes',
    },
    {
      id: 'day-4',
      day: 4,
      dayName: 'Thursday',
      title: 'Mindful Breathing & Stress Decompression',
      category: 'mindfulness',
      description:
        'Practice 4-7-8 calming breath or 5 minutes of box breathing between study or work tasks to reset your nervous system.',
      durationMinutes: 10,
      completed: false,
      targetMetric: 'Target: Perceived stress score <= 2/5',
    },
    {
      id: 'day-5',
      day: 5,
      dayName: 'Friday',
      title: 'Colorful Plate & Balanced Fuel',
      category: 'nutrition',
      description: isMinor
        ? 'Add your favorite fresh fruit or colorful vegetable to your lunch or snack. Nourish your body with energy you enjoy!'
        : 'Include a fiber-rich food (legumes, greens, or whole grains) with your main meal for sustained energy without afternoon slumps.',
      durationMinutes: 15,
      completed: false,
      targetMetric: 'Target: Balanced, non-restrictive plate',
    },
    {
      id: 'day-6',
      day: 6,
      dayName: 'Saturday',
      title: 'Active Social or Nature Exploration',
      category: 'activity',
      description:
        'Engage in unstructured outdoor movement: a walk in the park, gardening, family hike, or recreation.',
      durationMinutes: 45,
      completed: false,
      targetMetric: 'Target: 45+ minutes movement',
    },
    {
      id: 'day-7',
      day: 7,
      dayName: 'Sunday',
      title: 'Weekly Reflection & Returning Check-in',
      category: 'mindfulness',
      description:
        'Log your weekly check-in on HealthMate AI. Review what felt energizing, celebrate small wins, and set a kind intention for next week.',
      durationMinutes: 10,
      completed: false,
      targetMetric: 'Target: Complete weekly health check-in',
    },
  ];

  // Adjust emphasis based on primary goal
  if (mainGoal === 'manage_stress') {
    baseTasks[0].description = '10 minutes of gentle journaling or progressive muscle relaxation before sleep.';
    baseTasks[3].title = 'Scheduled 15-Minute Worry-Free Pause';
  } else if (mainGoal === 'increase_activity') {
    baseTasks[1].title = 'Morning 10-Minute Sun & Stride';
    baseTasks[1].description = 'Step outside for a 10-minute walk in natural morning daylight to synchronize circadian rhythm.';
  } else if (mainGoal === 'stay_hydrated') {
    baseTasks[4].title = 'Hydration Habit Stacking';
    baseTasks[4].description = 'Pair a glass of water with existing daily anchor habits (e.g. after brushing teeth, after lunch).';
  }

  return baseTasks;
}

/**
 * "What Should I Do Today?" smart recommendations
 * Interactive safe suggestions with guardrails against extreme water intake, supplements, restrictive diets.
 */
export function getDailyRecommendation(
  situation: string,
  ageGroup: UserProfile['ageGroup'] = '18_29'
): DailyRecommendation {
  const isMinor = ageGroup === 'under_18';

  switch (situation) {
    case 'low_sleep':
      return {
        situation: 'Insufficient or Poor Sleep Last Night',
        headline: 'Prioritize Daytime Sunlight, Gentle Pacing & an Earlier Tech Wind-Down',
        recommendation:
          'When sleep was short, the body benefits from natural circadian cues rather than excessive stimulants. Get outside for 10-15 minutes of natural sunlight within an hour of waking to boost daytime alertness.',
        actionableSteps: [
          'Step into morning daylight for 10–15 minutes without sunglasses.',
          'Keep hydration steady: drink water with a light pinch of citrus or fruit slice.',
          'If fatigued, take a gentle 20-minute power nap before 2:00 PM (avoid long naps that disrupt night sleep).',
          'Avoid heavy caffeine past 1:00 PM so you can fall asleep smoothly tonight.',
        ],
        safetyBoundaries:
          'Safety Guardrail: Do NOT consume high-dose energy drinks, unverified sleep supplements, or sleep medications without a physician prescription. Do not force extreme workouts when physically exhausted.',
        ageRelevance: isMinor
          ? 'For students: A steady bedtime helps brain memory consolidation for exams.'
          : 'For adults: Helps maintain cognitive performance without relying on excessive stimulants.',
      };

    case 'feeling_sluggish':
      return {
        situation: 'Feeling Stiff, Sluggish or Low Energy',
        headline: 'Gentle 10-Minute Dynamic Movement & Hydration Wake-Up',
        recommendation:
          'Sluggishness is often caused by sedentary static posture and mild dehydration. Gentle fluid movement increases blood flow to muscles and brain without depleting reserves.',
        actionableSteps: [
          'Drink a room-temperature glass of water.',
          'Do 5-8 minutes of gentle joint mobility: shoulder rolls, spinal cat-cow, and calf stretches.',
          'Take a 10-minute walk at an easy, conversational pace.',
          'Enjoy a balanced snack with complex carbs and protein (e.g., apple slices with nut butter or oatmeal).',
        ],
        safetyBoundaries:
          'Safety Guardrail: Safe for all fitness levels. Never force movements that cause sharp joint pain. Avoid skipping meals or crash cleanses.',
        ageRelevance: 'Safe and encouraging for all ages, promoting vitality rather than punishment.',
      };

    case 'high_stress':
      return {
        situation: 'Feeling Overwhelmed, Anxious or Stressed',
        headline: 'Parasympathetic Reset: The 4-7-8 Breathing & 5-4-3-2-1 Sensory Grounding',
        recommendation:
          'Stress activates the sympathetic fight-or-flight system. Lengthening your exhale directly stimulates the vagus nerve, signaling your heart rate and adrenal glands to settle.',
        actionableSteps: [
          'Physiological Sigh: Take two quick inhales through the nose, followed by a long, slow exhale through the mouth. Repeat 3 times.',
          '5-4-3-2-1 Grounding: Name 5 things you can see, 4 you can touch, 3 you hear, 2 you smell, and 1 you are grateful for.',
          'Step away from screens and notifications for 15 minutes.',
          'Write down the single most urgent task and set the rest aside until tomorrow.',
        ],
        safetyBoundaries:
          'Safety Guardrail: Mindfulness is a wellbeing tool. If you feel severe panic, chest tightness, or thoughts of crisis, please contact a healthcare provider or crisis lifeline immediately.',
        ageRelevance: 'Particularly helpful for students facing exam stress and professionals with screen fatigue.',
      };

    case 'sitting_all_day':
      return {
        situation: 'Stuck Sitting at Desk / Studying for Long Hours',
        headline: 'Micro-Breaks: The 30/30 Desk Reset',
        recommendation:
          'Prolonged sitting tightens hip flexors, reduces venous leg return, and strains the cervical spine. Brief hourly standing breaks prevent physical fatigue.',
        actionableSteps: [
          'Set a reminder to stand up every 50 minutes.',
          'Perform 10 seated or standing glute squeezes and 10 ankle circles.',
          'Look 20 feet away for 20 seconds (the 20-20-20 rule) to relax ocular muscles.',
          'Drink a cup of herbal tea or water.',
        ],
        safetyBoundaries:
          'Safety Guardrail: Avoid sudden aggressive spinal twists if you have lower back stiffness.',
        ageRelevance: 'Ideal for both students in lecture halls and adults in office/remote workstations.',
      };

    default:
      return {
        situation: 'General Daily Wellbeing Boost',
        headline: 'Balanced Trifecta: Consistent Hydration, 20-Min Walk & Mindful Nourishment',
        recommendation:
          'Today is an opportunity to cultivate steady, sustainable habits. Small continuous routines outperform sporadic extreme efforts every time.',
        actionableSteps: [
          'Drink 6–8 glasses of water distributed evenly across the day.',
          'Enjoy a colorful meal featuring foods you love.',
          'Aim for 20–30 minutes of enjoyable movement.',
          'Take 5 minutes this evening to acknowledge something you did well today.',
        ],
        safetyBoundaries:
          'Safety Guardrail: Never restrict nourishing food or follow unverified fad advice. Honor your body’s signals.',
        ageRelevance: 'Appropriate for all age categories.',
      };
  }
}

/**
 * Curated multi-cultural Smart Food Database with nutritional facts,
 * allergen flags, balanced plate suggestions, and non-moralizing language.
 */
export const FOOD_DATABASE: FoodGuideItem[] = [
  {
    id: 'lentil-curry',
    name: 'Lentil Curry (Dal) with Brown Basmati Rice',
    culturalOrigin: 'South Asian / Indian',
    portion: '1 bowl dal (200g) with 1 cup brown rice',
    macronutrients: {
      protein: '18g',
      carbs: '64g',
      fat: '7g',
      fiber: '14g',
    },
    keyMicronutrients: ['Folate', 'Plant-based Iron', 'Magnesium', 'Potassium'],
    potentialBenefits: [
      'High soluble fiber supports steady blood glucose and prolonged satiety.',
      'Lentils + rice provide complementary amino acids for a complete plant protein profile.',
      'Turmeric and spices contain bioactive curcumin with mild antioxidant properties.',
    ],
    allergyWarnings: ['Legumes/Lentils', 'Check for mustard seed or ghee if dairy-sensitive'],
    balancedMealPairing:
      'Pair with a crisp cucumber and tomato kachumber salad and a spoonful of yogurt or lemon squeeze to boost iron absorption through vitamin C.',
    nonMoralizingPhilosophy:
      'Lentils and rice are a deeply nourishing, culturally cherished staple across billions of people. It provides sustained warmth and energy without restriction.',
  },
  {
    id: 'jollof-beans',
    name: 'Jollof Rice with Steamed Plantain & Stewed Beans',
    culturalOrigin: 'West African',
    portion: '1 plate balanced serving',
    macronutrients: {
      protein: '16g',
      carbs: '78g',
      fat: '9g',
      fiber: '12g',
    },
    keyMicronutrients: ['Vitamin A (from stewed tomatoes & peppers)', 'Potassium', 'Vitamin B6', 'Zinc'],
    potentialBenefits: [
      'Lycopene and beta-carotene from red bell peppers and rich tomato base support cellular health.',
      'Black-eyed peas or brown beans provide steady digestive fiber and sustained energy.',
      'Plantains offer resistant starch beneficial for gut microbiome diversity.',
    ],
    allergyWarnings: ['Check cooking oil (peanut or palm oil sensitivity)', 'Legumes'],
    balancedMealPairing:
      'Serve alongside steamed spinach or garden egg greens with a side of lean fish, chicken, or grilled tofu.',
    nonMoralizingPhilosophy:
      'A festive, flavorful staple rich in spices and community joy. Food fuels social connection and physical vitality equally.',
  },
  {
    id: 'mediterranean-salad',
    name: 'Mediterranean Chickpea Salad with Olive Oil & Feta',
    culturalOrigin: 'Mediterranean / Levantine',
    portion: '1 large bowl (300g)',
    macronutrients: {
      protein: '15g',
      carbs: '42g',
      fat: '18g (predominantly monounsaturated)',
      fiber: '11g',
    },
    keyMicronutrients: ['Vitamin C', 'Vitamin K', 'Calcium', 'Polyphenols'],
    potentialBenefits: [
      'Extra virgin olive oil contains oleic acid supporting cardiovascular vessel elasticity.',
      'Crisp cucumbers, bell peppers, and tomatoes provide cellular hydration and crisp texture.',
      'Chickpeas deliver gut-friendly prebiotic fiber.',
    ],
    allergyWarnings: ['Dairy (Feta cheese)', 'Legumes (Chickpeas)'],
    balancedMealPairing:
      'Enjoy with whole wheat pita or sourdough bread and a serving of grilled salmon or roasted artichoke hearts.',
    nonMoralizingPhilosophy:
      'Celebrates wholesome fats and crisp vegetables. Dietary fat is essential for nutrient absorption, brain health, and delicious flavor.',
  },
  {
    id: 'oatmeal-berries',
    name: 'Steel-Cut Oatmeal with Chia Seeds & Fresh Berries',
    culturalOrigin: 'Global Breakfast Classic',
    portion: '1 bowl prepared with milk or soy milk',
    macronutrients: {
      protein: '12g',
      carbs: '54g',
      fat: '8g',
      fiber: '10g',
    },
    keyMicronutrients: ['Beta-glucan Fiber', 'Manganese', 'Anthocyanins', 'Omega-3 ALA'],
    potentialBenefits: [
      'Beta-glucan soluble fiber helps stabilize post-meal blood sugar levels.',
      'Dark berries provide potent antioxidant anthocyanins supporting brain vitality.',
      'Gentle on sensitive digestive tracts.',
    ],
    allergyWarnings: ['Check for dairy milk vs plant milk', 'Oats (gluten cross-contact if not certified GF)'],
    balancedMealPairing:
      'Top with a handful of walnuts or pumpkin seeds and a sprinkle of cinnamon for warm flavor and healthy crunch.',
    nonMoralizingPhilosophy:
      'A warm, soothing morning meal that satisfies without feelings of deprivation or guilt.',
  },
  {
    id: 'tofu-stirfry',
    name: 'Tofu & Rainbow Vegetable Stir-Fry with Soba Noodles',
    culturalOrigin: 'East Asian',
    portion: '1 plate stir-fry with buckwheat soba',
    macronutrients: {
      protein: '22g',
      carbs: '58g',
      fat: '11g',
      fiber: '8g',
    },
    keyMicronutrients: ['Iron', 'Calcium', 'Vitamin C (Broccoli & Peppers)', 'Rutin'],
    potentialBenefits: [
      'Tofu is a rich source of bioavailable calcium and isoflavones.',
      'Buckwheat soba offers lower glycemic index carbohydrates compared to refined noodles.',
      'Quick high-heat stir frying preserves crisp texture and heat-sensitive vitamins.',
    ],
    allergyWarnings: ['Soy (Tofu, Soy sauce)', 'Sesame oil', 'Wheat/Gluten (if soba contains wheat flour)'],
    balancedMealPairing:
      'Add edamame or mushrooms for umami richness and enjoy with warm green tea.',
    nonMoralizingPhilosophy:
      'Versatile and satisfying. Balanced eating includes all textures, sauces, and culinary traditions.',
  },
];

/**
 * Searches and analyzes food input against database or general nutritional rules.
 * Flags user allergens automatically.
 */
export function analyzeFoodItem(
  query: string,
  userAllergies: string[] = [],
  ageGroup: UserProfile['ageGroup'] = '18_29'
): FoodGuideItem {
  const clean = query.trim().toLowerCase();

  const found = FOOD_DATABASE.find(
    (item) => item.name.toLowerCase().includes(clean) || clean.includes(item.name.toLowerCase().slice(0, 5))
  );

  if (found) {
    // Cross-reference with user allergies
    const userMatchedWarnings: string[] = [];
    userAllergies.forEach((allergy) => {
      if (
        found.allergyWarnings.some(
          (w) => w.toLowerCase().includes(allergy.toLowerCase()) || allergy.toLowerCase().includes(w.toLowerCase())
        )
      ) {
        userMatchedWarnings.push(`⚠️ Contains or may contain your reported allergen: ${allergy}`);
      }
    });

    return {
      ...found,
      allergyWarnings: [...found.allergyWarnings, ...userMatchedWarnings],
    };
  }

  // Dynamic fallback analyzer for any user input
  const isMinor = ageGroup === 'under_18';
  return {
    id: `custom-${Date.now()}`,
    name: query.trim() || 'Custom Meal',
    portion: 'Standard homemade or restaurant serving',
    macronutrients: {
      protein: '15–25g (estimated)',
      carbs: '35–65g (estimated)',
      fat: '10–20g (estimated)',
      fiber: '4–8g (estimated)',
    },
    keyMicronutrients: ['Essential Electrolytes', 'B-Complex Vitamins', 'Trace Minerals'],
    potentialBenefits: [
      'Provides biological energy to fuel physical movement, focus, and daily recovery.',
      'Supports steady blood glucose when paired with protein and dietary fiber.',
    ],
    allergyWarnings: [
      'Always inspect food packaging or inquire with the kitchen regarding hidden allergens (dairy, nuts, gluten, soy, eggs, shellfish).',
    ],
    balancedMealPairing:
      'To build a satisfying, energizing meal, aim for the balanced plate model: roughly 1/2 vegetables or fruit, 1/4 quality protein, and 1/4 complex carbohydrates or whole grains, plus a healthy splash of olive oil or dressings you enjoy.',
    nonMoralizingPhilosophy: isMinor
      ? 'Food is fuel for your growing body, social gatherings, and life! HealthMate AI never promotes restrictive diets, skipping meals, or counting calories for young people.'
      : 'Food is neither inherently "good" nor "bad". All culinary traditions and comfort foods have a rightful place in a wholesome, vibrant lifestyle.',
  };
}
