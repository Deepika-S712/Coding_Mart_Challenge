const db = require('../config/db');

const getDashboardData = async () => {
  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      // 1. Total Collection
      const totalRes = await client.query(
        "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'Completed'"
      );
      const totalCollected = parseFloat(totalRes.rows[0].total);

      // 2. Pending Fees
      const pendingRes = await client.query(
        'SELECT COALESCE(SUM(pending_amount), 0) AS pending FROM student_fees'
      );
      const pendingFees = parseFloat(pendingRes.rows[0].pending);

      // 3. Today's Collection
      const todayRes = await client.query(
        "SELECT COALESCE(SUM(amount), 0) AS today FROM payments WHERE status = 'Completed' AND DATE(payment_date) = CURRENT_DATE"
      );
      const todayCollection = parseFloat(todayRes.rows[0].today);

      // 4. Monthly Collection
      const monthRes = await client.query(
        "SELECT COALESCE(SUM(amount), 0) AS month FROM payments WHERE status = 'Completed' AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)"
      );
      const monthlyCollection = parseFloat(monthRes.rows[0].month);

      // 5. Number of pending payments
      const pendingCountRes = await client.query(
        "SELECT COUNT(*) AS count FROM student_fees WHERE status IN ('PENDING', 'PARTIAL', 'OVERDUE')"
      );
      const pendingCount = parseInt(pendingCountRes.rows[0].count, 10);

      // 6. Recent Payments Table
      const recentPaymentsRes = await client.query(`
        SELECT p.id, p.amount, p.payment_method, p.transaction_id, p.payment_date, p.status,
               s.student_id, CONCAT(s.first_name, ' ', s.last_name) AS student_name,
               r.receipt_number, r.id AS receipt_id
        FROM payments p
        JOIN students s ON p.student_id = s.student_id
        LEFT JOIN receipts r ON p.id = r.payment_id
        ORDER BY p.payment_date DESC
        LIMIT 6
      `);

      // 7. Pending Fees Summary Table
      const pendingSummaryRes = await client.query(`
        SELECT sf.id, sf.student_id, sf.academic_year, sf.total_fee, sf.paid_amount, sf.pending_amount,
               sf.due_date, sf.status,
               s.first_name, s.last_name, CONCAT(s.first_name, ' ', s.last_name) AS student_name,
               s.department
        FROM student_fees sf
        JOIN students s ON sf.student_id = s.student_id
        WHERE sf.pending_amount > 0
        ORDER BY sf.due_date ASC
        LIMIT 6
      `);

      return {
        stats: {
          totalCollected,
          pendingFees,
          todayCollection,
          monthlyCollection,
          pendingCount
        },
        recentPayments: recentPaymentsRes.rows,
        pendingFeesSummary: pendingSummaryRes.rows
      };
    } finally {
      client.release();
    }
  }

  // Fallback in-memory
  const store = db.inMemoryStore;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalCollected = 0;
  let todayCollection = 0;
  let monthlyCollection = 0;

  store.payments.forEach((p) => {
    if (p.status === 'Completed') {
      const pAmt = parseFloat(p.amount);
      totalCollected += pAmt;
      const pDate = new Date(p.payment_date);
      if (pDate.toISOString().split('T')[0] === todayStr) {
        todayCollection += pAmt;
      }
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        monthlyCollection += pAmt;
      }
    }
  });

  let pendingFees = 0;
  let pendingCount = 0;
  store.student_fees.forEach((sf) => {
    pendingFees += parseFloat(sf.pending_amount);
    if (sf.status !== 'PAID') {
      pendingCount++;
    }
  });

  // Recent payments
  const recentPayments = store.payments
    .slice()
    .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
    .slice(0, 6)
    .map((p) => {
      const student = store.students.find((s) => s.student_id === p.student_id) || {};
      const receipt = store.receipts.find((r) => r.payment_id === p.id) || {};
      return {
        id: p.id,
        receipt_id: receipt.id || p.id,
        receipt_number: receipt.receipt_number || `REC-${p.id}`,
        student: `${student.first_name || ''} ${student.last_name || ''}`.trim() || p.student_id,
        student_id: p.student_id,
        student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        amount: p.amount,
        payment_method: p.payment_method,
        payment_date: p.payment_date,
        status: p.status,
        transaction_id: p.transaction_id
      };
    });

  // Pending fees summary
  const pendingFeesSummary = store.student_fees
    .filter((sf) => sf.pending_amount > 0)
    .slice()
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 6)
    .map((sf) => {
      const student = store.students.find((s) => s.student_id === sf.student_id) || {};
      return {
        id: sf.id,
        student_id: sf.student_id,
        student_name: `${student.first_name || ''} ${student.last_name || ''}`.trim() || sf.student_id,
        department: student.department || 'General',
        total_fee: sf.total_fee,
        paid: sf.paid_amount,
        pending: sf.pending_amount,
        due_date: sf.due_date,
        status: sf.status
      };
    });

  return {
    stats: {
      totalCollected,
      pendingFees,
      todayCollection,
      monthlyCollection,
      pendingCount
    },
    recentPayments,
    pendingFeesSummary
  };
};

module.exports = { getDashboardData };
