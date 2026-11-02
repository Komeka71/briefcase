const dashboardController = {
  getDashboardSummary: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      if (role === 'Admin') {
        // 1. Entity Record Counts across all tables
        const [counts] = await db.query(`
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
        const [financials] = await db.query(`
          SELECT 
            (SELECT COALESCE(SUM(budget), 0.00) FROM CASES) AS total_case_budget,
            (SELECT COALESCE(SUM(amount), 0.00) FROM INVOICE) AS total_invoiced,
            (SELECT COALESCE(SUM(amount), 0.00) FROM PAYMENT WHERE payment_status = 'Completed') AS total_payments_received
        `);

        // 3. Cases Distribution by Status
        const [statusDist] = await db.query(`
          SELECT 
            COALESCE(cs.status_name, 'Unassigned') AS status_name,
            COUNT(c.case_id) AS count
          FROM CASE_STATUS cs
          LEFT JOIN CASES c ON cs.status_id = c.current_status_id
          GROUP BY cs.status_id, cs.status_name
          ORDER BY cs.status_id ASC
        `);

        // 4. Cases Distribution by Case Type
        const [typeDist] = await db.query(`
          SELECT 
            COALESCE(ct.type_name, 'General') AS type_name,
            COUNT(c.case_id) AS count,
            COALESCE(SUM(c.budget), 0.00) AS total_budget
          FROM CASE_TYPE ct
          LEFT JOIN CASES c ON ct.case_type_id = c.case_type_id
          GROUP BY ct.case_type_id, ct.type_name
          ORDER BY count DESC
        `);

        // 5. Upcoming Hearings (unadjourned / pending outcome)
        const [upcomingHearings] = await db.query(`
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
            AND (h.outcome IS NULL OR TRIM(h.outcome) = '')
          ORDER BY h.hearing_date ASC, h.start_time ASC
          LIMIT 5
        `);

        // 6. Urgent Filing Deadlines (Pending or In Progress, overdue first)
        const [pendingTasks] = await db.query(`
          SELECT 
            t.task_id,
            t.title,
            t.priority,
            t.status,
            t.due_date,
            c.case_number,
            u.name AS assigned_to_name
          FROM TASK t
          INNER JOIN CASES c ON t.case_id = c.case_id
          LEFT JOIN USERS u ON t.assigned_to = u.user_id
          WHERE t.status IN ('Pending', 'In Progress')
          ORDER BY t.due_date ASC
          LIMIT 5
        `);

        // 7. Recent Audit Activity
        const [recentAudit] = await db.query(`
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
      }

      // Lawyer or Assistant/Staff Scoped Views
      const caseView = role === 'Lawyer' ? 'vw_lawyer_cases' : 'vw_staff_cases';
      const clientView = role === 'Lawyer' ? 'vw_lawyer_clients' : 'vw_staff_clients';
      const hearingView = role === 'Lawyer' ? 'vw_lawyer_hearings' : 'vw_staff_hearings';
      const taskView = role === 'Lawyer' ? 'vw_lawyer_tasks' : 'vw_staff_tasks';
      const docView = role === 'Lawyer' ? 'vw_lawyer_documents' : 'vw_staff_documents';

      // Counts
      const [caseCount] = await db.query(`SELECT COUNT(*) AS c FROM ${caseView}`);
      const [clientCount] = await db.query(`SELECT COUNT(*) AS c FROM ${clientView}`);
      const [hearingCount] = await db.query(`SELECT COUNT(*) AS c FROM ${hearingView}`);
      const [taskCount] = await db.query(`SELECT COUNT(*) AS c FROM ${taskView}`);
      const [docCount] = await db.query(`SELECT COUNT(*) AS c FROM ${docView}`);
      const [lawyerCount] = await db.query('SELECT COUNT(*) AS c FROM vw_staff_lawyers');
      const [courtCount] = await db.query('SELECT COUNT(*) AS c FROM vw_ref_courts');
      const [deptCount] = await db.query('SELECT COUNT(*) AS c FROM vw_ref_departments');

      const countMap = {
        clients: clientCount[0]?.c || 0,
        cases: caseCount[0]?.c || 0,
        lawyers: lawyerCount[0]?.c || 0,
        courts: courtCount[0]?.c || 0,
        hearings: hearingCount[0]?.c || 0,
        invoices: 0,
        payments: 0,
        tasks: taskCount[0]?.c || 0,
        documents: docCount[0]?.c || 0,
        parties: 0,
        departments: deptCount[0]?.c || 0,
        users: 0
      };

      // Financials: strictly null for non-admin roles
      const financials = {
        total_case_budget: null,
        total_invoiced: null,
        total_payments_received: null
      };

      // Status Distribution
      const [statusDist] = await db.query(`
        SELECT 
          cs.status_name,
          COUNT(c.case_id) AS count
        FROM vw_ref_case_status cs
        LEFT JOIN ${caseView} c ON cs.status_id = c.current_status_id
        GROUP BY cs.status_id, cs.status_name
        ORDER BY cs.status_id ASC
      `);

      // Type Distribution (with total_budget as null)
      const [typeDist] = await db.query(`
        SELECT 
          ct.type_name,
          COUNT(c.case_id) AS count,
          CAST(NULL AS DECIMAL(12,2)) AS total_budget
        FROM vw_ref_case_types ct
        LEFT JOIN ${caseView} c ON ct.case_type_id = c.case_type_id
        GROUP BY ct.case_type_id, ct.type_name
        ORDER BY count DESC
      `);

      // Upcoming Hearings (unadjourned / pending outcome)
      const [upcomingHearings] = await db.query(`
        SELECT 
          h.hearing_id,
          h.hearing_date,
          h.start_time,
          h.purpose,
          h.case_number,
          h.case_title,
          h.court_name,
          h.court_city AS city
        FROM ${hearingView} h
        WHERE h.hearing_date >= CURRENT_DATE
          AND (h.outcome IS NULL OR TRIM(h.outcome) = '')
        ORDER BY h.hearing_date ASC, h.start_time ASC
        LIMIT 5
      `);

      // Urgent Tasks (Pending or In Progress, overdue first)
      const [pendingTasks] = await db.query(`
        SELECT 
          t.task_id,
          t.title,
          t.priority,
          t.status,
          t.due_date,
          t.case_number,
          t.assigned_to_name
        FROM ${taskView} t
        WHERE t.status IN ('Pending', 'In Progress')
        ORDER BY t.due_date ASC
        LIMIT 5
      `);

      return res.json({
        success: true,
        data: {
          counts: countMap,
          financials,
          statusDistribution: statusDist,
          typeDistribution: typeDist,
          upcomingHearings,
          pendingTasks,
          recentAudit: []
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
