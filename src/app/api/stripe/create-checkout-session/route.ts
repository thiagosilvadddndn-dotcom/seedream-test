import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, STRIPE_PLANS, BillingPeriod, PlanTier } from '@/lib/stripe';
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
    
    if (!billingPeriod || !planTier || !STRIPE_PLANS[billingPeriod as BillingPeriod]?.[planTier as PlanTier]) {
      return NextResponse.json({ 
        error: 'Invalid plan',
        message: 'Please select a valid subscription plan' 
      }, { status: 400 });
    }

    const plan = STRIPE_PLANS[billingPeriod as BillingPeriod][planTier as PlanTier];

    // 获取或创建用户档案
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

    // 检查用户是否已有活跃订阅（仅对recurring plans检查）
    if (billingPeriod !== 'oneTime') {
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
    }

    // 创建或获取Stripe客户
    let stripeCustomerId = '';
    
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      stripeCustomerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: {
          userId: finalUserProfile!.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // 确定checkout模式
    const mode = billingPeriod === 'oneTime' ? 'payment' : 'subscription';

    // 创建结账会话
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/?canceled=true`,
      metadata: {
        userId: finalUserProfile!.id,
        billingPeriod: billingPeriod,
        planTier: planTier,
        credits: plan.credits.toString(),
      },
      ...(mode === 'subscription' && {
        subscription_data: {
          metadata: {
            userId: finalUserProfile!.id,
            billingPeriod: billingPeriod,
            planTier: planTier,
            credits: plan.credits.toString(),
          },
        },
      }),
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to create checkout session' 
    }, { status: 500 });
  }
} 