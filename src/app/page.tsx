'use client';

import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Sidebar, { NavTab } from '../components/Sidebar';
import DashboardOverview from '../components/DashboardOverview';
import TimetableGenerator from '../components/TimetableGenerator';
import TimetableGrid from '../components/TimetableGrid';
import MasterDataManager from '../components/MasterDataManager';
import WorkloadManager from '../components/WorkloadManager';
import LeaveSubstitutionManager from '../components/LeaveSubstitutionManager';
import RoomOccupancyView from '../components/RoomOccupancyView';
import ChangeLogView from '../components/ChangeLogView';
import SessionEditModal from '../components/SessionEditModal';
import NotificationModal from '../components/NotificationModal';

import {
  initialTimetable,
  initialSessions,
  initialFaculty,
  initialSubjects,
  initialBatches,
  initialRooms,
  initialTimeSlots,
  initialFacultySubjects,
  initialFacultyAvailability,
  initialLeaveRequests,
  initialSubstitutions,
  initialChangeLogs,
  initialNotifications,
} from '../data/dummyData';

import {
  Session,
  Timetable,
  Faculty,
  Subject,
  Batch,
  Room,
  TimeSlot,
  FacultySubject,
  FacultyAvailability,
  LeaveRequest,
  Substitution,
  ChangeLog,
  Notification,
  TimetableStatus,
} from '../types/ttms';

import { detectAllConflicts, MasterDataContext } from '../lib/conflictDetector';
import { SchedulingResult } from '../lib/schedulingAlgorithm';

