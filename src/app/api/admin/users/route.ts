import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 简单验证 - 检查token是否存在（实际项目中应该验证token的有效性）
    const base64Credentials = authHeader.substring(6);
    if (!base64Credentials) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 获取用户数据
    const { data: users, error } = await supabaseAdmin
      .from('users_profile')
      .select('id, email, name, avatar, credits, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ 
      users: users || [],
      total: users?.length || 0
    });

  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}