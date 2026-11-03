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
} from 'lucide-react';

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
  const [selectedBatch, setSelectedBatch] = useState('BATCH-001');
  const [entries, setEntries] = useState<PublicEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const batches = [
    { id: 'BATCH-001', label: 'TY CE - Div A (Third Year Computer Engg)' },
    { id: 'BATCH-002', label: 'TY CE - Div B (Third Year Computer Engg)' },
    { id: 'BATCH-003', label: 'TY IT - Div A (Third Year Information Tech)' },
    { id: 'BATCH-004', label: 'B.Tech CE (Final Year Computer Engg)' },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periods = [
    { no: 1, time: '09:00 - 10:00' },
    { no: 2, time: '10:00 - 11:00' },
    { no: 3, time: '11:15 - 12:15' },
    { no: 4, time: '12:15 - 13:15' },
    { no: 5, time: '14:00 - 15:00' },
    { no: 6, time: '15:00 - 16:00' },
    { no: 7, time: '16:00 - 17:00' },
  ];

  const fetchPublicTimetable = useCallback(async () => {
    setIsLoading(true);
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
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Export PDF</span>
            </button>
            <Link
              href="/login"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Select Division:
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="text-xs font-semibold p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-slate-50 w-full sm:w-80"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 text-right">
            <span>Status: </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Published & Active
            </span>
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
                  {periods.map((p) => (
                    <th
                      key={p.no}
                      className="p-2.5 font-bold text-center border-l border-slate-200 min-w-[135px]"
                    >
                      <div>Period {p.no}</div>
                      <div className="text-[10px] font-normal text-slate-500">{p.time}</div>
                    </th>
                  ))}
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
                      return (
                        <td
                          key={p.no}
                          className="p-1.5 border-l border-slate-100 align-top h-24"
                        >
                          {entry ? (
                            <div
                              className={`p-2 rounded-lg border h-full flex flex-col justify-between shadow-2xs ${
                                entry.subject_type === 'Practical'
                                  ? 'bg-emerald-50/70 border-emerald-200'
                                  : entry.is_combined
                                  ? 'bg-purple-50/70 border-purple-200'
                                  : 'bg-indigo-50/70 border-indigo-200'
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

