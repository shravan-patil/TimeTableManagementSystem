'use client';

import React, { useState } from 'react';
import {
  Faculty,
  Session,
  FacultyAvailability,
  TimeSlot,
  DayOfWeek,
  Subject,
} from '../types/ttms';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';

interface WorkloadManagerProps {
  faculty: Faculty[];
  sessions: Session[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  facultyAvailability: FacultyAvailability[];
  onToggleAvailability: (facultyId: string, slotId: string) => void;
}

export default function WorkloadManager({
  faculty,
  sessions,
  subjects,
  timeSlots,
  facultyAvailability,
  onToggleAvailability,
}: WorkloadManagerProps) {
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    faculty[0]?.Faculty_ID || ''
  );

  const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periods = [1, 2, 3, 4, 5, 6];

  // Calculate teaching load for each faculty
  const loadMap = new Map<string, number>();
  sessions.forEach((s) => {
    loadMap.set(s.Faculty_ID, (loadMap.get(s.Faculty_ID) || 0) + 1);
  });

  const selectedFaculty = faculty.find((f) => f.Faculty_ID === selectedFacultyId);

  // Check availability status for a slot
  const isAvailable = (facId: string, slotId: string) => {
    const record = facultyAvailability.find(
      (fa) => fa.Faculty_ID === facId && fa.Slot_ID === slotId
    );
    return record ? record.Is_Available : true; // Default true if not explicitly flagged
  };

  const getSlot = (day: DayOfWeek, period: number) => {
    return timeSlots.find((s) => s.Day === day && s.Period_No === period);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Process 4.0 • Faculty Workload & Availability (D3)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Department Teaching Load Balancing & Availability Grid
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitors running teaching hours against configured maximum load limits (FR-8) and
            manages faculty scheduling availability preferences.
          </p>
        </div>
      </div>

      {/* Faculty Workload Progress Bars (Department-Wide Load Summary) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Department-Wide Workload Summary (FR-8)
            </h3>
            <p className="text-xs text-slate-500">
              Assigned weekly hours compared against maximum load quota
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
            Pool: {faculty.length} Professors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {faculty.map((f) => {
            const assigned = loadMap.get(f.Faculty_ID) || 0;
            const max = f.Max_Weekly_Load;
            const percent = Math.min(Math.round((assigned / max) * 100), 100);
            const isOverloaded = assigned > max;

            return (
              <div
                key={f.Faculty_ID}
                onClick={() => setSelectedFacultyId(f.Faculty_ID)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedFacultyId === f.Faculty_ID
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{f.Faculty_Name}</h4>
                    <p className="text-[11px] text-slate-500">{f.Department}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-extrabold ${
                        isOverloaded ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {assigned} / {max} hrs
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      {isOverloaded ? 'LIMIT EXCEEDED' : `${percent}% allocated`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverloaded
                        ? 'bg-rose-500'
                        : percent > 85
                        ? 'bg-amber-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {isOverloaded && (
                  <div className="mt-2 text-[10px] font-bold text-rose-600 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Overloaded by {assigned - max} hours</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Faculty Availability Matrix */}
      {selectedFaculty && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Weekly Availability Matrix for {selectedFaculty.Faculty_Name}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click on any period slot to toggle available / unavailable state (saved to D3)
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Available</span>
              </span>
              <span className="flex items-center space-x-1.5 text-rose-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Marked Unavailable</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                  <th className="p-3 w-24 text-left border-r border-slate-200">Day</th>
                  {periods.map((p) => (
                    <th key={p} className="p-3 border-r border-slate-200">
                      Period {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {days.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800 text-left border-r border-slate-200 bg-slate-50/50">
                      {day}
                    </td>
                    {periods.map((period) => {
                      const slot = getSlot(day, period);
                      if (!slot) return <td key={period} className="p-2 border-r" />;

                      const avail = isAvailable(selectedFaculty.Faculty_ID, slot.Slot_ID);
                      const isAssigned = sessions.some(
                        (s) =>
                          s.Faculty_ID === selectedFaculty.Faculty_ID &&
                          s.Slot_ID === slot.Slot_ID
                      );

                      return (
                        <td key={period} className="p-2 border-r border-slate-100">
                          <button
                            onClick={() =>
                              onToggleAvailability(
                                selectedFaculty.Faculty_ID,
                                slot.Slot_ID
                              )
                            }
                            className={`w-full py-2.5 px-2 rounded-xl text-[11px] font-bold transition-all border ${
                              avail
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            <span className="block">{avail ? 'Available' : 'Unavailable'}</span>
                            {isAssigned && (
                              <span className="block text-[9px] text-indigo-700 font-extrabold mt-0.5">
                                [Class Assigned]
                              </span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

