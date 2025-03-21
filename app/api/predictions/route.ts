import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import { IFluxModelInput, IPredictionInput, IPredictionOutput } from '@/types/replicate';

// API 요청 시간 제한 설정 (5분)
export const maxDuration = 300;

// API 요청 처리를 위한 설정
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * 스타일 옵션을 Flux 모델 입력으로 변환하는 함수
 */
function mapStyleToFluxOptions(style?: IPredictionInput['style']): Partial<IFluxModelInput> {
  if (!style) return {};
  
  // 기본 Flux 모델 옵션
  const fluxOptions: Partial<IFluxModelInput> = {
    num_inference_steps: 4,
    output_format: 'webp',
    output_quality: 90,
    go_fast: true,
  };
  
  // 색감(color)에 따른 설정
  if (style.color) {
    // 프롬프트에 색감 정보 추가를 위한 매핑
    const colorModifiers: Record<string, string> = {
      'bright': 'bright, vivid, well-lit',
      'dark': 'dark, moody, low-key lighting',
      'vivid': 'vibrant, highly saturated colors',
      'pastel': 'soft pastel colors, gentle hues',
      'monochrome': 'monochromatic, grayscale',
    };
    
    // 색감에 따른 aspect_ratio 설정 (선택적)
    if (style.color === 'bright' || style.color === 'vivid') {
      fluxOptions.aspect_ratio = '16:9';
    } else if (style.color === 'dark' || style.color === 'monochrome') {
      fluxOptions.aspect_ratio = '1:1';
    } else {
      fluxOptions.aspect_ratio = '3:2';
    }
    
    // 모델 프롬프트에 색감 정보 추가
    if (colorModifiers[style.color]) {
      // 프롬프트 확장은 실제 구현에서 처리
    }
  }
  
  // 텍스처(texture)에 따른 설정
  if (style.texture) {
    // 텍스처에 따른 품질 조정
    const textureMapping: Record<string, number> = {
      'smooth': 95, // 부드러운 텍스처는 높은 품질로
      'rough': 85,  // 거친 텍스처는 중간 품질로
      'grainy': 80, // 입자감 있는 텍스처는 약간 낮은 품질로
      'glossy': 90, // 광택 있는 텍스처는 높은 품질로
    };
    
    if (textureMapping[style.texture]) {
      fluxOptions.output_quality = textureMapping[style.texture];
    }
  }
  
  // 분위기(mood)에 따른 설정
  if (style.mood) {
    // 다양한 분위기에 맞는 랜덤 시드 설정 (일관된 분위기 생성을 위해)
    const moodSeeds: Record<string, number> = {
      'warm': 42,
      'cool': 123,
      'dreamlike': 789,
      'realistic': 555,
    };
    
    if (moodSeeds[style.mood]) {
      fluxOptions.seed = moodSeeds[style.mood];
    }
  }
  
  // 강도(intensity)에 따른 설정
  if (style.intensity !== undefined) {
    // 강도에 따른 품질 및 스텝 조정
    if (style.intensity > 75) {
      fluxOptions.num_inference_steps = 4;
      fluxOptions.megapixels = '1';
      fluxOptions.output_quality = 95;
    } else if (style.intensity > 50) {
      fluxOptions.num_inference_steps = 3;
      fluxOptions.megapixels = '1';
      fluxOptions.output_quality = 90;
    } else if (style.intensity > 25) {
      fluxOptions.num_inference_steps = 2;
      fluxOptions.megapixels = '0.25';
      fluxOptions.output_quality = 85;
    } else {
      fluxOptions.num_inference_steps = 1;
      fluxOptions.megapixels = '0.25';
      fluxOptions.output_quality = 80;
    }
  }
  
  console.log('스타일 옵션이 적용된 Flux 설정:', fluxOptions);
  return fluxOptions;
}

/**
 * 프롬프트를 스타일 정보에 따라 강화하는 함수
 */
