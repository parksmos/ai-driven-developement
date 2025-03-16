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
export async function generateImage(prompt: string, style?: IImageStyle): Promise<{ success: boolean, data?: { imageURL: string }, error?: { code: string, message: string } }> {
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
      error: {
        code: 'PROMPT_TOO_SHORT',
        message: '프롬프트는 최소 10자 이상이어야 합니다.'
      }
    };
  }
  
  // 다운로드에 최적화된 이미지 URL 목록 - Picsum Photos는 다운로드 친화적
  const imageURLs = [
    // 색상 스타일에 따른 이미지
    "https://picsum.photos/id/10/800/800",   // bright - 자연 풍경
    "https://picsum.photos/id/12/800/800",   // dark - 어두운 질감
    "https://picsum.photos/id/96/800/800",   // vivid - 밝은 색상
    "https://picsum.photos/id/37/800/800",   // pastel - 흐린 질감
    "https://picsum.photos/id/146/800/800",  // monochrome - 흑백 느낌
    
    // 텍스처 스타일에 따른 이미지
    "https://picsum.photos/id/134/800/800",  // smooth - 매끄러운 질감
    "https://picsum.photos/id/158/800/800",  // rough - 거친 질감
    "https://picsum.photos/id/65/800/800",   // matte - 매트한 표면
    "https://picsum.photos/id/136/800/800",  // glossy - 광택있는 질감
    
    // 무드 스타일에 따른 이미지
    "https://picsum.photos/id/237/800/800",  // warm - 따뜻한 분위기
    "https://picsum.photos/id/162/800/800",  // cool - 차가운 분위기
    "https://picsum.photos/id/110/800/800",  // dreamy - 몽환적 분위기
    "https://picsum.photos/id/152/800/800",  // realistic - 사실적 분위기
  ];
  
  // 스타일에 따른 이미지 선택 로직
  let imageIndex = 0;
  
  // 색상 스타일에 따른 이미지 선택
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
      imageIndex = 0;
  }
  
  // 텍스처 스타일이 우선 적용되는 경우
  switch(finalStyle.texture) {
    case 'smooth':
      imageIndex = 5;
      break;
    case 'rough':
      imageIndex = 6;
      break;
    case 'matte':
      imageIndex = 7;
      break;
    case 'glossy':
      imageIndex = 8;
      break;
    default:
      // 색상 스타일 유지
      break;
  }
  
  // 무드 스타일이 가장 강한 경우(강도가 70% 이상)
  if (finalStyle.intensity >= 70) {
    switch(finalStyle.mood) {
      case 'warm':
        imageIndex = 9;
        break;
      case 'cool':
        imageIndex = 10;
        break;
      case 'dreamy':
        imageIndex = 11;
        break;
      case 'realistic':
        imageIndex = 12;
        break;
      default:
        // 이전 스타일 유지
        break;
    }
  }
  
  // 랜덤 요소 추가 (1% 확률로 강아지 이미지 제공 - 재미요소)
  const random = Math.random();
  if (random < 0.01) {
    imageIndex = 9; // 강아지 이미지
  }
  
  // 생성된 이미지 URL
  const selectedImageURL = imageURLs[imageIndex];
  
  // 캐시 방지 및 다운로드 식별자 추가
  const downloadParam = `?download=true&cache=${Date.now()}`;
  
  return {
    success: true,
    data: {
      imageURL: selectedImageURL + downloadParam
    }
  };
}

// 목업 API - 갤러리에 저장하기
export async function saveToGallery(
  imageURL: string, 
  prompt: string, 
  style?: IImageStyle
): Promise<{ success: boolean, data?: { imageId: string }, error?: { code: string, message: string } }> {
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
    data: {
      imageId
    }
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
): Promise<{ success: boolean, data?: { postId: string }, error?: { code: string, message: string } }> {
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
      error: {
        code: 'EMPTY_TITLE',
        message: '제목은 필수 입력 항목입니다.'
      }
    };
  }
  
  // 가상의 포스트 ID 생성
  const postId = `post_${Date.now()}`;
  
  return {
    success: true,
    data: {
      postId
    }
  };
}

// 기존 코드와 통합을 위한 래퍼 함수
export async function handleShareToCommuity(
  imageURL: string,
  prompt: string,
  style?: IImageStyle,
  shareData: IShareData
): Promise<{ success: boolean, data?: { postId: string }, error?: { code: string, message: string } }> {
  // shareToCommuity 함수 호출 및 결과 리턴
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