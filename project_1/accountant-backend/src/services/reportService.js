const db = require('../config/db');

const getFinancialReports = async (queryParams) => {
  const { fromDate = '', toDate = '' } = queryParams;

  if (db.isConnected) {
    const client = await db.pool.connect();
    try {
      let dateFilter = '';
      let params = [];
      let idx = 1;

      if (fromDate) {
        dateFilter += ` AND p.payment_date >= $${idx}`;
        params.push(fromDate);
        idx++;
      }
      if (toDate) {
        dateFilter += ` AND p.payment_date <= $${idx}`;
        params.push(`${toDate} 23:59:59`);
        idx++;
      }

      // 1. Daily collection trend
      const dailySql = `
        SELECT TO_CHAR(p.payment_date, 'YYYY-MM-DD') AS date,
               SUM(p.amount) AS total,
               COUNT(p.id) AS count
        FROM payments p
        WHERE p.status = 'Completed' ${dateFilter}
        GROUP BY TO_CHAR(p.payment_date, 'YYYY-MM-DD')
        ORDER BY date ASC
      `;
      const dailyRes = await client.query(dailySql, params);

      // 2. Monthly collection trend
      const monthlySql = `
        SELECT TO_CHAR(p.payment_date, 'YYYY-MM') AS month,
               SUM(p.amount) AS total,
               COUNT(p.id) AS count
        FROM payments p
        WHERE p.status = 'Completed' ${dateFilter}
        GROUP BY TO_CHAR(p.payment_date, 'YYYY-MM')
        ORDER BY month ASC
      `;
      const monthlyRes = await client.query(monthlySql, params);

      // 3. Department-wise collection
      const deptSql = `
        SELECT s.department,
               COALESCE(SUM(p.amount), 0) AS collected,
               COUNT(p.id) AS payment_count
        FROM payments p
        JOIN students s ON p.student_id = s.student_id
        WHERE p.status = 'Completed' ${dateFilter}
        GROUP BY s.department
        ORDER BY collected DESC
      `;
      const deptRes = await client.query(deptSql, params);

      // 4. Department-wise pending fees
      const deptPendingSql = `
        SELECT s.department,
               COALESCE(SUM(sf.pending_amount), 0) AS pending_total,
               COUNT(sf.id) AS pending_student_count
        FROM student_fees sf
        JOIN students s ON sf.student_id = s.student_id
        WHERE sf.pending_amount > 0
        GROUP BY s.department
        ORDER BY pending_total DESC
      `;
      const deptPendingRes = await client.query(deptPendingSql);

      // 5. Payment method breakdown
      const methodSql = `
        SELECT p.payment_method,
               SUM(p.amount) AS total,
               COUNT(p.id) AS count
        FROM payments p
        WHERE p.status = 'Completed' ${dateFilter}
        GROUP BY p.payment_method
        ORDER BY total DESC
      `;
      const methodRes = await client.query(methodSql, params);

      // 6. Overall Summary
      const summarySql = `
        SELECT COALESCE(SUM(p.amount), 0) AS total_collected,
               COUNT(p.id) AS total_transactions
        FROM payments p
        WHERE p.status = 'Completed' ${dateFilter}
      `;
      const summaryRes = await client.query(summarySql, params);

      const pendingOverallSql = `
        SELECT COALESCE(SUM(pending_amount), 0) AS total_pending,
               COALESCE(SUM(total_fee), 0) AS total_invoiced,
               COUNT(id) AS total_records
        FROM student_fees
      `;
      const pendingOverallRes = await client.query(pendingOverallSql);

      return {
        filter: { fromDate, toDate },
        summary: {
          totalCollected: parseFloat(summaryRes.rows[0].total_collected),
          totalTransactions: parseInt(summaryRes.rows[0].total_transactions, 10),
          totalPending: parseFloat(pendingOverallRes.rows[0].total_pending),
          totalInvoiced: parseFloat(pendingOverallRes.rows[0].total_invoiced)
        },
        dailyCollection: dailyRes.rows,
        monthlyCollection: monthlyRes.rows,
        departmentWise: deptRes.rows,
        departmentPending: deptPendingRes.rows,
        paymentMethods: methodRes.rows
      };
    } finally {
      client.release();
    }
  }

  // Fallback in-memory
  let payments = db.inMemoryStore.payments.filter((p) => p.status === 'Completed');

  if (fromDate) {
    const fromTime = new Date(fromDate).getTime();
    payments = payments.filter((p) => new Date(p.payment_date).getTime() >= fromTime);
  }
  if (toDate) {
    const toTime = new Date(`${toDate}T23:59:59`).getTime();
    payments = payments.filter((p) => new Date(p.payment_date).getTime() <= toTime);
  }

  // Daily
  const dailyMap = {};
  payments.forEach((p) => {
    const d = new Date(p.payment_date).toISOString().split('T')[0];
    if (!dailyMap[d]) dailyMap[d] = { date: d, total: 0, count: 0 };
    dailyMap[d].total += parseFloat(p.amount);
    dailyMap[d].count += 1;
  });
  const dailyCollection = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Monthly
  const monthMap = {};
  payments.forEach((p) => {
    const m = new Date(p.payment_date).toISOString().substring(0, 7);
    if (!monthMap[m]) monthMap[m] = { month: m, total: 0, count: 0 };
    monthMap[m].total += parseFloat(p.amount);
    monthMap[m].count += 1;
  });
  const monthlyCollection = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

  // Department-wise
  const deptMap = {};
  payments.forEach((p) => {
    const s = db.inMemoryStore.students.find((stu) => stu.student_id === p.student_id) || {};
    const dept = s.department || 'General';
    if (!deptMap[dept]) deptMap[dept] = { department: dept, collected: 0, payment_count: 0 };
    deptMap[dept].collected += parseFloat(p.amount);
    deptMap[dept].payment_count += 1;
  });
  const departmentWise = Object.values(deptMap).sort((a, b) => b.collected - a.collected);

  // Department Pending
  const deptPendingMap = {};
  db.inMemoryStore.student_fees.forEach((sf) => {
    if (parseFloat(sf.pending_amount) > 0) {
      const s = db.inMemoryStore.students.find((stu) => stu.student_id === sf.student_id) || {};
      const dept = s.department || 'General';
      if (!deptPendingMap[dept]) deptPendingMap[dept] = { department: dept, pending_total: 0, pending_student_count: 0 };
      deptPendingMap[dept].pending_total += parseFloat(sf.pending_amount);
      deptPendingMap[dept].pending_student_count += 1;
    }
  });
  const departmentPending = Object.values(deptPendingMap).sort((a, b) => b.pending_total - a.pending_total);

  // Payment Methods
  const methodMap = {};
  payments.forEach((p) => {
    const m = p.payment_method || 'Other';
    if (!methodMap[m]) methodMap[m] = { payment_method: m, total: 0, count: 0 };
    methodMap[m].total += parseFloat(p.amount);
    methodMap[m].count += 1;
  });
  const paymentMethods = Object.values(methodMap).sort((a, b) => b.total - a.total);

  // Overall
  const totalCollected = payments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  let totalPending = 0;
  let totalInvoiced = 0;
  db.inMemoryStore.student_fees.forEach((sf) => {
    totalPending += parseFloat(sf.pending_amount);
    totalInvoiced += parseFloat(sf.total_fee);
  });

  return {
    filter: { fromDate, toDate },
    summary: {
      totalCollected,
      totalTransactions: payments.length,
      totalPending,
      totalInvoiced
    },
    dailyCollection,
    monthlyCollection,
    departmentWise,
    departmentPending,
    paymentMethods
  };
};

module.exports = {
  getFinancialReports
};
