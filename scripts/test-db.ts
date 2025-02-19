import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

async function main() {
  const prisma = new PrismaClient()
  
  try {
    // 測試連接
    await prisma.$connect()
    console.log('✅ 成功連接到資料庫')

    // 測試讀取
    const userCount = await prisma.user.count()
    console.log(`現有使用者數量: ${userCount}`)

    // 生成測試密碼的 hash
    const hashedPassword = await bcrypt.hash('testpassword123', 10)

    // 測試寫入
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,  // 添加加密後的密碼
        role: 'USER',
      },
    })
    console.log('✅ 成功創建測試使用者:', testUser)

    // 測試刪除
    await prisma.user.delete({
      where: { id: testUser.id },
    })
    console.log('✅ 成功刪除測試使用者')

  } catch (error) {
    console.error('❌ 資料庫測試失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 