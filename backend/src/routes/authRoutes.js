const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { attachDb } = require('../middleware/dbContext');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, attachDb, authController.getMe);
router.get('/users', verifyToken, attachDb, requireRole('Admin'), authController.getAllUsers);
router.delete('/users/:id', verifyToken, attachDb, requireRole('Admin'), authController.deleteUser);

module.exports = router;
