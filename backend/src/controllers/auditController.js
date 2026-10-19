const { pool } = require('../config/db');

const auditController = {
  // Requirement 10.9 & Assignment 11: Get Audit Logs with pagination and filters
  getAuditLogs: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const pageSize = parseInt(req.query.pageSize || '15', 10);
      const { table, operation } = req.query;

      const offset = (page - 1) * pageSize;

      let whereClause = 'WHERE 1=1';
      const params = [];

      if (table) {
        whereClause += ' AND table_name = ?';
        params.push(table);
      }
      if (operation) {
        whereClause += ' AND operation_type = ?';
        params.push(operation.toUpperCase());
      }

      // Count query
      const [countResult] = await pool.query(
        `SELECT COUNT(*) AS total FROM application_audit_log ${whereClause}`,
        params
      );
      const totalRecords = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalRecords / pageSize) || 1;

      // Data query
      const [rows] = await pool.query(
        `SELECT 
          audit_id,
          table_name,
          operation_type,
          record_id,
          old_values,
          new_values,
          changed_at,
          changed_by
        FROM application_audit_log 
        ${whereClause}
        ORDER BY audit_id DESC 
        LIMIT ? OFFSET ?`,
        [...params, pageSize, offset]
      );

      return res.json({
        success: true,
        data: rows,
        pagination: {
          current_page: page,
          page_size: pageSize,
          total_records: totalRecords,
          total_pages: totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Audit Statistics
  getAuditStats: async (req, res, next) => {
    try {
      const [byOperation] = await pool.query(`
        SELECT operation_type, COUNT(*) AS count
        FROM application_audit_log
        GROUP BY operation_type
      `);

      const [byTable] = await pool.query(`
        SELECT table_name, COUNT(*) AS count
        FROM application_audit_log
        GROUP BY table_name
      `);

      return res.json({
        success: true,
        data: {
          byOperation,
          byTable
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = auditController;
