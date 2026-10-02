# College Management System (CMS) — Accountant Module

Welcome to the **Accountant Module** of the College Management System (CMS). This module provides comprehensive fee management, transaction auditing, student dues tracking, payment processing, and institutional financial reporting in strict accordance with the **CMS-DS v1.0** design specifications.

---

## 1. Technology Stack

### Frontend
- **Framework**: React 18 (SPA)
- **Tooling / Bundler**: Vite 5
- **Routing**: React Router DOM v6 (Nested layout routing under `/accountant`)
- **Styling**: Tailwind CSS 3 (configured with CMS-DS v1.0 design tokens)
- **Icons**: Lucide React (`lucide-react`)
- **HTTP Client**: Axios with centralized request/response interceptors

### Backend
- **Runtime**: Node.js (v18+ / v20+ / v22+)
- **Framework**: Express.js
- **Database**: PostgreSQL (with connection pooling via `pg` and an embedded local fallback adapter)
- **Security & RBAC**: Stateless JSON Web Tokens (JWT) + bcryptjs password hashing
- **Validation**: Strict server-side payload validation for financial integrity

---

## 2. Architecture & Design Principles

```text
       Accountant Frontend (React 18 + Vite)
               |
               | REST APIs (/api/accountant/*)
               ↓
       Accountant Backend (Node.js + Express.js)
               |
               | Parameterized SQL
               ↓
       PostgreSQL Database (cms_db)
```

- **Maximum Isolation + Minimum Disruption**: All Accountant frontend code lives under `src/accountant/`, and the backend lives in `accountant-backend/`.
- **Zero Collision**: Shared tables (`students`, `departments`, `users`) are reused via foreign keys. No duplicate `accountant_students` tables.
- **CMS-DS v1.0 Compliant**: Primary `#2563EB`, Success `#16A34A`, Warning `#F59E0B`, Error `#DC2626`, Info `#0284C7`, Inter font typography, standard radii and Lucide icons.

---

## 3. Directory Structure

```text
project_1/
├── accountant-backend/            # Node.js + Express.js + PostgreSQL Backend
│   ├── scripts/
│   │   ├── initDb.js              # PostgreSQL DDL runner
│   │   └── seedData.js            # Realistic seed data populator
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # pg.Pool with development adapter
│   │   │   └── schema.sql         # PostgreSQL DDL schema & relations
│   │   ├── controllers/           # HTTP Request Controllers
│   │   ├── middleware/            # JWT Auth, Role RBAC & Error Handlers
│   │   ├── routes/                # Express Route Handlers
│   │   ├── services/              # Business Logic & DB Queries
│   │   ├── utils/                 # Standardized JSON response helpers
│   │   ├── validators/            # Financial input validation
│   │   ├── app.js                 # Express Application
│   │   └── server.js              # HTTP Server Listener
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
└── frontend/
    └── src/
        ├── accountant/            # Isolated Accountant Module Frontend
        │   ├── api/
        │   │   └── accountantApi.js # Centralized API Service
        │   ├── components/
        │   │   ├── charts/        # Pure SVG Collection & Method Charts
        │   │   ├── common/        # Badge, EmptyState, ErrorState, Skeletons
        │   │   ├── layout/        # AccountantLayout, Sidebar, Navbar
        │   │   └── modals/        # FeeStructure, RecordPayment, Receipt, etc.
        │   └── pages/
        │       ├── AccountantDashboardPage.jsx
        │       ├── FeeStructurePage.jsx
        │       ├── StudentFeesPage.jsx
        │       ├── PaymentsPage.jsx
        │       ├── ReceiptsPage.jsx
        │       ├── PendingFeesPage.jsx
        │       └── FinancialReportsPage.jsx
```

---

## 4. Setup & Installation

### Step 1: Backend Installation & Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd accountant-backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows PowerShell: `Copy-Item .env.example .env`)*

