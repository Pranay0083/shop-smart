const jwt = require('jsonwebtoken');
const generateToken = require('../../src/utils/generateToken');

describe('generateToken Unit Test', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env.JWT_SECRET = 'testsecret';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should generate a valid JWT token', () => {
    const id = 'test-id-123';
    const token = generateToken(id);

    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(id);
  });
});
