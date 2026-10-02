# College Management System (CMS) — Accountant Backend

Production-ready backend API service for the **Accountant Module** of the College Management System (CMS). Built with **Node.js**, **Express.js**, and **PostgreSQL** in strict accordance with the CMS-DS v1.0 specifications and RESTful API standards.

---

## 1. Technology Stack

- **Runtime**: Node.js (v18+ / v20+ / v22+)
- **Framework**: Express.js
- **Database**: PostgreSQL (with pg connection pooling and embedded runtime adapter)
- **Authentication**: Stateless JSON Web Tokens (JWT) + bcryptjs
- **Validation**: Strict server-side payload validation for financial integrity
- **Security**: CORS, Parameterized SQL queries, Environment variables

---

## 2. Directory Structure

```text
accountant-backend/
├── scripts/
│   ├── initDb.js          # PostgreSQL DDL schema initialization runner
│   └── seedData.js        # Seed realistic financial records runner
├── src/
│   ├── config/
│   │   ├── db.js          # PostgreSQL Pool & development adapter
│   │   └── schema.sql     # Full PostgreSQL DDL schema with foreign keys
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commonController.js
│   │   ├── dashboardController.js
│   │   ├── feeStructureController.js
│   │   ├── paymentController.js
│   │   ├── receiptController.js
│   │   ├── reportController.js
│   │   └── studentFeeController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── roleMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── feeStructureRoutes.js
│   │   ├── index.js
│   │   ├── paymentRoutes.js
│   │   ├── receiptRoutes.js
│   │   ├── reportRoutes.js
│   │   └── studentFeeRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── dashboardService.js
│   │   ├── feeStructureService.js
│   │   ├── paymentService.js
│   │   ├── receiptService.js
│   │   ├── reportService.js
│   │   └── studentFeeService.js
│   ├── utils/
│   │   └── responseHelper.js
│   ├── validators/
│   │   ├── feeStructureValidator.js
│   │   └── paymentValidator.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Environment Variables

Create a `.env` file in the `accountant-backend` directory based on `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# JWT Secret & Expiry
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# PostgreSQL Connection
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cms_db
# Or individual connection parameters:
# PGHOST=localhost
# PGPORT=5432
# PGUSER=postgres
# PGPASSWORD=postgres
# PGDATABASE=cms_db

# Frontend Client URL
CLIENT_URL=http://localhost:5173
```

---

## 4. Database Setup & Initialization

### With PostgreSQL:
1. Ensure your PostgreSQL server is active.
2. Create the target database if not already created:
   ```sql
   CREATE DATABASE cms_db;
   ```
3. Run the schema initialization script:
   ```bash
   npm run db:init
   ```
4. Populate sample seed data (departments, users, fee structures, students, student fees, payments, receipts):
   ```bash
   npm run db:seed
   ```

*Note: If PostgreSQL is not active during local development, the backend automatically activates an in-memory adapter pre-populated with identical seed data, allowing complete API testing without configuration blockers.*

---

## 5. Installation & Launch

```bash
# 1. Navigate to backend directory
cd accountant-backend

# 2. Install dependencies
npm install

# 3. Start development server (with watch mode)
npm run dev

# Or start in production mode
npm start
```

The server starts by default at `http://localhost:5000`.

---

## 6. REST API Endpoints

### Authentication
- `POST /api/accountant/auth/login`: Authenticate accountant/admin and receive JWT.
- `GET  /api/accountant/auth/me`: Get current authenticated user profile.

### Dashboard
- `GET  /api/accountant/dashboard`: Metric cards (total, pending, today, monthly, pending count) + recent transactions + pending fee summary.

### Fee Structures
- `GET    /api/accountant/fee-structures`: Paginated list of fee structures with search & filters (department, year, semester, status).
- `POST   /api/accountant/fee-structures`: Create new fee structure with automated total fee calculation and non-negative validation.
- `GET    /api/accountant/fee-structures/:id`: View fee structure details.
- `PUT    /api/accountant/fee-structures/:id`: Update existing fee structure.
- `DELETE /api/accountant/fee-structures/:id`: Delete fee structure (blocked if assigned to students).

### Student Fees
- `GET /api/accountant/student-fees`: Search and filter student fee accounts (by department, year, semester, status).
- `GET /api/accountant/student-fees/:studentId`: Complete student fee profile, assigned fees, and payment ledger.

### Payments
- `GET  /api/accountant/payments`: Paginated payment history with filters (search, payment method, status, date range).
- `GET  /api/accountant/payments/:id`: Single payment detail with linked receipt and student details.
- `POST /api/accountant/payments`: Record a student fee payment. Validates student existence, positive amount, and pending fee limits. Atomically updates student fee balances and automatically issues a formal receipt.

### Receipts
- `GET /api/accountant/receipts`: View issued receipts with search.
- `GET /api/accountant/receipts/:id`: Complete printable receipt information.

### Pending Fees
- `GET /api/accountant/pending-fees`: Filter and list students with unpaid or overdue fee balances.

### Financial Reports
- `GET /api/accountant/reports`: Daily, monthly, department-wise collection analytics, pending totals, and payment method breakdown with optional `fromDate` and `toDate` filtering.

### Lookups
- `GET /api/accountant/departments`: List of college departments for select dropdowns.
- `GET /api/accountant/students`: Searchable list of students for payment processing.
- `GET /api/accountant/students/:studentId/pending-fees`: Pending fees for a specific student.
