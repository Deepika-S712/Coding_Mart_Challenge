# Teacher/Faculty Module — Master Architecture & Implementation Plan
**College Management System (CMS)**  
**Specification Reference:** CMS-DS v1.0  
**Current Date:** October 2026  
**Status:** Audit Completed • Strategic Implementation Plan Prepared

---

## 1. Executive Summary & Objective

The objective is to deliver a complete, self-contained, enterprise-grade **Teacher/Faculty Module** for the College Management System (CMS). The module covers faculty authentication, dashboard analytics, course curriculum management, student management, attendance tracking, scheduling, assignments, assessments, formal exam score submission, notices, analytical reports, and profile management.

### Architectural Invariants:
1. **Strict 5-Tier Data Flow:**
   $$\text{Frontend (React)} \longrightarrow \text{API Client} \longrightarrow \text{Backend Controller} \longrightarrow \text{Service Layer} \longrightarrow \text{Repository Layer} \longrightarrow \text{In-Memory Mock Data}$$
2. **Zero Database / Zero Migration Policy:**
   No SQL/NoSQL schema migrations, ORMs, or physical database instances exist. The repository layer isolates all storage access so that replacing mock data with a shared production database in the future requires modifying **only** the repository layer, without touching controllers or frontend code.
3. **Design System (CMS-DS v1.0):**
   Strictly uniform enterprise aesthetics without arbitrary styling, gradients, or decorative glassmorphism. Uses standard color tokens (`#2563EB` primary, `#F8FAFC` page background, `#0F172A` text), Lucide icons, standardized input heights, radius tokens (`8px`), and common reusable components (`Button`, `Input`, `Card`, `Table`, `Badge`, `Modal`, `Skeleton`, `EmptyState`, `ErrorState`).
4. **Security & Role-Based Access Control:**
   - Multi-step authorization: Authenticated token $\rightarrow$ Role verification (`role === 'FACULTY'`) $\rightarrow$ Permission $\rightarrow$ Resource ownership (e.g. verifying assigned subjects/classes).
   - In-memory mock token system (`mock-token-FAC001` or generated session tokens).

---

## 2. Current Codebase Audit & Gap Analysis

A comprehensive audit of `backend/` and `frontend/` reveals that foundational layers and several major features are already implemented to high enterprise standards, while 7 frontend pages currently utilize `PlaceholderPage`.

### 2.1 Backend Audit (100% Core Endpoints Built)

| Layer | Component | Status | Details |
|---|---|---|---|
| **Config & Server** | `server.js`, `config/index.js` | ✅ Complete | Express server on port 5000 with CORS, JSON body parser, health check `/api/health`, global error handler. |
| **Auth** | `authRoutes`, `authController`, `authService`, `authMiddleware` | ✅ Complete | Email + password verification, mock token generation/revocation, `role === 'FACULTY'` checks, generic error messages. |
| **Faculty & Profile** | `facultyController`, `facultyRepository` | ✅ Complete | Dashboard summary aggregation, profile retrieval, profile update, assigned subjects. |
| **Students** | `studentController`, `studentService`, `studentRepository` | ✅ Complete | Full CRUD operations, filtering by class, roll number uniqueness checks. |
| **Attendance** | `attendanceController`, `attendanceService`, `attendanceRepository` | ✅ Complete | Attendance sheet creation, editing, student roster status marking, percentage aggregation. |
| **Timetable** | `timetableController`, `timetableService`, `timetableRepository` | ✅ Complete | Schedule CRUD, today's schedule query, day-of-week sorting. |
| **Subject Content** | `contentController`, `contentService`, `contentRepository` | ✅ Complete | Material upload/link/note management, subject assignment authorization. |
| **Assignments** | `assignmentController`, `assignmentService`, `assignmentRepository` | ✅ Complete | Assignment CRUD, submission roster tracking, grading and feedback endpoint. |
| **Assessments** | `assessmentController`, `assessmentService`, `assessmentRepository` | ✅ Complete | Internal assessments, quizzes, unit tests, automatic student roster generation, mark entry. |
| **Exam Scores** | `examController`, `examService`, `examRepository` | ✅ Complete | Mid/End semester exams, score save (draft), single score update, finalized exam submission. |
| **Notices** | `noticeController`, `noticeService`, `noticeRepository` | ✅ Complete | Notice CRUD, priority management, category tagging, pinning. |
| **Reports** | `reportController`, `reportService` | ✅ Complete | 6 report generators (attendance, marks, assignments, assessments, student performance, subject performance). |
| **Validation** | `validators/commonValidators.js`, `authValidator.js` | ✅ Complete | Independent backend validation for all inputs. |

