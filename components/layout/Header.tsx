import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-[#4A90E2]">
          Artify
        </Link>
        
        <nav className="flex items-center space-x-8">
          <Link 
            href="/create" 
            className="text-base font-semibold hover:text-[#4A90E2] hover:border-b-2 hover:border-[#4A90E2] transition-colors"
          >
            이미지 생성
          </Link>
          <Link 
            href="/gallery" 
            className="text-base font-semibold hover:text-[#4A90E2] hover:border-b-2 hover:border-[#4A90E2] transition-colors"
          >
            내 갤러리
          </Link>
          <Button variant="outline" size="sm">
            로그인
          </Button>
        </nav>
      </div>
    </header>
  );
} 