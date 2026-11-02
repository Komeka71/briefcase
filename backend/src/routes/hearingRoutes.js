const express = require('express');
const router = express.Router();
const hearingController = require('../controllers/hearingController');
const { requireRole } = require('../middleware/auth');

// Get hearings (Admin: all, Lawyer: own, Assistant: all)
router.get('/', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), hearingController.getAllHearings);

// Create hearing (Admin only)
router.post('/', requireRole('Admin'), hearingController.createHearing);

// Update hearing (Admin: full, Lawyer: outcome and notes only)
router.put('/:id', requireRole('Admin', 'Lawyer'), hearingController.updateHearing);

// Delete hearing (Admin only)
router.delete('/:id', requireRole('Admin'), hearingController.deleteHearing);

module.exports = router;
