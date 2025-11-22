import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Payment Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('should create a payment', async () => {
    const res = await request(app.getHttpServer())
      .post('/mpesa/pay')
      .set('x-api-key', 'your_api_key')
      .send({ msisdn: '254712345678', amount: 100, businessShortCode: '123456' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get all payments', async () => {
    const res = await request(app.getHttpServer())
      .get('/mpesa/payments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a payment by id', async () => {
    // First, create a payment
    const createRes = await request(app.getHttpServer())
      .post('/mpesa/pay')
      .set('x-api-key', 'your_api_key')
      .send({ msisdn: '254712345678', amount: 100, businessShortCode: '123456' });
    const id = createRes.body.id;
    const res = await request(app.getHttpServer())
      .get(`/mpesa/payments/${id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', id);
  });

  it('should update a payment', async () => {
    // First, create a payment
    const createRes = await request(app.getHttpServer())
      .post('/mpesa/pay')
      .set('x-api-key', 'your_api_key')
      .send({ msisdn: '254712345678', amount: 100, businessShortCode: '123456' });
    const id = createRes.body.id;
    const res = await request(app.getHttpServer())
      .post(`/mpesa/payments/${id}`)
      .send({ amount: 200 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('amount', 200);
  });

  it('should delete a payment', async () => {
    // First, create a payment
    const createRes = await request(app.getHttpServer())
      .post('/mpesa/pay')
      .set('x-api-key', 'your_api_key')
      .send({ msisdn: '254712345678', amount: 100, businessShortCode: '123456' });
    const id = createRes.body.id;
    const res = await request(app.getHttpServer())
      .post(`/mpesa/payments/${id}/delete`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', id);
  });

  afterAll(async () => {
    await app.close();
  });
});
