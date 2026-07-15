import prisma from '../prismaClient.js';

export const processRecurringTransactions = async (userId = null) => {
  try {
    const now = new Date();
    const whereClause = {
      isRecurring: true,
      nextRecurringDate: {
        lte: now,
      },
    };

    if (userId) {
      whereClause.userId = userId;
    }

    const dueTransactions = await prisma.transaction.findMany({
      where: whereClause,
    });

    if (dueTransactions.length === 0) {
      return { processedCount: 0 };
    }

    let processedCount = 0;

    for (const parent of dueTransactions) {
      // Loop just in case a transaction has been due across multiple missed intervals (e.g., user logged in after 2 months)
      let currentDueDate = new Date(parent.nextRecurringDate);
      let nextDueDate = new Date(parent.nextRecurringDate);

      while (currentDueDate <= now) {
        // Create concrete instance for this due cycle
        await prisma.transaction.create({
          data: {
            userId: parent.userId,
            accountId: parent.accountId,
            categoryId: parent.categoryId,
            amount: parent.amount,
            date: currentDueDate,
            note: `${parent.note ? parent.note + ' ' : ''}[Auto-Recurring]`.trim(),
            type: parent.type,
            isRecurring: false, // The concrete generated item is historical, parent keeps recurring schedule
            recurringInterval: null,
            nextRecurringDate: null,
          },
        });

        processedCount++;

        // Calculate next cycle
        if (parent.recurringInterval === 'WEEKLY') {
          nextDueDate.setDate(nextDueDate.getDate() + 7);
        } else if (parent.recurringInterval === 'MONTHLY') {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        } else {
          break;
        }

        currentDueDate = new Date(nextDueDate);
      }

      // Update parent with the newly advanced nextRecurringDate
      await prisma.transaction.update({
        where: { id: parent.id },
        data: {
          nextRecurringDate: nextDueDate,
        },
      });
    }

    return { processedCount };
  } catch (error) {
    console.error('Process Recurring Transactions Error:', error);
    throw error;
  }
};
