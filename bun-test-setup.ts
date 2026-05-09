import { beforeAll, afterAll } from 'bun:test';

// Global test setup — runs once before all tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test' as string;
  process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/openmoney_test';
  process.env.REDIS_URL = 'redis://localhost:6379';
  process.env.BETTER_AUTH_SECRET = 'test-secret-key-for-testing-only';
  process.env.BETTER_AUTH_URL = 'http://localhost:4000';
  process.env.QUANT_PYTHON_URL = 'http://localhost:5000';
});

// Global test teardown
afterAll(() => {
  // Cleanup if needed
});
