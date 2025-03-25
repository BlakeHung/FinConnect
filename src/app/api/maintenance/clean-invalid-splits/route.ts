import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// 維護端點，用於清理無效的 TransactionSplit 記錄
export async function POST(request: Request) {
  try {
    // 驗證用戶是否為管理員
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return new Response(JSON.stringify({ message: "管理員權限必要" }), {
        status: 403,
      });
    }
    
    console.log("開始清理無效的 TransactionSplit 記錄...");

    // 1. 找出所有 TransactionSplit 記錄
    const allSplits = await prisma.$queryRaw`
      SELECT * FROM "TransactionSplit"
    `;
    console.log(`找到 ${Array.isArray(allSplits) ? allSplits.length : 0} 個 TransactionSplit 記錄`);
    
    // 2. 找出所有無效 (assignedToId 為 null) 的記錄
    const invalidSplits = await prisma.$queryRaw`
      SELECT * FROM "TransactionSplit" 
      WHERE "assignedToId" IS NULL 
      OR "assignedToId" = ''
    `;
    console.log(`找到 ${Array.isArray(invalidSplits) ? invalidSplits.length : 0} 個 assignedToId 為 null 的記錄`);
    
    // 3. 找出所有指向不存在使用者的記錄
    const orphanedSplits = await prisma.$queryRaw`
      SELECT ts.* 
      FROM "TransactionSplit" ts 
      LEFT JOIN "User" u ON ts."assignedToId" = u.id 
      WHERE u.id IS NULL 
      AND ts."assignedToId" IS NOT NULL
    `;
    console.log(`找到 ${Array.isArray(orphanedSplits) ? orphanedSplits.length : 0} 個指向不存在使用者的記錄`);
    
    // 4. 刪除無效記錄
    if (Array.isArray(invalidSplits) && invalidSplits.length > 0) {
      const idsToDelete = invalidSplits.map((split: any) => split.id);
      const deleteResult = await prisma.$executeRaw`
        DELETE FROM "TransactionSplit" 
        WHERE id IN (${idsToDelete.join(',')})
      `;
      console.log(`已刪除 ${deleteResult} 個 assignedToId 為 null 的記錄`);
    }
    
    // 5. 刪除指向不存在使用者的記錄
    if (Array.isArray(orphanedSplits) && orphanedSplits.length > 0) {
      const idsToDelete = orphanedSplits.map((split: any) => split.id);
      const deleteResult = await prisma.$executeRaw`
        DELETE FROM "TransactionSplit" 
        WHERE id IN (${idsToDelete.join(',')})
      `;
      console.log(`已刪除 ${deleteResult} 個指向不存在使用者的記錄`);
    }

    return new Response(
      JSON.stringify({
        message: "清理完成",
        stats: {
          total: Array.isArray(allSplits) ? allSplits.length : 0,
          nullAssignedToId: Array.isArray(invalidSplits) ? invalidSplits.length : 0,
          orphanedAssignedToId: Array.isArray(orphanedSplits) ? orphanedSplits.length : 0
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("清理過程中發生錯誤:", error);
    return new Response(JSON.stringify({ message: "清理失敗", error }), {
      status: 500,
    });
  }
} 