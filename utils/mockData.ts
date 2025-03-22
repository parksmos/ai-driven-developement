import { ICategory, IGalleryImage, IImageStyle, IPost, ISelectOption, ISortOption } from "../types";

// 현재 시간 기준 5시간 내 랜덤 시간 생성 함수
const getRandomRecentTime = () => {
  const now = new Date();
  const randomMinutesAgo = Math.floor(Math.random() * 300); // 최대 5시간(300분) 내
  now.setMinutes(now.getMinutes() - randomMinutesAgo);
  return now.toISOString();
};

// 랜덤 날짜 생성 함수 (최근 30일 내)
const getRandomDate = () => {
  const now = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 30); // 최대 30일 내
  now.setDate(now.getDate() - randomDaysAgo);
  return now.toISOString();
};

// 목업 커뮤니티 피드 데이터
export const mockCommunityFeed: IPost[] = [
  {
    postId: "1",
    imageURL: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=600&fit=crop",
    userName: "창작의신",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Abby",
    createdAt: getRandomRecentTime(),
    prompt: "신비로운 숲 속의 판타지 생물",
    styleOptions: { style: "fantasy", colorScheme: "vibrant" },
    likes: 156,
    comments: 42,
    scraps: 73,
    isLiked: false,
    isScrapped: false
  },
  {
    postId: "2",
    imageURL: "https://images.unsplash.com/photo-1493238792000-8113da705763?w=600&h=600&fit=crop",
    userName: "디자인혁명",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    createdAt: getRandomRecentTime(),
    prompt: "미래 도시의 공중 정원",
    styleOptions: { style: "futuristic", colorScheme: "cool" },
    likes: 89,
    comments: 15,
    scraps: 27,
    isLiked: true,
    isScrapped: false
  },
  {
    postId: "3",
    imageURL: "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?w=600&h=600&fit=crop",
    userName: "팝아트마스터",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe",
    createdAt: getRandomRecentTime(),
    prompt: "복고풍 팝아트 초상화",
    styleOptions: { style: "retro", colorScheme: "popart" },
    likes: 204,
    comments: 38,
    scraps: 91,
    isLiked: false,
    isScrapped: true
  },
  {
    postId: "4",
    imageURL: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&h=600&fit=crop",
    userName: "분위기장인",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Max",
    createdAt: getRandomRecentTime(),
    prompt: "비 내리는 도시의 네온 불빛",
    styleOptions: { style: "cyberpunk", colorScheme: "neon" },
    likes: 176,
    comments: 22,
    scraps: 45,
    isLiked: false,
    isScrapped: false
  },
  {
    postId: "5",
    imageURL: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=600&h=600&fit=crop",
    userName: "예술여행자",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Lily",
    createdAt: getRandomRecentTime(),
    prompt: "고전 유화 스타일의 시골 풍경",
    styleOptions: { style: "classical", colorScheme: "warm" },
    likes: 122,
    comments: 31,
    scraps: 52,
    isLiked: true,
    isScrapped: false
  },
  {
    postId: "6",
    imageURL: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=600&h=600&fit=crop",
    userName: "초현실주의자",
    userProfile: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
    createdAt: getRandomRecentTime(),
    prompt: "초현실적인 꿈의 풍경",
    styleOptions: { style: "surreal", colorScheme: "dreamlike" },
    likes: 245,
    comments: 54,
    scraps: 108,
    isLiked: false,
    isScrapped: true
  }
];

// 목업 갤러리 카테고리 데이터
export const mockCategories: ICategory[] = [
  {
    id: "all",
    name: "전체",
    count: 15,
    isProtected: true
  },
  {
    id: "cat1",
    name: "풍경",
    count: 5,
    isProtected: false
  },
  {
    id: "cat2",
    name: "인물",
    count: 3,
    isProtected: false
  },
  {
    id: "cat3",
    name: "추상",
    count: 4,
    isProtected: false
  },
  {
    id: "cat4",
    name: "판타지",
    count: 2,
    isProtected: false
  },
  {
    id: "uncategorized",
    name: "미분류",
    count: 1,
    isProtected: true
  }
];

