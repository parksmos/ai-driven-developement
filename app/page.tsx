"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CommunityFeedCard from "@/components/CommunityFeedCard";
import { IPost } from "@/types";
import { fetchCommunityFeed } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedPosts, setFeedPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 커뮤니티 피드 로드
  const loadCommunityFeed = async () => {
    try {
      setIsLoading(true);
      const { posts } = await fetchCommunityFeed();
      setFeedPosts(posts);
      setError("");
    } catch (err) {
      setError("커뮤니티 피드를 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 피드 로드
  useEffect(() => {
    loadCommunityFeed();
  }, []);

  // 이미지 생성 페이지로 이동
  const handleGenerateImage = () => {
    if (!prompt.trim()) {
      setError("프롬프트를 입력해 주세요");
      return;
    }

    // 프롬프트를 쿼리 파라미터로 전달하여 이미지 생성 페이지로 이동
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/create?prompt=${encodedPrompt}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 프롬프트 입력 섹션 */}
      <section className="mb-16 mt-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center">
          상상하는 모든 것을 이미지로 만들어보세요
        </h1>
        
        <div className="w-full max-w-xl mx-auto">
          <div className="flex flex-col gap-4">
            <Input
              placeholder="원하는 이미지를 설명해보세요 (예: 신비로운 숲 속의 판타지 생물)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="p-6 text-base bg-white shadow-sm focus-visible:ring-[#4A90E2]"
            />
            
            <Button 
              onClick={handleGenerateImage}
              className="w-full p-6 bg-[#4A90E2] hover:bg-[#3A80D2] text-base font-semibold"
              disabled={!prompt.trim()}
            >
              이미지 생성 페이지로 이동
            </Button>
            
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>
      </section>

      {/* 커뮤니티 피드 섹션 */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">커뮤니티 최신 작품</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-[#4A90E2]" />
          </div>
        ) : feedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {feedPosts.map((post) => (
              <CommunityFeedCard key={post.postId} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">커뮤니티 피드가 없습니다.</p>
        )}
      </section>
    </div>
  );
}