---

### 2.2 Frontend Audit (Architecture & Page Matrix)

| Section / Route | Component | Status | Description |
|---|---|---|---|
| **Design System** | `styles/cms-ds.css` | ✅ Complete | Full CMS-DS v1.0 CSS tokens, typography, grid, buttons, badges, tables, drawer animations. |
| **Common UI** | `components/common/*` | ✅ Complete | `Button`, `Input`, `Card`, `Table`, `Badge`, `Modal`, `Skeleton`, `EmptyState`, `ErrorState`. |
| **Layout & Shell** | `FacultyLayout`, `Sidebar`, `Navbar` | ✅ Complete | Responsive collapsible drawer for mobile, desktop sidebar, profile dropdown, logout action. |
| **Auth State** | `AuthContext.jsx`, `ProtectedRoute.jsx` | ✅ Complete | Token & user in localStorage, role enforcement, redirection to `/login`. |
| **API Client** | `api/apiClient.js` + 11 Domain APIs | ✅ Complete | Fully typed API caller with Bearer token injection, 401 redirection, unified error handling. |
| `/login` | `pages/LoginPage.jsx` | ✅ Complete | Enterprise layout, email/password validation, eye toggle icon, demo credentials button. |
| `/faculty/dashboard` | `pages/DashboardPage.jsx` | ✅ Complete | 4 KPI cards, today's classes table, recent activity feed, quick action shortcuts. |
| `/faculty/subjects` | `pages/SubjectsPage.jsx` | ✅ Complete | Course cards, credits, enrolled student counts, syllabus completion progress bars. |
| `/faculty/students` | `pages/StudentsPage.jsx` | ✅ Complete | Search, class filter, add/edit student modal, student profile details modal, deletion. |
| `/faculty/attendance` | `pages/AttendancePage.jsx` | ✅ Complete | Date/subject/class filters, mark attendance sheet with student roster, edit sheet, breakdown modal. |
| `/faculty/timetable` | `pages/TimetablePage.jsx` | ✅ Complete | Weekly schedule matrix, today's schedule cards, add/edit/delete time slots modal. |
| `/faculty/content` | `PlaceholderPage` | ⏳ **PENDING** | Requires `ContentPage.jsx` (notes, PDFs, videos, links, upload modal). |
| `/faculty/assignments`| `PlaceholderPage` | ⏳ **PENDING** | Requires `AssignmentsPage.jsx` (create, publish, view submissions, grade modal). |
| `/faculty/assessments`| `PlaceholderPage` | ⏳ **PENDING** | Requires `AssessmentsPage.jsx` (schedule test, mark entry table, calculate stats). |
| `/faculty/exam-scores`| `PlaceholderPage` | ⏳ **PENDING** | Requires `ExamScoresPage.jsx` (formal exam mark entry, save draft, submit final lock). |
| `/faculty/notices` | `PlaceholderPage` | ⏳ **PENDING** | Requires `NoticesPage.jsx` (bulletin board, create notice, priority badges, pin/unpin). |
| `/faculty/reports` | `PlaceholderPage` | ⏳ **PENDING** | Requires `ReportsPage.jsx` (tabs for Attendance, Marks, Assignment, Assessment, Performance). |
| `/faculty/profile` | `PlaceholderPage` | ⏳ **PENDING** | Requires `ProfilePage.jsx` (faculty bio, qualifications, assigned courses, update form). |

---

## 3. Detailed Technical Blueprint for Pending Pages

Each of the pending 7 pages will be built using the exact patterns established in `StudentsPage.jsx` and `AttendancePage.jsx`:
- Consume only backend endpoints via the corresponding `frontend/src/api/*.js` module.
- Provide all four UI states: **Loading** (`Skeleton`), **Empty** (`EmptyState`), **Error** (`ErrorState` with retry callback), and **Success** (`useToast` notifications).
- Comply with CMS-DS v1.0 responsive CSS classes and spacing.

