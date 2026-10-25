/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API endpoint for optional AI-enhanced personalized health & food guidance
app.post('/api/health-ai-advice', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        available: false,
        message: 'No GEMINI_API_KEY configured; utilizing local deterministic rules engine.',
      });
    }

    const { type, promptContext } = req.body;
    const ai = new GoogleGenAI();

    const systemInstruction = `You are HealthMate AI's responsible wellbeing assistant for a school hackathon demonstration.
CRITICAL SAFETY & RESPONSIBLE AI RULES:
1. NEVER diagnose diseases, prescribe cures, or offer clinical diagnostic interpretations.
2. For minors/teenagers, promote joyful movement, adequate sleep, and nutritious fuel. NEVER suggest calorie restriction, fasting, or unverified supplements.
3. If any symptom sounds urgent (chest pain, shortness of breath, sudden numbness, anaphylaxis), advise immediate emergency care (911/112).
4. Do not label foods as "good" or "bad". Encourage balanced, culturally diverse plates.
5. Provide concise, friendly, realistic advice with actionable steps.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Request type: ${type}\nContext: ${JSON.stringify(promptContext)}\nProvide a helpful, structured wellbeing response adhering strictly to responsible AI guidelines.` }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    const aiText = response.text;
    return res.json({
      available: true,
      text: aiText,
    });
  } catch (error: any) {
    console.warn('Gemini API call failed or timed out:', error?.message);
    return res.json({
      available: false,
      error: error?.message || 'AI service unavailable',
    });
  }
});

// Dedicated endpoint for Student Wellbeing Zone Coach & HealthMate AI custom opinions
app.post('/api/student-wellbeing-ai', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        available: false,
        source: 'rules_engine',
        message: 'Live Gemini API key is not configured; using transparent HealthMate rules-based student guidance.',
      });
    }

    const { mode, studentQuery, context } = req.body || {};
    if (!studentQuery || typeof studentQuery !== 'string') {
      return res.status(400).json({
        available: false,
        source: 'rules_engine',
        message: 'Please enter a question or situation first.',
      });
    }

    const ai = new GoogleGenAI();
    const systemInstruction = `You are HealthMate AI, a warm, calm, age-appropriate Student Wellbeing Coach supporting middle and high school students.
STRICT STUDENT SAFETY & WELLBEING RULES:
1. NEVER diagnose medical or mental health conditions, prescribe supplements or medications, or claim any food cures fatigue, anxiety, or headaches.
2. NEVER recommend skipping meals, weight-loss diets, calorie counting, caffeine/coffee/energy drinks for tiredness, excessive exercise when exhausted, or studying all night (all-nighters).
3. ALWAYS respect stated dietary preferences and food allergies strictly. Suggest affordable, familiar everyday foods (e.g., fruit, eggs, milk, yogurt, oats, roti, chana, daal, rice, homemade snacks) alongside student-provided ingredients.
4. Keep hydration advice balanced (drink according to thirst; adjust gently for warm weather or sports; no extreme water targets).
5. If the student mentions ongoing headaches, dizziness, constant exhaustion, panic, or heavy distress, gently encourage speaking with a parent/guardian, school counselor, or qualified healthcare professional.
6. If the student expresses self-harm, feeling unsafe, chest pain, trouble breathing, or immediate danger, prioritize immediate emergency services (911/112/999) and a trusted adult right away.
7. Be supportive, non-judgmental, and practical: acknowledge their feeling, give 3 bite-sized realistic steps, and include 1 short follow-up question.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Mode: ${mode || 'coach_chat'}\nStudent message: ${studentQuery}\nStudent context: ${JSON.stringify(context || {})}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.45,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            acknowledgementAndAdvice: {
              type: Type.STRING,
              description: 'Warm, empathetic 2-3 sentence acknowledgement and clear explanation tailored to the student.',
            },
            followUpQuestion: {
              type: Type.STRING,
              description: 'One short, caring follow-up question to understand the student better.',
            },
            actionSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 small, realistic, safe action steps the student can try right now.',
            },
          },
          required: ['acknowledgementAndAdvice', 'followUpQuestion', 'actionSteps'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      available: true,
      source: 'healthmate_ai',
      text: parsed.acknowledgementAndAdvice || 'Let us take this one calm, manageable step at a time.',
      followUpQuestion: parsed.followUpQuestion || 'How does your energy feel for trying one small step right now?',
      actionSteps: Array.isArray(parsed.actionSteps) ? parsed.actionSteps.slice(0, 4) : [],
    });
  } catch (error: any) {
    console.warn('Student Wellbeing Gemini API error:', error?.message);
    return res.json({
      available: false,
      source: 'rules_engine',
      message: 'Live HealthMate AI service could not be reached right now; showing safe rules-based guidance instead.',
    });
  }
});

// Recipe generator endpoint supporting any custom dish with ingredients, scaling, instructions, and allergen screening
app.post('/api/generate-recipe', async (req, res) => {
  try {
    const { query, userAllergies = [], userPreferences = [] } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid dish name.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.json({
        success: true,
        source: 'rules_engine',
        recipe: {
          id: `fallback-${Date.now()}`,
          name: query.trim(),
          culturalOrigin: 'Custom / Global Cuisine',
          portion: '2 servings',
          servings: 2,
          prepTime: '15 mins',
          cookTime: '25 mins',
          ingredients: [
            { name: 'Fresh main ingredients', amount: 2, unit: 'cups' },
            { name: 'Olive oil or cooking oil', amount: 1, unit: 'tbsp' },
            { name: 'Garlic, ginger, and balanced spices', amount: 1, unit: 'tsp' },
            { name: 'Salt and pepper to taste', amount: 0.5, unit: 'tsp' }
          ],
          instructions: [
            'Prepare and chop all ingredients cleanly.',
            'Heat oil in a pan over medium heat and sauté aromatics.',
            'Add main ingredients, seasoning to taste.',
            'Cook until tender and serve warm.'
          ],
          equipment: ['Cutting board', 'Chef knife', 'Sauté pan or pot'],
          substitutions: ['Use plant oil or butter as preferred', 'Adjust spices to taste'],
          cookingTips: ['Taste test before serving to balance seasoning.'],
          macronutrients: { protein: '18g', carbs: '45g', fat: '12g', fiber: '6g' },
          keyMicronutrients: ['Essential nutrients', 'Dietary fiber'],
          potentialBenefits: ['Provides sustained energy and wholesome nutrition.'],
          allergyWarnings: ['Check for common allergens like dairy, nuts, or gluten.'],
          balancedMealPairing: 'Pair with a side salad or fresh fruit.',
          nonMoralizingPhilosophy: 'Food is nourishing fuel for your body and mind.',
          isAiGenerated: false
        }
      });
    }

    const ai = new GoogleGenAI();
    const systemInstruction = `You are an expert culinary chef and nutrition guide. Provide a complete, detailed recipe for the requested dish name ("${query}").
