import { IPost, IComment, IImageStyle, IShareData } from "../types";
import { mockCommunityFeed } from "./mockData";

// 목업 API - 커뮤니티 피드 가져오기
export async function fetchCommunityFeed(): Promise<{ posts: IPost[] }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    posts: mockCommunityFeed
  };
}

// 목업 API - 포스트 상세 정보 가져오기
export async function fetchPostDetail(postId: string): Promise<{ success: boolean, post?: IPost }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // 해당 게시물 찾기
  const post = mockCommunityFeed.find(p => p.postId === postId);
  
  if (!post) {
    return { success: false };
  }
  
  return {
    success: true,
    post: { ...post }
  };
}

// 목업 API - 포스트 댓글 목록 가져오기
export async function fetchPostComments(postId: string): Promise<{ success: boolean, comments: IComment[] }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // 해당 게시물 찾기
  const post = mockCommunityFeed.find(p => p.postId === postId);
  
  if (!post) {
    return { success: false, comments: [] };
  }
  
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
  
  return {
    success: true,
    comments: mockComments
  };
}

// 목업 API - 이미지 생성하기 (스타일 옵션을 포함한 업데이트 버전)
export async function generateImage(prompt: string, style?: IImageStyle): Promise<{ success: boolean, imageURL: string }> {
  // 기본 스타일 값 설정
  const defaultStyle: IImageStyle = {
    color: 'bright',
    texture: 'smooth',
    mood: 'warm',
    intensity: 50
  };
  
  // style이 없을 경우 기본값 사용
  const finalStyle = style || defaultStyle;
  
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가 (복잡한 스타일 옵션이 적용된 경우 더 오래 걸리는 것처럼 시뮬레이션)
  const delay = 1500 + (finalStyle.intensity * 5);
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // 최소 글자 수 체크 (오류 시뮬레이션)
  if (prompt.length < 10) {
    return {
      success: false,
      imageURL: ''
    };
  }
  
  // 고정된 이미지 URL 목록 - 더 안정적인 URL 사용
  const imageURLs = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1573096108468-702f6014ef28?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1633109741715-6b7bb8a6cc65?w=600&h=600&q=80"
  ];
  
  // 추가 이미지 (확실하게 로드되는 것으로 확인된 이미지)
  const fallbackImageURLs = [
    "https://source.unsplash.com/random/600x600?art",
    "https://source.unsplash.com/random/600x600?painting",
    "https://source.unsplash.com/random/600x600?digital",
    "https://picsum.photos/600/600",
    "https://picsum.photos/id/237/600/600"
  ];
  
  // 모든 이미지 URL을 하나의 배열로 합침
  const allImageURLs = [...imageURLs, ...fallbackImageURLs];
  
  // 스타일에 따라 다른 이미지 선택 로직 구현
  let imageIndex = 0;
  
  switch(finalStyle.color) {
    case 'bright':
      imageIndex = 0;
      break;
    case 'dark':
      imageIndex = 1;
      break;
    case 'vivid':
      imageIndex = 2;
      break;
    case 'pastel':
      imageIndex = 3;
      break;
    case 'monochrome':
      imageIndex = 4;
      break;
    default:
      // 랜덤 선택
      imageIndex = Math.floor(Math.random() * allImageURLs.length);
  }
  
  // 간헐적 실패 시뮬레이션 (10% 확률) - 개발 테스트용
  // 실제 서비스에서는 이 부분 제거
  /* 
  const shouldFail = Math.random() < 0.1;
  if (shouldFail) {
    return {
      success: false,
      imageURL: ''
    };
  }
  */
  
  return {
    success: true,
    imageURL: allImageURLs[imageIndex]
  };
}

// 목업 API - 갤러리에 저장하기
export async function saveToGallery(
  imageURL: string, 
  prompt: string, 
  style?: IImageStyle
): Promise<{ success: boolean, imageId: string }> {
  // 기본 스타일 값 설정
  const defaultStyle: IImageStyle = {
    color: 'bright',
    texture: 'smooth',
    mood: 'warm',
    intensity: 50
  };
  
  // style이 없을 경우 기본값 사용
  const finalStyle = style || defaultStyle;
  
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 가상의 이미지 ID 생성
  const imageId = `img_${Date.now()}`;
  
  return {
    success: true,
    imageId
  };
}

