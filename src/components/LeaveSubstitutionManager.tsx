'use client';

import React, { useState } from 'react';
import {
  Faculty,
  LeaveRequest,
  Session,
  Substitution,
  Subject,
  TimeSlot,
  Batch,
  Room,
  FacultySubject,
  FacultyAvailability,
} from '../types/ttms';
import {
  getAffectedSessionsForLeave,
  AffectedSessionDetails,
  SubstituteCandidate,
} from '../lib/substitutionEngine';
import {
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Send,
  UserX,
} from 'lucide-react';

interface LeaveSubstitutionManagerProps {
  leaveRequests: LeaveRequest[];
  substitutions: Substitution[];
  faculty: Faculty[];
  sessions: Session[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  batches: Batch[];
  rooms: Room[];
  facultySubjects: FacultySubject[];
  facultyAvailability: FacultyAvailability[];
  onAddLeaveRequest: (leave: LeaveRequest) => void;
  onConfirmSubstitution: (
    leaveId: string,
    sessionId: string,
    substituteFacultyId: string,
    subDate: string,
    reason: string
  ) => void;
  onRescheduleSession: (
    leaveId: string,
    sessionId: string,
    newSlotId: string,
    reason: string
  ) => void;
}

export default function LeaveSubstitutionManager({
  leaveRequests,
  substitutions,
  faculty,
  sessions,
  subjects,
  timeSlots,
  batches,
  rooms,
  facultySubjects,
  facultyAvailability,
  onAddLeaveRequest,
  onConfirmSubstitution,
  onRescheduleSession,
}: LeaveSubstitutionManagerProps) {
  const [selectedLeaveId, setSelectedLeaveId] = useState<string>(
    leaveRequests[0]?.Leave_ID || ''
  );

  // New leave modal state
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [newFacultyId, setNewFacultyId] = useState(faculty[0]?.Faculty_ID || '');
  const [newFromDate, setNewFromDate] = useState('2026-10-20');
  const [newToDate, setNewToDate] = useState('2026-10-20');
  const [newReason, setNewReason] = useState('');

  const facultyMap = new Map(faculty.map((f) => [f.Faculty_ID, f]));
  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s]));
  const batchMap = new Map(batches.map((b) => [b.Batch_ID, b]));
  const roomMap = new Map(rooms.map((r) => [r.Room_ID, r]));
  const slotMap = new Map(timeSlots.map((ts) => [ts.Slot_ID, ts]));

  const activeLeave = leaveRequests.find((l) => l.Leave_ID === selectedLeaveId);

  // Calculate affected sessions for the active leave
  const affectedSessions: AffectedSessionDetails[] = activeLeave
    ? getAffectedSessionsForLeave(
        activeLeave,
        sessions,
        timeSlots,
        subjects,
        faculty,
        facultySubjects,
        facultyAvailability
      )
    : [];

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) return;

    const leave: LeaveRequest = {
      Leave_ID: `LEV_${String(leaveRequests.length + 1).padStart(3, '0')}`,
      Faculty_ID: newFacultyId,
      From_Date: newFromDate,
      To_Date: newToDate,
      Reason: newReason,
      Status: 'Reported',
    };

    onAddLeaveRequest(leave);
    setSelectedLeaveId(leave.Leave_ID);
    setShowAddLeaveModal(false);
    setNewReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Process 5.0 • Faculty Leave & Smart Substitution (D4 / D5)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Leave Impact Analysis & Intelligent Substitute Recommendation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automates Fig. 7 Sequence Flow: matches affected sessions with free, subject-expert
            faculty within workload limits, avoiding manual timetable disruption.
          </p>
        </div>

        <button
          onClick={() => setShowAddLeaveModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Faculty Leave (FR-10)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recorded Leave Requests List */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Faculty Leave Requests
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {leaveRequests.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {leaveRequests.map((leave) => {
              const fac = facultyMap.get(leave.Faculty_ID);
              const isSelected = selectedLeaveId === leave.Leave_ID;

              return (
                <div
                  key={leave.Leave_ID}
                  onClick={() => setSelectedLeaveId(leave.Leave_ID)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      {fac?.Faculty_Name || leave.Faculty_ID}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        leave.Status === 'Reported'
                          ? 'bg-amber-100 text-amber-800'
                          : leave.Status === 'Processed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {leave.Status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{leave.Reason}</p>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center space-x-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{leave.From_Date}</span>
                    </span>
                    <span className="font-semibold text-indigo-600 text-[10px]">
                      View Impact →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Impacted Sessions & Recommendation Engine */}
        <div className="lg:col-span-2 space-y-6">
          {activeLeave ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                    Selected Leave File: {activeLeave.Leave_ID}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {facultyMap.get(activeLeave.Faculty_ID)?.Faculty_Name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 italic">
                    &quot;{activeLeave.Reason}&quot;
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border">
                    Date: {activeLeave.From_Date}
                  </span>
                </div>
              </div>

              {/* Affected Sessions */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Affected Scheduled Sessions ({affectedSessions.length})
                </h4>

                {affectedSessions.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-bold">No Teaching Slots Impacted!</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      This faculty has no scheduled classes on this date according to the timetable.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {affectedSessions.map((aff) => {
                      const { session, subjectName, slotDetails, candidates } = aff;
                      const batch = batchMap.get(session.Batch_ID);
                      const room = roomMap.get(session.Room_ID);

                      return (
                        <div
                          key={session.Session_ID}
                          className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-sm text-slate-900">
                                  {subjectName}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                  {session.Session_Type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Division: <strong>{batch?.Division}</strong> • Room: <strong>{room?.Room_No}</strong>
                              </p>
                            </div>

                            <div className="text-right font-mono text-xs font-semibold text-slate-700">
                              {slotDetails?.Day} • Period {slotDetails?.Period_No} ({slotDetails?.Start_Time} - {slotDetails?.End_Time})
                            </div>
                          </div>

                          {/* Smart Candidate Suggestions (Process 5.0 / FR-11) */}
                          <div>
                            <div className="flex items-center space-x-2 mb-2.5">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                Smart Recommendation Engine (FR-11)
                              </span>
                            </div>

                            <div className="space-y-2">
                              {candidates.slice(0, 3).map((cand) => {
                                const isBest = cand.score >= 80;
                                return (
                                  <div
                                    key={cand.faculty.Faculty_ID}
                                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                      isBest
                                        ? 'bg-emerald-50/60 border-emerald-300'
                                        : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-bold text-xs text-slate-900">
                                          {cand.faculty.Faculty_Name}
                                        </span>
                                        {cand.isSubjectExpert && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                            Subject Expert
                                          </span>
                                        )}
                                        {cand.isFreeAtSlot ? (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                            Slot Free
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                            Slot Clash
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        {cand.recommendationReason} (Load: {cand.currentLoad}/{cand.maxLoad}h)
                                      </p>
                                    </div>

                                    <button
                                      disabled={!cand.isFreeAtSlot}
                                      onClick={() =>
                                        onConfirmSubstitution(
                                          activeLeave.Leave_ID,
                                          session.Session_ID,
                                          cand.faculty.Faculty_ID,
                                          activeLeave.From_Date,
                                          `Assigned substitute ${cand.faculty.Faculty_Name} due to faculty leave`
                                        )
                                      }
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                        cand.isFreeAtSlot
                                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                      }`}
                                    >
                                      Assign Substitute (FR-12)
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              <UserX className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">Select or record a leave request on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* Record Leave Modal */}
      {showAddLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Faculty Leave / Unavailability (FR-10)
            </h3>

            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Member</label>
                <select
                  value={newFacultyId}
                  onChange={(e) => setNewFacultyId(e.target.value)}
                  className="w-full border rounded-lg p-2 font-semibold"
                >
                  {faculty.map((f) => (
                    <option key={f.Faculty_ID} value={f.Faculty_ID}>
                      {f.Faculty_Name} ({f.Department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={newFromDate}
                    onChange={(e) => setNewFromDate(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={newToDate}
                    onChange={(e) => setNewToDate(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Leave / Duty
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Attending NBA Accreditation workshop or Medical leave"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeaveModal(false)}
                  className="px-3 py-1.5 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold shadow-sm"
                >
                  Record Leave & Find Substitutes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

