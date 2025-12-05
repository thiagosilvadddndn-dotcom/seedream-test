/**
 * AI 图片生成模型配置文件
 * 
 * 这个文件定义了所有可用的 AI 模型及其特性配置
 * 每个模型可以独立控制支持的功能、比例、分辨率和积分消耗
 */

// ==================== 类型定义 ====================

export type AspectRatioValue = '1:1' | '16:9' | '9:16' | '3:4' | '4:3';

/**
 * 模型功能开关
 * 控制每个模型支持的功能
 */
export interface ModelFeatures {
  prompt: boolean;              // 是否支持文本提示词（必须为 true）
  imageUpload: boolean;         // 是否支持图片上传（图生图）
  aspectRatio: boolean;         // 是否支持宽高比选择
  customDimensions: boolean;    // 是否支持自定义宽高（width/height）
  imageInputDimensions: boolean; // 是否支持图片输入尺寸（image_width/image_height）
}

/**
 * 模型配置接口
 */
export interface ModelConfig {
  value: string;                              // 模型 ID（通常是 Replicate 的 version）
  label: string;                              // 显示名称
  features: ModelFeatures;                    // 功能开关
  
  // API 参数映射（不同模型可能使用不同的字段名）
  apiFieldNames?: {
    prompt?: string;                          // 默认 'prompt'
    image?: string;                           // 默认 'input_image'
    aspectRatio?: string;                     // 默认 'aspect_ratio'
    width?: string;                           // 默认 'width'
    height?: string;                          // 默认 'height'
    imageWidth?: string;                      // 默认 'image_width'
    imageHeight?: string;                     // 默认 'image_height'
  };
  
  // 积分消耗
  creditsPerImage: number;                    // 每张图片消耗的积分
}

// ==================== 模型配置 ====================

export const MODEL_CONFIG = {
  enabled: true,                              // 是否启用模型选择功能
  label: 'AI Model',                          // 标签
  showDropdown: true,                         // 是否显示下拉选择器
  
  options: [
    {
      // TODO: When Replicate model is updated, rename this value to seedream
      value: 'google/nano-banana',
      label: 'Seedream 4.5',
      features: {
        prompt: true,
        imageUpload: true,                 // ✅ 不支持图生图
        aspectRatio: true,                  // ✅ 支持宽高比选择
        customDimensions: false,            // ❌ 不支持自定义 width/height
        imageInputDimensions: false,        // ❌ 不支持 image_width/image_height
      },
      apiFieldNames: {
        image: 'input_image',               // 图片字段名
      },
      creditsPerImage: 12,
    } as ModelConfig,
  ],
} as const;

// ==================== 辅助函数 ====================

/**
 * 获取指定模型的配置
 */
export function getModelConfig(modelValue: string): ModelConfig | undefined {
  return MODEL_CONFIG.options.find(model => model.value === modelValue);
}

/**
 * 获取默认模型
 */
export function getDefaultModel(): ModelConfig {
  // 返回第一个模型作为默认模型
  return MODEL_CONFIG.options[0];
}

/**
 * 获取所有可用模型
 */
export function getAvailableModels(): readonly ModelConfig[] {
  return MODEL_CONFIG.options;
}

/**
 * 检查模型是否支持某个功能
 */
export function modelSupportsFeature(
  modelValue: string, 
  feature: keyof ModelFeatures
): boolean {
  const config = getModelConfig(modelValue);
  return config?.features[feature] ?? false;
}

/**
 * 获取模型的 API 字段名（带默认值）
 */
export function getApiFieldName(
  modelValue: string,
  field: keyof NonNullable<ModelConfig['apiFieldNames']>
): string {
  const config = getModelConfig(modelValue);
  const customName = config?.apiFieldNames?.[field];
  
  // 如果有自定义字段名，返回自定义名
  if (customName) return customName;
  
  // 否则返回默认字段名
  const defaultNames: Record<string, string> = {
    prompt: 'prompt',
    image: 'input_image',
    aspectRatio: 'aspect_ratio',
    width: 'width',
    height: 'height',
    imageWidth: 'image_width',
    imageHeight: 'image_height',
  };
  
  return defaultNames[field] || field;
}

export default MODEL_CONFIG;
