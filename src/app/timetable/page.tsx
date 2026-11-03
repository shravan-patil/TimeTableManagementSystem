'use client';

// =============================================================================
// VJTI Time Table Management System (TTMS)
// Screen S10: Public Student Timetable Viewer (Login-Free)
// Reference: Assignment 7 Section 4.4 (Table 13)
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Printer,
  BookOpen,
  Filter,
  GraduationCap,
  MapPin,
  LogIn,
  RefreshCw,
} from 'lucide-react';
import {
  initialBatches,
  initialFaculty,
  initialRooms,
  initialSubjects,
  initialTimeSlots,
} from '@/data/dummyData';

interface PublicEntry {
  entry_id: string;
  subject_name: string;
  subject_code: string;
  subject_type: string;
  faculty_name: string;
  room_no: string;
  day: string;
  period_no: number;
  start_time: string;
  end_time: string;
  batch_ids: string[];
  is_combined: boolean;
}

export default function PublicTimetablePage() {
  const [selectedBatch, setSelectedBatch] = useState('BATCH-SY-IT');
  const [entries, setEntries] = useState<PublicEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const batches = [
    { id: 'BATCH-SY-CE', label: 'SY B.Tech (CE) — Second Year' },
    { id: 'BATCH-SY-IT', label: 'SY B.Tech (IT) — Second Year' },
    { id: 'BATCH-TY-CE', label: 'TY B.Tech (CE) — Third Year' },
    { id: 'BATCH-TY-IT', label: 'TY B.Tech (IT) — Third Year' },
    { id: 'BATCH-BTECH-CE', label: 'Final B.Tech (CE) — Fourth Year' },
    { id: 'BATCH-BTECH-IT', label: 'Final B.Tech (IT) — Fourth Year' },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periods = [
    { no: 1, time: '08:30 - 09:25' },
    { no: 2, time: '09:30 - 10:25' },
    { no: 3, time: '10:30 - 11:25' },
    { no: 4, time: '11:30 - 12:25' },
    { no: 5, time: '12:30 - 13:25' },
    { no: 6, time: '13:30 - 14:25' },
    { no: 7, time: '14:30 - 15:25' },
  ];

  const isSY = selectedBatch.includes('SY');

  const fetchPublicTimetable = useCallback(async () => {
    setIsLoading(true);
    // 1. Try reading generated schedule from localStorage
    try {
      const saved = localStorage.getItem('vjti_ttms_sessions_v2');
      if (saved) {
        const allSessions = JSON.parse(saved);
        if (Array.isArray(allSessions) && allSessions.length > 0) {
          const slotMap = new Map(initialTimeSlots.map((ts) => [ts.Slot_ID, ts]));
          const subMap = new Map(initialSubjects.map((s) => [s.Subject_ID, s]));
          const roomMap = new Map(initialRooms.map((r) => [r.Room_ID, r]));
          const facMap = new Map(initialFaculty.map((f) => [f.Faculty_ID, f]));

          const batchSessions = allSessions.filter((s: any) => s.Batch_ID === selectedBatch);

          if (batchSessions.length > 0) {
            const mapped: PublicEntry[] = batchSessions.map((s: any) => {
              const slot = slotMap.get(s.Slot_ID);
              const sub = subMap.get(s.Subject_ID);
              const room = roomMap.get(s.Room_ID);
              const fac = facMap.get(s.Faculty_ID);
              return {
                entry_id: s.Session_ID,
                subject_name: sub?.Subject_Name || s.Subject_ID,
                subject_code: sub?.Subject_ID || '',
                subject_type: s.Session_Type || 'Theory',
                faculty_name: fac?.Faculty_Name || s.Faculty_ID,
                room_no: room?.Room_No || s.Room_ID,
                day: slot?.Day || 'Mon',
                period_no: slot?.Period_No || 1,
                start_time: slot?.Start_Time || '08:30',
                end_time: slot?.End_Time || '09:25',
                batch_ids: [s.Batch_ID],
                is_combined: false,
              };
            });
            setEntries(mapped);
            setIsLoading(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }

    // 2. Fallback to API route
    try {
      const res = await fetch(`/api/timetable?batch=${selectedBatch}`);
      const data = await res.json();
      if (data.schedule) {
        setEntries(data.schedule);
      }
    } catch (err) {
      console.error('Failed to load public timetable:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBatch]);

  useEffect(() => {
    fetchPublicTimetable();
  }, [fetchPublicTimetable]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Institutional Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-100">
              V
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                VJTI Mumbai — Public Timetable Portal (Screen S10)
              </h1>
              <p className="text-xs text-slate-500">
                Veermata Jijabai Technological Institute • Matunga, Mumbai 400019
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Coordinator Login
            </Link>
            <Link
              href="/faculty"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Faculty Portal
            </Link>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Schedule</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Filter Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-3">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Select Academic Cohort / Division</h2>
              <p className="text-xs text-slate-500">
                View published course schedules and laboratory assignments for Autumn Semester 2026–27.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <button
              onClick={fetchPublicTimetable}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Institutional Print Header */}
        <div className="hidden print:block text-center border-b pb-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Veermata Jijabai Technological Institute (VJTI)
          </h2>
          <p className="text-xs text-slate-600">
            Department of Computer Engineering & Information Technology
          </p>
          <p className="text-sm font-semibold text-indigo-900 mt-1">
            Academic Timetable — AY 2026–27 (Autumn Semester)
          </p>
          <p className="text-xs font-medium text-slate-700">
            Division: {batches.find((b) => b.id === selectedBatch)?.label}
          </p>
        </div>

        {/* Timetable Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-3 font-bold w-24 text-center">Day / Period</th>
                  {periods.map((p) => {
                    const isLunch = (isSY && p.no === 5) || (!isSY && p.no === 6);
                    return (
                      <th
                        key={p.no}
                        className={`p-2.5 font-bold text-center border-l border-slate-200 min-w-[135px] ${
                          isLunch ? 'bg-amber-100/70 text-amber-950' : ''
                        }`}
                      >
                        <div>Period {p.no}</div>
                        <div className={`text-[10px] font-normal ${isLunch ? 'text-amber-800 font-semibold' : 'text-slate-500'}`}>
                          {p.time} {isLunch ? (isSY ? '• SY Lunch' : '• TY/Final Lunch') : ''}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/40">
                    <td className="p-3 font-bold text-slate-800 bg-slate-50 text-center border-r border-slate-200">
                      {day}
                    </td>
                    {periods.map((p) => {
                      const entry = entries.find(
                        (e) => e.day === day && e.period_no === p.no
                      );

                      // Lunch recess rendering directly in the exact slot
                      if (!entry && ((isSY && p.no === 5) || (!isSY && p.no === 6))) {
                        return (
                          <td
                            key={p.no}
                            className="p-1.5 border-l border-slate-100 align-middle h-24 bg-amber-50/50"
                          >
                            <div className="h-full flex flex-col items-center justify-center p-2 rounded-lg bg-amber-100/60 border border-amber-200 text-amber-900 select-none shadow-2xs">
                              <span className="text-sm">🍽️</span>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900">
                                Lunch Recess
                              </span>
                              <span className="text-[9px] text-amber-700 font-medium">
                                {isSY ? '12:30–13:25 (SY)' : '13:30–14:25 (TY/Final)'}
                              </span>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={p.no}
                          className="p-1.5 border-l border-slate-100 align-top h-24"
                        >
                          {entry ? (
                            <div
                              className={`p-2 rounded-lg border h-full flex flex-col justify-between shadow-2xs ${
                                entry.subject_type === 'Practical' || entry.subject_type === 'Lab'
                                  ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                                  : entry.is_combined
                                  ? 'bg-purple-50/80 border-purple-200'
                                  : 'bg-indigo-50/80 border-indigo-200'
                              }`}
                            >
                              <div>
                                <div className="font-bold text-slate-900 leading-snug line-clamp-2">
                                  {entry.subject_name}
                                </div>
                                <div className="text-[10px] text-slate-600 mt-0.5 truncate">
                                  👤 {entry.faculty_name}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-700 mt-1 pt-1 border-t border-slate-200/50">
                                <span>📍 {entry.room_no}</span>
                                {entry.is_combined && (
                                  <span className="px-1 bg-purple-100 text-purple-800 rounded text-[9px]">
                                    Combined
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-300">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
