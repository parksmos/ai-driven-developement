import { IPost, IComment, IImageStyle, IShareData, ICategory, IGalleryImage, TShareToCommunityResponse } from "../types";
import { mockCommunityFeed, mockCategories, mockGalleryImages } from "./mockData";

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
export async function generateImage(prompt: string, style?: IImageStyle): Promise<{ success: boolean, imageURL: string, error?: { message: string } }> {
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
      imageURL: '',
      error: {
        message: '이미지 설명은 최소 10자 이상이어야 합니다.'
      }
    };
  }
  
  // 고정된 이미지 URL 목록 - 더 안정적인 URL 사용
  const imageURLs = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1573096108468-702f6014ef28?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1633109741715-6b7bb8a6cc65?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1493238792000-8113da705763?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1680733250332-c9b2000b3ce6?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1689516584760-260eb99fa6a9?w=600&h=600&q=80",
    "https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?w=600&h=600&q=80"
  ];
  
  // 랜덤 선택
  const imageIndex = Math.floor(Math.random() * imageURLs.length);
  
  return {
    success: true,
    imageURL: imageURLs[imageIndex]
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
  style: IImageStyle,
  title: string,
  description: string,
  tags: string[],
  isPublic: boolean
): Promise<{ success: boolean, postId: string }> {
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
  style: IImageStyle,
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

// 갤러리 관련 API 함수

// 갤러리 이미지 목록 가져오기
export async function getGalleryImages(): Promise<IGalleryImage[]> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [...mockGalleryImages];
}

// 카테고리 목록 가져오기
export async function getCategories(): Promise<ICategory[]> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...mockCategories];
}

// 이미지를 카테고리에 추가
export async function addImageToCategory(imageId: string, categoryId: string): Promise<{ success: boolean }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return { success: false };
    }
    
    if (!mockGalleryImages[imageIndex].categories.includes(categoryId)) {
      mockGalleryImages[imageIndex].categories.push(categoryId);
    }
    
    return { success: true };
  } catch (error) {
    console.error("카테고리 추가 중 오류 발생:", error);
    return { success: false };
  }
}

// 이미지를 카테고리에서 제거
export async function removeImageFromCategory(imageId: string, categoryId: string): Promise<{ success: boolean }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return { success: false };
    }
    
    mockGalleryImages[imageIndex].categories = mockGalleryImages[imageIndex].categories.filter(id => id !== categoryId);
    
    // 카테고리가 없으면 기본적으로 'uncategorized'에 추가
    if (mockGalleryImages[imageIndex].categories.length === 0) {
      mockGalleryImages[imageIndex].categories.push('uncategorized');
    }
    
    return { success: true };
  } catch (error) {
    console.error("카테고리 제거 중 오류 발생:", error);
    return { success: false };
  }
}

// 갤러리 이미지 삭제
export async function deleteGalleryImage(imageId: string): Promise<{ success: boolean, error?: { message: string } }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 700));
  
  try {
    const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) {
      return { 
        success: false,
        error: { message: "이미지를 찾을 수 없습니다." }
      };
    }
    
    // 실제로는 서버에서 처리되어야 할 로직 (목업에서는 로컬 상태만 변경)
    mockGalleryImages.splice(imageIndex, 1);
    
    return { success: true };
  } catch (error) {
    console.error("이미지 삭제 중 오류 발생:", error);
    return { 
      success: false,
      error: { message: "이미지 삭제 중 오류가 발생했습니다." }
    };
  }
}

// 이미지 다운로드
export async function downloadImage(imageId: string): Promise<void> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const image = mockGalleryImages.find(img => img.id === imageId);
  if (!image) {
    throw new Error("이미지를 찾을 수 없습니다.");
  }
  
  // 실제로는 이미지 다운로드 로직이 들어가야 함
  // 목업이므로 console.log만 남김
  console.log(`Image ${imageId} downloaded: ${image.imageURL}`);
}

