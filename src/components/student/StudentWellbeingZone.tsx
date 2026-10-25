/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  HeartHandshake,
  CalendarClock,
  BookOpenCheck,
  Utensils,
  MessageSquareHeart,
  BarChart3,
} from 'lucide-react';
import {
  ScheduleSlot,
  SmallWinChallenge,
  StudentDailyActivityLog,
  StudentDailyCheckIn,
} from '../../types/studentWellbeing';
import {
  DEMO_SMALL_WINS,
  DEMO_STUDENT_CHECKIN,
  DEMO_STUDENT_SCHEDULE,
  DEMO_STUDENT_WEEKLY_LOGS,
  FICTIONAL_STUDENT_DEMO_NAME,
} from '../../data/studentDemoData';
import {
  DEFAULT_SMALL_WINS_POOL,
  generateAfterSchoolSchedule,
} from '../../utils/studentWellbeingLogic';
import {
  deleteAllStudentRecords,
  getSavedSmallWins,
  getSavedStudentActivityLogs,
  getSavedStudentCheckIns,
  getSavedStudentSchedule,
  getStudentSaveConsent,
  isLocalStorageAvailable,
  saveSmallWins,
  saveStudentActivityLogs,
  saveStudentCheckIns,
  saveStudentSchedule,
  setStudentSaveConsent,
} from '../../utils/studentStorage';
import { StudentCheckInAndRecovery } from './StudentCheckInAndRecovery';
import { AfterSchoolRoutineBuilder } from './AfterSchoolRoutineBuilder';
import { ExamHomeworkRescue } from './ExamHomeworkRescue';
import { FuelYourSchoolDay } from './FuelYourSchoolDay';
import { WellbeingCoachChat } from './WellbeingCoachChat';
import { StudentScorecardAndWins } from './StudentScorecardAndWins';
import { SectionGuideBanner } from '../SectionGuideBanner';

const EMPTY_PERSONAL_CHECKIN: StudentDailyCheckIn = {
  id: 'personal-default-ci',
  timestamp: new Date().toISOString(),
  dateLabel: 'Today',
  returnHomeTime: '15:00',
  tirednessLevel: 6,
  stressLevel: 6,
  eatenSinceSchool: 'no',
  waterSinceSchool: 'a_little',
  sleepHoursLastNight: 7.5,
  academicWorkload: 'homework',
  freeTimeMinutes: 90,
  botheringOptions: ['I feel exhausted.'],
  ownWordsSituation: '',
  dietaryPreference: 'vegetarian',
  allergies: [],
  hotWeatherOrSport: false,
  subjectToWorkOn: 'Mathematics',
  isDemo: false,
};

