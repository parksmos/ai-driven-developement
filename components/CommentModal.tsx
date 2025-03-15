import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { IComment, IPost } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface ICommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: IPost;
  onAddComment: (content: string) => Promise<void>;
}

export default function CommentModal({ isOpen, onClose, post, onAddComment }: ICommentModalProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 모달이 열릴 때 댓글 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, post.postId]);

  // 목업 댓글 로드 함수
  const loadComments = async () => {
    setIsLoading(true);
    try {
      // 목업 댓글 데이터 생성
      const mockComments: IComment[] = [
        {
          id: "1",
          content: "정말 멋진 작품이네요! 어떤 프롬프트를 사용하셨나요?",
          userName: "예술애호가",
          userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Emma",
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2시간 전
        },
        {
          id: "2",
          content: "색감이 너무 아름다워요. 저도 비슷한 스타일로 만들어보고 싶어요.",
          userName: "디자인학도",
          userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5시간 전
        },
        {
          id: "3", 
          content: "이런 느낌의 작품을 계속 올려주세요! 팔로우하고 갑니다.",
          userName: "열정아티스트",
          userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia",
          createdAt: new Date(Date.now() - 3600000 * 8).toISOString(), // 8시간 전
        }
      ];
      
      // 지연 효과 추가
      await new Promise(resolve => setTimeout(resolve, 500));
      setComments(mockComments);
    } catch (error) {
      console.error("댓글을 불러오는 중 오류가 발생했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 제출 처리
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSending(true);
    try {
      await onAddComment(newComment);
      
      // 새 댓글 목업 추가
      const newCommentObj: IComment = {
        id: `temp-${Date.now()}`,
        content: newComment,
        userName: "내 계정", // 실제로는 로그인된 사용자 정보를 사용
        userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Me",
        createdAt: new Date().toISOString(),
      };
      
      setComments(prev => [newCommentObj, ...prev]);
      setNewComment("");
    } catch (error) {
      console.error("댓글 작성 중 오류가 발생했습니다:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg">댓글 ({post.comments})</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 댓글 작성 폼 */}
        <form onSubmit={handleSubmitComment} className="p-4 border-b">
          <div className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요"
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isSending || !newComment.trim()}
              className="bg-[#4A90E2] hover:bg-[#3A80D2]"
            >
              등록
            </Button>
          </div>
        </form>
        
        {/* 댓글 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#4A90E2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length > 0 ? (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex items-start gap-2">
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
    </div>
  );
} 