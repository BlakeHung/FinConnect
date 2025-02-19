import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  try {
    // 檢查管理員用戶是否已存在
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })

    let admin;
    if (!existingAdmin) {
      // 如果管理員不存在，則創建
      const adminPassword = await bcrypt.hash('admin123', 10)
      admin = await prisma.user.create({
        data: {
          name: '管理員',
          email: 'admin@example.com',
          password: adminPassword,
          role: 'ADMIN',
        },
      })
      console.log('✅ 成功創建管理員用戶')
    } else {
      admin = existingAdmin
      console.log('ℹ️ 管理員用戶已存在，跳過創建')
    }

    // 檢查分類是否已存在
    const existingCategories = await prisma.category.findMany()
    let expenseCategories: any[] = [];
    let incomeCategories: any[] = [];

    if (existingCategories.length === 0) {
      // 創建支出分類
      expenseCategories = await Promise.all([
        prisma.category.create({ data: { name: '餐飲', type: 'EXPENSE' } }),
        prisma.category.create({ data: { name: '交通', type: 'EXPENSE' } }),
        prisma.category.create({ data: { name: '住宿', type: 'EXPENSE' } }),
        prisma.category.create({ data: { name: '器材', type: 'EXPENSE' } }),
        prisma.category.create({ data: { name: '其他支出', type: 'EXPENSE' } }),
      ])
      console.log('✅ 成功創建支出分類')

      // 創建收入分類
      incomeCategories = await Promise.all([
        prisma.category.create({ data: { name: '活動收入', type: 'INCOME' } }),
        prisma.category.create({ data: { name: '贊助', type: 'INCOME' } }),
        prisma.category.create({ data: { name: '其他收入', type: 'INCOME' } }),
      ])
      console.log('✅ 成功創建收入分類')
    } else {
      console.log('ℹ️ 分類已存在，跳過創建')
      // 獲取現有分類
      expenseCategories = existingCategories.filter(c => c.type === 'EXPENSE')
      incomeCategories = existingCategories.filter(c => c.type === 'INCOME')
    }

    // 檢查活動是否已存在
    const existingActivities = await prisma.activity.findMany()
    let activities: any[] = [];

    if (existingActivities.length === 0) {
      // 創建活動
      activities = await Promise.all([
        prisma.activity.create({
          data: {
            name: '2024 春季露營',
            startDate: new Date('2024-03-01'),
            endDate: new Date('2024-03-03'),
            status: 'ACTIVE',
            enabled: true,
          },
        }),
        prisma.activity.create({
          data: {
            name: '2024 夏季營隊',
            startDate: new Date('2024-07-01'),
            endDate: new Date('2024-07-05'),
            status: 'ACTIVE',
            enabled: true,
          },
        }),
      ])
      console.log('✅ 成功創建活動')
    } else {
      activities = existingActivities
      console.log('ℹ️ 活動已存在，跳過創建')
    }

    // 創建一些交易記錄
    if (expenseCategories.length > 0 && incomeCategories.length > 0 && activities.length > 0) {
      const transactions = await Promise.all([
        // 春季露營的交易
        prisma.transaction.create({
          data: {
            type: 'EXPENSE',
            amount: 5000,
            date: new Date('2024-03-01'),
            categoryId: expenseCategories[2].id, // 住宿
            activityId: activities[0].id,
            description: '營地預訂費用',
            paymentStatus: 'PAID',
            userId: admin.id,
          },
        }),
        prisma.transaction.create({
          data: {
            type: 'INCOME',
            amount: 12000,
            date: new Date('2024-02-15'),
            categoryId: incomeCategories[0].id, // 活動收入
            activityId: activities[0].id,
            description: '參加費用 (4人)',
            paymentStatus: 'PAID',
            userId: admin.id,
          },
        }),
        // 夏季營隊的交易
        prisma.transaction.create({
          data: {
            type: 'EXPENSE',
            amount: 3000,
            date: new Date('2024-06-25'),
            categoryId: expenseCategories[3].id, // 器材
            activityId: activities[1].id,
            description: '活動器材採購',
            paymentStatus: 'UNPAID',
            userId: admin.id,
          },
        }),
      ])
      console.log('✅ 成功創建交易記錄')
    }

    console.log('✅ 資料庫種子建立完成！')
    console.log('管理員登入資訊：')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')

  } catch (error) {
    console.error('❌ 資料庫種子建立失敗:', error)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 