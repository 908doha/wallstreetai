"use client";

import { useState } from "react";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateShareUrl } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ShareButtonProps {
  shareToken: string;
  ticker: string;
}

export function ShareButton({ shareToken, ticker }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = generateShareUrl(shareToken);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "링크가 복사되었습니다" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "복사 실패", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${ticker} AI 분석 결과`,
          text: `Wall Street AI의 ${ticker} 분석 결과를 확인하세요!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/20">
          <Share2 className="w-4 h-4 mr-2" />
          공유
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#16213e] border-white/10 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-white">분석 결과 공유</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-[#0f0f23] rounded-lg border border-white/10">
            <p className="text-xs text-gray-400 flex-1 truncate">{shareUrl}</p>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 flex-shrink-0"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="gold"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              공유하기
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4 mr-2" />
              링크 복사
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
