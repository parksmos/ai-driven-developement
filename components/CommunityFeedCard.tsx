import { useState, useCallback } from "react";
import Link from "next/link";
import { IPost } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, MessageCircle, Bookmark, ImageIcon } from "lucide-react";
import CommentModal from "./CommentModal";
import { toggleLike, toggleScrap, addComment } from "@/utils/api";

interface ICommunityFeedCardProps {
  post: IPost;
}

export default function CommunityFeedCard({ post: initialPost }: ICommunityFeedCardProps) {
  // 로컬 상태로 게시물 데이터 관리
  const [post, setPost] = useState<IPost>(initialPost);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    postId,
    imageURL,
    userName,
    createdAt,
    likes,
    comments,
    scraps,
    isLiked,
    isScrapped
  } = post;

  // 좋아요 토글 처리
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await toggleLike(postId);
      if (result.success) {
        setPost(prev => ({
          ...prev,
          isLiked: result.isLiked,
          likes: result.likes
        }));
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 스크랩 토글 처리
  const handleScrapToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await toggleScrap(postId);
      if (result.success) {
        setPost(prev => ({
          ...prev,
          isScrapped: result.isScrapped,
          scraps: result.scraps
        }));
      }
    } catch (error) {
      console.error("스크랩 처리 중 오류가 발생했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 댓글 모달 열기
  const handleOpenCommentModal = (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    setIsCommentModalOpen(true);
  };
  
  // 댓글 추가 처리
  const handleAddComment = useCallback(async (content: string) => {
    try {
      const result = await addComment(postId, content);
      if (result.success) {
        setPost(prev => ({
          ...prev,
          comments: prev.comments + 1
        }));
      }
      return Promise.resolve();
    } catch (error) {
      console.error("댓글 추가 중 오류가 발생했습니다:", error);
      return Promise.reject(error);
    }
  }, [postId]);

  // 날짜 포맷팅
  const formattedDate = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ko
  });

  return (
    <>
      <Link href={`/post/${postId}`}>
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
          <div className="relative aspect-square w-full bg-gray-100 flex items-center justify-center">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-2 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                <ImageIcon className="w-10 h-10 text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">이미지를 불러올 수 없습니다</p>
              </div>
            )}
            
            <img
              src={imageURL}
              alt={`${userName}님의 이미지`}
              className={`object-cover w-full h-full transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          </div>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="font-semibold">{userName}</div>
              <div className="text-xs text-gray-500">{formattedDate}</div>
            </div>
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-between">
            <div className="flex items-center gap-4 text-sm">
              <button 
                className="flex items-center gap-1 hover:text-[#4A90E2] transition-colors"
                onClick={handleLikeToggle}
                disabled={isLoading}
              >
                <Heart 
                  className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'} 
                             ${isLoading ? 'opacity-50' : 'hover:scale-110 transition-transform'}`} 
                />
                <span>{likes}</span>
              </button>
              <button 
                className="flex items-center gap-1 hover:text-[#4A90E2] transition-colors"
                onClick={handleOpenCommentModal}
              >
                <MessageCircle className="h-4 w-4 text-gray-500 hover:scale-110 transition-transform" />
                <span>{comments}</span>
              </button>
            </div>
            <button 
              className="flex items-center hover:text-[#4A90E2] transition-colors"
              onClick={handleScrapToggle}
              disabled={isLoading}
            >
              <Bookmark 
                className={`h-4 w-4 ${isScrapped ? 'fill-blue-500 text-blue-500' : 'text-gray-500'}
                           ${isLoading ? 'opacity-50' : 'hover:scale-110 transition-transform'}`} 
              />
              <span className="ml-1 text-sm">{scraps}</span>
            </button>
          </CardFooter>
        </Card>
      </Link>
      
      {/* 댓글 모달 */}
      <CommentModal 
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        post={post}
        onAddComment={handleAddComment}
      />
    </>
  );
} 