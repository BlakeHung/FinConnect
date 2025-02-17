import { PrismaClient, TransactionType, UserRole } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// 定義預設資料介面
interface CategoryData {
  name: string;
  type: TransactionType;
  isDefault: boolean;
}

interface UserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

async function main() {
  try {
    await prisma.$connect()
    console.log('成功連接到數據庫')

    // 清除所有現有數據
    await prisma.transaction.deleteMany()
    await prisma.activityParticipant.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.category.deleteMany()
    await prisma.user.deleteMany()
    console.log('清除所有現有數據')

    // 1. 建立預設類別
    const defaultCategories = [
      { name: "餐飲", type: TransactionType.EXPENSE, isDefault: true },
      { name: "交通", type: TransactionType.EXPENSE, isDefault: true },
      { name: "住宿", type: TransactionType.EXPENSE, isDefault: true },
      { name: "活動", type: TransactionType.EXPENSE, isDefault: true },
      { name: "其他支出", type: TransactionType.EXPENSE, isDefault: true },
      { name: "活動收入", type: TransactionType.INCOME, isDefault: true },
      { name: "其他收入", type: TransactionType.INCOME, isDefault: true },
    ];

    for (const category of defaultCategories) {
      await prisma.category.create({
        data: category
      });
    }
    console.log('完成新增預設類別');

    // 2. 建立預設管理員帳號
    const defaultUsers = [
      {
        name: "系統管理員",
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", 10),
        role: UserRole.ADMIN
      },
      {
        name: "財務主記帳",
        email: "finance@example.com",
        password: await bcrypt.hash("finance123", 10),
        role: UserRole.FINANCE_MANAGER
      }
    ];

    for (const user of defaultUsers) {
      await prisma.user.create({
        data: user
      });
    }
    console.log('完成新增預設管理員帳號');

    // 3. 建立測試活動
    const testActivity = await prisma.activity.create({
      data: {
        name: "測試活動",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: "這是一個測試活動"
      }
    });
    console.log('完成新增測試活動');

  } catch (error) {
    console.error('Seed error:', error);
    if (error instanceof Error) {
      console.error('錯誤詳情:', error.message);
      console.error('錯誤堆疊:', error.stack);
    }
  }
}

main()
  .catch((e) => {
    console.error('主程序錯誤:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })