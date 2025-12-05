import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// 扩展 Stripe 类型定义
interface ExtendedInvoice extends Stripe.Invoice {
  subscription?: string;
}

interface ExtendedSubscription extends Stripe.Subscription {
  metadata: {
    userId?: string;
    billingPeriod?: string;
    planTier?: string;
    credits?: string;
  };
  current_period_start: number;
  current_period_end: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received Stripe event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as ExtendedInvoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.created': {
        const subscription = event.data.object as ExtendedSubscription;
        await handleSubscriptionCreated(subscription);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as ExtendedSubscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as ExtendedSubscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('=== Processing checkout.session.completed event ===');
  console.log('Session ID:', session.id);
  console.log('Session mode:', session.mode);
  console.log('Session metadata:', session.metadata);
  
  // 只处理一次性付费（payment mode）
  if (session.mode === 'payment' && session.payment_status === 'paid') {
    const userId = session.metadata?.userId;
    const billingPeriod = session.metadata?.billingPeriod;
    const planTier = session.metadata?.planTier;
    const credits = session.metadata?.credits ? parseInt(session.metadata.credits) : 0;

    console.log('One-time payment completed - userId:', userId, 'billingPeriod:', billingPeriod, 'planTier:', planTier, 'credits:', credits);

    if (!userId || !billingPeriod || !planTier || !credits) {
      console.error('Missing metadata in checkout session:', session.id);
      console.error('Available metadata:', session.metadata);
      return;
    }

    if (billingPeriod === 'oneTime') {
      try {
        // 获取用户当前积分
        const { data: userProfile, error: getUserError } = await supabaseAdmin
          .from('users_profile')
          .select('credits')
          .eq('id', userId)
          .single();

        if (getUserError) {
          console.error('Error fetching user profile:', getUserError);
          return;
        }

        const currentCredits = userProfile?.credits || 0;
        const newCredits = currentCredits + credits;

        // 为一次性付费添加积分（累加到现有积分）
        console.log(`Adding ${credits} credits to existing ${currentCredits} credits (total: ${newCredits})`);
        const { error: updateError } = await supabaseAdmin
          .from('users_profile')
          .update({ 
            credits: newCredits,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) {
          console.error('❌ Error updating user credits for one-time payment:', updateError);
        } else {
          console.log(`✅ Successfully added ${credits} credits to user ${userId} (total: ${newCredits})`);
        }

      } catch (error) {
        console.error('Error in handleCheckoutSessionCompleted:', error);
      }
    }
  } else {
    console.log('Checkout session not processed - mode:', session.mode, 'payment_status:', session.payment_status);
  }
}

async function handleInvoicePaid(invoice: ExtendedInvoice) {
  console.log('=== Processing invoice.paid event ===');
  console.log('Invoice ID:', invoice.id);
  console.log('Invoice status:', invoice.status);
  console.log('Invoice object keys:', Object.keys(invoice));
  console.log('Full invoice object:', JSON.stringify(invoice, null, 2));
  
  // 尝试从不同的字段获取 subscription ID
  let subscriptionId = invoice.subscription;
  
  // 尝试从 parent.subscription_details 获取
  if (!subscriptionId) {
    const invoiceWithParent = invoice as unknown as {
      parent?: {
        subscription_details?: {
          subscription?: string;
        };
      };
    } & ExtendedInvoice;
    
    if (invoiceWithParent.parent?.subscription_details?.subscription) {
      subscriptionId = invoiceWithParent.parent.subscription_details.subscription;
      console.log('Found subscription ID in parent:', subscriptionId);
    }
  }
  
  // 如果还是没有，从 lines 中获取
  if (!subscriptionId && invoice.lines?.data?.[0]?.parent?.subscription_item_details?.subscription) {
    subscriptionId = invoice.lines.data[0].parent.subscription_item_details.subscription;
    console.log('Found subscription ID in lines:', subscriptionId);
  }
  
  console.log('Final subscription ID:', subscriptionId);
  
  if (subscriptionId && invoice.status === 'paid') {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId as string) as unknown as ExtendedSubscription;
      console.log('Retrieved subscription:', subscription.id);
      console.log('Subscription metadata:', subscription.metadata);
      
      // 从订阅元数据获取用户信息
      const userId = subscription.metadata.userId;
      const billingPeriod = subscription.metadata.billingPeriod;
      const planTier = subscription.metadata.planTier;
      const credits = subscription.metadata.credits ? parseInt(subscription.metadata.credits) : 0;

      console.log('Parsed metadata - userId:', userId, 'billingPeriod:', billingPeriod, 'planTier:', planTier, 'credits:', credits);

      if (!userId || !billingPeriod || !planTier || !credits) {
        console.error('Missing metadata in subscription:', subscription.id);
        console.error('Available metadata:', subscription.metadata);
        return;
      }

      // 更新用户积分
      console.log('Updating user credits for user:', userId);
      const { error: updateError } = await supabaseAdmin
        .from('users_profile')
        .update({ 
          credits: credits,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user credits:', updateError);
      } else {
        console.log(`✅ Successfully updated credits for user ${userId}: ${credits} credits`);
      }
    } catch (error) {
      console.error('Error in handleInvoicePaid:', error);
    }
  } else {
    console.log('Invoice not processed - subscription:', subscriptionId, 'status:', invoice.status);
    
    // 如果没有找到订阅，尝试通过customer查找最近的订阅
    if (invoice.customer && invoice.status === 'paid') {
      console.log('Trying to find subscription through customer...');
      try {
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 1,
          status: 'active'
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0] as unknown as ExtendedSubscription;
          console.log('Found active subscription for customer:', subscription.id);
          console.log('Subscription metadata:', subscription.metadata);
          
          // 处理找到的订阅
          const userId = subscription.metadata.userId;
          const billingPeriod = subscription.metadata.billingPeriod;
          const planTier = subscription.metadata.planTier;
          const credits = subscription.metadata.credits ? parseInt(subscription.metadata.credits) : 0;

          console.log('Customer subscription - userId:', userId, 'billingPeriod:', billingPeriod, 'planTier:', planTier, 'credits:', credits);

          if (userId && billingPeriod && planTier && credits) {
            console.log('Updating user credits through customer subscription...');
            const { error: updateError } = await supabaseAdmin
              .from('users_profile')
              .update({ 
                credits: credits,
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);

            if (updateError) {
              console.error('Error updating user credits via customer:', updateError);
            } else {
              console.log(`✅ Successfully updated credits via customer for user ${userId}: ${credits} credits`);
            }
          }
        } else {
          console.log('No active subscriptions found for customer');
        }
      } catch (error) {
        console.error('Error finding subscription through customer:', error);
      }
    }
    
