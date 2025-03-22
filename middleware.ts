import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 공개 경로 설정 - 로그인 없이 접근 가능한 경로
const isPublic = createRouteMatcher([
  '/', 
  '/api/webhook',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/post/(.*)', // 커뮤니티 포스트 조회는 가능하도록
]);

// 이 미들웨어는 앱의 모든 경로에서 실행됩니다
export default clerkMiddleware({
  // 공개 경로 검사 함수 설정
  publicRoutes: (req) => isPublic(req)
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 