export const StudentWellbeingZone: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<string>('checkin');
  const [storageAvailable] = useState<boolean>(() => isLocalStorageAvailable());
  const [saveConsent, setSaveConsentState] = useState<boolean>(() =>
    getStudentSaveConsent()
  );

  // Personal student state
  const [personalCheckIns, setPersonalCheckIns] = useState<StudentDailyCheckIn[]>(
    () => getSavedStudentCheckIns()
  );
  const [personalLogs, setPersonalLogs] = useState<StudentDailyActivityLog[]>(
    () => getSavedStudentActivityLogs()
  );
  const [personalWins, setPersonalWins] = useState<SmallWinChallenge[]>(() =>
    getSavedSmallWins()
  );
  const [personalSchedule, setPersonalSchedule] = useState<ScheduleSlot[]>(() => {
    const saved = getSavedStudentSchedule();
    if (saved.length > 0) return saved;
    return generateAfterSchoolSchedule({
      schoolFinishTime: '14:30',
      arrivalHomeTime: '15:00',
      homeworkWorkload: 'moderate',
      upcomingTestInfo: '',
      tuitionOrExtracurricular: '',
      preferredRestMinutes: 20,
      dinnerTime: '20:00',
      bedtime: '22:00',
      availableStudyHours: 1.5,
      isExhausted: false,
    });
  });

  // Demo mode state (default true if student hasn't saved personal check-ins yet so judges/visitors immediately see full capability, clearly labelled fictional!)
  const [isStudentDemoMode, setIsStudentDemoMode] = useState<boolean>(
    () => getSavedStudentCheckIns().length === 0
  );
  const [demoCheckIn, setDemoCheckIn] = useState<StudentDailyCheckIn>(
    DEMO_STUDENT_CHECKIN
  );
  const [demoLogs, setDemoLogs] = useState<StudentDailyActivityLog[]>(
    DEMO_STUDENT_WEEKLY_LOGS
  );
  const [demoWins, setDemoWins] = useState<SmallWinChallenge[]>(DEMO_SMALL_WINS);
  const [demoSchedule, setDemoSchedule] = useState<ScheduleSlot[]>(
    DEMO_STUDENT_SCHEDULE
  );

  // Persist personal data whenever consent is granted
  useEffect(() => {
    if (saveConsent && storageAvailable) {
      saveStudentCheckIns(personalCheckIns, true);
      saveStudentActivityLogs(personalLogs, true);
      saveSmallWins(personalWins, true);
      saveStudentSchedule(personalSchedule, true);
    }
  }, [
    saveConsent,
    storageAvailable,
    personalCheckIns,
    personalLogs,
    personalWins,
    personalSchedule,
  ]);

  const activeCheckIn = isStudentDemoMode
    ? demoCheckIn
    : personalCheckIns[0] || EMPTY_PERSONAL_CHECKIN;
  const activeLogs = isStudentDemoMode ? demoLogs : personalLogs;
  const activeWins = isStudentDemoMode ? demoWins : personalWins;
  const activeSchedule = isStudentDemoMode ? demoSchedule : personalSchedule;

  const upsertTodayActivityLog = useCallback(
    (
      updater: (existing: StudentDailyActivityLog) => StudentDailyActivityLog,
      targetDemo: boolean
    ) => {
      const todayISO = new Date().toISOString().slice(0, 10);
      const todayLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const applyToList = (list: StudentDailyActivityLog[]) => {
        const lastIdx = list.findIndex((item) => item.dateISO === todayISO);
        if (lastIdx >= 0) {
          return list.map((item, idx) => (idx === lastIdx ? updater(item) : item));
        }
        const fresh: StudentDailyActivityLog = updater({
          id: `st-log-${Date.now()}`,
          dateISO: todayISO,
          dateLabel: todayLabel,
          weekKey: 'Current Week',
          energyLevel: Math.max(1, 11 - activeCheckIn.tirednessLevel),
          stressLevel: activeCheckIn.stressLevel,
          sleepHours: activeCheckIn.sleepHoursLastNight,
          studySessionsCompleted: 0,
          breaksTaken: 0,
          checkInCompleted: false,
          goalsCompleted: 0,
          isDemo: targetDemo,
        });
        return [...list, fresh];
      };

      if (targetDemo) {
        setDemoLogs((prev) => applyToList(prev));
      } else {
        setPersonalLogs((prev) => applyToList(prev));
      }
    },
    [activeCheckIn]
  );

  const handleSaveCheckIn = (updated: StudentDailyCheckIn) => {
    if (isStudentDemoMode) {
      setDemoCheckIn({ ...updated, isDemo: true });
      upsertTodayActivityLog(
        (log) => ({
          ...log,
          energyLevel: Math.max(1, 11 - updated.tirednessLevel),
          stressLevel: updated.stressLevel,
          sleepHours: updated.sleepHoursLastNight,
          checkInCompleted: true,
        }),
        true
      );
    } else {
      setPersonalCheckIns((prev) => [updated, ...prev]);
      upsertTodayActivityLog(
        (log) => ({
          ...log,
          energyLevel: Math.max(1, 11 - updated.tirednessLevel),
          stressLevel: updated.stressLevel,
          sleepHours: updated.sleepHoursLastNight,
          checkInCompleted: true,
        }),
        false
      );
    }
  };

  const handleLogStudySession = useCallback(() => {
    upsertTodayActivityLog(
      (log) => ({
        ...log,
        studySessionsCompleted: log.studySessionsCompleted + 1,
      }),
      isStudentDemoMode
    );
  }, [isStudentDemoMode, upsertTodayActivityLog]);

  const handleLogBreakTaken = useCallback(() => {
    upsertTodayActivityLog(
      (log) => ({
        ...log,
        breaksTaken: log.breaksTaken + 1,
      }),
      isStudentDemoMode
    );
  }, [isStudentDemoMode, upsertTodayActivityLog]);

  const handleUpdateSchedule = (slots: ScheduleSlot[]) => {
    if (isStudentDemoMode) {
      setDemoSchedule(slots);
    } else {
      setPersonalSchedule(slots);
    }
  };

  const handleToggleSelectWin = (winId: string) => {
    const mapper = (list: SmallWinChallenge[]) =>
      list.map((w) => (w.id === winId ? { ...w, selected: !w.selected } : w));
    if (isStudentDemoMode) {
      setDemoWins(mapper);
    } else {
      setPersonalWins(mapper);
    }
  };

  const handleToggleCompleteWin = (winId: string) => {
    let becameComplete = false;
    const mapper = (list: SmallWinChallenge[]) =>
      list.map((w) => {
        if (w.id === winId) {
          becameComplete = !w.completed;
          return { ...w, completed: !w.completed };
        }
        return w;
      });

    if (isStudentDemoMode) {
      setDemoWins(mapper);
    } else {
      setPersonalWins(mapper);
    }

    upsertTodayActivityLog(
      (log) => ({
        ...log,
        goalsCompleted: Math.max(0, log.goalsCompleted + (becameComplete ? 1 : -1)),
      }),
      isStudentDemoMode
    );
  };

  const handleAddCustomWin = (title: string) => {
    const createList = (list: SmallWinChallenge[]) => {
      const selectedCount = list.filter((w) => w.selected).length;
      const newWin: SmallWinChallenge = {
        id: `sw-custom-${Date.now()}`,
        title,
        category: 'study',
        whyItMatters: 'Personal goal chosen by you for today.',
        selected: selectedCount < 3,
        completed: false,
      };
      return [...list, newWin];
    };
    if (isStudentDemoMode) {
      setDemoWins(createList);
    } else {
      setPersonalWins(createList);
    }
  };

  const handleChangeConsent = (consent: boolean) => {
    setSaveConsentState(consent);
    setStudentSaveConsent(consent);
    if (!consent) {
      deleteAllStudentRecords();
    }
  };

  const handleDeleteAllRecords = () => {
    deleteAllStudentRecords();
    setSaveConsentState(false);
    setPersonalCheckIns([]);
    setPersonalLogs([]);
    setPersonalWins(DEFAULT_SMALL_WINS_POOL);
    setIsStudentDemoMode(false);
  };

  const subTabs = [
    {
      id: 'checkin',
      label: 'Check-In & Recovery',
      icon: HeartHandshake,
    },
    {
      id: 'routine',
      label: 'After-School Routine',
      icon: CalendarClock,
    },
    {
      id: 'exam-rescue',
      label: 'Exam & Homework Rescue',
      icon: BookOpenCheck,
    },
    {
      id: 'fuel-guide',
      label: 'Fuel Your School Day',
      icon: Utensils,
    },
    {
      id: 'coach',
      label: 'Wellbeing Coach',
      icon: MessageSquareHeart,
    },
    {
      id: 'scorecard-wins',
      label: 'Scorecard & Small Wins',
      icon: BarChart3,
    },
  ];

  const guideSteps = [
    {
      title: 'Student Daily Check-In',
      detail: 'Log return time from school, fatigue (1-10), stress (1-10), sleep, hydration, and what is bothering you most.',
    },
    {
      title: 'After-School Routine & Exam Rescue',
      detail: 'Get instant recovery plans, comfortable rest periods, balanced local snacks, and break down heavy homework into small steps.',
    },
    {
      title: 'Wellbeing Coach & Small Wins',
      detail: 'Chat with our safe student wellbeing coach and track small study wins without guilt or restrictive dieting.',
    },
  ];

  return (
    <div className="space-y-7">
      <SectionGuideBanner
        sectionTitle="Student Wellbeing Zone"
        description="Specialized after-school recovery, homework rescue, snack guide, and supportive AI coaching for students."
        steps={guideSteps}
      />
      {/* Welcoming AI-Healthcare Student Hero + Fictional Demo Mode Switcher */}
      <header className="hm-student-hero rounded-3xl p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-xs text-[#55E6A5] font-semibold">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>After-School Recovery · Study Balance · Student Fuel & Coach</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold leading-tight tracking-tight text-white text-balance">
            Student Wellbeing Zone
          </h1>
          <p className="text-sm sm:text-base text-[#D0D5DD] max-w-2xl leading-relaxed">
            Reset after school, manage homework and exam stress without all-nighters, find simple home food ideas, and talk to your HealthMate AI coach.
          </p>
        </div>

        {/* Fictional Demo Mode Toggle Box */}
        <div className="bg-[#101828]/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 xl:w-[360px] shrink-0 space-y-2 border border-white/12">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#64D9F5]">
              {isStudentDemoMode
                ? 'Fictional Student Demo'
                : 'My Personal Mode'}
            </span>
            <button
              type="button"
              onClick={() => setIsStudentDemoMode((prev) => !prev)}
              className="bg-[#55E6A5] hover:bg-[#42D694] text-[#101828] text-xs font-bold px-3.5 py-1.5 rounded-lg transition whitespace-nowrap shrink-0"
            >
              {isStudentDemoMode ? 'Use My Own Entry' : 'Load Demo Data'}
            </button>
          </div>
          <p className="text-xs text-[#D0D5DD] leading-relaxed">
            {isStudentDemoMode
              ? `Viewing sample data for ${FICTIONAL_STUDENT_DEMO_NAME}.`
              : saveConsent
              ? 'Personal mode — saving to your browser with your permission.'
              : 'Session-only mode — nothing saved unless opted in under Privacy.'}
          </p>
        </div>
      </header>

      {/* Sub-Navigation Bar */}
      <nav
        aria-label="Student Wellbeing Zone sections"
        className="flex flex-wrap items-center gap-1.5 hm-card p-1.5 rounded-2xl"
      >
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              aria-current={active ? 'page' : undefined}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 whitespace-nowrap ${
                active
                  ? 'bg-[#101828] text-[#55E6A5] shadow-xs'
                  : 'text-[#667085] hover:text-[#172033] hover:bg-[#F5F7FB]'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Sub-Section Content */}
      {activeSubTab === 'checkin' && (
        <StudentCheckInAndRecovery
          activeCheckIn={activeCheckIn}
          onSaveCheckIn={handleSaveCheckIn}
          onLogStudySessionCompleted={handleLogStudySession}
          onLogBreakTaken={handleLogBreakTaken}
          onNavigateSubTab={setActiveSubTab}
        />
      )}

      {activeSubTab === 'routine' && (
        <AfterSchoolRoutineBuilder
          scheduleSlots={activeSchedule}
          onUpdateSchedule={handleUpdateSchedule}
          recentCheckIn={activeCheckIn}
          onLogStudySessionCompleted={handleLogStudySession}
          onLogBreakTaken={handleLogBreakTaken}
        />
      )}

      {activeSubTab === 'exam-rescue' && (
        <ExamHomeworkRescue
          recentCheckIn={activeCheckIn}
          onLogStudySessionCompleted={handleLogStudySession}
        />
      )}

      {activeSubTab === 'fuel-guide' && (
        <FuelYourSchoolDay recentCheckIn={activeCheckIn} />
      )}

      {activeSubTab === 'coach' && (
        <WellbeingCoachChat recentCheckIn={activeCheckIn} />
      )}

      {activeSubTab === 'scorecard-wins' && (
        <StudentScorecardAndWins
          logs={activeLogs}
          smallWins={activeWins}
          savedCheckIns={isStudentDemoMode ? [demoCheckIn] : personalCheckIns}
          onToggleSelectWin={handleToggleSelectWin}
          onToggleCompleteWin={handleToggleCompleteWin}
          onAddCustomWin={handleAddCustomWin}
          isDemoMode={isStudentDemoMode}
          storageAvailable={storageAvailable}
          saveConsent={saveConsent}
          onChangeConsent={handleChangeConsent}
          onDeleteAllRecords={handleDeleteAllRecords}
        />
      )}
    </div>
  );
};
