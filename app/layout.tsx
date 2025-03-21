import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Artify - AI 이미지 생성 커뮤니티",
  description: "Artify는 AI 기반 이미지 생성 및 소통 플랫폼입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      elements: {
        rootBox: 'w-full h-full',
        card: 'shadow-none',
      }
    }}>
      <html lang="ko">
        <body className={inter.className}>
          <Header />
          <main className="pt-16 min-h-screen bg-gray-50">{children}</main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
