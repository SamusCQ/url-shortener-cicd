const router = require('express').Router();
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const { pool } = require('../db');

// POST /api/urls -> crea un código corto para una URL.
router.post('/', async (req, res, next) => {
  try {
    const { url } = req.body || {};
    if (!url || !validUrl.isWebUri(url)) {
      return res.status(400).json({ error: 'URL inválida' });
    }

    const shortCode = nanoid(7);
    await pool.query(
      'INSERT INTO urls (short_code, original_url) VALUES ($1, $2)',
      [shortCode, url]
    );

    const shortUrl = `${req.protocol}://${req.get('host')}/${shortCode}`;
    return res.status(201).json({ shortCode, shortUrl });
  } catch (err) {
    return next(err);
  }
});

// GET /api/urls -> lista todos los enlaces (más recientes primero).
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT short_code, original_url, clicks, created_at FROM urls ORDER BY created_at DESC LIMIT 100'
    );
    return res.json(
      rows.map((r) => ({
        shortCode: r.short_code,
        originalUrl: r.original_url,
        clicks: r.clicks,
        createdAt: r.created_at,
      }))
    );
  } catch (err) {
    return next(err);
  }
});

// GET /api/urls/:shortCode -> metadatos (URL original, clics, fecha).
router.get('/:shortCode', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT short_code, original_url, clicks, created_at FROM urls WHERE short_code = $1',
      [req.params.shortCode]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    const r = rows[0];
    return res.json({
      shortCode: r.short_code,
      originalUrl: r.original_url,
      clicks: r.clicks,
      createdAt: r.created_at,
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
