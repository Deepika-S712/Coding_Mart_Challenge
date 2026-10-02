# College Management System (Admin-Only Portal)

A complete, production-grade **Admin-Only College Management System** full-stack web application built with **React (JavaScript)**, **Node.js / Express**, and a **PostgreSQL** relational database.

---

## 1. Important Scope Notice

> [!IMPORTANT]
> This application contains **STRICTLY the Admin module**.
> It intentionally does **NOT** contain Student, Faculty, HOD, or Accountant portals or logins.
> The **Admin** is the exclusive authority who authenticates and manages all college operations.

---

## 2. Key Features

- **Admin Authentication**:
  - Secure bcrypt password hashing (10 salt rounds).
  - JWT token authentication stored client-side and verified server-side.
  - Role-based authorization (`role = ADMIN`).
  - Protected routing preventing unauthenticated portal access.
- **Admin Dashboard**:
  - Summary metrics: Total Students, Total Faculty, Total Departments, Total Courses, Total Subjects.
  - Chart.js visual statistics: Students by department, faculty distribution, and courses by department.
  - Real-time Admin activity feed logged dynamically into PostgreSQL.
  - 100% database-driven (zero hard-coded numbers).
- **Student Management**:
  - Paginated student roster with multi-field search and filters (Department, Course, Year, Status).
  - Add, View, Edit, and Delete student records with confirmation modal.
  - Full tracking of Student ID, personal details, contact info, enrollment dates, and status.
- **Faculty Management**:
  - Faculty directory with department assignment and designation badges.
  - Multi-subject assignment mapping (`faculty_subjects` junction table).
  - Add, View, Edit, and Delete instructors.
- **Department Management**:
  - Academic departments overview displaying linked student count, faculty count, and course counts.
  - Modal-based creation, editing, and deletion.
- **Course Management**:
  - Degree programs (Undergraduate, Postgraduate, Diploma) linked to departments.
  - Course duration, code uniqueness, and curriculum counts.
- **Subject Management**:
  - Curriculum subjects with semester allocation, credit weights, and professor assignments.
  - Course filtering and detail tracking.
- **Timetable Management & Conflict Validation**:
  - Weekly lecture scheduling (Monday through Saturday).
  - **Automated Faculty Conflict Validation**: Disallows scheduling the same faculty member in multiple classes at overlapping times on the same day.
  - **Automated Room Conflict Validation**: Disallows booking the same lecture hall or lab for multiple classes at overlapping times.
  - Clear, user-friendly conflict warning banners.
- **Reports & Analytics**:
  - Categorized reports for Students, Faculty, Courses, and Subjects.
  - Interactive Chart.js charts and summary distribution tables.
  - One-click CSV exports for students, faculty, courses, and timetable.
- **Admin Settings & Security**:
  - Admin name, email, and password updates with BCrypt re-hashing.
  - PostgreSQL connectivity and security status inspection.

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js 18 (Vite, JavaScript - no TypeScript)
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (Centralized API service with Bearer token interceptors)
- **Icons**: Lucide React
- **Charts**: Chart.js & React-Chartjs-2
- **Styling**: Modern, responsive custom CSS design system using the specified color palette and Inter typography.

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database Client**: `pg` (node-postgres connection pooling)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password Hashing**: `bcryptjs`
- **Environment**: `dotenv`
- **CORS**: Cross-Origin Resource Sharing enabled
- **HTTP Logger**: `morgan`

### Database
- **Engine**: PostgreSQL 17
- **Design**: Normalized relational database with primary keys, foreign keys (`ON DELETE CASCADE` / `ON DELETE SET NULL`), unique constraints, and performance indexes.

---

## 4. Project Folder Structure

```text
college-management-admin/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── Alert.jsx
│   │   │       ├── Badge.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Pagination.jsx
│   │   │       └── StatsCard.jsx
│   │   ├── pages/
│   │   │   ├── Courses/
│   │   │   │   └── CourseList.jsx
│   │   │   ├── Departments/
│   │   │   │   └── DepartmentList.jsx
│   │   │   ├── Faculty/
│   │   │   │   ├── FacultyDetail.jsx
│   │   │   │   ├── FacultyForm.jsx
│   │   │   │   └── FacultyList.jsx
│   │   │   ├── Reports/
│   │   │   │   └── Reports.jsx
│   │   │   ├── Settings/
│   │   │   │   └── Settings.jsx
│   │   │   ├── Students/
│   │   │   │   ├── StudentDetail.jsx
│   │   │   │   ├── StudentForm.jsx
│   │   │   │   └── StudentList.jsx
│   │   │   ├── Subjects/
│   │   │   │   └── SubjectList.jsx
│   │   │   ├── Timetable/
│   │   │   │   └── TimetableList.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── NotFound.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── dashboardController.js
│   │   ├── departmentController.js
│   │   ├── facultyController.js
│   │   ├── reportController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   └── timetableController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── facultyRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── subjectRoutes.js
│   │   └── timetableRoutes.js
│   ├── models/
│   ├── services/
│   ├── utils/
│   │   ├── activityLogger.js
│   │   ├── initDb.js
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── database/
│   └── schema.sql
│
├── package.json
└── README.md
```

