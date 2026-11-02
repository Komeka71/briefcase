const { clientsToXml } = require('../utils/xml');

/**
 * Controller for CLIENT entity and Stored Procedures
 */
const clientController = {
  // Query 1 & Requirement 11.1: Display all clients (supports JSON and XML)
  getAllClients: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      let sql;
      if (role === 'Lawyer') {
        sql = 'SELECT * FROM vw_lawyer_clients ORDER BY client_id ASC';
      } else if (role === 'Assistant' || role === 'Staff') {
        sql = 'SELECT * FROM vw_staff_clients ORDER BY client_id ASC';
      } else {
        sql = 'SELECT * FROM CLIENT ORDER BY client_id ASC';
      }

      const [rows] = await db.query(sql);

      const format = (req.query.format || '').toLowerCase();
      if (format === 'xml' || req.headers.accept?.includes('application/xml')) {
        const xmlData = clientsToXml(rows, 'clients');
        res.header('Content-Type', 'application/xml; charset=utf-8');
        return res.send(xmlData);
      }

      return res.json({
        success: true,
        count: rows.length,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Requirement 10.1: Get Client By ID
  getClientById: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';
      const clientId = parseInt(req.params.id, 10);

      let client;
      if (role === 'Lawyer') {
        const [rows] = await db.query('SELECT * FROM vw_lawyer_clients WHERE client_id = ?', [clientId]);
        client = rows[0];
      } else if (role === 'Assistant' || role === 'Staff') {
        const [rows] = await db.query('SELECT * FROM vw_staff_clients WHERE client_id = ?', [clientId]);
        client = rows[0];
      } else {
        const [results] = await db.query('CALL GetClientById(?)', [clientId]);
        client = results[0] && results[0][0];
      }

      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      return res.json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  },

  // Requirement 10.1 & 11.2: Insert Client via Stored Procedure InsertClient (Admin only)
  createClient: async (req, res, next) => {
    try {
      const db = req.db;
      const { name, client_type, phone, email, address } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Client name is required.'
        });
      }

      const connection = await db.getConnection();
      try {
        await connection.query('SET @new_id = 0');
        const [results] = await connection.query(
          'CALL InsertClient(?, ?, ?, ?, ?, @new_id)',
          [name.trim(), client_type || 'Individual', phone || null, email || null, address || null]
        );
        const [outResult] = await connection.query('SELECT @new_id AS new_client_id');
        const newClientId = outResult[0]?.new_client_id;
        const insertedRow = results[0]?.[0];

        return res.status(201).json({
          success: true,
          message: 'Client created successfully via Stored Procedure InsertClient.',
          client_id: newClientId,
          data: insertedRow
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      next(error);
    }
  },

  // Requirement 10.1 & 11.8: Update Client via Stored Procedure UpdateClient (Admin only)
  updateClient: async (req, res, next) => {
    try {
      const db = req.db;
      const clientId = parseInt(req.params.id, 10);
      const { name, client_type, phone, email, address } = req.body;

      const [results] = await db.query(
        'CALL UpdateClient(?, ?, ?, ?, ?, ?)',
        [clientId, name, client_type, phone || null, email || null, address || null]
      );

      const updatedRow = results[0]?.[0];
      return res.json({
        success: true,
        message: 'Client updated successfully via Stored Procedure UpdateClient.',
        data: updatedRow
      });
    } catch (error) {
      next(error);
    }
  },

  // Requirement 10.1: Delete Client via Stored Procedure DeleteClient (Admin only)
  deleteClient: async (req, res, next) => {
    try {
      const db = req.db;
      const clientId = parseInt(req.params.id, 10);

      const [results] = await db.query('CALL DeleteClient(?)', [clientId]);
      const message = results[0]?.[0]?.message || 'Client deleted successfully.';

      return res.json({ success: true, message });
    } catch (error) {
      next(error);
    }
  },

  // Requirement 10.5: Paginated Search
  getPaginatedClients: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      const parsedPage = Number.parseInt(req.query.page, 10);
      const parsedPageSize = Number.parseInt(req.query.pageSize, 10);

      const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const pageSize = Number.isInteger(parsedPageSize) && parsedPageSize > 0 && parsedPageSize <= 100 ? parsedPageSize : 10;
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

      let rows = [];
      let totalRecords = null;
      let totalPages = null;
      if (role === 'Admin') {
        const [results] = await db.query(
          'CALL PaginateClients(?, ?, ?)',
          [page, pageSize, search || null]
        );
        rows = results[0] || [];
        if (results[1] && results[1][0]) {
          totalRecords = results[1][0].total_records;
          totalPages = results[1][0].total_pages;
        }
      } else {
        const clientView = role === 'Lawyer' ? 'vw_lawyer_clients' : 'vw_staff_clients';
        const offset = (page - 1) * pageSize;
        let countQuery = `SELECT COUNT(*) AS total FROM ${clientView}`;
        let query = `SELECT * FROM ${clientView}`;
        const countParams = [];
        const params = [];
        if (search) {
          const whereClause = ' WHERE name LIKE ? OR email LIKE ?';
          countQuery += whereClause;
          query += whereClause;
          const p = `%${search}%`;
          countParams.push(p, p);
          params.push(p, p);
        }
        query += ' ORDER BY client_id ASC LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const [countResult] = await db.query(countQuery, countParams);
        totalRecords = countResult[0]?.total || 0;
        totalPages = Math.ceil(totalRecords / pageSize) || 1;

        const [results] = await db.query(query, params);
        rows = results;
      }

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

  // Requirement 10.4: Cursor Processing Demonstration
  getClientsCursor: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

      let rows = [];
      if (role === 'Admin') {
        let results;
        if (limit && limit > 0) {
          [results] = await db.query('CALL DisplayLimitedClients(?)', [limit]);
        } else {
          [results] = await db.query('CALL DisplayAllClients()');
        }
        rows = results[0] || [];
      } else {
        const clientView = role === 'Lawyer' ? 'vw_lawyer_clients' : 'vw_staff_clients';
        let query = `SELECT * FROM ${clientView} ORDER BY client_id ASC`;
        const params = [];
        if (limit && limit > 0) {
          query += ' LIMIT ?';
          params.push(limit);
        }
        const [results] = await db.query(query, params);
        rows = results;
      }

      return res.json({
        success: true,
        cursorType: limit ? `Bounded Cursor (First ${limit} records)` : 'Unbounded Explicit Cursor (All records)',
        count: rows.length,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = clientController;
