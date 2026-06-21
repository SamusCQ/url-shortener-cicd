const request = require('supertest');
const app = require('../src/app');
const { pool, init } = require('../src/db');

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  await pool.end();
});

describe('Redirección', () => {
  it('redirige con 301 a la URL original e incrementa los clics', async () => {
    const created = await request(app)
      .post('/api/urls')
      .send({ url: 'https://github.com' });
    const code = created.body.shortCode;

    const res = await request(app).get(`/${code}`);
    expect(res.status).toBe(301);
    expect(res.headers.location).toBe('https://github.com');

    const meta = await request(app).get(`/api/urls/${code}`);
    expect(meta.body.clicks).toBe(1);
  });

  it('devuelve 404 si el código no existe', async () => {
    const res = await request(app).get('/codigoQueNoExiste');
    expect(res.status).toBe(404);
  });
});
