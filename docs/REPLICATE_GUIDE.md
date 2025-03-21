# Replicate Flux 모델 사용 가이드

이 문서는 Next.js 프로젝트에서 Replicate의 Flux 모델을 사용하여 이미지 생성 기능을 구현하는 방법을 설명합니다.

## 목차

1. [소개](#소개)
2. [설치 및 설정](#설치-및-설정)
3. [API 구현](#api-구현)
4. [프론트엔드 구현](#프론트엔드-구현)
5. [전체 프로세스 설명](#전체-프로세스-설명)
6. [추가 옵션 및 고급 기능](#추가-옵션-및-고급-기능)
7. [문제 해결](#문제-해결)

## 소개

[Flux 모델](https://replicate.com/black-forest-labs/flux-schnell)은 빠르고 효율적인 이미지 생성 모델로, Replicate 플랫폼을 통해 API로 제공됩니다. 이 가이드에서는 Next.js 프로젝트에서 Flux 모델을 사용하여 텍스트 프롬프트를 기반으로 이미지를 생성하는 기능을 구현하는 방법을 단계별로 설명합니다.

## 설치 및 설정

### 1. 필요한 패키지 설치

프로젝트에 필요한 패키지를 설치합니다:

```bash
npm install replicate
# 또는
yarn add replicate
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Replicate API 토큰을 설정합니다:

```
REPLICATE_API_TOKEN=your_replicate_api_token_here
```

API 토큰은 [Replicate 웹사이트](https://replicate.com/account/api-tokens)에서 발급받을 수 있습니다.

### 3. Next.js 설정

`next.config.mjs` 파일에 다음 설정을 추가합니다:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
```

이 설정은 Replicate에서 생성된 이미지를 Next.js의 Image 컴포넌트에서 사용할 수 있도록 합니다.

## API 구현

### 1. 기본 타입 정의

`types/replicate.ts` 파일을 생성하고 다음 타입을 정의합니다:

```typescript
export interface PredictionInput {
  prompt: string;
}

export interface PredictionOutput {
  prediction: {
    id: string;
    version: string;
    urls: {
      get: string;
      cancel: string;
    };
    created_at: string;
    started_at?: string;
    completed_at?: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    input: {
      prompt: string;
    };
    output?: string[] | null;
    error?: string | null;
    logs?: string | null;
    metrics: {
      predict_time?: number;
    };
  };
}
```

### 2. Flux 모델 입력 인터페이스 정의

`app/api/predictions/route.ts` 파일에 Flux 모델의 입력 인터페이스를 정의합니다:

```typescript
export interface FluxModelInput {
  /**
   * Prompt for generated image
   */
  prompt: string;

  /**
   * Aspect ratio for the generated image
   * @default "1:1"
   */
  aspect_ratio?: "1:1" | "16:9" | "21:9" | "3:2" | "2:3" | "4:5" | "5:4" | "3:4" | "4:3" | "9:16" | "9:21";

  /**
   * Number of outputs to generate
   * @default 1
   * @minimum 1
   * @maximum 4
   */
  num_outputs?: number;

  /**
   * Number of denoising steps. 4 is recommended, and lower number of steps produce lower quality outputs, faster.
   * @default 4
   * @minimum 1
   * @maximum 4
   */
  num_inference_steps?: number;

  /**
   * Random seed. Set for reproducible generation
   */
  seed?: number;

  /**
   * Format of the output images
   * @default "webp"
   */
  output_format?: "webp" | "jpg" | "png";

  /**
   * Quality when saving the output images, from 0 to 100. 100 is best quality, 0 is lowest quality. Not relevant for .png outputs
   * @default 80
   * @minimum 0
   * @maximum 100
   */
  output_quality?: number;

  /**
   * Disable safety checker for generated images.
   * @default false
   */
  disable_safety_checker?: boolean;

  /**
   * Run faster predictions with model optimized for speed (currently fp8 quantized); disable to run in original bf16
   * @default true
   */
  go_fast?: boolean;

  /**
   * Approximate number of megapixels for generated image
   * @default "1"
   */
  megapixels?: "1" | "0.25";
}
```

### 3. 예측 생성 API 구현

`app/api/predictions/route.ts` 파일에 예측 생성 API를 구현합니다:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// API 요청 시간 제한 설정
export const maxDuration = 300; // 초 단위 (5분)

// API 요청 처리를 위한 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// FluxModelInput 인터페이스 정의 (위에서 정의한 내용)
// ...

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    console.log('요청 받음:', { prompt });

    // API 키가 없으면 에러 반환
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('API 토큰이 설정되지 않음');
      return NextResponse.json(
        { error: 'Replicate API 토큰이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // API 키로 Replicate 클라이언트 초기화
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log('Replicate 클라이언트 초기화 완료');
    
    try {
      // 예측 생성
      console.log('예측 생성 시작...');
      const prediction = await replicate.predictions.create({
        model: "black-forest-labs/flux-schnell",
        input: { prompt }
      });
      
      console.log('예측 생성 완료:', prediction);

      // 예측 결과 반환
      return NextResponse.json({ prediction }, { status: 201 });
    } catch (modelError: any) {
      console.error('모델 실행 오류:', modelError);
      return NextResponse.json(
        { 
          error: `모델 실행 오류: ${modelError.message || '알 수 없는 오류'}`,
          details: modelError 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('일반 오류:', error);
    return NextResponse.json(
      { 
        error: `서버 오류: ${error.message || '알 수 없는 오류'}`,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
```

### 4. 예측 상태 확인 API 구현

`app/api/predictions/[id]/route.ts` 파일을 생성하고 예측 상태 확인 API를 구현합니다:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

// API 요청 처리를 위한 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`폴링 요청 받음: ID=${id}`);

    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('API 토큰이 설정되지 않음');
      return NextResponse.json(
        { error: 'Replicate API 토큰이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // API 키로 Replicate 클라이언트 초기화
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // 예측 상태 확인
    const prediction = await replicate.predictions.get(id);
    console.log(`폴링 결과: status=${prediction.status}`);

    return NextResponse.json(prediction);
  } catch (error: any) {
    console.error('폴링 오류:', error);
    return NextResponse.json(
      { 
        error: `폴링 오류: ${error.message || '알 수 없는 오류'}`,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}
```

## 프론트엔드 구현

`app/page.tsx` 파일에 다음과 같이 프론트엔드를 구현합니다:

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PredictionOutput } from '@/types/replicate';

// 폴링 간격 (밀리초)
const POLLING_INTERVAL = 1000;

export default function Home() {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [predictionStatus, setPredictionStatus] = useState<string | null>(null);

  // 예측 상태를 폴링하는 함수
  useEffect(() => {
    if (!predictionId || predictionStatus === 'succeeded' || predictionStatus === 'failed') {
      return;
    }

    const pollPrediction = async () => {
      try {
        const response = await fetch(`/api/predictions/${predictionId}`);
        if (!response.ok) {
          throw new Error('폴링 요청이 실패했습니다.');
        }

        const prediction = await response.json();
        console.log('폴링 결과:', prediction);

        setPredictionStatus(prediction.status);

        if (prediction.status === 'succeeded') {
          setIsLoading(false);
          
          // 출력 처리
          if (prediction.output && Array.isArray(prediction.output)) {
            // 마지막 이미지가 최종 결과
            setImageUrl(prediction.output[prediction.output.length - 1]);
          } else if (typeof prediction.output === 'string') {
            setImageUrl(prediction.output);
          }
        } else if (prediction.status === 'failed') {
          setIsLoading(false);
          setError(`예측 실패: ${prediction.error || '알 수 없는 오류'}`);
        }
      } catch (err: any) {
        console.error('폴링 오류:', err);
        // 폴링 오류는 바로 실패로 처리하지 않고 계속 시도
      }
    };

    // 폴링 간격으로 상태 확인
    const interval = setInterval(pollPrediction, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [predictionId, predictionStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setPredictionId(null);
    setPredictionStatus(null);

    try {
      console.log('요청 시작:', prompt);
      
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log('응답 데이터:', data);

      if (!response.ok) {
        throw new Error(data.error || '예측을 생성하는 중 오류가 발생했습니다.');
      }

      if (data.prediction && data.prediction.id) {
        // ID를 설정하여 폴링 시작
        setPredictionId(data.prediction.id);
        setPredictionStatus(data.prediction.status);
      } else if (data.prediction && data.prediction.output) {
        // 즉시 결과가 있는 경우 (드문 경우)
        setIsLoading(false);
        
        if (Array.isArray(data.prediction.output)) {
          setImageUrl(data.prediction.output[data.prediction.output.length - 1]);
        } else if (typeof data.prediction.output === 'string') {
          setImageUrl(data.prediction.output);
        }
      } else {
        throw new Error('응답에서 예측 결과를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      console.error('오류 발생:', err);
      setIsLoading(false);
      setError(err.message || '알 수 없는 오류가 발생했습니다.');
    }
  };

  // 렌더링 부분은 UI에 맞게 구현
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* 폼 및 결과 표시 UI */}
      {/* ... */}
    </main>
  );
}
```

## 전체 프로세스 설명

Flux 모델을 사용한 이미지 생성 프로세스는 다음과 같습니다:

1. **사용자가 프롬프트 입력**: 사용자가 웹 UI에서 이미지 생성을 위한 텍스트 프롬프트를 입력합니다.
2. **API 요청 전송**: 프론트엔드에서 `/api/predictions` API로 POST 요청을 보냅니다.
3. **Replicate 예측 생성**: 백엔드에서 Replicate API를 사용하여 예측을 생성합니다.
4. **예측 ID 반환**: 예측 ID를 프론트엔드로 반환합니다.
5. **예측 상태 폴링**: 프론트엔드에서 예측 ID를 사용하여 `/api/predictions/[id]` API로 상태를 주기적으로 폴링합니다.
6. **결과 표시**: 예측이 완료되면 생성된 이미지를 표시합니다.

## 추가 옵션 및 고급 기능

Flux 모델은 다양한 추가 옵션을 제공합니다:

### 1. 이미지 크기 및 비율 설정

`aspect_ratio` 옵션을 사용하여 이미지의 비율을 지정할 수 있습니다:

```typescript
const prediction = await replicate.predictions.create({
  model: "black-forest-labs/flux-schnell",
  input: { 
    prompt,
    aspect_ratio: "16:9" // 16:9 비율로 이미지 생성
  }
});
```

### 2. 이미지 품질 조정

`num_inference_steps`와 `output_quality` 옵션을 사용하여 이미지 품질을 조정할 수 있습니다:

```typescript
const prediction = await replicate.predictions.create({
  model: "black-forest-labs/flux-schnell",
  input: { 
    prompt,
    num_inference_steps: 4, // 더 많은 단계는 더 높은 품질, 하지만 더 오래 걸림
    output_quality: 90 // 높은 품질의 출력 이미지
  }
});
```

### 3. 여러 이미지 생성

`num_outputs` 옵션을 사용하여 한 번의 요청으로 여러 이미지를 생성할 수 있습니다:

```typescript
const prediction = await replicate.predictions.create({
  model: "black-forest-labs/flux-schnell",
  input: { 
    prompt,
    num_outputs: 4 // 최대 4개의 이미지 생성
  }
});
```

### 4. 재현 가능한 결과

`seed` 옵션을 사용하여 동일한 프롬프트에 대해 재현 가능한 결과를 얻을 수 있습니다:

```typescript
const prediction = await replicate.predictions.create({
  model: "black-forest-labs/flux-schnell",
  input: { 
    prompt,
    seed: 42 // 특정 시드 값 설정
  }
});
```

## 문제 해결

### 일반적인 오류

1. **API 토큰 오류**: 올바른 Replicate API 토큰이 환경 변수에 설정되어 있는지 확인하세요.
2. **요청 시간 초과**: `maxDuration`을 조정하여 API 요청 시간 제한을 늘릴 수 있습니다.
3. **모델 실행 오류**: 프롬프트가 적절한지 확인하세요. 부적절한 내용이 포함된 경우 안전 검사에 의해 차단될 수 있습니다.

### 최적화 팁

1. **폴링 간격 조정**: 서버 부하를 줄이기 위해 폴링 간격을 조정할 수 있습니다.
2. **이미지 크기 최적화**: 대규모 이미지가 필요하지 않은 경우 `megapixels` 옵션을 "0.25"로 설정하여 처리 시간을 단축할 수 있습니다.
3. **go_fast 옵션 활용**: 기본값인 `true`로 두면 더 빠른 이미지 생성이 가능합니다.

---

이 가이드가 Next.js 프로젝트에서 Replicate Flux 모델을 사용하는 데 도움이 되길 바랍니다. 추가 질문이나 피드백이 있으면 언제든지 문의하세요. 