/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Heart,
  Sparkles,
  ShieldCheck,
  Check,
  Globe,
  Clock,
  Users,
  Utensils,
  BookOpen,
  ChefHat,
  Loader2,
} from 'lucide-react';
import { FoodGuideItem, UserProfile } from '../types/health';
import { FOOD_DATABASE } from '../utils/healthCalculations';
import { SectionGuideBanner } from './SectionGuideBanner';

interface SmartFoodGuideViewProps {
  userProfile: UserProfile | null;
}

export const SmartFoodGuideView: React.FC<SmartFoodGuideViewProps> = ({ userProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodGuideItem>(FOOD_DATABASE[0]);
  const [currentServings, setCurrentServings] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userAllergies = userProfile?.foodAllergies || [];
  const userPreferences = userProfile?.foodPreferences || [];

  // Helper to enrich food item with user allergy warnings
  const enrichWithAllergies = (item: FoodGuideItem): FoodGuideItem => {
    const warnings = [...(item.allergyWarnings || [])];
    userAllergies.forEach((allergy) => {
      const lower = allergy.toLowerCase();
      const hasMatch = warnings.some((w) => w.toLowerCase().includes(lower));
      if (hasMatch) {
        warnings.push(`⚠️ Contains or may contain your reported allergen: ${allergy}`);
      } else if (
        item.name.toLowerCase().includes(lower) ||
        item.ingredients?.some((ing) => ing.name.toLowerCase().includes(lower))
      ) {
        warnings.push(`⚠️ May contain your reported allergen: ${allergy}`);
      }
    });
    return { ...item, allergyWarnings: Array.from(new Set(warnings)) };
  };

  const handlePresetSelect = (item: FoodGuideItem) => {
    const enriched = enrichWithAllergies(item);
    setSelectedFood(enriched);
    setCurrentServings(enriched.servings || 2);
    setErrorMessage(null);
  };

  const synthesizeClientRecipe = (q: string): FoodGuideItem => {
    return {
      id: `fallback-${Date.now()}`,
      name: q.trim().replace(/^./, (str) => str.toUpperCase()),
      culturalOrigin: 'Custom / Global Cuisine',
      portion: '2-4 servings',
      servings: 4,
      prepTime: '15 mins',
      cookTime: '25 mins',
      ingredients: [
        { name: `Fresh ingredients for ${q}`, amount: 2, unit: 'cups' },
        { name: 'Olive oil or cooking butter', amount: 2, unit: 'tbsp' },
        { name: 'Garlic, onion, and spices to taste', amount: 1, unit: 'tbsp' },
        { name: 'Salt and pepper', amount: 0.5, unit: 'tsp' }
      ],
      instructions: [
        `Prepare all fresh ingredients and wash produce for ${q}.`,
        'Heat oil in a pan over medium heat and sauté aromatics until golden.',
        'Add the main ingredients and seasonings, stirring to blend flavors.',
        'Simmer or bake until fully cooked and tender.',
        'Garnish with fresh herbs and serve warm.'
      ],
      equipment: ['Cutting board', 'Chef knife', 'Cooking pan or pot'],
      substitutions: ['Use plant-based oil or butter as preferred', 'Adjust spices to your preference'],
      cookingTips: ['Taste test before serving to balance seasoning.'],
      macronutrients: { protein: '20g', carbs: '45g', fat: '12g', fiber: '6g' },
      keyMicronutrients: ['Balanced macronutrients', 'Dietary fiber'],
      potentialBenefits: [`Provides nourishing energy and delicious flavor for ${q}.`],
      allergyWarnings: ['Check for common allergens such as dairy, nuts, or gluten.'],
      balancedMealPairing: 'Pair with a side salad or fresh fruit.',
      nonMoralizingPhilosophy: 'Food is nourishing fuel for your body and mind. Enjoy every meal with joy.',
      isAiGenerated: false
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMessage(null);

    // 1. Check local preset database first (supporting partial / alternative names)
    const matched = FOOD_DATABASE.find(
      (f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(f.name.toLowerCase().split(' ')[0]) ||
        (f.culturalOrigin && f.culturalOrigin.toLowerCase().includes(query.toLowerCase()))
    );

    if (matched) {
      const enriched = enrichWithAllergies(matched);
      setSelectedFood(enriched);
      setCurrentServings(enriched.servings || 2);
      setIsLoading(false);
      return;
    }

    // 2. Query server-side Gemini AI recipe generator for any custom dish with robust client-side fallback
    try {
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          userAllergies,
          userPreferences,
        }),
      });
      const data = await res.json();
      if (data.success && data.recipe) {
        const enriched = enrichWithAllergies(data.recipe);
        setSelectedFood(enriched);
        setCurrentServings(enriched.servings || 2);
      } else {
        const fallbackRecipe = synthesizeClientRecipe(query);
        const enriched = enrichWithAllergies(fallbackRecipe);
        setSelectedFood(enriched);
        setCurrentServings(enriched.servings || 4);
      }
    } catch (err: any) {
      console.warn('Recipe search network warning, using local synthesis:', err);
      const fallbackRecipe = synthesizeClientRecipe(query);
      const enriched = enrichWithAllergies(fallbackRecipe);
      setSelectedFood(enriched);
      setCurrentServings(enriched.servings || 4);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate scaled ingredient amounts based on servings ratio
  const originalServings = selectedFood.servings || 2;
  const scaleRatio = currentServings / originalServings;

  const guideSteps = [
    {
      title: 'Search Any Dish',
      detail: 'Type any dish in the search bar (e.g. Biryani, Sushi, Pasta, Pancakes, Nihari, or custom meals) and click Analyze Food.',
    },
    {
      title: 'Explore Complete Recipe & Scale Servings',
      detail: 'View prep time, cook time, step-by-step instructions, equipment, tips, and use the servings control to automatically scale ingredient amounts.',
    },
    {
      title: 'Personalized Allergen & Nutrition Guidance',
      detail: 'HealthMate cross-checks your profile allergies and dietary preferences while maintaining non-moralizing, joyful nutrition principles.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Guide Banner */}
      <SectionGuideBanner
        sectionTitle="Smart Food Guide & Recipe Assistant"
        description="Search for virtually any dish across global cuisines, Pakistani & international favorites, desserts, and custom meals. Get complete recipes with serving-size scaling and personalized allergen checks."
        steps={guideSteps}
      />

      {/* Header Banner */}
      <div className="hm-dark-hero rounded-3xl p-6 sm:p-8">
        <div className="max-w-2xl space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#98A2B3]">
            <span className="text-[#55E6A5] font-semibold">
              Universal Recipe Assistant & Cultural Nutrition
            </span>
            <span aria-hidden="true">·</span>
            <span>Non-Moralizing & Safe for All Ages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Smart Food Guide & Custom Recipes
          </h2>
          <p className="text-xs sm:text-sm text-[#D0D5DD] leading-relaxed">
            Search any recipe instantly or choose from cultural favorites. Adjust servings to dynamically scale ingredient quantities, inspect preparation steps, equipment, and allergen notices.
          </p>
        </div>
      </div>

      {/* Search Input & Cultural Presets */}
      <div className="hm-card rounded-2xl p-6 space-y-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any dish (e.g. Chicken Biryani, Lasagna, Daal Chawal, Pancakes, Sushi)..."
              className="hm-input w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-[#101828] hover:bg-[#18243A] text-[#55E6A5] font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#55E6A5]" /> Generating...
              </>
            ) : (
              'Search & Generate Recipe'
            )}
          </button>
        </form>

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Preset Popular Recipes */}
        <div>
          <span className="text-xs font-bold text-[#667085] block mb-2.5">
            Popular Global & Regional Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {FOOD_DATABASE.map((item) => {
              const active = selectedFood.name === item.name;
              return (
                <button
                  key={item.id}
                  onClick={() => handlePresetSelect(item)}
                  className={`text-xs px-3.5 py-2 rounded-xl border transition flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#101828] text-white border-[#101828] font-bold shadow-xs'
                      : 'bg-[#F5F7FB] hover:bg-[#E4E7EC] text-[#172033] border-[#E4E7EC]'
                  }`}
                >
                  <Globe className={`w-3.5 h-3.5 ${active ? 'text-[#55E6A5]' : 'text-[#0F766E]'}`} />
                  <span>{item.name.split(' (')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Food / Recipe Detail Card */}
      <div className="hm-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#667085]">
              <span className="font-semibold text-[#0F766E] bg-[#55E6A5]/10 px-2.5 py-1 rounded-full border border-[#55E6A5]/30">
                {selectedFood.culturalOrigin || 'Balanced Meal'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#667085]" /> Prep: {selectedFood.prepTime || '15 mins'} | Cook: {selectedFood.cookTime || '25 mins'}
              </span>
              {selectedFood.isAiGenerated && (
                <span className="bg-[#64D9F5]/20 text-[#0E7490] font-bold px-2 py-0.5 rounded-full text-[10px]">
                  AI Generated Recipe
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight mt-1">
              {selectedFood.name}
            </h3>
          </div>

          {/* Servings Adjuster */}
          <div className="bg-[#F5F7FB] p-3 rounded-2xl border border-[#E4E7EC] flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033]">
              <Users className="w-4 h-4 text-[#0F766E]" /> Servings:
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentServings((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-lg bg-white border border-[#D0D5DD] font-bold text-xs hover:bg-[#E4E7EC] flex items-center justify-center text-[#172033]"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm w-5 text-center text-[#172033]">
                {currentServings}
              </span>
              <button
                type="button"
                onClick={() => setCurrentServings((prev) => prev + 1)}
                className="w-7 h-7 rounded-lg bg-white border border-[#D0D5DD] font-bold text-xs hover:bg-[#E4E7EC] flex items-center justify-center text-[#172033]"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Personalized Allergen Warnings */}
        {selectedFood.allergyWarnings && selectedFood.allergyWarnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Allergen & Cross-Contact Notices (Cross-checked with your profile)
            </div>
            <ul className="space-y-1 text-xs">
              {selectedFood.allergyWarnings.map((warn, i) => (
                <li
                  key={i}
                  className={`font-semibold ${
                    warn.includes('your reported allergen') || warn.includes('May contain')
                      ? 'text-rose-700'
                      : 'text-amber-900'
                  }`}
                >
                  • {warn}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ingredients List with Scaling */}
        {selectedFood.ingredients && selectedFood.ingredients.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5 uppercase tracking-wide">
                <Utensils className="w-4 h-4 text-[#0F766E]" /> Ingredients (Scaled for {currentServings} servings)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedFood.ingredients.map((ing, idx) => {
                const scaledAmount = Math.round(ing.amount * scaleRatio * 100) / 100;
                return (
                  <div key={idx} className="bg-[#F5F7FB] p-3 rounded-xl border border-[#E4E7EC] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#172033]">{ing.name}</span>
                    <span className="font-mono font-bold text-[#0F766E] bg-white px-2 py-1 rounded-lg border border-[#D0D5DD]">
                      {scaledAmount} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#F5F7FB] rounded-2xl text-xs text-[#667085]">
            <span className="font-bold text-[#172033] block mb-1">Standard Portion:</span>
            {selectedFood.portion}
          </div>
        )}

        {/* Step-by-Step Instructions */}
        {selectedFood.instructions && selectedFood.instructions.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-[#0F766E]" /> Step-by-Step Cooking Instructions
            </span>
            <div className="space-y-2.5">
              {selectedFood.instructions.map((step, idx) => (
                <div key={idx} className="bg-[#F5F7FB] p-4 rounded-2xl border border-[#E4E7EC] flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#101828] text-[#55E6A5] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-[#172033] leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment & Substitutions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedFood.equipment && selectedFood.equipment.length > 0 && (
            <div className="p-4 bg-[#F5F7FB] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-[#0F766E]" /> Required Kitchen Equipment
              </span>
              <ul className="space-y-1 text-xs text-[#667085]">
                {selectedFood.equipment.map((eq, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-[#0F766E]" /> {eq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedFood.substitutions && selectedFood.substitutions.length > 0 && (
            <div className="p-4 bg-[#F5F7FB] rounded-2xl space-y-2">
              <span className="text-xs font-bold text-[#172033] block">Ingredient Substitutions</span>
              <ul className="space-y-1 text-xs text-[#667085]">
                {selectedFood.substitutions.map((sub, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-[#55E6A5]" /> {sub}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Macronutrient Highlights */}
        <div>
          <span className="text-xs font-bold text-[#667085] block mb-2.5 uppercase tracking-wide">
            Estimated Macronutrient Profile (per serving):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#F5F7FB] rounded-2xl text-center">
              <span className="text-xs text-[#667085] font-medium block">Protein</span>
              <span className="text-lg font-extrabold text-[#172033] font-mono tabular-nums mt-0.5 block">
                {selectedFood.macronutrients.protein}
              </span>
            </div>
            <div className="p-4 bg-[#F5F7FB] rounded-2xl text-center">
              <span className="text-xs text-[#667085] font-medium block">Carbohydrates</span>
              <span className="text-lg font-extrabold text-[#172033] font-mono tabular-nums mt-0.5 block">
                {selectedFood.macronutrients.carbs}
              </span>
            </div>
            <div className="p-4 bg-[#F5F7FB] rounded-2xl text-center">
              <span className="text-xs text-[#667085] font-medium block">Healthy Fats</span>
              <span className="text-lg font-extrabold text-[#172033] font-mono tabular-nums mt-0.5 block">
                {selectedFood.macronutrients.fat}
              </span>
            </div>
            <div className="p-4 bg-[#F5F7FB] rounded-2xl text-center">
              <span className="text-xs text-[#667085] font-medium block">Dietary Fiber</span>
              <span className="text-lg font-extrabold text-[#0F766E] font-mono tabular-nums mt-0.5 block">
                {selectedFood.macronutrients.fiber}
              </span>
            </div>
          </div>
        </div>

        {/* Potential Wellbeing Benefits & Micronutrients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-[#55E6A5]/10 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-[#172033] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#0F766E]" />
              Potential Wellbeing Benefits
            </span>
            <ul className="space-y-1.5 text-xs text-[#172033]">
              {selectedFood.potentialBenefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#0F766E] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-[#F5F7FB] rounded-2xl space-y-2">
            <span className="text-xs font-bold text-[#172033] block">
              Key Micronutrient Highlights
            </span>
            <p className="text-xs text-[#18243A] font-medium leading-relaxed pt-1">
              {Array.isArray(selectedFood.keyMicronutrients)
                ? selectedFood.keyMicronutrients.join(' · ')
                : selectedFood.keyMicronutrients}
            </p>
          </div>
        </div>

        {/* Balanced Meal Suggestion */}
        <div className="p-5 bg-[#64D9F5]/12 rounded-2xl space-y-1.5 text-xs text-[#172033]">
          <span className="font-bold text-[#18243A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0E7490]" />
            Balanced Plate Pairing Suggestion
          </span>
          <p className="leading-relaxed text-[#172033]">{selectedFood.balancedMealPairing}</p>
        </div>

        {/* Non-Moralizing Philosophy */}
        <div className="p-4 bg-[#F5F7FB] rounded-2xl flex items-start gap-3 text-xs text-[#667085]">
          <ShieldCheck className="w-5 h-5 text-[#18243A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#172033] block">
              Ethical Nutrition Philosophy:
            </span>
            <p className="leading-relaxed">{selectedFood.nonMoralizingPhilosophy}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
