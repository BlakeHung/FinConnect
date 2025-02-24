import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  try {
    // 檢查管理員用戶是否已存在
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })

    // 檢查 demo 帳號是否已存在
    const existingDemo = await prisma.user.findUnique({
      where: { email: 'demo@wchung.tw' }
    })

    let admin;
    let demo;

    if (!existingAdmin) {
      admin = await prisma.user.create({
        data: {
          name: '系統管理員',
          email: 'admin@example.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
        },
      })
      console.log('✅ 成功創建管理員帳號')
    } else {
      admin = existingAdmin
      console.log('ℹ️ 管理員帳號已存在')
    }

    if (!existingDemo) {
      demo = await prisma.user.create({
        data: {
          name: 'Blake Labs',
          email: 'demo@wchung.tw',
          password: await bcrypt.hash('demo2024', 10),
          role: 'ADMIN',
        },
      })
      console.log('✅ 成功創建 Demo 帳號')
    } else {
      demo = existingDemo
      console.log('ℹ️ Demo 帳號已存在')
    }

    // 檢查分類是否已存在
    const existingCategories = await prisma.category.findMany()
    let expenseCategories: any[] = []
    let incomeCategories: any[] = []

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
      expenseCategories = existingCategories.filter(c => c.type === 'EXPENSE')
      incomeCategories = existingCategories.filter(c => c.type === 'INCOME')
      console.log('ℹ️ 使用現有分類')
    }

    // 創建活動
    const activities = await Promise.all([
      // 進行中的活動
      prisma.activity.create({
        data: {
          name: '2025 冬季滑雪營',
          startDate: new Date('2025-02-20'),
          endDate: new Date('2025-02-25'),
          description: '日本北海道滑雪體驗營',
          status: 'ACTIVE',
          enabled: true,
        }
      }),
      prisma.activity.create({
        data: {
          name: '2025 新春健行團',
          startDate: new Date('2025-02-15'),
          endDate: new Date('2025-02-16'),
          description: '陽明山芒草季健行活動',
          status: 'ACTIVE',
          enabled: true,
        }
      }),
      // 即將進行的活動
      prisma.activity.create({
        data: {
          name: '2025 春季露營工作坊',
          startDate: new Date('2025-03-15'),
          endDate: new Date('2025-03-17'),
          description: '三天兩夜的露營技能工作坊',
          status: 'PLANNING',
          enabled: true,
        }
      }),
      prisma.activity.create({
        data: {
          name: '2025 清明踏青之旅',
          startDate: new Date('2025-04-05'),
          endDate: new Date('2025-04-07'),
          description: '南投杉林溪森林浴之旅',
          status: 'PLANNING',
          enabled: true,
        }
      }),
      prisma.activity.create({
        data: {
          name: '2025 夏季衝浪營',
          startDate: new Date('2025-07-01'),
          endDate: new Date('2025-07-05'),
          description: '台東衝浪體驗營',
          status: 'PLANNING',
          enabled: true,
        }
      }),
      // 已完成的活動
      prisma.activity.create({
        data: {
          name: '2025 元旦曙光健行',
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-01'),
          description: '花蓮七星潭曙光健行',
          status: 'COMPLETED',
          enabled: true,
        }
      }),
      prisma.activity.create({
        data: {
          name: '2024 跨年露營',
          startDate: new Date('2024-12-31'),
          endDate: new Date('2025-01-01'),
          description: '跨年露營派對',
          status: 'COMPLETED',
          enabled: true,
        }
      }),
    ])
    console.log('✅ 成功創建活動')

    // 創建 EDM
    await Promise.all(activities.map(activity => 
      prisma.eDM.create({
        data: {
          activityId: activity.id,
          title: `${activity.name} - 活動通知`,
          content: `
歡迎參加 ${activity.name}！

活動時間：${activity.startDate.toLocaleDateString()} - ${activity.endDate.toLocaleDateString()}
活動地點：陽明山國家公園
活動費用：每人 NT$ 2,500

活動特色：
- 專業教練指導
- 高品質露營裝備
- 美味的營地料理
- 精彩的團康活動

報名方式：
請點擊下方連結進行報名，名額有限，請盡快報名！

注意事項：
1. 請攜帶個人裝備
2. 依照天氣狀況準備適當衣物
3. 活動前會有詳細行前通知

期待與您相見！
          `,
          contactInfo: '聯絡電話：0912-345-678\nEmail：info@example.com',
          registrationLink: 'https://example.com/register',
          images: [
            'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d',
            'https://images.unsplash.com/photo-1496545672447-f699b503d270'
          ],
        },
      })
    ))
    console.log('✅ 成功創建 EDM')

    // 創建交易記錄
    const transactions = []
    for (const activity of activities) {
      // 每個活動新增 4-5 筆交易記錄
      const numTransactions = Math.floor(Math.random() * 2) + 4
      
      for (let i = 0; i < numTransactions; i++) {
        const isExpense = Math.random() > 0.3 // 70% 機率是支出
        const category = isExpense 
          ? expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
          : incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
        
        transactions.push(prisma.transaction.create({
          data: {
            type: isExpense ? 'EXPENSE' : 'INCOME',
            amount: Math.floor(Math.random() * 10000) + 1000,
            date: new Date(activity.startDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
            categoryId: category.id,
            activityId: activity.id,
            description: isExpense 
              ? ['場地租借', '器材採購', '餐飲費用', '交通費用', '保險費用'][Math.floor(Math.random() * 5)]
              : ['報名費用', '贊助收入', '其他收入'][Math.floor(Math.random() * 3)],
            paymentStatus: Math.random() > 0.2 ? 'PAID' : 'UNPAID',
            userId: [admin.id, demo.id][Math.floor(Math.random() * 2)],
            images: Math.random() > 0.5 
              ? ['https://images.unsplash.com/photo-1554224155-8d04cb21cd6c']
              : [],
          },
        }))
      }
    }

    await Promise.all(transactions)
    console.log('✅ 成功創建交易記錄')

    console.log('\n✅ 資料庫種子建立完成！')
    console.log('\n管理員登入資訊：')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')
    console.log('\nDemo 帳號登入資訊：')
    console.log('Email: demo@wchung.tw')
    console.log('Password: demo2024')
    console.log('\n請妥善保管以上資訊')

  } catch (error) {
    console.error('❌ 資料庫種子建立失敗:', error)
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 