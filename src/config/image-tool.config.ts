/**
 * 图片生成工具预设配置文件
 * 
 * 这个文件定义了所有可用的预设值（选项库）
 * Aspect Ratio 为固定选项，不受模型控制
 */

import type { AspectRatioValue } from './models.config';

// ==================== 宽高比配置 ====================

export interface AspectRatioOption {
  value: AspectRatioValue;
  label: string;
  icon: string;
  dimensions?: string;  // 示例尺寸说明
}

export const ASPECT_RATIO_CONFIG = {
  label: 'Aspect Ratio',
  options: [
    { 
      value: '1:1', 
      label: 'Square (1:1)', 
      icon: '⬛',
      dimensions: '1024×1024'
    },
    { 
      value: '16:9', 
      label: 'Landscape (16:9)', 
      icon: '▭',
      dimensions: '1360×768'
    },
    { 
      value: '9:16', 
      label: 'Portrait (9:16)', 
      icon: '▯',
      dimensions: '768×1360'
    },
    { 
      value: '4:3', 
      label: 'Classic (4:3)', 
      icon: '▬',
      dimensions: '1280×960'
    },
    { 
      value: '3:4', 
      label: 'Portrait Classic (3:4)', 
      icon: '▮',
      dimensions: '960×1280'
    },
  ] as AspectRatioOption[],
  default: '1:1' as AspectRatioValue,
} as const;

// ==================== 图片上传配置 ====================

export const IMAGE_UPLOAD_CONFIG = {
  label: 'Reference Image',
  accept: 'image/*',
  maxSize: 10 * 1024 * 1024,  // 10MB
  supportedFormats: ['JPG', 'JPEG', 'PNG', 'WebP', 'GIF'],
  placeholder: 'Upload a reference image (optional)',
  helpText: 'Use an image as a starting point for generation',
} as const;

// ==================== 提示词配置 ====================

export const PROMPT_CONFIG = {
  label: 'Prompt',
  placeholder: 'Describe the image you want to generate...',
  minLength: 1,
  maxLength: 1000,
  showExamples: true,
  examples: [
    'A serene mountain landscape at sunset with vibrant orange and pink skies',
    'Futuristic cityscape with neon lights and flying cars',
    'Portrait of a wise old wizard with a long white beard',
    'Cute cartoon cat playing with a ball of yarn',
    'Abstract geometric pattern in pastel colors',
    'Underwater scene with colorful coral reef and tropical fish',
  ],
} as const;

// ==================== 尺寸参数配置 ====================

export const DIMENSIONS_CONFIG = {
  width: {
    label: 'Image Width',
    placeholder: '1024',
    min: 512,
    max: 1920,
    default: 1024,
    step: 64,
    helpText: '范围: 512 - 1920',
  },
  height: {
    label: 'Image Height',
    placeholder: '1024',
    min: 512,
    max: 1920,
    default: 1024,
    step: 64,
    helpText: '范围: 512 - 1920',
  },
  imageWidth: {
    label: 'Image Width (for upload)',
    placeholder: '1024',
    min: 512,
    max: 1920,
    default: 1024,
    step: 64,
    helpText: '范围: 512 - 1920',
  },
  imageHeight: {
    label: 'Image Height (for upload)',
    placeholder: '1024',
    min: 512,
    max: 1920,
    default: 1024,
    step: 64,
    helpText: '范围: 512 - 1920',
  },
} as const;

// ==================== 积分配置 ====================

export const CREDITS_CONFIG = {
  // creditsPerImage 已移至模型配置中
  showCostInfo: true,
  insufficientCreditsMessage: 'Not enough credits. Please purchase more to continue.',
  needMoreCreditsButton: 'Get More Credits',
} as const;

// ==================== 生成配置 ====================

export const GENERATION_CONFIG = {
  maxBatchSize: 4,  // 默认最大批量生成数量（可被模型配置覆盖）
  showProgress: true,
  autoDownload: false,
  saveToHistory: true,
} as const;

// ==================== UI 配置 ====================

export const UI_CONFIG = {
  layout: 'split',  // 'split' | 'stacked'
  showExamples: true,
  showCarousel: true,
  animateGeneration: true,
  theme: {
    primaryColor: 'hsl(var(--primary))',
    accentColor: 'hsl(var(--accent))',
  },
} as const;

// ==================== 导出所有配置 ====================

export const IMAGE_TOOL_CONFIG = {
  aspectRatio: ASPECT_RATIO_CONFIG,
  imageUpload: IMAGE_UPLOAD_CONFIG,
  prompt: PROMPT_CONFIG,
  dimensions: DIMENSIONS_CONFIG,
  credits: CREDITS_CONFIG,
  generation: GENERATION_CONFIG,
  ui: UI_CONFIG,
} as const;

export default IMAGE_TOOL_CONFIG;
