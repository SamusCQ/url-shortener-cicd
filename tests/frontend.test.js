const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/db');

afterAll(async () => {
  await pool.end();
});

describe('Frontend estático', () => {
  it('sirve la página web (index.html) en la raíz', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('LinkSnap');
  });

  it('sirve la hoja de estilos', async () => {
    const res = await request(app).get('/styles.css');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/css/);
  });
});