    console.log('Final fallback - checking invoice details...');
    console.log('Invoice customer:', invoice.customer);
    console.log('Invoice amount:', invoice.amount_paid);
  }
}

async function handleSubscriptionCreated(subscription: ExtendedSubscription) {
  console.log('=== Processing customer.subscription.created event ===');
  console.log('Subscription ID:', subscription.id);
  console.log('Subscription metadata:', subscription.metadata);
  
  const userId = subscription.metadata.userId;
  const billingPeriod = subscription.metadata.billingPeriod;
  const planTier = subscription.metadata.planTier;
  const credits = subscription.metadata.credits ? parseInt(subscription.metadata.credits) : 0;

  console.log('Parsed metadata - userId:', userId, 'billingPeriod:', billingPeriod, 'planTier:', planTier, 'credits:', credits);

  if (!userId || !billingPeriod || !planTier || !credits) {
    console.error('Missing metadata in subscription:', subscription.id);
    console.error('Available metadata:', subscription.metadata);
    return;
  }

  try {
    // 创建订阅记录
    console.log('Creating subscription record...');
    
    // 安全处理时间戳
    const currentPeriodStart = subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    
    // 根据billing period计算正确的结束时间
    let currentPeriodEnd: string;
    if (subscription.current_period_end) {
      currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    } else {
      // 如果Stripe没有提供end时间，根据billing period计算
      const startTime = subscription.current_period_start 
        ? subscription.current_period_start * 1000 
        : Date.now();
      
      let endTime: number;
      if (billingPeriod === 'yearly') {
        // 年付：365天后
        endTime = startTime + (365 * 24 * 60 * 60 * 1000);
      } else {
        // 月付：30天后
        endTime = startTime + (30 * 24 * 60 * 60 * 1000);
      }
      currentPeriodEnd = new Date(endTime).toISOString();
    }
    
    console.log('Period start:', currentPeriodStart, 'Period end:', currentPeriodEnd);
    console.log('Stripe raw timestamps - start:', subscription.current_period_start, 'end:', subscription.current_period_end);
    console.log('Stripe period dates - start:', new Date(subscription.current_period_start * 1000), 'end:', new Date(subscription.current_period_end * 1000));
    console.log('Billing period:', billingPeriod, 'Plan tier:', planTier);
    
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        stripe_price_id: subscription.items.data[0].price.id,
        plan_name: `${billingPeriod}-${planTier}`,
        status: subscription.status,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        credits_per_month: credits,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      });

    if (error) {
      console.error('❌ Error creating subscription record:', error);
    } else {
      console.log(`✅ Successfully created subscription record for user ${userId}`);
      console.log(`📅 Subscription period: ${currentPeriodStart} to ${currentPeriodEnd}`);
    }

    // 立即给用户添加积分
    console.log('Adding initial credits to user...');
    const { error: updateError } = await supabaseAdmin
      .from('users_profile')
      .update({ 
        credits: credits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating user credits on subscription creation:', updateError);
    } else {
      console.log(`✅ Successfully added ${credits} credits to user ${userId}`);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionCreated:', error);
  }
}

