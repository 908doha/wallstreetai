"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  name: z.string().min(2, "이름은 최소 2자리입니다"),
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 최소 6자리입니다"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "회원가입 실패",
          description: result.error || "다시 시도해주세요",
          variant: "destructive",
        });
      } else {
        toast({ title: "회원가입 성공! 로그인해주세요" });
        router.push("/auth/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-[#f0b429] rounded-2xl mb-4">
          <TrendingUp className="w-8 h-8 text-[#1a1a2e]" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-white">회원가입</h1>
        <p className="text-sm text-gray-400 mt-1">무료로 시작하세요</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-gray-300">이름</Label>
          <Input
            id="name"
            placeholder="홍길동"
            {...register("name")}
            className="bg-[#16213e] border-white/20 text-white"
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

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

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-gray-300">비밀번호</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="최소 6자리"
              {...register("password")}
              className="bg-[#16213e] border-white/20 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-gray-300">비밀번호 확인</Label>
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호 재입력"
            {...register("confirmPassword")}
            className="bg-[#16213e] border-white/20 text-white"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="gold"
          className="w-full h-11"
          disabled={isLoading}
        >
          {isLoading ? "처리 중..." : "회원가입"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-400">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/login" className="text-[#f0b429] hover:underline font-medium">
          로그인
        </Link>
      </p>
    </div>
  );
}
