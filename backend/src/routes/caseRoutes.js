const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');

// Get all cases with optional filters (status, type, priority, search)
router.get('/', caseController.getAllCases);

// Dropdown reference metadata (case types, statuses, lawyers, courts)
router.get('/reference-data', caseController.getReferenceData);

// Get single case details including lawyers and hearings
router.get('/:id', caseController.getCaseById);

// Create new case
router.post('/', caseController.createCase);

// Update existing case
router.put('/:id', caseController.updateCase);

// Delete case
router.delete('/:id', caseController.deleteCase);

module.exports = router;
