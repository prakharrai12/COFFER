import express from 'express';
import prisma from '../prismaClient.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

const getMonthRange = (monthStr) => {
  // monthStr is YYYY-MM e.g. "2026-07"
  const [year, month] = (monthStr || new Date().toISOString().slice(0, 7)).split('-').map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end, monthStr: `${year}-${String(month).padStart(2, '0')}` };
};

// GET /api/budgets?month=YYYY-MM
router.get('/', async (req, res) => {
  try {
    const { start, end, monthStr } = getMonthRange(req.query.month);

    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: 'asc' },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId: req.user.id, month: monthStr },
      include: { category: true },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.id,
        type: 'EXPENSE',
        date: { gte: start, lte: end },
      },
      select: { categoryId: true, amount: true },
    });

    const spentMap = {};
    transactions.forEach((tx) => {
      spentMap[tx.categoryId] = (spentMap[tx.categoryId] || 0) + tx.amount;
    });

    const budgetMap = {};
    budgets.forEach((b) => {
      budgetMap[b.categoryId] = b;
    });

    const enrichedBudgets = categories.map((cat) => {
      const budgetObj = budgetMap[cat.id];
      const spent = Math.round((spentMap[cat.id] || 0) * 100) / 100;
      const limit = budgetObj ? budgetObj.monthlyLimit : null;

      let percentage = 0;
      let status = 'none';

      if (limit !== null && limit > 0) {
        percentage = Math.round((spent / limit) * 100);
        if (percentage > 100) status = 'danger';
        else if (percentage >= 85) status = 'warning';
        else status = 'safe';
      } else if (spent > 0) {
        status = 'unbudgeted';
      }

      return {
        id: budgetObj ? budgetObj.id : null,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryColor: cat.color,
        categoryIcon: cat.icon,
        monthlyLimit: limit,
        spent,
        percentage,
        status,
        month: monthStr,
      };
    });

    // Total budget summary
    const totalLimit = enrichedBudgets.reduce((acc, b) => acc + (b.monthlyLimit || 0), 0);
    const totalSpentInBudgets = enrichedBudgets
      .filter((b) => b.monthlyLimit !== null)
      .reduce((acc, b) => acc + b.spent, 0);

    return res.status(200).json({
      month: monthStr,
      budgets: enrichedBudgets,
      summary: {
        totalLimit: Math.round(totalLimit * 100) / 100,
        totalSpentInBudgets: Math.round(totalSpentInBudgets * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get Budgets Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching budgets.' });
  }
});

// POST /api/budgets (create or update budget for month)
router.post('/', async (req, res) => {
  try {
    const { categoryId, monthlyLimit, month } = req.body;

    if (!categoryId || monthlyLimit === undefined || monthlyLimit < 0) {
      return res.status(400).json({ error: 'categoryId and valid monthlyLimit are required.' });
    }

    const { monthStr } = getMonthRange(month);

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month: {
          userId: req.user.id,
          categoryId,
          month: monthStr,
        },
      },
      update: {
        monthlyLimit: parseFloat(monthlyLimit),
      },
      create: {
        userId: req.user.id,
        categoryId,
        monthlyLimit: parseFloat(monthlyLimit),
        month: monthStr,
      },
      include: { category: true },
    });

    return res.status(200).json({
      message: 'Budget saved successfully',
      budget,
    });
  } catch (error) {
    console.error('Save Budget Error:', error);
    return res.status(500).json({ error: 'Internal server error saving budget.' });
  }
});

// PUT /api/budgets/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { monthlyLimit } = req.body;

    if (monthlyLimit === undefined || monthlyLimit < 0) {
      return res.status(400).json({ error: 'Valid monthlyLimit is required.' });
    }

    const existing = await prisma.budget.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: { monthlyLimit: parseFloat(monthlyLimit) },
      include: { category: true },
    });

    return res.status(200).json({
      message: 'Budget updated successfully',
      budget: updated,
    });
  } catch (error) {
    console.error('Update Budget Error:', error);
    return res.status(500).json({ error: 'Internal server error updating budget.' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.budget.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Budget not found.' });
    }

    await prisma.budget.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Budget deleted successfully.' });
  } catch (error) {
    console.error('Delete Budget Error:', error);
    return res.status(500).json({ error: 'Internal server error deleting budget.' });
  }
});

export default router;
