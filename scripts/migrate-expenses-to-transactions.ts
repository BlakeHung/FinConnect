import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExpensesToTransactions() {
  try {
    console.log('開始遷移資料...')

    // 1. 獲取所有現有的支出記錄
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
        user: true,
        activity: true,
      }
    })
    console.log(`找到 ${expenses.length} 筆支出記錄`)

    // 2. 為每筆支出建立對應的交易記錄
    for (const expense of expenses) {
      await prisma.transaction.create({
        data: {
          amount: expense.amount,
          type: 'EXPENSE',  // 所有舊資料都是支出
          date: expense.date,
          description: expense.description,
          images: expense.images,
          categoryId: expense.categoryId,
          userId: expense.userId,
          activityId: expense.activityId,
          status: expense.status,
          createdAt: expense.createdAt,
          updatedAt: expense.updatedAt,
        },
      })
      console.log(`已遷移支出記錄 ID: ${expense.id}`)
    }

    console.log('資料遷移完成')

    // 3. 刪除舊的支出記錄（請確認資料遷移成功後再執行）
    // await prisma.expense.deleteMany()
    // console.log('舊資料已清除')

  } catch (error) {
    console.error('遷移失敗:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateExpensesToTransactions()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 