// 커뮤니티에 공유하기
export async function shareToCommunity(
  imageId: string,
  title: string,
  description: string,
  tags: string[],
  isPublic: boolean
): Promise<TShareToCommunityResponse> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    const image = mockGalleryImages.find(img => img.id === imageId);
    if (!image) {
      return { 
        success: false,
        error: { 
          code: "IMAGE_NOT_FOUND",
          message: "이미지를 찾을 수 없습니다." 
        }
      };
    }
    
    if (!title || title.trim() === '') {
      return { 
        success: false,
        error: { 
          code: "INVALID_TITLE",
          message: "제목은 필수 입력 사항입니다." 
        }
      };
    }
    
    // 가상의 포스트 ID 생성
    const postId = `post_${Date.now()}`;
    
    // 실제로는 서버에서 처리되어야 할 로직
    const newPost: IPost = {
      postId,
      imageURL: image.imageURL,
      userName: "현재 사용자", // 실제로는 로그인된 사용자 정보
      userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=User",
      createdAt: new Date().toISOString(),
      prompt: image.prompt,
      styleOptions: image.style,
      likes: 0,
      comments: 0,
      scraps: 0,
      isLiked: false,
      isScrapped: false
    };
    
    // 실제로는 서버에 새 포스트 저장
    mockCommunityFeed.unshift(newPost);
    
    return { 
      success: true,
      data: { postId }
    };
  } catch (error) {
    console.error("커뮤니티 공유 중 오류 발생:", error);
    return { 
      success: false,
      error: { 
        code: "SHARE_ERROR",
        message: "공유 중 오류가 발생했습니다." 
      }
    };
  }
}

// 카테고리 생성
export async function createCategory(name: string): Promise<{ success: boolean, category?: ICategory, error?: { message: string } }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 400));
  
  try {
    if (!name || name.trim() === '') {
      return { 
        success: false,
        error: { message: "카테고리 이름은 필수 입력 사항입니다." }
      };
    }
    
    // 중복 검사
    const exists = mockCategories.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      return { 
        success: false,
        error: { message: "동일한 이름의 카테고리가 이미 존재합니다." }
      };
    }
    
    // 새 카테고리 생성
    const newCategory: ICategory = {
      id: `cat_${Date.now()}`,
      name: name.trim(),
      count: 0,
      isProtected: false
    };
    
    // 목업 데이터에 추가
    mockCategories.push(newCategory);
    
    return { 
      success: true,
      category: newCategory
    };
  } catch (error) {
    console.error("카테고리 생성 중 오류 발생:", error);
    return { 
      success: false,
      error: { message: "카테고리 생성 중 오류가 발생했습니다." }
    };
  }
}

// 카테고리 업데이트
export async function updateCategory(categoryId: string, name: string): Promise<{ success: boolean, error?: { message: string } }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 400));
  
  try {
    const categoryIndex = mockCategories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return { 
        success: false,
        error: { message: "카테고리를 찾을 수 없습니다." }
      };
    }
    
    const category = mockCategories[categoryIndex];
    
    // 보호된 카테고리 체크
    if (category.isProtected) {
      return { 
        success: false,
        error: { message: "이 카테고리는 수정할 수 없습니다." }
      };
    }
    
    if (!name || name.trim() === '') {
      return { 
        success: false,
        error: { message: "카테고리 이름은 필수 입력 사항입니다." }
      };
    }
    
    // 중복 검사 (자기 자신 제외)
    const exists = mockCategories.some(c => c.id !== categoryId && c.name.toLowerCase() === name.trim().toLowerCase());
    if (exists) {
      return { 
        success: false,
        error: { message: "동일한 이름의 카테고리가 이미 존재합니다." }
      };
    }
    
    // 카테고리 이름 업데이트
    mockCategories[categoryIndex].name = name.trim();
    
    return { success: true };
  } catch (error) {
    console.error("카테고리 업데이트 중 오류 발생:", error);
    return { 
      success: false,
      error: { message: "카테고리 업데이트 중 오류가 발생했습니다." }
    };
  }
}

// 카테고리 삭제
export async function deleteCategory(categoryId: string): Promise<{ success: boolean, error?: { message: string } }> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    const categoryIndex = mockCategories.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) {
      return { 
        success: false,
        error: { message: "카테고리를 찾을 수 없습니다." }
      };
    }
    
    const category = mockCategories[categoryIndex];
    
    // 보호된 카테고리 체크
    if (category.isProtected) {
      return { 
        success: false,
        error: { message: "이 카테고리는 삭제할 수 없습니다." }
      };
    }
    
    // 카테고리 삭제
    mockCategories.splice(categoryIndex, 1);
    
    // 이 카테고리에 속한 모든 이미지에서 카테고리 제거하고 미분류로 이동
    mockGalleryImages.forEach(image => {
      if (image.categories.includes(categoryId)) {
        image.categories = image.categories.filter(id => id !== categoryId);
        if (image.categories.length === 0) {
          image.categories.push('uncategorized');
        }
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("카테고리 삭제 중 오류 발생:", error);
    return { 
      success: false,
      error: { message: "카테고리 삭제 중 오류가 발생했습니다." }
    };
  }
} 