const { pool } = require('../config/db');

const practiceController = {
  // Documents Management
  getDocuments: async (req, res, next) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          d.document_id,
          d.title,
          d.description,
          d.file_path,
          d.file_size,
          d.upload_date,
          d.is_confidential,
          c.case_id,
          c.case_number,
          c.title AS case_title,
          dt.type_name AS document_type,
          u.name AS uploaded_by_name
        FROM DOCUMENT d
        LEFT JOIN CASES c ON d.case_id = c.case_id
        LEFT JOIN DOCUMENT_TYPE dt ON d.document_type_id = dt.document_type_id
        LEFT JOIN USERS u ON d.uploaded_by = u.user_id
        ORDER BY d.upload_date DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  },

  createDocument: async (req, res, next) => {
    try {
      const { case_id, document_type_id, title, description, file_path, file_size, is_confidential } = req.body;
      const [result] = await pool.query(
        `INSERT INTO DOCUMENT (case_id, document_type_id, title, description, file_path, file_size, upload_date, uploaded_by, is_confidential)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), 1, ?)`,
        [case_id || 1, document_type_id || 1, title, description || '', file_path || '/uploads/doc.pdf', file_size || 1024000, is_confidential ? 1 : 0]
      );
      res.status(201).json({ success: true, message: 'Document registered successfully', id: result.insertId });
    } catch (err) {
      next(err);
    }
  },

  deleteDocument: async (req, res, next) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM DOCUMENT WHERE document_id = ?', [id]);
      res.json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  // Tasks Management
  getTasks: async (req, res, next) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          t.task_id,
          t.title,
          t.description,
          t.due_date,
          t.priority,
          t.status,
          c.case_id,
          c.case_number,
          c.title AS case_title,
          u.name AS assigned_to_name
        FROM TASK t
        LEFT JOIN CASES c ON t.case_id = c.case_id
        LEFT JOIN USERS u ON t.assigned_to = u.user_id
        ORDER BY t.due_date ASC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  },

  createTask: async (req, res, next) => {
    try {
      const { case_id, assigned_to, title, description, due_date, priority, status } = req.body;
      const [result] = await pool.query(
        `INSERT INTO TASK (case_id, assigned_to, created_by, title, description, due_date, priority, status)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?)`,
        [case_id || 1, assigned_to || 1, title, description || '', due_date, priority || 'Medium', status || 'Pending']
      );
      res.status(201).json({ success: true, message: 'Task created successfully', id: result.insertId });
    } catch (err) {
      next(err);
    }
  },

  updateTaskStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await pool.query('UPDATE TASK SET status = ? WHERE task_id = ?', [status, id]);
      res.json({ success: true, message: 'Task status updated' });
    } catch (err) {
      next(err);
    }
  },

  deleteTask: async (req, res, next) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM TASK WHERE task_id = ?', [id]);
      res.json({ success: true, message: 'Task removed successfully' });
    } catch (err) {
      next(err);
    }
  },

  // Invoices & Payments Management
  getInvoices: async (req, res, next) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          i.invoice_id,
          i.invoice_number,
          i.invoice_date,
          i.due_date,
          i.amount,
          i.status,
          i.description,
          c.case_number,
          c.title AS case_title,
          cl.name AS client_name
        FROM INVOICE i
        LEFT JOIN CASES c ON i.case_id = c.case_id
        LEFT JOIN CLIENT cl ON c.client_id = cl.client_id
        ORDER BY i.invoice_date DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  },

  getPayments: async (req, res, next) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.payment_id,
          p.payment_date,
          p.amount,
          p.payment_status,
          p.description,
          pm.method_name,
          i.invoice_number,
          c.case_number,
          c.title AS case_title,
          cl.name AS client_name
        FROM PAYMENT p
        LEFT JOIN PAYMENT_METHOD pm ON p.payment_method_id = pm.method_id
        LEFT JOIN INVOICE i ON p.invoice_id = i.invoice_id
        LEFT JOIN CASES c ON p.case_id = c.case_id
        LEFT JOIN CLIENT cl ON c.client_id = cl.client_id
        ORDER BY p.payment_date DESC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  },

  // Appointments Management
  getAppointments: async (req, res, next) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          a.appointment_id,
          a.appointment_date,
          a.start_time,
          a.end_time,
          a.purpose,
          a.status,
          a.notes,
          cl.name AS client_name,
          l.name AS lawyer_name
        FROM APPOINTMENT a
        LEFT JOIN CLIENT cl ON a.client_id = cl.client_id
        LEFT JOIN LAWYER l ON a.lawyer_id = l.lawyer_id
        ORDER BY a.appointment_date DESC, a.start_time ASC
      `);
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = practiceController;
