import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_CONFIG, validateFile, generateUniqueFileName } from '@/lib/r2-client';

export async function POST(request: NextRequest) {
  try {
    // 解析FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false,
        error: 'No file provided' 
      }, { status: 400 });
    }

    // 验证文件
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json({ 
        success: false,
        error: validation.error 
      }, { status: 400 });
    }

    // 生成唯一文件名
    const fileName = generateUniqueFileName(file.name);
    
    // 转换文件为Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上传到R2
    const uploadCommand = new PutObjectCommand({
      Bucket: R2_CONFIG.BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ContentLength: buffer.length,
    });

    await r2Client.send(uploadCommand);

    // 构建公开访问URL
    const publicUrl = `${R2_CONFIG.PUBLIC_URL}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Upload failed. Please try again.' 
    }, { status: 500 });
  }
}
