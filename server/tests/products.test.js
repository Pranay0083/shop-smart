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

    it('should return products with the expected shape', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      const product = res.body.data.products[0];

      // Verify every required field exists on each product
      const requiredFields = ['id', 'name', 'category', 'price', 'rating', 'stock', 'image', 'description'];
      requiredFields.forEach((field) => {
        expect(product).toHaveProperty(field);
      });

      // Type checks
      expect(typeof product.id).toBe('string');
      expect(typeof product.name).toBe('string');
      expect(typeof product.price).toBe('number');
      expect(typeof product.rating).toBe('number');
      expect(typeof product.stock).toBe('number');
    });

    it('should return products wrapped in the correct response envelope', async () => {
      const res = await request(app).get('/api/products');

      // Verify top-level response structure
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('products');
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

    it('should return full product details with all fields for a known id', async () => {
      const res = await request(app).get('/api/products/p-101');

      expect(res.statusCode).toBe(200);
      const { product } = res.body.data;

      expect(product).toHaveProperty('id', 'p-101');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('rating');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('description');
    });

    it('should return 404 for unknown product id', async () => {
      const res = await request(app).get('/api/products/does-not-exist');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });
  });
});

describe('Health Check API', () => {
  it('should return status ok with all required fields', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should return a valid ISO timestamp', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    const parsed = new Date(res.body.timestamp);
    expect(parsed.toISOString()).toBe(res.body.timestamp);
  });

  it('should include the ShopSmart message string', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body.message).toMatch(/ShopSmart/i);
  });
});
