"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onRemove: (url: string) => void;
}

export function ImageUpload({ value = [], onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();
  const isDemo = session?.user?.email === 'demo@wchung.tw';

  const handleImageUpload = async (file: File) => {
    if (isDemo) {
      toast.error("Demo 帳號無法上傳圖片，請使用其他帳號進行測試。");
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "amis_management");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dfaittd9e/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data.secure_url;
  };

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      try {
        setIsUploading(true);
        const files = Array.from(e.target.files);
        const urls = await Promise.all(
          files.map(handleImageUpload)
        );
        // 過濾掉 null 值（來自 demo 帳號的上傳嘗試）
        const validUrls = urls.filter((url): url is string => url !== null);
        if (validUrls.length > 0) {
          onChange([...value, ...validUrls]);
        }
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('圖片上傳失敗，請稍後再試');
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onImageChange}
          disabled={isUploading || isDemo}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>

      {value && value.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {value.map((url, index) => (
            url && (
              <div key={url} className="relative aspect-square group">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
} 