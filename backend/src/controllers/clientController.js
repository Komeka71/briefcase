const { pool } = require('../config/db');
const { clientsToXml } = require('../utils/xml');

/**
 * Controller for CLIENT entity and Stored Procedures
 */
const clientController = {
  // Query 1 & Requirement 11.1: Display all clients (supports JSON and XML)
  getAllClients: async (req, res, next) => {
    try {
      const [rows] = await pool.query('SELECT * FROM CLIENT ORDER BY client_id ASC');

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

  // Requirement 10.1: Get Client By ID via Stored Procedure
  getClientById: async (req, res, next) => {
    try {
      const clientId = parseInt(req.params.id, 10);
      const [results] = await pool.query('CALL GetClientById(?)', [clientId]);
      const client = results[0] && results[0][0];

      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      return res.json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  },

  // Requirement 10.1 & 11.2: Insert Client via Stored Procedure InsertClient
  createClient: async (req, res, next) => {
    try {
      const { name, client_type, phone, email, address } = req.body;

      // Execute stored procedure with OUT parameter
      const connection = await pool.getConnection();
      try {
        await connection.query('SET @new_id = 0');
        const [results] = await connection.query(
          'CALL InsertClient(?, ?, ?, ?, ?, @new_id)',
          [name || '', client_type || 'Individual', phone || null, email || null, address || null]
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

  // Requirement 10.1 & 11.8: Update Client via Stored Procedure UpdateClient
  updateClient: async (req, res, next) => {
    try {
      const clientId = parseInt(req.params.id, 10);
      const { name, client_type, phone, email, address } = req.body;

      const [results] = await pool.query(
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

  // Requirement 10.1: Delete Client via Stored Procedure DeleteClient
  deleteClient: async (req, res, next) => {
    try {
      const clientId = parseInt(req.params.id, 10);

      const [results] = await pool.query('CALL DeleteClient(?)', [clientId]);
      const message = results[0]?.[0]?.message || 'Client deleted successfully.';

      return res.json({ success: true, message });
    } catch (error) {
      next(error);
    }
  },

  // Requirement 10.5: Paginated Search via Stored Procedure PaginateClients
 // Requirement 10.5: Paginated Search via Stored Procedure PaginateClients
getPaginatedClients: async (req, res, next) => {
  try {
    // Validate and normalize query parameters
    const parsedPage = Number.parseInt(req.query.page, 10);
    const parsedPageSize = Number.parseInt(req.query.pageSize, 10);

    const page =
      Number.isInteger(parsedPage) && parsedPage > 0
        ? parsedPage
        : 1;

    const pageSize =
      Number.isInteger(parsedPageSize) &&
      parsedPageSize > 0 &&
      parsedPageSize <= 100
        ? parsedPageSize
        : 10;

    const search =
      typeof req.query.search === 'string'
        ? req.query.search.trim()
        : '';

    // Parameter order must match the MySQL procedure:
    // p_search, p_page, p_limit
    const [results] = await pool.query(
      'CALL PaginateClients(?, ?, ?)',
      [search || null, page, pageSize]
    );

    const rows = results[0] || [];

    return res.json({
      success: true,
      data: rows,
      pagination: {
        current_page: page,
        page_size: pageSize,
        total_records: null,
        total_pages: null
      }
    });
  } catch (error) {
    next(error);
  }
},
  // Requirement 10.4: Cursor Processing Demonstration
  getClientsCursor: async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

      let results;
      if (limit && limit > 0) {
        [results] = await pool.query('CALL DisplayLimitedClients(?)', [limit]);
      } else {
        [results] = await pool.query('CALL DisplayAllClients()');
      }

      const rows = results[0] || [];
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
