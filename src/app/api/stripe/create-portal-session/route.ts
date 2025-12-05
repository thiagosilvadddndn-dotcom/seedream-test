import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 2. 获取用户信息
    const { data: user } = await supabaseAdmin
      .from('users_profile')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 3. 查找用户的订阅信息以获取 customer_id
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing', 'past_due', 'canceled'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: '没有找到订阅信息' }, { status: 404 });
    }

    // 4. 创建 Customer Portal 会话
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    // 5. 返回 Portal URL
    return NextResponse.json({
      success: true,
      url: portalSession.url
    });

  } catch (error) {
    console.error('创建 Customer Portal 会话失败:', error);
    return NextResponse.json({ 
      error: '无法创建管理会话，请稍后重试' 
    }, { status: 500 });
  }
}
