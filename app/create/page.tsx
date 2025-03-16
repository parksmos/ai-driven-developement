'use client';

import { useState, useEffect } from 'react';
import { Loader2, Download, Save, Share } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, ISelectOption } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import ShareModal from '@/components/ShareModal';
import ImageModal from '@/components/ImageModal';
import { IImageStyle, IShareData } from '@/types';
import { generateImage, saveToGallery, handleShareToCommuity } from '@/utils/api';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

// 색감 옵션
const colorOptions: ISelectOption[] = [
  { value: 'bright', label: '밝은' },
  { value: 'dark', label: '어두운' },
  { value: 'vivid', label: '비비드' },
  { value: 'pastel', label: '파스텔' },
  { value: 'monochrome', label: '모노크롬' },
];

// 텍스처 옵션
const textureOptions: ISelectOption[] = [
  { value: 'smooth', label: '부드러운' },
  { value: 'rough', label: '거친' },
  { value: 'matte', label: '매트' },
  { value: 'glossy', label: '광택' },
];

// 분위기 옵션
const moodOptions: ISelectOption[] = [
  { value: 'warm', label: '따뜻한' },
  { value: 'cool', label: '차가운' },
  { value: 'dreamy', label: '몽환적' },
  { value: 'realistic', label: '사실적' },
];

export default function CreatePage() {
  const searchParams = useSearchParams();
  
  // 상태 관리
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<IImageStyle>({
    color: 'bright',
    texture: 'smooth',
    mood: 'warm',
    intensity: 50,
  });
  const [isGenerating, setIsGenerating] = useState(false);
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
  }, [searchParams]);

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
          toast.success('이미지가 생성되었습니다!');
        };
        img.onerror = () => {
          console.error('Image failed to load:', response.imageURL);
          setImageLoadError(true);
          setIsImageLoading(false);
          toast.error('이미지 로드에 실패했습니다. 다시 시도해주세요.');
        };
        img.src = response.imageURL;
      } else {
        toast.error('이미지 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error('이미지 생성 중 오류가 발생했습니다.');
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
        toast.success('갤러리에 저장되었습니다!');
      } else {
        toast.error('갤러리 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Gallery save error:', error);
      toast.error('갤러리 저장 중 오류가 발생했습니다.');
    }
  };

  // 커뮤니티 공유 처리
  const handleShare = async (shareData: IShareData) => {
    if (!generatedImage) return { success: false, postId: '' };
    
    try {
      const response = await handleShareToCommuity(
        generatedImage,
        prompt,
        style,
        shareData
      );
      
      if (response.success) {
        toast.success('커뮤니티에 공유되었습니다!');
      }
      
      return response;
    } catch (error) {
      console.error('Share error:', error);
      toast.error('공유 중 오류가 발생했습니다.');
      return { success: false, postId: '' };
    }
  };

  // 이미지 다운로드 처리
  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `artify-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 포커스 처리
  useEffect(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">이미지 생성</h1>
      
      {/* 프롬프트 입력 섹션 */}
      <div className="mb-6">
        <Textarea
          label="프롬프트"
          placeholder="원하는 이미지를 자세히 설명해보세요..."
          value={prompt}
          onChange={handlePromptChange}
          maxLength={500}
          showCharCount
          error={promptError}
          className="font-medium"
        />
      </div>
      
      {/* 스타일 옵션 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          label="색감"
          options={colorOptions}
          value={style.color}
          onChange={(e) => handleStyleChange('color', e.target.value)}
        />
        <Select
          label="텍스처"
          options={textureOptions}
          value={style.texture}
          onChange={(e) => handleStyleChange('texture', e.target.value)}
        />
        <Select
          label="분위기"
          options={moodOptions}
          value={style.mood}
          onChange={(e) => handleStyleChange('mood', e.target.value)}
        />
      </div>
      
      <div className="mb-6">
        <Slider
          label="스타일 강도"
          min={0}
          max={100}
          step={1}
          value={style.intensity}
          onChange={(e) => handleStyleChange('intensity', parseInt(e.target.value))}
          showValue
          valueSuffix="%"
        />
      </div>
      
      {/* 이미지 생성 버튼 */}
      <div className="mb-8">
        <Button
          onClick={handleGenerateImage}
          disabled={isGenerating || prompt.length < 10}
          className="w-full py-6 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              이미지 생성 중...
            </>
          ) : '이미지 생성하기'}
        </Button>
      </div>
      
      {/* 이미지 결과 섹션 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">생성 결과</h2>
        
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          {isGenerating || isImageLoading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500">{isGenerating ? '이미지 생성 중...' : '이미지 로딩 중...'}</p>
            </div>
          ) : imageLoadError ? (
            <div className="flex flex-col items-center justify-center h-96 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>이미지 로드에 실패했습니다</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                onClick={handleGenerateImage}
              >
                다시 시도
              </button>
            </div>
          ) : generatedImage ? (
            <div className="relative">
              <img
                src={generatedImage}
                alt="생성된 이미지"
                className="w-full h-auto max-h-96 object-contain cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setIsImageModalOpen(true)}
                onError={() => {
                  setImageLoadError(true);
                  toast.error('이미지 로드에 실패했습니다.');
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>여기에 생성된 이미지가 표시됩니다</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 저장 및 공유 버튼 */}
      {generatedImage && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={handleSaveToGallery}
            className="flex-1"
          >
            <Save className="mr-2 h-5 w-5" />
            갤러리에 저장
          </Button>
          <Button
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1"
          >
            <Share className="mr-2 h-5 w-5" />
            커뮤니티에 공유
          </Button>
          <Button
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-5 w-5" />
            다운로드
          </Button>
        </div>
      )}
      
      {/* 모달 */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        imageURL={generatedImage || ''}
        prompt={prompt}
        style={style}
        onShare={handleShare}
      />
      
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageURL={generatedImage || ''}
      />
    </div>
  );
} 