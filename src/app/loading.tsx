import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        <Spinner className="h-8 w-8 text-blue-600" />
        <p className="mt-2 text-sm text-gray-500">載入中...</p>
      </div>
    </div>
  );
} 