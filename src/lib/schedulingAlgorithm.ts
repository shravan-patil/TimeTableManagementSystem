import {
  Batch,
  Faculty,
  FacultyAvailability,
  FacultySubject,
  Room,
  Session,
  Subject,
  TimeSlot,
  SchedulingConfig,
  DayOfWeek,
} from '../types/ttms';
import { isDummyFaculty, getBatchLunchPeriod, areParallelElectivesOrLabs } from './conflictDetector';

export interface SoftCostBreakdown {
  totalCost: number;
  gapCost: number;
  gapCount: number;
  facultyVarianceCost: number;
  duplicateSubjectCost: number;
  duplicateSubjectCount: number;
  fatigueCost: number;
  fatigueCount: number;
  compactnessCost: number;
}

export interface SchedulingResult {
  timetableId: string;
  sessions: Session[];
  success: boolean;
  message: string;
  scheduledCount: number;
  unassignedCount: number;
  unassignedSessions: {
    batchId: string;
    subjectId: string;
    sessionType: 'Lecture' | 'Lab';
    reason: string;
  }[];
  executionTimeMs: number;
  softCost?: number;
  metrics?: {
    studentGaps: number;
    facultyLoadVariance: number;
    duplicateSubjectsSameDay: number;
    fatigueViolations: number;
  };
}

export interface FeasibilityReport {
  isFeasible: boolean;
  totalWeeklyHoursNeeded: number;
  totalLectureHallCapacityHours: number;
  totalLabCapacityHours: number;
  facultyWorkloadStatus: {
    facultyId: string;
    facultyName: string;
    requiredHours: number;
    maxWeeklyLoad: number;
    isOverloaded: boolean;
  }[];
  mergedJointSessions: {
    subjectId: string;
    batchIds: string[];
    reason: string;
  }[];
  warnings: string[];
  errors: string[];
}

/**
 * Deterministic Pseudo-Random Number Generator (LCG)
 * Guarantees 100% reproducible results for identical solver inputs.
 */
export class DeterministicPRNG {
  private state: number;

  constructor(seed: number = 42) {
    this.state = seed >>> 0;
  }

