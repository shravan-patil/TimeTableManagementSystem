# VJTI Time Table Management System (TTMS)
## Institutional Timetable Generation, Scheduling and Conflict Management

**Department of Computer Engineering & Information Technology**  
**Veermata Jijabai Technological Institute (VJTI), Matunga, Mumbai**  
**Academic Year:** 2026–27  

---

## 📖 Project Overview & Architecture Mapping

This project is a high-performance **Next.js & React** application built specifically for the **Timetable Committee & Department Coordinators**, implementing the exact specifications from the SRS, ER Diagram, Data Dictionary, and Data Flow Diagrams (DFDs).

### 1. Data Model (ER Diagram & Relational Schema Section 2.4)
The implementation strictly follows the relational schema:
- **`User`** (`User_ID`, `User_Name`, `Role`, `Password_Hash`, `Email`)
- **`Faculty`** (`Faculty_ID`, `Faculty_Name`, `Department`, `Max_Weekly_Load`, `Email`)
- **`Subject`** (`Subject_ID`, `Subject_Name`, `Subject_Type`, `Hours_Per_Week`, `Credits`)
- **`Batch`** (`Batch_ID`, `Division`, `Year`, `Strength`, `Department`)
- **`Room`** (`Room_ID`, `Room_No`, `Room_Type`, `Capacity`)
- **`TimeSlot`** (`Slot_ID`, `Day`, `Period_No`, `Start_Time`, `End_Time`)
- **`Faculty_Subject`** (`Faculty_ID`, `Subject_ID`) — M:N teacher eligibility
- **`Faculty_Availability`** (`Faculty_ID`, `Slot_ID`, `Is_Available`) — M:N availability constraints
- **`Timetable`** (`Timetable_ID`, `Academic_Term`, `Version_No`, `Status`, `Created_By`, `Created_On`, `Published_On`)
- **`Session`** (`Session_ID`, `Timetable_ID`, `Subject_ID`, `Faculty_ID`, `Batch_ID`, `Room_ID`, `Slot_ID`, `Session_Type`)
- **`Leave_Request`** (`Leave_ID`, `Faculty_ID`, `From_Date`, `To_Date`, `Reason`, `Status`)
- **`Substitution`** (`Sub_ID`, `Leave_ID`, `Session_ID`, `Substitute_Faculty_ID`, `Sub_Date`, `Action`, `Status`)
- **`Change_Log`** (`Log_ID`, `Timetable_ID`, `Change_Type`, `Description`, `Reason`, `Changed_By`, `Changed_On`) — D5 Audit Trail
- **`Notification`** (`Notif_ID`, `Log_ID`, `Recipient_ID`, `Message`, `Sent_On`, `Is_Read`) — D6 Broadcast Store

### 2. Functional Modeling (Level-1 DFD Processes)
- **Process 1.0 (Manage Master Data):** Full CRUD for faculty, curriculum subjects, batches/divisions, rooms/labs, time slots, and eligibility.
- **Process 2.0 (Generate Timetable & Allocate Rooms):** Constraint-satisfaction heuristic algorithm that schedules theory and practical sessions without double booking, respects lab block requirements, and balances weekly workload.
- **Process 3.0 (Detect & Resolve Conflicts):** Real-time conflict engine enforcing relational integrity:
  - `UNIQUE(Timetable_ID, Faculty_ID, Slot_ID)`
  - `UNIQUE(Timetable_ID, Room_ID, Slot_ID)`
  - `UNIQUE(Timetable_ID, Batch_ID, Slot_ID)`
  - Room type checking (Labs require `Laboratory`) & capacity checks.
- **Process 4.0 (Manage Workload & Availability):** Live weekly teaching load bars, quota limits, and interactive slot availability matrix.
- **Process 5.0 (Manage Leave & Substitution):** Intelligent recommendation engine ranking substitute faculty by subject expertise, free slots, and remaining weekly hours.
- **Process 6.0 (Publish Timetable & Notify):** Life cycle state machine (`Draft Generated` → `Under Review` → `Finalized` → `Published` → `Revised`), timestamped audit trail, and campus notification broadcasts.

---

## 🚀 How to Run the Application

### Prerequisites
- Node.js (version 18.x or higher)
- npm or yarn

### Steps to Run
```bash
# 1. Install dependencies
npm install

# 2. Run the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🛠 Project Structure

```
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── next.config.mjs            # Next.js build configuration
├── tailwind.config.js         # Institutional styling & color palette
├── src/
│   ├── app/
│   │   ├── globals.css        # Tailwind directives & print media rules
│   │   ├── layout.tsx         # Root layout with metadata
│   │   └── page.tsx           # Primary Coordinator Portal orchestrator
│   ├── types/
│   │   └── ttms.ts            # Type definitions for all 14 ER entities & constraints
│   ├── data/
│   │   └── dummyData.ts       # Realistic VJTI CE & IT department datasets
│   ├── lib/
│   │   ├── schedulingAlgorithm.ts  # Heuristic constraint-based scheduling engine
│   │   ├── conflictDetector.ts     # Real-time uniqueness & capacity clash validator
│   │   └── substitutionEngine.ts   # Smart substitute recommendation engine
│   └── components/
│       ├── Header.tsx              # Institute branding, life cycle pill, alerts
│       ├── Sidebar.tsx             # Process-mapped navigation
│       ├── DashboardOverview.tsx   # KPI metrics & life-cycle stepper
│       ├── TimetableGenerator.tsx  # Algorithm parameter configuration & solver
│       ├── TimetableGrid.tsx       # Multi-filter interactive timetable editor
│       ├── SessionEditModal.tsx    # Live clash-preview manual session editor
│       ├── MasterDataManager.tsx   # Master data repository (D1)
│       ├── WorkloadManager.tsx     # Workload balancing & availability matrix (D3)
│       ├── LeaveSubstitutionManager.tsx # Leave impact & substitute matching (D4)
│       ├── RoomOccupancyView.tsx   # Room utilization heatmap (FR-9)
│       ├── ChangeLogView.tsx       # Modification audit trail (D5)
│       └── NotificationModal.tsx   # Campus change notifications (D6)
```

