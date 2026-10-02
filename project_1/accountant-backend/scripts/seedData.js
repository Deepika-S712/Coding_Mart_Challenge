require('dotenv').config();
const { Pool } = require('pg');
const { inMemoryStore } = require('../src/config/db');

const runSeed = async () => {
  const connectionString = process.env.DATABASE_URL;
  const config = connectionString
    ? { connectionString }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        database: process.env.PGDATABASE || 'cms_db'
      };

  console.log('[DB SEED] Connecting to PostgreSQL at', config.host || config.connectionString);
  const pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log('[DB SEED] Successfully connected to PostgreSQL.');

    // 1. Departments
    console.log('[DB SEED] Seeding departments...');
    for (const d of inMemoryStore.departments) {
      await client.query(
        'INSERT INTO departments (id, name, code) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [d.id, d.name, d.code]
      );
    }

    // 2. Users
    console.log('[DB SEED] Seeding users...');
    for (const u of inMemoryStore.users) {
      await client.query(
        'INSERT INTO users (id, username, password, full_name, email, role) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (username) DO NOTHING',
        [u.id, u.username, u.password, u.full_name, u.email, u.role]
      );
    }

    // 3. Students
    console.log('[DB SEED] Seeding students...');
    for (const s of inMemoryStore.students) {
      await client.query(
        `INSERT INTO students (id, student_id, first_name, last_name, email, phone, department_id, department, year, semester, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (student_id) DO NOTHING`,
        [s.id, s.student_id, s.first_name, s.last_name, s.email, s.phone, s.department_id, s.department, s.year, s.semester, s.status]
      );
    }

    // 4. Fee Structures
    console.log('[DB SEED] Seeding fee structures...');
    for (const fs of inMemoryStore.fee_structures) {
      await client.query(
        `INSERT INTO fee_structures (id, academic_year, department, department_id, year, semester, tuition_fee, exam_fee, library_fee, transport_fee, hostel_fee, other_fee, total_fee, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (academic_year, department, year, semester) DO NOTHING`,
        [fs.id, fs.academic_year, fs.department, fs.department_id, fs.year, fs.semester, fs.tuition_fee, fs.exam_fee, fs.library_fee, fs.transport_fee, fs.hostel_fee, fs.other_fee, fs.total_fee, fs.status]
      );
    }

    // 5. Student Fees
    console.log('[DB SEED] Seeding student fees...');
    for (const sf of inMemoryStore.student_fees) {
      await client.query(
        `INSERT INTO student_fees (id, student_id, fee_structure_id, academic_year, total_fee, paid_amount, pending_amount, due_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (student_id, academic_year, fee_structure_id) DO NOTHING`,
        [sf.id, sf.student_id, sf.fee_structure_id, sf.academic_year, sf.total_fee, sf.paid_amount, sf.pending_amount, sf.due_date, sf.status]
      );
    }

    // 6. Payments
    console.log('[DB SEED] Seeding payments...');
    for (const p of inMemoryStore.payments) {
      await client.query(
        `INSERT INTO payments (id, student_id, student_fee_id, amount, payment_method, transaction_id, payment_date, remarks, status, recorded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (transaction_id) DO NOTHING`,
        [p.id, p.student_id, p.student_fee_id, p.amount, p.payment_method, p.transaction_id, p.payment_date, p.remarks, p.status, p.recorded_by]
      );
    }

    // 7. Receipts
    console.log('[DB SEED] Seeding receipts...');
    for (const r of inMemoryStore.receipts) {
      await client.query(
        `INSERT INTO receipts (id, receipt_number, payment_id, student_id, student_name, department, academic_year, amount, payment_method, transaction_id, accountant_name, issue_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (receipt_number) DO NOTHING`,
        [r.id, r.receipt_number, r.payment_id, r.student_id, r.student_name, r.department, r.academic_year, r.amount, r.payment_method, r.transaction_id, r.accountant_name, r.issue_date]
      );
    }

    console.log('[DB SEED] All seed data populated successfully!');
    client.release();
  } catch (err) {
    console.error('[DB SEED ERROR]:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runSeed();
