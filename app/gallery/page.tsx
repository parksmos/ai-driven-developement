"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconGridDot, IconRows, IconPlus, IconTrash } from "@/components/ui/icons";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import ImageDetailModal from "@/components/ImageDetailModal";
import ShareModal from "@/components/ShareModal";
import { CategoryModal } from "@/components/CategoryModal";
import { getGalleryImages, getCategories, bulkAddImageTags, bulkMoveToCategory, bulkDeleteImages } from "@/utils/api";
import { IGalleryImage, ICategory } from "@/types";
import { toast } from "sonner";

export default function GalleryPage() {
  // 상태 관리
  const [images, setImages] = useState<IGalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<IGalleryImage[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [selectedImage, setSelectedImage] = useState<IGalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGridCompact, setIsGridCompact] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(true);
  
  // 다중 선택 기능을 위한 상태
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [bulkTagInput, setBulkTagInput] = useState<string>("");
  const [bulkCategoryId, setBulkCategoryId] = useState<string>("");
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);

  // 이미지 로드
  const loadImages = useCallback(async () => {
    setIsLoading(true);
    try {
      // 날짜 형식 변환 (YYYY-MM-DD)
      const dateFromStr = dateFrom ? format(dateFrom, 'yyyy-MM-dd') : undefined;
      const dateToStr = dateTo ? format(dateTo, 'yyyy-MM-dd') : undefined;
      
      const imagesData = await getGalleryImages({
        category: selectedCategory,
        search: searchQuery,
        tags: filterTags.length > 0 ? filterTags : undefined,
        sort: selectedSort,
        dateFrom: dateFromStr,
        dateTo: dateToStr
      });
      setImages(imagesData);
      setFilteredImages(imagesData);
    } catch (error) {
      console.error("이미지를 불러오는 중 오류가 발생했습니다:", error);
      toast.error("이미지를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, filterTags, selectedSort, dateFrom, dateTo]);
  
  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("카테고리를 불러오는 중 오류가 발생했습니다:", error);
      toast.error("카테고리를 불러오는 중 오류가 발생했습니다");
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
  
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // 이미지 선택/해제
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(imageId)) {
        newSelected.delete(imageId);
      } else {
        newSelected.add(imageId);
      }
      return newSelected;
    });
  };

  // 선택 모드 토글
  const toggleSelectionMode = () => {
    // 선택 모드를 끄면 선택된 이미지 목록 비우기
    if (isSelectionMode) {
      setSelectedImages(new Set());
    }
    setIsSelectionMode(!isSelectionMode);
  };

  // 모든 선택 해제
  const clearSelections = () => {
    setSelectedImages(new Set());
  };

  // 이미지 클릭 이벤트 (선택 모드에서는 선택/해제, 아니면 상세 모달 열기)
  const handleImageClick = (image: IGalleryImage) => {
    if (isSelectionMode) {
      toggleImageSelection(image.id);
    } else {
      setSelectedImage(image);
      setIsDetailModalOpen(true);
    }
  };

  // 필터 적용
  const applySearch = () => {
    loadImages();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applySearch();
    }
  };
  
  const addFilterTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTagInput.trim() && !filterTags.includes(currentTagInput.trim())) {
      setFilterTags([...filterTags, currentTagInput.trim()]);
      setCurrentTagInput("");
      // 태그 추가 시 바로 검색 적용
      setTimeout(() => loadImages(), 0);
    }
  };
  
  const removeFilterTag = (tag: string) => {
    setFilterTags(filterTags.filter(t => t !== tag));
    // 태그 제거 시 바로 검색 적용
    setTimeout(() => loadImages(), 0);
  };
  
  // 카테고리 변경
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // 카테고리가 변경되면 바로 이미지 로드
    setTimeout(() => loadImages(), 0);
  };
  
  // 정렬 변경
  const handleSortChange = (value: string) => {
    setSelectedSort(value);
    // 정렬이 변경되면 바로 이미지 로드
    setTimeout(() => loadImages(), 0);
  };
  
  // 날짜 변경시 자동 검색
  useEffect(() => {
    if (dateFrom !== undefined || dateTo !== undefined) {
      loadImages();
    }
  }, [dateFrom, dateTo, loadImages]);

  // 필터 토글
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // 이미지 다운로드
  const handleDownloadImage = async (imageId: string) => {
    try {
      // 이미지 다운로드 로직
      // 목업 환경에서는 새 창에서 이미지 열기로 대체
      const image = images.find(img => img.id === imageId);
      if (image) {
        window.open(image.imageURL, '_blank');
        toast.success("이미지가 다운로드되었습니다.");
      }
    } catch (error) {
      console.error("이미지 다운로드 중 오류 발생:", error);
      toast.error("이미지 다운로드 중 오류가 발생했습니다.");
    }
  };
  
  // 다중 선택 이미지 태그 추가
  const handleBulkAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkTagInput.trim() || selectedImages.size === 0) return;
    
    setIsBulkLoading(true);
    try {
      const result = await bulkAddImageTags(
        Array.from(selectedImages),
        bulkTagInput.trim()
      );
      
      if (result.success) {
        toast.success(`${result.updatedCount}개 이미지에 태그가 추가되었습니다.`);
        setBulkTagInput("");
        // 이미지 목록 새로고침
        loadImages();
      } else {
        toast.error(result.error?.message || "태그 추가 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("일괄 태그 추가 중 오류:", error);
      toast.error("태그 추가 중 오류가 발생했습니다.");
    } finally {
      setIsBulkLoading(false);
    }
  };
  
  // 다중 선택 이미지 카테고리 이동
  const handleBulkMoveCategory = async () => {
    if (!bulkCategoryId || selectedImages.size === 0) return;
    
    setIsBulkLoading(true);
    try {
      const result = await bulkMoveToCategory(
        Array.from(selectedImages),
        bulkCategoryId
      );
      
      if (result.success) {
        toast.success(`${result.updatedCount}개 이미지가 카테고리로 이동되었습니다.`);
        setBulkCategoryId("");
        // 이미지 목록 새로고침
        loadImages();
      } else {
        toast.error(result.error?.message || "카테고리 이동 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("일괄 카테고리 이동 중 오류:", error);
      toast.error("카테고리 이동 중 오류가 발생했습니다.");
    } finally {
      setIsBulkLoading(false);
    }
  };
  
  // 다중 선택 이미지 삭제
  const handleBulkDelete = async () => {
    if (selectedImages.size === 0) return;
    
    if (!confirm(`선택한 ${selectedImages.size}개 이미지를 삭제하시겠습니까?`)) {
      return;
    }
    
    setIsBulkLoading(true);
    try {
      const result = await bulkDeleteImages(Array.from(selectedImages));
      
      if (result.success) {
        toast.success(`${result.deletedCount}개 이미지가 삭제되었습니다.`);
        setSelectedImages(new Set());
        // 이미지 목록 새로고침
        loadImages();
      } else {
        toast.error(result.error?.message || "이미지 삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("일괄 이미지 삭제 중 오류:", error);
      toast.error("이미지 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsBulkLoading(false);
    }
  };
  
  // 이미지 삭제 함수
  const onDelete = async (imageId: string) => {
    try {
      // 실제 API 호출을 하는 대신 로컬 상태만 업데이트
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      setFilteredImages(updatedImages);
      return { success: true };
    } catch (error) {
      console.error("이미지 삭제 중 오류:", error);
      return { 
        success: false, 
        error: { message: "이미지 삭제에 실패했습니다." } 
      };
    }
  };
  
  // 커뮤니티에 공유
  const handleShareToCommunity = async (
    imageId: string,
    title: string,
    description: string,
    tags: string[],
    isPublic: boolean
  ) => {
    try {
      // 공유 로직
      // 실제로는 API 호출해야 함
      console.log("Share to community:", {
        imageId, title, description, tags, isPublic
      });
      
      // 모달 닫기
      setIsShareModalOpen(false);
      
      // 성공 메시지
      toast.success("이미지가 커뮤니티에 공유되었습니다.");
      
      return true;
    } catch (error) {
      console.error("커뮤니티 공유 중 오류 발생:", error);
      toast.error("커뮤니티 공유 중 오류가 발생했습니다.");
      return false;
    }
  };
  
  // 모달 열기 함수
  const handleOpenShareModal = (image: IGalleryImage) => {
    setSelectedImage(image);
    setIsShareModalOpen(true);
  };

  // 단일 이미지 삭제
  const handleSingleDelete = async (imageId: string) => {
    // 삭제 전 확인
    if (!confirm("이미지를 삭제하시겠습니까?")) {
      return;
    }
    
    try {
      // 이미지 삭제 API 호출 (실제로는 서버에 요청하지만, 여기서는 로컬 상태만 업데이트)
      const result = await onDelete(imageId);
      
      if (result.success) {
        // 상태 업데이트
        const updatedImages = images.filter(img => img.id !== imageId);
        setImages(updatedImages);
        setFilteredImages(updatedImages);
        toast.success("이미지가 삭제되었습니다.");
      } else {
        toast.error(result.error?.message || "이미지 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("이미지 삭제 중 오류:", error);
      toast.error("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">이미지 갤러리</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={toggleFilters}
            variant="outline"
            size="sm"
          >
            {showFilters ? "필터 숨기기" : "필터 표시"}
          </Button>
          
          <Button 
            onClick={toggleSelectionMode}
            variant={isSelectionMode ? "default" : "outline"}
            size="sm"
          >
            {isSelectionMode ? "선택 모드 종료" : "선택 모드"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            카테고리 관리
          </Button>
        </div>
      </div>
      
      {/* 다중 선택 도구바 */}
      {isSelectionMode && selectedImages.size > 0 && (
        <div className="bg-muted p-4 rounded-lg flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <div className="flex-shrink-0">
            <span className="font-medium">{selectedImages.size}개 선택됨</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearSelections}
              className="ml-2"
            >
              모두 해제
            </Button>
          </div>
          
          <div className="flex-1 flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="flex space-x-2 flex-1">
              <Select
                value={bulkCategoryId}
                onValueChange={setBulkCategoryId}
                disabled={isBulkLoading}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleBulkMoveCategory}
                disabled={!bulkCategoryId || isBulkLoading}
                className="whitespace-nowrap"
                size="sm"
              >
                이동
              </Button>
            </div>
            
            <form onSubmit={handleBulkAddTag} className="flex space-x-2 flex-1">
              <Input
                placeholder="태그 추가"
                value={bulkTagInput}
                onChange={(e) => setBulkTagInput(e.target.value)}
                disabled={isBulkLoading}
                className="flex-grow"
              />
              <Button 
                type="submit"
                disabled={!bulkTagInput.trim() || isBulkLoading}
                size="sm"
              >
                태그 추가
              </Button>
            </form>
            
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isBulkLoading}
              size="sm"
            >
              <IconTrash className="mr-2 h-4 w-4" />
              삭제
            </Button>
          </div>
        </div>
      )}
      
      {/* 필터 및 정렬 - 새로운 레이아웃 */}
      {showFilters && (
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 첫 번째 줄: 카테고리 및 검색 */}
            <div className="space-y-2">
              <Label htmlFor="category-filter" className="text-sm font-medium">카테고리</Label>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger id="category-filter" className="w-full h-10">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="uncategorized">미분류</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search-input" className="text-sm font-medium">검색</Label>
              <div className="flex space-x-2">
                <Input
                  id="search-input"
                  placeholder="이미지 이름, 프롬프트"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-10 w-full"
                />
                <Button onClick={loadImages} className="h-10">검색</Button>
              </div>
            </div>
            
            {/* 두 번째 줄: 날짜 선택 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">시작일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "yyyy-MM-dd") : <span>날짜 선택</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">종료일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-10 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "yyyy-MM-dd") : <span>날짜 선택</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
            {/* 세 번째 줄: 태그 필터 및 정렬 */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="tag-input" className="text-sm font-medium">태그 필터</Label>
              <form onSubmit={addFilterTag} className="flex space-x-2">
                <Input
                  id="tag-input"
                  placeholder="태그 추가"
                  value={currentTagInput}
                  onChange={(e) => setCurrentTagInput(e.target.value)}
                  className="h-10 w-full"
                />
                <Button type="submit" disabled={!currentTagInput.trim()} className="h-10">추가</Button>
              </form>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort-select" className="text-sm font-medium">정렬</Label>
              <Select
                value={selectedSort}
                onValueChange={handleSortChange}
              >
                <SelectTrigger id="sort-select" className="h-10 w-full">
                  <SelectValue placeholder="정렬 방식" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                  <SelectItem value="a-z">이름 (A-Z)</SelectItem>
                  <SelectItem value="z-a">이름 (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">보기 방식</Label>
              <ToggleGroup type="single" value={isGridCompact ? "compact" : "normal"} className="h-10 justify-center">
                <ToggleGroupItem
                  value="normal"
                  onClick={() => setIsGridCompact(false)}
                  className="h-10 w-full"
                >
                  <IconGridDot className="h-4 w-4 mr-2" /> 
                  <span className="hidden sm:inline">크게</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="compact"
                  onClick={() => setIsGridCompact(true)}
                  className="h-10 w-full"
                >
                  <IconRows className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">작게</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          
          {/* 태그 필터 표시 */}
          {filterTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <div className="flex items-center mr-2">
                <span className="text-sm font-medium text-gray-500">태그 필터:</span>
              </div>
              {filterTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center">
                  {tag}
                  <button
                    onClick={() => removeFilterTag(tag)}
                    className="ml-1 rounded-full hover:bg-muted p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterTags([]);
                  setTimeout(() => loadImages(), 0);
                }}
              >
                모두 지우기
              </Button>
            </div>
          )}
          
          {/* 날짜 필터 표시 */}
          {(dateFrom || dateTo) && (
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center mr-2">
                <span className="text-sm font-medium text-gray-500">날짜 필터:</span>
              </div>
              {dateFrom && (
                <Badge variant="outline" className="flex items-center">
                  시작일: {format(dateFrom, "yyyy-MM-dd")}
                  <button
                    onClick={() => setDateFrom(undefined)}
                    className="ml-1 rounded-full hover:bg-muted p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </Badge>
              )}
              {dateTo && (
                <Badge variant="outline" className="flex items-center">
                  종료일: {format(dateTo, "yyyy-MM-dd")}
                  <button
                    onClick={() => setDateTo(undefined)}
                    className="ml-1 rounded-full hover:bg-muted p-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </Badge>
              )}
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom(undefined);
                    setDateTo(undefined);
                    setTimeout(() => loadImages(), 0);
                  }}
                >
                  날짜 필터 초기화
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
      
      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status">
            <span className="sr-only">로딩중...</span>
          </div>
          <p className="mt-2">이미지를 불러오는 중...</p>
        </div>
      )}
      
      {/* 검색 결과 없음 표시 */}
      {!isLoading && filteredImages.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg">해당 조건에 맞는 이미지가 없습니다</p>
        </div>
      )}
      
      {/* 이미지 그리드 */}
      {!isLoading && filteredImages.length > 0 && (
        <div className={`grid gap-4 ${
          isGridCompact 
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" 
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        }`}>
          {filteredImages.map((image) => (
            <Card 
              key={image.id} 
              className={`overflow-hidden ${
                selectedImages.has(image.id) ? "ring-2 ring-primary" : ""
              } group relative`}
            >
              <div className="relative">
                {/* 선택 체크박스 */}
                {isSelectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox 
                      checked={selectedImages.has(image.id)}
                      onCheckedChange={() => toggleImageSelection(image.id)}
                      className="h-5 w-5 bg-background/80 border-white"
                    />
                  </div>
                )}
                
                {/* 이미지 본문 - 클릭 이벤트를 명확하게 연결 */}
                <div 
                  className="cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={image.imageURL}
                      alt={image.name}
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  
                  {!isGridCompact && (
                    <div className="p-3">
                      <h3 className="font-medium truncate">{image.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                      
                      {/* 카테고리 표시 */}
                      {image.categories.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {image.categories.slice(0, 3).map((categoryId) => {
                            const category = categories.find(c => c.id === categoryId);
                            return category ? (
                              <Badge key={categoryId} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ) : null;
                          })}
                          {image.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{image.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* 태그 표시 */}
                      {image.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {image.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {image.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{image.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* 다운로드, 공유, 삭제 버튼 */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-background/80"
                          onClick={(e) => {
                            e.stopPropagation(); // 클릭 이벤트 전파 중지
                            handleDownloadImage(image.id);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>다운로드</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-background/80"
                          onClick={(e) => {
                            e.stopPropagation(); // 클릭 이벤트 전파 중지
                            handleOpenShareModal(image);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>커뮤니티에 공유</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 bg-background/80"
                          onClick={(e) => {
                            e.stopPropagation(); // 클릭 이벤트 전파 중지
                            handleSingleDelete(image.id);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>삭제</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* 모달들 */}
      {selectedImage && (
        <ImageDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          image={selectedImage}
          categories={categories}
          onUpdateCategory={async (imageId, categoryId, isAdding) => {
            try {
              // 실제 API 호출을 하는 대신 로컬 상태만 업데이트
              const updatedImages = images.map(img => {
                if (img.id === imageId) {
                  const updatedCategories = isAdding
                    ? [...img.categories, categoryId]
                    : img.categories.filter(cat => cat !== categoryId);
                  return { ...img, categories: updatedCategories };
                }
                return img;
              });
              
              setImages(updatedImages);
              setFilteredImages(updatedImages);
              // 모달에 표시되는 이미지도 업데이트
              if (selectedImage && selectedImage.id === imageId) {
                const updatedCategories = isAdding
                  ? [...selectedImage.categories, categoryId]
                  : selectedImage.categories.filter(cat => cat !== categoryId);
                setSelectedImage({ ...selectedImage, categories: updatedCategories });
              }
              
              return { success: true };
            } catch (error) {
              console.error("카테고리 업데이트 중 오류:", error);
              return { 
                success: false, 
                error: { message: "카테고리 업데이트에 실패했습니다." } 
              };
            }
          }}
          onUpdateTags={async (imageId, tags) => {
            try {
              // 실제 API 호출을 하는 대신 로컬 상태만 업데이트
              const updatedImages = images.map(img => {
                if (img.id === imageId) {
                  return { ...img, tags };
                }
                return img;
              });
              
              setImages(updatedImages);
              setFilteredImages(updatedImages);
              // 모달에 표시되는 이미지도 업데이트
              if (selectedImage && selectedImage.id === imageId) {
                setSelectedImage({ ...selectedImage, tags });
              }
              
              return { success: true };
            } catch (error) {
              console.error("태그 업데이트 중 오류:", error);
              return { 
                success: false, 
                error: { message: "태그 업데이트에 실패했습니다." } 
              };
            }
          }}
          onDelete={onDelete}
          onShare={() => {
            setIsDetailModalOpen(false);
            setIsShareModalOpen(true);
            return Promise.resolve(true);
          }}
          onDownload={handleDownloadImage}
        />
      )}
      
      {selectedImage && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          image={selectedImage}
          onShare={handleShareToCommunity}
        />
      )}
      
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreate={async (name) => {
          const newCategory = {
            id: `category_${Date.now()}`,
            name,
            isProtected: false
          };
          const updatedCategories = [...categories, newCategory];
          setCategories(updatedCategories);
          return { success: true, category: newCategory };
        }}
        onUpdate={async (id, name) => {
          const updatedCategories = categories.map(cat => 
            cat.id === id ? { ...cat, name } : cat
          );
          setCategories(updatedCategories);
          return { success: true };
        }}
        onDelete={async (id) => {
          const updatedCategories = categories.filter(cat => cat.id !== id);
          setCategories(updatedCategories);
          return { success: true };
        }}
      />
    </div>
  );
} 