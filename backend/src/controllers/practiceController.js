const practiceController = {
  // Documents Management
  getDocuments: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      let sql;
      if (role === 'Lawyer') {
        sql = `
          SELECT 
            document_id,
            title,
            description,
            file_path,
            file_size,
            upload_date,
            is_confidential,
            case_id,
            case_number,
            case_title,
            document_type,
            uploaded_by_name
          FROM vw_lawyer_documents
          ORDER BY upload_date DESC
        `;
      } else if (role === 'Assistant' || role === 'Staff') {
        sql = `
          SELECT 
            document_id,
            title,
            description,
            file_path,
            file_size,
            upload_date,
            is_confidential,
            case_id,
            case_number,
            case_title,
            document_type,
            uploaded_by_name
          FROM vw_staff_documents
          ORDER BY upload_date DESC
        `;
      } else {
        sql = `
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
        `;
      }

      const [rows] = await db.query(sql);
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  },

  createDocument: async (req, res, next) => {
    try {
      const db = req.db;
      const { case_id, document_type_id, title, description, file_path, file_size, is_confidential } = req.body;

      // Use stored procedure sp_role_add_document for role enforcement
      const conn = await db.getConnection();
      try {
        await conn.query('SET @new_doc_id = 0');
        await conn.query(
          'CALL sp_role_add_document(?, ?, ?, ?, ?, ?, ?, @new_doc_id)',
          [
            case_id || null,
            document_type_id || 1,
            title || 'Untitled Document',
            description || '',
            file_path || '/uploads/doc.pdf',
            file_size || 1024000,
            is_confidential ? 1 : 0
          ]
        );
        const [out] = await conn.query('SELECT @new_doc_id AS id');
        res.status(201).json({ success: true, message: 'Document registered successfully', id: out[0]?.id });
      } finally {
        conn.release();
      }
    } catch (err) {
      next(err);
    }
  },

  deleteDocument: async (req, res, next) => {
    try {
      const db = req.db;
      const { id } = req.params;
      await db.query('DELETE FROM DOCUMENT WHERE document_id = ?', [id]);
      res.json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  // Tasks Management
  getTasks: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      let sql;
      if (role === 'Lawyer') {
        sql = `
          SELECT 
            task_id,
            title,
            description,
            due_date,
            priority,
            status,
            case_id,
            case_number,
            case_title,
            assigned_to_name
          FROM vw_lawyer_tasks
          ORDER BY due_date ASC
        `;
      } else if (role === 'Assistant' || role === 'Staff') {
        sql = `
          SELECT 
            task_id,
            title,
            description,
            due_date,
            priority,
            status,
            case_id,
            case_number,
            case_title,
            assigned_to_name
          FROM vw_staff_tasks
          ORDER BY due_date ASC
        `;
      } else {
        sql = `
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
        `;
      }

      const [rows] = await db.query(sql);
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  },

  createTask: async (req, res, next) => {
    try {
      const db = req.db;
      const { case_id, assigned_to, title, description, due_date, priority, status } = req.body;

      const conn = await db.getConnection();
      try {
        await conn.query('SET @new_task_id = 0');
        await conn.query(
          'CALL sp_role_add_task(?, ?, ?, ?, ?, ?, ?, @new_task_id)',
          [
            case_id,
            assigned_to || null,
            title,
            description || '',
            due_date || null,
            priority || 'Medium',
            status || 'Pending'
          ]
        );
        const [out] = await conn.query('SELECT @new_task_id AS id');
        res.status(201).json({ success: true, message: 'Task created successfully', id: out[0]?.id });
      } finally {
        conn.release();
      }
    } catch (err) {
      next(err);
    }
  },

  updateTaskStatus: async (req, res, next) => {
    try {
      const db = req.db;
      const { id } = req.params;
      const { status } = req.body;

      await db.query('CALL sp_role_update_task_status(?, ?)', [id, status]);
      res.json({ success: true, message: 'Task status updated' });
    } catch (err) {
      next(err);
    }
  },

  deleteTask: async (req, res, next) => {
    try {
      const db = req.db;
      const { id } = req.params;
      await db.query('DELETE FROM TASK WHERE task_id = ?', [id]);
      res.json({ success: true, message: 'Task removed successfully' });
    } catch (err) {
      next(err);
    }
  },

  // Invoices & Payments Management (Admin only)
  getInvoices: async (req, res, next) => {
    try {
      const db = req.db;
      const [rows] = await db.query(`
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
      const db = req.db;
      const [rows] = await db.query(`
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

  // Appointments Management (Admin only)
  getAppointments: async (req, res, next) => {
    try {
      const db = req.db;
      const [rows] = await db.query(`
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
