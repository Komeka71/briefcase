const express = require('express');
const router = express.Router();
const plsqlController = require('../controllers/plsqlController');
const { requireRole } = require('../middleware/auth');

// GET /api/plsql/table-stats: available to all authenticated roles (Admin, Lawyer, Assistant)
router.get('/table-stats', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), plsqlController.getTableStats);

// Aggregate calculations (Admin only)
router.get('/aggregate', requireRole('Admin'), plsqlController.getAggregate);

// Interactive trigger unit testing (Admin only)
router.post('/trigger-test', requireRole('Admin'), plsqlController.runTriggerTest);

// Database catalog inspection (Admin only)
router.get('/catalog', requireRole('Admin'), plsqlController.getCatalog);

module.exports = router;
