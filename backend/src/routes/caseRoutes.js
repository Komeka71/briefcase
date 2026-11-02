const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { requireRole } = require('../middleware/auth');

// Get all cases with optional filters (Admin, Lawyer, Assistant, Staff)
router.get('/', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), caseController.getAllCases);

// Dropdown reference metadata (Admin, Lawyer, Assistant, Staff)
router.get('/reference-data', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), caseController.getReferenceData);

// Get single case details including lawyers and hearings (Admin, Lawyer, Assistant, Staff)
router.get('/:id', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), caseController.getCaseById);

// Create new case (Admin only)
router.post('/', requireRole('Admin'), caseController.createCase);

// Update existing case (Admin: full update; Lawyer: update own case notes only)
router.put('/:id', requireRole('Admin', 'Lawyer'), caseController.updateCase);

// Delete case (Admin only)
router.delete('/:id', requireRole('Admin'), caseController.deleteCase);

// Counsel allocation (Admin only per sp_case_assign_counsel and sp_case_remove_counsel)
router.post('/:id/lawyers', requireRole('Admin'), caseController.assignCounsel);
router.delete('/:id/lawyers/:lawyerId', requireRole('Admin'), caseController.removeCounsel);

module.exports = router;
