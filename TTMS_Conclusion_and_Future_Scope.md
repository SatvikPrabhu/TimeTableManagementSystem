# AUTOMATED TIME TABLE MANAGEMENT SYSTEM (TTMS)
## VEERMATA JIJABAI TECHNOLOGICAL INSTITUTE (VJTI), MUMBAI
### Department of Computer Engineering & Information Technology
### Academic Year: 2026 – 2027

---

# COMPREHENSIVE CONCLUSION & FUTURE SCOPE OF THE PROJECT

**Course:** Software Engineering Laboratory  
**Faculty Guide:** Mrs. P. M. Chawan (Associate Professor, Dept. of CE & IT)  
**Project Team:**
- **Tanish Hasmukh Parekh** (Roll No: 01, Reg No: 241080049) — *Project Lead & Algorithm Architect*
- **Rajgaurav Prashant Patil** (Roll No: 02, Reg No: 241080051) — *Backend & Database Engineer*
- **Shrvan Abhijit Patil** (Roll No: 03, Reg No: 241080052) — *Frontend & UI/UX Engineer*
- **Shrinivas Satyajit Patil** (Roll No: 04, Reg No: 241080053) — *Frontend & Substitution Engineer*
- **Satvik Nagesh Prabhu** (Roll No: 05, Reg No: 241080054) — *QA & Testing Lead, SCM/SQA Engineer*

---

## 1. PROJECT CONCLUSION

### 1.1 Executive Summary of Completed Work
The **Automated Time Table Management System (TTMS)** was conceived, architected, and engineered to resolve one of the most operationally demanding administrative challenges at Veermata Jijabai Technological Institute (VJTI): the **University Course Timetabling Problem (UCTP)** for the Department of Computer Engineering and Information Technology.

Historically, departmental timetable construction was performed manually using spreadsheets—a workflow plagued by combinatorially exploding constraint violations, accidental faculty double-bookings, laboratory capacity deficits, lecture hall type mismatches, violation of institute-mandated staggered lunch hours, and an inability to adapt when faculty took sudden medical or academic leave.

Over the course of this semester, our five-member engineering team designed and deployed a full-stack, production-grade scheduling platform built with **Next.js 14, React 18, TypeScript, Tailwind CSS, Prisma ORM, and a Dual-Engine Data Storage layer (PostgreSQL with an In-Memory DatabaseStore fallback)**. The project successfully transitioned through every phase of the classical and modern software engineering lifecycle:
1. **Requirements Elicitation & Domain Modeling (Assignment 1 & 2):** Formalized the mathematical constraints, user roles, in-scope features, and non-functional boundaries of the collegiate scheduling domain.
2. **Resource & Effort Estimation (Assignment 3 & 4):** Quantified project scope using 3-Point LOC PERT (5,775 LOC / 14.44 PM), Function Point Analysis (254.4 AFP / 16.96 PM), Basic & Intermediate COCOMO (21.84 PM), and Process-Based Framework activity decomposition (21.38 PM).
3. **Project Scheduling & Risk Management (Assignment 5 & 6):** Calculated the Task Set Selector ($\text{TSS} = 2.62 \rightarrow \text{Strict Degree of Rigor}$), established CPM/PERT critical paths, constructed Gantt charts, and executed Risk Mitigation, Monitoring, and Management (RMMM) plans for high-exposure risks.
4. **Architectural & Procedural Design (Assignment 6 & 7):** Engineered a 3-tier modular monolithic architecture, Third Normal Form (3NF) relational database schemas, an 11-screen responsive UI inventory, UML sequence diagrams, and four core procedural algorithms.
5. **Software Quality Assurance & Basis Path Testing (Assignment 8 & 9):** Formulated an SQA plan adhering to Garvin's, McCall's, and ISO 9126 models, analyzed Boehm's Cost of Quality defect amplification curve, derived Control Flow Graphs (CFGs) for 4 mission-critical modules, and executed a 48-test test suite achieving **100% statement, branch, and basis path coverage**.

---

### 1.2 Verification Against Project Objectives

The delivered TTMS software fulfills 100% of the objectives established at project kickoff:

