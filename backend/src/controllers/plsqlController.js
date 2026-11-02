/**
 * Controller for PL/SQL Laboratory and System Operations (/api/plsql)
 */
const plsqlController = {
  // GET /api/plsql/table-stats
  getTableStats: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      if (role === 'Admin') {
        const [tables] = await db.query(
          "SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME ASC"
        );
        const [viewRes] = await db.query(
          "SELECT COUNT(*) AS view_count FROM information_schema.tables WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'VIEW'"
        );
        const viewCount = viewRes[0]?.view_count || 0;

        let totalRows = 0;
        const stats = [];

        const tableMessages = {
          CASES: 'Active legal matters & dispute dockets',
          CLIENT: 'Registered corporate and individual clients',
          LAWYER: 'Chamber partners and associate advocates',
          HEARING: 'Court proceedings and cause list listings',
          TASK: 'Action items, court filings & research briefs',
          DOCUMENT: 'Legal filings, contracts & confidential evidence',
          INVOICE: 'Retainer invoices and billing memoranda',
          PAYMENT: 'Real-time transaction receipts and settlements',
          PAYMENT_METHOD: 'Authorized banking & UPI transfer rails',
          COURT: 'Judicial benches, Tribunals & High Courts',
          DEPARTMENT: 'Practice area divisions and chambers',
          CASE_TYPE: 'Legal classification taxonomies',
          CASE_STATUS: 'Procedural matter lifecycle phases',
          DOCUMENT_TYPE: 'Filing, evidence & petition categories',
          USERS: 'Security accounts & application identities',
          CASE_LAWYER: 'Counsel assignments & lead representation',
          CASE_STATUS_HISTORY: 'Forensic state progression log',
          APPOINTMENT: 'Scheduled client consultations',
          PARTY: 'Litigants, opposing parties & intervenors',
          CASE_PARTY: 'Case-to-litigant adversarial links',
          application_audit_log: 'Tamper-evident forensic mutation ledger'
        };

        for (const t of tables) {
          const tableName = t.TABLE_NAME;
          const [cntRows] = await db.query(`SELECT COUNT(*) AS cnt FROM \`${tableName}\``);
          const count = cntRows[0]?.cnt || 0;
          totalRows += count;

          stats.push({
            table_name: tableName,
            row_count: count,
            message: count > 0 ? (tableMessages[tableName] || 'Active records on file') : 'No records yet'
          });
        }

        return res.json({
          success: true,
          totals: {
            tables: tables.length,
            rows: totalRows,
            views: viewCount
          },
          data: stats
        });
      } else {
        // Scoped for Lawyer and Assistant - only views, no financial tables
        const scopedEntities = role === 'Lawyer' ? [
          { view: 'vw_lawyer_cases', label: 'Assigned Matters' },
          { view: 'vw_lawyer_clients', label: 'Assigned Clients' },
          { view: 'vw_lawyer_hearings', label: 'Matter Hearings' },
          { view: 'vw_lawyer_tasks', label: 'Action Items' },
          { view: 'vw_lawyer_documents', label: 'Matter Documents' },
          { view: 'vw_ref_courts', label: 'Court Directory' },
          { view: 'vw_staff_lawyers', label: 'Chamber Counsel' }
        ] : [
          { view: 'vw_staff_cases', label: 'Firm Matters' },
          { view: 'vw_staff_clients', label: 'Firm Clients' },
          { view: 'vw_staff_hearings', label: 'Court Schedule' },
          { view: 'vw_staff_tasks', label: 'Task Queue' },
          { view: 'vw_staff_documents', label: 'Public Documents' },
          { view: 'vw_ref_courts', label: 'Court Directory' },
          { view: 'vw_staff_lawyers', label: 'Chamber Counsel' }
        ];

        let totalRows = 0;
        const stats = [];

        for (const item of scopedEntities) {
          const [cntRows] = await db.query(`SELECT COUNT(*) AS cnt FROM \`${item.view}\``);
          const count = cntRows[0]?.cnt || 0;
          totalRows += count;

          stats.push({
            table_name: item.label,
            row_count: count,
            message: count > 0 ? `Active ${item.label.toLowerCase()} visible to your role` : 'No accessible records'
          });
        }

        return res.json({
          success: true,
          totals: {
            tables: scopedEntities.length,
            rows: totalRows,
            views: scopedEntities.length
          },
          data: stats
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // GET /api/plsql/aggregate?mode=total|grouped (Admin only)
  getAggregate: async (req, res, next) => {
    try {
      const db = req.db;
      const mode = (req.query.mode || 'total').toLowerCase();

      if (mode === 'grouped') {
        const [results] = await db.query('CALL GetCaseBudgetSummaryByType()');
        const rows = results[0] || [];
        return res.json({
          success: true,
          message: 'Budget distribution summarized across legal practice areas.',
          data: rows
        });
      } else {
        const [rows] = await db.query('SELECT fn_total_case_budget() AS total_budget');
        const total = rows[0]?.total_budget || 0;
        const formattedTotal = Number(total).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

        return res.json({
          success: true,
          message: `Cumulative budget across all registered firm matters: ${formattedTotal}`,
          data: [
            {
              metric: 'Total Firm Case Budget',
              total_budget: total,
              formatted_budget: formattedTotal,
              status: 'Calculated via fn_total_case_budget()'
            }
          ]
        });
      }
    } catch (error) {
      next(error);
    }
  },

  // POST /api/plsql/trigger-test (Admin only)
  runTriggerTest: async (req, res, next) => {
    let connection;
    try {
      const db = req.db;
      const test = (req.body.test || '').toLowerCase();
      connection = await db.getConnection();

      await connection.beginTransaction();

      try {
        if (test === 'validation-name') {
          try {
            await connection.query("INSERT INTO CLIENT (name, client_type) VALUES (' ', 'Individual')");
            return res.json({
              success: false,
              message: 'Validation trigger failed to intercept whitespace client name.'
            });
          } catch (err) {
            return res.json({
              success: true,
              message: `Trigger rejected the row: ${err.message}`,
              test: 'validation-name',
              passed: true
            });
          }
        } else if (test === 'validation-email') {
          try {
            await connection.query("INSERT INTO CLIENT (name, client_type, email) VALUES ('Valid Client Name', 'Individual', 'invalid-email-address')");
            return res.json({
              success: false,
              message: 'Validation trigger failed to intercept malformed email.'
            });
          } catch (err) {
            return res.json({
              success: true,
              message: `Trigger rejected the row: ${err.message}`,
              test: 'validation-email',
              passed: true
            });
          }
        } else if (test === 'uppercase') {
          await connection.query("INSERT INTO CLIENT (name, client_type, email) VALUES ('shreeji enterprises', 'Organization', 'INFO@SHREEJI.COM')");
          const [lastIdRow] = await connection.query('SELECT LAST_INSERT_ID() AS id');
          const [clientRows] = await connection.query('SELECT name, email FROM CLIENT WHERE client_id = ?', [lastIdRow[0].id]);
          const client = clientRows[0];

          return res.json({
            success: true,
            message: `Uppercase trigger verified. Input 'shreeji enterprises' normalized to '${client.name}', email to '${client.email}'.`,
            data: [client],
            test: 'uppercase',
            passed: client.name === 'SHREEJI ENTERPRISES'
          });
        } else if (test === 'office-hours') {
          await connection.query('SET @briefcase_simulate_monday_review = 1');
          try {
            await connection.query("INSERT INTO CLIENT (name, client_type) VALUES ('Test Office Hours Client', 'Individual')");
            return res.json({
              success: false,
              message: 'Office hours trigger failed to block simulated review window.'
            });
          } catch (err) {
            return res.json({
              success: true,
              message: `Trigger rejected the row: ${err.message}`,
              test: 'office-hours',
              passed: true
            });
          }
        } else {
          return res.status(400).json({
            success: false,
            message: `Unknown trigger test: ${test}`
          });
        }
      } finally {
        await connection.rollback();
      }
    } catch (error) {
      next(error);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  // GET /api/plsql/catalog (Admin only)
  getCatalog: async (req, res, next) => {
    try {
      const db = req.db;

      const [routines] = await db.query(
        "SELECT ROUTINE_NAME, ROUTINE_TYPE, DATA_TYPE FROM information_schema.routines WHERE ROUTINE_SCHEMA = DATABASE() ORDER BY ROUTINE_NAME ASC"
      );
      const [triggers] = await db.query(
        "SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING FROM information_schema.triggers WHERE TRIGGER_SCHEMA = DATABASE() ORDER BY TRIGGER_NAME ASC"
      );
      const [views] = await db.query(
        "SELECT TABLE_NAME FROM information_schema.views WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME ASC"
      );

      return res.json({
        success: true,
        data: {
          routines,
          triggers,
          views: views.map(v => v.TABLE_NAME)
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = plsqlController;
