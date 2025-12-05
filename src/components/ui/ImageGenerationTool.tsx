'use client';

import { useState } from 'react';
import { Button } from '@/components/sections/hero/1/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, RefreshCw, AlertCircle, CreditCard, Download, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import AspectRatioSelector from './AspectRatioSelector';
import SignInDialog from '../auth/SignInDialog';
import ImageCarousel from './ImageCarousel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MODEL_CONFIG, getModelConfig, getDefaultModel, type AspectRatioValue } from '@/config/models.config';
import { 
  ASPECT_RATIO_CONFIG, 
  PROMPT_CONFIG,
  DIMENSIONS_CONFIG,
  IMAGE_UPLOAD_CONFIG,
} from '@/config/image-tool.config';
import { Input } from '@/components/ui/input';
import ImageUpload from './ImageUpload';

interface ImageGenerationToolProps {
  placeholder: string;
  generateButton: string;
  aspectRatioLabel: string;
  aspectRatioOptions: Array<{
    value: string;
    label: string;
  }>;
  examples: string[];
  carouselImages?: Array<{
    src: string;
    alt: string;
  }>;
}

interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  creditsUsed?: number;
  remainingCredits?: number;
  error?: string;
  message?: string;
  currentCredits?: number;
  requiredCredits?: number;
}

