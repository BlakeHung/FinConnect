import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteExpenses() {
  try {
    console.log('開始刪除 Expense 資料...')

    // 先計算現有數量
    const beforeCount = await prisma.expense.count()
    console.log(`刪除前的 Expense 記錄數量: ${beforeCount}`)

    // 執行刪除
    const deleteResult = await prisma.expense.deleteMany()
    console.log(`已刪除 ${deleteResult.count} 筆 Expense 記錄`)

    // 確認是否完全刪除
    const afterCount = await prisma.expense.count()
    console.log(`刪除後的 Expense 記錄數量: ${afterCount}`)

    if (afterCount === 0) {
      console.log('所有 Expense 記錄已成功刪除！')
    } else {
      console.log('警告：仍有部分記錄未被刪除')
    }

  } catch (error) {
    console.error('刪除失敗:', error)
    return error
  } finally {
    await prisma.$disconnect()
  }
}

deleteExpenses()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 