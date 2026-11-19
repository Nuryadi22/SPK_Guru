const express = require('express');
const router = express.Router();
const { getPerhitunganWP, getDashboardSummary } = require('../controllers/wpController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/hitung', verifyToken, getPerhitunganWP);
router.get('/dashboard', verifyToken, getDashboardSummary);

module.exports = router;
