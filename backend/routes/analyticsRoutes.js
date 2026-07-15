import express from 'express';
import prisma from '../prismaClient.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

const getMonthBounds = (monthStr) => {
  const [year, month] = (monthStr || new Date().toISOString().slice(0, 7)).split('-').map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end, monthStr: `${year}-${String(month).padStart(2, '0')}` };
};

// GET /api/analytics/dashboard?month=YYYY-MM
router.get('/dashboard', async (req, res) => {
  try {
    const { start, end, monthStr } = getMonthBounds(req.query.month);

    // Run parallel queries to guarantee sub-3s response time
    const [monthTx, accounts, budgets, recentTx, categories] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: req.user.id,
          date: { gte: start, lte: end },
        },
        include: { category: true },
      }),
      prisma.account.findMany({
        where: { userId: req.user.id },
        include: {
          transactions: { select: { amount: true, type: true } },
        },
      }),
      prisma.budget.findMany({
        where: { userId: req.user.id, month: monthStr },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId: req.user.id },
        include: { account: true, category: true },
        orderBy: { date: 'desc' },
        take: 6,
      }),
      prisma.category.findMany({
        where: { userId: req.user.id },
      }),
    ]);

    // Calculate month total income, spend, net
    let totalIncome = 0;
    let totalSpend = 0;
    const categorySpendMap = {};

    monthTx.forEach((tx) => {
      if (tx.type === 'INCOME') {
        totalIncome += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        totalSpend += tx.amount;
        categorySpendMap[tx.categoryId] = (categorySpendMap[tx.categoryId] || 0) + tx.amount;
      }
    });

    const net = totalIncome - totalSpend;

    // Spend by category breakdown chart data
    const spendByCategory = Object.entries(categorySpendMap)
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: cat ? cat.name : 'Unknown',
          color: cat ? cat.color : '#5B6158',
          value: Math.round(amount * 100) / 100,
          percentage: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    // Budget summary status
    const budgetSummary = budgets.map((b) => {
      const spent = Math.round((categorySpendMap[b.categoryId] || 0) * 100) / 100;
      const limit = b.monthlyLimit;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      let status = 'safe';
      if (percentage > 100) status = 'danger';
      else if (percentage >= 85) status = 'warning';

      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryColor: b.category.color,
        monthlyLimit: limit,
        spent,
        percentage,
        status,
      };
    }).sort((a, b) => b.percentage - a.percentage);

    // Accounts running balance calculation
    let netWorth = 0;
    const enrichedAccounts = accounts.map((acc) => {
      let balance = acc.initialBalance;
      acc.transactions.forEach((tx) => {
        if (tx.type === 'INCOME') balance += tx.amount;
        else if (tx.type === 'EXPENSE') balance -= tx.amount;
      });
      balance = Math.round(balance * 100) / 100;
      if (acc.type !== 'CREDIT_CARD') netWorth += balance;
      else netWorth -= Math.abs(balance); // Credit card balances are liabilities

      const { transactions, ...cleanAcc } = acc;
      return { ...cleanAcc, runningBalance: balance };
    });

    return res.status(200).json({
      month: monthStr,
      heroStats: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalSpend: Math.round(totalSpend * 100) / 100,
        net: Math.round(net * 100) / 100,
        netWorth: Math.round(netWorth * 100) / 100,
      },
      spendByCategory,
      budgetSummary,
      recentTransactions: recentTx,
      accounts: enrichedAccounts,
    });
  } catch (error) {
    console.error('Dashboard Analytics Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching dashboard analytics.' });
  }
});

// GET /api/analytics/history?months=12
router.get('/history', async (req, res) => {
  try {
    const numMonths = parseInt(req.query.months || '12', 10);
    const months = [];
    const now = new Date();

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
    }

    const oldestMonth = months[0];
    const { start: startDate } = getMonthBounds(oldestMonth);

    const allTx = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        date: { gte: startDate },
      },
      select: { amount: true, type: true, date: true },
    });

    const monthlyData = months.map((mStr) => {
      let income = 0;
      let spend = 0;
      allTx.forEach((tx) => {
        const txMonthStr = tx.date.toISOString().slice(0, 7);
        if (txMonthStr === mStr) {
          if (tx.type === 'INCOME') income += tx.amount;
          else if (tx.type === 'EXPENSE') spend += tx.amount;
        }
      });

      return {
        month: mStr,
        monthLabel: new Date(mStr + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: Math.round(income * 100) / 100,
        spend: Math.round(spend * 100) / 100,
        net: Math.round((income - spend) * 100) / 100,
      };
    });

    return res.status(200).json({ history: monthlyData });
  } catch (error) {
    console.error('History Analytics Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching historical analytics.' });
  }
});

export default router;
