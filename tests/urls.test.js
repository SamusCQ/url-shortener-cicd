const request = require('supertest');
const app = require('../src/app');
const { pool, init } = require('../src/db');

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  await pool.end();
});

describe('API de URLs', () => {
  it('crea una URL corta (201)', async () => {
    const res = await request(app)
      .post('/api/urls')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBeDefined();
    expect(res.body.shortUrl).toContain(res.body.shortCode);
  });

  it('lista todos los enlaces creados (200)', async () => {
    await request(app).post('/api/urls').send({ url: 'https://nodejs.org' });

    const res = await request(app).get('/api/urls');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('shortCode');
    expect(res.body[0]).toHaveProperty('clicks');
  });

  it('rechaza una URL inválida (400)', async () => {
    const res = await request(app)
      .post('/api/urls')
      .send({ url: 'no-es-una-url' });

    expect(res.status).toBe(400);
  });

  it('rechaza una petición sin URL (400)', async () => {
    const res = await request(app).post('/api/urls').send({});
    expect(res.status).toBe(400);
  });

  it('recupera los metadatos de una URL creada (200)', async () => {
    const created = await request(app)
      .post('/api/urls')
      .send({ url: 'https://nodejs.org' });
    const code = created.body.shortCode;

    const res = await request(app).get(`/api/urls/${code}`);
    expect(res.status).toBe(200);
    expect(res.body.originalUrl).toBe('https://nodejs.org');
    expect(res.body.clicks).toBe(0);
  });

  it('devuelve 404 para un código inexistente', async () => {
    const res = await request(app).get('/api/urls/inexistente');
    expect(res.status).toBe(404);
  });
});
