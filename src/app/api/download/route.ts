import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'UNAUTHORIZED',
        message: 'Please sign in to download images' 
      }, { status: 401 });
    }

    // 获取图片URL参数
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'generated-image.jpg';

    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'BAD_REQUEST',
        message: 'Image URL is required' 
      }, { status: 400 });
    }

    // 获取图片
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      return NextResponse.json({ 
        error: 'NOT_FOUND',
        message: 'Image not found' 
      }, { status: 404 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // 返回图片作为下载
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error downloading image:', error);
    return NextResponse.json({ 
      error: 'SERVER_ERROR',
      message: 'Failed to download image' 
    }, { status: 500 });
  }
}
