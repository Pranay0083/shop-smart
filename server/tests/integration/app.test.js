const request = require('supertest');
const app = require('../../src/app');

describe('Integration Test: App Entry Point', () => {
  it('should return 200 OK and correct message for the root route', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('E-Commerce API is running...');
  });
});
