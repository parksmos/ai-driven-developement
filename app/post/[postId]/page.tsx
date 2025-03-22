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
import { useAuth } from "@clerk/nextjs";
import { toast } from "@/components/ui/use-toast";
import { SignInButton } from "@clerk/nextjs";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;
  
  const { isLoaded, isSignedIn } = useAuth();

  const [post, setPost] = useState<IPost | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

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

  // 로그인 확인 함수
  const checkLoginStatus = () => {
    if (!isLoaded) return false;
    
    if (!isSignedIn) {
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
  const handleLikeToggle = async () => {
    if (!checkLoginStatus()) return;
    
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
    if (!checkLoginStatus()) return;
    
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
    
    if (!checkLoginStatus()) return;
    
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

  // 로그인 상태에 따른 좋아요/스크랩 상태 표시
  const renderLikeStatus = () => {
    if (!isSignedIn) {
      return false; // 로그인되지 않은 상태에서는 항상 좋아요 안 된 상태로 표시
    }
    return post.isLiked;
  };

  const renderScrapStatus = () => {
    if (!isSignedIn) {
      return false; // 로그인되지 않은 상태에서는 항상 스크랩 안 된 상태로 표시
    }
    return post.isScrapped;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleGoBack}
        className="mb-4 hover:bg-gray-100"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        돌아가기
      </Button>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-[#4A90E2]" />
        </div>
      ) : post ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="relative aspect-video bg-gray-100">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {imageError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-400" />
                <p className="text-gray-500 mt-4">이미지를 불러올 수 없습니다</p>
              </div>
            )}
            
            <img
              src={post.imageURL}
              alt={`${post.userName}님의 이미지`}
              className={`w-full h-full object-contain ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{post.userName}님의 작품</h1>
                <p className="text-gray-600 text-sm mb-3">
                  {formattedDate}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.share) {
                      navigator.share({
                        title: `${post.userName}님의 작품`,
                        url: window.location.href
                      }).catch(err => console.error('공유 실패:', err));
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      setShowShareToast(true);
                      setTimeout(() => setShowShareToast(false), 2000);
                    }
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  공유
                </Button>
              </div>
            </div>
            
            {showShareToast && (
              <div className="bg-gray-800 text-white px-4 py-2 rounded text-sm fixed bottom-4 right-4 z-50">
                링크가 클립보드에 복사되었습니다.
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">프롬프트</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{post.prompt}</p>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex gap-4">
                <button 
                  className={`flex items-center gap-1 ${isSignedIn ? 'hover:text-[#4A90E2]' : ''} transition-colors`}
                  onClick={handleLikeToggle}
                  disabled={isLoadingAction || !isSignedIn}
                >
                  <Heart 
                    className={`h-5 w-5 ${renderLikeStatus() ? 'fill-red-500 text-red-500' : 'text-gray-500'} 
                               ${isLoadingAction ? 'opacity-50' : isSignedIn ? 'hover:scale-110 transition-transform' : ''}`} 
                  />
                  <span>{post.likes}</span>
                </button>
                
                <button 
                  className={`flex items-center gap-1 ${isSignedIn ? 'hover:text-[#4A90E2]' : ''} transition-colors`}
                  onClick={handleScrapToggle}
                  disabled={isLoadingAction || !isSignedIn}
                >
                  <Bookmark 
                    className={`h-5 w-5 ${renderScrapStatus() ? 'fill-blue-500 text-blue-500' : 'text-gray-500'} 
                               ${isLoadingAction ? 'opacity-50' : isSignedIn ? 'hover:scale-110 transition-transform' : ''}`} 
                  />
                  <span>{post.scraps}</span>
                </button>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageCircle className="h-5 w-5 text-gray-500" />
                <span>{comments.length}</span>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">댓글 {comments.length}개</h2>
              
              {isSignedIn ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="댓글을 작성해주세요..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={isSendingComment}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isSendingComment || !newComment.trim()}
                    >
                      {isSendingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : "등록"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg mb-6">
                  <p className="text-gray-500">댓글을 작성하려면 로그인이 필요합니다.</p>
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm">
                      로그인하기
                    </Button>
                  </SignInButton>
                </div>
              )}
              
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="border-b border-gray-100 pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{comment.userName}</div>
                          <div className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">게시물을 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">요청하신 게시물이 존재하지 않거나 삭제되었을 수 있습니다.</p>
            <Button onClick={handleGoBack}>메인으로 돌아가기</Button>
          </div>
        </div>
      )}
    </div>
  );
} 