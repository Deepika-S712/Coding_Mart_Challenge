const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let pool = null;
let isPostgresConnected = false;

// In-Memory store fallback in case PostgreSQL is temporarily unavailable on developer machine
const inMemoryStore = {
  departments: [
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
    { id: 2, name: 'Information Technology', code: 'IT' },
    { id: 3, name: 'Electronics & Communication', code: 'ECE' },
    { id: 4, name: 'Mechanical Engineering', code: 'ME' },
    { id: 5, name: 'Civil Engineering', code: 'CE' }
  ],
  users: [
    {
      id: 1,
      username: 'accountant',
      password: '$2a$10$wN9aW6Kqf6H/75D3l/q04eWl7XvO8.H/V44p6u3mP5eYV/jAEvdSm', // Accountant@123
      full_name: 'Robert Miller',
      email: 'accountant@college.edu',
      role: 'ACCOUNTANT'
    },
    {
      id: 2,
      username: 'admin',
      password: '$2a$10$wN9aW6Kqf6H/75D3l/q04eWl7XvO8.H/V44p6u3mP5eYV/jAEvdSm',
      full_name: 'System Admin',
      email: 'admin@college.edu',
      role: 'ADMIN'
    }
  ],
  students: [
    {
      id: 1,
      student_id: 'STU-2024-001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@college.edu',
      phone: '+1 555-0101',
      department_id: 1,
      department: 'Computer Science & Engineering',
      year: 2,
      semester: 4,
      status: 'ACTIVE'
    },
    {
      id: 2,
      student_id: 'STU-2024-002',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@college.edu',
      phone: '+1 555-0102',
      department_id: 2,
      department: 'Information Technology',
      year: 3,
      semester: 5,
      status: 'ACTIVE'
    },
    {
      id: 3,
      student_id: 'STU-2024-003',
      first_name: 'Michael',
      last_name: 'Brown',
      email: 'michael.brown@college.edu',
      phone: '+1 555-0103',
      department_id: 3,
      department: 'Electronics & Communication',
      year: 1,
      semester: 2,
      status: 'ACTIVE'
    },
    {
      id: 4,
      student_id: 'STU-2024-004',
      first_name: 'Emily',
      last_name: 'Davis',
      email: 'emily.davis@college.edu',
      phone: '+1 555-0104',
      department_id: 4,
      department: 'Mechanical Engineering',
      year: 4,
      semester: 7,
      status: 'ACTIVE'
    },
    {
      id: 5,
      student_id: 'STU-2024-005',
      first_name: 'Alex',
      last_name: 'Wilson',
      email: 'alex.wilson@college.edu',
      phone: '+1 555-0105',
      department_id: 5,
      department: 'Civil Engineering',
      year: 2,
      semester: 3,
      status: 'ACTIVE'
    },
    {
      id: 6,
      student_id: 'STU-2024-006',
      first_name: 'Sarah',
      last_name: 'Jenkins',
      email: 'sarah.j@college.edu',
      phone: '+1 555-0106',
      department_id: 1,
      department: 'Computer Science & Engineering',
      year: 1,
      semester: 1,
      status: 'ACTIVE'
    }
  ],
  fee_structures: [
    {
      id: 1,
      academic_year: '2026-2027',
      department: 'Computer Science & Engineering',
      department_id: 1,
      year: 2,
      semester: 4,
      tuition_fee: 45000.00,
      exam_fee: 3000.00,
      library_fee: 2000.00,
      transport_fee: 5000.00,
      hostel_fee: 0.00,
      other_fee: 1000.00,
      total_fee: 56000.00,
      status: 'Active',
      created_at: new Date('2026-01-10')
    },
    {
      id: 2,
      academic_year: '2026-2027',
      department: 'Information Technology',
      department_id: 2,
      year: 3,
      semester: 5,
      tuition_fee: 42000.00,
      exam_fee: 3000.00,
      library_fee: 2000.00,
      transport_fee: 0.00,
      hostel_fee: 15000.00,
      other_fee: 1000.00,
      total_fee: 63000.00,
      status: 'Active',
      created_at: new Date('2026-01-11')
    },
    {
      id: 3,
      academic_year: '2026-2027',
      department: 'Electronics & Communication',
      department_id: 3,
      year: 1,
      semester: 2,
      tuition_fee: 40000.00,
      exam_fee: 2500.00,
      library_fee: 1500.00,
      transport_fee: 4000.00,
      hostel_fee: 0.00,
      other_fee: 1000.00,
      total_fee: 49000.00,
      status: 'Active',
      created_at: new Date('2026-01-12')
    },
    {
      id: 4,
      academic_year: '2026-2027',
      department: 'Mechanical Engineering',
      department_id: 4,
      year: 4,
      semester: 7,
      tuition_fee: 40000.00,
      exam_fee: 3500.00,
      library_fee: 2000.00,
      transport_fee: 0.00,
      hostel_fee: 12000.00,
      other_fee: 1500.00,
      total_fee: 59000.00,
      status: 'Active',
      created_at: new Date('2026-01-13')
    },
    {
      id: 5,
      academic_year: '2026-2027',
      department: 'Civil Engineering',
      department_id: 5,
      year: 2,
      semester: 3,
      tuition_fee: 38000.00,
      exam_fee: 2500.00,
      library_fee: 1500.00,
      transport_fee: 3500.00,
      hostel_fee: 0.00,
      other_fee: 1000.00,
      total_fee: 46500.00,
      status: 'Active',
      created_at: new Date('2026-01-14')
    },
    {
      id: 6,
      academic_year: '2026-2027',
      department: 'Computer Science & Engineering',
      department_id: 1,
      year: 1,
      semester: 1,
      tuition_fee: 48000.00,
      exam_fee: 3000.00,
      library_fee: 2500.00,
      transport_fee: 6000.00,
      hostel_fee: 0.00,
      other_fee: 2000.00,
      total_fee: 61500.00,
      status: 'Active',
      created_at: new Date('2026-01-15')
    }
  ],
  student_fees: [
    {
      id: 1,
      student_id: 'STU-2024-001',
      fee_structure_id: 1,
      academic_year: '2026-2027',
      total_fee: 56000.00,
      paid_amount: 56000.00,
      pending_amount: 0.00,
      due_date: '2026-10-15',
      status: 'PAID',
      created_at: new Date('2026-08-01')
    },
    {
      id: 2,
      student_id: 'STU-2024-002',
      fee_structure_id: 2,
      academic_year: '2026-2027',
      total_fee: 63000.00,
      paid_amount: 30000.00,
      pending_amount: 33000.00,
      due_date: '2026-10-25',
      status: 'PARTIAL',
      created_at: new Date('2026-08-01')
    },
    {
      id: 3,
      student_id: 'STU-2024-003',
      fee_structure_id: 3,
      academic_year: '2026-2027',
      total_fee: 49000.00,
      paid_amount: 0.00,
      pending_amount: 49000.00,
      due_date: '2026-09-15',
      status: 'OVERDUE',
      created_at: new Date('2026-08-01')
    },
    {
      id: 4,
      student_id: 'STU-2024-004',
      fee_structure_id: 4,
      academic_year: '2026-2027',
      total_fee: 59000.00,
      paid_amount: 20000.00,
      pending_amount: 39000.00,
      due_date: '2026-10-30',
      status: 'PARTIAL',
      created_at: new Date('2026-08-01')
    },
    {
      id: 5,
      student_id: 'STU-2024-005',
      fee_structure_id: 5,
      academic_year: '2026-2027',
      total_fee: 46500.00,
      paid_amount: 0.00,
      pending_amount: 46500.00,
      due_date: '2026-10-18',
      status: 'PENDING',
      created_at: new Date('2026-08-01')
    },
    {
      id: 6,
      student_id: 'STU-2024-006',
      fee_structure_id: 6,
      academic_year: '2026-2027',
      total_fee: 61500.00,
      paid_amount: 61500.00,
      pending_amount: 0.00,
      due_date: '2026-09-30',
      status: 'PAID',
      created_at: new Date('2026-08-01')
    }
  ],
  payments: [
    {
      id: 1,
      student_id: 'STU-2024-001',
      student_fee_id: 1,
      amount: 56000.00,
      payment_method: 'Online',
      transaction_id: 'TXN-2026-88391',
      payment_date: new Date('2026-10-01T10:30:00Z'),
      remarks: 'Full semester 4 payment',
      status: 'Completed',
      recorded_by: 'Robert Miller',
      created_at: new Date('2026-10-01T10:30:00Z')
    },
    {
      id: 2,
      student_id: 'STU-2024-002',
      student_fee_id: 2,
      amount: 30000.00,
      payment_method: 'UPI',
      transaction_id: 'TXN-2026-44219',
      payment_date: new Date('2026-10-02T08:45:00Z'),
      remarks: 'Installment 1',
      status: 'Completed',
      recorded_by: 'Robert Miller',
      created_at: new Date('2026-10-02T08:45:00Z')
    },
    {
      id: 3,
      student_id: 'STU-2024-004',
      student_fee_id: 4,
      amount: 20000.00,
      payment_method: 'Bank Transfer',
      transaction_id: 'TXN-2026-11934',
      payment_date: new Date('2026-09-28T14:20:00Z'),
      remarks: 'Part payment via NEFT',
      status: 'Completed',
      recorded_by: 'Robert Miller',
      created_at: new Date('2026-09-28T14:20:00Z')
    },
    {
      id: 4,
      student_id: 'STU-2024-006',
      student_fee_id: 6,
      amount: 61500.00,
      payment_method: 'Card',
      transaction_id: 'TXN-2026-77402',
      payment_date: new Date('2026-09-20T11:15:00Z'),
      remarks: 'Semester 1 complete fee card payment',
      status: 'Completed',
      recorded_by: 'Robert Miller',
      created_at: new Date('2026-09-20T11:15:00Z')
    }
  ],
  receipts: [
    {
      id: 1,
      receipt_number: 'REC-2026-0001',
      payment_id: 1,
      student_id: 'STU-2024-001',
      student_name: 'John Doe',
      department: 'Computer Science & Engineering',
      academic_year: '2026-2027',
      amount: 56000.00,
      payment_method: 'Online',
      transaction_id: 'TXN-2026-88391',
      accountant_name: 'Robert Miller',
      issue_date: new Date('2026-10-01T10:30:00Z'),
      created_at: new Date('2026-10-01T10:30:00Z')
    },
    {
      id: 2,
      receipt_number: 'REC-2026-0002',
      payment_id: 2,
      student_id: 'STU-2024-002',
      student_name: 'Jane Smith',
      department: 'Information Technology',
      academic_year: '2026-2027',
      amount: 30000.00,
      payment_method: 'UPI',
      transaction_id: 'TXN-2026-44219',
      accountant_name: 'Robert Miller',
      issue_date: new Date('2026-10-02T08:45:00Z'),
      created_at: new Date('2026-10-02T08:45:00Z')
    },
    {
      id: 3,
      receipt_number: 'REC-2026-0003',
      payment_id: 3,
      student_id: 'STU-2024-004',
      student_name: 'Emily Davis',
      department: 'Mechanical Engineering',
      academic_year: '2026-2027',
      amount: 20000.00,
      payment_method: 'Bank Transfer',
      transaction_id: 'TXN-2026-11934',
      accountant_name: 'Robert Miller',
      issue_date: new Date('2026-09-28T14:20:00Z'),
      created_at: new Date('2026-09-28T14:20:00Z')
    },
    {
      id: 4,
      receipt_number: 'REC-2026-0004',
      payment_id: 4,
      student_id: 'STU-2024-006',
      student_name: 'Sarah Jenkins',
      department: 'Computer Science & Engineering',
      academic_year: '2026-2027',
      amount: 61500.00,
      payment_method: 'Card',
      transaction_id: 'TXN-2026-77402',
      accountant_name: 'Robert Miller',
      issue_date: new Date('2026-09-20T11:15:00Z'),
      created_at: new Date('2026-09-20T11:15:00Z')
    }
  ]
};

// Database Connection Setup
const initDb = async () => {
  const connectionString = process.env.DATABASE_URL;
  const config = connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'cms_db',
        connectionTimeoutMillis: 2000
      };

  try {
    pool = new Pool(config);
    const client = await pool.connect();
    isPostgresConnected = true;
    console.log('[DB] PostgreSQL successfully connected!');
    client.release();

    // Execute schema if connected
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('[DB] PostgreSQL tables verified/created successfully.');
    }
  } catch (err) {
    isPostgresConnected = false;
    console.warn(`[DB NOTICE] PostgreSQL not accessible (${err.message}).`);
    console.warn('[DB NOTICE] Operating with standard in-memory database adapter for seamless immediate local execution.');
  }
};

const query = async (text, params = []) => {
  if (isPostgresConnected && pool) {
    return await pool.query(text, params);
  }
  // Fallback query handler will be served by service layer or models
  throw new Error('POSTGRES_DISCONNECTED');
};

module.exports = {
  initDb,
  query,
  get isConnected() {
    return isPostgresConnected;
  },
  get pool() {
    return pool;
  },
  inMemoryStore
};
