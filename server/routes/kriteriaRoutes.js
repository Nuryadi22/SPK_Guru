const express = require('express');
const router = express.Router();
const {
  getAllKriteria,
  getKriteriaById,
  createKriteria,
  updateKriteria,
  deleteKriteria
} = require('../controllers/kriteriaController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getAllKriteria);
router.get('/:id', verifyToken, getKriteriaById);
router.post('/', verifyToken, requireRole('admin'), createKriteria);
router.put('/:id', verifyToken, requireRole('admin'), updateKriteria);
router.delete('/:id', verifyToken, requireRole('admin'), deleteKriteria);

module.exports = router;