---

## 5. PostgreSQL Database Setup

1. **Ensure PostgreSQL is Running**:
   Confirm PostgreSQL service is running on port `5432`.

2. **Create the Database**:
   Open `psql` or pgAdmin and run:
   ```sql
   CREATE DATABASE college_management_db;
   ```

3. **Database Schema**:
   The SQL schema in `database/schema.sql` creates all 9 normalized tables:
   - `users`
   - `departments`
   - `courses`
   - `faculty`
   - `subjects`
   - `faculty_subjects`
   - `students`
   - `timetable`
   - `activity_logs`

---

## 6. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=college_management_db
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/college_management_db
JWT_SECRET=college_admin_secure_jwt_token_key_2026_xyz
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. Admin Account & Initial Seed Data

To populate the database with the default Admin user, sample departments, courses, faculty, subjects, students, timetable, and activity feed:

```bash
cd backend
npm run seed
```

### Default Admin Credentials:
- **Email**: `admin@college.edu`
- **Password**: `AdminPassword123!`
- **Role**: `ADMIN`

---

## 8. Installation & Running the Project

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Initialize Database and Seed Data
```bash
npm run seed
```

### Step 3: Start the Backend Server
```bash
npm run dev
```
Backend API will start at: `http://localhost:5000`

### Step 4: Install Frontend Dependencies
In a new terminal window:
```bash
cd frontend
npm install
```

### Step 5: Start Frontend Development Server
```bash
npm run dev
```
Frontend application will be accessible at: `http://localhost:5173`

---

## 9. API Documentation

All protected routes require the HTTP header:
`Authorization: Bearer <JWT_TOKEN>`

### Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/admin/login` | Admin login & JWT generation | Public |
| `GET` | `/api/admin/me` | Fetch authenticated Admin profile | Admin Only |
| `PUT` | `/api/admin/profile` | Update profile or change password | Admin Only |

### Dashboard & Analytics
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Summary cards, Chart.js stats & activity feed | Admin Only |

### Students
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/students` | Get paginated student list (with filters) | Admin Only |
| `GET` | `/api/admin/students/:id` | Get student details by ID | Admin Only |
| `POST` | `/api/admin/students` | Add new student | Admin Only |
| `PUT` | `/api/admin/students/:id` | Update student details | Admin Only |
| `DELETE` | `/api/admin/students/:id` | Delete student record | Admin Only |

### Faculty
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/faculty` | Get faculty list (with filters & assigned subjects) | Admin Only |
| `GET` | `/api/admin/faculty/:id` | Get faculty profile | Admin Only |
| `POST` | `/api/admin/faculty` | Register new faculty member | Admin Only |
| `PUT` | `/api/admin/faculty/:id` | Update faculty details & subject assignments | Admin Only |
| `DELETE` | `/api/admin/faculty/:id` | Delete faculty member | Admin Only |

### Departments
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/departments` | Get departments with student/faculty/course counts | Admin Only |
| `POST` | `/api/admin/departments` | Create new department | Admin Only |
| `PUT` | `/api/admin/departments/:id` | Update department details | Admin Only |
| `DELETE` | `/api/admin/departments/:id` | Delete department | Admin Only |

### Courses
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/courses` | Get courses list (supports department filter) | Admin Only |
| `POST` | `/api/admin/courses` | Create new course | Admin Only |
| `PUT` | `/api/admin/courses/:id` | Update course details | Admin Only |
| `DELETE` | `/api/admin/courses/:id` | Delete course | Admin Only |

### Subjects
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/subjects` | Get subjects list (supports course filter) | Admin Only |
| `POST` | `/api/admin/subjects` | Create subject & assign faculty | Admin Only |
| `PUT` | `/api/admin/subjects/:id` | Update subject details & faculty | Admin Only |
| `DELETE` | `/api/admin/subjects/:id` | Delete subject | Admin Only |

### Timetable
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/timetable` | Get timetable entries (day/dept/course filters) | Admin Only |
| `POST` | `/api/admin/timetable` | Create timetable slot with conflict validation | Admin Only |
| `PUT` | `/api/admin/timetable/:id` | Update slot with conflict validation | Admin Only |
| `DELETE` | `/api/admin/timetable/:id` | Delete timetable slot | Admin Only |

### Reports
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/reports` | Get comprehensive aggregate reports | Admin Only |
| `GET` | `/api/admin/reports/export/:entity` | Download CSV for `students`, `faculty`, `courses`, `timetable` | Admin Only |

---

## 10. Automated End-to-End Validation Suite

To execute the automated end-to-end test suite verifying authentication, route protection, CRUD operations, timetable conflict validation, and CSV export:

```bash
cd backend
node test-e2e.js
```

---

## 11. Screenshots Section Placeholder

| Admin Sign In | Admin Dashboard Overview |
|:---:|:---:|
| *(Screenshots / Login)* | *(Screenshots / Dashboard)* |

| Student Management & Filters | Timetable Conflict Check |
|:---:|:---:|
| *(Screenshots / Students)* | *(Screenshots / Timetable)* |
