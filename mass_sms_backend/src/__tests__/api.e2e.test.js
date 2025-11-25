const request = require('supertest');
const { createApp } = require('../app');

const app = createApp();

describe('API Endpoints', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jacelarry04@gmail.com', password: 'admin2025' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should access /api/menu with valid token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jacelarry04@gmail.com', password: 'admin2025' });
    const token = loginRes.body.token;
    const menuRes = await request(app)
      .get('/api/menu')
      .set('Authorization', `Bearer ${token}`);
    expect(menuRes.statusCode).toBe(200);
    expect(menuRes.body.menu).toBeDefined();
  });
});
