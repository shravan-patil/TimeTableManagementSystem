'use client';

import React from 'react';
import {
  Timetable,
  ConflictItem,
  Session,
  Faculty,
  Room,
  Batch,
  LeaveRequest,
  ChangeLog,
  TimetableStatus,
} from '../types/ttms';
import { NavTab } from './Sidebar';
import {
  Sparkles,
  CalendarCheck,
  AlertOctagon,
  Users,
  Building,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Send,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface DashboardOverviewProps {
  timetable: Timetable;
  sessions: Session[];
  conflicts: ConflictItem[];
  faculty: Faculty[];
  rooms: Room[];
  batches: Batch[];
  leaveRequests: LeaveRequest[];
  changeLogs: ChangeLog[];
  onNavigate: (tab: NavTab) => void;
  onUpdateStatus: (newStatus: TimetableStatus, reason?: string) => void;
}

export default function DashboardOverview({
  timetable,
  sessions,
  conflicts,
  faculty,
  rooms,
  batches,
  leaveRequests,
  changeLogs,
  onNavigate,
  onUpdateStatus,
}: DashboardOverviewProps) {
  const criticalConflicts = conflicts.filter((c) => c.severity === 'critical');
  const warningConflicts = conflicts.filter((c) => c.severity === 'warning');
  const pendingLeaves = leaveRequests.filter((l) => l.Status === 'Reported');

  const lifecycleStages: TimetableStatus[] = [
    'Draft Generated',
    'Under Review',
    'Finalized',
    'Published',
    'Revised',
    'Archived',
  ];

  const currentStageIndex = lifecycleStages.indexOf(timetable.Status);

  return (
    <div className="space-y-6">
      {/* Top Welcome / State Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-950">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <span>{timetable.Academic_Term}</span>
              <span>•</span>
              <span>Version {timetable.Version_No}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Timetable Coordinator Control Center
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Automated constraint-based scheduling, live conflict detection, workload equity
              tracking, and leave-driven substitution management for VJTI CE & IT.
            </p>
          </div>

          {/* Lifecycle State Actions */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col items-end gap-3 min-w-[280px]">
            <div className="w-full flex items-center justify-between text-xs text-slate-300">
              <span>Current Life-cycle:</span>
              <span className="font-bold text-amber-300">{timetable.Status}</span>
            </div>

            <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-white/10">
              {timetable.Status === 'Draft Generated' && (
                <button
                  onClick={() => onUpdateStatus('Under Review', 'Draft submitted for committee review')}
                  className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Open Under Review</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {timetable.Status === 'Under Review' && (
                <button
                  onClick={() => {
                    if (criticalConflicts.length > 0) {
                      alert(`Cannot finalize! There are ${criticalConflicts.length} unresolved critical conflicts (FR-7). Please resolve them first.`);
                      return;
                    }
                    onUpdateStatus('Finalized', 'Committee reviewed and approved timetable without conflicts');
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                    criticalConflicts.length > 0
                      ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                  title={criticalConflicts.length > 0 ? 'Resolve conflicts to finalize' : 'Approve schedule'}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Finalize Timetable</span>
                </button>
              )}

              {timetable.Status === 'Finalized' && (
                <button
                  onClick={() => onUpdateStatus('Published', 'Final timetable published to students and faculty dashboard')}
                  className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-lg shadow-emerald-900/30"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish to Dashboard</span>
                </button>
              )}

              {timetable.Status === 'Published' && (
                <button
                  onClick={() => onUpdateStatus('Revised', 'Opening revision for leave substitution or room rescheduling')}
                  className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Create Timetable Revision</span>
                </button>
              )}

              {timetable.Status === 'Revised' && (
                <button
                  onClick={() => onUpdateStatus('Published', 'Revised timetable re-published to campus dashboard')}
                  className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Re-Publish Changes</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Timetable Lifecycle Stepper Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
            Timetable Life Cycle Pipeline (Fig. 5 State Model)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {lifecycleStages.map((stage, idx) => {
              const isPassed = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={stage}
                  className={`px-3 py-2 rounded-lg text-xs text-center border font-medium transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/30 shadow-md font-bold'
                      : isPassed
                      ? 'bg-slate-800/80 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-900/60 text-slate-500 border-slate-800'
                  }`}
                >
                  <span className="block text-[10px] text-slate-400">Step {idx + 1}</span>
                  {stage}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conflict Warning Alert Banner if conflicts exist */}
      {conflicts.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-rose-900">
                  {conflicts.length} Timetable Conflicts Detected
                </h4>
                <p className="text-xs text-rose-700 mt-1">
                  The system has flagged {criticalConflicts.length} critical clashes (double-booked
                  faculty, room overlap, or batch clashes) and {warningConflicts.length} capacity/load
                  warnings. Under SRS FR-7, a timetable cannot be finalized until critical conflicts
                  are fixed.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {conflicts.slice(0, 3).map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center text-[11px] font-medium bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md border border-rose-200"
                    >
                      {c.title}
                    </span>
                  ))}
                  {conflicts.length > 3 && (
                    <span className="text-[11px] font-semibold text-rose-600 py-1">
                      +{conflicts.length - 3} more...
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('grid')}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors shadow-sm"
            >
              Resolve in Grid
            </button>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sessions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Sessions
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{sessions.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              Across {batches.length} divisions & {rooms.length} rooms
            </p>
          </div>
        </div>

        {/* Conflict Health */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Conflict Health
            </span>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                conflicts.length === 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {conflicts.length === 0 ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertOctagon className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-black ${
                conflicts.length === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {conflicts.length === 0 ? '100% Free' : `${conflicts.length} Clashes`}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {conflicts.length === 0
                ? 'Relational integrity verified'
                : `${criticalConflicts.length} critical, ${warningConflicts.length} warnings`}
            </p>
          </div>
        </div>

        {/* Faculty Workload */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faculty Pool
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{faculty.length} Faculty</div>
            <p className="text-xs text-slate-500 mt-1">
              Active CE & IT Department teachers
            </p>
          </div>
        </div>

        {/* Pending Substitutions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Leaves
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600">
              {pendingLeaves.length} {pendingLeaves.length === 1 ? 'Request' : 'Requests'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Awaiting substitute confirmation
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onNavigate('generator')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors">
            Run Scheduling Engine
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Configure working days, lab pairings, fixed common electives and generate a draft
            timetable in milliseconds.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600">
            <span>Configure & Run Engine</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('grid')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors">
            Interactive Schedule Grid
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Filter by Division, Faculty member, or Room. Edit sessions with real-time clash
            prevention and finalize for publishing.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-blue-600">
            <span>Open Timetable Editor</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('leave')}
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-indigo-600 transition-colors">
            Leave & Smart Substitutes
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Record teacher leave, auto-detect affected classes, and use heuristic matching to assign
            eligible, free substitutes.
          </p>
          <div className="mt-4 flex items-center text-xs font-semibold text-amber-600">
            <span>Manage Leave & Subs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Lower Section: Recent Audit Log & Division Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Division Summary */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Divisions Scheduled
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Academic class allocations</p>

          <div className="mt-4 space-y-3">
            {batches.map((b) => {
              const batchSessions = sessions.filter((s) => s.Batch_ID === b.Batch_ID);
              return (
                <div
                  key={b.Batch_ID}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{b.Division}</h5>
                    <p className="text-[11px] text-slate-500">
                      Strength: {b.Strength} • Year {b.Year}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md">
                    {batchSessions.length} hrs / week
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change Log Feed (Process 6.0 / D5) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Audit Trail (Change Log - D5)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Timestamped log of timetable modifications (SRS FR-13)
              </p>
            </div>
            <button
              onClick={() => onNavigate('changelog')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Full History →
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {changeLogs.slice(0, 4).map((log) => (
              <div key={log.Log_ID} className="py-2.5 flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">{log.Change_Type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      by {log.Changed_By}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.Description}</p>
                  <p className="text-[11px] text-slate-400 italic">Reason: {log.Reason}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-4">
                  {log.Changed_On}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

