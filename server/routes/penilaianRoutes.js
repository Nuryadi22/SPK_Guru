const express = require('express');
const router = express.Router();
const {
  getMatriksPenilaian,
  getPenilaianGuru,
  savePenilaianBatch
} = require('../controllers/penilaianController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/matriks', verifyToken, getMatriksPenilaian);
router.get('/guru/:alternatifId', verifyToken, getPenilaianGuru);
router.post('/batch', verifyToken, requireRole('admin'), savePenilaianBatch);

module.exports = router;
