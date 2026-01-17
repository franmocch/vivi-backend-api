const request = require('supertest');
const app = require('../app');

describe('Smoke tests', () => {
  test('GET /api/v1/health returns 200', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('Unknown route returns 404', async () => {
    const res = await request(app).get('/does-not-exist-rout');

    expect(res.statusCode).toBe(404);
  });
});
