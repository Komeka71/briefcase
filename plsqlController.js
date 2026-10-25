const { pool } = require('../config/db');

/**
 * Lab Assignment 10 — PL/SQL Lab controller
 * Exposes stored functions, procedures and triggers to the frontend so each
 * requirement (10.1 – 10.10) can be demonstrated live from the dashboard.
 * Trigger demos run inside a transaction that is ALWAYS rolled back,
 * so no test data is left behind in the database.
 */

const timed = async (fn) => {
  const start = process.hrtime.bigint();
  const result = await fn();
  const executionTimeMs = Number(process.hrtime.bigint() - start) / 1e6;
  return { result, executionTimeMs: Number(executionTimeMs.toFixed(3)) };
};

const plsqlController = {
  // 10.6 A / B — Sum of numeric column without and with grouping
  getAggregate: async (req, res, next) => {
    try {
      const mode = (req.query.mode || 'total').toLowerCase();

      if (mode === 'grouped') {
        const sql = 'CALL GetCaseBudgetSummaryByType();';
        const { result, executionTimeMs } = await timed(() => pool.query(sql));
        return res.json({
          success: true,
          requirement: '10.6 B — SUM with GROUP BY (case type)',
          sql,
          executionTimeMs,
          data: result[0][0] || []
        });
      }

      const sql = 'SELECT fn_total_case_budget() AS total_case_budget;';
      const { result, executionTimeMs } = await timed(() => pool.query(sql));
      return res.json({
        success: true,
        requirement: '10.6 A — SUM without grouping',
        sql,
        executionTimeMs,
        data: result[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // 10.7 / 10.8 / 10.10 — Live trigger tests (always rolled back)
  runTriggerTest: async (req, res) => {
    const test = (req.body.test || '').toLowerCase();
    const conn = await pool.getConnection();

    const tests = {
      'validation-name': {
        requirement: '10.7 BEFORE trigger — name must be at least 2 characters',
        trigger: 'trg_client_before_insert_val',
        sql: "INSERT INTO CLIENT (name, client_type, email) VALUES ('A', 'Individual', 'a@test.com');"
      },
      'validation-email': {
        requirement: '10.7 BEFORE trigger — email format must be valid',
        trigger: 'trg_client_before_insert_val',
        sql: "INSERT INTO CLIENT (name, client_type, email) VALUES ('Test Client', 'Individual', 'not-an-email');"
      },
      uppercase: {
        requirement: '10.8 Trigger — client name converted to UPPERCASE',
        trigger: 'trg_client_before_insert_norm',
        sql: "INSERT INTO CLIENT (name, client_type, email) VALUES ('rahul mehta demo', 'Individual', 'rahul.demo@test.com');"
      },
      'office-hours': {
        requirement: '10.10 Trigger — block modifications on Monday 2 PM to 4 PM',
        trigger: 'trg_client_before_insert_office_hours',
        sql: "SET @briefcase_simulate_monday_review = 1;\nINSERT INTO CLIENT (name, client_type, email) VALUES ('Office Hours Test', 'Individual', 'oh@test.com');"
      }
    };

    const def = tests[test];
    if (!def) {
      conn.release();
      return res.status(400).json({ success: false, message: `Unknown test "${test}".` });
    }

    const start = process.hrtime.bigint();
    try {
      await conn.beginTransaction();

      if (test === 'office-hours') {
        await conn.query('SET @briefcase_simulate_monday_review = 1');
      }

      const insertSql = def.sql.split('\n').pop();
      const [ins] = await conn.query(insertSql);

      let row = null;
      if (ins && ins.insertId) {
        const [rows] = await conn.query(
          'SELECT client_id, name, client_type, email FROM CLIENT WHERE client_id = ?',
          [ins.insertId]
        );
        row = rows[0] || null;
      }

      const executionTimeMs = Number((Number(process.hrtime.bigint() - start) / 1e6).toFixed(3));
      return res.json({
        success: true,
        blocked: false,
        ...def,
        executionTimeMs,
        message:
          test === 'uppercase'
            ? `Trigger converted the name: 'rahul mehta demo' → '${row ? row.name : '?'}'`
            : 'Row was accepted (trigger did not block it).',
        data: row ? [row] : []
      });
    } catch (error) {
      const executionTimeMs = Number((Number(process.hrtime.bigint() - start) / 1e6).toFixed(3));
      return res.json({
        success: true,
        blocked: true,
        ...def,
        executionTimeMs,
        message: error.sqlMessage || error.message,
        data: []
      });
    } finally {
      try {
        await conn.rollback();
        await conn.query('SET @briefcase_simulate_monday_review = 0');
      } catch (e) {
        /* ignore */
      }
      conn.release();
    }
  },

  // 11.E — Statistics of every table in the schema
  getTableStats: async (req, res, next) => {
    try {
      const start = process.hrtime.bigint();
      const [tables] = await pool.query(
        `SELECT TABLE_NAME AS table_name
           FROM information_schema.TABLES
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
          ORDER BY TABLE_NAME`
      );

      const stats = [];
      for (const t of tables) {
        const name = t.table_name || t.TABLE_NAME;
        const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM \`${name.replace(/`/g, '')}\``);
        const [[{ cols }]] = await pool.query(
          `SELECT COUNT(*) AS cols FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
          [name]
        );
        stats.push({
          table_name: name,
          row_count: total,
          column_count: cols,
          message:
            total === 0
              ? `${name} is empty — no records inserted yet.`
              : `${name} holds ${total} record${total === 1 ? '' : 's'} across ${cols} columns.`
        });
      }

      const [views] = await pool.query(
        `SELECT TABLE_NAME AS name FROM information_schema.VIEWS WHERE TABLE_SCHEMA = DATABASE()`
      );

      const executionTimeMs = Number((Number(process.hrtime.bigint() - start) / 1e6).toFixed(3));
      return res.json({
        success: true,
        executionTimeMs,
        totals: {
          tables: stats.length,
          rows: stats.reduce((a, s) => a + Number(s.row_count), 0),
          views: views.length
        },
        data: stats
      });
    } catch (error) {
      next(error);
    }
  },

  // Catalog of stored procedures, functions and triggers in the database
  getCatalog: async (req, res, next) => {
    try {
      const [routines] = await pool.query(
        `SELECT ROUTINE_NAME AS name, ROUTINE_TYPE AS type
           FROM information_schema.ROUTINES
          WHERE ROUTINE_SCHEMA = DATABASE()
          ORDER BY ROUTINE_TYPE, ROUTINE_NAME`
      );
      const [triggers] = await pool.query(
        `SELECT TRIGGER_NAME AS name, ACTION_TIMING AS timing, EVENT_MANIPULATION AS event,
                EVENT_OBJECT_TABLE AS table_name
           FROM information_schema.TRIGGERS
          WHERE TRIGGER_SCHEMA = DATABASE()
          ORDER BY EVENT_OBJECT_TABLE, TRIGGER_NAME`
      );
      return res.json({ success: true, routines, triggers });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = plsqlController;
