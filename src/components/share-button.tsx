"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ transactionId }: { transactionId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/transactions/${transactionId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
    >
      <Share2 className="w-4 h-4" />
      {copied ? "已複製連結！" : "分享"}
    </button>
  );
} 