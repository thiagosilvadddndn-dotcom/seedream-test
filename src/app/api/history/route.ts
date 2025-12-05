import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'UNAUTHORIZED',
        message: 'Please sign in to view history' 
      }, { status: 401 });
    }

    // 获取分页参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 获取用户ID
    const { data: userProfileData, error: userError } = await supabaseAdmin
      .from('users_profile')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userProfileData?.id) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ 
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch user data' 
      }, { status: 500 });
    }

    // 获取历史记录
    const { data: historyData, error: historyError } = await supabaseAdmin
      .from('generation_history')
      .select('id, url, created_at')
      .eq('user_id', userProfileData.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (historyError) {
      console.error('Error fetching history:', historyError);
      return NextResponse.json({ 
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch generation history' 
      }, { status: 500 });
    }

    // 获取总数
    const { count, error: countError } = await supabaseAdmin
      .from('generation_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userProfileData.id);

    if (countError) {
      console.error('Error fetching history count:', countError);
    }

    return NextResponse.json({
      success: true,
      data: historyData || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching generation history:', error);
    return NextResponse.json({ 
      error: 'SERVER_ERROR',
      message: 'Failed to fetch generation history' 
    }, { status: 500 });
  }
}
