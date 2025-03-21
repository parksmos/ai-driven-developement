import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { IPredictionOutput } from '@/types/replicate';

// API 요청 처리를 위한 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`예측 상태 확인 요청: ID=${id}`);

    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('REPLICATE_API_TOKEN이 설정되지 않음');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'config_error', 
            message: 'Replicate API 토큰이 설정되지 않았습니다.' 
          } 
        } as IPredictionOutput,
        { status: 500 }
      );
    }

    // API 키로 Replicate 클라이언트 초기화
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // 예측 상태 확인
    const prediction = await replicate.predictions.get(id);
    console.log(`예측 상태: status=${prediction.status}`);

    // 성공 시 이미지 URL 추출
    let imageURL = null;
    if (prediction.status === 'succeeded' && prediction.output) {
      if (Array.isArray(prediction.output)) {
        // 여러 이미지 중 마지막 이미지 사용
        imageURL = prediction.output[prediction.output.length - 1];
      } else if (typeof prediction.output === 'string') {
        imageURL = prediction.output;
      }
    }

    // 응답 데이터 구성
    const response: IPredictionOutput = {
      success: prediction.status !== 'failed',
      prediction,
    };

    // 이미지 URL이 있으면 data 필드에 추가
    if (imageURL) {
      response.data = { imageURL };
    }

    // 오류가 있으면 error 필드에 추가
    if (prediction.error) {
      response.error = {
        code: 'model_error',
        message: prediction.error
      };
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('상태 확인 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'server_error', 
          message: `서버 오류: ${error.message || '알 수 없는 오류'}` 
        } 
      } as IPredictionOutput,
      { status: 500 }
    );
  }
} 