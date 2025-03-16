import { useState } from 'react';
import { IShareModalProps, IShareData } from '@/types';
import { X } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, imageURL, prompt, style, onShare }: IShareModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (!title.trim()) {
        setError('제목을 입력해주세요.');
        setIsLoading(false);
        return;
      }
      
      const shareData: IShareData = {
        title,
        description,
        tags,
        isPublic
      };
      
      const result = await onShare(shareData);
      setIsLoading(false);
      
      if (result.success) {
        onClose();
      } else {
        setError('공유 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('공유 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Share error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">커뮤니티에 공유하기</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 이미지 미리보기 */}
        <div className="mb-4">
          <img
            src={imageURL}
            alt="공유할 이미지"
            className="w-full h-40 object-cover rounded-md"
          />
        </div>
        
        {/* 제목 입력 */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* 설명 입력 */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="작품에 대한 설명을 입력하세요"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
          />
        </div>
        
        {/* 태그 입력 */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">태그</label>
          <div className="flex items-center">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="태그 입력 후 Enter 또는 쉼표 입력"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-md"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 공개 설정 */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-sm">공개 설정</label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="mr-2"
              />
              전체 공개
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="mr-2"
              />
              친구 공개
            </label>
          </div>
        </div>
        
        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 text-red-500 text-sm">{error}</div>
        )}
        
        {/* 공유 버튼 */}
        <button
          onClick={handleShare}
          disabled={isLoading}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:bg-blue-300"
        >
          {isLoading ? '공유 중...' : '공유하기'}
        </button>
      </div>
    </div>
  );
} 