---

### 3.1 Subject Content (`ContentPage.jsx`)
- **Route:** `/faculty/content`
- **API Module:** `contentApi.js` (`getAll`, `getById`, `create`, `update`, `delete`)
- **Key Features:**
  1. Filter by assigned subject (`CS301`, `CS302`, `CS305`) and content type (`All`, `Notes`, `PDF`, `Document`, `Presentation`, `Video`, `External Resource`).
  2. Search bar for filtering topics and titles in real time.
  3. Content card list / table with metadata: Topic, Upload Date, File Size, Type Badge, Direct Link/Download button.
  4. "Add Material" modal: Title, Topic, Subject, Target Class, Content Type, External Link or File Path, Description, Tags.
  5. Edit Material modal and Delete confirmation dialog with error handling.

---

### 3.2 Assignments (`AssignmentsPage.jsx`)
- **Route:** `/faculty/assignments`
- **API Module:** `assignmentApi.js` (`getAll`, `getById`, `create`, `update`, `delete`, `gradeSubmission`)
- **Key Features:**
  1. Header metrics: Total Assignments, Active/Published, Total Submissions, Pending Grading.
  2. Tabbed or filtered list by subject and status (`All`, `Published`, `Draft`, `Closed`).
  3. "Create Assignment" modal: Title, Subject, Class, Due Date, Due Time, Maximum Marks, Instructions text area, Attachment reference.
  4. Submissions drawer/modal:
     - Displays all submitted student papers with submission timestamp, attached file name, and current grade.
     - "Grade Submission" action: Opens a score input (out of `maxMarks`) and faculty feedback text area.
     - Saves evaluation via `POST /api/faculty/assignments/:id/submissions/:subId/grade`.

---

### 3.3 Assessments (`AssessmentsPage.jsx`)
- **Route:** `/faculty/assessments`
- **API Module:** `assessmentApi.js` (`getAll`, `getById`, `create`, `update`, `delete`, `updateMarks`)
- **Key Features:**
  1. Overview of continuous internal assessments (Unit Tests, Lab Quizzes, Surprise Tests).
  2. "Create Assessment" modal: Subject, Class, Assessment Title, Type, Date, Maximum Marks. Auto-provisions student roster upon creation via backend service.
  3. Marks Entry & Results modal:
     - Tabular view of student roll numbers, names, and editable marks input fields.
     - Real-time client validation ensuring marks do not exceed `maxMarks`.
     - Calculates average, highest, and lowest scores on the fly.
     - "Save Marks" action calling `PUT /api/faculty/assessments/:id/marks`.

---

### 3.4 Exam Scores (`ExamScoresPage.jsx`)
- **Route:** `/faculty/exam-scores`
- **API Module:** `examApi.js` (`getAll`, `getScores`, `saveScores`, `updateSingleScore`, `submitScores`)
- **Key Features:**
  1. Formal examination selector (e.g. Mid-Semester 2026, End-Semester 2026).
  2. Subject navigation tabs (`CS301`, `CS302`, `CS305`).
  3. Status indicator badge: `Draft`, `Saved`, or `Submitted` (locked).
  4. Scoring sheet table:
     - Columns: Roll Number, Student Name, Marks Obtained (input), Grade auto-calculation (A+, A, B, C, F), Remarks input.
     - Batch "Save as Draft" button (`POST /api/faculty/exams/:id/scores`).
     - "Submit Final Scores" button with irreversible locking confirmation modal (`POST /api/faculty/exams/:id/scores/submit`). When submitted, inputs become disabled.
  5. Statistical performance summary card: Class Average, Pass Rate %, Highest Score.

---

### 3.5 Notices (`NoticesPage.jsx`)
- **Route:** `/faculty/notices`
- **API Module:** `noticeApi.js` (`getAll`, `getById`, `create`, `update`, `delete`)
- **Key Features:**
  1. Departmental and classroom bulletin boards.
  2. Priority indicators (`High`, `Normal`, `Urgent`) and Pinned notice cards highlighted at top.
  3. Filter by category (`Academic`, `Examination`, `Urgent`, `General`) and audience (`CSE-3A`, `All`).
  4. "Publish Notice" modal: Title, Category, Priority, Target Class, Notice Content, Pin toggle.
  5. Edit and delete actions with confirmation dialogs.

