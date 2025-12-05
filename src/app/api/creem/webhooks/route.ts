import { NextRequest, NextResponse } from 'next/server';
import { CreemAPI, creemConfig, getCreemPlan, BillingPeriod, PlanTier } from '@/lib/creem';
import { supabaseAdmin } from '@/lib/supabase-admin';

const webhookSecret = process.env.CREEM_WEBHOOK_SECRET!;

// Creem webhook 事件类型定义
interface CreemWebhookEvent {
  id: string;
  eventType: string;
  created_at: number;
  object: CreemCheckoutData | CreemSubscriptionData;
}

// 扩展 Creem 类型定义以支持新的计费结构
interface CreemCheckoutData {
  id: string;
  order_id?: string;
  customer_id?: string;
  product_id?: string;
  subscription_id?: string;
  request_id?: string;
  metadata?: {
    userId?: string;
    billingPeriod?: string;
    planTier?: string;
    credits?: string;
  };
  status: string;
  subscription?: {
    id: string;
    customer: string;
    product: string;
    status: string;
    current_period_start_date: string;
    current_period_end_date: string;
    metadata?: {
      userId?: string;
      billingPeriod?: string;
      planTier?: string;
      credits?: string;
    };
  };
}

interface CreemSubscriptionData {
  id: string;
  customer_id: string;
  product_id: string;
  status: string;
  current_period_start_date: string;
  current_period_end_date: string;
  metadata?: {
    userId?: string;
    billingPeriod?: string;
    planTier?: string;
    credits?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('creem-signature') || '';

    console.log('🔔 Received Creem webhook');

    // 创建 Creem API 实例并验证 webhook 签名
    const creemAPI = new CreemAPI(creemConfig);
    if (!creemAPI.verifyWebhookSignature(body, signature, webhookSecret)) {
      console.error('❌ Creem webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event: CreemWebhookEvent = JSON.parse(body);
    console.log('✅ Webhook signature verified');
    console.log('📨 Event type:', event.eventType);

    switch (event.eventType) {
      case 'checkout.completed': {
        await handleCheckoutCompleted(event.object as CreemCheckoutData);
        break;
      }
      case 'subscription.active': {
        await handleSubscriptionCreated(event.object as CreemSubscriptionData);
        break;
      }
      case 'subscription.paid': {
        await handleSubscriptionPaid(event.object as CreemSubscriptionData);
        break;
      }
      case 'subscription.update': {
        await handleSubscriptionUpdated(event.object as CreemSubscriptionData);
        break;
      }
      case 'subscription.canceled':
      case 'subscription.expired': {
        await handleSubscriptionCanceled(event.object as CreemSubscriptionData);
        break;
      }
      default:
        console.log(`⚠️ Unhandled Creem event type: ${event.eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Creem webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutCompleted(checkoutData: CreemCheckoutData) {
  console.log('=== Processing checkout.completed event ===');
  
  const { userId, billingPeriod, planTier } = checkoutData.metadata || {};
  
  if (!userId || !billingPeriod || !planTier) {
    console.error('❌ Missing metadata in checkout:', {
      hasUserId: !!userId,
      hasBillingPeriod: !!billingPeriod,
      hasPlanTier: !!planTier
    });
    return;
  }

  // 对于一次性支付，立即添加积分
  if (billingPeriod === 'oneTime') {
    try {
      const plan = getCreemPlan(billingPeriod as BillingPeriod, planTier as PlanTier);
      const credits = plan.credits;
      
      // 获取用户当前积分
      const { data: currentUser, error: fetchError } = await supabaseAdmin
        .from('users_profile')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching user:', fetchError);
        return;
      }

      if (currentUser) {
        const currentCredits = currentUser.credits || 0;
        const newCredits = currentCredits + credits;
        
        const { error: updateError } = await supabaseAdmin
          .from('users_profile')
          .update({ 
            credits: newCredits,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateError) {
          console.error('❌ Error updating user credits:', updateError);
          return;
        }
        
        console.log(`✅ Added ${credits} credits to user ${userId}. New total: ${newCredits}`);
      }
    } catch (error) {
      console.error('❌ Error processing one-time payment:', error);
    }
  } else {
    // 对于订阅支付（monthly/yearly），创建订阅记录，但不添加积分
    // 积分将在 subscription.paid 事件中添加
    console.log(`📋 Subscription checkout completed for ${billingPeriod}-${planTier}, waiting for subscription.active event`);
    
    // 如果 checkout 数据中包含订阅信息，立即创建订阅记录
    if (checkoutData.subscription) {
      try {
        const plan = getCreemPlan(billingPeriod as BillingPeriod, planTier as PlanTier);
        const subscription = checkoutData.subscription;
        
        console.log('📝 Creating subscription record from checkout.completed');
        
        const { error } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: userId,
            creem_subscription_id: subscription.id,
            creem_customer_id: subscription.customer,
            plan_name: `${billingPeriod}-${planTier}`,
            status: subscription.status,
            current_period_start: subscription.current_period_start_date,
            current_period_end: subscription.current_period_end_date,
            credits_per_month: plan.credits,
            creem_price_id: subscription.product,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('❌ Error creating subscription record from checkout:', error);
        } else {
          console.log(`✅ Created subscription record for user ${userId} from checkout.completed`);
        }
      } catch (error) {
        console.error('❌ Error processing subscription from checkout:', error);
      }
    }
  }

  console.log('✅ Checkout completed processed');
}

async function handleSubscriptionPaid(subscriptionData: CreemSubscriptionData) {
  console.log('=== Processing subscription.paid event ===');
  
  const { userId, billingPeriod, planTier } = subscriptionData.metadata || {};
  
  if (!userId || !billingPeriod || !planTier) {
    console.error('❌ Missing metadata in subscription.paid:', {
      hasUserId: !!userId,
      hasBillingPeriod: !!billingPeriod,
      hasPlanTier: !!planTier
    });
    return;
  }

  try {
    // 根据计费周期和计划级别获取积分
    const plan = getCreemPlan(billingPeriod as BillingPeriod, planTier as PlanTier);
    const credits = plan.credits;
    
    // 1. 添加积分到用户账户（订阅每次付费时）
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users_profile')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching user:', fetchError);
      return;
    }

    if (currentUser) {
      const currentCredits = currentUser.credits || 0;
      const newCredits = currentCredits + credits;
      
      const { error: updateError } = await supabaseAdmin
        .from('users_profile')
        .update({ 
          credits: newCredits,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error('❌ Error updating user credits for subscription payment:', updateError);
        return;
      }
      
      console.log(`✅ Added ${credits} credits to user ${userId} for subscription payment. New total: ${newCredits}`);
    }

    // 2. 更新订阅记录的状态
    const { error: updateSubError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: subscriptionData.status,
        current_period_start: subscriptionData.current_period_start_date,
        current_period_end: subscriptionData.current_period_end_date,
        updated_at: new Date().toISOString(),
      })
      .eq('creem_subscription_id', subscriptionData.id);

    if (updateSubError) {
      console.error('❌ Error updating subscription status:', updateSubError);
    } else {
      console.log(`✅ Updated subscription ${subscriptionData.id} status to ${subscriptionData.status}`);
    }

  } catch (error) {
    console.error('❌ Error processing subscription payment:', error);
  }
}

async function handleSubscriptionCreated(subscriptionData: CreemSubscriptionData) {
  console.log('=== Processing subscription.active event ===');
  
  const { userId, billingPeriod, planTier } = subscriptionData.metadata || {};
  
  if (!userId || !billingPeriod || !planTier) {
    console.error('❌ Missing metadata in subscription.active:', {
      hasUserId: !!userId,
      hasBillingPeriod: !!billingPeriod,
      hasPlanTier: !!planTier
    });
    return;
  }

  try {
    // 检查订阅是否已经存在（避免重复创建）
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('creem_subscription_id', subscriptionData.id)
      .single();

    if (existingSubscription) {
      console.log(`📋 Subscription ${subscriptionData.id} already exists, skipping creation`);
      return;
    }

    // 获取计划信息
    const plan = getCreemPlan(billingPeriod as BillingPeriod, planTier as PlanTier);
    
    console.log(`📝 Creating subscription record for ${billingPeriod}-${planTier}`);
    
    // 创建订阅记录（不添加积分，等待 subscription.paid 事件）
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        creem_subscription_id: subscriptionData.id,
        creem_customer_id: subscriptionData.customer_id,
        plan_name: `${billingPeriod}-${planTier}`,
        status: subscriptionData.status,
        current_period_start: subscriptionData.current_period_start_date,
        current_period_end: subscriptionData.current_period_end_date,
        credits_per_month: plan.credits,
        creem_price_id: subscriptionData.product_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Error creating subscription record:', error);
    } else {
      console.log(`✅ Created subscription record for user ${userId} (${billingPeriod}-${planTier})`);
    }

  } catch (error) {
    console.error('❌ Error creating subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscriptionData: CreemSubscriptionData) {
  console.log('=== Processing subscription.update event ===');
  
  try {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: subscriptionData.status,
        current_period_start: subscriptionData.current_period_start_date,
        current_period_end: subscriptionData.current_period_end_date,
        updated_at: new Date().toISOString(),
      })
      .eq('creem_subscription_id', subscriptionData.id);

    console.log(`✅ Updated subscription ${subscriptionData.id}`);

  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCanceled(subscriptionData: CreemSubscriptionData) {
  console.log('=== Processing subscription.canceled/expired event ===');
  
  try {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('creem_subscription_id', subscriptionData.id);

    if (error) {
      console.error('❌ Error canceling subscription:', error);
    } else {
      console.log(`✅ Canceled subscription ${subscriptionData.id}`);
    }

  } catch (error) {
    console.error('❌ Error canceling subscription:', error);
  }
}
