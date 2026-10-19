const { pool } = require('../config/db');
const { clientsToXml, aggregateToXml, queryResultToXml } = require('../utils/xml');

/**
 * Controller for Assignment 11 Section A, B, C & XML Output
 */
const reportController = {
  // Query 1 & Requirement 11.1 & Req F: Display all records with execution time & XML
  getQuery1Clients: async (req, res, next) => {
    try {
      const startTime = process.hrtime.bigint();
      const [rows] = await pool.query(`
        SELECT 
          client_id,
          name,
          client_type,
          phone,
          email,
          address,
          date_of_registration
        FROM CLIENT
        ORDER BY client_id ASC
      `);
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;

      const format = (req.query.format || '').toLowerCase();
      if (format === 'xml' || req.headers.accept?.includes('application/xml')) {
        const xmlData = clientsToXml(rows, 'clients_records');
        res.header('Content-Type', 'application/xml; charset=utf-8');
        return res.send(xmlData);
      }

      return res.json({
        success: true,
        queryNumber: 1,
        title: 'Display all data from main table (CLIENT)',
        executionTimeMs: parseFloat(executionTimeMs.toFixed(3)),
        count: rows.length,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Query 2 & Requirement 11.2: Insert records maintaining integrity constraints
  getQuery2InsertIntegrity: async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        client_name,
        client_type,
        client_phone,
        client_email,
        client_address,
        case_title,
        case_type_id,
        budget,
        priority
      } = req.body;

      if (!client_name || !client_type || !case_title) {
        return res.status(400).json({
          success: false,
          message: 'Client name, client type, and case title are required.'
        });
      }

      // Step 2a: Insert client
      const [clientResult] = await connection.query(`
        INSERT INTO CLIENT (name, client_type, phone, email, address, date_of_registration)
        VALUES (?, ?, ?, ?, ?, CURRENT_DATE)
      `, [client_name, client_type, client_phone || null, client_email || null, client_address || null]);

      const clientId = clientResult.insertId;

      // Generate unique case number
      const caseNumber = `CASE/${new Date().getFullYear()}/${String(clientId).padStart(4, '0')}`;

      // Step 2b: Insert dependent case with foreign key client_id
      const [caseResult] = await connection.query(`
        INSERT INTO CASES (
          case_number, title, case_type_id, client_id, current_status_id, priority, filed_date, budget
        ) VALUES (?, ?, ?, ?, 1, ?, CURRENT_DATE, ?)
      `, [caseNumber, case_title, case_type_id || 1, clientId, priority || 'Medium', budget || 100000.00]);

      await connection.commit();

      return res.status(201).json({
        success: true,
        queryNumber: 2,
        title: 'Insert records maintaining integrity constraints',
        message: 'Successfully inserted linked Client and Case records with relational integrity.',
        data: {
          client_id: clientId,
          case_id: caseResult.insertId,
          case_number: caseNumber
        }
      });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  },

  // Query 3 & Requirement 11.3 & Req F: Aggregate result with dropdown & XML output
  getQuery3Aggregate: async (req, res, next) => {
    try {
      const func = (req.query.func || 'SUM').toUpperCase();
      const column = (req.query.column || 'budget').toLowerCase();
      const table = (req.query.table || 'CASES').toUpperCase();

      // Allowlist validation
      const allowedFuncs = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX'];
      const allowedTables = {
        CASES: ['budget'],
        INVOICE: ['amount'],
        PAYMENT: ['amount']
      };

      if (!allowedFuncs.includes(func)) {
        return res.status(400).json({
          success: false,
          message: `Invalid aggregate function. Allowed: ${allowedFuncs.join(', ')}`
        });
      }

      if (!allowedTables[table] || !allowedTables[table].includes(column)) {
        return res.status(400).json({
          success: false,
          message: `Invalid table/column combination for numeric aggregation.`
        });
      }

      const startTime = process.hrtime.bigint();
      const sql = `
        SELECT 
          '${table}' AS table_name,
          '${column}' AS column_name,
          '${func}' AS aggregate_function,
          COALESCE(${func}(${column}), 0) AS result_value
        FROM ${table}
      `;
      const [rows] = await pool.query(sql);
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;

      const format = (req.query.format || '').toLowerCase();
      if (format === 'xml' || req.headers.accept?.includes('application/xml')) {
        const xmlData = aggregateToXml({
          table_name: rows[0].table_name,
          column_name: rows[0].column_name,
          aggregate_function: rows[0].aggregate_function,
          result_value: rows[0].result_value,
          execution_time_ms: executionTimeMs.toFixed(3)
        });
        res.header('Content-Type', 'application/xml; charset=utf-8');
        return res.send(xmlData);
      }

      return res.json({
        success: true,
        queryNumber: 3,
        title: 'Display aggregate function result',
        executionTimeMs: parseFloat(executionTimeMs.toFixed(3)),
        data: rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Query 4 & Requirement 11.4 & Req F: Conditional query with controls & XML
  getQuery4Conditional: async (req, res, next) => {
    try {
      const column = (req.query.column || 'client_type');
      const operator = req.query.operator || '=';
      const value = req.query.value !== undefined ? req.query.value : 'Individual';

      // Allowlist validation
      const allowedColumns = ['client_type', 'address', 'name', 'email'];
      const allowedOperators = ['=', '!=', 'LIKE', '>', '<', '>=', '<='];

      if (!allowedColumns.includes(column)) {
        return res.status(400).json({
          success: false,
          message: `Invalid filter column. Allowed: ${allowedColumns.join(', ')}`
        });
      }

      if (!allowedOperators.includes(operator)) {
        return res.status(400).json({
          success: false,
          message: `Invalid operator. Allowed: ${allowedOperators.join(', ')}`
        });
      }

      const startTime = process.hrtime.bigint();
      let sql = `SELECT client_id, name, client_type, phone, email, address, date_of_registration FROM CLIENT WHERE `;
      let params = [];

      if (operator === 'LIKE') {
        sql += `\`${column}\` LIKE ?`;
        params.push(`%${value}%`);
      } else {
        sql += `\`${column}\` ${operator} ?`;
        params.push(value);
      }
      sql += ' ORDER BY client_id ASC';

      const [rows] = await pool.query(sql, params);
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;

      const format = (req.query.format || '').toLowerCase();
      if (format === 'xml' || req.headers.accept?.includes('application/xml')) {
        const xmlData = clientsToXml(rows, 'filtered_clients');
        res.header('Content-Type', 'application/xml; charset=utf-8');
        return res.send(xmlData);
      }

      return res.json({
        success: true,
        queryNumber: 4,
        title: 'Conditional query on main table (CLIENT)',
        condition: `${column} ${operator} '${value}'`,
        executionTimeMs: parseFloat(executionTimeMs.toFixed(3)),
        count: rows.length,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Query 5 & Requirement 11.5: Dynamic JOIN operations on two project tables
  getQuery5Join: async (req, res, next) => {
    try {
      const table1 = (req.query.table1 || 'CLIENT').toUpperCase();
      const table2 = (req.query.table2 || 'CASES').toUpperCase();
      const joinType = (req.query.joinType || 'INNER').toUpperCase();

      // Allowed join configurations
      const allowedJoins = {
        'CLIENT-CASES': {
          sql: `
            SELECT 
              cl.client_id,
              cl.name AS client_name,
              cl.client_type,
              c.case_id,
              c.case_number,
              c.title AS case_title,
              c.budget,
              c.priority
            FROM CLIENT cl
            ${joinType} JOIN CASES c ON cl.client_id = c.client_id
            ORDER BY cl.client_id ASC
          `
        },
        'CASES-CASE_TYPE': {
          sql: `
            SELECT 
              c.case_id,
              c.case_number,
              c.title AS case_title,
              c.budget,
              ct.case_type_id,
              ct.type_name AS case_type_name,
              ct.description AS type_description
            FROM CASES c
            ${joinType} JOIN CASE_TYPE ct ON c.case_type_id = ct.case_type_id
            ORDER BY c.case_id ASC
          `
        },
        'CASES-CASE_STATUS': {
          sql: `
            SELECT 
              c.case_id,
              c.case_number,
              c.title AS case_title,
              c.priority,
              cs.status_id,
              cs.status_name,
              cs.description AS status_description
            FROM CASES c
            ${joinType} JOIN CASE_STATUS cs ON c.current_status_id = cs.status_id
            ORDER BY c.case_id ASC
          `
        },
        'HEARING-COURT': {
          sql: `
            SELECT 
              h.hearing_id,
              h.case_id,
              h.hearing_date,
              h.start_time,
              h.purpose,
              co.court_id,
              co.court_name,
              co.court_type,
              co.city
            FROM HEARING h
            ${joinType} JOIN COURT co ON h.court_id = co.court_id
            ORDER BY h.hearing_date DESC
          `
        },
        'PAYMENT-PAYMENT_METHOD': {
          sql: `
            SELECT 
              p.payment_id,
              p.case_id,
              p.amount,
              p.payment_date,
              p.payment_status,
              pm.method_id,
              pm.method_name
            FROM PAYMENT p
            ${joinType} JOIN PAYMENT_METHOD pm ON p.payment_method_id = pm.method_id
            ORDER BY p.payment_id DESC
          `
        }
      };

      if (!['INNER', 'LEFT', 'RIGHT'].includes(joinType)) {
        return res.status(400).json({
          success: false,
          message: 'Supported join types are: INNER, LEFT, RIGHT'
        });
      }

      const key = `${table1}-${table2}`;
      const joinConfig = allowedJoins[key];

      if (!joinConfig) {
        return res.status(400).json({
          success: false,
          message: `Join between ${table1} and ${table2} is not in the allowed schema relationship map.`
        });
      }

      const startTime = process.hrtime.bigint();
      const [rows] = await pool.query(joinConfig.sql);
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;

      return res.json({
        success: true,
        queryNumber: 5,
        title: 'JOIN operation on two tables',
        relationship: key,
        joinType,
        executionTimeMs: parseFloat(executionTimeMs.toFixed(3)),
        count: rows.length,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Query 6 & Requirement 11.6: Subquery across multiple tables
  getQuery6Subquery: async (req, res, next) => {
    try {
      const minBudget = parseFloat(req.query.minBudget || '300000.00');

      const startTime = process.hrtime.bigint();
      const [rows] = await pool.query(`
        SELECT 
          cl.client_id,
          cl.name,
          cl.client_type,
          cl.email,
          cl.phone,
          cl.address
        FROM CLIENT cl
        WHERE cl.client_id IN (
          SELECT DISTINCT c.client_id
          FROM CASES c
          WHERE c.budget >= ?
        )
        ORDER BY cl.client_id ASC
      `, [minBudget]);
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;

      return res.json({
        success: true,
        queryNumber: 6,
        title: 'Subquery from multiple tables',
        description: `Find all clients who have legal cases with budget >= Rs ${minBudget.toLocaleString()}`,
        innerQuery: `SELECT DISTINCT c.client_id FROM CASES c WHERE c.budget >= ${minBudget}`,
        outerQuery: 'SELECT ... FROM CLIENT cl WHERE cl.client_id IN (...)',
        executionTimeMs: parseFloat(executionTimeMs.toFixed(3)),
        count: rows.length,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Query 7 & Requirement 11.7: Correlated Subquery
  getQuery7Correlated: async (req, res, next) => {
    try {
      const startTime = process.hrtime.bigint();
      const [rows] = await pool.query(`
        SELECT 
          c1.case_id,
          c1.case_number,
          c1.title,
          c1.case_type_id,
          ct.type_name AS case_type,
          c1.budget,
          (
            SELECT ROUND(AVG(c2.budget), 2)
            FROM CASES c2
            WHERE c2.case_type_id = c1.case_type_id
          ) AS category_avg_budget
        FROM CASES c1
        INNER JOIN CASE_TYPE ct ON c1.case_type_id = ct.case_type_id
        WHERE c1.budget > (
          SELECT AVG(c2.budget)
          FROM CASES c2
          WHERE c2.case_type_id = c1.case_type_id
        )
        ORDER BY c1.budget DESC
      `);
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;

      return res.json({
        success: true,
        queryNumber: 7,
        title: 'Correlated Subquery',
        description: 'Find all cases whose budget is strictly greater than the average budget of cases in the same Case Type',
        correlation: 'c2.case_type_id = c1.case_type_id',
        executionTimeMs: parseFloat(executionTimeMs.toFixed(3)),
        count: rows.length,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Query 8 & Requirement 11.8: Update table data maintaining integrity
  getQuery8UpdateIntegrity: async (req, res, next) => {
    try {
      const caseId = parseInt(req.body.case_id || '1', 10);
      const newBudget = parseFloat(req.body.budget || '550000.00');
      const remarks = req.body.notes || 'Budget updated and approved by client.';

      const startTime = process.hrtime.bigint();
      await pool.query(`
        UPDATE CASES
        SET budget = ?,
            notes = CONCAT(COALESCE(notes, ''), ' | ', ?)
        WHERE case_id = ?
      `, [newBudget, remarks, caseId]);

      const [updatedRows] = await pool.query(
        'SELECT case_id, case_number, title, budget, notes FROM CASES WHERE case_id = ?',
        [caseId]
      );
      const endTime = process.hrtime.bigint();
      const executionTimeMs = Number(endTime - startTime) / 1000000;

      return res.json({
        success: true,
        queryNumber: 8,
        title: 'Update records maintaining integrity',
        message: 'Case record updated successfully.',
        executionTimeMs: parseFloat(executionTimeMs.toFixed(3)),
        data: updatedRows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Requirement 11.C: Views Demonstration
  getViewData: async (req, res, next) => {
    try {
      const viewName = req.query.view || 'vw_client_cases';
      let sql;
      if (viewName === 'vw_surat_clients') {
        sql = 'SELECT * FROM vw_surat_clients ORDER BY client_id ASC';
      } else {
        sql = 'SELECT * FROM vw_client_cases ORDER BY case_id ASC LIMIT 20';
      }

      const [rows] = await pool.query(sql);
      return res.json({
        success: true,
        view: viewName,
        count: rows.length,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reportController;