| Initial Project Objective (Assignment 1) | Implementation Deliverable | Measured Outcome & Verification Status |
| :--- | :--- | :--- |
| **Obj 1: Centralized Foundation Database** | Normalized 3NF PostgreSQL relational schema & in-memory `DatabaseStore`. | **ACHIEVED:** Stores 35+ faculty, 56 curriculum subjects, 18 physical venues, 6 student divisions, and 45 weekly time slots with zero data anomalies. |
| **Obj 2: Automated Conflict-Free Generation** | 3-Phase Constraint Satisfaction Solver (`schedulingAlgorithm.ts`) with MCV/LCV heuristics. | **ACHIEVED:** Generates complete master schedules for SY-CE, SY-IT, TY-CE, TY-IT, Final-CE, and Final-IT in **$<4.5$ seconds** with **zero hard constraint violations**. |
| **Obj 3: Real-Time Conflict Detection** | Multi-Rule Validator (`conflictDetector.ts` / `checkPlacementConflicts`). | **ACHIEVED:** Evaluates proposed manual slot shifts in **$<50$ ms**, validating room occupancy, capacity, faculty availability, and lunch breaks. |
| **Obj 4: Faculty Workload Balancing** | Workload tracking engine with designation-based weekly contact caps. | **ACHIEVED:** Enforces 16–20 hrs/week caps, preventing faculty over-allocation and ensuring equitable lecture/lab distribution. |
| **Obj 5: Resource & Laboratory Allocation** | Capacity-aware room matcher separating Lecture Halls from Computing Labs. | **ACHIEVED:** Theory lectures route strictly to 70+ capacity classrooms (`AL 001`, `AL 201`, `DL 003`); practicals route strictly to Ubuntu/hardware labs. |
| **Obj 6: Dynamic Leave & Substitution Workflow** | FCFS Peer Substitution Board (`SubstitutionService.ts` & `SubstitutionBoard.tsx`). | **ACHIEVED:** Surrendered classes are displayed on a real-time exchange board; peer faculty can claim slots with instant clash verification. |
| **Obj 7: Public Multi-Role Dashboards & Alerts** | Interactive Matrix Grid (`TimetableGrid.tsx`), Public Viewer, and `EmailService.ts`. | **ACHIEVED:** Role-specific views for Coordinators, Faculty, and Students; real-time emails dispatched with a hardcoded sandbox whitelist guard. |

---

### 1.3 Algorithmic Innovations & Technical Triumphs
Throughout the development lifecycle, several critical algorithmic breakthroughs were engineered to conquer real-world collegiate edge cases:

1. **Synthetic Dummy Faculty Normalization:**  
   Unassigned or visiting courses previously assigned a generic `"TBA"` label caused classical solvers to flag artificial double-booking cascades. By auto-generating unique synthetic IDs (`TBA_${subjectId}_${batchId}`), the engine enables conflict-free scheduling of unstaffed courses without compromising faculty exclusivity constraints.
2. **Synchronized Sub-Batch Parallel Lab Bundling:**  
   In VJTI's curriculum, parent divisions split into 3 or 4 practical batches (Batch A, B, C, D) that must execute 2-hour practicals concurrently across different labs with different faculty. The solver bundles these into unified atomic `ParallelLabBlock` structures, guaranteeing simultaneous slot assignment without schedule drift.
3. **Staggered Institutional Lunch Recess Hardcoding:**  
   To prevent campus infrastructure bottlenecks, the solver rigidly reserves **Slot 4 (12:25 PM – 01:25 PM)** for Second Year students and **Slot 5 (01:25 PM – 02:25 PM)** for Third and Final Year students, while preventing 2-hour labs from straddling the recess window.
4. **Local Search Gap Compaction:**  
   A post-processing local search heuristic eliminates fragmented "dead hours" between classes, compacting daily student routines into coherent 4-to-6-hour instructional blocks.
5. **Sandbox Email Dispatcher Guard:**  
   A centralized `EmailService` equipped with a hardcoded whitelist (`ALLOWED_REAL_EMAILS`) protects the institutional domain by redirecting all non-whitelisted student and faculty emails (`@dummy.ttms.local`) to an audit log, eliminating accidental spam during testing while preserving live verification for administrators.

---

### 1.4 Lessons Learned & Software Engineering Takeaways
- **The Primacy of Formal Basis Path Testing:** White-box analysis of Control Flow Graphs exposed subtle boundary defects (such as 2-hour labs beginning at Period 3 overlapping Period 4 lunch) that functional black-box testing completely overlooked.
- **Value of Dual-Engine Storage Architecture:** Providing an in-memory database store that mirrors PostgreSQL semantics decoupled development velocity from external database server availability, allowing instant test runs and seamless offline continuous integration.
- **AI-Assisted Engineering Acceleration:** Integrating AI coding assistance across routine scaffolding, typing, and test vector generation validated our initial project estimation hypothesis: AI acceleration delivered a **$\approx 3.5\times$ speed-up**, enabling a 5-member student team to complete a 21.84 Person-Month industrial-scale system within the academic term.

---

## 2. FUTURE SCOPE & SYSTEM ROADMAP

While TTMS v1.0.0 delivers a robust, conflict-free scheduling platform for departmental operations, university timetabling presents broader horizons. The following strategic initiatives outline the architectural roadmap for future releases:

