const { pool } = require('../config/db');

const dashboardController = {
  // Requirement 11.E: Complete Real Database Dashboard Statistics
  getDashboardSummary: async (req, res, next) => {
    try {
      // 1. Entity Record Counts across all primary and secondary tables
      const [counts] = await pool.query(`
        SELECT 'clients' AS metric, COUNT(*) AS count FROM CLIENT
        UNION ALL SELECT 'cases', COUNT(*) FROM CASES
        UNION ALL SELECT 'lawyers', COUNT(*) FROM LAWYER
        UNION ALL SELECT 'courts', COUNT(*) FROM COURT
        UNION ALL SELECT 'hearings', COUNT(*) FROM HEARING
        UNION ALL SELECT 'invoices', COUNT(*) FROM INVOICE
        UNION ALL SELECT 'payments', COUNT(*) FROM PAYMENT
        UNION ALL SELECT 'tasks', COUNT(*) FROM TASK
        UNION ALL SELECT 'documents', COUNT(*) FROM DOCUMENT
        UNION ALL SELECT 'parties', COUNT(*) FROM PARTY
        UNION ALL SELECT 'departments', COUNT(*) FROM DEPARTMENT
        UNION ALL SELECT 'users', COUNT(*) FROM USERS
      `);

      const countMap = {};
      counts.forEach((item) => {
        countMap[item.metric] = item.count;
      });

      // 2. Financial Metrics (Total Budget, Invoiced, Received)
      const [financials] = await pool.query(`
        SELECT 
          (SELECT COALESCE(SUM(budget), 0.00) FROM CASES) AS total_case_budget,
          (SELECT COALESCE(SUM(amount), 0.00) FROM INVOICE) AS total_invoiced,
          (SELECT COALESCE(SUM(amount), 0.00) FROM PAYMENT WHERE payment_status = 'Completed') AS total_payments_received
      `);

      // 3. Cases Distribution by Status (for Charts)
      const [statusDist] = await pool.query(`
        SELECT 
          COALESCE(cs.status_name, 'Unassigned') AS status_name,
          COUNT(c.case_id) AS count
        FROM CASE_STATUS cs
        LEFT JOIN CASES c ON cs.status_id = c.current_status_id
        GROUP BY cs.status_id, cs.status_name
        ORDER BY cs.status_id ASC
      `);

      // 4. Cases Distribution by Case Type (for Charts)
      const [typeDist] = await pool.query(`
        SELECT 
          COALESCE(ct.type_name, 'General') AS type_name,
          COUNT(c.case_id) AS count,
          COALESCE(SUM(c.budget), 0.00) AS total_budget
        FROM CASE_TYPE ct
        LEFT JOIN CASES c ON ct.case_type_id = c.case_type_id
        GROUP BY ct.case_type_id, ct.type_name
        ORDER BY count DESC
      `);

      // 5. Upcoming Hearings (next 14 days)
      const [upcomingHearings] = await pool.query(`
        SELECT 
          h.hearing_id,
          h.hearing_date,
          h.start_time,
          h.purpose,
          c.case_number,
          c.title AS case_title,
          co.court_name,
          co.city
        FROM HEARING h
        INNER JOIN CASES c ON h.case_id = c.case_id
        INNER JOIN COURT co ON h.court_id = co.court_id
        WHERE h.hearing_date >= CURRENT_DATE
        ORDER BY h.hearing_date ASC, h.start_time ASC
        LIMIT 5
      `);

      // 6. Pending Urgent Tasks
      const [pendingTasks] = await pool.query(`
        SELECT 
          t.task_id,
          t.title,
          t.priority,
          t.due_date,
          c.case_number,
          u.name AS assigned_to_name
        FROM TASK t
        INNER JOIN CASES c ON t.case_id = c.case_id
        LEFT JOIN USERS u ON t.assigned_to = u.user_id
        WHERE t.status = 'Pending'
        ORDER BY t.due_date ASC
        LIMIT 5
      `);

      // 7. Recent Audit Activity
      const [recentAudit] = await pool.query(`
        SELECT 
          audit_id,
          table_name,
          operation_type,
          record_id,
          changed_at,
          changed_by
        FROM application_audit_log
        ORDER BY audit_id DESC
        LIMIT 5
      `);

      return res.json({
        success: true,
        data: {
          counts: countMap,
          financials: financials[0] || {
            total_case_budget: 0,
            total_invoiced: 0,
            total_payments_received: 0
          },
          statusDistribution: statusDist,
          typeDistribution: typeDist,
          upcomingHearings,
          pendingTasks,
          recentAudit
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
