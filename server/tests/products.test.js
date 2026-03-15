const request = require('supertest');
const app = require('../src/app');

describe('Products API', () => {
  describe('GET /api/products', () => {
    it('should return products list', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return product details for valid id', async () => {
      const res = await request(app).get('/api/products/p-101');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.product).toHaveProperty('id', 'p-101');
      expect(res.body.data.product).toHaveProperty('name');
    });

    it('should return 404 for unknown product id', async () => {
      const res = await request(app).get('/api/products/does-not-exist');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });
  });
});
