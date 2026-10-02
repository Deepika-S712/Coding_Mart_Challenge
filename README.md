# College Management System (CMS)

A modern, high-performance, single-project **College Management System (CMS)** integrating three distinct role-based modules:
1. **Student Module**
2. **Faculty / Teacher Module**
3. **Accountant / Finance Module**

Built with an enterprise clean design system, unified routing, secure role isolation, in-memory mock repository architecture, and zero external database dependencies.

---

## 🏛️ Architecture Overview

The system strictly follows a clean 5-layer enterprise architecture:

```text
React Frontend (Tailwind + Lucide + Context API)
      │
      ↓
  Axios API Client (Token Interceptor & Error Normalizer)
      │
      ↓
 Express Routes (Role-Guarded Middlewares)
      │
      ↓
  Controllers (Request Parsing & Response Formatting)
      │
      ↓
   Services (Business Logic, Validations & Overpayment Rules)
      │
      ↓
 Repositories (Data Access & Query Logic)
      │
      ↓
 In-Memory Mock Data (Stateful Demo Entities)
```

> **Note**: Controllers never access mock arrays directly. All mutations and lookups pass through Repositories and Services, allowing future replacement with any SQL/NoSQL database by swapping the repository implementation.

---

## ⚡ Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS & Vanilla Design Tokens (`cms-ds.css`)
- **Icons**: Lucide React
- **API Client**: Axios with Bearer token interceptor and centralized error standardizer
- **State Management**: React Context API (`AuthContext`, `ToastContext`)

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Middleware**: CORS, Morgan logger, Custom Token & Role-Based Authorization
- **Data Persistence**: In-Memory Mock Data Store (Auto-resets upon restart)

---

## 🔑 Demo Login Credentials

The application provides a single login entry (`/login`) with role tabs and a **"Use Demo Credentials"** one-click filler button:

| Role | Email | Password | Primary Dashboard | Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@cms.com` | `Student@123` | `/student/dashboard` | Attendance, Timetable, Fees, Results (Password: `Result@123`), Exams |
| **Faculty** | `faculty@cms.com` | `Faculty@123` | `/faculty/dashboard` | Students CRUD, Mark Attendance, Timetable, Assignments, Assessments, Exam Score Locking |
| **Accountant** | `accountant@cms.com` | `Accountant@123` | `/accountant/dashboard` | Fee Structures, Payments, Receipts, Overdue Recovery, Financial Reports |

---

## 📁 Project Structure

```text
college-management-system/
│
├── package.json              # Orchestrates concurrent execution of backend & frontend
├── README.md                 # Complete documentation & usage guide
│
├── backend/                  # Node.js + Express.js In-Memory REST Backend
│   ├── package.json
│   └── src/
│       ├── server.js         # HTTP Server Entry on port 5000
│       ├── app.js            # Express application setup, middlewares, routes
│       │
│       ├── data/             # In-memory mock data arrays (16 domain entities)
│       │   ├── users.js
│       │   ├── students.js
│       │   ├── faculty.js
│       │   ├── subjects.js
│       │   ├── attendance.js
│       │   ├── timetable.js
│       │   ├── fees.js
│       │   ├── feeStructures.js
│       │   ├── announcements.js
│       │   ├── notices.js
│       │   ├── results.js
│       │   ├── exams.js
│       │   ├── assignments.js
│       │   ├── assessments.js
│       │   ├── content.js
│       │   └── payments.js
│       │
│       ├── repositories/     # Repository layer isolating data access
│       ├── services/         # Business logic layer
│       ├── controllers/      # REST API Controllers
│       ├── routes/           # Role-guarded Express route handlers
│       └── middleware/       # Auth & error handling middlewares
│
└── frontend/                 # React + Vite Single Page Application
    ├── package.json
    ├── vite.config.js        # Vite dev server with /api proxy to localhost:5000
    ├── tailwind.config.js    # Enterprise color palette and typography
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx           # Global router with protected role routes
        ├── index.css
        ├── api/apiClient.js
        ├── auth/             # AuthContext, ProtectedRoute, LoginPage
        ├── components/
        │   ├── common/       # Button, Input, Select, Card, Table, Badge, Modal, Drawer, Skeleton, EmptyState, ErrorState, Toast, StatCard
        │   └── layout/       # AppLayout, Sidebar, TopNavbar
        ├── styles/cms-ds.css
        ├── student/pages/    # Student Dashboard, Profile, Attendance, Timetable, Fees, Announcements, Results, Exams
        ├── faculty/pages/    # Faculty Dashboard, Subjects, Students, Attendance, Timetable, Content, Assignments, Assessments, ExamScores, Notices, Reports, Profile
        └── accountant/pages/ # Accountant Dashboard, FeeStructure, StudentFeesLedger, Payments, Receipts, PendingFees, FinancialReports