const ImageGenerationTool = ({ 
  placeholder, 
  generateButton, 
  aspectRatioLabel,
  aspectRatioOptions,
  examples,
  carouselImages = []
}: ImageGenerationToolProps) => {
  // 基础状态
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  
  // 模型相关状态
  const defaultModel = getDefaultModel();
  const [model, setModel] = useState(defaultModel.value);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  
  // 🔥 新增：双模型切换状态
  const [selectedModel, setSelectedModel] = useState<'nano-banana-fast' | 'nano-banana-pro'>('nano-banana-fast');
  
  // 尺寸参数状态
  const [width, setWidth] = useState(DIMENSIONS_CONFIG.width.default.toString());
  const [height, setHeight] = useState(DIMENSIONS_CONFIG.height.default.toString());
  const [imageWidth, setImageWidth] = useState(DIMENSIONS_CONFIG.imageWidth.default.toString());
  const [imageHeight, setImageHeight] = useState(DIMENSIONS_CONFIG.imageHeight.default.toString());
  
  // 图片上传状态
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  
  const t = useTranslations('toolSection');
  const router = useRouter();
  
  // 获取当前模型配置
  const currentModelConfig = getModelConfig(model);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(t('errors.invalidParams'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // 构建请求体（只包含必要参数）
      const requestBody: Record<string, string | number> = {
        model: selectedModel, // 🔥 使用双模型切换状态
        prompt: prompt.trim(),
      };
      
      // 添加宽高比（如果模型支持）
      if (currentModelConfig?.features.aspectRatio) {
        requestBody.aspectRatio = aspectRatio;
      }
      
      // 添加自定义尺寸（如果模型支持）
      if (currentModelConfig?.features.customDimensions && width && height) {
        requestBody.width = parseInt(width);
        requestBody.height = parseInt(height);
      }
      
      // 添加图片输入尺寸（如果模型支持）
      if (currentModelConfig?.features.imageInputDimensions && imageWidth && imageHeight) {
        requestBody.imageWidth = parseInt(imageWidth);
        requestBody.imageHeight = parseInt(imageHeight);
      }
      
      // 添加上传的图片 URL（如果模型支持图生图且用户已上传）
      if (currentModelConfig?.features.imageUpload && uploadedImageUrl) {
        requestBody.inputImageUrl = uploadedImageUrl;
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result: GenerationResult = await response.json();

      if (!response.ok) {
        switch (result.error) {
          case 'UNAUTHORIZED':
            setShowSignInDialog(true);
            break;
          case 'INSUFFICIENT_CREDITS':
            setError(t('errors.insufficientCredits', {
              required: result.requiredCredits || 0,
              current: result.currentCredits || 0
            }));
            break;
          default:
            setError(result.message || t('errors.generationFailed'));
        }
        return;
      }

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
      }

    } catch (error) {
      console.error('Generation error:', error);
      setError(t('errors.generationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError(null);
  };

  const handleGoToPricing = () => {
    // 滚动到pricing部分
    const pricingElement = document.getElementById('pricing');
    if (pricingElement) {
      pricingElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      // 如果pricing组件不在当前页面，可以跳转
      router.push('/#pricing');
    }
  };

  const handleDownloadImage = async () => {
    if (!generatedImage) return;
    
    try {
      // 设置下载状态
      setIsDownloading(true);
      setError(null);
      
      // 使用fetch获取图片数据
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      
      // 创建blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // 创建一个临时链接并触发下载
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ai-generated-image-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
      setError(t('errors.downloadFailed', {fallback: 'Failed to download image. Please try again.'}));
    } finally {
      setIsDownloading(false);
    }
  };

  const getOutputAspectClass = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <>
      <div className="w-full bg-gradient-to-r from-primary/10 via-background to-primary/5 dark:from-primary/20 dark:via-background dark:to-primary/10">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">
          {/* Input Area - Full width on mobile, 2/5 on desktop */}
          <div className="col-span-1 lg:col-span-2 p-4 lg:p-8 bg-background/95 backdrop-blur-sm border-b-2 lg:border-b-0 lg:border-r-2 border-border dark:border-border shadow-lg">
            <div className="max-w-lg mx-auto space-y-4 lg:space-y-6 h-full">
              {/* Model Selector */}
              {MODEL_CONFIG.showDropdown && MODEL_CONFIG.options.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">AI Model</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-between bg-background hover:bg-muted/50 border-2 border-border"
                      >
                        <span className="flex items-center">
                          <Wand2 className="w-4 h-4 mr-2" />
                          {currentModelConfig?.label || 'Select Model'}
                        </span>
                        <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-[var(--radix-dropdown-menu-trigger-width)] bg-background border-2 border-border"
                      align="start"
                      sideOffset={4}
                    >
                      {MODEL_CONFIG.options.map((modelOption) => (
                        <DropdownMenuItem
                          key={modelOption.value}
                          onClick={() => setModel(modelOption.value)}
                          className={cn(
                            "cursor-pointer px-3 py-2",
                            model === modelOption.value && "bg-primary/10 font-medium"
                          )}
                        >
                          <span className="font-medium">{modelOption.label}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Prompt Input */}
              <div className="space-y-2 lg:space-y-3">
                <label className="text-sm font-semibold text-foreground">Prompt</label>
                <Textarea
                  placeholder={placeholder || PROMPT_CONFIG.placeholder}
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  className="min-h-[80px] lg:min-h-[120px] text-base resize-none border-2 border-border focus:border-primary/50 dark:focus:border-primary/50 transition-all duration-300"
                  maxLength={PROMPT_CONFIG.maxLength}
                />
              </div>

              {/* Image Upload - 当模型支持图片上传时显示 */}
              {currentModelConfig?.features.imageUpload && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    {IMAGE_UPLOAD_CONFIG.label}
                  </label>
                  <ImageUpload
                    value={uploadedImageUrl}
                    onChange={setUploadedImageUrl}
                    onClear={() => setUploadedImageUrl('')}
                    placeholder={IMAGE_UPLOAD_CONFIG.placeholder}
                    accept={IMAGE_UPLOAD_CONFIG.accept}
                  />
                </div>
              )}

              {/* Aspect Ratio Selector - 根据模型配置显示 */}
              {currentModelConfig?.features.aspectRatio && (
                <div className="space-y-4 lg:space-y-8">
                  <label className="text-sm font-semibold text-foreground">{aspectRatioLabel}</label>
                  <div className="pt-1 lg:pt-2">
                    <AspectRatioSelector
                      value={aspectRatio}
                      onChange={(value: string) => setAspectRatio(value as AspectRatioValue)}
                      options={aspectRatioOptions}
                    />
                  </div>
                </div>
              )}

              {/* Image Width & Height - 当模型支持自定义尺寸时显示 */}
              {currentModelConfig?.features.customDimensions && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Width Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      {DIMENSIONS_CONFIG.width.label}
                    </label>
                    <Input
                      type="number"
                      placeholder={DIMENSIONS_CONFIG.width.placeholder}
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      onBlur={(e) => {
                        // 失焦时验证并修正值
                        const value = e.target.value;
                        const numValue = parseInt(value);
                        if (!value || isNaN(numValue)) {
                          setWidth(DIMENSIONS_CONFIG.width.default.toString());
                        } else if (numValue < DIMENSIONS_CONFIG.width.min) {
                          setWidth(DIMENSIONS_CONFIG.width.min.toString());
                        } else if (numValue > DIMENSIONS_CONFIG.width.max) {
                          setWidth(DIMENSIONS_CONFIG.width.max.toString());
                        }
                      }}
                      min={DIMENSIONS_CONFIG.width.min}
                      max={DIMENSIONS_CONFIG.width.max}
                      step={DIMENSIONS_CONFIG.width.step}
                      className="border-2 border-border focus:border-primary/50"
                    />
                  </div>

                  {/* Height Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      {DIMENSIONS_CONFIG.height.label}
                    </label>
                    <Input
                      type="number"
                      placeholder={DIMENSIONS_CONFIG.height.placeholder}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      onBlur={(e) => {
                        // 失焦时验证并修正值
                        const value = e.target.value;
                        const numValue = parseInt(value);
                        if (!value || isNaN(numValue)) {
                          setHeight(DIMENSIONS_CONFIG.height.default.toString());
                        } else if (numValue < DIMENSIONS_CONFIG.height.min) {
                          setHeight(DIMENSIONS_CONFIG.height.min.toString());
                        } else if (numValue > DIMENSIONS_CONFIG.height.max) {
                          setHeight(DIMENSIONS_CONFIG.height.max.toString());
                        }
                      }}
                      min={DIMENSIONS_CONFIG.height.min}
                      max={DIMENSIONS_CONFIG.height.max}
                      step={DIMENSIONS_CONFIG.height.step}
                      className="border-2 border-border focus:border-primary/50"
                    />
                  </div>
                </div>
              )}

              {/* Image Width & Height (for image upload) - 当模型支持图片输入尺寸时显示 */}
              {currentModelConfig?.features.imageInputDimensions && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Image Width Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      {DIMENSIONS_CONFIG.imageWidth.label}
                    </label>
                    <Input
                      type="number"
                      placeholder={DIMENSIONS_CONFIG.imageWidth.placeholder}
                      value={imageWidth}
                      onChange={(e) => setImageWidth(e.target.value)}
                      onBlur={(e) => {
                        // 失焦时验证并修正值
                        const value = e.target.value;
                        const numValue = parseInt(value);
                        if (!value || isNaN(numValue)) {
                          setImageWidth(DIMENSIONS_CONFIG.imageWidth.default.toString());
                        } else if (numValue < DIMENSIONS_CONFIG.imageWidth.min) {
                          setImageWidth(DIMENSIONS_CONFIG.imageWidth.min.toString());
                        } else if (numValue > DIMENSIONS_CONFIG.imageWidth.max) {
                          setImageWidth(DIMENSIONS_CONFIG.imageWidth.max.toString());
                        }
                      }}
                      min={DIMENSIONS_CONFIG.imageWidth.min}
                      max={DIMENSIONS_CONFIG.imageWidth.max}
                      step={DIMENSIONS_CONFIG.imageWidth.step}
                      className="border-2 border-border focus:border-primary/50"
                    />
                  </div>

                  {/* Image Height Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      {DIMENSIONS_CONFIG.imageHeight.label}
                    </label>
                    <Input
                      type="number"
                      placeholder={DIMENSIONS_CONFIG.imageHeight.placeholder}
                      value={imageHeight}
                      onChange={(e) => setImageHeight(e.target.value)}
                      onBlur={(e) => {
                        // 失焦时验证并修正值
                        const value = e.target.value;
                        const numValue = parseInt(value);
                        if (!value || isNaN(numValue)) {
                          setImageHeight(DIMENSIONS_CONFIG.imageHeight.default.toString());
                        } else if (numValue < DIMENSIONS_CONFIG.imageHeight.min) {
                          setImageHeight(DIMENSIONS_CONFIG.imageHeight.min.toString());
                        } else if (numValue > DIMENSIONS_CONFIG.imageHeight.max) {
                          setImageHeight(DIMENSIONS_CONFIG.imageHeight.max.toString());
                        }
                      }}
                      min={DIMENSIONS_CONFIG.imageHeight.min}
                      max={DIMENSIONS_CONFIG.imageHeight.max}
                      step={DIMENSIONS_CONFIG.imageHeight.step}
                      className="border-2 border-border focus:border-primary/50"
                    />
                  </div>
                </div>
              )}

              {/* 🔥 新增：双模型切换组件 */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">AI Model</label>
                <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setSelectedModel('nano-banana-fast')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-md text-sm font-medium transition-all duration-200",
                      selectedModel === 'nano-banana-fast' 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span className="font-semibold">Fast</span>
                    <span className="text-xs opacity-75">12 Credits</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedModel('nano-banana-pro')}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-md text-sm font-medium transition-all duration-200",
                      selectedModel === 'nano-banana-pro' 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span className="font-semibold">Pro</span>
                    <span className="text-xs opacity-75">30 Credits</span>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                size="lg" 
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={cn(
                  "w-full h-10 lg:h-12 text-sm lg:text-base font-semibold transition-all duration-300 transform",
                  "hover:scale-105 hover:shadow-xl active:scale-95",
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                  "border-0",
                  "shadow-md hover:shadow-lg",
                  isGenerating && "animate-pulse"
                )}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    {t('generating')}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
                    {generateButton}
                  </>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className={cn(
                  "p-4 border rounded-lg transition-all duration-300",
                  // 检查是否是积分不足错误
                  (error.includes('积分不足') || error.includes('Not enough credits')) ? 
                    // 积分不足的特殊样式：红色背景、自定义闪烁动画、阴影
                    "bg-red-50 border-red-300 shadow-red-100 shadow-lg ring-2 ring-red-200 credits-warning" :
                    // 普通错误样式
                    "bg-destructive/10 border-destructive/20"
                )}>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className={cn(
                      "w-5 h-5 flex-shrink-0 mt-0.5",
                      (error.includes('积分不足') || error.includes('Not enough credits')) ? 
                        "text-red-600 animate-pulse" : 
                        "text-destructive"
                    )} />
                    <div className="space-y-2">
                      <p className={cn(
                        "text-sm font-medium",
                        (error.includes('积分不足') || error.includes('Not enough credits')) ? 
                          "text-red-700" : 
                          "text-destructive"
                      )}>{error}</p>
                      {(error.includes('积分不足') || error.includes('Not enough credits')) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleGoToPricing}
                          className={cn(
                            "text-xs transition-all duration-300 transform hover:scale-105",
                            "bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700",
                            "shadow-lg hover:shadow-xl credits-warning-button"
                          )}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          {t('errors.needMoreCredits')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Example Prompts */}
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-4 bg-primary rounded-full"></div>
                  <label className="text-sm font-semibold text-foreground">Try these examples:</label>
                </div>
                <div className="space-y-2 max-h-32 lg:max-h-40 overflow-y-auto custom-scrollbar">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className={cn(
                        "w-full text-left p-2 lg:p-3 rounded-lg border-2 border-transparent",
                        "bg-muted hover:bg-muted/80",
                        "hover:border-border",
                        "transition-all duration-300 transform hover:translate-x-1",
                        "text-xs lg:text-sm leading-relaxed font-medium"
                      )}
                    >
                      <span className="text-muted-foreground mr-2">💡</span>
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Output Area - Full width on mobile, 3/5 on desktop */}
          <div className="col-span-1 lg:col-span-3 p-4 lg:p-8 bg-gradient-to-br from-primary/5 via-background/80 to-primary/10 dark:from-primary/10 dark:via-background/80 dark:to-primary/5 backdrop-blur-sm">
            <div className="max-w-2xl mx-auto h-full">
              <div className="space-y-4 lg:space-y-6 h-full">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-6 bg-primary rounded-full"></div>
                  <h3 className="text-lg lg:text-xl font-bold text-foreground">Generated Images</h3>
                </div>
                
                {/* Generated Image Display */}
                <div className="space-y-4 flex-1">
                  <div className={cn(
                    "w-full rounded-2xl border-2 border-dashed border-border",
                    "flex items-center justify-center shadow-inner",
                    "hover:border-primary/50 transition-all duration-500",
                    getOutputAspectClass(),
                    generatedImage ? "border-solid border-primary/50 bg-background" : "bg-muted/30"
                  )}>
                    {generatedImage ? (
                      // 显示生成的图片
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <img
                          src={generatedImage}
                          alt="Generated image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : isGenerating ? (
                      // 生成中状态
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <Wand2 className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
                          <div className="absolute inset-0 w-16 h-16 mx-auto bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-base lg:text-lg font-semibold text-muted-foreground">
                            {t('generating')}
                          </p>
                          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-muted rounded-full border border-border">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <p className="text-xs lg:text-sm font-medium text-foreground">Aspect Ratio: {aspectRatio}</p>
                          </div>
                        </div>
                      </div>
                    ) : carouselImages.length > 0 ? (
                      // 显示轮播图片（初始状态）
                      <ImageCarousel 
                        images={carouselImages}
                        autoPlayInterval={4000}
                        className="w-full h-full"
                      />
                    ) : (
                      // 默认占位符（如果没有轮播图片）
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <Wand2 className="w-16 h-16 mx-auto text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-base lg:text-lg font-semibold text-muted-foreground">
                            Your generated image will appear here
                          </p>
                          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-muted rounded-full border border-border">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <p className="text-xs lg:text-sm font-medium text-foreground">Aspect Ratio: {aspectRatio}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Download Button */}
                  {generatedImage && (
                    <div className="flex justify-center mt-3 lg:mt-4">
                      <Button 
                        onClick={handleDownloadImage}
                        disabled={isDownloading}
                        className={cn(
                          "px-4 lg:px-6 py-2 text-xs lg:text-sm font-semibold transition-all duration-300 transform",
                          "hover:scale-105 hover:shadow-lg active:scale-95",
                          "bg-primary hover:bg-primary/90 text-primary-foreground",
                          "border-0 shadow-md",
                          isDownloading && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {t('downloading', {fallback: 'Downloading...'})}
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            {t('downloadImage', {fallback: 'Download Image'})}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Dialog */}
      <SignInDialog 
        open={showSignInDialog} 
        onOpenChange={setShowSignInDialog} 
      />
    </>
  );
};

export default ImageGenerationTool; 