const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { requireRole } = require('../middleware/auth');

// Get all clients (Admin: all; Lawyer: own case clients; Assistant: all)
router.get('/', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), clientController.getAllClients);

// Paginated client search via Stored Procedure or View
router.get('/paginated', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), clientController.getPaginatedClients);

// Cursors demo
router.get('/cursor', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), clientController.getClientsCursor);

// Get single client by ID
router.get('/:id', requireRole('Admin', 'Lawyer', 'Assistant', 'Staff'), clientController.getClientById);

// Create client (Admin only)
router.post('/', requireRole('Admin'), clientController.createClient);

// Update client (Admin only)
router.put('/:id', requireRole('Admin'), clientController.updateClient);

// Delete client (Admin only)
router.delete('/:id', requireRole('Admin'), clientController.deleteClient);

module.exports = router;