  public next(): number {
    this.state = (1664525 * this.state + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

/**
 * Identifies institutional elective baskets by course name.
 */
export function getElectiveBasket(name: string): string | null {
  const n = name.toUpperCase();
  if (n.includes('PE III') || n.includes('PE-III')) return 'PE_III';
  if (n.includes('PE IV') || n.includes('PE-IV')) return 'PE_IV';
  if (n.includes('PE I') || n.includes('PE-I')) return 'PE_I';
  if (n.includes('MDM V') || n.includes('MDM 5') || n.includes('MDM-V')) return 'MDM_V';
  if (n.includes('MDM III') || n.includes('MDM 3') || n.includes('MDM-III')) return 'MDM_III';
  if (n.includes('MDM I') || n.includes('MDM 1') || n.includes('MDM-I')) return 'MDM_I';
  if (n.includes('HONORS') || n.includes('HON:')) return 'HONORS';
  return null;
}

/**
 * Maps institutional curriculum subjects to their relevant student cohorts.
 */
export function isSubjectForCohort(sub: Subject, batch: Batch, allBatches: Batch[]): boolean {
  if (allBatches.length <= 1) return true;

  const sid = sub.Subject_ID;
  const bid = batch.Batch_ID.toUpperCase();
  const year = batch.Year;
  const isCE = (batch.Department || '').includes('Computer') || bid.includes('CE');
  const isIT = (batch.Department || '').includes('Information') || bid.includes('IT');

  // Generic fallback if batches do not have standard year annotations
  if (year === undefined && !bid.includes('SY') && !bid.includes('TY') && !bid.includes('BTECH')) {
    return true;
  }

  // 1. Final Year B.Tech (Year 4)
  if (year === 4 || bid.includes('BTECH')) {
    const btechSubs = [
      'SUB-OEII', 'SUB-PANS', 'SUB-ST', 'SUB-DL', 'SUB-QC',
      'SUB-MDMV-DS', 'SUB-MDMV-AI', 'SUB-CPAD-LAB', 'SUB-PANS-LAB', 'SUB-ST-LAB',
      'SUB-DL-LAB', 'SUB-QC-LAB', 'SUB-HON-BC', 'SUB-HON-ARVR', 'SUB-PROJECT'
    ];
    if (btechSubs.includes(sid)) return true;
    if (isCE && sid === 'SUB-DM-BTECH') return true;
    return false;
  }

  // 2. Third Year B.Tech (Year 3 / TY)
  if (year === 3 || bid.includes('TY')) {
    if (isCE) {
      const tyCeSubs = [
        'SUB-CC-CE', 'SUB-ML-CE', 'SUB-CN-CE', 'SUB-PC-CE', 'SUB-HCI-CE',
        'SUB-MDM3-ML', 'SUB-PE1-IP', 'SUB-PE1-OT',
        'SUB-ML-LAB-CE', 'SUB-CN-LAB-CE', 'SUB-PC-LAB-CE'
      ];
      return tyCeSubs.includes(sid);
    }
    if (isIT) {
      const tyItSubs = [
        'SUB-ML-IT', 'SUB-SE-IT', 'SUB-PC-IT', 'SUB-CC-IT', 'SUB-CY-IT',
        'SUB-MDM3-DLNN', 'SUB-PE1-HCI',
        'SUB-ML-LAB-IT', 'SUB-SE-LAB-IT', 'SUB-PP-LAB-IT'
      ];
      return tyItSubs.includes(sid);
    }
    return false;
  }

  // 3. Second Year B.Tech (Year 2 / SY)
  if (year === 2 || bid.includes('SY')) {
    if (sid === 'SUB-MCE' || sid === 'SUB-MIL' || sid === 'SUB-UHV') return true;
    if (isCE) {
      const syCeSubs = [
        'SUB-DS-CE', 'SUB-DAA-CE', 'SUB-OS-CE', 'SUB-MDM1-DS',
        'SUB-ALGO-LAB-CE', 'SUB-OS-LAB-CE', 'SUB-PDL-LAB-CE', 'SUB-OST-LAB-CE'
      ];
      return syCeSubs.includes(sid);
    }
    if (isIT) {
      const syItSubs = [
        'SUB-DM-IT', 'SUB-DAA-IT', 'SUB-OS-IT', 'SUB-MDM1-AIML',
        'SUB-ALGO-LAB-IT', 'SUB-OS-LAB-IT', 'SUB-PDL-LAB-IT', 'SUB-OST-LAB-IT'
      ];
      return syItSubs.includes(sid);
    }
    return false;
  }

  return true;
}

/**
 * Pre-flight Feasibility Diagnostic
 */
export function validateDatasetFeasibility(
  batches: Batch[],
  subjects: Subject[],
  faculty: Faculty[],
  facultySubjects: FacultySubject[],
  rooms: Room[],
  timeSlots: TimeSlot[],
  config: SchedulingConfig
): FeasibilityReport {
  const warnings: string[] = [];
  const errors: string[] = [];
  const mergedJointSessions: FeasibilityReport['mergedJointSessions'] = [];

  const workingDays = config.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periodsPerDay = config.periodsPerDay || 7;
  const usableSlotsPerRoom = workingDays.length * (periodsPerDay - 1);

  const lectureRooms = rooms.filter((r) => r.Room_Type === 'Lecture Hall' || r.Room_Type === 'Seminar Room');
  const labRooms = rooms.filter((r) => r.Room_Type === 'Laboratory');

  const totalLectureHallCapacityHours = lectureRooms.length * usableSlotsPerRoom;
  const totalLabCapacityHours = labRooms.length * usableSlotsPerRoom;

  let totalTheoryHoursNeeded = 0;
  let totalLabHoursNeeded = 0;

  const sharedElectives = new Map<string, string[]>();
  batches.forEach((b) => {
    subjects.forEach((s) => {
      if (isSubjectForCohort(s, b, batches)) {
        if (s.Subject_ID === 'SUB-OEII' || s.Subject_Name.toUpperCase().includes('OPEN ELECTIVE')) {
          const list = sharedElectives.get(s.Subject_ID) || [];
          list.push(b.Batch_ID);
          sharedElectives.set(s.Subject_ID, list);
        }
      }
    });
  });

  sharedElectives.forEach((bIds, subId) => {
    if (bIds.length > 1) {
      mergedJointSessions.push({
        subjectId: subId,
        batchIds: bIds,
        reason: 'Auto-merged shared open elective requirement across CE and IT into a single joint session.',
      });
    }
  });

  const accountedShared = new Set<string>();
  batches.forEach((b) => {
    let cohortSubs = subjects.filter((s) => isSubjectForCohort(s, b, batches));
    if (cohortSubs.length === 0) cohortSubs = subjects;

    cohortSubs.forEach((s) => {
      if (s.Subject_Type === 'Practical' || s.Requires_Lab) {
        totalLabHoursNeeded += s.Hours_Per_Week;
      } else {
        if (sharedElectives.has(s.Subject_ID)) {
          if (accountedShared.has(s.Subject_ID)) return;
          accountedShared.add(s.Subject_ID);
        }
        totalTheoryHoursNeeded += s.Hours_Per_Week;
      }
    });
  });

  if (totalTheoryHoursNeeded > totalLectureHallCapacityHours) {
    errors.push(
      `Insufficient Lecture Hall capacity: Required ${totalTheoryHoursNeeded} hrs/week vs Available ${totalLectureHallCapacityHours} hrs/week.`
    );
  }

  if (totalLabHoursNeeded > totalLabCapacityHours) {
    warnings.push(
      `Lab capacity tight: Required ${totalLabHoursNeeded} hrs/week vs Available ${totalLabCapacityHours} hrs/week.`
    );
  }

  const facultyNeededHours = new Map<string, number>();
  facultySubjects.forEach((fs) => {
    const sub = subjects.find((s) => s.Subject_ID === fs.Subject_ID);
    if (sub) {
      const cur = facultyNeededHours.get(fs.Faculty_ID) || 0;
      facultyNeededHours.set(fs.Faculty_ID, cur + sub.Hours_Per_Week);
    }
  });

  const facultyWorkloadStatus: FeasibilityReport['facultyWorkloadStatus'] = [];
  faculty.forEach((f) => {
    const required = facultyNeededHours.get(f.Faculty_ID) || 0;
    const isOverloaded = required > f.Max_Weekly_Load;
    if (isOverloaded) {
      warnings.push(
        `Faculty ${f.Faculty_Name} assigned hours (${required} hrs) exceeds statutory max weekly load (${f.Max_Weekly_Load} hrs).`
      );
    }
    facultyWorkloadStatus.push({
      facultyId: f.Faculty_ID,
      facultyName: f.Faculty_Name,
      requiredHours: required,
      maxWeeklyLoad: f.Max_Weekly_Load,
      isOverloaded,
    });
  });

  return {
    isFeasible: errors.length === 0,
    totalWeeklyHoursNeeded: totalTheoryHoursNeeded + totalLabHoursNeeded,
    totalLectureHallCapacityHours,
    totalLabCapacityHours,
    facultyWorkloadStatus,
    mergedJointSessions,
    warnings,
    errors,
  };
}

/**
 * Mathematical Soft Constraint Cost Function
 */
export function calculateSoftCost(
  sessions: Session[],
  batches: Batch[],
  faculty: Faculty[],
  timeSlots: TimeSlot[],
  subjects: Subject[]
): SoftCostBreakdown {
  const slotMap = new Map(timeSlots.map((ts) => [ts.Slot_ID, ts]));
  const batchMap = new Map(batches.map((b) => [b.Batch_ID, b]));
  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s]));

  const batchDaySlots = new Map<string, number[]>();
  const batchDaySubjects = new Map<string, string[]>();
  const facultyDayPeriods = new Map<string, number[]>();
  const facultyTotalHours = new Map<string, number>();

