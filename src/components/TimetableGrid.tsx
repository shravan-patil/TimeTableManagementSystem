'use client';

import React, { useState } from 'react';
import {
  Batch,
  Faculty,
  Room,
  Session,
  Subject,
  TimeSlot,
  ConflictItem,
  Timetable,
  DayOfWeek,
  TimetableStatus,
} from '../types/ttms';
import {
  Filter,
  AlertTriangle,
  Plus,
  Edit2,
  Printer,
  CheckCircle,
  Lock,
  Send,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface TimetableGridProps {
  timetable: Timetable;
  sessions: Session[];
  conflicts: ConflictItem[];
  batches: Batch[];
  faculty: Faculty[];
  rooms: Room[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  onEditSession: (session: Session) => void;
  onAddSessionAtSlot: (slotId: string, batchId: string) => void;
  onUpdateStatus: (newStatus: TimetableStatus, reason?: string) => void;
  onAutoResolveConflicts?: () => void;
}

type FilterMode = 'batch' | 'faculty' | 'room';

export default function TimetableGrid({
  timetable,
  sessions,
  conflicts,
  batches,
  faculty,
  rooms,
  subjects,
  timeSlots,
  onEditSession,
  onAddSessionAtSlot,
  onUpdateStatus,
  onAutoResolveConflicts,
}: TimetableGridProps) {
  // Filter states
  const [filterMode, setFilterMode] = useState<FilterMode>('batch');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    batches[0]?.Batch_ID || ''
  );
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    faculty[0]?.Faculty_ID || ''
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    rooms[0]?.Room_ID || ''
  );

  const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periods = [1, 2, 3, 4, 5, 6];

  // Lookup maps
  const facultyMap = new Map(faculty.map((f) => [f.Faculty_ID, f]));
  const roomMap = new Map(rooms.map((r) => [r.Room_ID, r]));
  const batchMap = new Map(batches.map((b) => [b.Batch_ID, b]));
  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s]));

  // Filter active sessions
  const filteredSessions = sessions.filter((s) => {
    if (filterMode === 'batch') return s.Batch_ID === selectedBatchId;
    if (filterMode === 'faculty') return s.Faculty_ID === selectedFacultyId;
    if (filterMode === 'room') return s.Room_ID === selectedRoomId;
    return true;
  });

  // Map of slotId -> sessions
  const slotSessionMap = new Map<string, Session[]>();
  filteredSessions.forEach((s) => {
    const list = slotSessionMap.get(s.Slot_ID) || [];
    list.push(s);
    slotSessionMap.set(s.Slot_ID, list);
  });

  // Get conflicts for a session
  const getSessionConflicts = (sessionId: string) => {
    return conflicts.filter((c) => c.sessionIds.includes(sessionId));
  };

  const getSlotById = (day: DayOfWeek, period: number) => {
    return timeSlots.find((s) => s.Day === day && s.Period_No === period);
  };

  const handlePrint = () => {
    window.print();
  };

  const subjectColorMap: Record<string, string> = {
    SUB_01: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    SUB_02: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    SUB_03: 'bg-teal-50 border-teal-200 text-teal-900',
    SUB_04: 'bg-sky-50 border-sky-200 text-sky-900',
    SUB_05: 'bg-blue-50 border-blue-200 text-blue-900',
    SUB_06: 'bg-purple-50 border-purple-200 text-purple-900',
    SUB_07: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
    SUB_08: 'bg-amber-50 border-amber-200 text-amber-900',
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 no-print">
        {/* Left Filter Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterMode('batch')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'batch'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Division
            </button>
            <button
              onClick={() => setFilterMode('faculty')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'faculty'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Faculty
            </button>
            <button
              onClick={() => setFilterMode('room')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'room'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Room
            </button>
          </div>

          {/* Specific Dropdown Filter */}
          {filterMode === 'batch' && (
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {batches.map((b) => (
                <option key={b.Batch_ID} value={b.Batch_ID}>
                  {b.Division} ({b.Strength} Students)
                </option>
              ))}
            </select>
          )}

          {filterMode === 'faculty' && (
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {faculty.map((f) => (
                <option key={f.Faculty_ID} value={f.Faculty_ID}>
                  {f.Faculty_Name} ({f.Department})
                </option>
              ))}
            </select>
          )}

          {filterMode === 'room' && (
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {rooms.map((r) => (
                <option key={r.Room_ID} value={r.Room_ID}>
                  {r.Room_No} • {r.Room_Type} (Cap: {r.Capacity})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
            title="Print or export PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Life Cycle State Actions */}
          {timetable.Status === 'Under Review' && (
            <button
              onClick={() => {
                if (conflicts.length > 0) {
                  alert(
                    `Cannot finalize timetable! There are ${conflicts.length} unresolved clashes. (SRS FR-7)`
                  );
                  return;
                }
                onUpdateStatus('Finalized', 'Coordinator approved conflict-free timetable');
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md shadow-purple-600/20 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Finalize Schedule (FR-7)</span>
            </button>
          )}

          {timetable.Status === 'Finalized' && (
            <button
              onClick={() =>
                onUpdateStatus(
                  'Published',
                  'Timetable published to departmental dashboard'
                )
              }
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Publish to Dashboard</span>
            </button>
          )}

          {timetable.Status === 'Published' && (
            <button
              onClick={() =>
                onUpdateStatus(
                  'Revised',
                  'Opened revision for faculty substitution or room rescheduling'
                )
              }
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Modify / Revise</span>
            </button>
          )}
        </div>
      </div>

      {/* Conflicts Bar if active */}
      {conflicts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-center justify-between no-print">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">
                {conflicts.length} Relational Clash(es) Flagged in Timetable (Process 3.0):
              </span>
              <span className="ml-1 text-slate-700">
                Click any highlighted red cell to edit faculty, room or slot.
              </span>
            </div>
          </div>
          {onAutoResolveConflicts && (
            <button
              onClick={onAutoResolveConflicts}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shrink-0 flex items-center space-x-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Resolve</span>
            </button>
          )}
        </div>
      )}

      {/* Main Timetable Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Printable Institution Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              VJTI Mumbai — Department of CE & IT • {timetable.Academic_Term}
            </h3>
            <p className="text-xs text-slate-500">
              Viewing:{' '}
              <strong className="text-indigo-700">
                {filterMode === 'batch'
                  ? batchMap.get(selectedBatchId)?.Division
                  : filterMode === 'faculty'
                  ? facultyMap.get(selectedFacultyId)?.Faculty_Name
                  : roomMap.get(selectedRoomId)?.Room_No}
              </strong>{' '}
              • Total Scheduled Hours: {filteredSessions.length}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            State: {timetable.Status} (v{timetable.Version_No})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <th className="p-3 w-28 text-center border-r border-slate-200 bg-slate-200/50">
                  Day / Time
                </th>
                <th className="p-3 text-center border-r border-slate-200">
                  Period 1<br />
                  <span className="text-[10px] text-slate-400 font-normal">09:00 - 10:00</span>
                </th>
                <th className="p-3 text-center border-r border-slate-200">
                  Period 2<br />
                  <span className="text-[10px] text-slate-400 font-normal">10:00 - 11:00</span>
                </th>
                <th className="p-3 text-center border-r border-slate-200">
                  Period 3<br />
                  <span className="text-[10px] text-slate-400 font-normal">11:15 - 12:15</span>
                </th>
                <th className="p-3 text-center border-r border-slate-200 bg-amber-50/50 text-amber-800">
                  Period 4<br />
                  <span className="text-[10px] text-amber-600 font-normal">12:15 - 13:15 / Lunch</span>
                </th>
                <th className="p-3 text-center border-r border-slate-200">
                  Period 5<br />
                  <span className="text-[10px] text-slate-400 font-normal">14:00 - 15:00</span>
                </th>
                <th className="p-3 text-center">
                  Period 6<br />
                  <span className="text-[10px] text-slate-400 font-normal">15:00 - 16:00</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {days.map((day) => {
                return (
                  <tr key={day} className="hover:bg-slate-50/60 transition-colors">
                    {/* Day Column */}
                    <td className="p-3 text-center font-bold text-slate-800 bg-slate-50 border-r border-slate-200">
                      {day}
                    </td>

                    {/* Periods 1 to 6 */}
                    {periods.map((period) => {
                      const slot = getSlotById(day, period);
                      const currentSessions = slot ? slotSessionMap.get(slot.Slot_ID) || [] : [];
                      const isLunchPeriod = period === 4;

                      return (
                        <td
                          key={period}
                          className={`p-2 border-r border-slate-200 align-top min-w-[170px] ${
                            isLunchPeriod ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          {currentSessions.length > 0 ? (
                            <div className="space-y-1.5">
                              {currentSessions.map((sess) => {
                                const sub = subjectMap.get(sess.Subject_ID);
                                const fac = facultyMap.get(sess.Faculty_ID);
                                const rm = roomMap.get(sess.Room_ID);
                                const bt = batchMap.get(sess.Batch_ID);
                                const sessConflicts = getSessionConflicts(sess.Session_ID);
                                const hasClash = sessConflicts.length > 0;

                                return (
                                  <div
                                    key={sess.Session_ID}
                                    onClick={() => onEditSession(sess)}
                                    className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-sm relative group hover:ring-2 hover:ring-indigo-400 ${
                                      hasClash
                                        ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/50 animate-pulse'
                                        : subjectColorMap[sess.Subject_ID] ||
                                          'bg-slate-50 border-slate-200 text-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-extrabold text-[12px] truncate max-w-[120px]">
                                        {sub?.Subject_Name || sess.Subject_ID}
                                      </span>
                                      <span
                                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          sess.Session_Type === 'Lab'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-indigo-600 text-white'
                                        }`}
                                      >
                                        {sess.Session_Type}
                                      </span>
                                    </div>

                                    <div className="mt-1.5 text-[11px] space-y-0.5 text-slate-600">
                                      {filterMode !== 'faculty' && (
                                        <p className="truncate font-medium">
                                          👤 {fac?.Faculty_Name || sess.Faculty_ID}
                                        </p>
                                      )}
                                      {filterMode !== 'room' && (
                                        <p className="truncate">
                                          🏛️ {rm?.Room_No || sess.Room_ID}
                                        </p>
                                      )}
                                      {filterMode !== 'batch' && (
                                        <p className="truncate font-semibold text-indigo-700">
                                          🎓 {bt?.Division || sess.Batch_ID}
                                        </p>
                                      )}
                                    </div>

                                    {/* Conflict Indicator */}
                                    {hasClash && (
                                      <div className="mt-2 text-[10px] font-bold text-rose-700 bg-rose-100 p-1 rounded flex items-center space-x-1">
                                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                                        <span className="truncate">
                                          {sessConflicts[0]?.title}
                                        </span>
                                      </div>
                                    )}

                                    {/* Hover Edit Action */}
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded shadow-sm">
                                      <Edit2 className="w-3 h-3 text-slate-600" />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            /* Empty Cell with Add Action */
                            <div className="h-full min-h-[70px] flex items-center justify-center group">
                              {slot && (
                                <button
                                  onClick={() =>
                                    onAddSessionAtSlot(
                                      slot.Slot_ID,
                                      selectedBatchId || batches[0].Batch_ID
                                    )
                                  }
                                  className="opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center space-x-1 text-[11px] font-semibold"
                                  title="Add class in this slot"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