```

---

## 🚀 Installation & Running

### Option 1: One-Command Startup (Recommended)

From the root project directory:

```bash
# 1. Install root, backend, and frontend dependencies
npm run install:all

# 2. Run both backend and frontend concurrently
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

### Option 2: Run Separately in Two Terminals

**Terminal 1 (Backend)**:
```bash
cd backend
npm install
npm start
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 Available Frontend Routes

### Common & Authentication
- `/login` — Unified role-based login portal
- `/` — Automatic redirect to role-specific dashboard

### Student Module (`/student/*`)
- `/student/dashboard` — Overview of attendance, next exam, pending fees, today's classes
- `/student/profile` — Full biographical, hostel, and academic details
- `/student/attendance` — Monthly charts and subject-wise percentage matrix
- `/student/timetable` — 45-min periods, day switcher, room allocation, and recess schedules
- `/student/fees` — Tuition, hostel, bus, and scholarship breakdown
- `/student/announcements` — Filterable circulars and notices
- `/student/results` — Security PIN protected academic transcript (`Result@123`)
- `/student/exams` — Mid-semester schedule with upcoming exam spotlight

### Faculty Module (`/faculty/*`)
- `/faculty/dashboard` — Course workload, quick actions, schedule, and pending grading
- `/faculty/subjects` — Course credits, syllabus progress, and weekly hours
- `/faculty/students` — Student directory with full Add, Edit, View, and Delete CRUD
- `/faculty/attendance` — Daily register with Present/Absent toggles and instant percentage calculation
- `/faculty/timetable` — Weekly lecture scheduler with CRUD slot modals
- `/faculty/content` — Notes, slides, videos, and syllabus materials library
- `/faculty/assignments` — Assignment creation, submission reviews, and score evaluation
- `/faculty/assessments` — Unit tests, lab quizzes, marks entry, and statistical distribution (Avg, High, Low, Pass Rate)
- `/faculty/exams` — Marks entry with Save Draft and **Final Submit & Lock** mechanism
- `/faculty/notices` — Broadcast bulletins with priority tags and Pin/Unpin actions
- `/faculty/reports` — Tabular analytics for student performance and subject metrics
- `/faculty/profile` — Faculty academic credentials and office hours

### Accountant Module (`/accountant/*`)
- `/accountant/dashboard` — Total collection, today's income, monthly projections, and trend graph
- `/accountant/fee-structure` — Department fee schedules with automatic gross computation
- `/accountant/student-fees` — Student account ledgers and payment history
- `/accountant/payments` — Payment recorder with **Overpayment Protection** and instant receipt generation
- `/accountant/receipts` — Official receipt archive with printable receipt voucher
- `/accountant/pending-fees` — Filterable outstanding balances and overdue day counters
- `/accountant/reports` — Department recovery rates, revenue trends, and payment mode breakdowns

---

## 🛡️ Business Rules Implemented

1. **Role Access Control**: Students cannot access `/faculty/*` or `/accountant/*`, and vice-versa. Attempting unauthorized access shows a clean `403 Forbidden` guard with a redirect button to their own dashboard.
2. **Student Result Security**: Marks are protected behind a result verification gate (`Result@123`) before rendering grade sheets.
3. **Overpayment Prevention**: The accountant module calculates `Outstanding Balance = Total Fee - Already Paid`. If a payment exceeds this balance, it is rejected with an explanatory error message.
4. **Exam Score Submission Lock**: Faculty can edit scores in `DRAFT` state. Once `SUBMITTED`, inputs are locked and subsequent modifications are rejected.
5. **Real In-Memory CRUD**: Adding, updating, or deleting students, assignments, attendance, fee structures, or payments updates the backend repository in real-time.

---

## 🔮 Future Database Integration

To integrate a permanent database (e.g. PostgreSQL with Prisma or MongoDB with Mongoose):
1. Replace the methods inside `backend/src/repositories/*` with actual ORM/database queries.
2. The Controllers and Services require zero modifications, ensuring clean separation of concerns.
