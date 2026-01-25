import "@testing-library/jest-dom";

process.env.USERS_TABLE_NAME = "test-users-table";
process.env.STRIPE_SECRET_KEY = "sk_test_mock";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_mock";
global.console = {
  ...console,
  error: jest.fn(), // Mock console.error
};
