const express = require('express');
const cors = require('cors');
require('dotenv').config();

const clientRoutes = require('./routes/clientRoutes');
const caseRoutes = require('./routes/caseRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const hearingRoutes = require('./routes/hearingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const authRoutes = require('./routes/authRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Standard Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'BriefCase Law Firm Management System API (SVNIT CS203)'
  });
});

// Mount Resource Routes
app.use('/api/clients', clientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/hearings', hearingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/practice', practiceRoutes);

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
