'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/sections/hero/1/ui/button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { validateFile } from '@/lib/r2-client';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear?: () => void;
  placeholder?: string;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({ 
  value, 
  onChange, 
  onClear, 
  placeholder,
  accept = "image/*",
  disabled = false,
  className = "" 
}: ImageUploadProps) {
  const t = useTranslations('imageUpload');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 使用翻译或默认占位符
  const displayPlaceholder = placeholder || t('placeholder', { 
    fallback: 'Click to upload or drag image here' 
  });

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

  const handleFileUpload = async (file: File) => {
    // 文件验证
    const validation = validateFile(file);
    if (!validation.isValid) {
      showMessage(validation.error || t('validationError', { 
        fallback: 'File validation failed' 
      }), 'error');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      // 创建FormData并上传到R2
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(t('uploadFailed', { 
          status: response.statusText,
          fallback: `Upload failed: ${response.statusText}` 
        }));
      }
      
      const result = await response.json();
      
      if (result.success) {
        onChange(result.url);
        showMessage(t('uploadSuccess', { 
          fallback: 'Image uploaded successfully to cloud storage' 
        }), 'success');
      } else {
        throw new Error(result.error || t('uploadFailed', { 
          fallback: 'Upload failed' 
        }));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('unknownError', {
        fallback: 'Unknown error'
      });
      showMessage(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (disabled || isUploading) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
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
      
      {/* 图片预览区域 */}
      {value && (
        <div className="relative">
          <img
            src={value}
            alt={t('uploadedImageAlt', { fallback: 'Uploaded image' })}
            className="w-full max-w-md rounded-lg border shadow-sm"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => {
              onClear?.();
              setUploadError(null);
              setUploadSuccess(null);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {/* 上传区域 */}
      {!value && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <div className="space-y-4">
            {isUploading ? (
              <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin" />
            ) : (
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
            )}
            
            <div>
              <p className="text-base font-medium text-foreground">
                {isUploading ? t('uploading', { fallback: 'Uploading...' }) : displayPlaceholder}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('fileFormatInfo', { 
                  fallback: 'Supports JPG, PNG, WebP, GIF formats, file size up to 5MB' 
                })}
              </p>
            </div>
            
            {!isUploading && (
              <Button type="button" variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                {t('selectFile', { fallback: 'Select File' })}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
