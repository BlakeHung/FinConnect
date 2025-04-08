import { useLoading } from '@/store/use-loading';

// 這個函數用於客戶端組件
export function usePrismaWithLoading() {
  const { setLoading } = useLoading();

  const withLoading = async <T>(queryFn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      return await queryFn();
    } finally {
      setLoading(false);
    }
  };

  return { withLoading };
}

// 這個函數用於服務器端組件
export async function withServerLoading<T>(queryFn: () => Promise<T>): Promise<T> {
  // 在服務器端，我們無法直接設置 cookie
  // 但我們可以通過其他方式來實現這個功能
  
  try {
    // 執行查詢
    const result = await queryFn();
    
    return result;
  } finally {
    // 清理工作
  }
} 