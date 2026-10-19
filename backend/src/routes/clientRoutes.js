const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Query 1: Get all clients (supports JSON and ?format=xml)
router.get('/', clientController.getAllClients);

// Requirement 10.5: Paginated client search via Stored Procedure
router.get('/paginated', clientController.getPaginatedClients);

// Requirement 10.4: Cursors demo (bounded and unbounded)
router.get('/cursor', clientController.getClientsCursor);

// Requirement 10.1: Get single client by ID via Stored Procedure
router.get('/:id', clientController.getClientById);

// Requirement 10.1: Create client via Stored Procedure InsertClient
router.post('/', clientController.createClient);

// Requirement 10.1: Update client via Stored Procedure UpdateClient
router.put('/:id', clientController.updateClient);

// Requirement 10.1: Delete client via Stored Procedure DeleteClient
router.delete('/:id', clientController.deleteClient);

module.exports = router;
