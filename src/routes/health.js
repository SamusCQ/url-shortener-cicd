const router = require('express').Router();

// Health check usado por el smoke test del pipeline y por docker-compose.
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
