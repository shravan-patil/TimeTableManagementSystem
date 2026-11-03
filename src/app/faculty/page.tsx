'use client';

// =============================================================================
// VJTI Time Table Management System (TTMS)
// Screen S9: Dedicated Faculty Personal Portal
// Reference: Assignment 7 Section 4.3 (Table 12)
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  BookOpen,
  Send,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  LogOut,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface FacultyProfile {
  faculty_id: string;
  name: string;
  department: string;
  max_weekly_load: number;
}

interface ScheduleEntry {
  entry_id: string;
  subject_name: string;
  subject_code: string;
  subject_type: string;
  room_no: string;
  day: string;
  period_no: number;
  start_time: string;
  end_time: string;
  batch_ids: string[];
}

interface OpenSubstitution {
  sub_id: string;
  leave_id: string;
  entry_id: string;
  sub_date: string;
  subject_name: string;
  subject_code: string;
  subject_type: string;
  batch_names: string;
  room_no: string;
  day: string;
  period_no: number;
  start_time: string;
  end_time: string;
  original_faculty_name: string;
  original_faculty_id: string;
  is_eligible: boolean;
  conflict_reason?: string;
  status: string;
}

export default function FacultyPortalPage() {
  const [faculty, setFaculty] = useState<FacultyProfile>({
    faculty_id: 'FAC-PMC',
    name: 'Prof. P. M. Chawan',
    department: 'dept-ce',
    max_weekly_load: 16,
  });

  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [openSubstitutions, setOpenSubstitutions] = useState<OpenSubstitution[]>([]);
  const [claimLoading, setClaimLoading] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fromDate, setFromDate] = useState('2026-10-20');
  const [toDate, setToDate] = useState('2026-10-21');
  const [reason, setReason] = useState('Attending National IEEE Conference');
  const [leaveStatus, setLeaveStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await fetch(`/api/timetable?faculty=${faculty.faculty_id}`);
      const data = await res.json();
      if (data.schedule) {
        setSchedule(data.schedule);
      }
    } catch (err) {
      console.error('Failed to load faculty schedule:', err);
    }
  }, [faculty.faculty_id]);

  const fetchOpenClaims = useCallback(async () => {
    try {
      const res = await fetch(`/api/substitutions?open=true&facultyId=${faculty.faculty_id}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOpenSubstitutions(data);
      }
    } catch (err) {
      console.error('Failed to load open claims:', err);
    }
  }, [faculty.faculty_id]);

  useEffect(() => {
    fetchSchedule();
    fetchOpenClaims();
  }, [fetchSchedule, fetchOpenClaims]);

  const handleClaim = async (subId: string) => {
    setClaimLoading(subId);
    setClaimMessage(null);
    try {
      const res = await fetch('/api/substitutions/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sub_id: subId,
          faculty_id: faculty.faculty_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to claim substitution');
      }
      setClaimMessage({
        type: 'success',
        text: 'Successfully claimed lecture! Students and coordinator have been automatically notified via email.',
      });
      fetchSchedule();
      fetchOpenClaims();
    } catch (err: any) {
      setClaimMessage({
        type: 'error',
        text: err.message || 'Error claiming lecture',
      });
    } finally {
      setClaimLoading(null);
    }
  };

  const assignedHours = schedule.length;
  const loadPercentage = Math.min(
    Math.round((assignedHours / faculty.max_weekly_load) * 100),
    100
  );

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLeaveStatus(null);

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: faculty.faculty_id,
          fromDate,
          toDate,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit leave');

      setLeaveStatus(
        `Leave submitted successfully. ${data.impactedEntries?.length || 0} class(es) routed to Coordinator for substitution.`
      );
      fetchOpenClaims();
    } catch (err: any) {
      setLeaveStatus(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Faculty Portal Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-100">
              V
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  VJTI Faculty Portal (Screen S9)
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Active Faculty
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Department of Computer Engineering & IT • AY 2026–27
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-800">{faculty.name}</div>
              <div className="text-[11px] text-slate-500">ID: {faculty.faculty_id}</div>
            </div>
            <Link
              href="/login"
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Workload Progress Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Teaching Load Meter</span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900">{assignedHours}</span>
              <span className="text-xs text-slate-500">/ {faculty.max_weekly_load} hrs/week</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  loadPercentage > 100
                    ? 'bg-rose-500'
                    : loadPercentage > 80
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {loadPercentage}% of maximum permitted institutional workload assigned.
            </p>
          </div>

          {/* Quick Schedule Status */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Weekly Sessions</span>
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{schedule.length}</div>
            <p className="text-[11px] text-slate-500 mt-2">
              Lectures and laboratory sessions currently scheduled across the semester.
            </p>
          </div>

          {/* Department Role */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Department Affiliation</span>
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-sm font-bold text-slate-900">Computer Engineering (CE)</div>
            <div className="text-xs text-slate-500 mt-1">Status: Regular Full-Time Faculty</div>
            <div className="mt-3">
              <Link
                href="/"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Switch to Coordinator View &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Personalized Timetable Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                My Weekly Teaching Schedule
              </h2>
            </div>
            <button
              onClick={fetchSchedule}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold w-24">Day</th>
                  {periods.map((p) => (
                    <th key={p} className="p-3 font-semibold text-center border-l border-slate-100">
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800 bg-slate-50/40">{day}</td>
                    {periods.map((p) => {
                      const entry = schedule.find(
                        (e) => e.day === day && e.period_no === p
                      );
                      return (
                        <td
                          key={p}
                          className="p-2 border-l border-slate-100 align-top min-w-[130px] h-20"
                        >
                          {entry ? (
                            <div className="p-2 rounded-lg bg-indigo-50/80 border border-indigo-200/80 shadow-xs h-full flex flex-col justify-between">
                              <div>
                                <span className="font-bold text-indigo-950 block truncate">
                                  {entry.subject_name}
                                </span>
                                <span className="text-[10px] text-slate-600 block">
                                  {entry.batch_ids.join(', ')}
                                </span>
                              </div>
                              <div className="text-[10px] font-semibold text-indigo-700 mt-1">
                                📍 {entry.room_no}
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

        {/* First-Come, First-Served (FCFS) Open Lecture Claim Board (Task 3) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span>Open Lectures Available to Claim (FCFS Board)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Live Marketplace
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  First-come, first-served claim system for colleague leaves. Clashes and availability conflicts are validated before assignment.
                </p>
              </div>
            </div>

            <button
              onClick={fetchOpenClaims}
              className="text-xs text-slate-500 hover:text-emerald-600 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Open Slots</span>
            </button>
          </div>

          {claimMessage && (
            <div
              className={`p-3 rounded-lg text-xs mb-4 flex items-center space-x-2 ${
                claimMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {claimMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{claimMessage.text}</span>
            </div>
          )}

          {openSubstitutions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-600">No open lectures currently pending claim.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When any faculty member reports leave, open lecture claim opportunities will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Date & Slot</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Division</th>
                    <th className="py-2.5 px-3">Room</th>
                    <th className="py-2.5 px-3">Faculty on Leave</th>
                    <th className="py-2.5 px-3 text-right">Eligibility & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {openSubstitutions.map((sub) => (
                    <tr key={sub.sub_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <div>{sub.sub_date}</div>
                        <div className="text-[11px] text-indigo-600 font-normal">
                          {sub.day} Period {sub.period_no} ({sub.start_time} - {sub.end_time})
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{sub.subject_name}</div>
                        <div className="text-[10px] text-slate-500">{sub.subject_code} • {sub.subject_type}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {sub.batch_names}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">{sub.room_no}</td>
                      <td className="py-3 px-3 text-slate-600">{sub.original_faculty_name}</td>
                      <td className="py-3 px-3 text-right">
                        {sub.is_eligible ? (
                          <button
                            onClick={() => handleClaim(sub.sub_id)}
                            disabled={claimLoading === sub.sub_id}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{claimLoading === sub.sub_id ? 'Claiming...' : 'Claim Lecture (FCFS)'}</span>
                          </button>
                        ) : (
                          <div
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs border border-slate-200 cursor-not-allowed"
                            title={sub.conflict_reason}
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate max-w-[170px]">{sub.conflict_reason || 'Ineligible'}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Leave Request & Substitution Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Send className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Submit Leave Request & Initiate Substitution (FR-10)
            </h2>
          </div>

          {leaveStatus && (
            <div
              className={`p-3 rounded-lg text-xs mb-4 ${
                leaveStatus.startsWith('Error')
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {leaveStatus}
            </div>
          )}

          <form onSubmit={handleApplyLeave} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Official Reason / Duty Justification
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="e.g. Conference, Medical, University Duty"
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Leave'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