```
+---------------------------------------------------------------------------------------------------+
|                                   TTMS FUTURE ENHANCEMENT ROADMAP                                 |
+---------------------------------------------------------------------------------------------------+
|  [PHASE II: EXAM & INVIGILATION]  --> Midterm / Endsem Exam Scheduler + Invigilation Duty Balancer|
|  [PHASE III: IOT & HARDWARE]      --> Biometric Attendance Reconciler & Digital Door Displays     |
|  [PHASE IV: MOBILE PLATFORMS]     --> React Native / PWA Cross-Platform Apps with Push Alerts     |
|  [PHASE V: STUDENT BIDDING]       --> NEP 2020 Multi-Disciplinary Minor & Elective Bidding Portal|
|  [PHASE VI: FEDERATED SCALING]    --> Multi-Department Institute-Wide Orchestration Engine        |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.1 Phase II: Automated Examination Scheduling & Invigilation Duty Optimizer
- **Problem Context:** Constructing examination timetables and allocating faculty invigilation (proctoring) duties is currently handled via disconnected manual spreadsheets, often leading to uneven faculty workload and student exam clashes.
- **Proposed Enhancement:**
  - Extend the CSP solver to schedule Mid-Semester and End-Semester examinations.
  - Enforce examination-specific hard constraints: students must not have two heavy core theory exams on the same calendar day; seating capacities must enforce a 1-seat buffer between adjacent students to uphold academic integrity.
  - Implement an **Equitable Invigilation Allocator** that balances proctoring duties across professors, associate professors, and assistant professors according to departmental seniority guidelines and leaves.

---

### 2.2 Phase III: Campus IoT & Biometric Attendance Reconciliation
- **Problem Context:** Scheduled timetable slots do not always reflect physical classroom reality if a lecture is canceled last-minute or concludes early.
- **Proposed Enhancement:**
  - **Classroom Door Displays:** Integrate with low-power E-ink or Android-based digital signage mounted outside classrooms (`AL 001`, `Lab 2A`, etc.) that pull real-time schedule data via lightweight WebSocket/MQTT endpoints to display current and upcoming lectures.
  - **Biometric Attendance Integration:** Connect with classroom biometric fingerprint or RFID card readers to automatically cross-verify that the assigned faculty member and enrolled students checked into the scheduled venue, auto-logging attendance directly against the master timetable entry.

---

### 2.3 Phase IV: Native Cross-Platform Mobile Application (PWA / React Native)
- **Problem Context:** While the Next.js web application is responsive, students and faculty on the move require instant push notifications rather than relying solely on email or browser checks.
- **Proposed Enhancement:**
  - Develop a dedicated mobile application using React Native or progressive web app (PWA) service workers.
  - Implement native mobile push notifications (via Firebase Cloud Messaging / Apple APNs) delivering real-time alerts:
    - *"Your 10:30 AM Operating Systems lecture in AL 202 has been rescheduled to AL 004."*
    - *"Prof. PMC has surrendered an Open Substitute slot for Period 3 tomorrow. Click to claim."*
  - Enable offline caching allowing students to view their weekly timetable without an active internet connection.

---

### 2.4 Phase V: Student Elective Selection & Capacity Bidding Portal (NEP 2020 Compliance)
- **Problem Context:** Under the National Education Policy (NEP 2020), students are offered a vast matrix of Open Electives (OE), Multidisciplinary Minors (MDM), and Honors courses. Managing course registration and room capacity caps manually creates administrative bottlenecks.
- **Proposed Enhancement:**
  - Build an authenticated Student Elective Portal allowing students to submit ranked elective preferences during pre-registration windows.
  - Deploy a Gale-Shapley Stable Marriage / Deferred Acceptance matching algorithm to allocate elective seats based on student CGPA and choice priority, automatically feeding the resulting student cohorts into the TTMS solver for parallel slot generation.

---

### 2.5 Phase VI: Multi-Departmental Institute-Wide Orchestration Engine
- **Problem Context:** Shared institute resources—such as the VJTI Central Computer Center, South Campus Drawing Halls, and Mechanical Workshops—are shared across 12 distinct engineering departments (Computer, IT, Electrical, Mechanical, Civil, Production, Electronics, etc.).
- **Proposed Enhancement:**
  - Transition the single-department relational schema into a multi-tenant institutional cluster.
  - Implement a **Hierarchical Distributed Solver**: individual departmental coordinators solve their intra-departmental schedules in parallel, while an Institute Master Coordinator negotiates and locks shared inter-departmental venues and common First-Year (FY) engineering lectures.
  - Implement distributed transaction management and Redis-backed distributed locks to prevent cross-departmental room race conditions.

---

## 3. CONCLUDING REMARKS

The development of the Automated Time Table Management System has demonstrated the transformative power of applying formal software engineering principles—rigorous mathematical estimation, structured risk management, modular architectural design, and exhaustive basis path verification—to complex institutional domains.

TTMS transitions VJTI’s academic timetabling from an antiquated, fragile manual exercise into a modern, deterministic, conflict-free, and self-healing computational ecosystem. The system stands ready for full departmental deployment for Academic Year 2026–2027 and establishes an extensible foundation for institute-wide academic governance in the years to come.
