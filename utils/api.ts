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
    styleType: 'general',
    color: 'bright',
    texture: 'smooth',
    mood: 'warm',
    intensity: 50
  };
  
  // style이 없을 경우 기본값 사용
  const finalStyle = style || defaultStyle;
  
  // 최소 글자 수 체크
  if (prompt.length < 10) {
    return {
      success: false,
      imageURL: '',
      error: {
        message: '이미지 설명은 최소 10자 이상이어야 합니다.'
      }
    };
  }

  try {
    console.log('Replicate API 요청 시작:', { prompt, style: finalStyle });
    
    // 예측 생성 API 호출
    const prediction = await fetch('/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, style: finalStyle }),
    });
    
    const result = await prediction.json();
    console.log('예측 생성 결과:', result);
    
    if (!prediction.ok || !result.success) {
      throw new Error(result.error?.message || '이미지 생성에 실패했습니다.');
    }
    
    // 폴링을 통한 예측 결과 가져오기
    const predictionId = result.prediction.id;
    if (!predictionId) {
      throw new Error('예측 ID를 받지 못했습니다.');
    }
    
    // 폴링 함수
    const pollPrediction = async (id: string, maxAttempts = 60, interval = 2000): Promise<string> => {
      let attempts = 0;
      
      while (attempts < maxAttempts) {
        const pollResponse = await fetch(`/api/predictions/${id}`);
        const pollResult = await pollResponse.json();
        
        console.log(`폴링 결과 (${attempts + 1}/${maxAttempts}):`, pollResult.prediction.status);
        
        if (pollResult.success && pollResult.data?.imageURL) {
          return pollResult.data.imageURL;
        }
        
        if (pollResult.prediction.status === 'failed') {
          throw new Error(pollResult.error?.message || '이미지 생성에 실패했습니다.');
        }
        
        if (pollResult.prediction.status === 'succeeded') {
          // 출력 처리
          if (pollResult.prediction.output) {
            if (Array.isArray(pollResult.prediction.output)) {
              return pollResult.prediction.output[pollResult.prediction.output.length - 1];
            } else if (typeof pollResult.prediction.output === 'string') {
              return pollResult.prediction.output;
            }
          }
        }
        
        // 다음 폴링까지 대기
        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
      }
      
      throw new Error('이미지 생성 시간이 초과되었습니다.');
    };
    
    // 결과 폴링
    const imageURL = await pollPrediction(predictionId);
    
    return {
      success: true,
      imageURL
    };
  } catch (error: any) {
    console.error('이미지 생성 오류:', error);
    return {
      success: false,
      imageURL: '',
      error: {
        message: error.message || '이미지 생성 중 오류가 발생했습니다.'
      }
    };
  }
}

