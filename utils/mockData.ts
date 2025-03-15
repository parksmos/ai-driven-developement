import { IPost } from "../types";

// 현재 시간 기준 5시간 내 랜덤 시간 생성 함수
const getRandomRecentTime = () => {
  const now = new Date();
  const randomMinutesAgo = Math.floor(Math.random() * 300); // 최대 5시간(300분) 내
  now.setMinutes(now.getMinutes() - randomMinutesAgo);
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