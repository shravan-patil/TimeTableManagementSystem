// =============================================================================
// VJTI Time Table Management System (TTMS)
// WorkloadService: Faculty Load Equity & Availability Calculation (FR-8)
// =============================================================================

import { db } from '../db';

export interface FacultyWorkloadSummary {
  facultyId: string;
  name: string;
  department: string;
  maxWeeklyLoad: number;
  assignedHours: number;
  isOverloaded: boolean;
  loadPercentage: number;
}

export class WorkloadService {
  public static getDepartmentWorkload(): FacultyWorkloadSummary[] {
    const loadMap = new Map<string, number>();
    for (const e of Array.from(db.timetableEntries.values())) {
      loadMap.set(e.faculty_id, (loadMap.get(e.faculty_id) || 0) + 1);
    }

    return Array.from(db.faculty.values()).map((f) => {
      const assigned = loadMap.get(f.faculty_id) || 0;
      const max = f.max_weekly_load;
      const pct = Math.min(Math.round((assigned / max) * 100), 100);
      return {
        facultyId: f.faculty_id,
        name: f.name,
        department: f.department_id,
        maxWeeklyLoad: max,
        assignedHours: assigned,
        isOverloaded: assigned > max,
        loadPercentage: pct,
      };
    });
  }

  public static getPersonalWorkload(facultyId: string): FacultyWorkloadSummary | null {
    const f = db.faculty.get(facultyId);
    if (!f) return null;

    let assigned = 0;
    for (const e of Array.from(db.timetableEntries.values())) {
      if (e.faculty_id === facultyId) {
        assigned++;
      }
    }

    return {
      facultyId: f.faculty_id,
      name: f.name,
      department: f.department_id,
      maxWeeklyLoad: f.max_weekly_load,
      assignedHours: assigned,
      isOverloaded: assigned > f.max_weekly_load,
      loadPercentage: Math.min(Math.round((assigned / f.max_weekly_load) * 100), 100),
    };
  }
}

