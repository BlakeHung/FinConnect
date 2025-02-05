import { PrismaClient, TransactionType } from '@prisma/client'

const prisma = new PrismaClient()

// 定義類別的介面
interface CategoryData {
  name: string;
  type: TransactionType;
  isDefault: boolean;
}

async function main() {
  try {
    // 測試數據庫連接
    await prisma.$connect()
    console.log('成功連接到數據庫')

    // 檢查是否已有類別並輸出
    const existingCategories = await prisma.category.findMany()
    console.log('現有類別數量:', existingCategories.length)
    
    // 如果沒有類別，才新增預設類別
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: "餐飲", type: TransactionType.EXPENSE },
        { name: "交通", type: TransactionType.EXPENSE },
        { name: "住宿", type: TransactionType.EXPENSE },
        { name: "活動", type: TransactionType.EXPENSE },
        { name: "其他", type: TransactionType.EXPENSE },
      ];

      // 序列化創建類別
      for (const category of defaultCategories) {
        try {
          const result = await prisma.category.create({
            data: {
              name: category.name,
              type: category.type,
              isDefault: true,
            }
          });
          console.log(`成功新增類別: ${category.name}`, result);
        } catch (error) {
          console.error(`新增類別 ${category.name} 失敗:`, error);
          // 輸出詳細錯誤信息
          if (error instanceof Error) {
            console.error('錯誤詳情:', error.message);
            console.error('錯誤堆疊:', error.stack);
          }
        }
      }
      
      console.log('完成新增預設類別');
    } else {
      console.log('已存在類別，跳過新增');
      console.log('現有類別:', existingCategories);
    }
  } catch (error) {
    console.error('Seed error:', error);
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