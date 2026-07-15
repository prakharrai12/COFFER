import express from 'express';
import prisma from '../prismaClient.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

const seedDefaultCategoriesIfEmpty = async (userId) => {
  const count = await prisma.category.count({ where: { userId } });
  if (count === 0) {
    const defaultCategories = [
      { name: 'Income', color: '#2E8B57', icon: 'DollarSign', isDefault: true },
      { name: 'Food & Dining', color: '#1F5F4D', icon: 'Utensils', isDefault: true },
      { name: 'Rent & Housing', color: '#3FA37F', icon: 'Home', isDefault: true },
      { name: 'Transport', color: '#5B6158', icon: 'Car', isDefault: true },
      { name: 'Utilities', color: '#B8863B', icon: 'Zap', isDefault: true },
      { name: 'Entertainment', color: '#D3A55C', icon: 'Film', isDefault: true },
      { name: 'Shopping', color: '#C08A2E', icon: 'ShoppingBag', isDefault: true },
      { name: 'Health', color: '#4CC38A', icon: 'Activity', isDefault: true },
    ];
    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: { userId, ...cat },
      });
    }
  }
};

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    await seedDefaultCategoriesIfEmpty(req.user.id);

    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: {
        _count: {
          select: {
            transactions: true,
            budgets: true,
          },
        },
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    const formatted = categories.map((cat) => {
      const { _count, ...rest } = cat;
      return {
        ...rest,
        transactionCount: _count.transactions,
        budgetCount: _count.budgets,
      };
    });

    return res.status(200).json({ categories: formatted });
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({ error: 'Internal server error fetching categories.' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    // Check duplicate name for this user
    const existing = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        name: name.trim(),
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'You already have a category with this name.' });
    }

    const newCategory = await prisma.category.create({
      data: {
        userId: req.user.id,
        name: name.trim(),
        color: color || '#1F5F4D',
        icon: icon || 'Folder',
        isDefault: false,
      },
    });

    return res.status(201).json({
      message: 'Category created successfully',
      category: {
        ...newCategory,
        transactionCount: 0,
        budgetCount: 0,
      },
    });
  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({ error: 'Internal server error creating category.' });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const existing = await prisma.category.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
        ...(icon && { icon }),
      },
    });

    const txCount = await prisma.transaction.count({ where: { categoryId: id } });
    const budgetCount = await prisma.budget.count({ where: { categoryId: id } });

    return res.status(200).json({
      message: 'Category updated successfully',
      category: {
        ...updated,
        transactionCount: txCount,
        budgetCount: budgetCount,
      },
    });
  } catch (error) {
    console.error('Update Category Error:', error);
    return res.status(500).json({ error: 'Internal server error updating category.' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reassignToCategoryId = req.query.reassignToCategoryId || req.body.reassignToCategoryId;

    const category = await prisma.category.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const txCount = await prisma.transaction.count({
      where: { categoryId: id, userId: req.user.id },
    });

    if (txCount > 0) {
      if (!reassignToCategoryId || reassignToCategoryId === id) {
        return res.status(400).json({
          error: `Category "${category.name}" is used by ${txCount} transaction(s). Please specify reassignToCategoryId to safely reassign them before deleting.`,
          requiresAction: true,
          transactionCount: txCount,
        });
      }

      const targetCategory = await prisma.category.findFirst({
        where: { id: reassignToCategoryId, userId: req.user.id },
      });

      if (!targetCategory) {
        return res.status(400).json({ error: 'Target reassignment category does not exist or does not belong to you.' });
      }

      // Reassign transactions to new category safely
      await prisma.transaction.updateMany({
        where: { categoryId: id, userId: req.user.id },
        data: { categoryId: reassignToCategoryId },
      });
    }

    // Delete associated budgets if any
    await prisma.budget.deleteMany({
      where: { categoryId: id, userId: req.user.id },
    });

    await prisma.category.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Category deleted successfully.',
      reassignedTransactionsCount: txCount,
    });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return res.status(500).json({ error: 'Internal server error deleting category.' });
  }
});

export default router;
