import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// 定义类型接口
interface UserProfile {
  email: string;
}

interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  credits_per_month: number;
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

    // 获取订阅数据，同时获取用户邮箱
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_name,
        status,
        current_period_start,
        current_period_end,
        credits_per_month,
        users_profile (
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // 格式化数据，添加用户邮箱
    const formattedSubscriptions = (subscriptions as SubscriptionRecord[])?.map(sub => {
      // 处理users_profile可能是数组的情况
      const userProfile = Array.isArray(sub.users_profile) 
        ? sub.users_profile[0] 
        : sub.users_profile;
      
      return {
        id: sub.id,
        user_id: sub.user_id,
        user_email: userProfile?.email || 'Unknown',
        plan_name: sub.plan_name,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        credits_per_month: sub.credits_per_month,
      };
    }) || [];

    return NextResponse.json({ 
      subscriptions: formattedSubscriptions,
      total: formattedSubscriptions.length
    });

  } catch (error) {
    console.error('Error in admin subscriptions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}