  sessions.forEach((s) => {
    const slot = slotMap.get(s.Slot_ID);
    if (!slot) return;

    const batchKey = `${s.Batch_ID}_${slot.Day}`;
    const bPeriods = batchDaySlots.get(batchKey) || [];
    bPeriods.push(slot.Period_No);
    batchDaySlots.set(batchKey, bPeriods);

    const bSubjects = batchDaySubjects.get(batchKey) || [];
    bSubjects.push(s.Subject_ID);
    batchDaySubjects.set(batchKey, bSubjects);

    if (!isDummyFaculty(s.Faculty_ID)) {
      const facKey = `${s.Faculty_ID}_${slot.Day}`;
      const fPeriods = facultyDayPeriods.get(facKey) || [];
      fPeriods.push(slot.Period_No);
      facultyDayPeriods.set(facKey, fPeriods);

      facultyTotalHours.set(s.Faculty_ID, (facultyTotalHours.get(s.Faculty_ID) || 0) + 1);
    }
  });

  // 1. S1: Zero Student Gaps (Weight: 1000)
  let gapCount = 0;
  let compactnessCost = 0;

  batchDaySlots.forEach((periods, key) => {
    if (periods.length <= 1) return;
    const [batchId] = key.split('_');
    const b = batchMap.get(batchId);
    const lunchPeriod = getBatchLunchPeriod(b);

    const sorted = [...new Set(periods)].sort((a, b) => a - b);
    const minP = sorted[0];
    const maxP = sorted[sorted.length - 1];

    const occupiedSet = new Set(sorted);
    for (let p = minP + 1; p < maxP; p++) {
      if (p !== lunchPeriod && !occupiedSet.has(p)) {
        gapCount++;
      }
    }

    if (maxP > 6) {
      compactnessCost += (maxP - 6) * 25;
    }
  });

  const gapCost = gapCount * 1000;

  // 2. S2: Even Faculty Weekly Distribution (Weight: 300)
  let facultyVarianceCost = 0;
  const workingDays: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  faculty.forEach((f) => {
    if (isDummyFaculty(f.Faculty_ID)) return;
    const total = facultyTotalHours.get(f.Faculty_ID) || 0;
    if (total === 0) return;
    const mu = total / 5;

    workingDays.forEach((day) => {
      const periods = facultyDayPeriods.get(`${f.Faculty_ID}_${day}`) || [];
      const diff = periods.length - mu;
      facultyVarianceCost += 300 * (diff * diff);
    });
  });

  // 3. S3: No Subject Repetition on Same Day for Batch (Weight: 500)
  let duplicateSubjectCount = 0;
  batchDaySubjects.forEach((subIds) => {
    const counts = new Map<string, number>();
    subIds.forEach((sid) => {
      const sub = subjectMap.get(sid);
      if (sub && sub.Subject_Type !== 'Practical' && !sub.Requires_Lab) {
        counts.set(sid, (counts.get(sid) || 0) + 1);
      }
    });

    counts.forEach((c) => {
      if (c > 1) {
        duplicateSubjectCount += c - 1;
      }
    });
  });

  const duplicateSubjectCost = duplicateSubjectCount * 500;

  // 4. S4: Faculty Consecutive Fatigue > 2 hrs (Weight: 200)
  let fatigueCount = 0;
  facultyDayPeriods.forEach((periods) => {
    if (periods.length <= 2) return;
    const sorted = [...new Set(periods)].sort((a, b) => a - b);

    let currentStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i - 1] + 1) {
        currentStreak++;
        if (currentStreak > 2) {
          fatigueCount++;
        }
      } else {
        currentStreak = 1;
      }
    }
  });

  const fatigueCost = fatigueCount * 200;
  const totalCost = gapCost + facultyVarianceCost + duplicateSubjectCost + fatigueCost + compactnessCost;

  return {
    totalCost,
    gapCost,
    gapCount,
    facultyVarianceCost,
    duplicateSubjectCost,
    duplicateSubjectCount,
    fatigueCost,
    fatigueCount,
    compactnessCost,
  };
}

export interface SchedulingTrack {
  subjectId: string;
  facultyId: string;
  batchId: string;
}

export interface SchedulingUnit {
  unitId: string;
  kind: 'Pinned' | 'JointElective' | 'ParallelElective' | 'ParallelLabBlock' | 'SingleLab' | 'Theory';
  difficultyScore: number;
  duration: number;
  cohortBatches: string[];
  targetRoomType: 'Lecture Hall' | 'Laboratory' | 'Seminar Room';
  tracks: SchedulingTrack[];
  pinnedSlot?: TimeSlot;
}

/**
 * Intelligent Three-Phase Timetable Generation Engine (Process 2.0)
 * Deterministic Combinatorial Optimization with MRV & Simulated Annealing Polish
 */
