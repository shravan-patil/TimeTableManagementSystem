// =============================================================================
// VJTI Time Table Management System (TTMS)
// MasterDataService: CRUD operations enforcing ON DELETE RESTRICT (TC-02)
// Reference: Assignment 7 Table 4
// =============================================================================

import { db } from '../db';
import { FacultyEntity, RoomEntity, SubjectEntity, BatchEntity } from '../types';

export class MasterDataService {
  // --- Faculty ---
  public static getAllFaculty(): FacultyEntity[] {
    return Array.from(db.faculty.values());
  }

  public static getFacultyById(facultyId: string): FacultyEntity | undefined {
    return db.faculty.get(facultyId);
  }

  public static createFaculty(data: Omit<FacultyEntity, 'faculty_id'>): FacultyEntity {
    const faculty_id = `FAC-${String(db.faculty.size + 1).padStart(3, '0')}`;
    const newFaculty: FacultyEntity = { faculty_id, ...data };
    db.faculty.set(faculty_id, newFaculty);
    return newFaculty;
  }

  public static deleteFaculty(facultyId: string): void {
    // TC-02: Referential Integrity check
    db.checkCanDeleteFaculty(facultyId);
    db.faculty.delete(facultyId);
  }

  // --- Rooms ---
  public static getAllRooms(): RoomEntity[] {
    return Array.from(db.rooms.values());
  }

  public static getRoomById(roomId: string): RoomEntity | undefined {
    return db.rooms.get(roomId);
  }

  public static createRoom(data: Omit<RoomEntity, 'room_id'>): RoomEntity {
    const room_id = `RM-${String(db.rooms.size + 1).padStart(3, '0')}`;
    const newRoom: RoomEntity = { room_id, ...data };
    db.rooms.set(room_id, newRoom);
    return newRoom;
  }

  public static deleteRoom(roomId: string): void {
    // TC-02: Referential Integrity check
    db.checkCanDeleteRoom(roomId);
    db.rooms.delete(roomId);
  }

  // --- Subjects ---
  public static getAllSubjects(): SubjectEntity[] {
    return Array.from(db.subjects.values());
  }

  public static getSubjectById(subjectId: string): SubjectEntity | undefined {
    return db.subjects.get(subjectId);
  }

  public static createSubject(data: Omit<SubjectEntity, 'subject_id'>): SubjectEntity {
    const subject_id = `SUB-${String(db.subjects.size + 1).padStart(3, '0')}`;
    const newSubject: SubjectEntity = { subject_id, ...data };
    db.subjects.set(subject_id, newSubject);
    return newSubject;
  }

  public static deleteSubject(subjectId: string): void {
    db.checkCanDeleteSubject(subjectId);
    db.subjects.delete(subjectId);
  }

  // --- Batches ---
  public static getAllBatches(): BatchEntity[] {
    return Array.from(db.batches.values());
  }

  public static getBatchById(batchId: string): BatchEntity | undefined {
    return db.batches.get(batchId);
  }

  public static createBatch(data: Omit<BatchEntity, 'batch_id'>): BatchEntity {
    const batch_id = `BATCH-${String(db.batches.size + 1).padStart(3, '0')}`;
    const newBatch: BatchEntity = { batch_id, ...data };
    db.batches.set(batch_id, newBatch);
    return newBatch;
  }

  public static deleteBatch(batchId: string): void {
    db.checkCanDeleteBatch(batchId);
    db.batches.delete(batchId);
  }

  // --- Faculty Availability ---
  public static getFacultyAvailability(facultyId: string) {
    return Array.from(db.facultyAvailability.values()).filter((fa) => fa.faculty_id === facultyId);
  }

  public static setFacultyAvailability(facultyId: string, slotId: string, isAvailable: boolean) {
    db.facultyAvailability.set(`${facultyId}_${slotId}`, {
      faculty_id: facultyId,
      slot_id: slotId,
      is_available: isAvailable,
    });
  }
}

