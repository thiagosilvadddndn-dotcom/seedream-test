import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG, generateUniqueFileName } from './r2-client';

/**
 * 从URL下载图片并上传到R2
 * @param imageUrl - 原始图片URL（来自Replicate等）
 * @returns Promise<string> - R2的公开访问URL
 */
export async function uploadImageToR2(imageUrl: string): Promise<string> {
  try {
    // 从URL下载图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // 获取图片数据
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    // 从响应头获取content-type，如果没有则默认为jpeg
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // 根据content-type确定文件扩展名
    const getExtensionFromContentType = (contentType: string): string => {
      switch (contentType) {
        case 'image/png': return '.png';
        case 'image/webp': return '.webp';
        case 'image/gif': return '.gif';
        case 'image/avif': return '.avif';
        default: return '.jpg';
      }
    };

    const extension = getExtensionFromContentType(contentType);
    const fileName = generateUniqueFileName(`generated${extension}`);

    // 上传到R2
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      ContentLength: buffer.length,
    });

    await r2Client.send(uploadCommand);

    // 构建公开访问URL
    const publicUrl = `${R2_CONFIG.PUBLIC_URL}/${fileName}`;

    console.log(`✅ Image uploaded to R2: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    console.error('❌ Error uploading image to R2:', error);
    throw new Error('Failed to upload image to R2');
  }
}
