const express = require('express');
const router = express.Router();
const { login, getProfile, getAllUsers } = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', verifyToken, getProfile);
router.get('/users', verifyToken, requireRole('admin'), getAllUsers);

module.exports = router;
