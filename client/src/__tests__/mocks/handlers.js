/**
 * MSW (Mock Service Worker) Handlers
 *
 * These handlers mock the backend API endpoints for integration testing.
 * Uses mock data to simulate real API responses.
 */

import { http, HttpResponse } from 'msw';

// Mock user data
export const mockUsers = [
  {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: '$2a$10$mockhashedpassword123', // Represents hashed "password123"
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 2,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    password: '$2a$10$mockhashedpassword456',
    createdAt: '2024-01-20T14:45:00.000Z'
  }
];

// Valid credentials for testing (plain text password -> user mapping)
export const validCredentials = {
  'john@example.com': 'password123',
  'jane@example.com': 'password456'
};

export const mockProducts = [
  {
    id: 'p-101',
    name: 'Wireless Headphones',
    category: 'Audio',
    price: 79.99,
    rating: 4.5,
    stock: 24,
    image: 'https://example.com/headphones.jpg',
    description: 'Comfortable over-ear wireless headphones with active noise cancellation.'
  },
  {
    id: 'p-102',
    name: 'Smart Fitness Watch',
    category: 'Wearables',
    price: 129,
    rating: 4.3,
    stock: 15,
    image: 'https://example.com/watch.jpg',
    description: 'Track workouts and health metrics in real time.'
  }
];

// Mock JWT token generator
const generateMockToken = (userId, email) => {
  return `mock-jwt-token-${userId}-${email}-${Date.now()}`;
};

export const handlers = [
  // Health Check - using wildcard to match any origin
  http.get('*/api/health', () => {
    return HttpResponse.json({
      status: 'ok',
      message: 'ShopSmart Backend is running',
      timestamp: new Date().toISOString()
    });
  }),

  http.get('*/api/products', () => {
    return HttpResponse.json({
      success: true,
      data: {
        products: mockProducts
      }
    });
  }),

  http.get('*/api/products/:id', ({ params }) => {
    const product = mockProducts.find((item) => item.id === params.id);

    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Product not found'
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        product
      }
    });
  }),

  // Login - using wildcard to match any origin
  http.post('*/api/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return HttpResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check credentials
    const user = mockUsers.find((u) => u.email === email);
    const validPassword = validCredentials[email];

    if (!user || password !== validPassword) {
      return HttpResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = generateMockToken(user.id, user.email);

    return HttpResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      }
    });
  }),

  // Signup - using wildcard to match any origin
  http.post('*/api/auth/signup', async ({ request }) => {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    // Validate input
    if (!email || !password) {
      return HttpResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return HttpResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check password length
    if (password.length < 6) {
      return HttpResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return HttpResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = {
      id: mockUsers.length + 1,
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      createdAt: new Date().toISOString()
    };

    const token = generateMockToken(newUser.id, newUser.email);

    return HttpResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: {
          user: newUser,
          token
        }
      },
      { status: 201 }
    );
  }),

  // Get Current User - using wildcard to match any origin
  http.get('*/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    // Simple token validation (in real app, would verify JWT)
    if (!token || !token.startsWith('mock-jwt-token-')) {
      return HttpResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract user ID from mock token
    const tokenParts = token.split('-');
    const userId = parseInt(tokenParts[3]);
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt
        }
      }
    });
  })
];
