'use client';

import { useUser } from "@clerk/nextjs";
import { Loader2, User, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(date);
  };

  // 로딩 중일 때
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#4A90E2]" />
      </div>
    );
  }

  // 사용자가 로그인하지 않은 경우
  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">내 프로필</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>사용자 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || '프로필 이미지'}
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-2xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{user.primaryEmailAddress?.emailAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>가입일: {formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={() => window.open('/user-profile', '_blank')}
                className="bg-[#4A90E2] hover:bg-[#3A80D2]"
              >
                프로필 관리
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>내 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-[#4A90E2]">0</p>
                <p className="text-gray-600">생성한 이미지</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-[#4A90E2]">0</p>
                <p className="text-gray-600">공유한 이미지</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-2xl font-bold text-[#4A90E2]">0</p>
                <p className="text-gray-600">좋아요</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 