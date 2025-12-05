import { S3Client } from '@aws-sdk/client-s3';

// Cloudflare R2 客户端配置
export const r2Client = new S3Client({
  region: 'auto', // Cloudflare R2 使用 'auto' 作为 region
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

// R2 配置
export const R2_CONFIG = {
  BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
  PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL!, // 你的R2自定义域名或公开URL
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
};

// 生成唯一文件名
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  
  return `images/${timestamp}-${randomString}${extension}`;
}

// 验证文件类型
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // 检查文件大小
  if (file.size > R2_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `图片文件过大，请选择小于 ${Math.round(R2_CONFIG.MAX_FILE_SIZE / 1024 / 1024)}MB 的图片，或使用图片压缩工具减小文件大小`
    };
  }

  // 检查文件类型
  if (!R2_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: '只支持 JPG、PNG、WebP、GIF 和 AVIF 格式的图片'
    };
  }

  // 检查文件扩展名
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!R2_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: '文件扩展名不支持'
    };
  }

  return { isValid: true };
}
