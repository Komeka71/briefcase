const { pool } = require('../config/db');

const hearingController = {
  getAllHearings: async (req, res, next) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          h.hearing_id,
          h.case_id,
          c.case_number,
          c.title AS case_title,
          h.court_id,
          co.court_name,
          co.city AS court_city,
          h.hearing_date,
          h.start_time,
          h.end_time,
          h.purpose,
          h.outcome,
          h.next_hearing_date,
          h.notes
        FROM HEARING h
        INNER JOIN CASES c ON h.case_id = c.case_id
        INNER JOIN COURT co ON h.court_id = co.court_id
        ORDER BY h.hearing_date DESC, h.start_time ASC
      `);
      return res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      next(error);
    }
  },

  createHearing: async (req, res, next) => {
    try {
      const { case_id, court_id, hearing_date, start_time, end_time, purpose, outcome, next_hearing_date, notes } = req.body;

      if (!case_id || !court_id || !hearing_date) {
        return res.status(400).json({ success: false, message: 'Case ID, Court ID, and Hearing Date are required.' });
      }

      const [result] = await pool.query(`
        INSERT INTO HEARING (case_id, court_id, hearing_date, start_time, end_time, purpose, outcome, next_hearing_date, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [case_id, court_id, hearing_date, start_time || null, end_time || null, purpose || null, outcome || null, next_hearing_date || null, notes || null]);

      return res.status(201).json({ success: true, message: 'Hearing scheduled successfully.', hearing_id: result.insertId });
    } catch (error) {
      next(error);
    }
  },

  updateHearing: async (req, res, next) => {
    try {
      const hearingId = parseInt(req.params.id, 10);
      const { purpose, outcome, next_hearing_date, notes } = req.body;

      await pool.query(`
        UPDATE HEARING
        SET purpose = ?, outcome = ?, next_hearing_date = ?, notes = ?
        WHERE hearing_id = ?
      `, [purpose || null, outcome || null, next_hearing_date || null, notes || null, hearingId]);

      return res.json({ success: true, message: 'Hearing record updated.' });
    } catch (error) {
      next(error);
    }
  },

  deleteHearing: async (req, res, next) => {
    try {
      const hearingId = parseInt(req.params.id, 10);
      await pool.query('DELETE FROM HEARING WHERE hearing_id = ?', [hearingId]);
      return res.json({ success: true, message: 'Hearing record deleted.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = hearingController;
