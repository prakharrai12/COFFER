import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import prisma from '../prismaClient.js';

let authToken = '';
let userId = '';
let checkingAccountId = '';
let foodCategoryId = '';
let transactionId = '';

describe('COFFER Backend API Automated Suite', () => {
  beforeAll(async () => {
    // Clean up any old test user if running repeatedly
    const existing = await prisma.user.findUnique({ where: { email: 'testuser@coffer.app' } });
    if (existing) {
      await prisma.user.delete({ where: { id: existing.id } });
    }
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  describe('1. Authentication & Security Endpoints', () => {
    it('POST /api/auth/register should register a new user and seed default data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'testuser@coffer.app',
          password: 'Password123!',
          displayName: 'Test Precision User',
          currency: '$ USD',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('testuser@coffer.app');

      authToken = res.body.accessToken;
      userId = res.body.user.id;
    });

    it('POST /api/auth/login should authenticate credentials and issue JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@coffer.app',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe('testuser@coffer.app');
    });

    it('GET /api/auth/me should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe(userId);
    });

    it('POST /api/auth/demo-login should automatically seed demo user with accounts and transactions', async () => {
      const res = await request(app)
        .post('/api/auth/demo-login')
        .send({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user.email).toBe('demo@coffer.app');

      const demoToken = res.body.accessToken;
      const accRes = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${demoToken}`);

      expect(accRes.status).toBe(200);
      expect(accRes.body.accounts.length).toBeGreaterThanOrEqual(3);
      expect(accRes.body.accounts.some((a) => a.name === 'Main Checking Vault')).toBe(true);
    });
  });

  describe('2. Accounts & Running Balance API', () => {
    it('GET /api/accounts should return auto-seeded checking account', async () => {
      const res = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.accounts).toBeInstanceOf(Array);
      expect(res.body.accounts.length).toBeGreaterThanOrEqual(1);
      expect(res.body.accounts[0].runningBalance).toBe(0);

      checkingAccountId = res.body.accounts[0].id;
    });

    it('POST /api/accounts should create a secondary account', async () => {
      const res = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'High-Yield Savings',
          type: 'SAVINGS',
          initialBalance: 1000,
        });

      expect(res.status).toBe(201);
      expect(res.body.account.name).toBe('High-Yield Savings');
      expect(res.body.account.runningBalance).toBe(1000);
    });
  });

  describe('3. Categories Management API', () => {
    it('GET /api/categories should return auto-seeded categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.categories.length).toBeGreaterThanOrEqual(5);

      const foodCat = res.body.categories.find((c) => c.name.includes('Food'));
      expect(foodCat).toBeDefined();
      foodCategoryId = foodCat.id;
    });
  });

  describe('4. Transactions CRUD & Running Balances', () => {
    it('POST /api/transactions should log an income transaction', async () => {
      const incomeCat = await prisma.category.findFirst({
        where: { userId, name: 'Income' },
      });

      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId: checkingAccountId,
          categoryId: incomeCat.id,
          amount: 5000,
          date: new Date().toISOString(),
          note: 'Monthly Salary Deposit',
          type: 'INCOME',
        });

      expect(res.status).toBe(201);
      expect(res.body.transaction.amount).toBe(5000);
    });

    it('POST /api/transactions should log an expense transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountId: checkingAccountId,
          categoryId: foodCategoryId,
          amount: 142.50,
          date: new Date().toISOString(),
          note: 'Artisanal Coffee and Groceries',
          type: 'EXPENSE',
        });

      expect(res.status).toBe(201);
      expect(res.body.transaction.amount).toBe(142.50);
      transactionId = res.body.transaction.id;
    });

    it('GET /api/accounts should reflect updated running balance on Checking Account', async () => {
      const res = await request(app)
        .get('/api/accounts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const checkingAcc = res.body.accounts.find((a) => a.id === checkingAccountId);
      expect(checkingAcc.runningBalance).toBe(4857.50); // 0 + 5000 - 142.50
    });

    it('GET /api/transactions should filter by note search query', async () => {
      const res = await request(app)
        .get('/api/transactions?search=Artisanal')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.transactions.length).toBe(1);
      expect(res.body.transactions[0].id).toBe(transactionId);
    });
  });

  describe('5. Budgets & Dashboard Analytics', () => {
    it('POST /api/budgets should set a monthly budget limit for Food category', async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryId: foodCategoryId,
          monthlyLimit: 400,
          month: currentMonth,
        });

      expect(res.status).toBe(200);
      expect(res.body.budget.monthlyLimit).toBe(400);
    });

    it('GET /api/budgets should compute spent percentage and safe status', async () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const res = await request(app)
        .get(`/api/budgets?month=${currentMonth}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const foodBudget = res.body.budgets.find((b) => b.categoryId === foodCategoryId);
      expect(foodBudget.spent).toBe(142.50);
      expect(foodBudget.percentage).toBe(36); // 142.50 / 400 * 100 = ~36%
      expect(foodBudget.status).toBe('safe');
    });

    it('GET /api/analytics/dashboard should return sub-3s hero stats and account net worth', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.heroStats.totalIncome).toBe(5000);
      expect(res.body.heroStats.totalSpend).toBe(142.50);
      expect(res.body.heroStats.net).toBe(4857.50);
    });
  });
});
