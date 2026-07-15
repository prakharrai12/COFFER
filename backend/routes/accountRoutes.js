import express from 'express';
import prisma from '../prismaClient.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/accounts
router.get('/', async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.user.id },
      include: {
        transactions: {
          select: {
            id: true,
            amount: true,
            type: true,
            date: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const enrichedAccounts = accounts.map((acc) => {
      let runningBalance = acc.initialBalance;
      let totalIncome = 0;
      let totalExpense = 0;

      acc.transactions.forEach((tx) => {
        if (tx.type === 'INCOME') {
          runningBalance += tx.amount;
          totalIncome += tx.amount;
        } else if (tx.type === 'EXPENSE') {
          runningBalance -= tx.amount;
          totalExpense += tx.amount;
        }
      });

      // Strip full transaction array from response to keep payload clean and fast
      const { transactions, ...accountData } = acc;
      return {
        ...accountData,
        runningBalance: Math.round(runningBalance * 100) / 100,
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpense: Math.round(totalExpense * 100) / 100,
        transactionCount: transactions.length,
      };
    });

    return res.status(200).json({ accounts: enrichedAccounts });
  } catch (error) {
    console.error('Get Accounts Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching accounts.' });
  }
});

// GET /api/accounts/:id (get single account with details)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const account = await prisma.account.findFirst({
      where: { id, userId: req.user.id },
      include: {
        transactions: {
          include: { category: true },
          orderBy: { date: 'desc' },
          take: 50,
        },
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    let runningBalance = account.initialBalance;
    const allTx = await prisma.transaction.findMany({
      where: { accountId: id, userId: req.user.id },
      select: { amount: true, type: true },
    });

    allTx.forEach((tx) => {
      if (tx.type === 'INCOME') runningBalance += tx.amount;
      else if (tx.type === 'EXPENSE') runningBalance -= tx.amount;
    });

    return res.status(200).json({
      account: {
        ...account,
        runningBalance: Math.round(runningBalance * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Get Account Detail Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching account details.' });
  }
});

// POST /api/accounts
router.post('/', async (req, res) => {
  try {
    const { name, type, initialBalance, currency } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Account name is required.' });
    }

    const validTypes = ['CHECKING', 'SAVINGS', 'CASH', 'CREDIT_CARD', 'INVESTMENT'];
    const accountType = validTypes.includes(type) ? type : 'CHECKING';

    const newAccount = await prisma.account.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        type: accountType,
        initialBalance: typeof initialBalance === 'number' ? initialBalance : parseFloat(initialBalance || 0),
        currency: currency || req.user.currency || '$ USD',
      },
    });

    return res.status(201).json({
      message: 'Account created successfully',
      account: {
        ...newAccount,
        runningBalance: newAccount.initialBalance,
        totalIncome: 0,
        totalExpense: 0,
        transactionCount: 0,
      },
    });
  } catch (error) {
    console.error('Create Account Error:', error);
    return res.status(500).json({ error: 'Internal server error creating account.' });
  }
});

// PUT /api/accounts/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, initialBalance, currency } = req.body;

    const existingAccount = await prisma.account.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(type && { type }),
        ...(initialBalance !== undefined && {
          initialBalance: typeof initialBalance === 'number' ? initialBalance : parseFloat(initialBalance),
        }),
        ...(currency && { currency }),
      },
    });

    // Recompute running balance
    const allTx = await prisma.transaction.findMany({
      where: { accountId: id, userId: req.user.id },
      select: { amount: true, type: true },
    });

    let runningBalance = updatedAccount.initialBalance;
    allTx.forEach((tx) => {
      if (tx.type === 'INCOME') runningBalance += tx.amount;
      else if (tx.type === 'EXPENSE') runningBalance -= tx.amount;
    });

    return res.status(200).json({
      message: 'Account updated successfully',
      account: {
        ...updatedAccount,
        runningBalance: Math.round(runningBalance * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Update Account Error:', error);
    return res.status(500).json({ error: 'Internal server error updating account.' });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reassignToAccountId } = req.query;

    const account = await prisma.account.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    // Check if there are transactions linked to this account
    const txCount = await prisma.transaction.count({
      where: { accountId: id, userId: req.user.id },
    });

    if (txCount > 0) {
      if (reassignToAccountId && reassignToAccountId !== id) {
        // Reassign existing transactions to another account
        await prisma.transaction.updateMany({
          where: { accountId: id, userId: req.user.id },
          data: { accountId: reassignToAccountId },
        });
      } else {
        // Check if there is another account available or if user confirmed cascade
        if (req.query.confirmCascade !== 'true') {
          return res.status(400).json({
            error: `Account has ${txCount} transaction(s). Please specify reassignToAccountId or confirmCascade=true to delete.`,
            transactionCount: txCount,
            requiresAction: true,
          });
        }
      }
    }

    await prisma.account.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    return res.status(500).json({ error: 'Internal server error deleting account.' });
  }
});

export default router;
