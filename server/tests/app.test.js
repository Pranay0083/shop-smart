const request = require('supertest');
const app = require('../src/app');

describe('API Integration Tests', () => {

    describe('GET /api/health', () => {
        it('should return 200 and status ok', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'ok');
            expect(res.body.message).toContain('ShopSmart');
            expect(res.body).toHaveProperty('timestamp');
        });
    });

    describe('GET /', () => {
        it('should return 200 and welcome message', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain('ShopSmart Backend Service');
        });
    });

    describe('404 Handling', () => {
        it('should return 404 for unknown routes', async () => {
            const res = await request(app).get('/api/unknown-route');
            expect(res.statusCode).toEqual(404);
        });
    });
});