// 목업 API - 커뮤니티에 공유하기
export async function shareToCommuity(
  imageURL: string,
  prompt: string,
  style?: IImageStyle,
  title: string,
  description: string,
  tags: string[],
  isPublic: boolean
): Promise<{ success: boolean, postId: string }> {
  // 기본 스타일 값 설정
  const defaultStyle: IImageStyle = {
    color: 'bright',
    texture: 'smooth',
    mood: 'warm',
    intensity: 50
  };
  
  // style이 없을 경우 기본값 사용
  const finalStyle = style || defaultStyle;
  
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 필수 필드 체크 (오류 시뮬레이션)
  if (!title || title.trim() === '') {
    return {
      success: false,
      postId: ''
    };
  }
  
  // 가상의 포스트 ID 생성
  const postId = `post_${Date.now()}`;
  
  return {
    success: true,
    postId
  };
}

// 기존 코드와 통합을 위한 래퍼 함수
export async function handleShareToCommuity(
  imageURL: string,
  prompt: string,
  style?: IImageStyle,
  shareData: IShareData
): Promise<{ success: boolean, postId: string }> {
  return shareToCommuity(
    imageURL,
    prompt,
    style,
    shareData.title,
    shareData.description,
    shareData.tags,
    shareData.isPublic
  );
}

// 목업 API - 좋아요 토글
export async function toggleLike(postId: string): Promise<{ success: boolean, isLiked: boolean, likes: number }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 해당 게시물 찾기
  const post = mockCommunityFeed.find(p => p.postId === postId);
  
  if (!post) {
    return { success: false, isLiked: false, likes: 0 };
  }
  
  // 좋아요 상태 토글
  const newIsLiked = !post.isLiked;
  const newLikes = newIsLiked ? post.likes + 1 : post.likes - 1;
  
  // 실제로는 백엔드에서 처리되어야 할 로직 (목업에서는 로컬 상태만 변경)
  post.isLiked = newIsLiked;
  post.likes = newLikes;
  
  return {
    success: true,
    isLiked: newIsLiked,
    likes: newLikes
  };
}

// 목업 API - 스크랩 토글
export async function toggleScrap(postId: string): Promise<{ success: boolean, isScrapped: boolean, scraps: number }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 해당 게시물 찾기
  const post = mockCommunityFeed.find(p => p.postId === postId);
  
  if (!post) {
    return { success: false, isScrapped: false, scraps: 0 };
  }
  
  // 스크랩 상태 토글
  const newIsScrapped = !post.isScrapped;
  const newScraps = newIsScrapped ? post.scraps + 1 : post.scraps - 1;
  
  // 실제로는 백엔드에서 처리되어야 할 로직 (목업에서는 로컬 상태만 변경)
  post.isScrapped = newIsScrapped;
  post.scraps = newScraps;
  
  return {
    success: true,
    isScrapped: newIsScrapped,
    scraps: newScraps
  };
}

// 목업 API - 댓글 추가
export async function addComment(postId: string, content: string): Promise<{ success: boolean, comment: IComment }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 해당 게시물 찾기
  const post = mockCommunityFeed.find(p => p.postId === postId);
  
  if (!post) {
    return { 
      success: false, 
      comment: {
        id: "",
        content: "",
        userName: "",
        createdAt: new Date().toISOString()
      } 
    };
  }
  
  // 새 댓글 생성
  const newComment: IComment = {
    id: `comment-${Date.now()}`,
    content,
    userName: "내 계정", // 실제로는 로그인된 사용자 정보를 사용
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Me",
    createdAt: new Date().toISOString()
  };
  
  // 댓글 수 증가 (실제로는 백엔드에서 처리)
  post.comments += 1;
  
  return {
    success: true,
    comment: newComment
  };
} 