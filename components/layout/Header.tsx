'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  SignInButton, 
  SignUpButton, 
  UserButton, 
  SignedIn, 
  SignedOut 
} from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 py-4">
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-[#4A90E2]">
          Artify
        </Link>
        
        <nav className="flex items-center space-x-8">
          <SignedIn>
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
            <Link
              href="/profile"
              className="text-base font-semibold hover:text-[#4A90E2] hover:border-b-2 hover:border-[#4A90E2] transition-colors"
            >
              내 프로필
            </Link>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonBox: 'h-10 w-10'
                }
              }}
              userProfileUrl="/profile"
            />
          </SignedIn>
          
          <SignedOut>
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <Button variant="outline" size="sm" className="w-24">
                  로그인
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="default" size="sm" className="w-24">
                  회원가입
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
} 