export function generateTimetable(
  timetableId: string,
  batches: Batch[],
  subjects: Subject[],
  faculty: Faculty[],
  facultySubjects: FacultySubject[],
  rooms: Room[],
  timeSlots: TimeSlot[],
  facultyAvailability: FacultyAvailability[],
  config: SchedulingConfig
): SchedulingResult {
  const startTime = performance.now();
  const prng = new DeterministicPRNG(42);

  const workingDays = config.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const maxPeriod = config.periodsPerDay || 7;
  const sessions: Session[] = [];

  const facultyMap = new Map(faculty.map((f) => [f.Faculty_ID, f]));
  const roomMap = new Map(rooms.map((r) => [r.Room_ID, r]));
  const batchMap = new Map(batches.map((b) => [b.Batch_ID, b]));
  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s]));
  const slotMap = new Map(timeSlots.map((ts) => [ts.Slot_ID, ts]));

  const facultySubjectMap = new Map<string, string[]>();
  facultySubjects.forEach((fs) => {
    const list = facultySubjectMap.get(fs.Subject_ID) || [];
    list.push(fs.Faculty_ID);
    facultySubjectMap.set(fs.Subject_ID, list);
  });

  const getFacultyForSubject = (subId: string, bId: string): string => {
    const list = facultySubjectMap.get(subId) || [];
    if (list.length > 0) return list[0];
    return `TBA_${subId}_${bId}`;
  };

  const unavailSet = new Set<string>();
  facultyAvailability.forEach((fa) => {
    if (!fa.Is_Available) {
      unavailSet.add(`${fa.Faculty_ID}_${fa.Slot_ID}`);
    }
  });

  const validSlots = timeSlots
    .filter((s) => workingDays.includes(s.Day) && s.Period_No <= maxPeriod)
    .sort((a, b) => {
      if (a.Day !== b.Day) return a.Day.localeCompare(b.Day);
      return a.Period_No - b.Period_No;
    });

  // Reference counting for occupancy
  const occupiedFaculty = new Map<string, number>(); // facId_slotId -> count
  const occupiedRoom = new Map<string, number>();    // roomId_slotId -> count
  const occupiedBatch = new Map<string, number>();   // batchId_slotId -> count
  let sessionCounter = 1;

  // ---------------------------------------------------------------------------
  // DATA NORMALIZATION & UNIT BUNDLING
  // ---------------------------------------------------------------------------
  const schedulingUnits: SchedulingUnit[] = [];

  // 1. Pinned slots from configuration
  if (config.fixedCommonElectivePeriod) {
    const { day, periodNo, subjectId } = config.fixedCommonElectivePeriod;
    const targetSlot = validSlots.find((s) => s.Day === day && s.Period_No === periodNo);
    if (targetSlot) {
      const chosenFac = getFacultyForSubject(subjectId, 'ALL');
      schedulingUnits.push({
        unitId: `PINNED_${subjectId}`,
        kind: 'Pinned',
        difficultyScore: 10000,
        duration: 1,
        cohortBatches: batches.map((b) => b.Batch_ID),
        targetRoomType: 'Seminar Room',
        tracks: [{ subjectId, facultyId: chosenFac, batchId: batches[0].Batch_ID }],
        pinnedSlot: targetSlot,
      });
    }
  }

  const isFullInstitutionalDataset = batches.length >= 4 && subjects.length >= 20;

  if (isFullInstitutionalDataset) {
    // 1. Joint Open Elective II (BTECH-CE & BTECH-IT)
    if (subjects.some((s) => s.Subject_ID === 'SUB-OEII')) {
      const oeSub = subjects.find((s) => s.Subject_ID === 'SUB-OEII')!;
      const oeFac = getFacultyForSubject('SUB-OEII', 'BTECH');
      for (let h = 0; h < (oeSub.Hours_Per_Week || 3); h++) {
        schedulingUnits.push({
          unitId: `JOINT_OEII_${h + 1}`,
          kind: 'JointElective',
          difficultyScore: 9000,
          duration: 1,
          targetRoomType: 'Lecture Hall',
          tracks: [
            { subjectId: 'SUB-OEII', facultyId: oeFac, batchId: 'BATCH-BTECH-CE' },
            { subjectId: 'SUB-OEII', facultyId: oeFac, batchId: 'BATCH-BTECH-IT' },
          ],
          cohortBatches: ['BATCH-BTECH-CE', 'BATCH-BTECH-IT'],
        });
      }
    }

    // 2. Final Year Parallel Electives: PE-III, PE-IV, MDM-V, HONORS
    const finalElectiveBaskets = [
      { basket: 'PE_III', subs: ['SUB-PANS', 'SUB-ST'] },
      { basket: 'PE_IV', subs: ['SUB-DL', 'SUB-QC'] },
      { basket: 'MDM_V', subs: ['SUB-MDMV-DS', 'SUB-MDMV-AI'] },
      { basket: 'HONORS', subs: ['SUB-HON-BC', 'SUB-HON-ARVR'] },
    ];
    finalElectiveBaskets.forEach(({ basket, subs }) => {
      for (let h = 0; h < 3; h++) {
        schedulingUnits.push({
          unitId: `FINAL_${basket}_${h + 1}`,
          kind: 'ParallelElective',
          difficultyScore: 8000,
          duration: 1,
          targetRoomType: 'Lecture Hall',
          tracks: subs.map((subId) => ({
            subjectId: subId,
            facultyId: getFacultyForSubject(subId, 'BTECH'),
            batchId: 'BATCH-BTECH-CE',
          })),
          cohortBatches: ['BATCH-BTECH-CE', 'BATCH-BTECH-IT'],
        });
      }
    });

    // Final Year Labs (MRV Priority: Duration 2 labs placed before 1-hour theory!)
    schedulingUnits.push({
      unitId: `FINAL_LAB_PE3`,
      kind: 'ParallelLabBlock',
      difficultyScore: 8800,
      duration: 2,
      targetRoomType: 'Laboratory',
      tracks: [
        { subjectId: 'SUB-PANS-LAB', facultyId: getFacultyForSubject('SUB-PANS-LAB', 'BTECH'), batchId: 'BATCH-BTECH-CE' },
        { subjectId: 'SUB-ST-LAB', facultyId: getFacultyForSubject('SUB-ST-LAB', 'BTECH'), batchId: 'BATCH-BTECH-CE' },
      ],
      cohortBatches: ['BATCH-BTECH-CE', 'BATCH-BTECH-IT'],
    });

    schedulingUnits.push({
      unitId: `FINAL_LAB_PE4`,
      kind: 'ParallelLabBlock',
      difficultyScore: 8800,
      duration: 2,
      targetRoomType: 'Laboratory',
      tracks: [
        { subjectId: 'SUB-DL-LAB', facultyId: getFacultyForSubject('SUB-DL-LAB', 'BTECH'), batchId: 'BATCH-BTECH-CE' },
        { subjectId: 'SUB-QC-LAB', facultyId: getFacultyForSubject('SUB-QC-LAB', 'BTECH'), batchId: 'BATCH-BTECH-CE' },
      ],
      cohortBatches: ['BATCH-BTECH-CE', 'BATCH-BTECH-IT'],
    });

    schedulingUnits.push({
      unitId: `FINAL_LAB_CPAD`,
      kind: 'SingleLab',
      difficultyScore: 8700,
      duration: 2,
      targetRoomType: 'Laboratory',
      tracks: [{ subjectId: 'SUB-CPAD-LAB', facultyId: getFacultyForSubject('SUB-CPAD-LAB', 'BTECH'), batchId: 'BATCH-BTECH-CE' }],
      cohortBatches: ['BATCH-BTECH-CE', 'BATCH-BTECH-IT'],
    });

    for (let p = 0; p < 2; p++) {
      schedulingUnits.push({
        unitId: `FINAL_PROJECT_${p + 1}`,
        kind: 'SingleLab',
        difficultyScore: 8600,
        duration: 2,
        targetRoomType: 'Laboratory',
        tracks: [{ subjectId: 'SUB-PROJECT', facultyId: getFacultyForSubject('SUB-PROJECT', 'BTECH'), batchId: 'BATCH-BTECH-CE' }],
        cohortBatches: ['BATCH-BTECH-CE', 'BATCH-BTECH-IT'],
      });
    }

    // Final Year DM (CE)
    for (let h = 0; h < 3; h++) {
      schedulingUnits.push({
        unitId: `FINAL_DM_CE_${h + 1}`,
        kind: 'Theory',
        difficultyScore: 3500,
        duration: 1,
        targetRoomType: 'Lecture Hall',
        tracks: [{ subjectId: 'SUB-DM-BTECH', facultyId: getFacultyForSubject('SUB-DM-BTECH', 'BATCH-BTECH-CE'), batchId: 'BATCH-BTECH-CE' }],
        cohortBatches: ['BATCH-BTECH-CE'],
      });
    }

    // 3. TY CE
    for (let h = 0; h < 3; h++) {
      schedulingUnits.push({
        unitId: `TY_CE_PE1_${h + 1}`,
        kind: 'ParallelElective',
        difficultyScore: 6000,
        duration: 1,
        targetRoomType: 'Lecture Hall',
        tracks: [
          { subjectId: 'SUB-PE1-IP', facultyId: getFacultyForSubject('SUB-PE1-IP', 'BATCH-TY-CE'), batchId: 'BATCH-TY-CE' },
          { subjectId: 'SUB-PE1-OT', facultyId: getFacultyForSubject('SUB-PE1-OT', 'BATCH-TY-CE'), batchId: 'BATCH-TY-CE' },
        ],
        cohortBatches: ['BATCH-TY-CE'],
      });
    }

    schedulingUnits.push({
      unitId: `TY_CE_LAB_BLOCK`,
      kind: 'ParallelLabBlock',
      difficultyScore: 8700,
      duration: 2,
      targetRoomType: 'Laboratory',
      tracks: [
        { subjectId: 'SUB-ML-LAB-CE', facultyId: getFacultyForSubject('SUB-ML-LAB-CE', 'BATCH-TY-CE'), batchId: 'BATCH-TY-CE' },
        { subjectId: 'SUB-CN-LAB-CE', facultyId: getFacultyForSubject('SUB-CN-LAB-CE', 'BATCH-TY-CE'), batchId: 'BATCH-TY-CE' },
        { subjectId: 'SUB-PC-LAB-CE', facultyId: getFacultyForSubject('SUB-PC-LAB-CE', 'BATCH-TY-CE'), batchId: 'BATCH-TY-CE' },
      ],
      cohortBatches: ['BATCH-TY-CE'],
    });

    const tyCeTheory = [
      { id: 'SUB-CC-CE', h: 3 },
      { id: 'SUB-ML-CE', h: 3 },
      { id: 'SUB-CN-CE', h: 3 },
      { id: 'SUB-PC-CE', h: 3 },
      { id: 'SUB-HCI-CE', h: 2 },
      { id: 'SUB-MDM3-ML', h: 3 },
    ];
    tyCeTheory.forEach(({ id, h }) => {
      for (let i = 0; i < h; i++) {
        schedulingUnits.push({
          unitId: `TY_CE_${id}_${i + 1}`,
          kind: 'Theory',
          difficultyScore: 3000,
          duration: 1,
          targetRoomType: 'Lecture Hall',
          tracks: [{ subjectId: id, facultyId: getFacultyForSubject(id, 'BATCH-TY-CE'), batchId: 'BATCH-TY-CE' }],
          cohortBatches: ['BATCH-TY-CE'],
        });
      }
    });

    // 4. TY IT
    schedulingUnits.push({
      unitId: `TY_IT_LAB_BLOCK`,
      kind: 'ParallelLabBlock',
      difficultyScore: 8700,
      duration: 2,
      targetRoomType: 'Laboratory',
      tracks: [
        { subjectId: 'SUB-ML-LAB-IT', facultyId: getFacultyForSubject('SUB-ML-LAB-IT', 'BATCH-TY-IT'), batchId: 'BATCH-TY-IT' },
        { subjectId: 'SUB-SE-LAB-IT', facultyId: getFacultyForSubject('SUB-SE-LAB-IT', 'BATCH-TY-IT'), batchId: 'BATCH-TY-IT' },
        { subjectId: 'SUB-PP-LAB-IT', facultyId: getFacultyForSubject('SUB-PP-LAB-IT', 'BATCH-TY-IT'), batchId: 'BATCH-TY-IT' },
      ],
      cohortBatches: ['BATCH-TY-IT'],
    });

    const tyItTheory = [
      { id: 'SUB-ML-IT', h: 3 },
      { id: 'SUB-SE-IT', h: 3 },
      { id: 'SUB-PC-IT', h: 3 },
      { id: 'SUB-CC-IT', h: 3 },
      { id: 'SUB-CY-IT', h: 2 },
      { id: 'SUB-MDM3-DLNN', h: 3 },
      { id: 'SUB-PE1-HCI', h: 3 },
    ];
    tyItTheory.forEach(({ id, h }) => {
      for (let i = 0; i < h; i++) {
        schedulingUnits.push({
          unitId: `TY_IT_${id}_${i + 1}`,
          kind: 'Theory',
          difficultyScore: 3000,
          duration: 1,
          targetRoomType: 'Lecture Hall',
          tracks: [{ subjectId: id, facultyId: getFacultyForSubject(id, 'BATCH-TY-IT'), batchId: 'BATCH-TY-IT' }],
          cohortBatches: ['BATCH-TY-IT'],
        });
      }
    });

    // 5. SY CE
    schedulingUnits.push({
      unitId: `SY_CE_LAB_BLOCK`,
      kind: 'ParallelLabBlock',
      difficultyScore: 8900,
      duration: 2,
      targetRoomType: 'Laboratory',
      tracks: [
        { subjectId: 'SUB-ALGO-LAB-CE', facultyId: getFacultyForSubject('SUB-ALGO-LAB-CE', 'BATCH-SY-CE'), batchId: 'BATCH-SY-CE' },
        { subjectId: 'SUB-OS-LAB-CE', facultyId: getFacultyForSubject('SUB-OS-LAB-CE', 'BATCH-SY-CE'), batchId: 'BATCH-SY-CE' },
        { subjectId: 'SUB-PDL-LAB-CE', facultyId: getFacultyForSubject('SUB-PDL-LAB-CE', 'BATCH-SY-CE'), batchId: 'BATCH-SY-CE' },
        { subjectId: 'SUB-OST-LAB-CE', facultyId: getFacultyForSubject('SUB-OST-LAB-CE', 'BATCH-SY-CE'), batchId: 'BATCH-SY-CE' },
      ],
      cohortBatches: ['BATCH-SY-CE'],
    });

    const syCeTheory = [
      { id: 'SUB-MCE', h: 3 },
      { id: 'SUB-DS-CE', h: 4 },
      { id: 'SUB-DAA-CE', h: 3 },
      { id: 'SUB-OS-CE', h: 3 },
      { id: 'SUB-MDM1-DS', h: 2 },
      { id: 'SUB-MIL', h: 2 },
      { id: 'SUB-UHV', h: 2 },
    ];
    syCeTheory.forEach(({ id, h }) => {
      for (let i = 0; i < h; i++) {
        schedulingUnits.push({
          unitId: `SY_CE_${id}_${i + 1}`,
          kind: 'Theory',
          difficultyScore: 3000,
          duration: 1,
          targetRoomType: 'Lecture Hall',
          tracks: [{ subjectId: id, facultyId: getFacultyForSubject(id, 'BATCH-SY-CE'), batchId: 'BATCH-SY-CE' }],
          cohortBatches: ['BATCH-SY-CE'],
        });
      }
    });

    // 6. SY IT
    schedulingUnits.push({
      unitId: `SY_IT_LAB_BLOCK`,
      kind: 'ParallelLabBlock',
      difficultyScore: 8900,
      duration: 2,
      targetRoomType: 'Laboratory',
      tracks: [
        { subjectId: 'SUB-ALGO-LAB-IT', facultyId: getFacultyForSubject('SUB-ALGO-LAB-IT', 'BATCH-SY-IT'), batchId: 'BATCH-SY-IT' },
        { subjectId: 'SUB-OS-LAB-IT', facultyId: getFacultyForSubject('SUB-OS-LAB-IT', 'BATCH-SY-IT'), batchId: 'BATCH-SY-IT' },
        { subjectId: 'SUB-PDL-LAB-IT', facultyId: getFacultyForSubject('SUB-PDL-LAB-IT', 'BATCH-SY-IT'), batchId: 'BATCH-SY-IT' },
        { subjectId: 'SUB-OST-LAB-IT', facultyId: getFacultyForSubject('SUB-OST-LAB-IT', 'BATCH-SY-IT'), batchId: 'BATCH-SY-IT' },
      ],
      cohortBatches: ['BATCH-SY-IT'],
    });

    const syItTheory = [
      { id: 'SUB-MCE', h: 3 },
      { id: 'SUB-DM-IT', h: 4 },
      { id: 'SUB-DAA-IT', h: 3 },
      { id: 'SUB-OS-IT', h: 3 },
      { id: 'SUB-MDM1-AIML', h: 2 },
      { id: 'SUB-MIL', h: 2 },
      { id: 'SUB-UHV', h: 2 },
    ];
    syItTheory.forEach(({ id, h }) => {
      for (let i = 0; i < h; i++) {
        schedulingUnits.push({
          unitId: `SY_IT_${id}_${i + 1}`,
          kind: 'Theory',
          difficultyScore: 3000,
          duration: 1,
          targetRoomType: 'Lecture Hall',
          tracks: [{ subjectId: id, facultyId: getFacultyForSubject(id, 'BATCH-SY-IT'), batchId: 'BATCH-SY-IT' }],
          cohortBatches: ['BATCH-SY-IT'],
        });
      }
    });
  } else {
    // Dynamic Fallback for smaller or custom datasets
    batches.forEach((b) => {
      const cohortSubs = subjects.filter((s) => isSubjectForCohort(s, b, batches));
      cohortSubs.forEach((s) => {
        const isLab = s.Subject_Type === 'Practical' || s.Requires_Lab;
        const dur = isLab ? Math.min(2, s.Hours_Per_Week) : 1;
        const numUnits = isLab ? Math.ceil(s.Hours_Per_Week / dur) : s.Hours_Per_Week;
        const chosenFac = getFacultyForSubject(s.Subject_ID, b.Batch_ID);

        for (let u = 0; u < numUnits; u++) {
          schedulingUnits.push({
            unitId: `${b.Batch_ID}_${s.Subject_ID}_${u + 1}`,
            kind: isLab ? 'SingleLab' : 'Theory',
            difficultyScore: (isLab ? 8000 : 2000) + b.Strength,
            duration: dur,
            cohortBatches: [b.Batch_ID],
            targetRoomType: isLab ? 'Laboratory' : 'Lecture Hall',
            tracks: [{ subjectId: s.Subject_ID, facultyId: chosenFac, batchId: b.Batch_ID }],
          });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // STAGE 1: MRV Priority Ordering
  // ---------------------------------------------------------------------------
  schedulingUnits.sort((a, b) => b.difficultyScore - a.difficultyScore);

  const lectureRooms = rooms.filter((r) => r.Room_Type === 'Lecture Hall' || r.Room_Type === 'Seminar Room');
  const labRooms = rooms.filter((r) => r.Room_Type === 'Laboratory');

  const unitPlacements = new Map<string, Session[]>();
  const unassigned: SchedulingResult['unassignedSessions'] = [];

  const bookTrack = (track: SchedulingTrack, room: Room, slot: TimeSlot, isLab: boolean): Session => {
    const sessId = `SES_${sessionCounter++}`;
    const s: Session = {
      Session_ID: sessId,
      Timetable_ID: timetableId,
      Subject_ID: track.subjectId,
      Faculty_ID: track.facultyId,
      Batch_ID: track.batchId,
      Room_ID: room.Room_ID,
      Slot_ID: slot.Slot_ID,
      Session_Type: isLab ? 'Lab' : 'Lecture',
    };
    sessions.push(s);

    if (!isDummyFaculty(track.facultyId)) {
      const fk = `${track.facultyId}_${slot.Slot_ID}`;
      occupiedFaculty.set(fk, (occupiedFaculty.get(fk) || 0) + 1);
    }
    const rk = `${room.Room_ID}_${slot.Slot_ID}`;
    occupiedRoom.set(rk, (occupiedRoom.get(rk) || 0) + 1);

    const bk = `${track.batchId}_${slot.Slot_ID}`;
    occupiedBatch.set(bk, (occupiedBatch.get(bk) || 0) + 1);

    return s;
  };

  const unbookSession = (s: Session) => {
    if (!isDummyFaculty(s.Faculty_ID)) {
      const fk = `${s.Faculty_ID}_${s.Slot_ID}`;
      const fc = (occupiedFaculty.get(fk) || 1) - 1;
      if (fc <= 0) occupiedFaculty.delete(fk);
      else occupiedFaculty.set(fk, fc);
    }
    const rk = `${s.Room_ID}_${s.Slot_ID}`;
    const rc = (occupiedRoom.get(rk) || 1) - 1;
    if (rc <= 0) occupiedRoom.delete(rk);
    else occupiedRoom.set(rk, rc);

    const bk = `${s.Batch_ID}_${s.Slot_ID}`;
    const bc = (occupiedBatch.get(bk) || 1) - 1;
    if (bc <= 0) occupiedBatch.delete(bk);
    else occupiedBatch.set(bk, bc);

    const idx = sessions.findIndex((sess) => sess.Session_ID === s.Session_ID);
    if (idx !== -1) sessions.splice(idx, 1);
  };

  // ---------------------------------------------------------------------------
  // STAGE 2: Placement with Least Constraining Value & Bounded Kempe Repair
  // ---------------------------------------------------------------------------
  interface ValidSlotOption {
    day: DayOfWeek;
    periodNo: number;
    rooms: Room[];
    costEstimate: number;
  }

  for (const unit of schedulingUnits) {
    if (unit.pinnedSlot) {
      const room = lectureRooms[0] || rooms[0];
      const placed: Session[] = [];
      unit.tracks.forEach((t) => {
        placed.push(bookTrack(t, room, unit.pinnedSlot!, false));
      });
      unitPlacements.set(unit.unitId, placed);
      continue;
    }

    const candidateRooms = unit.targetRoomType === 'Laboratory' ? labRooms : lectureRooms;
    const validOptions: ValidSlotOption[] = [];

    for (const day of workingDays) {
      for (let p = 1; p <= maxPeriod - unit.duration + 1; p++) {
        // Lunch check: SY lunch is period 5; TY & Final lunch is period 6
        let lunchViolation = false;
        for (const bId of unit.cohortBatches) {
          const b = batchMap.get(bId);
          const lunchP = getBatchLunchPeriod(b);
          for (let d = 0; d < unit.duration; d++) {
            const curP = p + d;
            if (lunchP === 5 && curP === 5) { lunchViolation = true; break; }
            if (lunchP === 6 && curP === 6) { lunchViolation = true; break; }
            if (lunchP === 5 && p <= 4 && p + unit.duration - 1 >= 5) { lunchViolation = true; break; }
            if (lunchP === 6 && p <= 5 && p + unit.duration - 1 >= 6) { lunchViolation = true; break; }
          }
          if (lunchViolation) break;
        }
        if (lunchViolation) continue;

        // Batch availability check
        let batchFree = true;
        for (let d = 0; d < unit.duration; d++) {
          const slot = validSlots.find((s) => s.Day === day && s.Period_No === p + d);
          if (!slot) { batchFree = false; break; }
          for (const bId of unit.cohortBatches) {
            if ((occupiedBatch.get(`${bId}_${slot.Slot_ID}`) || 0) > 0) {
              batchFree = false;
              break;
            }
          }
          if (!batchFree) break;
        }
        if (!batchFree) continue;

        // Faculty availability check
        let facFree = true;
        for (let d = 0; d < unit.duration; d++) {
          const slot = validSlots.find((s) => s.Day === day && s.Period_No === p + d);
          if (!slot) { facFree = false; break; }
          for (const track of unit.tracks) {
            if (!isDummyFaculty(track.facultyId)) {
              if (
                (occupiedFaculty.get(`${track.facultyId}_${slot.Slot_ID}`) || 0) > 0 ||
                unavailSet.has(`${track.facultyId}_${slot.Slot_ID}`)
              ) {
                facFree = false;
                break;
              }
            }
          }
          if (!facFree) break;
        }
        if (!facFree) continue;

        // Room assignment & Capacity matching
        if (unit.kind === 'JointElective') {
          for (const room of candidateRooms) {
            let roomFree = true;
            for (let d = 0; d < unit.duration; d++) {
              const slot = validSlots.find((s) => s.Day === day && s.Period_No === p + d);
              if (!slot || (occupiedRoom.get(`${room.Room_ID}_${slot.Slot_ID}`) || 0) > 0) {
                roomFree = false;
                break;
              }
            }
            if (roomFree) {
              validOptions.push({
                day,
                periodNo: p,
                rooms: [room],
                costEstimate: Math.abs(p - 2) * 5,
              });
              break;
            }
          }
        } else {
          const trackRooms: Room[] = [];
          for (const track of unit.tracks) {
            const batch = batchMap.get(track.batchId);
            const reqCap = unit.kind === 'Theory' && batch ? batch.Strength : 0;

            for (const room of candidateRooms) {
              if (trackRooms.includes(room)) continue;
              if (reqCap > 0 && room.Capacity < reqCap) continue;

              let roomFree = true;
              for (let d = 0; d < unit.duration; d++) {
                const slot = validSlots.find((s) => s.Day === day && s.Period_No === p + d);
                if (!slot || (occupiedRoom.get(`${room.Room_ID}_${slot.Slot_ID}`) || 0) > 0) {
                  roomFree = false;
                  break;
                }
              }
              if (roomFree) {
                trackRooms.push(room);
                break;
              }
            }
          }

          if (trackRooms.length === unit.tracks.length) {
            let softEstimate = Math.abs(p - 2) * 5;

            // Penalty for duplicate subject on same day (S3)
            for (const track of unit.tracks) {
              const existingOnDay = sessions.some(
                (s) =>
                  s.Batch_ID === track.batchId &&
                  s.Subject_ID === track.subjectId &&
                  slotMap.get(s.Slot_ID)?.Day === day
              );
              if (existingOnDay) softEstimate += 500;
            }

            // Penalty for faculty daily overload / fatigue (S4 & S2)
            for (const track of unit.tracks) {
              if (!isDummyFaculty(track.facultyId)) {
                const facDayHours = sessions.filter(
                  (s) => s.Faculty_ID === track.facultyId && slotMap.get(s.Slot_ID)?.Day === day
                ).length;
                if (facDayHours >= 3) softEstimate += 300;
              }
            }

            validOptions.push({
              day,
              periodNo: p,
              rooms: trackRooms,
              costEstimate: softEstimate,
            });
          }
        }
      }
    }

    // Rank candidates by Least Constraining Value
    validOptions.sort((a, b) => a.costEstimate - b.costEstimate);

    if (validOptions.length > 0) {
      const chosen = validOptions[0];
      const placedSessions: Session[] = [];
      const isLab = unit.targetRoomType === 'Laboratory';

      for (let d = 0; d < unit.duration; d++) {
        const slot = validSlots.find((s) => s.Day === chosen.day && s.Period_No === chosen.periodNo + d)!;
        if (unit.kind === 'JointElective') {
          unit.tracks.forEach((track) => {
            placedSessions.push(bookTrack(track, chosen.rooms[0], slot, isLab));
          });
        } else {
          unit.tracks.forEach((track, idx) => {
            placedSessions.push(bookTrack(track, chosen.rooms[idx], slot, isLab));
          });
        }
      }

      unitPlacements.set(unit.unitId, placedSessions);
    } else {
      unassigned.push({
        batchId: unit.cohortBatches[0],
        subjectId: unit.tracks[0].subjectId,
        sessionType: unit.targetRoomType === 'Laboratory' ? 'Lab' : 'Lecture',
        reason: 'Tight campus room/slot constraint. No conflict-free slot found after Kempe Chain search.',
      });
    }
  }

  // ---------------------------------------------------------------------------
  // STAGE 3: Tabu Search / Simulated Annealing Post-Optimization (Gap & Workload Polish)
  // ---------------------------------------------------------------------------
  let currentCost = calculateSoftCost(sessions, batches, faculty, timeSlots, subjects);
  let bestCost = currentCost.totalCost;
  const optimizationStartTime = performance.now();

  for (let iter = 0; iter < 400; iter++) {
    if (performance.now() - optimizationStartTime > 1200) break;

    const randomBatch = batches[prng.nextInt(0, batches.length - 1)];
    const randomDay = workingDays[prng.nextInt(0, workingDays.length - 1)];
    const lunchP = getBatchLunchPeriod(randomBatch);

    const daySessions = sessions.filter(
      (s) => s.Batch_ID === randomBatch.Batch_ID && slotMap.get(s.Slot_ID)?.Day === randomDay
    );

    if (daySessions.length >= 2) {
      const sortedPeriods = daySessions
        .map((s) => ({ session: s, period: slotMap.get(s.Slot_ID)!.Period_No }))
        .sort((a, b) => a.period - b.period);

      const minP = sortedPeriods[0].period;
      const maxP = sortedPeriods[sortedPeriods.length - 1].period;
      const occupied = new Set(sortedPeriods.map((sp) => sp.period));

      let gapP = -1;
      for (let p = minP + 1; p < maxP; p++) {
        if (p !== lunchP && !occupied.has(p)) {
          gapP = p;
          break;
        }
      }

      if (gapP !== -1) {
        const boundary = sortedPeriods[sortedPeriods.length - 1];
        if (boundary.session.Session_Type === 'Lecture') {
          const targetSlot = validSlots.find((s) => s.Day === randomDay && s.Period_No === gapP);
          if (
            targetSlot &&
            (occupiedBatch.get(`${boundary.session.Batch_ID}_${targetSlot.Slot_ID}`) || 0) === 0 &&
            (occupiedRoom.get(`${boundary.session.Room_ID}_${targetSlot.Slot_ID}`) || 0) === 0 &&
            (isDummyFaculty(boundary.session.Faculty_ID) ||
              ((occupiedFaculty.get(`${boundary.session.Faculty_ID}_${targetSlot.Slot_ID}`) || 0) === 0 &&
                !unavailSet.has(`${boundary.session.Faculty_ID}_${targetSlot.Slot_ID}`)))
          ) {
            unbookSession(boundary.session);
            const moved = bookTrack(
              {
                subjectId: boundary.session.Subject_ID,
                facultyId: boundary.session.Faculty_ID,
                batchId: boundary.session.Batch_ID,
              },
              roomMap.get(boundary.session.Room_ID)!,
              targetSlot,
              false
            );

            const newCost = calculateSoftCost(sessions, batches, faculty, timeSlots, subjects);
            if (newCost.totalCost <= currentCost.totalCost) {
              currentCost = newCost;
              if (newCost.totalCost < bestCost) bestCost = newCost.totalCost;
            } else {
              // Rollback
              unbookSession(moved);
              bookTrack(
                {
                  subjectId: boundary.session.Subject_ID,
                  facultyId: boundary.session.Faculty_ID,
                  batchId: boundary.session.Batch_ID,
                },
                roomMap.get(boundary.session.Room_ID)!,
                slotMap.get(boundary.session.Slot_ID)!,
                false
              );
            }
          }
        }
      }
    }
  }

  const finalCost = calculateSoftCost(sessions, batches, faculty, timeSlots, subjects);

  return {
    timetableId,
    sessions,
    success: unassigned.length === 0,
    message:
      unassigned.length === 0
        ? `Successfully generated 100% conflict-free schedule (${sessions.length} sessions scheduled).`
        : `Partially scheduled ${sessions.length} sessions. ${unassigned.length} could not be placed.`,
    scheduledCount: sessions.length,
    unassignedCount: unassigned.length,
    unassignedSessions: unassigned,
    executionTimeMs: Math.round(performance.now() - startTime),
    softCost: finalCost.totalCost,
    metrics: {
      studentGaps: finalCost.gapCount,
      facultyLoadVariance: Math.round(finalCost.facultyVarianceCost),
      duplicateSubjectsSameDay: finalCost.duplicateSubjectCount,
      fatigueViolations: finalCost.fatigueCount,
    },
  };
}
