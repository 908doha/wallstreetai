import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0d0d0d] mt-8">
      <div className="mx-auto max-w-[390px] px-5 py-8 space-y-6">

        {/* Company info */}
        <div className="space-y-2">
          <h3 className="text-[14px] font-bold text-white tracking-tight">
            908 Doha Enterprise
          </h3>
          <div className="space-y-1.5">
            <p className="text-[12px] text-white/40 leading-relaxed">
              <span className="text-white/55">대표자</span>
              <span className="mx-2 text-white/20">|</span>
              이대건 박종윤 이지민
            </p>
            <p className="text-[12px] text-white/40 leading-relaxed">
              <span className="text-white/55">이메일</span>
              <span className="mx-2 text-white/20">|</span>
              908doha@gmail.com
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2">
          <h3 className="text-[13px] font-bold text-white tracking-tight">문의하기</h3>
          <Link
            href="mailto:908doha@gmail.com"
            className="inline-flex items-center gap-2 text-[12px] text-[#4F8AFF] hover:underline underline-offset-2 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            908doha@gmail.com
          </Link>
        </div>

        {/* Policy links */}
        <div className="flex items-center gap-4 flex-wrap">
          {[
            { label: "이용약관", href: "#" },
            { label: "개인정보처리방침", href: "#" },
            { label: "문의하기", href: "mailto:908doha@gmail.com" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[12px] text-white/35 hover:text-white/70 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* Copyright */}
        <p className="text-[11px] text-white/25 leading-relaxed">
          이 서비스의 저작권은 908 Doha Enterprise에 있으며, 무단 사용 시
          저작권법 등에 따라 법적 책임을 질 수 있습니다.
          <br />© 2025 Wall Street AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