---

### 3.6 Reports Suite (`ReportsPage.jsx`)
- **Route:** `/faculty/reports`
- **API Module:** `reportApi.js` (6 report endpoints)
- **Key Features:**
  1. Multi-tab report hub:
     - **Tab 1: Attendance Report:** Subject-wise average attendance %, total classes held, students with attendance shortage (<75%) highlighted in amber/red badges.
     - **Tab 2: Exam & Marks Report:** Evaluation completion status, average class performance, score distributions.
     - **Tab 3: Assignment Report:** Submission compliance rates, pending grading statistics.
     - **Tab 4: Assessment Report:** Continuous internal evaluation breakdown.
     - **Tab 5: Student Performance Report:** Comprehensive student cards with attendance %, assignment grades, and exam scores.
     - **Tab 6: Subject Performance Report:** Course syllabus completion %, overall batch health.
  2. Clean, enterprise print/export view.

---

### 3.7 Faculty Profile (`ProfilePage.jsx`)
- **Route:** `/faculty/profile`
- **API Module:** `facultyApi.js` (`getProfile`, `updateProfile`)
- **Key Features:**
  1. Faculty Identity Card: Name, Employee ID (`FAC001`), Department, Designation, Email, Joining Date, Experience.
  2. Assigned workload overview: Table of assigned subjects, batches, and weekly lecture hours.
  3. Editable contact details: Phone number, office block/room, highest educational qualification.
  4. "Save Changes" action with immediate cache invalidation and toast feedback.

---

## 4. Phased Execution Roadmap

```
Phase 1: Course Content Management (ContentPage.jsx)
   └── Deliver subject-wise repository for lecture notes, slides, and links.

Phase 2: Assignments & Grading Workflow (AssignmentsPage.jsx)
   └── Implement assignment publishing, student submission viewing, and grading.

Phase 3: Internal Assessments (AssessmentsPage.jsx)
   └── Implement test scheduling and continuous evaluation marks entry.

Phase 4: Formal Exam Scores (ExamScoresPage.jsx)
   └── Implement official university exam mark entry, grade computation, draft saving, and final lock.

Phase 5: Notices & Communications (NoticesPage.jsx)
   └── Implement classroom announcements, priority tagging, and notice pinning.

Phase 6: Analytical Reports Suite (ReportsPage.jsx)
   └── Implement unified 6-tab analytics dashboard for attendance, marks, and student performance.

Phase 7: Profile Management (ProfilePage.jsx)
   └── Implement faculty credentials, assigned curriculum review, and contact updates.

Phase 8: Router Integration & Responsive Verification
   └── Update App.jsx to replace all PlaceholderPages, verify mobile drawer, and test end-to-end flows.
```

---

## 5. Quality Assurance & Verification Plan

1. **Authentication & Role Isolation:**
   - Verify unauthenticated requests redirect to `/login`.
   - Verify tokens without `role === 'FACULTY'` are rejected with `403 FORBIDDEN`.
   - Verify logout completely purges tokens and user state from `localStorage`.
2. **Resource Ownership Security:**
   - Attempting to access or post to subjects outside `FAC001`'s assignment (`CS301`, `CS302`, `CS305`) triggers `403 FORBIDDEN_RESOURCE`.
3. **Data Integrity & Immutability:**
   - Submitted exam marks cannot be modified once `submissionStatus === 'Submitted'`.
   - Attendance percentages compute accurately based on present counts over total classes.
4. **Responsive Testing:**
   - Desktop (1440px+): Standard 260px fixed sidebar, multi-column grids.
   - Tablet (768px - 1024px): 2-column grids, horizontal table scrolling.
   - Mobile (<768px): Sidebar collapses into off-canvas drawer opened via hamburger button, single-column forms, touch-friendly tap targets.
5. **No Final Database Guarantee:**
   - Ensure all data manipulations occur solely within backend mock repository arrays in-memory.

---
*Document prepared for execution. No existing code modified.*
