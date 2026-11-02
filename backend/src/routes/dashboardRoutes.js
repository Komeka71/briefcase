const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), dashboardController.getDashboardSummary);

module.exports = router;