// 목업 API - 갤러리에 저장하기
export async function saveToGallery(
  imageURL: string, 
  prompt: string, 
  style?: IImageStyle
): Promise<{ success: boolean, imageId: string }> {
  // 기본 스타일 값 설정
  const defaultStyle: IImageStyle = {
    styleType: 'general',
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

// 목업 API - 갤러리 이미지 목록 가져오기
export async function getGalleryImages(options: { 
  category?: string, 
  search?: string, 
  tags?: string[],
  sort?: string,
  dateFrom?: string,
  dateTo?: string
} = {}): Promise<IGalleryImage[]> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // 목업 데이터에서 이미지 반환
  let result = [...mockGalleryImages];
  
  // 필터링 (카테고리)
  if (options.category && options.category !== 'all') {
    result = result.filter(img => 
      options.category === 'uncategorized' 
        ? img.categories.length === 0 || img.categories.includes('uncategorized')
        : img.categories.includes(options.category)
    );
  }
  
  // 필터링 (검색어)
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    result = result.filter(img => 
      img.name.toLowerCase().includes(searchLower) || 
      img.prompt.toLowerCase().includes(searchLower) ||
      img.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // 필터링 (태그)
  if (options.tags && options.tags.length > 0) {
    result = result.filter(img => 
      options.tags!.some(tag => img.tags.includes(tag))
    );
  }
  
  // 필터링 (날짜)
  if (options.dateFrom || options.dateTo) {
    result = result.filter(img => {
      const imgDate = new Date(img.createdAt).getTime();
      
      if (options.dateFrom && options.dateTo) {
        const fromDate = new Date(options.dateFrom).getTime();
        const toDate = new Date(options.dateTo).setHours(23, 59, 59, 999); // 종료일의 23:59:59로 설정
        return imgDate >= fromDate && imgDate <= toDate;
      }
      else if (options.dateFrom) {
        const fromDate = new Date(options.dateFrom).getTime();
        return imgDate >= fromDate;
      }
      else if (options.dateTo) {
        const toDate = new Date(options.dateTo).setHours(23, 59, 59, 999);
        return imgDate <= toDate;
      }
      
      return true;
    });
  }
  
  // 정렬
  if (options.sort) {
    switch(options.sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'a-z':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
  }
  
  return result;
}

// 목업 API - 카테고리 목록 가져오기
export async function getCategories(): Promise<ICategory[]> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // 목업 카테고리 데이터 반환
  return [...mockCategories];
}

// 목업 API - 이미지 카테고리에 추가
export async function addImageToCategory(imageId: string, categoryId: string): Promise<{
  success: boolean
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // 목업 데이터에서 이미지 찾기
  const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
  
  if (imageIndex === -1) {
    return { success: false };
  }
  
  // 이미지가 이미 해당 카테고리에 있는지 확인
  if (mockGalleryImages[imageIndex].categories.includes(categoryId)) {
    return { success: true }; // 이미 카테고리에 속해 있으면 성공으로 처리
  }
  
  // 카테고리 추가
  mockGalleryImages[imageIndex].categories.push(categoryId);
  
  return { success: true };
}

// 목업 API - 이미지 카테고리에서 제거
export async function removeImageFromCategory(imageId: string, categoryId: string): Promise<{
  success: boolean
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // 목업 데이터에서 이미지 찾기
  const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
  
  if (imageIndex === -1) {
    return { success: false };
  }
  
  // 이미지가 해당 카테고리에 없는지 확인
  if (!mockGalleryImages[imageIndex].categories.includes(categoryId)) {
    return { success: true }; // 이미 카테고리에 속해 있지 않으면 성공으로 처리
  }
  
  // 카테고리 제거
  mockGalleryImages[imageIndex].categories = 
    mockGalleryImages[imageIndex].categories.filter(id => id !== categoryId);
  
  return { success: true };
}

// 목업 API - 이미지에 태그 추가
export async function addImageTag(imageId: string, tag: string): Promise<{
  success: boolean
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 목업 데이터에서 이미지 찾기
  const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
  
  if (imageIndex === -1) {
    return { success: false };
  }
  
  // 이미지가 이미 해당 태그를 가지고 있는지 확인
  if (mockGalleryImages[imageIndex].tags.includes(tag)) {
    return { success: true }; // 이미 태그가 있으면 성공으로 처리
  }
  
  // 태그 추가
  mockGalleryImages[imageIndex].tags.push(tag);
  
  return { success: true };
}

// 목업 API - 이미지에서 태그 제거
export async function removeImageTag(imageId: string, tag: string): Promise<{
  success: boolean
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 목업 데이터에서 이미지 찾기
  const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
  
  if (imageIndex === -1) {
    return { success: false };
  }
  
  // 태그 제거
  mockGalleryImages[imageIndex].tags = 
    mockGalleryImages[imageIndex].tags.filter(t => t !== tag);
  
  return { success: true };
}

// 목업 API - 갤러리 이미지 삭제
export async function deleteGalleryImage(imageId: string): Promise<{
  success: boolean,
  error?: { message: string }
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 목업 데이터에서 이미지 찾기
  const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
  
  if (imageIndex === -1) {
    return { 
      success: false,
      error: { message: '이미지를 찾을 수 없습니다.' }
    };
  }
  
  // 이미지 삭제 (실제 목업 데이터 변경은 하지 않음, 클라이언트 상태 관리를 통해 처리)
  
  return { success: true };
}

// 목업 API - 여러 이미지에 태그 일괄 추가
export async function bulkAddImageTags(imageIds: string[], tag: string): Promise<{
  success: boolean,
  updatedCount: number,
  error?: { message: string }
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 800));
  
  try {
    let updatedCount = 0;
    
    // 각 이미지에 태그 추가
    for (const imageId of imageIds) {
      const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
      
      if (imageIndex !== -1 && !mockGalleryImages[imageIndex].tags.includes(tag)) {
        mockGalleryImages[imageIndex].tags.push(tag);
        updatedCount++;
      }
    }
    
    return {
      success: true,
      updatedCount
    };
  } catch (error) {
    return {
      success: false,
      updatedCount: 0,
      error: { message: '태그 일괄 추가 중 오류가 발생했습니다.' }
    };
  }
}

// 목업 API - 여러 이미지 카테고리 일괄 이동
export async function bulkMoveToCategory(imageIds: string[], categoryId: string): Promise<{
  success: boolean,
  updatedCount: number,
  error?: { message: string }
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    let updatedCount = 0;
    
    // 각 이미지를 카테고리로 이동
    for (const imageId of imageIds) {
      const imageIndex = mockGalleryImages.findIndex(img => img.id === imageId);
      
      if (imageIndex !== -1 && !mockGalleryImages[imageIndex].categories.includes(categoryId)) {
        mockGalleryImages[imageIndex].categories.push(categoryId);
        updatedCount++;
      }
    }
    
    return {
      success: true,
      updatedCount
    };
  } catch (error) {
    return {
      success: false,
      updatedCount: 0,
      error: { message: '카테고리 일괄 이동 중 오류가 발생했습니다.' }
    };
  }
}

// 목업 API - 여러 이미지 일괄 삭제
export async function bulkDeleteImages(imageIds: string[]): Promise<{
  success: boolean,
  deletedCount: number,
  error?: { message: string }
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  try {
    // 삭제할 이미지 확인 (목업 데이터 실제 삭제는 하지 않음)
    const deletedCount = imageIds.filter(id => 
      mockGalleryImages.some(img => img.id === id)
    ).length;
    
    return {
      success: true,
      deletedCount
    };
  } catch (error) {
    return {
      success: false,
      deletedCount: 0,
      error: { message: '이미지 일괄 삭제 중 오류가 발생했습니다.' }
    };
  }
}

// 목업 API - 커뮤니티에 이미지 공유하기
export async function shareToCommunity(
  imageId: string,
  title: string,
  description: string,
  tags: string[],
  isPublic: boolean
): Promise<{ 
  success: boolean, 
  postId?: string,
  error?: { message: string } 
}> {
  // 실제 API 호출을 시뮬레이션하기 위한 지연 추가
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 제목 유효성 검사
  if (!title.trim()) {
    return {
      success: false,
      error: { message: '제목을 입력해주세요.' }
    };
  }
  
  // 목업 데이터에서 이미지 찾기
  const image = mockGalleryImages.find(img => img.id === imageId);
  
  if (!image) {
    return {
      success: false,
      error: { message: '이미지를 찾을 수 없습니다.' }
    };
  }
  
  // 포스트 ID 생성
  const postId = `post_${Date.now()}`;
  
  return {
    success: true,
    postId
  };
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