import { IPost, IComment } from "../types";
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

// 목업 API - 이미지 생성하기
export async function generateImage(prompt: string): Promise<{ success: boolean, imageURL: string }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 고정된 이미지 URL 목록
  const imageURLs = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1573096108468-702f6014ef28?w=600&h=600&fit=crop",
    "https://images.unsplash.com/photo-1633109741715-6b7bb8a6cc65?w=600&h=600&fit=crop"
  ];
  
  // 랜덤하게 이미지 선택
  const randomIndex = Math.floor(Math.random() * imageURLs.length);
  const imageURL = imageURLs[randomIndex];
  
  return {
    success: true,
    imageURL
  };
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