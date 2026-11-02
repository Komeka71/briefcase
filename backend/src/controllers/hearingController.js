const hearingController = {
  getAllHearings: async (req, res, next) => {
    try {
      const db = req.db;
      const role = req.user?.role || 'Admin';

      let sql;
      if (role === 'Lawyer') {
        sql = `
          SELECT 
            hearing_id,
            case_id,
            case_number,
            case_title,
            court_id,
            court_name,
            court_city,
            hearing_date,
            start_time,
            end_time,
            purpose,
            outcome,
            next_hearing_date,
            notes
          FROM vw_lawyer_hearings
          ORDER BY hearing_date DESC, start_time ASC
        `;
      } else if (role === 'Assistant' || role === 'Staff') {
        sql = `
          SELECT 
            hearing_id,
            case_id,
            case_number,
            case_title,
            court_id,
            court_name,
            court_city,
            hearing_date,
            start_time,
            end_time,
            purpose,
            outcome,
            next_hearing_date,
            notes
          FROM vw_staff_hearings
          ORDER BY hearing_date DESC, start_time ASC
        `;
      } else {
        sql = `
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
        `;
      }

      const [rows] = await db.query(sql);
      return res.json({ success: true, count: rows.length, data: rows });
    } catch (error) {
      next(error);
    }
  },

  createHearing: async (req, res, next) => {
    try {
      const db = req.db;
      const { case_id, court_id, hearing_date, start_time, end_time, purpose, outcome, next_hearing_date, notes } = req.body;

      if (!case_id || !court_id || !hearing_date) {
        return res.status(400).json({ success: false, message: 'Case ID, Court ID, and Hearing Date are required.' });
      }

      const [result] = await db.query(`
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
      const db = req.db;
      const role = req.user?.role || 'Admin';
      const hearingId = parseInt(req.params.id, 10);
      const { court_id, hearing_date, start_time, end_time, purpose, outcome, next_hearing_date, notes } = req.body;

      if (role === 'Lawyer') {
        // Lawyers can update outcome and notes of own hearings via stored procedure
        await db.query('CALL sp_lawyer_update_hearing_outcome(?, ?, ?)', [hearingId, outcome || null, notes || null]);
        return res.json({ success: true, message: 'Hearing outcome and notes updated successfully.' });
      }

      await db.query(`
        UPDATE HEARING
        SET court_id = COALESCE(?, court_id),
            hearing_date = COALESCE(?, hearing_date),
            start_time = COALESCE(?, start_time),
            end_time = COALESCE(?, end_time),
            purpose = COALESCE(?, purpose),
            outcome = COALESCE(?, outcome),
            next_hearing_date = COALESCE(?, next_hearing_date),
            notes = COALESCE(?, notes)
        WHERE hearing_id = ?
      `, [
        court_id !== undefined ? court_id : null,
        hearing_date !== undefined ? hearing_date : null,
        start_time !== undefined ? start_time : null,
        end_time !== undefined ? end_time : null,
        purpose !== undefined ? purpose : null,
        outcome !== undefined ? outcome : null,
        next_hearing_date !== undefined ? next_hearing_date : null,
        notes !== undefined ? notes : null,
        hearingId
      ]);

      return res.json({ success: true, message: 'Hearing updated successfully.' });
    } catch (error) {
      next(error);
    }
  },

  deleteHearing: async (req, res, next) => {
    try {
      const db = req.db;
      const hearingId = parseInt(req.params.id, 10);
      await db.query('DELETE FROM HEARING WHERE hearing_id = ?', [hearingId]);
      return res.json({ success: true, message: 'Hearing deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = hearingController;
