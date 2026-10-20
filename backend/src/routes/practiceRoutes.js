const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');

// Documents
router.get('/documents', practiceController.getDocuments);
router.post('/documents', practiceController.createDocument);
router.delete('/documents/:id', practiceController.deleteDocument);

// Tasks
router.get('/tasks', practiceController.getTasks);
router.post('/tasks', practiceController.createTask);
router.put('/tasks/:id/status', practiceController.updateTaskStatus);
router.delete('/tasks/:id', practiceController.deleteTask);

// Invoices & Payments
router.get('/invoices', practiceController.getInvoices);
router.get('/payments', practiceController.getPayments);

// Appointments
router.get('/appointments', practiceController.getAppointments);

module.exports = router;
