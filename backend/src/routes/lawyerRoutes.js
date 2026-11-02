const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');
const { requireRole } = require('../middleware/auth');

// Read-only directory for Lawyer and Assistant; Full for Admin
router.get('/', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), lawyerController.getAllLawyers);
router.get('/departments', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), lawyerController.getDepartments);

// Administrative modifications
router.post('/', requireRole('Admin'), lawyerController.createLawyer);
router.put('/:id', requireRole('Admin'), lawyerController.updateLawyer);
router.delete('/:id', requireRole('Admin'), lawyerController.deleteLawyer);

module.exports = router;
