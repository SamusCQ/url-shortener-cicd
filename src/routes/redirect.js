const router = require('express').Router();
const { pool } = require('../db');

// GET /:shortCode -> incrementa el contador de clics y redirige (301) a la URL original.
router.get('/:shortCode', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1 RETURNING original_url',
      [req.params.shortCode]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    return res.redirect(301, rows[0].original_url);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