async function handleSubscriptionUpdated(subscription: ExtendedSubscription) {
  try {
    // 检查数据库中是否存在这个订阅
    const { data: currentSubscription, error: checkError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single();
      
    if (checkError) {
      console.error('Error checking existing subscription:', checkError);
      return;
    }
    // 先检查订阅记录是否存在
    const { data: existingSubscription, error: queryError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single();
      
    if (queryError && queryError.code !== 'PGRST116') {
      console.error('查询订阅记录失败:', queryError);
      return;
    }
    
    if (!existingSubscription) {
      console.log('订阅记录不存在，跳过更新');
      return;
    }
    
    // 安全处理时间戳
    const currentPeriodStart = subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : existingSubscription.current_period_start;
    
    const currentPeriodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString() 
      : existingSubscription.current_period_end;

    // 准备更新数据
    const updateData: {
      status: string;
      current_period_start: string;
      current_period_end: string;
      updated_at: string;
      cancel_at_period_end: boolean;
      cancel_at: string | null;
    } = {
      status: subscription.status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    };
      
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription:', error);
    }
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: ExtendedSubscription) {
  try {
    // 检查数据库中是否存在这个订阅
    const { data: currentSubscription, error: checkError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single();
      
    if (checkError) {
      console.error('Error checking subscription for deletion:', checkError);
      return;
    }
    const updateData = {
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updateData)
      .eq('stripe_subscription_id', subscription.id)
      .select();

    if (error) {
      console.error('Error marking subscription as cancelled:', error);
    }

    // 积分处理策略: 保留现有积分，不清零
    // 用户可以继续使用剩余积分，但不会获得新的月度积分
    // 这样提供了更好的用户体验，避免突然失去服务
    console.log('📝 Subscription canceled - user retains existing credits until they are used up');
    
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error);
  }
} 