function enhancePromptWithStyle(originalPrompt: string, style?: IPredictionInput['style']): string {
  if (!style) return originalPrompt;
  
  let enhancedPrompt = originalPrompt;
  let styleDescriptions = [];
  
  // 색감 정보 추가
  if (style.color) {
    const colorMap: Record<string, string> = {
      'bright': 'bright, vivid colors, well-lit scene',
      'dark': 'dark, moody atmosphere, low-key lighting',
      'vivid': 'vibrant, highly saturated colors, high contrast',
      'pastel': 'soft pastel colors, gentle hues, delicate tones',
      'monochrome': 'monochromatic, grayscale, single color tones'
    };
    
    if (colorMap[style.color]) {
      styleDescriptions.push(colorMap[style.color]);
    }
  }
  
  // 텍스처 정보 추가
  if (style.texture) {
    const textureMap: Record<string, string> = {
      'smooth': 'smooth texture, clean surfaces, polished look',
      'rough': 'rough texture, tactile surfaces, rugged appearance',
      'grainy': 'grainy texture, fine particles, film grain effect',
      'glossy': 'glossy finish, reflective surfaces, shiny appearance'
    };
    
    if (textureMap[style.texture]) {
      styleDescriptions.push(textureMap[style.texture]);
    }
  }
  
  // 분위기 정보 추가
  if (style.mood) {
    const moodMap: Record<string, string> = {
      'warm': 'warm atmosphere, cozy feeling, golden hour lighting',
      'cool': 'cool atmosphere, calm feeling, blue tones',
      'dreamlike': 'dreamlike, ethereal, surreal, mystical atmosphere',
      'realistic': 'realistic, photorealistic, lifelike, authentic'
    };
    
    if (moodMap[style.mood]) {
      styleDescriptions.push(moodMap[style.mood]);
    }
  }
  
  // 강도에 따른 스타일 강화 문구 추가
  if (style.intensity !== undefined) {
    // 강도가 높을수록 더 강한 스타일링 용어 사용
    const intensityPhrase = style.intensity > 75 
      ? 'highly detailed, intricate, masterful execution' 
      : style.intensity > 50
        ? 'detailed, well-crafted, professional look'
        : style.intensity > 25
          ? 'moderately detailed, balanced style'
          : 'simple, clean, minimal details';
    
    styleDescriptions.push(intensityPhrase);
  }
  
  // 스타일 설명을 프롬프트에 추가
  if (styleDescriptions.length > 0) {
    enhancedPrompt = `${enhancedPrompt}, ${styleDescriptions.join(', ')}`;
  }
  
  console.log('원본 프롬프트:', originalPrompt);
  console.log('강화된 프롬프트:', enhancedPrompt);
  
  return enhancedPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, style } = await request.json() as IPredictionInput;
    console.log('이미지 생성 요청 받음:', { prompt, style });

    // API 키가 없으면 에러 반환
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

    // 프롬프트 검증
    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'invalid_prompt', 
            message: '프롬프트는 최소 10자 이상이어야 합니다.' 
          } 
        } as IPredictionOutput,
        { status: 400 }
      );
    }

    // API 키로 Replicate 클라이언트 초기화
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log('Replicate 클라이언트 초기화 완료');
    
    try {
      // 스타일 설정을 Flux 모델 옵션으로 변환
      const fluxOptions = mapStyleToFluxOptions(style);
      
      // 프롬프트에 스타일 정보 반영
      const enhancedPrompt = enhancePromptWithStyle(prompt, style);
      
      // 예측 생성
      console.log('이미지 생성 시작...', { 
        prompt: enhancedPrompt, 
        ...fluxOptions 
      });
      
      const prediction = await replicate.predictions.create({
        model: "black-forest-labs/flux-schnell",
        input: { 
          prompt: enhancedPrompt,
          ...fluxOptions
        }
      });
      
      console.log('이미지 생성 요청 완료:', prediction);

      // 예측 결과 반환
      return NextResponse.json({ 
        success: true, 
        prediction
      } as IPredictionOutput, { status: 201 });
      
    } catch (modelError: any) {
      console.error('모델 실행 오류:', modelError);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'model_error', 
            message: `모델 실행 오류: ${modelError.message || '알 수 없는 오류'}` 
          } 
        } as IPredictionOutput,
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('일반 오류:', error);
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