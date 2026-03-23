import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Wall Street AI - 월스트리트 투자 전설의 AI 분석",
  description:
    "워런 버핏, 피터 린치 등 투자 거장들의 철학으로 주식을 분석하는 AI 서비스",
  keywords: ["주식 분석", "AI 투자", "워런 버핏", "피터 린치", "가치 투자"],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#1a1a2e",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
