const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const practiceController = require('../controllers/practiceController');
const { requireRole } = require('../middleware/auth');

// Multer Storage Configuration
const storageDir = path.join(__dirname, '../../storage/documents');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.docx', '.doc', '.xlsx', '.jpg', '.png', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not supported. Allowed extensions: ${allowedExts.join(', ')}`));
    }
  }
});

// Documents Management
router.get('/documents', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.getDocuments);
router.post('/documents', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), upload.single('file'), practiceController.createDocument);
router.get('/documents/:id/download', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.downloadDocument);
router.delete('/documents/:id', requireRole('Admin'), practiceController.deleteDocument);

// Tasks Management
router.get('/tasks', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.getTasks);
router.post('/tasks', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.createTask);
router.put('/tasks/:id/status', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), practiceController.updateTaskStatus);
router.delete('/tasks/:id', requireRole('Admin'), practiceController.deleteTask);

// Invoices & Payments Management (Admin only)
router.get('/invoices', requireRole('Admin'), practiceController.getInvoices);
router.post('/invoices', requireRole('Admin'), practiceController.createInvoice);
router.get('/payments', requireRole('Admin'), practiceController.getPayments);
router.post('/payments', requireRole('Admin'), practiceController.createPayment);
router.put('/payments/:id/status', requireRole('Admin'), practiceController.updatePaymentStatus);

// Audit Ledger Export (Admin only)
router.get('/ledger/export', requireRole('Admin'), practiceController.exportLedger);

// Appointments (Admin only)
router.get('/appointments', requireRole('Admin'), practiceController.getAppointments);

module.exports = router;
