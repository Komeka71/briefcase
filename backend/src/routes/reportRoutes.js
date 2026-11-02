const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireRole } = require('../middleware/auth');

// Query 1: All records from CLIENT (+ XML) - accessible by Admin, Lawyer, Assistant
router.get('/query1-clients', reportController.getQuery1Clients);

// Query 2: Insert data maintaining integrity (Admin only)
router.post('/query2-insert-integrity', requireRole('Admin'), reportController.getQuery2InsertIntegrity);

// Query 3: Aggregate function dropdown (+ XML) - accessible by Admin, Lawyer, Assistant
router.get('/query3-aggregate', reportController.getQuery3Aggregate);

// Query 4: Conditional query with operators (+ XML) - accessible by Admin, Lawyer, Assistant
router.get('/query4-conditional', reportController.getQuery4Conditional);

// Query 5: Dynamic JOIN on 2 tables (Admin only)
router.get('/query5-join', requireRole('Admin'), reportController.getQuery5Join);

// Query 6: Subquery across tables - accessible by Admin, Lawyer, Assistant
router.get('/query6-subquery', reportController.getQuery6Subquery);

// Query 7: Correlated subquery - accessible by Admin, Lawyer, Assistant
router.get('/query7-correlated', reportController.getQuery7Correlated);

// Query 8: Update records maintaining integrity (Admin only)
router.put('/query8-update-integrity', requireRole('Admin'), reportController.getQuery8UpdateIntegrity);

// Section C: Views demonstration (Admin only)
router.get('/views', requireRole('Admin'), reportController.getViewData);

module.exports = router;
