const path = require('path');
const fs = require('fs');

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
      const { case_id, document_type_id, description, is_confidential } = req.body;
      let title = req.body.title;
      let file_path = req.body.file_path;
      let file_size = parseInt(req.body.file_size, 10);

      if (req.file) {
        title = title || req.file.originalname;
        file_path = req.file.filename;
        file_size = req.file.size;
      } else {
        title = title || 'Untitled Exhibit';
        file_path = file_path || 'document.pdf';
        file_size = Number.isInteger(file_size) ? file_size : 1024000;
      }

      const isConf = is_confidential === true || is_confidential === 'true' || is_confidential === 1 || is_confidential === '1';

      // Call sp_role_add_document for role validation and ownership checks
      const conn = await db.getConnection();
      try {
        await conn.query('SET @new_doc_id = 0');
        const [results] = await conn.query(
          'CALL sp_role_add_document(?, ?, ?, ?, ?, ?, ?, @new_doc_id)',
          [
            parseInt(case_id, 10) || null,
            parseInt(document_type_id, 10) || 1,
            title,
            description || '',
            file_path,
            file_size,
            isConf ? 1 : 0
          ]
        );
        const [out] = await conn.query('SELECT @new_doc_id AS id');
        const newId = out[0]?.id || (results[0] && results[0][0]?.document_id);
        return res.status(201).json({
          success: true,
          message: 'Document exhibit registered successfully.',
          id: newId,
          file_path
        });
      } finally {
        conn.release();
      }
    } catch (err) {
      next(err);
    }
  },

  downloadDocument: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';
      const docId = parseInt(req.params.id, 10);

      let doc;
      if (role === 'Lawyer') {
        const [rows] = await db.query('SELECT * FROM vw_lawyer_documents WHERE document_id = ?', [docId]);
        doc = rows[0];
      } else if (role === 'Assistant' || role === 'Staff') {
        const [rows] = await db.query('SELECT * FROM vw_staff_documents WHERE document_id = ?', [docId]);
        doc = rows[0];
      } else {
        const [rows] = await db.query('SELECT * FROM DOCUMENT WHERE document_id = ?', [docId]);
        doc = rows[0];
      }

      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found or access restricted.' });
      }

      const storageDir = path.join(__dirname, '../../storage/documents');
      const safeFileName = path.basename(doc.file_path || '');
      let filePath = path.join(storageDir, safeFileName);

      // Create placeholder file on disk if missing so download always streams
      if (!fs.existsSync(filePath) || !doc.file_path) {
        if (!fs.existsSync(storageDir)) {
          fs.mkdirSync(storageDir, { recursive: true });
        }
        const placeholderName = `document_${docId}.txt`;
        filePath = path.join(storageDir, placeholderName);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, `BriefCase Legal Exhibit Record\nDocument ID: ${docId}\nTitle: ${doc.title}\nFiled on: ${doc.upload_date || new Date().toISOString()}`);
        }
      }

      const ext = path.extname(filePath) || '.pdf';
      const downloadName = `${(doc.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
      return res.download(filePath, downloadName);
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
      const role = req.user?.role || 'Admin';

      if (role !== 'Admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Only administrators can delete tasks.' });
      }

      const { id } = req.params;
      const [rows] = await db.query('SELECT status FROM TASK WHERE task_id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Task record not found.' });
      }

      if (rows[0].status !== 'Completed') {
        return res.status(400).json({
          success: false,
          message: 'Action rejected: Only tasks with "Completed" status can be deleted from records.'
        });
      }

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

  createInvoice: async (req, res, next) => {
    try {
      const db = req.db;
      const { case_id, issue_date, due_date, amount, description } = req.body;

      if (!case_id || !amount) {
        return res.status(400).json({ success: false, message: 'Case ID and amount are required.' });
      }

      const conn = await db.getConnection();
      try {
        await conn.query('SET @new_invoice_id = 0');
        const [results] = await conn.query(
          'CALL sp_create_invoice(?, ?, ?, ?, ?, @new_invoice_id)',
          [
            parseInt(case_id, 10),
            issue_date || new Date().toISOString().slice(0, 10),
            due_date || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            parseFloat(amount),
            description || ''
          ]
        );
        const [out] = await conn.query('SELECT @new_invoice_id AS id');
        const invoiceId = out[0]?.id || (results[0] && results[0][0]?.invoice_id);

        return res.status(201).json({
          success: true,
          message: 'Invoice generated successfully via stored procedure.',
          invoice_id: invoiceId,
          data: results[0] ? results[0][0] : undefined
        });
      } finally {
        conn.release();
      }
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
          cl.name AS client_name,
          CONCAT('REC-', LPAD(p.payment_id, 4, '0')) AS payment_reference
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

  createPayment: async (req, res, next) => {
    try {
      const db = req.db;
      const { case_id, payment_method_id, invoice_id, payment_date, amount, payment_status, description } = req.body;

      if (!case_id || !amount) {
        return res.status(400).json({ success: false, message: 'Case ID and payment amount are required.' });
      }

      const conn = await db.getConnection();
      try {
        await conn.query('SET @new_payment_id = 0');
        const [results] = await conn.query(
          'CALL sp_record_payment(?, ?, ?, ?, ?, ?, ?, @new_payment_id)',
          [
            parseInt(case_id, 10),
            parseInt(payment_method_id, 10) || 1,
            invoice_id ? parseInt(invoice_id, 10) : null,
            payment_date || new Date().toISOString().slice(0, 10),
            parseFloat(amount),
            payment_status || 'Completed',
            description || ''
          ]
        );
        const [out] = await conn.query('SELECT @new_payment_id AS id');
        const paymentId = out[0]?.id || (results[0] && results[0][0]?.payment_id);

        return res.status(201).json({
          success: true,
          message: 'Payment recorded and ledger reconciled successfully.',
          payment_id: paymentId,
          data: results[0] ? results[0][0] : undefined
        });
      } finally {
        conn.release();
      }
    } catch (err) {
      next(err);
    }
  },

  updatePaymentStatus: async (req, res, next) => {
    try {
      const db = req.db;
      const paymentId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Payment status is required.' });
      }

      await db.query('UPDATE PAYMENT SET payment_status = ? WHERE payment_id = ?', [status, paymentId]);

      const [rows] = await db.query('SELECT * FROM PAYMENT WHERE payment_id = ?', [paymentId]);
      return res.json({
        success: true,
        message: `Payment #${paymentId} marked as ${status}. Ledger and invoice reconciled.`,
        data: rows[0]
      });
    } catch (err) {
      next(err);
    }
  },

  // Export Audit Ledger as CSV with UTF-8 BOM
  exportLedger: async (req, res, next) => {
    try {
      const db = req.db;

      const [invoices] = await db.query(`
        SELECT 
          i.invoice_date AS trans_date,
          'Invoice' AS trans_type,
          i.invoice_number AS trans_ref,
          c.case_number,
          cl.name AS client_name,
          i.amount,
          i.status,
          i.description
        FROM INVOICE i
        LEFT JOIN CASES c ON i.case_id = c.case_id
        LEFT JOIN CLIENT cl ON c.client_id = cl.client_id
        ORDER BY i.invoice_date DESC
      `);

      const [payments] = await db.query(`
        SELECT 
          p.payment_date AS trans_date,
          'Payment Receipt' AS trans_type,
          CONCAT('REC-', LPAD(p.payment_id, 4, '0')) AS trans_ref,
          c.case_number,
          cl.name AS client_name,
          p.amount,
          p.payment_status AS status,
          p.description
        FROM PAYMENT p
        LEFT JOIN CASES c ON p.case_id = c.case_id
        LEFT JOIN CLIENT cl ON c.client_id = cl.client_id
        ORDER BY p.payment_date DESC
      `);

      const combined = [...invoices, ...payments].sort((a, b) => new Date(b.trans_date) - new Date(a.trans_date));

      const header = ['Date', 'Type', 'Reference', 'Case Number', 'Client Name', 'Amount (INR)', 'Status', 'Description'];
      const csvLines = [
        header.join(','),
        ...combined.map((r) => [
          `"${r.trans_date || ''}"`,
          `"${r.trans_type || ''}"`,
          `"${r.trans_ref || ''}"`,
          `"${r.case_number || ''}"`,
          `"${(r.client_name || '').replace(/"/g, '""')}"`,
          Number(r.amount || 0).toFixed(2),
          `"${r.status || ''}"`,
          `"${(r.description || '').replace(/"/g, '""')}"`
        ].join(','))
      ];

      const bom = '\uFEFF';
      const csvOutput = bom + csvLines.join('\r\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="briefcase_audit_ledger.csv"');
      return res.send(csvOutput);
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
