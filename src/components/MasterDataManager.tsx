'use client';

import React, { useState } from 'react';
import {
  Faculty,
  Subject,
  Batch,
  Room,
  TimeSlot,
  FacultySubject,
  RoomType,
  SubjectType,
  DayOfWeek,
} from '../types/ttms';
import {
  Database,
  Plus,
  Trash2,
  Edit3,
  Search,
  BookOpen,
  Users,
  GraduationCap,
  Building,
  Clock,
  Link2,
} from 'lucide-react';

interface MasterDataManagerProps {
  faculty: Faculty[];
  subjects: Subject[];
  batches: Batch[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  facultySubjects: FacultySubject[];
  onAddFaculty: (f: Faculty) => void;
  onDeleteFaculty: (id: string) => void;
  onAddSubject: (s: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onAddRoom: (r: Room) => void;
  onDeleteRoom: (id: string) => void;
  onAddBatch: (b: Batch) => void;
  onDeleteBatch: (id: string) => void;
}

type MasterSubTab = 'faculty' | 'subjects' | 'batches' | 'rooms' | 'slots' | 'eligibility';

export default function MasterDataManager({
  faculty,
  subjects,
  batches,
  rooms,
  timeSlots,
  facultySubjects,
  onAddFaculty,
  onDeleteFaculty,
  onAddSubject,
  onDeleteSubject,
  onAddRoom,
  onDeleteRoom,
  onAddBatch,
  onDeleteBatch,
}: MasterDataManagerProps) {
  const [subTab, setSubTab] = useState<MasterSubTab>('faculty');
  const [search, setSearch] = useState('');

  // Modals for adding
  const [showAddModal, setShowAddModal] = useState(false);

  // New Faculty State
  const [newFaculty, setNewFaculty] = useState<Faculty>({
    Faculty_ID: `FAC_${String(faculty.length + 1).padStart(2, '0')}`,
    Faculty_Name: '',
    Department: 'Computer Engineering & IT',
    Max_Weekly_Load: 14,
    Email: '',
  });

  // New Subject State
  const [newSubject, setNewSubject] = useState<Subject>({
    Subject_ID: `SUB_${String(subjects.length + 1).padStart(2, '0')}`,
    Subject_Name: '',
    Subject_Type: 'Theory',
    Hours_Per_Week: 3,
    Credits: 3,
  });

  // New Room State
  const [newRoom, setNewRoom] = useState<Room>({
    Room_ID: `RM_${String(rooms.length + 1).padStart(2, '0')}`,
    Room_No: '',
    Room_Type: 'Lecture Hall',
    Capacity: 75,
  });

  // New Batch State
  const [newBatch, setNewBatch] = useState<Batch>({
    Batch_ID: `BAT_${String(batches.length + 1).padStart(2, '0')}`,
    Division: '',
    Year: 3,
    Strength: 70,
    Department: 'Information Technology',
  });

  const facultyMap = new Map(faculty.map((f) => [f.Faculty_ID, f.Faculty_Name]));
  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s.Subject_Name]));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subTab === 'faculty') {
      if (!newFaculty.Faculty_Name) return;
      onAddFaculty(newFaculty);
      setNewFaculty({
        Faculty_ID: `FAC_${String(faculty.length + 2).padStart(2, '0')}`,
        Faculty_Name: '',
        Department: 'Computer Engineering & IT',
        Max_Weekly_Load: 14,
        Email: '',
      });
    } else if (subTab === 'subjects') {
      if (!newSubject.Subject_Name) return;
      onAddSubject(newSubject);
      setNewSubject({
        Subject_ID: `SUB_${String(subjects.length + 2).padStart(2, '0')}`,
        Subject_Name: '',
        Subject_Type: 'Theory',
        Hours_Per_Week: 3,
        Credits: 3,
      });
    } else if (subTab === 'rooms') {
      if (!newRoom.Room_No) return;
      onAddRoom(newRoom);
      setNewRoom({
        Room_ID: `RM_${String(rooms.length + 2).padStart(2, '0')}`,
        Room_No: '',
        Room_Type: 'Lecture Hall',
        Capacity: 75,
      });
    } else if (subTab === 'batches') {
      if (!newBatch.Division) return;
      onAddBatch(newBatch);
      setNewBatch({
        Batch_ID: `BAT_${String(batches.length + 2).padStart(2, '0')}`,
        Division: '',
        Year: 3,
        Strength: 70,
        Department: 'Information Technology',
      });
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Process 1.0 • Master Data Store (D1)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Department Master Data Repository
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure foundational curriculum entities, faculty quotas, batch strengths, room
            capacities, and course eligibility according to the institutional relational schema.
          </p>
        </div>

        {subTab !== 'slots' && subTab !== 'eligibility' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New {subTab.slice(0, 1).toUpperCase() + subTab.slice(1, -1)}</span>
          </button>
        )}
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setSubTab('faculty'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            subTab === 'faculty'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty ({faculty.length})</span>
        </button>

        <button
          onClick={() => { setSubTab('subjects'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            subTab === 'subjects'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects ({subjects.length})</span>
        </button>

        <button
          onClick={() => { setSubTab('batches'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            subTab === 'batches'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Divisions / Batches ({batches.length})</span>
        </button>

        <button
          onClick={() => { setSubTab('rooms'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            subTab === 'rooms'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Rooms & Labs ({rooms.length})</span>
        </button>

        <button
          onClick={() => { setSubTab('slots'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            subTab === 'slots'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Time Slots ({timeSlots.length})</span>
        </button>

        <button
          onClick={() => { setSubTab('eligibility'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            subTab === 'eligibility'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Faculty Eligibility (M:N)</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center space-x-2 shadow-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${subTab} by name, ID or code...`}
          className="text-xs w-full outline-none bg-transparent"
        />
      </div>

      {/* Main Table for Active SubTab */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* FACULTY TABLE */}
        {subTab === 'faculty' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Faculty ID</th>
                <th className="p-3.5">Faculty Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Max Weekly Load</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {faculty
                .filter(
                  (f) =>
                    f.Faculty_Name.toLowerCase().includes(search.toLowerCase()) ||
                    f.Faculty_ID.toLowerCase().includes(search.toLowerCase())
                )
                .map((f) => (
                  <tr key={f.Faculty_ID} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{f.Faculty_ID}</td>
                    <td className="p-3.5 font-bold text-slate-900">{f.Faculty_Name}</td>
                    <td className="p-3.5 text-slate-600">{f.Department}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                        {f.Max_Weekly_Load} hrs/week
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{f.Email}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onDeleteFaculty(f.Faculty_ID)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Faculty"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* SUBJECTS TABLE */}
        {subTab === 'subjects' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Subject ID</th>
                <th className="p-3.5">Subject Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Hours / Week</th>
                <th className="p-3.5">Credits</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects
                .filter(
                  (s) =>
                    s.Subject_Name.toLowerCase().includes(search.toLowerCase()) ||
                    s.Subject_ID.toLowerCase().includes(search.toLowerCase())
                )
                .map((s) => (
                  <tr key={s.Subject_ID} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{s.Subject_ID}</td>
                    <td className="p-3.5 font-bold text-slate-900">{s.Subject_Name}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          s.Subject_Type === 'Practical'
                            ? 'bg-blue-100 text-blue-800'
                            : s.Subject_Type === 'Elective'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {s.Subject_Type}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{s.Hours_Per_Week} hrs</td>
                    <td className="p-3.5 font-bold text-slate-700">{s.Credits}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onDeleteSubject(s.Subject_ID)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* BATCHES TABLE */}
        {subTab === 'batches' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Batch ID</th>
                <th className="p-3.5">Division Name</th>
                <th className="p-3.5">Academic Year</th>
                <th className="p-3.5">Student Strength</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches
                .filter((b) => b.Division.toLowerCase().includes(search.toLowerCase()))
                .map((b) => (
                  <tr key={b.Batch_ID} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{b.Batch_ID}</td>
                    <td className="p-3.5 font-bold text-slate-900">{b.Division}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">Year {b.Year}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                        {b.Strength} Students
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{b.Department}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onDeleteBatch(b.Batch_ID)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* ROOMS TABLE */}
        {subTab === 'rooms' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Room ID</th>
                <th className="p-3.5">Room Number / Lab Name</th>
                <th className="p-3.5">Room Type</th>
                <th className="p-3.5">Seating Capacity</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms
                .filter((r) => r.Room_No.toLowerCase().includes(search.toLowerCase()))
                .map((r) => (
                  <tr key={r.Room_ID} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{r.Room_ID}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.Room_No}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          r.Room_Type === 'Laboratory'
                            ? 'bg-blue-100 text-blue-800'
                            : r.Room_Type === 'Seminar Room'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {r.Room_Type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{r.Capacity} seats</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onDeleteRoom(r.Room_ID)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* TIME SLOTS TABLE */}
        {subTab === 'slots' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-3.5">Slot ID</th>
                <th className="p-3.5">Day</th>
                <th className="p-3.5">Period No</th>
                <th className="p-3.5">Start Time</th>
                <th className="p-3.5">End Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeSlots
                .filter(
                  (s) =>
                    s.Day.toLowerCase().includes(search.toLowerCase()) ||
                    s.Slot_ID.toLowerCase().includes(search.toLowerCase())
                )
                .map((s) => (
                  <tr key={s.Slot_ID} className="hover:bg-slate-50/60">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">{s.Slot_ID}</td>
                    <td className="p-3.5 font-bold text-slate-900">{s.Day}</td>
                    <td className="p-3.5 font-semibold text-slate-700">Period {s.Period_No}</td>
                    <td className="p-3.5 font-mono text-slate-600">{s.Start_Time}</td>
                    <td className="p-3.5 font-mono text-slate-600">{s.End_Time}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* FACULTY SUBJECT ELIGIBILITY MAPPING TABLE */}
        {subTab === 'eligibility' && (
          <div className="p-5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Faculty–Subject Qualified Teaching Registry (Faculty_Subject Associative Table)
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Used by the Constraint Scheduler (Process 2.0) and Smart Substitution Engine
              (Process 5.0) to recommend competent faculty.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {facultySubjects.map((fs, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {facultyMap.get(fs.Faculty_ID) || fs.Faculty_ID}
                    </p>
                    <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                      → {subjectMap.get(fs.Subject_ID) || fs.Subject_ID}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                    Eligible
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Entity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Add New {subTab.slice(0, 1).toUpperCase() + subTab.slice(1, -1)}
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              {subTab === 'faculty' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Faculty ID</label>
                    <input
                      type="text"
                      disabled
                      value={newFaculty.Faculty_ID}
                      className="w-full bg-slate-100 border rounded-lg p-2 font-mono text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Faculty Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. R. S. Kulkarni"
                      value={newFaculty.Faculty_Name}
                      onChange={(e) =>
                        setNewFaculty({ ...newFaculty, Faculty_Name: e.target.value })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Max Weekly Load</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={24}
                      value={newFaculty.Max_Weekly_Load}
                      onChange={(e) =>
                        setNewFaculty({ ...newFaculty, Max_Weekly_Load: Number(e.target.value) })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="email@ceit.vjti.ac.in"
                      value={newFaculty.Email}
                      onChange={(e) =>
                        setNewFaculty({ ...newFaculty, Email: e.target.value })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </>
              )}

              {subTab === 'subjects' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Computing"
                      value={newSubject.Subject_Name}
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, Subject_Name: e.target.value })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subject Type</label>
                    <select
                      value={newSubject.Subject_Type}
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, Subject_Type: e.target.value as SubjectType })
                      }
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical (Lab)</option>
                      <option value="Elective">Elective</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hours / Week</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={6}
                      value={newSubject.Hours_Per_Week}
                      onChange={(e) =>
                        setNewSubject({ ...newSubject, Hours_Per_Week: Number(e.target.value) })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </>
              )}

              {subTab === 'rooms' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Room No / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LH-202 (IT Block)"
                      value={newRoom.Room_No}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, Room_No: e.target.value })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Room Type</label>
                    <select
                      value={newRoom.Room_Type}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, Room_Type: e.target.value as RoomType })
                      }
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="Lecture Hall">Lecture Hall</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Seminar Room">Seminar Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Capacity</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={200}
                      value={newRoom.Capacity}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, Capacity: Number(e.target.value) })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </>
              )}

              {subTab === 'batches' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Division Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Final Year IT - Div A"
                      value={newBatch.Division}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, Division: e.target.value })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Strength</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={120}
                      value={newBatch.Strength}
                      onChange={(e) =>
                        setNewBatch({ ...newBatch, Strength: Number(e.target.value) })
                      }
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

