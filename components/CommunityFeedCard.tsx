import { useState, useCallback } from "react";
import Link from "next/link";
import { IPost, ICommunityFeedCardProps } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Heart, MessageCircle, Bookmark, ImageIcon, LogIn } from "lucide-react";
import CommentModal from "./CommentModal";
import { toggleLike, toggleScrap, addComment } from "@/utils/api";
import { useAuth } from "@clerk/nextjs";
import { toast } from "@/components/ui/use-toast";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function CommunityFeedCard({ post: initialPost }: ICommunityFeedCardProps) {
  // Clerk 인증 상태 가져오기
  const { isLoaded, isSignedIn } = useAuth();
  
  // 로컬 상태로 게시물 데이터 관리
  const [post, setPost] = useState<IPost>(initialPost);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  // 로그인 체크 함수
  const checkLoginStatus = (e: React.MouseEvent) => {
    e.preventDefault(); // Link의 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (!isLoaded) return false; // 로딩 중이면 처리하지 않음
    
    if (!isSignedIn) {
      // 로그인이 필요하다는 메시지 표시
      toast({
        title: "로그인이 필요합니다",
        description: "이 기능을 사용하려면 로그인이 필요합니다.",
        duration: 3000,
      });
      return false;
    }
    
    return true;
  };

  // 좋아요 토글 처리
  const handleLikeToggle = async (e: React.MouseEvent) => {
    if (!checkLoginStatus(e) || isLikeLoading) return;
    
    setIsLikeLoading(true);
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
      setIsLikeLoading(false);
    }
  };
  
  // 스크랩 토글 처리
  const handleScrapToggle = async (e: React.MouseEvent) => {
    if (!checkLoginStatus(e) || isScrapLoading) return;
    
    setIsScrapLoading(true);
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
      setIsScrapLoading(false);
    }
  };
  
  // 댓글 모달 열기
  const handleOpenCommentModal = (e: React.MouseEvent) => {
    if (!checkLoginStatus(e)) return;
    
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

  // 포스트 상세 페이지로 이동 처리
  const handleCardClick = (e: React.MouseEvent) => {
    // 카드 클릭 시 기본 동작 유지 (링크 이동)
  };

  // 날짜 포맷팅
  const formattedDate = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: ko
  });

  // 로그인 상태에 따른 좋아요/스크랩 상태 표시
  const renderLikeStatus = () => {
    if (!isSignedIn) {
      return false; // 로그인되지 않은 상태에서는 항상 좋아요 안 된 상태로 표시
    }
    return isLiked;
  };

  const renderScrapStatus = () => {
    if (!isSignedIn) {
      return false; // 로그인되지 않은 상태에서는 항상 스크랩 안 된 상태로 표시
    }
    return isScrapped;
  };

  return (
    <>
      <Link href={`/post/${postId}`}>
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]" onClick={handleCardClick}>
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
                className={`flex items-center gap-1 ${isSignedIn ? 'hover:text-[#4A90E2]' : 'cursor-pointer'} transition-colors`}
                onClick={handleLikeToggle}
                disabled={isLikeLoading}
              >
                <Heart 
                  className={`h-4 w-4 ${renderLikeStatus() ? 'fill-red-500 text-red-500' : 'text-gray-500'} 
                             ${isLikeLoading ? 'opacity-50' : isSignedIn ? 'hover:scale-110 transition-transform' : ''}`} 
                />
                <span>{likes}</span>
              </button>
              <button 
                className={`flex items-center gap-1 ${isSignedIn ? 'hover:text-[#4A90E2]' : 'cursor-pointer'} transition-colors`}
                onClick={handleOpenCommentModal}
              >
                <MessageCircle className={`h-4 w-4 text-gray-500 ${isSignedIn ? 'hover:scale-110 transition-transform' : ''}`} />
                <span>{comments}</span>
              </button>
            </div>
            <button 
              className={`flex items-center ${isSignedIn ? 'hover:text-[#4A90E2]' : 'cursor-pointer'} transition-colors`}
              onClick={handleScrapToggle}
              disabled={isScrapLoading}
            >
              <Bookmark 
                className={`h-4 w-4 ${renderScrapStatus() ? 'fill-blue-500 text-blue-500' : 'text-gray-500'}
                           ${isScrapLoading ? 'opacity-50' : isSignedIn ? 'hover:scale-110 transition-transform' : ''}`} 
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