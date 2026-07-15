import express from 'express';
import prisma from '../prismaClient.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// Helper to calculate next recurring date
const calculateNextRecurringDate = (date, interval) => {
  if (!date || !interval) return null;
  const current = new Date(date);
  if (interval === 'WEEKLY') {
    current.setDate(current.getDate() + 7);
  } else if (interval === 'MONTHLY') {
    current.setMonth(current.getMonth() + 1);
  }
  return current;
};

// GET /api/transactions
router.get('/', async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      accountId,
      categoryId,
      search,
      type,
      sortBy = 'date',
      sortOrder = 'desc',
      limit = '100',
      offset = '0',
    } = req.query;

    const where = {
      userId: req.user.id,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        // Include full end of day if only YYYY-MM-DD passed
        const end = new Date(endDate);
        if (endDate.length === 10) end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    if (accountId && accountId !== 'ALL') {
      where.accountId = accountId;
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    if (type && ['INCOME', 'EXPENSE'].includes(type)) {
      where.type = type;
    }

    if (search && search.trim() !== '') {
      where.note = {
        contains: search.trim(),
      };
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: {
            select: { id: true, name: true, currency: true, type: true },
          },
          category: {
            select: { id: true, name: true, color: true, icon: true },
          },
        },
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        take: parseInt(limit, 10),
        skip: parseInt(offset, 10),
      }),
      prisma.transaction.count({ where }),
    ]);

    // Calculate totals for the matching criteria across all items (not just current page)
    const allMatching = await prisma.transaction.findMany({
      where,
      select: { amount: true, type: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    allMatching.forEach((tx) => {
      if (tx.type === 'INCOME') totalIncome += tx.amount;
      else if (tx.type === 'EXPENSE') totalExpense += tx.amount;
    });

    return res.status(200).json({
      transactions,
      pagination: {
        totalCount,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      },
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        net: Math.round((totalIncome - totalExpense) * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching transactions.' });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
      include: {
        account: true,
        category: true,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    return res.status(200).json({ transaction });
  } catch (error) {
    console.error('Get Single Transaction Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching transaction.' });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const {
      accountId,
      categoryId,
      amount,
      date,
      note = '',
      type,
      isRecurring = false,
      recurringInterval = null,
    } = req.body;

    if (!accountId || !categoryId || amount === undefined || !date || !type) {
      return res.status(400).json({
        error: 'accountId, categoryId, amount, date, and type (INCOME/EXPENSE) are required.',
      });
    }

    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: req.user.id },
    });
    if (!account) {
      return res.status(404).json({ error: 'Account not found or not owned by user.' });
    }

    // Verify category ownership
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: req.user.id },
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found or not owned by user.' });
    }

    const txDate = new Date(date);
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);

    const nextDate = isRecurring && recurringInterval ? calculateNextRecurringDate(txDate, recurringInterval) : null;

    const newTransaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        accountId,
        categoryId,
        amount: Math.abs(numAmount),
        date: txDate,
        note: note ? note.trim() : '',
        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        isRecurring: Boolean(isRecurring),
        recurringInterval: isRecurring ? recurringInterval : null,
        nextRecurringDate: nextDate,
      },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        category: { select: { id: true, name: true, color: true, icon: true } },
      },
    });

    return res.status(201).json({
      message: 'Transaction logged successfully',
      transaction: newTransaction,
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    return res.status(500).json({ error: 'Internal server error logging transaction.' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      accountId,
      categoryId,
      amount,
      date,
      note,
      type,
      isRecurring,
      recurringInterval,
    } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    if (accountId) {
      const acc = await prisma.account.findFirst({ where: { id: accountId, userId: req.user.id } });
      if (!acc) return res.status(404).json({ error: 'Target account not found.' });
    }

    if (categoryId) {
      const cat = await prisma.category.findFirst({ where: { id: categoryId, userId: req.user.id } });
      if (!cat) return res.status(404).json({ error: 'Target category not found.' });
    }

    const updatedDate = date ? new Date(date) : existing.date;
    const updatedIsRecurring = isRecurring !== undefined ? Boolean(isRecurring) : existing.isRecurring;
    const updatedInterval = recurringInterval !== undefined ? recurringInterval : existing.recurringInterval;

    const nextDate = updatedIsRecurring && updatedInterval
      ? calculateNextRecurringDate(updatedDate, updatedInterval)
      : null;

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(accountId && { accountId }),
        ...(categoryId && { categoryId }),
        ...(amount !== undefined && { amount: Math.abs(typeof amount === 'number' ? amount : parseFloat(amount)) }),
        ...(date && { date: updatedDate }),
        ...(note !== undefined && { note: note.trim() }),
        ...(type && { type: type === 'INCOME' ? 'INCOME' : 'EXPENSE' }),
        isRecurring: updatedIsRecurring,
        recurringInterval: updatedIsRecurring ? updatedInterval : null,
        nextRecurringDate: nextDate,
      },
      include: {
        account: { select: { id: true, name: true, currency: true } },
        category: { select: { id: true, name: true, color: true, icon: true } },
      },
    });

    return res.status(200).json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    return res.status(500).json({ error: 'Internal server error updating transaction.' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    return res.status(500).json({ error: 'Internal server error deleting transaction.' });
  }
});

export default router;
