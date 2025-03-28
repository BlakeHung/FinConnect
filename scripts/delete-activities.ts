import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteActivities() {
  try {
    console.log('開始刪除活動數據...')

    // 1. 先刪除 Transaction (依賴於 Activity)
    console.log('刪除相關交易數據...')
    try {
      // 先刪除 TransactionSplit
      await prisma.$runCommandRaw({
        delete: 'TransactionSplit',
        deletes: [{ q: {}, limit: 0 }]
      })
      console.log('已刪除所有交易分帳數據')

      // 再刪除 TransactionPayment
      await prisma.$runCommandRaw({
        delete: 'TransactionPayment',
        deletes: [{ q: {}, limit: 0 }]
      })
      console.log('已刪除所有付款記錄')

      // 最後刪除 Transaction
      await prisma.$runCommandRaw({
        delete: 'Transaction',
        deletes: [{ q: {}, limit: 0 }]
      })
      console.log('已刪除所有交易記錄')
    } catch (error) {
      console.error('刪除交易相關數據時發生錯誤:', error)
    }

    // 2. 刪除 ActivityMember
    console.log('刪除活動成員數據...')
    try {
      await prisma.$runCommandRaw({
        delete: 'ActivityMember',
        deletes: [{ q: {}, limit: 0 }]
      })
      console.log('已刪除所有活動成員數據')
    } catch (error) {
      console.error('刪除活動成員數據時發生錯誤:', error)
    }

    // 3. 最後刪除 Activity
    console.log('刪除活動數據...')
    try {
      await prisma.$runCommandRaw({
        delete: 'Activity',
        deletes: [{ q: {}, limit: 0 }]
      })
      console.log('已刪除所有活動數據')
    } catch (error) {
      console.error('刪除活動數據時發生錯誤:', error)
    }

    console.log('所有活動相關數據刪除完成!')

  } catch (error) {
    console.error('刪除過程中發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteActivities()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 