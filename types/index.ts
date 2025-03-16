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

<<<<<<< HEAD
// API 응답 관련 타입
export type TApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

export type TGenerateImageResponse = TApiResponse<{
  imageURL: string;
}>;

export type TSaveToGalleryResponse = TApiResponse<{
  imageId: string;
}>;

export type TShareToCommunityResponse = TApiResponse<{
  postId: string;
}>;
=======
export interface IGenerateImageResponse {
  success: boolean;
  imageURL: string;
}
>>>>>>> 31b4dfec3fcb29d55b01af2940803b199398bfcb

// 공유 모달 관련 타입
export interface IShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageURL: string;
  prompt: string;
  style: IImageStyle;
<<<<<<< HEAD
  onShare: (data: IShareData) => Promise<TShareToCommunityResponse>;
}

// 이미지 모달 관련 타입
export interface IImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageURL: string;
=======
  onShare: (data: IShareData) => Promise<void>;
>>>>>>> 31b4dfec3fcb29d55b01af2940803b199398bfcb
}

export interface IShareData {
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
<<<<<<< HEAD
}

// 셀렉트 컴포넌트 관련 타입
export interface ISelectOption {
  value: string;
  label: string;
=======
>>>>>>> 31b4dfec3fcb29d55b01af2940803b199398bfcb
} 