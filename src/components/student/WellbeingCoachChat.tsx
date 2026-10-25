/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, AlertTriangle, RefreshCw, MessageSquareHeart } from 'lucide-react';
import { CoachMessage, StudentDailyCheckIn } from '../../types/studentWellbeing';
import {
  evaluateStudentSafety,
  generateFallbackCoachResponse,
} from '../../utils/studentWellbeingLogic';

interface WellbeingCoachChatProps {
  recentCheckIn: StudentDailyCheckIn;
}

const EXAMPLE_STUDENT_PROMPTS = [
  'I came home from school and feel too tired to study.',
  'I have a maths test tomorrow and cannot concentrate.',
  'I have not eaten since morning and feel weak.',
  'I feel stressed because I have too much homework.',
  'How can I sleep on time during exams?',
];

export const WellbeingCoachChat: React.FC<WellbeingCoachChatProps> = ({
  recentCheckIn,
}) => {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'coach-welcome',
      role: 'coach',
      source: 'rules_engine',
      timestamp: 'Today',
      safetyLevel: 'supportive',
      text: 'Hi! I am your HealthMate Student Wellbeing Coach. Whether you came home exhausted, feel stuck on homework, or need help winding down before an exam, tell me what is on your mind—we will figure out one small, realistic step together.',
      followUpQuestion:
        'How is your afternoon feeling right now, or you can tap one of the common situations below?',
      actionSteps: [],
      easiestFirstPrompt: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [inputError, setInputError] = useState('');
  const [apiStatusNote, setApiStatusNote] = useState<string>('');

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed) {
      setInputError('Please type a message or choose one of the prompt buttons.');
      return;
    }
    setInputError('');
    setInputText('');

    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const studentMsg: CoachMessage = {
      id: `msg-st-${Date.now()}`,
      role: 'student',
      text: trimmed,
      timestamp: nowTime,
    };

    setMessages((prev) => [...prev, studentMsg]);

    // Immediate local safety check first
    const safety = evaluateStudentSafety(
      trimmed,
      recentCheckIn.botheringOptions,
      recentCheckIn.stressLevel,
      recentCheckIn.tirednessLevel
    );

    if (safety.level === 'emergency') {
      const urgentMsg: CoachMessage = {
        id: `msg-coach-${Date.now() + 1}`,
        role: 'coach',
        source: 'rules_engine',
        timestamp: nowTime,
        safetyLevel: 'emergency',
        text: `${safety.headline}: ${safety.message}`,
        actionSteps: safety.actionItems,
        easiestFirstPrompt: false,
      };
      setMessages((prev) => [...prev, urgentMsg]);
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/student-wellbeing-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'coach_chat',
          studentQuery: trimmed,
          context: {
            returnHomeTime: recentCheckIn.returnHomeTime,
            tirednessLevel: recentCheckIn.tirednessLevel,
            stressLevel: recentCheckIn.stressLevel,
            sleepHoursLastNight: recentCheckIn.sleepHoursLastNight,
            eatenSinceSchool: recentCheckIn.eatenSinceSchool,
            waterSinceSchool: recentCheckIn.waterSinceSchool,
            dietaryPreference: recentCheckIn.dietaryPreference,
            allergies: recentCheckIn.allergies,
          },
        }),
      });

      const data = await response.json();
      if (data && data.available && data.source === 'healthmate_ai') {
        setApiStatusNote('Connected to live HealthMate AI (Gemini)');
        const coachReply: CoachMessage = {
          id: `msg-coach-${Date.now() + 1}`,
          role: 'coach',
          source: 'healthmate_ai',
          timestamp: nowTime,
          safetyLevel: safety.level,
          text: data.text,
          followUpQuestion: data.followUpQuestion,
          actionSteps: Array.isArray(data.actionSteps) ? data.actionSteps : [],
          easiestFirstPrompt: true,
        };
        setMessages((prev) => [...prev, coachReply]);
      } else {
        setApiStatusNote(
          data?.message ||
            'Live Gemini API unavailable — using transparent HealthMate Rules Guide fallback.'
        );
        const fallback = generateFallbackCoachResponse(trimmed, recentCheckIn);
        const coachReply: CoachMessage = {
          id: `msg-coach-${Date.now() + 1}`,
          timestamp: nowTime,
          ...fallback,
        };
        setMessages((prev) => [...prev, coachReply]);
      }
    } catch {
      setApiStatusNote(
        'Live Gemini API could not be reached — using transparent HealthMate Rules Guide fallback.'
      );
      const fallback = generateFallbackCoachResponse(trimmed, recentCheckIn);
      const coachReply: CoachMessage = {
        id: `msg-coach-${Date.now() + 1}`,
        timestamp: nowTime,
        ...fallback,
      };
      setMessages((prev) => [...prev, coachReply]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectFirstStep = (messageId: string, stepText: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, selectedFirstStep: stepText } : m
      )
    );
  };

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="wellbeing-coach-heading"
        className="hm-card rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-[#667085]">
              06. Talk to Your Wellbeing Coach · HealthMate AI Student Support
            </div>
            <h3
              id="wellbeing-coach-heading"
              className="text-2xl font-bold text-[#172033] mt-1"
            >
              Calm, Practical Guidance for School & Evening Balance
            </h3>
            <p className="text-sm text-[#667085] mt-1 max-w-2xl">
              Ask about after-school tiredness, study focus, food, or bedtime routines. HealthMate AI supports everyday habits and never diagnoses medical conditions.
            </p>
          </div>
          {apiStatusNote && (
            <div className="text-xs text-[#667085] max-w-xs sm:text-right">
              {apiStatusNote}
            </div>
          )}
        </div>

        {/* Quick Starter Prompts */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-[#172033]">
            Try asking a common student question:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_STUDENT_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isSending}
                onClick={() => sendMessage(prompt)}
                className="text-left text-xs bg-[#F5F7FB] hover:bg-[#18243A] hover:text-white text-[#172033] border border-[#E4E7EC] hover:border-[#18243A] rounded-xl px-3.5 py-2 transition disabled:opacity-50"
              >
                “{prompt}”
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Thread */}
        <div
          aria-live="polite"
          className="bg-[#F5F7FB] rounded-2xl p-4 sm:p-6 space-y-5 max-h-[540px] overflow-y-auto border border-[#E4E7EC]"
        >
          {messages.map((msg) => {
            if (msg.role === 'student') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-[#101828] text-white rounded-2xl px-4 py-3 max-w-xl text-sm leading-relaxed border border-[#18243A] shadow-xs">
                    <p>{msg.text}</p>
                    <div className="text-[11px] text-[#64D9F5]/80 mt-1 text-right font-mono tabular-nums">
                      You · {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            }

            const isEmergency = msg.safetyLevel === 'emergency';
            const isOngoing = msg.safetyLevel === 'ongoing_concern';

            return (
              <div key={msg.id} className="flex justify-start">
                <div
                  className={`rounded-2xl p-5 max-w-2xl w-full space-y-3 border ${
                    isEmergency
                      ? 'bg-rose-50 border-rose-300 text-rose-950'
                      : isOngoing
                      ? 'bg-amber-50/90 border-amber-300 text-[#172033]'
                      : 'bg-white border-[#E4E7EC] text-[#172033] shadow-2xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#667085]">
                    <span className="font-semibold text-[#0F766E] inline-flex items-center gap-1.5">
                      <MessageSquareHeart className="w-3.5 h-3.5 text-[#0F766E]" />
                      {msg.source === 'healthmate_ai'
                        ? 'HealthMate AI Coach'
                        : 'HealthMate Coach (Rules-Based Guide)'}
                    </span>
                    <span className="font-mono tabular-nums">{msg.timestamp}</span>
                  </div>

                  {isEmergency && (
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Immediate Safety & Emergency Care First
                    </div>
                  )}

                  <p className="text-sm leading-relaxed">{msg.text}</p>

                  {msg.followUpQuestion && (
                    <p className="text-sm font-medium text-[#172033] bg-[#64D9F5]/12 border border-[#64D9F5]/30 rounded-xl px-3.5 py-2.5">
                      {msg.followUpQuestion}
                    </p>
                  )}

                  {msg.actionSteps && msg.actionSteps.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-semibold text-[#172033]">
                        {msg.easiestFirstPrompt
                          ? 'Mini Action Plan — Which suggestion would be easiest to try first?'
                          : 'Important Immediate Steps:'}
                      </div>
                      <div className="space-y-1.5">
                        {msg.actionSteps.map((step, idx) => {
                          const chosen = msg.selectedFirstStep === step;
                          return msg.easiestFirstPrompt ? (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectFirstStep(msg.id, step)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm border transition flex items-start gap-2.5 ${
                                chosen
                                  ? 'bg-[#18243A] text-white border-[#18243A] font-medium'
                                  : 'bg-[#F5F7FB] text-[#172033] border-[#E4E7EC] hover:border-slate-400'
                              }`}
                            >
                              <span
                                className={`font-mono text-xs mt-0.5 tabular-nums ${
                                  chosen ? 'text-[#55E6A5]' : 'text-[#0F766E]'
                                }`}
                              >
                                0{idx + 1}.
                              </span>
                              <span>{step}</span>
                            </button>
                          ) : (
                            <div
                              key={idx}
                              className="px-3.5 py-2.5 rounded-xl text-sm bg-white/80 border border-rose-200"
                            >
                              {idx + 1}. {step}
                            </div>
                          );
                        })}
                      </div>

                      {msg.selectedFirstStep && (
                        <p className="text-xs text-[#0F766E] font-medium pt-1">
                          Awesome—starting with “{msg.selectedFirstStep}” is a calm, realistic first move. Let me know how it goes!
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-[#667085] px-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0F766E]" />
              HealthMate Coach is preparing a thoughtful response...
            </div>
          )}
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          className="space-y-2"
        >
          <label htmlFor="coach-chat-input" className="sr-only">
            Message your Student Wellbeing Coach
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="coach-chat-input"
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (inputError) setInputError('');
              }}
              placeholder="Tell your coach how school went, what homework you have, or how you are feeling..."
              className="flex-1 hm-input rounded-xl px-4 py-3 text-sm"
            />
            <button
              type="submit"
              disabled={isSending}
              className="bg-[#101828] hover:bg-[#18243A] disabled:opacity-50 text-[#55E6A5] font-bold text-sm px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 transition shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </div>
          {inputError && (
            <p role="alert" className="text-xs text-rose-700 font-medium">
              {inputError}
            </p>
          )}
          <p className="text-xs text-[#667085]">
            For recurring headaches, extreme tiredness, dizziness, or heavy anxiety, always talk with a parent, guardian, school counselor, or healthcare professional.
          </p>
        </form>
      </section>
    </div>
  );
};
