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
  styleType: string; // 스타일 타입 (일반, 로고 등)
  color: string;
  texture: string;
  mood: string;
  intensity: number;
}

export interface IGenerateImageRequest {
  prompt: string;
  style: IImageStyle;
}

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

// 공유 모달 관련 타입
export interface IShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageURL: string;
  prompt: string;
  style: IImageStyle;
  onShare: (data: IShareData) => Promise<TShareToCommunityResponse>;
}

// 이미지 모달 관련 타입
export interface IImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageURL: string;
}

export interface IShareData {
  title: string;
  description: string;
  tags: string[];
  isPublic: boolean;
}

// 셀렉트 컴포넌트 관련 타입
export interface ISelectOption {
  value: string;
  label: string;
}

// 갤러리 관련 타입
export interface IGalleryImage {
  id: string;
  imageURL: string;
  thumbnailURL?: string;
  name: string;
  prompt: string;
  style: IImageStyle;
  createdAt: string;
  tags: string[];
  categories: string[];
}

export interface ICategory {
  id: string;
  name: string;
  count: number;
  isProtected?: boolean;
}

export interface ISortOption {
  id: string;
  label: string;
}

export interface IImageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: IGalleryImage;
  categories: ICategory[];
  onUpdateCategory: (categoryId: string, isAdd: boolean) => Promise<{
    success: boolean;
    error?: { message: string };
  }>;
  onUpdateTags: (tags: string[]) => Promise<{
    success: boolean;
    error?: { message: string };
  }>;
  onDelete: () => Promise<void>;
  onShare: () => void;
  onDownload: () => Promise<void>;
}

export interface ICategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ICategory[];
  onCategoryUpdate: (categories: ICategory[]) => void;
}

// 갤러리 목록 API 요청/응답 타입
export interface IGalleryImagesRequest {
  category?: string;
  search?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sort?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
  page?: number;
  limit?: number;
}

export type TGalleryImagesResponse = TApiResponse<{
  images: IGalleryImage[];
  total: number;
  page: number;
  pageSize: number;
}>;

export type TCategoriesResponse = TApiResponse<{
  categories: ICategory[];
}>;

// 일괄 관리 툴바 타입
export interface IBulkToolbarProps {
  selectedImages: string[];
  categories: ICategory[];
  onBulkMove: (imageIds: string[], categoryId: string) => Promise<boolean>;
  onBulkAddTag: (imageIds: string[], tag: string) => Promise<boolean>;
  onBulkDelete: (imageIds: string[]) => Promise<boolean>;
  onClearSelection: () => void;
} 