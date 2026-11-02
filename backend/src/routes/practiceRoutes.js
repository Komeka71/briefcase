const express = require('express');
const router = express.Router();
const practiceController = require('../controllers/practiceController');
const { requireRole } = require('../middleware/auth');

// Documents Management
router.get('/documents', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.getDocuments);
router.post('/documents', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.createDocument);
router.delete('/documents/:id', requireRole('Admin'), practiceController.deleteDocument);

// Tasks Management
router.get('/tasks', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.getTasks);
router.post('/tasks', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.createTask);
router.put('/tasks/:id/status', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.updateTaskStatus);
router.delete('/tasks/:id', requireRole('Admin'), practiceController.deleteTask);

// Invoices & Payments (Admin only)
router.get('/invoices', requireRole('Admin'), practiceController.getInvoices);
router.get('/payments', requireRole('Admin'), practiceController.getPayments);

// Appointments (Admin only)
router.get('/appointments', requireRole('Admin'), practiceController.getAppointments);

module.exports = router;
