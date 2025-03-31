import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// MongoDB 中的集合名稱
const COLLECTION_NAME = 'TransactionSplit'

async function cleanInvalidSplits() {
  try {
    console.log('開始清理無效的 TransactionSplit 記錄...')

    // 使用 Prisma 的 $runCommandRaw 執行 MongoDB 命令
    const db = prisma.$extends({
      name: 'db',
      query: {
        $allOperations({ args, query }) {
          console.log(`執行查詢: ${query}`)
          return query(args)
        },
      },
    })

    // 1. 計算總數量
    const countResult = await db.$runCommandRaw({
      count: COLLECTION_NAME
    })
    const totalCount = countResult.n || 0
    console.log(`總共有 ${totalCount} 個 TransactionSplit 記錄`)

    // 2. 刪除 assignedToId 為 null 的記錄
    const deleteNullResult = await db.$runCommandRaw({
      delete: COLLECTION_NAME,
      deletes: [
        {
          q: { assignedToId: null },
          limit: 0
        }
      ]
    })
    const deletedNullCount = deleteNullResult.n || 0
    console.log(`已刪除 ${deletedNullCount} 個 assignedToId 為 null 的記錄`)

    // 3. 查找孤立的記錄（通過聚合查詢）
    const orphanedSplits = await db.$runCommandRaw({
      aggregate: COLLECTION_NAME,
      pipeline: [
        {
          $lookup: {
            from: 'User',
            localField: 'assignedToId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $match: {
            user: { $size: 0 },
            assignedToId: { $ne: null }
          }
        },
        {
          $project: {
            _id: 1,
            assignedToId: 1
          }
        }
      ],
      cursor: {}
    })

    const orphanedIds = (orphanedSplits.cursor?.firstBatch || []).map((split: any) => split._id)
    console.log(`找到 ${orphanedIds.length} 個指向不存在用戶的記錄`)

    // 4. 刪除孤立的記錄
    if (orphanedIds.length > 0) {
      const deleteOrphanedResult = await db.$runCommandRaw({
        delete: COLLECTION_NAME,
        deletes: [
          {
            q: { _id: { $in: orphanedIds } },
            limit: 0
          }
        ]
      })
      const deletedOrphanedCount = deleteOrphanedResult.n || 0
      console.log(`已刪除 ${deletedOrphanedCount} 個指向不存在用戶的記錄`)
    }

    // 5. 檢查清理後的結果
    const finalCountResult = await db.$runCommandRaw({
      count: COLLECTION_NAME
    })
    const afterCount = finalCountResult.n || 0
    console.log(`清理後共有 ${afterCount} 個 TransactionSplit 記錄`)
    console.log(`總共刪除了 ${totalCount - afterCount} 個無效記錄`)

  } catch (error) {
    console.error('清理過程中發生錯誤:', error)
    return error
  } finally {
    await prisma.$disconnect()
  }
}

cleanInvalidSplits()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 