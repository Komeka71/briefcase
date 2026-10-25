const express = require('express');
const router = express.Router();
const plsqlController = require('../controllers/plsqlController');

// Lab Assignment 10.6 A/B: fn_total_case_budget / GetCaseBudgetSummaryByType
router.get('/aggregate', plsqlController.getAggregate);

// Lab Assignment 10.7, 10.8, 10.10: live trigger tests (rolled back)
router.post('/trigger-test', plsqlController.runTriggerTest);

// Lab Assignment 11.E: statistics of all tables
router.get('/table-stats', plsqlController.getTableStats);

// Catalog of stored procedures, functions and triggers
router.get('/catalog', plsqlController.getCatalog);

module.exports = router;
