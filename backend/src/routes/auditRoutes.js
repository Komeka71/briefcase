const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('Admin'), auditController.getAuditLogs);
router.get('/stats', requireRole('Admin'), auditController.getAuditStats);

module.exports = router;
