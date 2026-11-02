const lawyerController = {
  // Read-only directory for Lawyer and Assistant; Full CRUD for Admin
  getAllLawyers: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      let sql;
      if (role === 'Lawyer' || role === 'Assistant' || role === 'Staff') {
        sql = 'SELECT * FROM vw_staff_lawyers ORDER BY lawyer_id ASC';
      } else {
        sql = `
          SELECT 
            l.lawyer_id,
            l.name,
            l.bar_registration_no,
            l.email,
            l.phone,
            l.specialization,
            l.experience_years,
            l.join_date,
            l.status,
            l.department_id,
            d.department_name
          FROM LAWYER l
          LEFT JOIN DEPARTMENT d ON l.department_id = d.department_id
          ORDER BY l.lawyer_id ASC
        `;
      }

      const [rows] = await db.query(sql);
      return res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      next(error);
    }
  },

  getDepartments: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      const sql = (role === 'Lawyer' || role === 'Assistant' || role === 'Staff')
        ? 'SELECT department_id, department_name, description FROM vw_ref_departments ORDER BY department_id ASC'
        : 'SELECT department_id, department_name, description FROM DEPARTMENT ORDER BY department_id ASC';

      const [rows] = await db.query(sql);
      return res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      next(error);
    }
  },

  createLawyer: async (req, res, next) => {
    try {
      const db = req.db;
      const { name, bar_registration_no, email, phone, specialization, experience_years, department_id } = req.body;

      if (!name || !bar_registration_no) {
        return res.status(400).json({ success: false, message: 'Name and Bar Registration Number are required.' });
      }

      const [result] = await db.query(`
        INSERT INTO LAWYER (name, bar_registration_no, email, phone, specialization, experience_years, join_date, status, department_id)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_DATE, 'Active', ?)
      `, [name, bar_registration_no, email || null, phone || null, specialization || null, experience_years || 0, department_id || null]);

      return res.status(201).json({ success: true, message: 'Lawyer added successfully.', lawyer_id: result.insertId });
    } catch (error) {
      next(error);
    }
  },

  updateLawyer: async (req, res, next) => {
    try {
      const db = req.db;
      const lawyerId = parseInt(req.params.id, 10);
      const { name, email, phone, specialization, experience_years, status, department_id } = req.body;

      await db.query(`
        UPDATE LAWYER
        SET name = ?, email = ?, phone = ?, specialization = ?, experience_years = ?, status = ?, department_id = ?
        WHERE lawyer_id = ?
      `, [name, email || null, phone || null, specialization || null, experience_years || 0, status || 'Active', department_id || null, lawyerId]);

      return res.json({ success: true, message: 'Lawyer updated successfully.' });
    } catch (error) {
      next(error);
    }
  },

  deleteLawyer: async (req, res, next) => {
    try {
      const db = req.db;
      const lawyerId = parseInt(req.params.id, 10);
      await db.query('DELETE FROM LAWYER WHERE lawyer_id = ?', [lawyerId]);
      return res.json({ success: true, message: 'Lawyer record deleted.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = lawyerController;
