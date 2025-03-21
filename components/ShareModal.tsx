"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Share2 } from "lucide-react";
import { IGalleryImage, IImageStyle, TShareToCommunityResponse } from "@/types";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  image?: IGalleryImage;
  imageURL?: string;
  prompt?: string;
  style?: IImageStyle;
  onShare: (
    imageId: string,
    title: string,
    description: string,
    tags: string[],
    isPublic: boolean
  ) => Promise<boolean> | Promise<TShareToCommunityResponse>;
}

const ShareModal = ({
  isOpen,
  onClose,
  image,
  imageURL,
  prompt,
  style,
  onShare,
}: ShareModalProps) => {
  const imageData = {
    id: image?.id || 'temp-id',
    imageURL: image?.imageURL || imageURL || '',
    tags: image?.tags || [],
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(imageData.tags);
  const [tagInput, setTagInput] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const result = await onShare(
        imageData.id,
        title,
        description,
        tags,
        isPublic
      );
      
      const success = typeof result === 'boolean' ? result : result.success;

      if (success) {
        toast.success("이미지가 커뮤니티에 공유되었습니다.");
        onClose();
      } else {
        toast.error("공유 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("공유 중 오류 발생:", error);
      toast.error("공유 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden relative z-10">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">커뮤니티에 공유하기</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 max-h-[calc(90vh-136px)] overflow-y-auto">
          <div className="mb-4 border rounded-md p-2 flex justify-center">
            <img
              src={imageData.imageURL}
              alt="공유할 이미지"
              className="h-48 object-contain"
            />
          </div>

          <form onSubmit={handleShare} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                제목 <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                maxLength={50}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                설명
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이미지에 대한 설명을 입력하세요"
                maxLength={200}
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                태그
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="pl-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 p-1 rounded-full hover:bg-gray-200"
                      disabled={isLoading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="태그 입력 후 엔터 또는 쉼표"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => tagInput.trim() && addTag(tagInput)}
                  disabled={!tagInput.trim() || isLoading}
                >
                  추가
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                쉼표(,) 또는 엔터 키를 눌러 태그를 추가할 수 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                공개 설정
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm">전체 공개</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm">친구 공개</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full"
                disabled={!title.trim() || isLoading}
              >
                {isLoading ? "공유 중..." : "공유하기"}
                <Share2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 