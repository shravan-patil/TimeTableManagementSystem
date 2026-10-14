'use client';

import React, { useState } from 'react';
import {
  Batch,
  Faculty,
  FacultyAvailability,
  FacultySubject,
  Room,
  Session,
  Subject,
  TimeSlot,
  SchedulingConfig,
  DayOfWeek,
  Timetable,
} from '../types/ttms';
import { generateTimetable, SchedulingResult } from '../lib/schedulingAlgorithm';
import {
  Sparkles,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  Layers,
  Calendar,
  Zap,
} from 'lucide-react';

interface TimetableGeneratorProps {
  timetable: Timetable;
  batches: Batch[];
  subjects: Subject[];
  faculty: Faculty[];
  facultySubjects: FacultySubject[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  facultyAvailability: FacultyAvailability[];
  onApplyGeneratedTimetable: (
    newSessions: Session[],
    summary: SchedulingResult
  ) => void;
}

export default function TimetableGenerator({
  timetable,
  batches,
  subjects,
  faculty,
  facultySubjects,
  rooms,
  timeSlots,
  facultyAvailability,
  onApplyGeneratedTimetable,
}: TimetableGeneratorProps) {
  // Configuration State
  const [config, setConfig] = useState<SchedulingConfig>({
    academicTerm: timetable.Academic_Term,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    periodsPerDay: 6,
    periodDurationMins: 60,
    startTime: '09:00',
    lunchBreakPeriod: 4,
    allowSplitPracticals: true,
    balanceFacultyWorkload: true,
    fixedCommonElectivePeriod: {
      day: 'Tue',
      periodNo: 3,
      subjectId: 'SUB_08',
    },
  });

  const [hasElectiveSlot, setHasElectiveSlot] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');
  const [result, setResult] = useState<SchedulingResult | null>(null);

  const daysList: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: DayOfWeek) => {
    if (config.workingDays.includes(day)) {
      if (config.workingDays.length > 1) {
        setConfig({
          ...config,
          workingDays: config.workingDays.filter((d) => d !== day),
        });
      }
    } else {
      setConfig({
        ...config,
        workingDays: [...config.workingDays, day],
      });
    }
  };

