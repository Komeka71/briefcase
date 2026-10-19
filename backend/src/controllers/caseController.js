const { pool } = require('../config/db');

const caseController = {
  // Get all cases with relational joins
  getAllCases: async (req, res, next) => {
    try {
      const { status, type, priority, search } = req.query;

      let sql = `
        SELECT 
          c.case_id,
          c.case_number,
          c.title,
          c.description,
          c.budget,
          c.priority,
          c.filed_date,
          c.expected_closure_date,
          c.actual_closure_date,
          c.notes,
          c.client_id,
          cl.name AS client_name,
          c.case_type_id,
          ct.type_name AS case_type,
          c.current_status_id,
          cs.status_name AS case_status
        FROM CASES c
        INNER JOIN CLIENT cl ON c.client_id = cl.client_id
        LEFT JOIN CASE_TYPE ct ON c.case_type_id = ct.case_type_id
        LEFT JOIN CASE_STATUS cs ON c.current_status_id = cs.status_id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        sql += ' AND cs.status_name = ?';
        params.push(status);
      }
      if (type) {
        sql += ' AND ct.type_name = ?';
        params.push(type);
      }
      if (priority) {
        sql += ' AND c.priority = ?';
        params.push(priority);
      }
      if (search) {
        sql += ' AND (c.case_number LIKE ? OR c.title LIKE ? OR cl.name LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      sql += ' ORDER BY c.case_id DESC';

      const [rows] = await pool.query(sql, params);
      return res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      next(error);
    }
  },

  // Get single case details including lawyers, parties, and hearings
  getCaseById: async (req, res, next) => {
    try {
      const caseId = parseInt(req.params.id, 10);

      const [cases] = await pool.query(`
        SELECT 
          c.*,
          cl.name AS client_name,
          cl.phone AS client_phone,
          cl.email AS client_email,
          ct.type_name AS case_type,
          cs.status_name AS case_status
        FROM CASES c
        INNER JOIN CLIENT cl ON c.client_id = cl.client_id
        LEFT JOIN CASE_TYPE ct ON c.case_type_id = ct.case_type_id
        LEFT JOIN CASE_STATUS cs ON c.current_status_id = cs.status_id
        WHERE c.case_id = ?
      `, [caseId]);

      if (cases.length === 0) {
        return res.status(404).json({ success: false, message: 'Case not found.' });
      }

      // Fetch assigned lawyers
      const [lawyers] = await pool.query(`
        SELECT l.lawyer_id, l.name, l.bar_registration_no, cl.role, cl.assigned_date, cl.is_primary
        FROM CASE_LAWYER cl
        INNER JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
        WHERE cl.case_id = ?
      `, [caseId]);

      // Fetch hearings
      const [hearings] = await pool.query(`
        SELECT h.*, co.court_name, co.city
        FROM HEARING h
        INNER JOIN COURT co ON h.court_id = co.court_id
        WHERE h.case_id = ?
        ORDER BY h.hearing_date DESC
      `, [caseId]);

      return res.json({
        success: true,
        data: {
          ...cases[0],
          lawyers,
          hearings
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new case
  createCase: async (req, res, next) => {
    try {
      const {
        case_number,
        title,
        description,
        case_type_id,
        client_id,
        current_status_id,
        priority,
        filed_date,
        expected_closure_date,
        budget,
        notes
      } = req.body;

      if (!case_number || !title || !client_id) {
        return res.status(400).json({
          success: false,
          message: 'Case number, title, and client_id are required.'
        });
      }

      const [result] = await pool.query(`
        INSERT INTO CASES (
          case_number, title, description, case_type_id, client_id,
          current_status_id, priority, filed_date, expected_closure_date, budget, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        case_number,
        title,
        description || null,
        case_type_id || null,
        client_id,
        current_status_id || 1,
        priority || 'Medium',
        filed_date || null,
        expected_closure_date || null,
        budget !== undefined ? budget : null,
        notes || null
      ]);

      return res.status(201).json({
        success: true,
        message: 'Case created successfully.',
        case_id: result.insertId
      });
    } catch (error) {
      next(error);
    }
  },

  // Update existing case
  updateCase: async (req, res, next) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      const {
        title,
        description,
        case_type_id,
        current_status_id,
        priority,
        expected_closure_date,
        actual_closure_date,
        budget,
        notes
      } = req.body;

      await pool.query(`
        UPDATE CASES
        SET title = ?,
            description = ?,
            case_type_id = ?,
            current_status_id = ?,
            priority = ?,
            expected_closure_date = ?,
            actual_closure_date = ?,
            budget = ?,
            notes = ?
        WHERE case_id = ?
      `, [
        title,
        description || null,
        case_type_id || null,
        current_status_id || null,
        priority || 'Medium',
        expected_closure_date || null,
        actual_closure_date || null,
        budget !== undefined ? budget : null,
        notes || null,
        caseId
      ]);

      return res.json({ success: true, message: 'Case updated successfully.' });
    } catch (error) {
      next(error);
    }
  },

  // Delete case
  deleteCase: async (req, res, next) => {
    try {
      const caseId = parseInt(req.params.id, 10);
      await pool.query('DELETE FROM CASES WHERE case_id = ?', [caseId]);
      return res.json({ success: true, message: 'Case deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  // Reference tables metadata (dropdown sources)
  getReferenceData: async (req, res, next) => {
    try {
      const [caseTypes] = await pool.query('SELECT case_type_id, type_name FROM CASE_TYPE ORDER BY case_type_id');
      const [caseStatuses] = await pool.query('SELECT status_id, status_name FROM CASE_STATUS ORDER BY status_id');
      const [clients] = await pool.query('SELECT client_id, name, client_type FROM CLIENT ORDER BY name');
      const [lawyers] = await pool.query('SELECT lawyer_id, name, specialization FROM LAWYER WHERE status = "Active" ORDER BY name');
      const [courts] = await pool.query('SELECT court_id, court_name, city FROM COURT ORDER BY court_name');

      return res.json({
        success: true,
        data: {
          caseTypes,
          caseStatuses,
          clients,
          lawyers,
          courts
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = caseController;
