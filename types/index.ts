export interface IPost {
  postId: string;
  imageURL: string;
  userName: string;
  userProfile?: string;
  createdAt: string;
  prompt: string;
  styleOptions?: Record<string, any>;
  likes: number;
  comments: number;
  scraps: number;
  isLiked?: boolean;
  isScrapped?: boolean;
}

export interface IComment {
  id: string;
  content: string;
  userName: string;
  userProfile?: string;
  createdAt: string;
  parentId?: string;
}

export interface ICommunityFeedCardProps {
  post: IPost;
}

export interface ICommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: IPost;
  onAddComment: (content: string) => Promise<void>;
}

// 이미지 생성 관련 타입
export interface IImageStyle {
  color: string;
  texture: string;
  mood: string;
  intensity: number;
}

export interface IGenerateImageRequest {
  prompt: string;
  style: IImageStyle;
}

export interface IGenerateImageResponse {
  success: boolean;
  imageURL: string;
}

// 공유 모달 관련 타입
export interface IShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageURL: string;
  prompt: string;
  style: IImageStyle;
  onShare: (data: IShareData) => Promise<void>;
}

export interface IShareData {
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
} 