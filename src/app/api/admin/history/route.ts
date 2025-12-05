import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// 定义类型接口
interface UserProfile {
  email: string;
}

interface GenerationHistoryRecord {
  id: string;
  user_id: string;
  url: string;
  created_at: string;
  users_profile: UserProfile | UserProfile[] | null;
}

export async function GET(request: NextRequest) {
  try {
    // 验证管理员身份
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 简单验证 - 检查token是否存在
    const base64Credentials = authHeader.substring(6);
    if (!base64Credentials) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 获取历史记录数据，同时获取用户邮箱
    const { data: history, error } = await supabaseAdmin
      .from('generation_history')
      .select(`
        id,
        user_id,
        url,
        created_at,
        users_profile (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching generation history:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // 格式化数据，添加用户邮箱
    const formattedHistory = (history as GenerationHistoryRecord[])?.map(record => {
      // 处理users_profile可能是数组的情况
      const userProfile = Array.isArray(record.users_profile) 
        ? record.users_profile[0] 
        : record.users_profile;
      
      return {
        id: record.id,
        user_id: record.user_id,
        user_email: userProfile?.email || 'Unknown',
        url: record.url,
        created_at: record.created_at,
      };
    }) || [];

    return NextResponse.json({ 
      history: formattedHistory,
      total: formattedHistory.length
    });

  } catch (error) {
    console.error('Error in admin history API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}