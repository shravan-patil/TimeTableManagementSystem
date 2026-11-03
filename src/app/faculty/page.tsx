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
  ChevronDown,
  Layers,
  Award,
  Printer,
  Sliders,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import {
  initialFaculty,
  initialRooms,
  initialSubjects,
  initialTimeSlots,
} from '@/data/dummyData';

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

interface LeaveRecord {
  leave_id: string;
  faculty_id: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: string;
  created_at?: string;
}

export default function FacultyPortalPage() {
  const [faculty, setFaculty] = useState<FacultyProfile>({
    faculty_id: 'FAC-PMC',
    name: 'Prof. P. M. Chawan',
    department: 'Computer Engineering',
    max_weekly_load: 16,
  });

  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [openSubstitutions, setOpenSubstitutions] = useState<OpenSubstitution[]>([]);
  const [myLeaves, setMyLeaves] = useState<LeaveRecord[]>([]);
  const [myClaimedSubs, setMyClaimedSubs] = useState<any[]>([]);
  const [claimLoading, setClaimLoading] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fromDate, setFromDate] = useState('2026-10-20');
  const [toDate, setToDate] = useState('2026-10-21');
  const [reason, setReason] = useState('Attending National IEEE Conference');
  const [leaveStatus, setLeaveStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Faculty Availability state (FR-11)
  const [unavailableSlots, setUnavailableSlots] = useState<Set<string>>(new Set());
  const [availSaving, setAvailSaving] = useState(false);
  const [availSavedMsg, setAvailSavedMsg] = useState<string | null>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periodSlots = [
    { no: 1, time: '08:30 - 09:25' },
    { no: 2, time: '09:30 - 10:25' },
    { no: 3, time: '10:30 - 11:25' },
    { no: 4, time: '11:30 - 12:25' },
    { no: 5, time: '12:30 - 13:25' },
    { no: 6, time: '13:30 - 14:25' },
    { no: 7, time: '14:30 - 15:25' },
  ];

  const fetchSchedule = useCallback(async () => {
    // 1. Try restoring generated schedule from localStorage
    try {
      const saved = localStorage.getItem('vjti_ttms_sessions_v2');
      if (saved) {
        const allSessions = JSON.parse(saved);
        if (Array.isArray(allSessions) && allSessions.length > 0) {
          const slotMap = new Map(initialTimeSlots.map((ts) => [ts.Slot_ID, ts]));
          const subMap = new Map(initialSubjects.map((s) => [s.Subject_ID, s]));
          const roomMap = new Map(initialRooms.map((r) => [r.Room_ID, r]));

          const mySessions = allSessions.filter(
            (s: any) =>
              s.Faculty_ID === faculty.faculty_id ||
              (faculty.faculty_id === 'FAC-PMC' && s.Faculty_ID === 'FAC-001') ||
              (faculty.faculty_id === 'FAC-001' && s.Faculty_ID === 'FAC-PMC')
          );

          if (mySessions.length > 0) {
            const mapped: ScheduleEntry[] = mySessions.map((s: any) => {
              const slot = slotMap.get(s.Slot_ID);
              const sub = subMap.get(s.Subject_ID);
              const room = roomMap.get(s.Room_ID);
              return {
                entry_id: s.Session_ID,
                subject_name: sub?.Subject_Name || s.Subject_ID,
                subject_code: sub?.Subject_ID || '',
                subject_type: s.Session_Type || 'Lecture',
                room_no: room?.Room_No || s.Room_ID,
                day: slot?.Day || 'Mon',
                period_no: slot?.Period_No || 1,
                start_time: slot?.Start_Time || '08:30',
                end_time: slot?.End_Time || '09:25',
                batch_ids: [s.Batch_ID],
              };
            });
            setSchedule(mapped);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('localStorage read error:', e);
    }

    // 2. Fallback to API route
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

  const fetchMyLeaves = useCallback(async () => {
    try {
      const res = await fetch('/api/leaves');
      const data = await res.json();
      if (Array.isArray(data)) {
        const filtered = data.filter(
          (l: any) =>
            l.faculty_id === faculty.faculty_id ||
            (faculty.faculty_id === 'FAC-PMC' && l.faculty_id === 'FAC-001')
        );
        setMyLeaves(filtered);
      }
    } catch (e) {}
  }, [faculty.faculty_id]);

  const fetchMyClaimedSubs = useCallback(async () => {
    try {
      const res = await fetch('/api/substitutions');
      const data = await res.json();
      if (Array.isArray(data)) {
        const claimed = data.filter(
          (s: any) =>
            (s.substitute_faculty_id === faculty.faculty_id ||
              (faculty.faculty_id === 'FAC-PMC' && s.substitute_faculty_id === 'FAC-001')) &&
            s.status === 'CLAIMED'
        );
        setMyClaimedSubs(claimed);
      }
    } catch (e) {}
  }, [faculty.faculty_id]);

  const fetchFacultyAvailability = useCallback(async () => {
    try {
      const local = localStorage.getItem(`vjti_ttms_avail_${faculty.faculty_id}`);
      if (local) {
        setUnavailableSlots(new Set(JSON.parse(local)));
        return;
      }
      const res = await fetch(`/api/faculty/${faculty.faculty_id}/availability`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.availability)) {
          const unavail = data.availability
            .filter((a: any) => !a.Is_Available && !a.is_available)
            .map((a: any) => a.Slot_ID || a.slot_id);
          setUnavailableSlots(new Set(unavail));
        }
      }
    } catch (e) {
      console.warn('Failed to load faculty availability:', e);
    }
  }, [faculty.faculty_id]);

  const toggleSlotAvailability = async (slotId: string) => {
    const next = new Set(unavailableSlots);
    const willBeUnavailable = !next.has(slotId);
    if (willBeUnavailable) {
      next.add(slotId);
    } else {
      next.delete(slotId);
    }
    setUnavailableSlots(next);
    try {
      localStorage.setItem(`vjti_ttms_avail_${faculty.faculty_id}`, JSON.stringify(Array.from(next)));
    } catch (e) {}

    setAvailSaving(true);
    setAvailSavedMsg(null);
    try {
      await fetch(`/api/faculty/${faculty.faculty_id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId,
          isAvailable: !willBeUnavailable,
        }),
      });
      setAvailSavedMsg(`Preferences saved: Slot ${slotId} marked as ${willBeUnavailable ? 'UNAVAILABLE' : 'AVAILABLE'}.`);
      setTimeout(() => setAvailSavedMsg(null), 3500);
    } catch (e) {
      console.warn('Failed to save availability:', e);
    } finally {
      setAvailSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchSchedule();
    fetchOpenClaims();
    fetchMyLeaves();
    fetchMyClaimedSubs();
    fetchFacultyAvailability();
  }, [fetchSchedule, fetchOpenClaims, fetchMyLeaves, fetchMyClaimedSubs, fetchFacultyAvailability]);

  const assignedHours = schedule.length;
  const loadPercentage = Math.min(
    Math.round((assignedHours / faculty.max_weekly_load) * 100),
    100
  );

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
      fetchMyClaimedSubs();
    } catch (err: any) {
      setClaimMessage({
        type: 'error',
        text: err.message || 'Error claiming lecture',
      });
    } finally {
      setClaimLoading(null);
    }
  };

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
        `Leave submitted successfully. ${data.impactedEntries?.length || 0} class(es) converted to FCFS open claim opportunities for colleagues.`
      );
      fetchOpenClaims();
      fetchMyLeaves();
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
            {/* Faculty Switcher Profile Dropdown */}
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline">
                Faculty:
              </span>
              <select
                value={faculty.faculty_id}
                onChange={(e) => {
                  const sel = initialFaculty.find((f) => f.Faculty_ID === e.target.value);
                  if (sel) {
                    setFaculty({
                      faculty_id: sel.Faculty_ID,
                      name: sel.Faculty_Name,
                      department: sel.Department,
                      max_weekly_load: sel.Max_Weekly_Load,
                    });
                  }
                }}
                className="text-xs font-bold bg-transparent text-slate-900 outline-none cursor-pointer"
              >
                {initialFaculty.map((f) => (
                  <option key={f.Faculty_ID} value={f.Faculty_ID}>
                    {f.Faculty_Name} ({f.Department === 'Computer Engineering' ? 'CE' : 'IT'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1.5"
              title="Print Schedule / Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors hidden md:inline"
            >
              Coordinator View &rarr;
            </Link>

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
            <div className="text-sm font-bold text-slate-900">{faculty.department}</div>
            <div className="text-xs text-slate-500 mt-1">Status: Regular Full-Time Faculty</div>
            <div className="mt-2 text-xs font-semibold text-indigo-600">
              ID: {faculty.faculty_id}
            </div>
          </div>
        </div>

        {/* Personalized Timetable Grid */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  My Weekly Teaching Schedule: {faculty.name}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Continuous periods across Monday to Saturday • Synchronized with active campus schedule
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors"
                title="Print personal timetable"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={fetchSchedule}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center space-x-1 transition-colors border border-slate-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 font-semibold w-24">Day</th>
                  {periodSlots.map((p) => (
                    <th key={p.no} className="p-3 font-semibold text-center border-l border-slate-100">
                      Period {p.no}<br />
                      <span className="text-[10px] text-slate-400 font-normal">{p.time}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800 bg-slate-50/40">{day}</td>
                    {periodSlots.map((p) => {
                      const entry = schedule.find(
                        (e) => e.day === day && e.period_no === p.no
                      );
                      const isSYLunch = p.no === 5;
                      const isTYLunch = p.no === 6;
                      return (
                        <td
                          key={p.no}
                          className="p-2 border-l border-slate-100 align-top min-w-[130px] h-20"
                        >
                          {entry ? (
                            <div className="p-2 rounded-lg bg-indigo-50/90 border border-indigo-200 shadow-xs h-full flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-indigo-950 block truncate max-w-[90px]">
                                    {entry.subject_name}
                                  </span>
                                  <span
                                    className={`text-[9px] px-1 py-0.2 rounded font-bold text-white ${
                                      entry.subject_type === 'Lab' ? 'bg-blue-600' : 'bg-indigo-600'
                                    }`}
                                  >
                                    {entry.subject_type}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-600 block mt-0.5">
                                  {entry.batch_ids.join(', ')}
                                </span>
                              </div>
                              <div className="text-[10px] font-semibold text-indigo-700 mt-1">
                                📍 {entry.room_no}
                              </div>
                            </div>
                          ) : isSYLunch ? (
                            <div className="h-full flex flex-col items-center justify-center text-[10px] text-amber-700/80 bg-amber-50/40 rounded p-1">
                              <span>🍽️ SY Lunch</span>
                              <span className="text-[9px] text-slate-400">12:30–13:25</span>
                            </div>
                          ) : isTYLunch ? (
                            <div className="h-full flex flex-col items-center justify-center text-[10px] text-amber-700/80 bg-amber-50/40 rounded p-1">
                              <span>🍽️ TY Lunch</span>
                              <span className="text-[9px] text-slate-400">13:30–14:25</span>
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

        {/* Faculty Availability & Shift Preferences Matrix (FR-11) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span>My Availability & Scheduling Preferences (FR-11)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    Process 4.0 (D3)
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any slot to toggle availability. The automated engine respects unavailable periods during schedule synthesis.
                </p>
              </div>
            </div>

            {availSavedMsg && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 animate-fade-in">
                ✓ {availSavedMsg}
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-2.5 w-20">Day</th>
                  {periodSlots.map((p) => (
                    <th key={p.no} className="p-2.5 text-center border-l border-slate-100">
                      P{p.no}<br />
                      <span className="text-[9px] text-slate-400 font-normal">{p.time.split(' - ')[0]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/40">
                    <td className="p-2.5 font-bold text-slate-800 bg-slate-50/40">{day}</td>
                    {periodSlots.map((p) => {
                      const slotId = `SLOT-${day.toUpperCase()}-${p.no}`;
                      const isUnavail = unavailableSlots.has(slotId);
                      const hasClass = schedule.some((e) => e.day === day && e.period_no === p.no);

                      return (
                        <td key={p.no} className="p-1.5 border-l border-slate-100 text-center">
                          {hasClass ? (
                            <span className="block px-2 py-1.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 cursor-not-allowed" title="Class already scheduled in this slot">
                              Teaching
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleSlotAvailability(slotId)}
                              disabled={availSaving}
                              className={`w-full px-2 py-1.5 rounded-md text-[10px] font-semibold transition-all border flex items-center justify-center space-x-1 ${
                                isUnavail
                                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                              title={isUnavail ? 'Marked Unavailable. Click to make Available.' : 'Available. Click to mark Unavailable.'}
                            >
                              {isUnavail ? (
                                <>
                                  <X className="w-3 h-3 text-rose-600" />
                                  <span>Unavailable</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Available</span>
                                </>
                              )}
                            </button>
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

        {/* First-Come, First-Served (FCFS) Open Lecture Claim Board */}
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
                  Colleague leaves open instant claim opportunities. Clashes and availability conflicts are validated before assignment.
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

        {/* Leave Request Submission & History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Leave Request */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Send className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Submit Leave Request & Initiate Open Claim (FR-10)
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

            <form onSubmit={handleApplyLeave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Official Reason / Duty Justification
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="e.g. Attending IEEE Conference, Medical Leave"
                  className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Submitting & Broadcasting...' : 'Submit Leave & Broadcast Open Slots'}
              </button>
            </form>
          </div>

          {/* My Submitted Leave Requests */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">My Leave Applications ({myLeaves.length})</h3>
              </div>
              <button onClick={fetchMyLeaves} className="text-slate-400 hover:text-slate-700">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {myLeaves.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No leave requests filed for {faculty.name}.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                {myLeaves.map((l) => (
                  <div key={l.leave_id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 text-xs">{l.reason}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {l.from_date} to {l.to_date}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Claimed Lectures Section */}
        {myClaimedSubs.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-3">
              <Award className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Lectures I Have Claimed as Substitute ({myClaimedSubs.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myClaimedSubs.map((sub) => (
                <div key={sub.sub_id} className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Entry ID: {sub.entry_id}</div>
                    <div className="text-[11px] text-emerald-800 mt-0.5">Date: {sub.sub_date}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    Claim Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
