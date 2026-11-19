const express = require('express');
const router = express.Router();
const {
  getAllAlternatif,
  getAlternatifDetail,
  createAlternatif,
  updateAlternatif,
  deleteAlternatif
} = require('../controllers/alternatifController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllAlternatif);
router.get('/:id', verifyToken, getAlternatifDetail);
router.post('/', verifyToken, requireRole('admin'), createAlternatif);
router.put('/:id', verifyToken, requireRole('admin'), updateAlternatif);
router.delete('/:id', verifyToken, requireRole('admin'), deleteAlternatif);

module.exports = router;
