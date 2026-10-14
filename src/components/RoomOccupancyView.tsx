'use client';

import React, { useState } from 'react';
import { Room, Session, TimeSlot, Subject, Batch, Faculty, DayOfWeek } from '../types/ttms';
import { Building2, Calendar, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface RoomOccupancyViewProps {
  rooms: Room[];
  sessions: Session[];
  timeSlots: TimeSlot[];
  subjects: Subject[];
  batches: Batch[];
  faculty: Faculty[];
}

export default function RoomOccupancyView({
  rooms,
  sessions,
  timeSlots,
  subjects,
  batches,
  faculty,
}: RoomOccupancyViewProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Mon');
  const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periods = [1, 2, 3, 4, 5, 6];

  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s]));
  const batchMap = new Map(batches.map((b) => [b.Batch_ID, b]));
  const facultyMap = new Map(faculty.map((f) => [f.Faculty_ID, f]));

  // Find slot for day and period
  const getSlot = (day: DayOfWeek, p: number) => {
    return timeSlots.find((s) => s.Day === day && s.Period_No === p);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Requirement FR-9 • Real-Time Room Occupancy</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Classroom & Laboratory Spatial Utilization Heatmap
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Display live room allocations across Lecture Halls, Computing Labs, and Seminar Rooms
            to prevent double-booking of shared institute facilities.
          </p>
        </div>

        {/* Day Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDay === d
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Room vs Period Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Room Allocations for {selectedDay}
          </span>
          <span className="text-xs text-slate-500">
            {rooms.length} Total Facilities Tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                <th className="p-3 w-48 border-r border-slate-200 bg-slate-200/40">
                  Facility / Room
                </th>
                {periods.map((p) => (
                  <th key={p} className="p-3 border-r border-slate-200 text-center">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rooms.map((room) => {
                return (
                  <tr key={room.Room_ID} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                      <div>{room.Room_No}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {room.Room_Type} • Cap: {room.Capacity}
                      </div>
                    </td>

                    {periods.map((period) => {
                      const slot = getSlot(selectedDay, period);
                      const matchingSessions = slot
                        ? sessions.filter(
                            (s) => s.Room_ID === room.Room_ID && s.Slot_ID === slot.Slot_ID
                          )
                        : [];

                      const isOccupied = matchingSessions.length > 0;
                      const isDoubleBooked = matchingSessions.length > 1;

                      return (
                        <td
                          key={period}
                          className="p-2 border-r border-slate-200 align-top min-w-[140px]"
                        >
                          {isDoubleBooked ? (
                            <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-[10px] font-bold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 mb-1" />
                              <p>DOUBLE-BOOKED ({matchingSessions.length} classes)</p>
                            </div>
                          ) : isOccupied ? (
                            <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-[11px] space-y-0.5">
                              <p className="font-extrabold text-indigo-900 truncate">
                                {subjectMap.get(matchingSessions[0].Subject_ID)?.Subject_Name}
                              </p>
                              <p className="text-[10px] text-indigo-700 font-semibold truncate">
                                {batchMap.get(matchingSessions[0].Batch_ID)?.Division}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {facultyMap.get(matchingSessions[0].Faculty_ID)?.Faculty_Name}
                              </p>
                            </div>
                          ) : (
                            <div className="h-14 flex items-center justify-center text-[10px] font-semibold text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                              Vacant
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

