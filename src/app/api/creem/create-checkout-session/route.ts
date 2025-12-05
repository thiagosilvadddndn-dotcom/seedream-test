import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreemAPI, creemConfig, getCreemPlan, BillingPeriod, PlanTier } from '@/lib/creem';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Please sign in to subscribe' 
      }, { status: 401 });
    }

    // 解析请求参数
    const { billingPeriod, planTier } = await request.json();
    
    if (!billingPeriod || !planTier) {
      return NextResponse.json({ 
        error: 'Invalid parameters',
        message: 'Please provide billingPeriod and planTier' 
      }, { status: 400 });
    }

    // 验证参数有效性
    const validBillingPeriods: BillingPeriod[] = ['monthly', 'yearly', 'oneTime'];
    const validPlanTiers: PlanTier[] = ['starter', 'pro', 'premium'];
    
    if (!validBillingPeriods.includes(billingPeriod) || !validPlanTiers.includes(planTier)) {
      return NextResponse.json({ 
        error: 'Invalid plan',
        message: 'Please select a valid billing period and plan tier' 
      }, { status: 400 });
    }

    const plan = getCreemPlan(billingPeriod, planTier);

    // 获取或创建用户档案（与 Stripe 版本相同的逻辑）
    const { data: userProfile, error: getUserError } = await supabaseAdmin
      .from('users_profile')
      .select('*')
      .eq('email', session.user.email)
      .single();

    let finalUserProfile = userProfile;

    if (getUserError && getUserError.code === 'PGRST116') {
      // 用户不存在，创建新用户
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users_profile')
        .insert({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
          credits: 3,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json({ 
          error: 'Database error',
          message: 'Failed to create user profile' 
        }, { status: 500 });
      }

      finalUserProfile = newUser;
    } else if (getUserError) {
      console.error('Error fetching user:', getUserError);
      return NextResponse.json({ 
        error: 'Database error',
        message: 'Failed to fetch user profile' 
      }, { status: 500 });
    }

    // 检查用户是否已有活跃订阅
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', finalUserProfile!.id)
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'Already subscribed',
        message: 'You already have an active subscription' 
      }, { status: 400 });
    }

    // 创建 Creem API 实例并创建结账会话
    const creemAPI = new CreemAPI(creemConfig);
    const checkoutSession = await creemAPI.createCheckoutSession({
      productId: plan.productId,
      successUrl: `${process.env.NEXTAUTH_URL}/?success=true`,
      customerEmail: session.user.email,
      billingPeriod: billingPeriod,
      planTier: planTier,
      userId: finalUserProfile!.id,
      requestId: `req_${finalUserProfile!.id}_${Date.now()}`, // 唯一的请求 ID
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.checkout_url, // Creem 返回的是 checkout_url
    });

  } catch (error) {
    console.error('Error creating Creem checkout session:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to create checkout session' 
    }, { status: 500 });
  }
}
