"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Edit2, Trash2, Check, Plus } from "lucide-react";
import { ICategoryModalProps } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const CategoryModal = ({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: ICategoryModalProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState({
    create: false,
    update: false,
    delete: false,
  });
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setIsLoading((prev) => ({ ...prev, create: true }));
      const result = await onCreateCategory(newCategoryName.trim());
      if (result) {
        toast({
          description: "카테고리가 생성되었습니다.",
        });
        setNewCategoryName("");
      } else {
        toast({
          variant: "destructive",
          description: "카테고리 생성에 실패했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "오류가 발생했습니다.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, create: false }));
    }
  };

  const startEditing = (id: string, name: string) => {
    setEditCategoryId(id);
    setEditCategoryName(name);
  };

  const cancelEditing = () => {
    setEditCategoryId(null);
    setEditCategoryName("");
  };

  const handleUpdateCategory = async () => {
    if (!editCategoryId || !editCategoryName.trim()) return;

    try {
      setIsLoading((prev) => ({ ...prev, update: true }));
      const success = await onUpdateCategory(editCategoryId, editCategoryName.trim());
      if (success) {
        toast({
          description: "카테고리가 수정되었습니다.",
        });
        cancelEditing();
      } else {
        toast({
          variant: "destructive",
          description: "카테고리 수정에 실패했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "오류가 발생했습니다.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, update: false }));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, delete: true }));
      const success = await onDeleteCategory(id);
      if (success) {
        toast({
          description: "카테고리가 삭제되었습니다.",
        });
        setDeleteConfirmId(null);
      } else {
        toast({
          variant: "destructive",
          description: "카테고리 삭제에 실패했습니다.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "오류가 발생했습니다.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  // '전체'와 '미분류' 카테고리는 편집 및 삭제할 수 없도록 처리
  const isProtectedCategory = (id: string) => {
    return id === "all" || id === "uncategorized";
  };

  const filteredCategories = categories.filter(
    (category) => category.id !== "all"
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="absolute inset-0 bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden relative z-10">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">카테고리 관리</h2>
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
          <form onSubmit={handleCreateCategory} className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              새 카테고리 추가
            </h3>
            <div className="flex space-x-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="카테고리 이름"
                disabled={isLoading.create}
                maxLength={20}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newCategoryName.trim() || isLoading.create}
              >
                {isLoading.create ? "추가 중..." : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </form>

          <h3 className="text-sm font-medium text-gray-700 mb-2">
            카테고리 목록
          </h3>
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                {editCategoryId === category.id ? (
                  <div className="flex-1 flex space-x-2">
                    <Input
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      disabled={isLoading.update}
                      maxLength={20}
                      autoFocus
                    />
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleUpdateCategory}
                        disabled={
                          !editCategoryName.trim() ||
                          isLoading.update ||
                          editCategoryName.trim() === category.name
                        }
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        disabled={isLoading.update}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <span className="text-sm">{category.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        ({category.count})
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {!isProtectedCategory(category.id) && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              startEditing(category.id, category.name)
                            }
                            disabled={deleteConfirmId === category.id}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {deleteConfirmId === category.id ? (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCategory(category.id)}
                                disabled={isLoading.delete}
                              >
                                확인
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={isLoading.delete}
                              >
                                취소
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(category.id)}
                              disabled={editCategoryId === category.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 