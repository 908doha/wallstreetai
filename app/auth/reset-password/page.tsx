"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    // In a real implementation, this would call an API endpoint
    // to send a password reset email
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setIsLoading(false);
    toast({ title: "이메일을 확인하세요" });
  };

  return (
    <div className="min-h-screen bg-[#0f0f23] flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#4F8AFF] rounded-2xl mb-4">
            <TrendingUp className="w-8 h-8 text-[#1a1a2e]" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white">비밀번호 재설정</h1>
          <p className="text-sm text-gray-400 mt-1">
            가입한 이메일 주소를 입력해주세요
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
            <p className="text-sm text-green-400 font-medium">
              비밀번호 재설정 링크가 전송되었습니다
            </p>
            <p className="text-xs text-green-400/70 mt-1">
              이메일을 확인해주세요
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-300">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                className="bg-[#16213e] border-white/20 text-white"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading ? "전송 중..." : "재설정 링크 전송"}
            </Button>
          </form>
        )}

        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          로그인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