4. **Environment Variables**:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=super_secret_accountant_cms_jwt_key_2026
   JWT_EXPIRES_IN=7d
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cms_db
   CLIENT_URL=http://localhost:5173
   ```

5. **Database Setup**:
   - If PostgreSQL is installed locally:
     ```bash
     # Initialize tables and constraints
     npm run db:init

     # Populate demo seed records
     npm run db:seed
     ```
   - *Note: If PostgreSQL is not currently running, the backend automatically initializes an in-memory database adapter pre-seeded with identical data, so the application runs immediately without local database barriers.*

6. Start the backend server:
   ```bash
   npm run dev
   # The backend runs on http://localhost:5000
   ```

---

### Step 2: Frontend Installation & Launch

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   # The frontend runs on http://localhost:5173
   ```

---

## 5. Usage & Features

### Login & Access
1. Navigate to `http://localhost:5173/login`.
2. Click the **Accountant** credential chip (`accountant / Accountant@123`) or enter:
   - **Username**: `accountant`
   - **Password**: `Accountant@123`
3. Click **Sign In**. You will be routed directly to `/accountant/dashboard`.

### Navigation Routes
- **Dashboard** (`/accountant/dashboard`): Metric cards (Total Collection, Pending Fees, Today's Collection, Monthly Collection), recent payments table, and pending fees summary.
- **Fee Structure** (`/accountant/fee-structure`): Create, inspect, edit, and delete academic fee schedules with automatic fee summation and validations.
- **Student Fees** (`/accountant/student-fees`): Search student accounts, inspect fee assessment breakdowns, payment ledgers, and trigger payments.
- **Payments** (`/accountant/payments`): Record fee collections (Cash, UPI, Card, Bank Transfer, Online), validate amounts against outstanding dues, and issue receipts.
- **Receipts** (`/accountant/receipts`): Archive of institutional receipts with a printable modal (`window.print()`).
- **Pending Fees** (`/accountant/pending-fees`): Dedicated ledger of overdue and partial fee accounts.
- **Financial Reports** (`/accountant/reports`): Revenue trend visualizations, department-wise breakdowns, and payment method summaries with date filters.

---

## 6. REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/accountant/auth/login` | Authenticate Accountant user & return JWT |
| `GET` | `/api/accountant/dashboard` | Dashboard KPIs, recent payments, & dues summary |
| `GET` | `/api/accountant/fee-structures` | List & filter fee schedules |
| `POST` | `/api/accountant/fee-structures` | Create fee structure with validation |
| `GET` | `/api/accountant/fee-structures/:id` | Get single fee structure details |
| `PUT` | `/api/accountant/fee-structures/:id` | Update fee structure schedule |
| `DELETE` | `/api/accountant/fee-structures/:id` | Delete fee schedule |
| `GET` | `/api/accountant/student-fees` | Search student fee statuses |
| `GET` | `/api/accountant/student-fees/:studentId` | Full fee ledger & history for a student |
| `GET` | `/api/accountant/pending-fees` | Filter pending & overdue student fees |
| `GET` | `/api/accountant/payments` | Payment transactions list with filters |
| `GET` | `/api/accountant/payments/:id` | Single payment detail |
| `POST` | `/api/accountant/payments` | Record payment & generate receipt |
| `GET` | `/api/accountant/receipts` | Issued receipts archive |
| `GET` | `/api/accountant/receipts/:id` | Detailed receipt voucher |
| `GET` | `/api/accountant/reports` | Analytics, trend chart, & breakdown data |
| `GET` | `/api/accountant/departments` | Department dropdown options |
| `GET` | `/api/accountant/students` | Student picker options |

---

## 7. Testing & Verification

The backend can be tested independently of the frontend using curl, Postman, or PowerShell:

```powershell
# 1. Health check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# 2. Get Accountant Dashboard
Invoke-RestMethod -Uri "http://localhost:5000/api/accountant/dashboard"

# 3. Get Fee Structures
Invoke-RestMethod -Uri "http://localhost:5000/api/accountant/fee-structures"

# 4. Record a Payment
$body = @{
    student_id = "STU-2024-002"
    student_fee_id = 2
    amount = 5000
    payment_method = "UPI"
    transaction_id = "TXN-TEST-123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/accountant/payments" -Method Post -Body $body -ContentType "application/json"
```
