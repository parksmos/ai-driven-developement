import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
<<<<<<< HEAD
import { Toaster } from "@/components/ui/toaster";
=======
import { Toaster } from "react-hot-toast";
>>>>>>> 31b4dfec3fcb29d55b01af2940803b199398bfcb

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
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main className="pt-16 min-h-screen bg-gray-50">{children}</main>
<<<<<<< HEAD
        <Toaster />
=======
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
>>>>>>> 31b4dfec3fcb29d55b01af2940803b199398bfcb
      </body>
    </html>
  );
}