  const handleRunAlgorithm = () => {
    setIsGenerating(true);
    setResult(null);

    const activeConfig: SchedulingConfig = {
      ...config,
      fixedCommonElectivePeriod: hasElectiveSlot
        ? config.fixedCommonElectivePeriod
        : undefined,
    };

    setGenerationProgress('1. Parsing constraints & faculty eligibility rules (D1/D3)...');

    setTimeout(() => {
      setGenerationProgress('2. Pre-allocating fixed elective & multi-division shared periods...');
      setTimeout(() => {
        setGenerationProgress('3. Assigning lab practicals to laboratory rooms (Lab-CC1, CC2, AI)...');
        setTimeout(() => {
          setGenerationProgress('4. Running heuristic backtrack solver for core theory lectures...');
          setTimeout(() => {
            const genResult = generateTimetable(
              timetable.Timetable_ID,
              batches,
              subjects,
              faculty,
              facultySubjects,
              rooms,
              timeSlots,
              facultyAvailability,
              activeConfig
            );
            setResult(genResult);
            setIsGenerating(false);
            setGenerationProgress('');
          }, 400);
        }, 400);
      }, 400);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Process 2.0 • Constraint-Based Generation Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Automated Conflict-Free Timetable Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Formulates and solves timetable allocation constraints: room capacity, lab type,
            faculty teaching load limit, and zero-conflict multi-batch scheduling.
          </p>
        </div>

        <button
          onClick={handleRunAlgorithm}
          disabled={isGenerating}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all self-start md:self-auto"
        >
          {isGenerating ? (
            <>
              <Zap className="w-4 h-4 animate-spin" />
              <span>Synthesizing Timetable...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Scheduling Engine</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Box if Generating */}
      {isGenerating && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-indigo-900 animate-pulse">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-indigo-600 animate-spin" />
            <div>
              <p className="text-sm font-bold">Constraint Solver Executing</p>
              <p className="text-xs text-indigo-700 mt-0.5">{generationProgress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Result Banner */}
      {result && (
        <div
          className={`p-6 rounded-2xl border shadow-sm ${
            result.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              {result.success ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h3 className="text-base font-bold">
                  {result.success ? 'Draft Generation Successful!' : 'Partial Allocation Warning'}
                </h3>
                <p className="text-xs mt-1 text-slate-700">{result.message}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="bg-white/80 px-2.5 py-1 rounded-md border font-semibold">
                    Scheduled Sessions: <strong>{result.scheduledCount}</strong>
                  </span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-md border font-semibold">
                    Unassigned: <strong>{result.unassignedCount}</strong>
                  </span>
                  <span className="bg-white/80 px-2.5 py-1 rounded-md border font-mono">
                    Engine Runtime: <strong>{result.executionTimeMs} ms</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setResult(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-lg transition-colors"
              >
                Discard
              </button>
              <button
                onClick={() => onApplyGeneratedTimetable(result.sessions, result)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-1.5"
              >
                <span>Commit & Update Grid</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Parameters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Schedule Parameters (FR-2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
            <Settings2 className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Scheduling Parameters Configuration (FR-2)
            </h3>
          </div>

          {/* Working Days */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Working Days per Week
            </label>
            <div className="flex flex-wrap gap-2">
              {daysList.map((day) => {
                const isSelected = config.workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Standard academic week: Monday through Friday (Saturdays optional half-day).
            </p>
          </div>

          {/* Periods & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Periods per Day
              </label>
              <select
                value={config.periodsPerDay}
                onChange={(e) =>
                  setConfig({ ...config, periodsPerDay: Number(e.target.value) })
                }
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value={4}>4 Periods / day</option>
                <option value={5}>5 Periods / day</option>
                <option value={6}>6 Periods / day (Standard)</option>
                <option value={7}>7 Periods / day</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Period Duration
              </label>
              <select
                value={config.periodDurationMins}
                onChange={(e) =>
                  setConfig({ ...config, periodDurationMins: Number(e.target.value) })
                }
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value={50}>50 minutes</option>
                <option value={60}>60 minutes (Standard)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lunch Break Period
              </label>
              <select
                value={config.lunchBreakPeriod}
                onChange={(e) =>
                  setConfig({ ...config, lunchBreakPeriod: Number(e.target.value) })
                }
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value={4}>Period 4 (13:15 – 14:00)</option>
                <option value={0}>No Break Locked</option>
              </select>
            </div>
          </div>

          {/* Fixed Slots / Elective Configuration (SRS FR-2) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Fixed Common Elective Period
                </span>
                <p className="text-[11px] text-slate-500">
                  Lock a dedicated slot across all divisions for institute-level electives
                </p>
              </div>
              <input
                type="checkbox"
                checked={hasElectiveSlot}
                onChange={(e) => setHasElectiveSlot(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded"
              />
            </div>

            {hasElectiveSlot && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Day</span>
                  <select
                    value={config.fixedCommonElectivePeriod?.day || 'Tue'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fixedCommonElectivePeriod: {
                          day: e.target.value as DayOfWeek,
                          periodNo: config.fixedCommonElectivePeriod?.periodNo || 3,
                          subjectId: config.fixedCommonElectivePeriod?.subjectId || 'SUB_08',
                        },
                      })
                    }
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  >
                    {daysList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Period</span>
                  <select
                    value={config.fixedCommonElectivePeriod?.periodNo || 3}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fixedCommonElectivePeriod: {
                          day: config.fixedCommonElectivePeriod?.day || 'Tue',
                          periodNo: Number(e.target.value),
                          subjectId: config.fixedCommonElectivePeriod?.subjectId || 'SUB_08',
                        },
                      })
                    }
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  >
                    {[1, 2, 3, 5, 6].map((p) => (
                      <option key={p} value={p}>
                        Period {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Subject</span>
                  <select
                    value={config.fixedCommonElectivePeriod?.subjectId || 'SUB_08'}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        fixedCommonElectivePeriod: {
                          day: config.fixedCommonElectivePeriod?.day || 'Tue',
                          periodNo: config.fixedCommonElectivePeriod?.periodNo || 3,
                          subjectId: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                  >
                    {subjects
                      .filter((s) => s.Subject_Type === 'Elective')
                      .map((s) => (
                        <option key={s.Subject_ID} value={s.Subject_ID}>
                          {s.Subject_Name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Engine Constraints & Active Pools */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Constraint Enforcer Rules
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Faculty Double-Booking Guard</p>
                <p className="text-[11px] text-emerald-700">
                  UNIQUE(Timetable_ID, Faculty_ID, Slot_ID) strictly enforced.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Room Double-Booking Guard</p>
                <p className="text-[11px] text-emerald-700">
                  UNIQUE(Timetable_ID, Room_ID, Slot_ID) strictly enforced.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Batch Collision Prevention</p>
                <p className="text-[11px] text-emerald-700">
                  UNIQUE(Timetable_ID, Batch_ID, Slot_ID) strictly enforced.
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-200 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Practical Lab Consecutive Periods</p>
                <p className="text-[11px] text-blue-700">
                  Labs automatically paired for 2 consecutive hours in specialized labs.
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 text-purple-900 rounded-xl border border-purple-200 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Weekly Load Balancing (FR-8)</p>
                <p className="text-[11px] text-purple-700">
                  Prevents assigning sessions beyond faculty Max_Weekly_Load limit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

