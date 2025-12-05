import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户基本信息和积分
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('users_profile')
      .select('id, credits, name, email')
      .eq('email', session.user.email)
      .single();

    if (userError) {
      console.error('Error fetching user profile:', userError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // 获取用户的活跃订阅信息
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userProfile.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let subscriptionInfo = null;
    if (!subscriptionError && subscription) {
      subscriptionInfo = {
        planName: subscription.plan_name,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        creditsPerMonth: subscription.credits_per_month,

      };
    }

    const dashboardData = {
      user: {
        name: userProfile.name,
        email: userProfile.email,
        image: session.user.image || null,
        credits: userProfile.credits || 0,
      },
      subscription: subscriptionInfo,
      hasPaidPlan: !!subscriptionInfo,
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 