-- ==============================================================================
-- COLLEGE MANAGEMENT SYSTEM (CMS) - ACCOUNTANT MODULE DATABASE SCHEMA (PostgreSQL)
-- ==============================================================================

-- 1. Shared / Core Tables (Created only if not already provided by other modules)
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'ACCOUNTANT', 'STUDENT', 'FACULTY', 'HOD')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    department VARCHAR(100) NOT NULL,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 5),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 10),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Accountant Module Tables

-- Fee Structures
CREATE TABLE IF NOT EXISTS fee_structures (
    id SERIAL PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 5),
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 10),
    tuition_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tuition_fee >= 0),
    exam_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (exam_fee >= 0),
    library_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (library_fee >= 0),
    transport_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (transport_fee >= 0),
    hostel_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (hostel_fee >= 0),
    other_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (other_fee >= 0),
    total_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_fee >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fee_structure UNIQUE (academic_year, department, year, semester)
);

-- Student Fees
CREATE TABLE IF NOT EXISTS student_fees (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    fee_structure_id INT REFERENCES fee_structures(id) ON DELETE RESTRICT,
    academic_year VARCHAR(20) NOT NULL,
    total_fee NUMERIC(10, 2) NOT NULL CHECK (total_fee >= 0),
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    pending_amount NUMERIC(10, 2) NOT NULL CHECK (pending_amount >= 0),
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PAID', 'PARTIAL', 'PENDING', 'OVERDUE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_academic_fee UNIQUE (student_id, academic_year, fee_structure_id)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
    student_fee_id INT NOT NULL REFERENCES student_fees(id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Card', 'Bank Transfer', 'Online')),
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Pending', 'Failed')),
    recorded_by VARCHAR(100) NOT NULL DEFAULT 'Accountant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Receipts
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    payment_id INT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
    student_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    accountant_name VARCHAR(100) NOT NULL DEFAULT 'College Accountant',
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);
CREATE INDEX IF NOT EXISTS idx_student_fees_student ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);