// 목업 갤러리 이미지 데이터
export const mockGalleryImages: IGalleryImage[] = [
  {
    id: "gal1",
    imageURL: "https://images.unsplash.com/photo-1682687221248-3116ba6ab483?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1682687221248-3116ba6ab483?w=300&h=300&fit=crop",
    name: "산 정상에서 바라본 일출",
    prompt: "산 정상에서 바라본 일출 장면",
    style: {
      styleType: 'general',
      color: "비비드",
      texture: "부드러운",
      mood: "평화로운",
      intensity: 80
    },
    createdAt: getRandomDate(),
    tags: ["일출", "산", "자연", "풍경"],
    categories: ["cat1"]
  },
  {
    id: "gal2",
    imageURL: "https://images.unsplash.com/photo-1655635949212-1d8f4f103ea4?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1655635949212-1d8f4f103ea4?w=300&h=300&fit=crop",
    name: "미래 도시의 스카이라인",
    prompt: "미래 도시의 스카이라인",
    style: {
      styleType: 'general',
      color: "네온",
      texture: "금속",
      mood: "미래적",
      intensity: 90
    },
    createdAt: getRandomDate(),
    tags: ["미래", "도시", "스카이라인", "SF"],
    categories: ["cat3"]
  },
  {
    id: "gal3",
    imageURL: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop",
    name: "르네상스 스타일 초상화",
    prompt: "르네상스 스타일의 여성 초상화",
    style: {
      styleType: 'general',
      color: "클래식",
      texture: "캔버스",
      mood: "우아한",
      intensity: 75
    },
    createdAt: getRandomDate(),
    tags: ["초상화", "르네상스", "여성", "예술"],
    categories: ["cat2"]
  },
  {
    id: "gal4",
    imageURL: "https://images.unsplash.com/photo-1535291911176-70ee2c5c9494?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1535291911176-70ee2c5c9494?w=300&h=300&fit=crop",
    name: "브랜드 로고 디자인",
    prompt: "미니멀한 스타일의 브랜드 로고 디자인",
    style: {
      styleType: 'logo',
      color: "minimal",
      texture: "flat",
      mood: "professional",
      intensity: 70
    },
    createdAt: getRandomDate(),
    tags: ["로고", "브랜드", "디자인", "미니멀"],
    categories: ["cat4"]
  },
  {
    id: "gal5",
    imageURL: "https://images.unsplash.com/photo-1614094082869-cd4e4b2905c7?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1614094082869-cd4e4b2905c7?w=300&h=300&fit=crop",
    name: "바다 위의 일몰",
    prompt: "바다 위의 일몰",
    style: {
      styleType: 'general',
      color: "따뜻한",
      texture: "반짝이는",
      mood: "평화로운",
      intensity: 70
    },
    createdAt: getRandomDate(),
    tags: ["일몰", "바다", "자연", "풍경"],
    categories: ["cat1"]
  },
  {
    id: "gal6",
    imageURL: "https://images.unsplash.com/photo-1599003037886-5b751b68ec38?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1599003037886-5b751b68ec38?w=300&h=300&fit=crop",
    name: "추상적인 형태와 색상",
    prompt: "추상적인 형태와 색상의 조합",
    style: {
      styleType: 'general',
      color: "다채로운",
      texture: "혼합",
      mood: "열정적인",
      intensity: 95
    },
    createdAt: getRandomDate(),
    tags: ["추상", "색상", "형태", "현대 미술"],
    categories: ["cat3"]
  },
  {
    id: "gal7",
    imageURL: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?w=300&h=300&fit=crop",
    name: "안개 속의 산봉우리",
    prompt: "안개 속의 산봉우리",
    style: {
      styleType: 'general',
      color: "몽환적",
      texture: "부드러운",
      mood: "신비로운",
      intensity: 65
    },
    createdAt: getRandomDate(),
    tags: ["안개", "산", "풍경", "자연"],
    categories: ["cat1"]
  },
  {
    id: "gal8",
    imageURL: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=300&h=300&fit=crop",
    name: "별이 빛나는 밤하늘",
    prompt: "맑은 별이 빛나는 밤하늘",
    style: {
      styleType: 'general',
      color: "어두운",
      texture: "반짝이는",
      mood: "평화로운",
      intensity: 75
    },
    createdAt: getRandomDate(),
    tags: ["밤하늘", "별", "우주", "풍경"],
    categories: ["cat1", "cat4"]
  },
  {
    id: "gal9",
    imageURL: "https://images.unsplash.com/photo-1493497029755-f49c8e9a3c36?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1493497029755-f49c8e9a3c36?w=300&h=300&fit=crop",
    name: "봄의 꽃들",
    prompt: "다양한 색상의 꽃이 만개한 봄 정원",
    style: {
      styleType: 'general',
      color: "파스텔",
      texture: "부드러운",
      mood: "행복한",
      intensity: 60
    },
    createdAt: getRandomDate(),
    tags: ["꽃", "봄", "정원", "자연"],
    categories: ["cat1"]
  },
  {
    id: "gal10",
    imageURL: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=300&h=300&fit=crop",
    name: "젊은 남성의 초상화",
    prompt: "스튜디오에서 촬영한 젊은 남성의 초상화",
    style: {
      styleType: 'general',
      color: "대비가 강한",
      texture: "선명한",
      mood: "진지한",
      intensity: 70
    },
    createdAt: getRandomDate(),
    tags: ["초상화", "남성", "인물"],
    categories: ["cat2"]
  },
  {
    id: "gal11",
    imageURL: "https://images.unsplash.com/photo-1603489546564-36daa9b440a7?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1603489546564-36daa9b440a7?w=300&h=300&fit=crop",
    name: "파스텔 색상의 추상화",
    prompt: "부드러운 파스텔 색상으로 이루어진 추상적인 패턴",
    style: {
      styleType: 'general',
      color: "파스텔",
      texture: "유동적인",
      mood: "평화로운",
      intensity: 50
    },
    createdAt: getRandomDate(),
    tags: ["추상", "파스텔", "패턴", "예술"],
    categories: ["cat3"]
  },
  {
    id: "gal12",
    imageURL: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=300&h=300&fit=crop",
    name: "디지털 사이버펑크 도시",
    prompt: "네온불빛이 가득한 미래의 사이버펑크 도시",
    style: {
      styleType: 'general',
      color: "네온",
      texture: "디지털",
      mood: "미래적",
      intensity: 95
    },
    createdAt: getRandomDate(),
    tags: ["사이버펑크", "도시", "미래", "네온"],
    categories: ["cat3"]
  },
  {
    id: "gal13",
    imageURL: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=300&h=300&fit=crop",
    name: "아시아 여성의 초상화",
    prompt: "전통적인 의상을 입은 아시아 여성의 초상화",
    style: {
      styleType: 'general',
      color: "풍부한",
      texture: "섬세한",
      mood: "우아한",
      intensity: 75
    },
    createdAt: getRandomDate(),
    tags: ["초상화", "아시아", "여성", "전통"],
    categories: ["cat2"]
  },
  {
    id: "gal14",
    imageURL: "https://images.unsplash.com/photo-1566155119454-2b581dd44c59?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1566155119454-2b581dd44c59?w=300&h=300&fit=crop",
    name: "용과 기사의 전투",
    prompt: "화려한 갑옷을 입은 기사와 화염을 내뿜는 용의 전투 장면",
    style: {
      styleType: 'general',
      color: "강렬한",
      texture: "거친",
      mood: "극적인",
      intensity: 90
    },
    createdAt: getRandomDate(),
    tags: ["판타지", "용", "기사", "전투"],
    categories: ["cat4"]
  },
  {
    id: "gal15",
    imageURL: "https://images.unsplash.com/photo-1601636566661-81f0690c679b?w=600&h=600&fit=crop",
    thumbnailURL: "https://images.unsplash.com/photo-1601636566661-81f0690c679b?w=300&h=300&fit=crop",
    name: "새롭게 생성된 이미지",
    prompt: "새롭게 생성된 이미지 프롬프트",
    style: {
      styleType: 'general',
      color: "기본",
      texture: "기본",
      mood: "중립",
      intensity: 50
    },
    createdAt: getRandomDate(),
    tags: [],
    categories: ["uncategorized"]
  }
];

