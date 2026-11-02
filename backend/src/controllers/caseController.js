const caseController = {
  // Get all cases with relational joins
  getAllCases: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';
      const { status, type, priority, search } = req.query;

      let baseView;
      if (role === 'Lawyer') {
        baseView = 'vw_lawyer_cases';
      } else if (role === 'Assistant' || role === 'Staff') {
        baseView = 'vw_staff_cases';
      } else {
        baseView = null; // Admin queries relational tables
      }

      let sql;
      const params = [];

      if (baseView) {
        sql = `
          SELECT 
            case_id,
            case_number,
            title,
            description,
            budget,
            priority,
            filed_date,
            expected_closure_date,
            actual_closure_date,
            notes,
            client_id,
            client_name,
            case_type_id,
            case_type,
            current_status_id,
            case_status
          FROM ${baseView}
          WHERE 1=1
        `;
        if (status) {
          sql += ' AND case_status = ?';
          params.push(status);
        }
        if (type) {
          sql += ' AND case_type = ?';
          params.push(type);
        }
        if (priority) {
          sql += ' AND priority = ?';
          params.push(priority);
        }
        if (search) {
          sql += ' AND (case_number LIKE ? OR title LIKE ? OR client_name LIKE ?)';
          const searchPattern = `%${search}%`;
          params.push(searchPattern, searchPattern, searchPattern);
        }
        sql += ' ORDER BY case_id DESC';
      } else {
        sql = `
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
      }

      const [rows] = await db.query(sql, params);
      return res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      next(error);
    }
  },

  // Get single case details including lawyers and hearings
  getCaseById: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';
      const caseId = parseInt(req.params.id, 10);

      let cases;
      let lawyers;
      let hearings;

      if (role === 'Lawyer') {
        [cases] = await db.query('SELECT * FROM vw_lawyer_cases WHERE case_id = ?', [caseId]);
        if (cases.length === 0) {
          return res.status(404).json({ success: false, message: 'Case not found or access denied.' });
        }
        [lawyers] = await db.query('SELECT * FROM vw_case_lawyers WHERE case_id = ?', [caseId]);
        [hearings] = await db.query('SELECT * FROM vw_lawyer_hearings WHERE case_id = ? ORDER BY hearing_date DESC', [caseId]);
      } else if (role === 'Assistant' || role === 'Staff') {
        [cases] = await db.query('SELECT * FROM vw_staff_cases WHERE case_id = ?', [caseId]);
        if (cases.length === 0) {
          return res.status(404).json({ success: false, message: 'Case not found.' });
        }
        [lawyers] = await db.query('SELECT * FROM vw_case_lawyers WHERE case_id = ?', [caseId]);
        [hearings] = await db.query('SELECT * FROM vw_staff_hearings WHERE case_id = ? ORDER BY hearing_date DESC', [caseId]);
      } else {
        [cases] = await db.query(`
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

        [lawyers] = await db.query(`
          SELECT l.lawyer_id, l.name, l.bar_registration_no, cl.role, cl.assigned_date, cl.is_primary
          FROM CASE_LAWYER cl
          INNER JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
          WHERE cl.case_id = ?
        `, [caseId]);

        [hearings] = await db.query(`
          SELECT h.*, co.court_name, co.city
          FROM HEARING h
          INNER JOIN COURT co ON h.court_id = co.court_id
          WHERE h.case_id = ?
          ORDER BY h.hearing_date DESC
        `, [caseId]);
      }

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

  // Create new case (Admin only)
  createCase: async (req, res, next) => {
    try {
      const db = req.db;
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

      const [result] = await db.query(`
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

  // Update existing case (Admin: full update; Lawyer: update own case notes only via sp_lawyer_update_case_notes)
  updateCase: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';
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

      if (role === 'Lawyer') {
        // Enforce notes-only update via stored procedure sp_lawyer_update_case_notes
        await db.query('CALL sp_lawyer_update_case_notes(?, ?)', [caseId, notes || '']);
        return res.json({ success: true, message: 'Case notes updated successfully.' });
      }

      await db.query(`
        UPDATE CASES
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            case_type_id = COALESCE(?, case_type_id),
            current_status_id = COALESCE(?, current_status_id),
            priority = COALESCE(?, priority),
            expected_closure_date = COALESCE(?, expected_closure_date),
            actual_closure_date = COALESCE(?, actual_closure_date),
            budget = COALESCE(?, budget),
            notes = COALESCE(?, notes)
        WHERE case_id = ?
      `, [
        title !== undefined ? title : null,
        description !== undefined ? description : null,
        case_type_id !== undefined ? case_type_id : null,
        current_status_id !== undefined ? current_status_id : null,
        priority !== undefined ? priority : null,
        expected_closure_date !== undefined ? expected_closure_date : null,
        actual_closure_date !== undefined ? actual_closure_date : null,
        budget !== undefined ? budget : null,
        notes !== undefined ? notes : null,
        caseId
      ]);

      return res.json({ success: true, message: 'Case updated successfully.' });
    } catch (error) {
      next(error);
    }
  },

  // Delete case (Admin only)
  deleteCase: async (req, res, next) => {
    try {
      const db = req.db;
      const caseId = parseInt(req.params.id, 10);
      await db.query('DELETE FROM CASES WHERE case_id = ?', [caseId]);
      return res.json({ success: true, message: 'Case deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  // Reference tables metadata (dropdown sources)
  getReferenceData: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      let caseTypes, caseStatuses, clients, lawyers, courts;

      if (role === 'Lawyer') {
        [caseTypes] = await db.query('SELECT case_type_id, type_name FROM vw_ref_case_types ORDER BY case_type_id');
        [caseStatuses] = await db.query('SELECT status_id, status_name FROM vw_ref_case_status ORDER BY status_id');
        [clients] = await db.query('SELECT client_id, name, client_type FROM vw_lawyer_clients ORDER BY name');
        [lawyers] = await db.query('SELECT lawyer_id, name, specialization FROM vw_staff_lawyers WHERE status = "Active" ORDER BY name');
        [courts] = await db.query('SELECT court_id, court_name, city FROM vw_ref_courts ORDER BY court_name');
      } else if (role === 'Assistant' || role === 'Staff') {
        [caseTypes] = await db.query('SELECT case_type_id, type_name FROM vw_ref_case_types ORDER BY case_type_id');
        [caseStatuses] = await db.query('SELECT status_id, status_name FROM vw_ref_case_status ORDER BY status_id');
        [clients] = await db.query('SELECT client_id, name, client_type FROM vw_staff_clients ORDER BY name');
        [lawyers] = await db.query('SELECT lawyer_id, name, specialization FROM vw_staff_lawyers WHERE status = "Active" ORDER BY name');
        [courts] = await db.query('SELECT court_id, court_name, city FROM vw_ref_courts ORDER BY court_name');
      } else {
        [caseTypes] = await db.query('SELECT case_type_id, type_name FROM CASE_TYPE ORDER BY case_type_id');
        [caseStatuses] = await db.query('SELECT status_id, status_name FROM CASE_STATUS ORDER BY status_id');
        [clients] = await db.query('SELECT client_id, name, client_type FROM CLIENT ORDER BY name');
        [lawyers] = await db.query('SELECT lawyer_id, name, specialization FROM LAWYER WHERE status = "Active" ORDER BY name');
        [courts] = await db.query('SELECT court_id, court_name, city FROM COURT ORDER BY court_name');
      }

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
  },

  assignCounsel: async (req, res, next) => {
    try {
      const db = req.db;
      const caseId = parseInt(req.params.id, 10);
      const { lawyer_id, role, is_primary } = req.body;

      if (!lawyer_id) {
        return res.status(400).json({ success: false, message: 'Advocate / Counsel (lawyer_id) is required.' });
      }

      const [results] = await db.query(
        'CALL sp_case_assign_counsel(?, ?, ?, ?)',
        [caseId, parseInt(lawyer_id, 10), role || 'Associate Counsel', Boolean(is_primary)]
      );

      return res.status(201).json({
        success: true,
        message: 'Counsel assigned to legal matter successfully.',
        data: results[0]?.[0]
      });
    } catch (error) {
      next(error);
    }
  },

  removeCounsel: async (req, res, next) => {
    try {
      const db = req.db;
      const caseId = parseInt(req.params.id, 10);
      const lawyerId = parseInt(req.params.lawyerId, 10);

      await db.query(
        'CALL sp_case_remove_counsel(?, ?)',
        [caseId, lawyerId]
      );

      return res.json({
        success: true,
        message: 'Counsel representation revoked from matter.'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = caseController;
