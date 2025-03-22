'use client';

import { useState, useEffect } from 'react';
import { Loader2, Download, Save, Share, ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import ShareModal from '@/components/ShareModal';
import ImageModal from '@/components/ImageModal';
import { Label } from "@/components/ui/label";
import { toast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { 
  IImageStyle, 
  IShareData, 
  ISelectOption, 
  TShareToCommunityResponse 
} from '@/types';
import { generateImage, saveToGallery, handleShareToCommuity } from '@/utils/api';
import { downloadImage } from '@/utils/downloadImage';
import { useUser } from '@clerk/nextjs';
import { 
  colorOptions, 
  textureOptions, 
  moodOptions, 
  styleTypeOptions,
  logoColorOptions,
  logoTextureOptions,
  logoMoodOptions
} from '@/utils/mockData';

export default function CreatePage() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  
  // 상태 관리
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<IImageStyle>({
    styleType: 'general',
    color: 'bright',
    texture: 'smooth',
    mood: 'warm',
    intensity: 50,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [promptError, setPromptError] = useState('');

  // URL에서 프롬프트 파라미터 읽어오기
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam) {
      setPrompt(promptParam);
      // 글자 수 검증
      if (promptParam.length < 10) {
        setPromptError('최소 10자 이상 입력해주세요.');
      } else {
        setPromptError('');
      }
    }
    
    // 로그인한 사용자 정보 확인
    if (user) {
      console.log(`인증된 사용자: ${user.firstName} ${user.lastName || ''} (${user.primaryEmailAddress?.emailAddress})`);
      
      // 사용자 정보를 활용하여 추가 기능을 구현할 수 있습니다.
      toast({
        description: `${user.firstName || '사용자'}님, 멋진 이미지를 생성해보세요!`,
        duration: 3000,
      });
    }
  }, [searchParams, user]);

  // 프롬프트 입력 처리
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (e.target.value.length < 10) {
      setPromptError('최소 10자 이상 입력해주세요.');
    } else {
      setPromptError('');
    }
  };

  // 스타일 옵션 변경 처리
  const handleStyleChange = (name: keyof IImageStyle, value: string | number) => {
    setStyle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // select 변경 이벤트 처리
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, name: keyof IImageStyle) => {
    handleStyleChange(name, e.target.value);
  };

  // 슬라이더 변경 이벤트 처리
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleStyleChange('intensity', parseInt(e.target.value));
  };

  // 스타일 타입에 따른 옵션 가져오기
  const getStyleOptions = (type: string) => {
    switch (type) {
      case 'logo':
        return {
          colorOpts: logoColorOptions,
          textureOpts: logoTextureOptions,
          moodOpts: logoMoodOptions
        };
      case 'general':
      default:
        return {
          colorOpts: colorOptions,
          textureOpts: textureOptions,
          moodOpts: moodOptions
        };
    }
  };

  // 현재 스타일 타입에 따른 옵션 가져오기
  const currentStyleOptions = getStyleOptions(style.styleType);

  // 이미지 생성 처리
  const handleGenerateImage = async () => {
    if (prompt.length < 10) {
      setPromptError('최소 10자 이상 입력해주세요.');
      return;
    }

    try {
      setIsGenerating(true);
      setGeneratedImage(null);
      setImageLoadError(false);
      
      const response = await generateImage(prompt, style);
      
      if (response.success && response.imageURL) {
        // 이미지 URL이 유효한지 확인
        setIsImageLoading(true);
        
        // 이미지가 미리 캐시되도록 시도
        const img = new Image();
        img.onload = () => {
          setGeneratedImage(response.imageURL);
          setIsImageLoading(false);
          toast({
            description: "이미지가 생성되었습니다!",
          });
        };
        img.onerror = () => {
          console.error('이미지 로드 실패:', response.imageURL);
          setImageLoadError(true);
          setIsImageLoading(false);
          toast({
            variant: "destructive",
            description: "이미지 로드에 실패했습니다. 다시 시도해주세요.",
          });
        };
        img.src = response.imageURL;
      } else {
        const errorMessage = response.error?.message || '이미지 생성에 실패했습니다. 다시 시도해주세요.';
        toast({
          variant: "destructive",
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      toast({
        variant: "destructive",
        description: "이미지 생성 중 오류가 발생했습니다.",
      });
      setImageLoadError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // 갤러리 저장 처리
  const handleSaveToGallery = async () => {
    if (!generatedImage) return;
    
    try {
      const response = await saveToGallery(generatedImage, prompt, style);
      
      if (response.success) {
        toast({
          description: "갤러리에 저장되었습니다!",
        });
      } else {
        const errorMessage = response.error?.message || '갤러리 저장에 실패했습니다.';
        toast({
          variant: "destructive",
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error('갤러리 저장 오류:', error);
      toast({
        variant: "destructive",
        description: "갤러리 저장 중 오류가 발생했습니다.",
      });
    }
  };

  // 커뮤니티 공유 처리
  const handleShare = async (shareData: IShareData): Promise<TShareToCommunityResponse> => {
    if (!generatedImage) {
      return {
        success: false,
        error: {
          code: 'NO_IMAGE',
          message: '생성된 이미지가 없습니다.'
        }
      };
    }
    
    try {
      const response = await handleShareToCommuity(
        generatedImage,
        prompt,
        style,
        shareData
      );
      
      if (response.success) {
        toast({
          description: "커뮤니티에 공유되었습니다!",
        });
        setIsShareModalOpen(false);
      } else {
        toast({
          variant: "destructive",
          description: response.error?.message || '공유에 실패했습니다.',
        });
      }
      
      return {
        success: response.success,
        data: response.success ? { postId: response.postId } : undefined,
        error: !response.success ? { code: 'SHARE_ERROR', message: response.error?.message || '공유에 실패했습니다.' } : undefined
      };
    } catch (error) {
      console.error('공유 오류:', error);
      toast({
        variant: "destructive",
        description: "공유 중 오류가 발생했습니다.",
      });
      
      return {
        success: false,
        error: {
          code: 'SHARE_ERROR',
          message: '공유 중 오류가 발생했습니다.'
        }
      };
    }
  };

  // 이미지 다운로드 처리
  const handleDownload = async (): Promise<void> => {
    if (!generatedImage) return;
    
    try {
      setIsDownloading(true);
      await downloadImage(generatedImage);
      toast({
        description: "이미지가 다운로드되었습니다!",
      });
    } catch (error) {
      console.error('다운로드 오류:', error);
      toast({
        variant: "destructive",
        description: "다운로드 중 오류가 발생했습니다.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI 이미지 생성</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 좌측 컨트롤 패널 */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">이미지 설명 입력</h2>
            <Textarea 
              placeholder="생성하고 싶은 이미지를 자세히 설명해주세요. (최소 10자 이상)"
              value={prompt}
              onChange={handlePromptChange}
              className="min-h-[120px] mb-2"
            />
            {promptError && <p className="text-red-500 text-sm">{promptError}</p>}
            
            <Button 
              onClick={handleGenerateImage} 
              disabled={isGenerating || prompt.length < 10}
              className="w-full mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : '이미지 생성하기'}
            </Button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">스타일 설정</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="style-type-select" className="text-sm font-medium mb-1 block">
                  스타일 타입
                </Label>
                <select
                  id="style-type-select"
                  value={style.styleType}
                  onChange={(e) => handleSelectChange(e, 'styleType')}
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {styleTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="color-select" className="text-sm font-medium mb-1 block">
                  색감
                </Label>
                <select
                  id="color-select"
                  value={style.color}
                  onChange={(e) => handleSelectChange(e, 'color')}
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {currentStyleOptions.colorOpts.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="texture-select" className="text-sm font-medium mb-1 block">
                  텍스처
                </Label>
                <select
                  id="texture-select"
                  value={style.texture}
                  onChange={(e) => handleSelectChange(e, 'texture')}
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {currentStyleOptions.textureOpts.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="mood-select" className="text-sm font-medium mb-1 block">
                  분위기
                </Label>
                <select
                  id="mood-select"
                  value={style.mood}
                  onChange={(e) => handleSelectChange(e, 'mood')}
                  className="w-full flex h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {currentStyleOptions.moodOpts.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label htmlFor="intensity" className="text-sm font-medium">
                    스타일 강도
                  </Label>
                  <span className="text-sm text-gray-500">{style.intensity}%</span>
                </div>
                <Slider
                  id="intensity"
                  min={0}
                  max={100}
                  step={5}
                  value={style.intensity}
                  onChange={handleSliderChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* 우측 미리보기 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">생성된 이미지</h2>
          
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
            {generatedImage ? (
              <img 
                src={generatedImage} 
                alt="생성된 이미지" 
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setIsImageModalOpen(true)}
              />
            ) : isImageLoading ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                <p className="text-gray-500">이미지 로딩 중...</p>
              </div>
            ) : imageLoadError ? (
              <div className="text-center p-4">
                <p className="text-red-500 mb-2">이미지 로드에 실패했습니다</p>
                <Button variant="outline" onClick={handleGenerateImage}>
                  다시 시도
                </Button>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <ImageIcon className="h-20 w-20 mx-auto mb-4 opacity-20" />
                <p>이미지를 생성하면 여기에 표시됩니다</p>
              </div>
            )}
          </div>
          
          {generatedImage && (
            <div className="flex space-x-2 mt-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    다운로드 중...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    다운로드
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleSaveToGallery}
              >
                <Save className="mr-2 h-4 w-4" />
                갤러리에 저장
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setIsShareModalOpen(true)}
              >
                <Share className="mr-2 h-4 w-4" />
                공유하기
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* 모달 컴포넌트들 */}
      {generatedImage && (
        <>
          <ShareModal 
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            image={{
              id: 'temp-id', // 임시 ID
              imageURL: generatedImage,
              prompt: prompt,
              style: style,
              createdAt: new Date().toISOString(),
              tags: [], // 빈 태그 배열 기본값 설정
              categoryId: 'uncategorized',
            }}
            onShare={handleShare}
          />
          
          <ImageModal 
            isOpen={isImageModalOpen}
            onClose={() => setIsImageModalOpen(false)}
            imageURL={generatedImage}
          />
        </>
      )}
    </div>
  );
} 