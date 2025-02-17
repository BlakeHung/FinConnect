import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    // 檢查現有支出數量
    const expenseCount = await prisma.expense.count()
    console.log(`現有支出記錄數量: ${expenseCount}`)

    // 檢查交易記錄數量
    const transactionCount = await prisma.transaction.count()
    console.log(`交易記錄數量: ${transactionCount}`)

    // 檢查分類
    const categories = await prisma.category.findMany()
    console.log(`分類數量: ${categories.length}`)
    console.log('分類列表:', categories.map(c => ({ id: c.id, name: c.name, type: c.type })))

    // 檢查關聯
    const expenseWithRelations = await prisma.expense.findFirst({
      include: {
        category: true,
        user: true,
        activity: true,
      }
    })
    console.log('支出範例（含關聯）:', expenseWithRelations)

  } catch (error) {
    console.error('檢查失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()