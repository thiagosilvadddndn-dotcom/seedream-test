import { NextRequest, NextResponse } from 'next/server';
import { validateAdminCredentials } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const isValid = validateAdminCredentials(username, password);

    if (isValid) {
      return NextResponse.json({ message: '登录成功' });
    } else {
      return NextResponse.json(
        { message: '用户名或密码错误' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: '服务器错误' },
      { status: 500 }
    );
  }
}