const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { verifyToken } = require('./middleware/auth');
const { attachDb } = require('./middleware/dbContext');
const errorHandler = require('./middleware/errorHandler');

const clientRoutes = require('./routes/clientRoutes');
const caseRoutes = require('./routes/caseRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const hearingRoutes = require('./routes/hearingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const authRoutes = require('./routes/authRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const plsqlRoutes = require('./routes/plsqlRoutes');

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check (public endpoint)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'BriefCase Law Firm Management System API (SVNIT CS203)'
  });
});

// Authentication Routes (public login/register; protected /me, /users)
app.use('/api/auth', authRoutes);

// Protected Resource Routes (database-enforced role context applied to all requests)
app.use('/api/clients', verifyToken, attachDb, clientRoutes);
app.use('/api/cases', verifyToken, attachDb, caseRoutes);
app.use('/api/lawyers', verifyToken, attachDb, lawyerRoutes);
app.use('/api/hearings', verifyToken, attachDb, hearingRoutes);
app.use('/api/reports', verifyToken, attachDb, reportRoutes);
app.use('/api/dashboard', verifyToken, attachDb, dashboardRoutes);
app.use('/api/audit', verifyToken, attachDb, auditRoutes);
app.use('/api/practice', verifyToken, attachDb, practiceRoutes);
app.use('/api/plsql', verifyToken, attachDb, plsqlRoutes);

// Direct /api/finances, /api/invoices, /api/payments aliases
const practiceController = require('./controllers/practiceController');
app.get('/api/finances/ledger/export', verifyToken, attachDb, practiceController.exportLedger);
app.get('/api/invoices', verifyToken, attachDb, practiceController.getInvoices);
app.post('/api/invoices', verifyToken, attachDb, practiceController.createInvoice);
app.get('/api/payments', verifyToken, attachDb, practiceController.getPayments);
app.post('/api/payments', verifyToken, attachDb, practiceController.createPayment);
app.put('/api/payments/:id/status', verifyToken, attachDb, practiceController.updatePaymentStatus);

// 404 Handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