// 스타일 타입 옵션
export const styleTypeOptions: ISelectOption[] = [
  { value: 'general', label: '일반' },
  { value: 'logo', label: '로고' },
  { value: 'illustration', label: '일러스트레이션' },
];

// 로고 색감 옵션
export const logoColorOptions: ISelectOption[] = [
  { value: 'corporate', label: '기업용' },
  { value: 'vibrant', label: '활기찬' },
  { value: 'minimal', label: '미니멀' },
  { value: 'gradient', label: '그라데이션' },
  { value: 'bold', label: '대담한' },
];

// 로고 텍스처 옵션
export const logoTextureOptions: ISelectOption[] = [
  { value: 'flat', label: '플랫' },
  { value: '3d', label: '3D' },
  { value: 'metallic', label: '메탈릭' },
  { value: 'shadow', label: '그림자' },
  { value: 'embossed', label: '엠보싱' },
];

// 로고 분위기 옵션
export const logoMoodOptions: ISelectOption[] = [
  { value: 'professional', label: '전문적인' },
  { value: 'creative', label: '창의적인' },
  { value: 'playful', label: '유쾌한' },
  { value: 'luxury', label: '고급스러운' },
  { value: 'tech', label: '테크니컬' },
];

// 색감 옵션
export const colorOptions: ISelectOption[] = [
  { value: 'bright', label: '밝은' },
  { value: 'dark', label: '어두운' },
  { value: 'vivid', label: '비비드' },
  { value: 'pastel', label: '파스텔' },
  { value: 'monochrome', label: '모노크롬' },
];

// 텍스처 옵션
export const textureOptions: ISelectOption[] = [
  { value: 'smooth', label: '부드러운' },
  { value: 'rough', label: '거친' },
  { value: 'matte', label: '매트' },
  { value: 'glossy', label: '광택' },
];

// 분위기 옵션
export const moodOptions: ISelectOption[] = [
  { value: 'warm', label: '따뜻한' },
  { value: 'cool', label: '차가운' },
  { value: 'dreamy', label: '몽환적' },
  { value: 'realistic', label: '사실적' },
];

// 갤러리 정렬 옵션
export const sortOptions: ISortOption[] = [
  { id: "newest", label: "최신순" },
  { id: "oldest", label: "오래된순" },
  { id: "a-z", label: "이름순 (A-Z)" },
  { id: "z-a", label: "이름순 (Z-A)" },
]; 