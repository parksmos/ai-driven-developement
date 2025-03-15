"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { IPost, IComment } from "@/types";
import { 
  fetchPostDetail, 
  fetchPostComments, 
  toggleLike, 
  toggleScrap,
  addComment 
} from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  ArrowLeft, 
  ImageIcon,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  
  const [post, setPost] = useState<IPost | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // 포스트 및 댓글 데이터 로드
  useEffect(() => {
    const loadPostData = async () => {
      setIsLoading(true);
      try {
        // 병렬로 데이터 로드
        const [postResult, commentsResult] = await Promise.all([
          fetchPostDetail(postId),
          fetchPostComments(postId)
        ]);
        
        if (postResult.success && postResult.post) {
          setPost(postResult.post);
        } else {
          setError("게시물을 찾을 수 없습니다.");
        }
        
        if (commentsResult.success) {
          setComments(commentsResult.comments);
        }
      } catch (err) {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPostData();
  }, [postId]);

  // 좋아요 토글 처리
  const handleLikeToggle = async () => {
    if (!post || isLoadingAction) return;
    
    setIsLoadingAction(true);
    try {
      const result = await toggleLike(postId);
      if (result.success) {
        setPost(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            isLiked: result.isLiked,
            likes: result.likes
          };
        });
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  // 스크랩 토글 처리
  const handleScrapToggle = async () => {
    if (!post || isLoadingAction) return;
    
    setIsLoadingAction(true);
    try {
      const result = await toggleScrap(postId);
      if (result.success) {
        setPost(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            isScrapped: result.isScrapped,
            scraps: result.scraps
          };
        });
      }
    } catch (error) {
      console.error("스크랩 처리 중 오류가 발생했습니다:", error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  // 댓글 제출 처리
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !newComment.trim() || isSendingComment) return;

    setIsSendingComment(true);
    try {
      const result = await addComment(postId, newComment);
      if (result.success) {
        // 새 댓글 목록에 추가
        setComments(prev => [result.comment, ...prev]);
        // 댓글 수 업데이트
        setPost(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: prev.comments + 1
          };
        });
        setNewComment("");
      }
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
    } finally {
      setIsSendingComment(false);
    }
  };
  
  // 뒤로 가기
  const handleGoBack = () => {
    router.back();
  };

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 text-[#4A90E2] animate-spin mb-4" />
        <p className="text-gray-500">게시물을 불러오는 중입니다...</p>
      </div>
    );
  }

  // 오류 표시
  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-red-500 mb-4">❌</div>
        <p className="text-gray-700 font-semibold">{error || "게시물을 찾을 수 없습니다."}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={handleGoBack}
        >
          뒤로 가기
        </Button>
      </div>
    );
  }

  // 날짜 포맷팅
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-6 flex items-center">
        <button 
          onClick={handleGoBack}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>뒤로</span>
        </button>
        <h1 className="text-2xl font-bold">게시물 상세</h1>
      </div>
      
      {/* 이미지 섹션 */}
      <div className="bg-gray-100 rounded-lg overflow-hidden mb-6 relative">
        <div className="relative aspect-square w-full bg-gray-100 max-h-[600px] flex items-center justify-center">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-10 h-10 border-2 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <ImageIcon className="w-16 h-16 text-gray-400 mb-2" />
              <p className="text-gray-500">이미지를 불러올 수 없습니다</p>
            </div>
          )}
          
          <img
            src={post.imageURL}
            alt={`${post.userName}님의 이미지`}
            className={`object-contain w-full h-full max-h-[600px] transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
        </div>
      </div>
      
      {/* 작성자 정보 및 상호작용 버튼 */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mr-3"
            style={{ backgroundImage: `url(${post.userProfile})`, backgroundSize: 'cover' }}
          ></div>
          <div>
            <div className="font-semibold">{post.userName}</div>
            <div className="text-sm text-gray-500">{formattedDate}</div>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button 
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={handleLikeToggle}
            disabled={isLoadingAction}
          >
            <Heart 
              className={`w-6 h-6 mb-1 ${post.isLiked ? 'fill-red-500' : ''} ${isLoadingAction ? 'opacity-50' : ''}`} 
            />
            <span className="text-xs">{post.likes}</span>
          </button>
          
          <button 
            className="flex flex-col items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs">{post.comments}</span>
          </button>
          
          <button 
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${post.isScrapped ? 'text-blue-500' : 'text-gray-600 hover:bg-gray-100'}`}
            onClick={handleScrapToggle}
            disabled={isLoadingAction}
          >
            <Bookmark 
              className={`w-6 h-6 mb-1 ${post.isScrapped ? 'fill-blue-500' : ''} ${isLoadingAction ? 'opacity-50' : ''}`} 
            />
            <span className="text-xs">{post.scraps}</span>
          </button>
          
          <button 
            className="flex flex-col items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-6 h-6 mb-1" />
            <span className="text-xs">공유</span>
          </button>
        </div>
      </div>
      
      {/* 프롬프트 정보 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">이미지 생성 정보</h2>
        <div className="mb-3">
          <div className="text-sm text-gray-500 mb-1">프롬프트</div>
          <p className="text-gray-900">{post.prompt}</p>
        </div>
        
        {post.styleOptions && (
          <div>
            <div className="text-sm text-gray-500 mb-1">스타일 옵션</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(post.styleOptions).map(([key, value]) => (
                <Badge key={key} variant="outline" className="bg-white">
                  {key}: {value}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 댓글 섹션 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">댓글 {post.comments}개</h2>
        
        {/* 댓글 작성 폼 */}
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요"
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isSendingComment || !newComment.trim()}
              className="bg-[#4A90E2] hover:bg-[#3A80D2]"
            >
              {isSendingComment ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              등록
            </Button>
          </div>
        </form>
        
        {/* 댓글 목록 */}
        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="pb-4 border-b last:border-b-0">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"
                    style={{ backgroundImage: `url(${comment.userProfile})`, backgroundSize: 'cover' }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm">{comment.content}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
        )}
      </div>
    </div>
  );
} 