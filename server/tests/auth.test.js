/**
 * Backend API Tests for Auth Routes
 * Testing Library: Jest + Supertest
 *
 * These tests verify the auth API endpoints work correctly.
 * Uses mocked Prisma client to avoid database dependencies.
 */

const request = require('supertest');
const app = require('../src/app');

// Mock Prisma
jest.mock('../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => {
    return Promise.resolve(hash === `hashed_${password}`);
  })
}));

const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

describe('Auth API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    const validSignupData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User'
    };

    it('should create a new user with valid data', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: validSignupData.email,
        firstName: validSignupData.firstName,
        lastName: validSignupData.lastName,
        createdAt: new Date()
      });

      const res = await request(app).post('/api/auth/signup').send(validSignupData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validSignupData.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app).post('/api/auth/signup').send({ password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email and password are required');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app).post('/api/auth/signup').send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if email format is invalid', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'invalidemail', password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid email format');
    });

    it('should return 400 if password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com', password: '12345' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Password must be at least 6 characters long');
    });

    it('should return 409 if user already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: validSignupData.email
      });

      const res = await request(app).post('/api/auth/signup').send(validSignupData);

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toBe('User with this email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockUser = {
      id: 1,
      email: 'john@example.com',
      password: 'hashed_password123',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should login successfully with valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const res = await request(app).post('/api/auth/login').send(validLoginData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validLoginData.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({ password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 401 for wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'john@example.com', password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 if no token provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('No token provided');
    });

    it('should return 401 if invalid token format', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'InvalidToken');

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('No token provided');
    });
  });
});
