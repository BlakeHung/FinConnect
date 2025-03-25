import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteTransactions() {
  try {
    console.log('開始刪除交易數據...')

    // 1. 先刪除 TransactionSplit (依賴於 Transaction)
    console.log('刪除交易分帳數據...')
    try {
      // 使用原始 MongoDB 命令刪除集合中的所有記錄
      await prisma.$runCommandRaw({
        delete: 'TransactionSplit',
        deletes: [{ q: {}, limit: 0 }]
      })
      console.log('已刪除所有交易分帳數據')
    } catch (error) {
      console.error('刪除分帳數據時發生錯誤:', error)
    }

    // 2. 再刪除 Transaction 記錄
    console.log('刪除主交易數據...')
    try {
      const deletedTransactions = await prisma.transaction.deleteMany({})
      console.log(`已刪除 ${deletedTransactions.count} 筆交易記錄`)
    } catch (error) {
      console.error('刪除交易記錄時發生錯誤:', error)
    }

    console.log('所有交易數據刪除完成!')

  } catch (error) {
    console.error('刪除過程中發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

deleteTransactions()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 