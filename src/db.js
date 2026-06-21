const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/urlshortener',
});

// Crea la tabla si no existe. Se llama al arrancar el servidor y en los tests,
// de modo que el esquema esté disponible aunque la BD se levante vacía.
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS urls (
      id           SERIAL PRIMARY KEY,
      short_code   VARCHAR(16) UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      clicks       INTEGER DEFAULT 0,
      created_at   TIMESTAMP DEFAULT NOW()
    )
  `);
}

module.exports = { pool, init };
