"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";
import {
  FolderPlus,
  Search,
  Grid2X2,
  Grid3X3,
  Download,
  Share2,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

import { ICategory, IGalleryImage, ISortOption } from "@/types";
import {
  getGalleryImages,
  getCategories,
  addImageToCategory,
  removeImageFromCategory,
  deleteGalleryImage,
  shareToCommunity,
  downloadImage,
} from "@/utils/api";
import { sortOptions } from "@/utils/mockData";
import ImageDetailModal from "@/components/ImageDetailModal";
import CategoryModal from "@/components/CategoryModal";
import ShareModal from "@/components/ShareModal";

export default function GalleryPage() {
  const [images, setImages] = useState<IGalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<IGalleryImage[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isGridCompact, setIsGridCompact] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 모달 상태
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImageDetailModalOpen, setIsImageDetailModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<IGalleryImage | null>(null);

  // 이미지 및 카테고리 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [imagesData, categoriesData] = await Promise.all([
          getGalleryImages(),
          getCategories(),
        ]);
        setImages(imagesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("데이터 로드 중 오류 발생:", error);
        toast({
          variant: "destructive",
          description: "갤러리 데이터를 불러오는 데 실패했습니다.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 필터링 및 정렬 적용
  useEffect(() => {
    let result = [...images];

    // 카테고리 필터링
    if (selectedCategory !== "all") {
      result = result.filter((image) =>
        image.categories.includes(selectedCategory)
      );
    }

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (image) =>
          image.name.toLowerCase().includes(query) ||
          image.prompt.toLowerCase().includes(query) ||
          image.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 정렬
    result = sortImages(result, sortOption);

    setFilteredImages(result);
  }, [images, selectedCategory, sortOption, searchQuery]);

  // 이미지 정렬 함수
  const sortImages = (
    imagesToSort: IGalleryImage[],
    sortBy: string
  ): IGalleryImage[] => {
    const sorted = [...imagesToSort];

    switch (sortBy) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "a-z":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "z-a":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  // 이미지 선택 핸들러
  const handleImageClick = (image: IGalleryImage) => {
    setSelectedImage(image);
    setIsImageDetailModalOpen(true);
  };

  // 이미지 다운로드 핸들러
  const handleDownloadImage = async (imageId: string) => {
    try {
      await downloadImage(imageId);
      toast({
        description: "이미지가 다운로드되었습니다.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "이미지 다운로드에 실패했습니다.",
      });
    }
  };

  // 이미지 삭제 핸들러
  const handleDeleteImage = async (imageId: string) => {
    try {
      const result = await deleteGalleryImage(imageId);
      if (result.success) {
        setImages(images.filter((img) => img.id !== imageId));
        setIsImageDetailModalOpen(false);
        toast({
          description: "이미지가 삭제되었습니다.",
        });
      } else {
        throw new Error(result.error?.message);
      }
    } catch (error) {
      console.error("이미지 삭제 중 오류 발생:", error);
      toast({
        variant: "destructive",
        description: "이미지 삭제에 실패했습니다.",
      });
    }
  };

  // 카테고리 관리 핸들러
  const handleCategoryUpdate = (updatedCategories: ICategory[]) => {
    setCategories(updatedCategories);
  };

  // 이미지 카테고리 변경 핸들러
  const handleUpdateImageCategory = async (
    imageId: string,
    categoryId: string,
    isAdd: boolean
  ) => {
    try {
      if (isAdd) {
        await addImageToCategory(imageId, categoryId);
      } else {
        await removeImageFromCategory(imageId, categoryId);
      }

      // 이미지 데이터 업데이트
      setImages(
        images.map((img) => {
          if (img.id === imageId) {
            const updatedCategories = isAdd
              ? [...img.categories, categoryId]
              : img.categories.filter((id) => id !== categoryId);
            return { ...img, categories: updatedCategories };
          }
          return img;
        })
      );

      return { success: true };
    } catch (error) {
      console.error("카테고리 업데이트 중 오류 발생:", error);
      return {
        success: false,
        error: { message: "카테고리 업데이트에 실패했습니다." },
      };
    }
  };

  // 이미지 태그 업데이트 핸들러
  const handleUpdateImageTags = async (
    imageId: string,
    tags: string[]
  ) => {
    try {
      // 태그 업데이트 API 호출 (백엔드 연동 시 구현)
      
      // 이미지 데이터 업데이트
      setImages(
        images.map((img) => {
          if (img.id === imageId) {
            return { ...img, tags };
          }
          return img;
        })
      );

      return { success: true };
    } catch (error) {
      console.error("태그 업데이트 중 오류 발생:", error);
      return {
        success: false,
        error: { message: "태그 업데이트에 실패했습니다." },
      };
    }
  };

  // 커뮤니티 공유 핸들러
  const handleShareToCommunity = async (
    imageId: string,
    title: string,
    description: string,
    tags: string[],
    isPublic: boolean
  ) => {
    try {
      const result = await shareToCommunity(
        imageId,
        title,
        description,
        tags,
        isPublic
      );
      return result;
    } catch (error) {
      console.error("커뮤니티 공유 중 오류 발생:", error);
      return {
        success: false,
        error: { message: "커뮤니티 공유에 실패했습니다." },
      };
    }
  };

  // 공유 모달 열기 핸들러
  const handleOpenShareModal = (image: IGalleryImage) => {
    setSelectedImage(image);
    setIsShareModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">갤러리</h1>

      {/* 필터링 및 정렬 옵션 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 이미지</SelectItem>
              <SelectItem value="uncategorized">미분류</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>카테고리 관리</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="이미지 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsGridCompact(!isGridCompact)}
                >
                  {isGridCompact ? (
                    <Grid3X3 className="h-4 w-4" />
                  ) : (
                    <Grid2X2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>그리드 크기 변경</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* 이미지 갤러리 그리드 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <ImageIcon className="h-16 w-16 mb-4" />
          <p className="text-xl font-medium">이미지가 없습니다</p>
          <p className="mt-2">
            {searchQuery
              ? "검색 결과가 없습니다. 다른 검색어를 입력해보세요."
              : selectedCategory !== "all"
              ? "선택한 카테고리에 이미지가 없습니다."
              : "갤러리에 이미지가 없습니다."}
          </p>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            isGridCompact
              ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative pb-[100%]">
                <img
                  src={image.thumbnailURL || image.imageURL}
                  alt={image.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onClick={() => handleImageClick(image)}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-medium text-white line-clamp-1">
                    {image.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 bg-black/20 text-white hover:bg-black/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadImage(image.id);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>다운로드</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 bg-black/20 text-white hover:bg-black/40"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenShareModal(image);
                              }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>커뮤니티 공유</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center space-x-1 text-xs text-white">
                      {image.tags && image.tags.length > 0 && (
                        <span className="flex items-center">
                          <Tag className="mr-1 h-3 w-3" />
                          {image.tags.length}
                        </span>
                      )}
                      {image.categories &&
                        image.categories.length > 0 &&
                        image.categories[0] !== "uncategorized" && (
                          <span className="bg-black/30 px-1.5 py-0.5 rounded text-[10px]">
                            {
                              categories.find(
                                (c) => c.id === image.categories[0]
                              )?.name
                            }
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 모달 컴포넌트들 */}
      {selectedImage && (
        <>
          <ImageDetailModal
            isOpen={isImageDetailModalOpen}
            onClose={() => setIsImageDetailModalOpen(false)}
            image={selectedImage}
            categories={categories}
            onDelete={() => handleDeleteImage(selectedImage.id)}
            onUpdateCategory={(categoryId, isAdd) =>
              handleUpdateImageCategory(selectedImage.id, categoryId, isAdd)
            }
            onUpdateTags={(tags) => 
              handleUpdateImageTags(selectedImage.id, tags)
            }
            onShare={() => {
              setIsImageDetailModalOpen(false);
              setIsShareModalOpen(true);
            }}
            onDownload={() => handleDownloadImage(selectedImage.id)}
          />

          <ShareModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            imageId={selectedImage.id}
            imageURL={selectedImage.imageURL}
            initialTags={selectedImage.tags}
            onShare={handleShareToCommunity}
          />
        </>
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCategoryUpdate={handleCategoryUpdate}
      />
    </div>
  );
} 