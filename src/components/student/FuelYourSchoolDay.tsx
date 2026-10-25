/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Utensils, Droplet, Info } from 'lucide-react';
import {
  SchoolDayTiming,
  SchoolFuelInput,
  StudentDailyCheckIn,
} from '../../types/studentWellbeing';
import { getSchoolDayFuelSuggestions } from '../../utils/studentWellbeingLogic';
import { HealthMateAiOpinionBox } from './HealthMateAiOpinionBox';

interface FuelYourSchoolDayProps {
  recentCheckIn: StudentDailyCheckIn;
}

const TIMING_OPTIONS: { id: SchoolDayTiming; label: string }[] = [
  { id: 'before_school', label: 'Before school' },
  { id: 'during_school', label: 'During school' },
  { id: 'after_school', label: 'Right after school' },
  { id: 'before_studying', label: 'Before studying' },
  { id: 'exam_prep', label: 'During exam prep' },
  { id: 'before_bedtime', label: 'Before bedtime' },
];

const ALLERGY_OPTIONS = ['dairy', 'nuts', 'peanuts', 'eggs', 'gluten', 'soy'];

export const FuelYourSchoolDay: React.FC<FuelYourSchoolDayProps> = ({
  recentCheckIn,
}) => {
  const [situation, setSituation] = useState<SchoolDayTiming>('after_school');
  const [dietaryPreference, setDietaryPreference] = useState<
    SchoolFuelInput['dietaryPreference']
  >(recentCheckIn.dietaryPreference || 'vegetarian');
  const [allergies, setAllergies] = useState<string[]>(
    recentCheckIn.allergies || []
  );
  const [availableFoodsText, setAvailableFoodsText] = useState<string>(
    'roti, chana, banana, milk'
  );
  const [portionNeed, setPortionNeed] = useState<'quick_snack' | 'full_meal'>(
    'quick_snack'
  );

  const toggleAllergy = (al: string) => {
    setAllergies((prev) =>
      prev.includes(al) ? prev.filter((item) => item !== al) : [...prev, al]
    );
  };

  const fuelOutput = getSchoolDayFuelSuggestions({
    situation,
    dietaryPreference,
    allergies,
    availableFoodsText,
    portionNeed,
  });

  return (
    <div className="space-y-8">
      <section
        aria-labelledby="fuel-school-day-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div>
          <div className="text-xs text-[#0F766E] font-semibold">
            05. Fuel Your School Day · Affordable Everyday Student Nutrition
          </div>
          <h3
            id="fuel-school-day-heading"
            className="text-2xl font-bold text-[#172033] mt-1"
          >
            Practical Snacks & Meals Around Your School Day
          </h3>
          <p className="text-sm text-[#667085] mt-1 max-w-2xl">
            Simple, familiar food ideas (fruit, eggs, milk, yogurt, oats, roti, chana, daal, rice, homemade snacks) tailored to your timing, preferences, and what you actually have at home.
          </p>
        </div>

        {/* School-day timing buttons */}
        <div>
          <span className="block text-xs font-semibold text-[#172033] mb-2">
            When are you eating?
          </span>
          <div
            role="group"
            aria-label="School day meal timing"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
          >
            {TIMING_OPTIONS.map((opt) => {
              const active = situation === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSituation(opt.id)}
                  aria-pressed={active}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                    active
                      ? 'bg-[#101828] text-[#55E6A5] border-[#101828]'
                      : 'bg-[#F5F7FB] text-[#172033] border-[#E4E7EC] hover:border-[#CBD5E1]'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Diet, Portion & Available Pantry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2 border-t border-[#E4E7EC]">
          <div>
            <label
              htmlFor="fuel-diet-select"
              className="block text-xs font-semibold text-[#172033] mb-1.5"
            >
              Dietary preference
            </label>
            <select
              id="fuel-diet-select"
              value={dietaryPreference}
              onChange={(e) =>
                setDietaryPreference(
                  e.target.value as SchoolFuelInput['dietaryPreference']
                )
              }
              className="hm-input w-full rounded-xl px-3.5 py-2.5 text-sm"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="eggetarian">Eggetarian</option>
              <option value="omnivore">Omnivore (All foods)</option>
              <option value="halal">Halal</option>
              <option value="vegan">Vegan</option>
            </select>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#172033] mb-1.5">
              Do you need a quick snack or a full meal?
            </span>
            <div className="grid grid-cols-2 gap-2 bg-[#F5F7FB] p-1 rounded-xl border border-[#E4E7EC]">
              <button
                type="button"
                onClick={() => setPortionNeed('quick_snack')}
                className={`py-2 rounded-lg text-xs font-semibold transition ${
                  portionNeed === 'quick_snack'
                    ? 'bg-[#101828] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                Quick Snack
              </button>
              <button
                type="button"
                onClick={() => setPortionNeed('full_meal')}
                className={`py-2 rounded-lg text-xs font-semibold transition ${
                  portionNeed === 'full_meal'
                    ? 'bg-[#101828] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#172033]'
                }`}
              >
                Full Meal
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="fuel-pantry-input"
              className="block text-xs font-semibold text-[#172033] mb-1.5"
            >
              Available foods at home (comma-separated)
            </label>
            <input
              id="fuel-pantry-input"
              type="text"
              value={availableFoodsText}
              onChange={(e) => setAvailableFoodsText(e.target.value)}
              placeholder="e.g. roti, daal, banana, eggs, oats..."
              className="hm-input w-full rounded-xl px-3.5 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Allergies */}
        <div>
          <span className="block text-xs font-semibold text-[#172033] mb-2">
            Exclude food allergies:
          </span>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map((al) => {
              const active = allergies.includes(al);
              return (
                <button
                  key={al}
                  type="button"
                  onClick={() => toggleAllergy(al)}
                  aria-pressed={active}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition capitalize ${
                    active
                      ? 'bg-[#18243A] text-[#64D9F5] border-[#18243A]'
                      : 'bg-[#F5F7FB] text-[#172033] border-[#E4E7EC] hover:border-[#CBD5E1]'
                  }`}
                >
                  {al}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Suggestions Output */}
      <section
        aria-labelledby="fuel-results-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs text-[#0F766E] font-semibold">
              {fuelOutput.situationLabel} ·{' '}
              {fuelOutput.matchedFromPantry
                ? 'Matched with your home ingredients'
                : 'General safe options for your diet'}
            </div>
            <h4
              id="fuel-results-heading"
              className="text-xl font-bold text-[#172033] mt-0.5"
            >
              Recommended Ideas
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {fuelOutput.suggestions.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#F5F7FB] rounded-2xl p-5 flex flex-col justify-between space-y-4 border border-[#E4E7EC]"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#667085]">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#0F766E]">
                    <Utensils className="w-3.5 h-3.5" />
                    Option 0{idx + 1}
                  </span>
                  <span className="font-mono tabular-nums">{item.prepTime}</span>
                </div>
                <h5 className="text-base font-bold text-[#172033]">
                  {item.title}
                </h5>
                <p className="text-xs text-[#667085]">
                  <strong className="text-[#172033]">Ingredients:</strong> {item.ingredientsSummary}
                </p>
                <p className="text-sm text-[#172033] leading-relaxed pt-2 border-t border-[#E4E7EC]">
                  {item.simpleExplanation}
                </p>
              </div>
              <div className="text-xs text-[#667085] pt-2 border-t border-[#E4E7EC] flex items-start gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-[#0E7490] shrink-0 mt-0.5" />
                <span>{item.hydrationTip}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#55E6A5]/12 rounded-xl p-4 text-xs text-[#172033] flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
          <span>{fuelOutput.honestHealthNote}</span>
        </div>
      </section>

      {/* HealthMate AI Custom Pantry Helper (automatically highlighted when custom items aren't in local presets!) */}
      <HealthMateAiOpinionBox
        key={`${availableFoodsText}-${situation}-${portionNeed}`}
        sectionTitle="School-Day Food & Pantry"
        highlighted={fuelOutput.needsAiCustomHelp}
        highlightReason={
          fuelOutput.needsAiCustomHelp
            ? `Some ingredients you entered ("${availableFoodsText}") are outside our standard local preset list—ask HealthMate AI below for a custom snack/meal combination using your exact kitchen items!`
            : undefined
        }
        defaultPrompt={
          fuelOutput.needsAiCustomHelp
            ? `What safe ${portionNeed === 'quick_snack' ? 'quick snack' : 'meal'} can I make ${fuelOutput.situationLabel.toLowerCase()} with ${availableFoodsText}?`
            : ''
        }
        promptPlaceholder="Enter what is in your fridge/kitchen right now and ask HealthMate AI for a simple student snack or meal idea..."
        recentCheckIn={recentCheckIn}
        contextData={{
          situation,
          dietaryPreference,
          allergies,
          availableFoodsText,
          portionNeed,
        }}
      />
    </div>
  );
};