export default function CoordinatorPortal() {
  // Primary TTMS State
  const [timetable, setTimetable] = useState<Timetable>(initialTimetable);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [faculty, setFaculty] = useState<Faculty[]>(initialFaculty);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [batches, setBatches] = useState<Batch[]>(initialBatches);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);
  const [facultySubjects, setFacultySubjects] = useState<FacultySubject[]>(initialFacultySubjects);
  const [facultyAvailability, setFacultyAvailability] = useState<FacultyAvailability[]>(
    initialFacultyAvailability
  );
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [substitutions, setSubstitutions] = useState<Substitution[]>(initialSubstitutions);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>(initialChangeLogs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // UI Navigation & Modals State
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  // Master Data Context for validation
  const masterDataContext: MasterDataContext = useMemo(
    () => ({
      faculty,
      rooms,
      batches,
      subjects,
      timeSlots,
      facultyAvailability,
    }),
    [faculty, rooms, batches, subjects, timeSlots, facultyAvailability]
  );

  // Real-Time Conflict Detection (Process 3.0 & Integrity Constraints)
  const conflicts = useMemo(
    () => detectAllConflicts(sessions, masterDataContext),
    [sessions, masterDataContext]
  );

  // Helper to format timestamp
  const getTimestamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  };

  // State Transition Action (Fig. 5 State Machine)
  const handleUpdateStatus = (newStatus: TimetableStatus, reason?: string) => {
    // FR-7: Prevent finalization if unresolved conflicts exist
    if (newStatus === 'Finalized') {
      const criticals = conflicts.filter((c) => c.severity === 'critical');
      if (criticals.length > 0) {
        alert(
          `Cannot finalize timetable! There are ${criticals.length} unresolved critical conflicts. (SRS FR-7)`
        );
        return;
      }
    }

    const isPublished = newStatus === 'Published';
    const updatedTimetable: Timetable = {
      ...timetable,
      Status: newStatus,
      Published_On: isPublished ? getTimestamp().split(' ')[0] : timetable.Published_On,
      Version_No: newStatus === 'Revised' ? timetable.Version_No + 1 : timetable.Version_No,
    };

    setTimetable(updatedTimetable);

    // Audit Logging (D5)
    const log: ChangeLog = {
      Log_ID: `LOG_${String(changeLogs.length + 1).padStart(3, '0')}`,
      Timetable_ID: timetable.Timetable_ID,
      Change_Type: isPublished ? 'Substitution' : 'Manual Edit',
      Description: `Timetable status transitioned from "${timetable.Status}" to "${newStatus}"`,
      Reason: reason || 'Coordinator life-cycle state transition',
      Changed_By: 'Dr. V. M. Phalle (Coordinator)',
      Changed_On: getTimestamp(),
    };
    setChangeLogs([log, ...changeLogs]);

    // Send Broadcast Notification (D6 / FR-15)
    if (isPublished) {
      const notif: Notification = {
        Notif_ID: `NOTIF_${String(notifications.length + 1).padStart(3, '0')}`,
        Log_ID: log.Log_ID,
        Recipient_ID: 'ALL_CAMPUS',
        Message: `Official Timetable for ${timetable.Academic_Term} (v${updatedTimetable.Version_No}) has been PUBLISHED to all faculty and students!`,
        Sent_On: getTimestamp(),
        Is_Read: false,
      };
      setNotifications([notif, ...notifications]);
    }
  };

  // Handle Timetable Generation Commit (Process 2.0)
  const handleApplyGeneratedTimetable = (
    newSessions: Session[],
    summary: SchedulingResult
  ) => {
    setSessions(newSessions);
    setTimetable({
      ...timetable,
      Status: 'Draft Generated',
      Version_No: timetable.Version_No + 1,
    });

    const log: ChangeLog = {
      Log_ID: `LOG_${String(changeLogs.length + 1).padStart(3, '0')}`,
      Timetable_ID: timetable.Timetable_ID,
      Change_Type: 'Generated',
      Description: `Generated ${newSessions.length} conflict-free sessions in ${summary.executionTimeMs}ms`,
      Reason: 'Constraint-Based Scheduling Engine Execution',
      Changed_By: 'Dr. V. M. Phalle',
      Changed_On: getTimestamp(),
    };
    setChangeLogs([log, ...changeLogs]);

    const notif: Notification = {
      Notif_ID: `NOTIF_${String(notifications.length + 1).padStart(3, '0')}`,
      Log_ID: log.Log_ID,
      Recipient_ID: 'COMMITTEE',
      Message: `New Draft Timetable generated with ${newSessions.length} sessions. Ready for committee review.`,
      Sent_On: getTimestamp(),
      Is_Read: false,
    };
    setNotifications([notif, ...notifications]);

    setActiveTab('grid');
  };

  // Manual Session Edit Save (Process 3.0 / FR-6, FR-13)
  const handleSaveEditedSession = (updatedSession: Session, changeReason: string) => {
    const isNew = !sessions.some((s) => s.Session_ID === updatedSession.Session_ID);
    const oldSession = sessions.find((s) => s.Session_ID === updatedSession.Session_ID);

    if (isNew) {
      setSessions([...sessions, updatedSession]);
    } else {
      setSessions(
        sessions.map((s) => (s.Session_ID === updatedSession.Session_ID ? updatedSession : s))
      );
    }

    // Determine change description
    let changeDesc = `Session ${updatedSession.Session_ID} added/modified`;
    let changeType: ChangeLog['Change_Type'] = 'Manual Edit';
    if (oldSession) {
      if (oldSession.Room_ID !== updatedSession.Room_ID) {
        changeType = 'Room change';
        changeDesc = `Room changed from ${oldSession.Room_ID} to ${updatedSession.Room_ID}`;
      } else if (oldSession.Slot_ID !== updatedSession.Slot_ID) {
        changeType = 'Reschedule';
        changeDesc = `Rescheduled from slot ${oldSession.Slot_ID} to ${updatedSession.Slot_ID}`;
      } else if (oldSession.Faculty_ID !== updatedSession.Faculty_ID) {
        changeType = 'Substitution';
        changeDesc = `Faculty changed from ${oldSession.Faculty_ID} to ${updatedSession.Faculty_ID}`;
      }
    }

    // Audit Log Entry
    const log: ChangeLog = {
      Log_ID: `LOG_${String(changeLogs.length + 1).padStart(3, '0')}`,
      Timetable_ID: timetable.Timetable_ID,
      Change_Type: changeType,
      Description: changeDesc,
      Reason: changeReason,
      Changed_By: 'Dr. V. M. Phalle',
      Changed_On: getTimestamp(),
    };
    setChangeLogs([log, ...changeLogs]);

    // If timetable is published, notify affected students & teachers (FR-15)
    if (timetable.Status === 'Published' || timetable.Status === 'Revised') {
      const notif: Notification = {
        Notif_ID: `NOTIF_${String(notifications.length + 1).padStart(3, '0')}`,
        Log_ID: log.Log_ID,
        Recipient_ID: updatedSession.Batch_ID,
        Message: `Timetable Alert: ${changeDesc}. Reason: ${changeReason}`,
        Sent_On: getTimestamp(),
        Is_Read: false,
      };
      setNotifications([notif, ...notifications]);
    }

    setIsEditModalOpen(false);
    setEditingSession(null);
  };

  const handleDeleteSession = (sessionId: string, reason: string) => {
    setSessions(sessions.filter((s) => s.Session_ID !== sessionId));
    const log: ChangeLog = {
      Log_ID: `LOG_${String(changeLogs.length + 1).padStart(3, '0')}`,
      Timetable_ID: timetable.Timetable_ID,
      Change_Type: 'Manual Edit',
      Description: `Session ${sessionId} removed from timetable`,
      Reason: reason,
      Changed_By: 'Dr. V. M. Phalle',
      Changed_On: getTimestamp(),
    };
    setChangeLogs([log, ...changeLogs]);
    setIsEditModalOpen(false);
    setEditingSession(null);
  };

  const handleOpenAddSessionAtSlot = (slotId: string, batchId: string) => {
    const newSess: Session = {
      Session_ID: `SES_MAN_${String(sessions.length + 1).padStart(3, '0')}`,
      Timetable_ID: timetable.Timetable_ID,
      Subject_ID: subjects[0]?.Subject_ID || 'SUB_01',
      Faculty_ID: faculty[0]?.Faculty_ID || 'FAC_01',
      Batch_ID: batchId,
      Room_ID: rooms[0]?.Room_ID || 'RM_01',
      Slot_ID: slotId,
      Session_Type: 'Lecture',
    };
    setEditingSession(newSess);
    setIsEditModalOpen(true);
  };

  // Process 5.0: Confirm Substitution
  const handleConfirmSubstitution = (
    leaveId: string,
    sessionId: string,
    substituteFacultyId: string,
    subDate: string,
    reason: string
  ) => {
    // 1. Update session's teacher
    setSessions(
      sessions.map((s) =>
        s.Session_ID === sessionId ? { ...s, Faculty_ID: substituteFacultyId } : s
      )
    );

    // 2. Add to Substitution table (D4)
    const subRecord: Substitution = {
      Sub_ID: `SUB_REC_${String(substitutions.length + 1).padStart(3, '0')}`,
      Leave_ID: leaveId,
      Session_ID: sessionId,
      Substitute_Faculty_ID: substituteFacultyId,
      Sub_Date: subDate,
      Action: 'Substituted',
      Status: 'Confirmed',
    };
    setSubstitutions([subRecord, ...substitutions]);

    // 3. Mark Leave Request as Processed
    setLeaveRequests(
      leaveRequests.map((l) => (l.Leave_ID === leaveId ? { ...l, Status: 'Processed' } : l))
    );

    // 4. Write to Change Log (D5)
    const log: ChangeLog = {
      Log_ID: `LOG_${String(changeLogs.length + 1).padStart(3, '0')}`,
      Timetable_ID: timetable.Timetable_ID,
      Change_Type: 'Substitution',
      Description: `Substitute ${substituteFacultyId} assigned for session ${sessionId} on ${subDate}`,
      Reason: reason,
      Changed_By: 'Dr. V. M. Phalle',
      Changed_On: getTimestamp(),
    };
    setChangeLogs([log, ...changeLogs]);

    // 5. Send Notification (D6 / FR-15)
    const notif: Notification = {
      Notif_ID: `NOTIF_${String(notifications.length + 1).padStart(3, '0')}`,
      Log_ID: log.Log_ID,
      Recipient_ID: substituteFacultyId,
      Message: `Substitution Notice: You have been assigned to cover a session on ${subDate}. Reason: ${reason}`,
      Sent_On: getTimestamp(),
      Is_Read: false,
    };
    setNotifications([notif, ...notifications]);

    alert('Substitute successfully confirmed! Session updated, logged to audit trail, and notification dispatched.');
  };

  // Toggle faculty availability (Process 4.0 / D3)
  const handleToggleAvailability = (facultyId: string, slotId: string) => {
    const existingIndex = facultyAvailability.findIndex(
      (fa) => fa.Faculty_ID === facultyId && fa.Slot_ID === slotId
    );

    if (existingIndex >= 0) {
      const current = facultyAvailability[existingIndex];
      const updated = [...facultyAvailability];
      updated[existingIndex] = { ...current, Is_Available: !current.Is_Available };
      setFacultyAvailability(updated);
    } else {
      // Was implicitly available, mark false
      setFacultyAvailability([
        ...facultyAvailability,
        { Faculty_ID: facultyId, Slot_ID: slotId, Is_Available: false },
      ]);
    }
  };

  // Master Data Add/Delete handlers
  const handleAddFaculty = (f: Faculty) => setFaculty([...faculty, f]);
  const handleDeleteFaculty = (id: string) =>
    setFaculty(faculty.filter((f) => f.Faculty_ID !== id));

  const handleAddSubject = (s: Subject) => setSubjects([...subjects, s]);
  const handleDeleteSubject = (id: string) =>
    setSubjects(subjects.filter((s) => s.Subject_ID !== id));

  const handleAddRoom = (r: Room) => setRooms([...rooms, r]);
  const handleDeleteRoom = (id: string) => setRooms(rooms.filter((r) => r.Room_ID !== id));

  const handleAddBatch = (b: Batch) => setBatches([...batches, b]);
  const handleDeleteBatch = (id: string) => setBatches(batches.filter((b) => b.Batch_ID !== id));

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 font-sans">
      {/* Header */}
      <Header
        timetable={timetable}
        conflicts={conflicts}
        notifications={notifications}
        onOpenNotifications={() => setShowNotificationModal(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          conflictCount={conflicts.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-5rem)]">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <DashboardOverview
                timetable={timetable}
                sessions={sessions}
                conflicts={conflicts}
                faculty={faculty}
                rooms={rooms}
                batches={batches}
                leaveRequests={leaveRequests}
                changeLogs={changeLogs}
                onNavigate={setActiveTab}
                onUpdateStatus={handleUpdateStatus}
              />
            )}

            {activeTab === 'generator' && (
              <TimetableGenerator
                timetable={timetable}
                batches={batches}
                subjects={subjects}
                faculty={faculty}
                facultySubjects={facultySubjects}
                rooms={rooms}
                timeSlots={timeSlots}
                facultyAvailability={facultyAvailability}
                onApplyGeneratedTimetable={handleApplyGeneratedTimetable}
              />
            )}

            {activeTab === 'grid' && (
              <TimetableGrid
                timetable={timetable}
                sessions={sessions}
                conflicts={conflicts}
                batches={batches}
                faculty={faculty}
                rooms={rooms}
                subjects={subjects}
                timeSlots={timeSlots}
                onEditSession={(sess) => {
                  setEditingSession(sess);
                  setIsEditModalOpen(true);
                }}
                onAddSessionAtSlot={handleOpenAddSessionAtSlot}
                onUpdateStatus={handleUpdateStatus}
                onAutoResolveConflicts={() => setActiveTab('generator')}
              />
            )}

            {activeTab === 'master' && (
              <MasterDataManager
                faculty={faculty}
                subjects={subjects}
                batches={batches}
                rooms={rooms}
                timeSlots={timeSlots}
                facultySubjects={facultySubjects}
                onAddFaculty={handleAddFaculty}
                onDeleteFaculty={handleDeleteFaculty}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onAddRoom={handleAddRoom}
                onDeleteRoom={handleDeleteRoom}
                onAddBatch={handleAddBatch}
                onDeleteBatch={handleDeleteBatch}
              />
            )}

            {activeTab === 'workload' && (
              <WorkloadManager
                faculty={faculty}
                sessions={sessions}
                subjects={subjects}
                timeSlots={timeSlots}
                facultyAvailability={facultyAvailability}
                onToggleAvailability={handleToggleAvailability}
              />
            )}

            {activeTab === 'leave' && (
              <LeaveSubstitutionManager
                leaveRequests={leaveRequests}
                substitutions={substitutions}
                faculty={faculty}
                sessions={sessions}
                subjects={subjects}
                timeSlots={timeSlots}
                batches={batches}
                rooms={rooms}
                facultySubjects={facultySubjects}
                facultyAvailability={facultyAvailability}
                onAddLeaveRequest={(newLeave) =>
                  setLeaveRequests([newLeave, ...leaveRequests])
                }
                onConfirmSubstitution={handleConfirmSubstitution}
                onRescheduleSession={(leaveId, sessId, newSlotId, reason) => {
                  setSessions(
                    sessions.map((s) =>
                      s.Session_ID === sessId ? { ...s, Slot_ID: newSlotId } : s
                    )
                  );
                }}
              />
            )}

            {activeTab === 'occupancy' && (
              <RoomOccupancyView
                rooms={rooms}
                sessions={sessions}
                timeSlots={timeSlots}
                subjects={subjects}
                batches={batches}
                faculty={faculty}
              />
            )}

            {activeTab === 'changelog' && (
              <ChangeLogView changeLogs={changeLogs} />
            )}
          </div>
        </main>
      </div>

      {/* Edit Session Modal */}
      <SessionEditModal
        session={editingSession}
        allSessions={sessions}
        subjects={subjects}
        faculty={faculty}
        rooms={rooms}
        batches={batches}
        timeSlots={timeSlots}
        facultyAvailability={facultyAvailability}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSession(null);
        }}
        onSave={handleSaveEditedSession}
        onDelete={handleDeleteSession}
      />

      {/* Campus Notifications Modal */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        notifications={notifications}
        onMarkAllAsRead={() =>
          setNotifications(notifications.map((n) => ({ ...n, Is_Read: true })))
        }
      />
    </div>
  );
}

