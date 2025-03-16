"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Download, Share2, Trash2, Plus } from "lucide-react";
import { IImageDetailModalProps } from "@/types";
import { formatDate } from "@/utils/formatters";
import { toast } from "@/components/ui/use-toast";

const ImageDetailModal = ({
  isOpen,
  onClose,
  image,
  onAddTag,
  onRemoveTag,
  onDelete,
  onShare,
  onDownload,
}: IImageDetailModalProps) => {
  const [newTag, setNewTag] = useState("");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({
    download: false,
    delete: false,
    addTag: false,
  });

  if (!isOpen) return null;

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    try {
      setIsLoading((prev) => ({ ...prev, addTag: true }));
      const success = await onAddTag(image.id, newTag.trim());
      if (success) {
        toast({
          description: "태그가 추가되었습니다.",
        });
        setNewTag("");
      } else {
        toast({
          variant: "destructive",
          description: "태그 추가에 실패했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "오류가 발생했습니다.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, addTag: false }));
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      const success = await onRemoveTag(image.id, tag);
      if (success) {
        toast({
          description: "태그가 삭제되었습니다.",
        });
      } else {
        toast({
          variant: "destructive",
          description: "태그 삭제에 실패했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "오류가 발생했습니다.",
      });
    }
  };

  const handleDeleteImage = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, delete: true }));
      const success = await onDelete(image.id);
      if (success) {
        toast({
          description: "이미지가 삭제되었습니다.",
        });
        onClose();
      } else {
        toast({
          variant: "destructive",
          description: "이미지 삭제에 실패했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "오류가 발생했습니다.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, delete: false }));
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, download: true }));
      const success = await onDownload(image.imageURL);
      if (success) {
        toast({
          description: "이미지가 다운로드되었습니다.",
        });
      } else {
        toast({
          variant: "destructive",
          description: "이미지 다운로드에 실패했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "오류가 발생했습니다.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, download: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative z-10">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">이미지 상세 정보</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="flex flex-col space-y-4">
            <div className="rounded-md overflow-hidden border border-gray-200">
              <img
                src={image.imageURL}
                alt={image.prompt}
                className="w-full h-auto object-contain"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
                disabled={isLoading.download}
              >
                {isLoading.download ? "다운로드 중..." : "다운로드"}
                <Download className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => onShare(image.id)}
              >
                커뮤니티 공유
                <Share2 className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={isLoading.delete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Card className="p-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">
                프롬프트
              </h3>
              <p className="text-sm">{image.prompt}</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">
                스타일 옵션
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">색감: </span>
                  {image.style.color}
                </div>
                <div>
                  <span className="text-gray-500">질감: </span>
                  {image.style.texture}
                </div>
                <div>
                  <span className="text-gray-500">분위기: </span>
                  {image.style.mood}
                </div>
                <div>
                  <span className="text-gray-500">강도: </span>
                  {image.style.intensity}%
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">
                생성 일시
              </h3>
              <p className="text-sm">{formatDate(image.createdAt)}</p>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium text-sm text-gray-500 mb-2">태그</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {image.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pl-2">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 p-1 rounded-full hover:bg-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {image.tags.length === 0 && (
                  <p className="text-sm text-gray-400">
                    추가된 태그가 없습니다.
                  </p>
                )}
              </div>
              <form
                onSubmit={handleAddTag}
                className="flex items-center space-x-2"
              >
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="새 태그 추가"
                  className="text-sm"
                  disabled={isLoading.addTag}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  disabled={!newTag.trim() || isLoading.addTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {isDeleteConfirmOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">이미지 삭제</h3>
              <p className="mb-6">정말로 이 이미지를 삭제하시겠습니까?</p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  취소
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteImage}
                  disabled={isLoading.delete}
                >
                  {isLoading.delete ? "삭제 중..." : "삭제"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDetailModal; 