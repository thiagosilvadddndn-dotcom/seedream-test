'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/sections/hero/1/ui/button';
import { Upload, X, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { validateFile } from '@/lib/r2-client';

interface MultiImageUploadProps {
  value: string[]; // 图片URL数组
  onChange: (urls: string[]) => void;
  onClear?: () => void;
  placeholder?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
  maxImages?: number; // 最大图片数量
}

export default function MultiImageUpload({ 
  value = [], 
  onChange, 
  onClear, 
  placeholder,
  accept = "image/*",
  disabled = false,
  className = "",
  maxImages = 5
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations('imageUpload');

  const displayPlaceholder = placeholder || 'Click to upload or drag and drop';

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setUploadSuccess(message);
      setUploadError(null);
      setTimeout(() => setUploadSuccess(null), 3000);
    } else {
      setUploadError(message);
      setUploadSuccess(null);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    // 检查是否超过最大数量
    if (value.length + files.length > maxImages) {
      const remaining = maxImages - value.length;
      showMessage(`Maximum ${maxImages} images allowed. You can add ${remaining} more.`, 'error');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      const uploadPromises = files.map(async (file) => {
        // 文件验证
        const validation = validateFile(file);
        if (!validation.isValid) {
          throw new Error(validation.error || 'File validation failed');
        }

        // 创建FormData并上传到R2
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.url) {
          return result.url;
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      });

      // 等待所有文件上传完成
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // 添加新图片URLs到数组
      const newUrls = [...value, ...uploadedUrls];
      onChange(newUrls);
      
      const successMessage = files.length === 1 
        ? 'Image uploaded successfully!'
        : `${files.length} images uploaded successfully!`;
      
      showMessage(successMessage, 'success');
      
    } catch (error) {
      console.error('Upload error:', error);
      showMessage(
        error instanceof Error ? error.message : 'Upload failed', 
        'error'
      );
    } finally {
      setIsUploading(false);
      // 清空input值以允许重复上传同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // 限制一次性上传的文件数量
      const remainingSlots = maxImages - value.length;
      const filesToUpload = imageFiles.slice(0, remainingSlots);
      
      if (imageFiles.length > remainingSlots) {
        showMessage(t('tooManyFiles', { 
          max: remainingSlots,
          fallback: `You can only add ${remainingSlots} more images` 
        }), 'error');
      }
      
      handleFileUpload(filesToUpload);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      // 限制一次性上传的文件数量
      const remainingSlots = maxImages - value.length;
      const filesToUpload = imageFiles.slice(0, remainingSlots);
      
      if (imageFiles.length > remainingSlots) {
        showMessage(t('tooManyFiles', { 
          max: remainingSlots,
          fallback: `You can only add ${remainingSlots} more images` 
        }), 'error');
      }
      
      handleFileUpload(filesToUpload);
    }
  };

  const removeImage = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleClearAll = () => {
    onChange([]);
    onClear?.();
    setUploadError(null);
    setUploadSuccess(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 消息显示区域 */}
      {uploadSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✅ {uploadSuccess}
        </div>
      )}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ❌ {uploadError}
        </div>
      )}
      
      {/* 已上传图片预览区域 */}
      {value.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Uploaded Images ({value.length}/{maxImages})
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {value.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full aspect-square object-cover rounded-lg border shadow-sm"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                  onClick={() => removeImage(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 上传区域 */}
      {value.length < maxImages && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-colors
            ${disabled || isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-primary/50'}
            ${isUploading ? 'border-primary bg-primary/5' : 'border-border'}
          `}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => e.preventDefault()}
          onClick={() => {
            if (!disabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple // 允许选择多个文件
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div className="space-y-4">
            {isUploading ? (
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
            ) : (
              <div className="flex items-center justify-center">
                {value.length === 0 ? (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                ) : (
                  <Plus className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
            )}
            
            <div>
              <p className="text-base font-medium text-foreground">
                {isUploading ? 'Uploading...' : 
                 value.length === 0 ? 'Click to upload or drag and drop multiple images' : 
                 'Add more images'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports JPG, PNG, WebP, GIF formats, file size up to 5MB
              </p>
              {value.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {maxImages - value.length} more images can be added
                </p>
              )}
            </div>

            {!isUploading && (
              <Button type="button" variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                {value.length === 0 ? 'Select Files' : 'Add More'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
