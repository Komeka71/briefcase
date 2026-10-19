const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);
router.get('/users', verifyToken, requireRole('Admin'), authController.getAllUsers);
router.delete('/users/:id', verifyToken, requireRole('Admin'), authController.deleteUser);

module.exports = router;
