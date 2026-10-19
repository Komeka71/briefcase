const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');

router.get('/', lawyerController.getAllLawyers);
router.get('/departments', lawyerController.getDepartments);
router.post('/', lawyerController.createLawyer);
router.put('/:id', lawyerController.updateLawyer);
router.delete('/:id', lawyerController.deleteLawyer);

module.exports = router;
