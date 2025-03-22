# Next.js에 Clerk 인증 시스템 연동하기

Clerk는 Next.js 애플리케이션에 빠르고 안전하게 인증 시스템을 구현할 수 있게 해주는 사용자 관리 및 인증 플랫폼입니다. 이 문서에서는 Next.js 프로젝트에 Clerk를 연동하는 방법을 단계별로 알아보겠습니다.

## 목차

1. [Clerk 소개](#1-clerk-소개)
2. [설치 및 설정](#2-설치-및-설정)
3. [Middleware 설정](#3-middleware-설정)
4. [ClerkProvider 설정](#4-clerkprovider-설정)
5. [로그인/회원가입 컴포넌트 추가](#5-로그인회원가입-컴포넌트-추가)
6. [인증 상태 확인 및 활용](#6-인증-상태-확인-및-활용)

## 1. Clerk 소개

Clerk는 사용자 관리 및 인증을 간편하게 구현할 수 있는 플랫폼으로, 다음과 같은 기능을 제공합니다:

- 이메일/비밀번호 로그인
- 소셜 로그인(Google, GitHub 등)
- 다중 인증(MFA)
- 사용자 프로필 관리
- 세션 관리
- 보안 및 개인정보 설정

Next.js와의 통합이 매우 쉽고, React 컴포넌트와 훅을 통해 인증 기능을 간편하게 구현할 수 있습니다.

## 2. 설치 및 설정

### 패키지 설치

먼저 Clerk의 Next.js 패키지를 설치합니다:

  ```bash
  npm install @clerk/nextjs
  # 또는
  yarn add @clerk/nextjs
  ```

### 환경 변수 설정

Clerk 대시보드에서 프로젝트를 생성한 후, 다음 환경 변수를 `.env.local` 파일에 추가합니다:

  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  CLERK_SECRET_KEY=sk_test_...
  ```

publishable key와 secret key는 Clerk 대시보드에서 확인할 수 있습니다.

## 3. Middleware 설정

프로젝트 루트에 `middleware.ts` 파일을 생성하여 Clerk의 인증 미들웨어를 설정합니다:

  ```typescript
  import { clerkMiddleware } from "@clerk/nextjs/server";

  export default clerkMiddleware();

  export const config = {
    matcher: [
      // Next.js 내부 경로와 정적 파일은 제외
      '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
      // API 경로는 항상 포함
      '/(api|trpc)(.*)',
    ],
  };
  ```

이 미들웨어는 인증이 필요한 경로에 대해 사용자의 로그인 상태를 확인합니다.

## 4. ClerkProvider 설정

`app/layout.tsx` 파일에 ClerkProvider를 추가하여 애플리케이션 전체에서 Clerk의 인증 기능을 사용할 수 있게 합니다:

  ```typescript
  import { ClerkProvider } from '@clerk/nextjs';

  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <ClerkProvider appearance={{
        elements: {
          rootBox: 'w-full h-full',
          card: 'shadow-none',
        }
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
        <html lang="en">
          <body>
            {children}
          </body>
        </html>
      </ClerkProvider>
    );
  }
  ```

`appearance` 속성을 통해 Clerk UI 컴포넌트의 스타일을 커스터마이징할 수 있습니다.

## 5. 로그인/회원가입 컴포넌트 추가

Clerk는 로그인 및 회원가입을 위한 커스터마이징 가능한 컴포넌트를 제공합니다. 이를 활용하여 쉽게 인증 UI를 구현할 수 있습니다.

### 헤더에 로그인/회원가입 버튼 추가

`app/layout.tsx` 파일에 다음과 같이 버튼을 추가합니다:

  ```typescript
  import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
  } from '@clerk/nextjs';

  // ... 생략 ...

  <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <header className="flex justify-end items-center p-4 gap-3 h-16">
      <SignedOut>
        <div className="flex gap-3">
          <SignInButton mode="modal">
            <button className="w-24 h-9 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-sm font-medium">
              로그인
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="w-24 h-9 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 text-sm font-medium">
              회원가입
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </header>
    {children}
  </body>
  ```

여기서:
- `SignedOut`: 사용자가 로그인하지 않은 경우 내부 컴포넌트를 표시
- `SignedIn`: 사용자가 로그인한 경우 내부 컴포넌트를 표시
- `SignInButton`: 로그인 버튼/모달
- `SignUpButton`: 회원가입 버튼/모달
- `UserButton`: 로그인된 사용자의 프로필 및 로그아웃 버튼

### 전용 로그인/회원가입 페이지 생성 (선택 사항)

전용 페이지가 필요한 경우 다음과 같이 구현할 수 있습니다:

로그인 페이지 (`app/sign-in/[[...sign-in]]/page.tsx`):

  ```typescript
  import { SignIn } from '@clerk/nextjs';

  export default function SignInPage() {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SignIn />
      </div>
    );
  }
  ```

회원가입 페이지 (`app/sign-up/[[...sign-up]]/page.tsx`):

  ```typescript
  import { SignUp } from '@clerk/nextjs';

  export default function SignUpPage() {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SignUp />
      </div>
    );
  }
  ```

## 6. 인증 상태 확인 및 활용

Clerk의 인증 상태를 확인하고 사용자 정보를 활용하는 방법은 다양합니다. 서버 컴포넌트와 클라이언트 컴포넌트 모두에서 사용할 수 있습니다.

### 서버 컴포넌트에서 사용

`app/page.tsx` 파일에서 다음과 같이 사용자 정보를 가져올 수 있습니다:

  ```typescript
  import { auth, currentUser } from "@clerk/nextjs/server";
  import { SignedIn, SignedOut } from "@clerk/nextjs";

  export default async function Home() {
    const { userId } = await auth();
    const user = await currentUser();
    
    return (
      <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col items-center max-w-md mx-auto">
          <div className="text-center w-full">
            <SignedIn>
              {user && (
                <div className="space-y-3">
                  <h1 className="text-3xl font-light">
                    {user.firstName || user.username}님,
                  </h1>
                  <p className="text-2xl font-medium text-gray-800">환영합니다!</p>
                </div>
              )}
            </SignedIn>
            <SignedOut>
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-gray-800">로그인을 진행해주세요</h2>
                <p className="text-sm text-gray-500">
                  우측 상단의 버튼을 클릭하여 로그인하세요
                </p>
              </div>
            </SignedOut>
          </div>
        </main>
      </div>
    );
  }
  ```

여기서:
- `auth()`: 현재 세션의 인증 정보를 가져옵니다.
- `currentUser()`: 현재 로그인한 사용자의 정보를 가져옵니다.
- `SignedIn` 및 `SignedOut` 컴포넌트: 사용자의 로그인 상태에 따라 다른 UI를 조건부로 렌더링합니다.

### 클라이언트 컴포넌트에서 사용

클라이언트 컴포넌트에서는 `useAuth()`, `useUser()` 등의 훅을 사용하여 인증 상태와 사용자 정보를 가져올 수 있습니다:

  ```typescript
  'use client';
  
  import { useAuth, useUser } from '@clerk/nextjs';
  
  export default function ProfileButton() {
    const { isLoaded, userId, sessionId } = useAuth();
    const { user } = useUser();
    
    if (!isLoaded || !userId) {
      return null;
    }
    
    return (
      <div>
        <p>안녕하세요, {user?.firstName}님!</p>
        <p>사용자 ID: {userId}</p>
        <p>세션 ID: {sessionId}</p>
      </div>
    );
  }
  ```

## 마무리

이제 Clerk를 사용하여 Next.js 애플리케이션에 인증 시스템을 성공적으로 구현했습니다. Clerk는 다양한 인증 방식과 커스터마이징 옵션을 제공하므로, 필요에 따라 문서를 참조하여 더 많은 기능을 활용할 수 있습니다.

공식 문서: [Clerk 문서](https://clerk.com/docs)

Clerk를 사용하면 인증 관련 기능을 직접 구현하는 복잡한 작업 없이, 안전하고 사용자 친화적인 인증 시스템을 빠르게 구축할 수 있습니다. 