User food allergies: ${userAllergies.join(', ') || 'None'}.
User preferences: ${userPreferences.join(', ') || 'None'}.
REQUIREMENTS:
1. Provide accurate ingredients with realistic numeric amounts (e.g. amount: 2, unit: 'cups' or 'tbsp') so quantities can be dynamically scaled by servings.
2. Provide prep time, cook time, servings, step-by-step cooking instructions, kitchen equipment, ingredient substitutions, cooking tips, allergen info, approximate macronutrients, potential wellbeing benefits, balanced meal pairing, and a non-moralizing ethical philosophy.
3. Support any dish (Pakistani, Indian, international, dessert, drink, snack, custom).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: `Generate a complete recipe for: ${query}` }] }],
      config: {
        systemInstruction,
        temperature: 0.45,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            culturalOrigin: { type: Type.STRING },
            portion: { type: Type.STRING },
            servings: { type: Type.NUMBER },
            prepTime: { type: Type.STRING },
            cookTime: { type: Type.STRING },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  unit: { type: Type.STRING }
                },
                required: ['name', 'amount', 'unit']
              }
            },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
            substitutions: { type: Type.ARRAY, items: { type: Type.STRING } },
            cookingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            macronutrients: {
              type: Type.OBJECT,
              properties: {
                protein: { type: Type.STRING },
                carbs: { type: Type.STRING },
                fat: { type: Type.STRING },
                fiber: { type: Type.STRING }
              },
              required: ['protein', 'carbs', 'fat', 'fiber']
            },
            keyMicronutrients: { type: Type.ARRAY, items: { type: Type.STRING } },
            potentialBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
            allergyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            balancedMealPairing: { type: Type.STRING },
            nonMoralizingPhilosophy: { type: Type.STRING }
          },
          required: [
            'name',
            'culturalOrigin',
            'portion',
            'servings',
            'prepTime',
            'cookTime',
            'ingredients',
            'instructions',
            'equipment',
            'substitutions',
            'cookingTips',
            'macronutrients',
            'keyMicronutrients',
            'potentialBenefits',
            'allergyWarnings',
            'balancedMealPairing',
            'nonMoralizingPhilosophy'
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      source: 'gemini_ai',
      recipe: {
        id: `ai-${Date.now()}`,
        ...parsed,
        isAiGenerated: true
      }
    });
  } catch (error: any) {
    console.warn('Recipe generation failed:', error?.message);
    return res.json({
      success: false,
      error: error?.message || 'Failed to generate recipe'
    });
  }
});

// Dev vs Prod Vite mounting
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthMate AI running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
