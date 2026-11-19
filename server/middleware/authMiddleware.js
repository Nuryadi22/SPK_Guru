const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token otentikasi tidak ditemukan.'
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token otentikasi kosong atau format tidak valid.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'rahasia_spk_guru_sd_wp_kunci_otentikasi_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token sesi telah kadaluarsa atau tidak valid. Silakan login kembali.'
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Hak akses tidak memadai untuk melakukan tindakan ini.'
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
