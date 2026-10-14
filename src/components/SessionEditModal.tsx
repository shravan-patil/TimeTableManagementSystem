'use client';

import React, { useState, useEffect } from 'react';
import {
  Session,
  Subject,
  Faculty,
  Room,
  Batch,
  TimeSlot,
  FacultyAvailability,
  SessionType,
} from '../types/ttms';
import { validateSessionEdit, MasterDataContext } from '../lib/conflictDetector';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Save,
  Clock,
  MapPin,
  User,
  BookOpen,
} from 'lucide-react';

interface SessionEditModalProps {
  session: Session | null;
  allSessions: Session[];
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  batches: Batch[];
  timeSlots: TimeSlot[];
  facultyAvailability: FacultyAvailability[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSession: Session, changeReason: string) => void;
  onDelete?: (sessionId: string, reason: string) => void;
}

export default function SessionEditModal({
  session,
  allSessions,
  subjects,
  faculty,
  rooms,
  batches,
  timeSlots,
  facultyAvailability,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: SessionEditModalProps) {
  const [formData, setFormData] = useState<Session | null>(null);
  const [changeReason, setChangeReason] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    messages: string[];
  }>({ isValid: true, messages: [] });

  useEffect(() => {
    if (session) {
      setFormData({ ...session });
      setChangeReason('');
    }
  }, [session]);

  // Real-time conflict validation whenever formData changes (FR-6)
  useEffect(() => {
    if (!formData) return;

    const context: MasterDataContext = {
      faculty,
      rooms,
      batches,
      subjects,
      timeSlots,
      facultyAvailability,
    };

    const res = validateSessionEdit(formData, allSessions, context);
    setValidationResult(res);
  }, [formData, allSessions, faculty, rooms, batches, subjects, timeSlots, facultyAvailability]);

  if (!isOpen || !formData) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeReason.trim()) {
      alert('Please enter a justification/reason for the audit log (SRS FR-13).');
      return;
    }
    onSave(formData, changeReason);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this session from the schedule?')) {
      const reason = prompt('Enter audit reason for removal:', 'Curriculum adjustment');
      if (reason && onDelete) {
        onDelete(formData.Session_ID, reason);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
              Process 3.0 • Manual Timetable Adjustment
            </span>
            <h3 className="text-base font-bold mt-0.5">Edit Scheduled Session</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Conflict Live Warning Alert */}
          {!validationResult.isValid && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-800">
              <div className="flex items-center space-x-1.5 font-bold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Instant Conflict Detected (FR-6):</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-rose-700">
                {validationResult.messages.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.isValid && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Proposed changes are completely conflict-free.</span>
            </div>
          )}

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Subject</span>
            </label>
            <select
              value={formData.Subject_ID}
              onChange={(e) =>
                setFormData({ ...formData, Subject_ID: e.target.value })
              }
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.Subject_ID} value={sub.Subject_ID}>
                  {sub.Subject_Name} ({sub.Subject_Type})
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>Assigned Faculty Member</span>
            </label>
            <select
              value={formData.Faculty_ID}
              onChange={(e) =>
                setFormData({ ...formData, Faculty_ID: e.target.value })
              }
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {faculty.map((f) => (
                <option key={f.Faculty_ID} value={f.Faculty_ID}>
                  {f.Faculty_Name} (Max Load: {f.Max_Weekly_Load}h)
                </option>
              ))}
            </select>
          </div>

          {/* Room & Session Type Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Room / Lab</span>
              </label>
              <select
                value={formData.Room_ID}
                onChange={(e) =>
                  setFormData({ ...formData, Room_ID: e.target.value })
                }
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {rooms.map((r) => (
                  <option key={r.Room_ID} value={r.Room_ID}>
                    {r.Room_No} ({r.Room_Type}, Cap: {r.Capacity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Session Type
              </label>
              <select
                value={formData.Session_Type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    Session_Type: e.target.value as SessionType,
                  })
                }
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Lecture">Lecture (Theory)</option>
                <option value="Lab">Lab (Practical)</option>
              </select>
            </div>
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Time Slot (Day & Period)</span>
            </label>
            <select
              value={formData.Slot_ID}
              onChange={(e) =>
                setFormData({ ...formData, Slot_ID: e.target.value })
              }
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
            >
              {timeSlots.map((ts) => (
                <option key={ts.Slot_ID} value={ts.Slot_ID}>
                  {ts.Day} • Period {ts.Period_No} ({ts.Start_Time} - {ts.End_Time})
                </option>
              ))}
            </select>
          </div>

          {/* Justification / Change Log Reason (SRS FR-13) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Reason / Modification Note <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g. Relocated to LH-101 due to projector issue or faculty swap"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Logged to Change_Log audit trail with timestamp and user ID.
            </p>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 text-xs font-bold rounded-xl flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save & Log Change</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

