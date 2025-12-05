import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { CreemAPI, creemConfig } from '@/lib/creem';

/**
 * Creem Customer Portal Session API
 * 为用户创建Creem客户门户会话
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Creating Creem Customer Portal session...');

    // 1. 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('❌ Unauthorized - no session');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // 2. 先通过email查找用户的UUID
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('users_profile')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userError || !userProfile) {
      console.error('❌ User not found:', userError);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // 3. 使用用户UUID查找订阅信息
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('creem_customer_id, status')
      .eq('user_id', userProfile.id)
      .in('status', ['active', 'trialing', 'past_due', 'canceled'])
      .single();

    if (subscriptionError || !subscription) {
      console.error('❌ No active subscription found:', subscriptionError);
      return NextResponse.json({ 
        success: false, 
        error: 'No active subscription found' 
      }, { status: 404 });
    }

    // 4. 创建Creem API实例并调用Customer Portal API
    console.log('📞 Calling Creem Customer Portal API...');
    console.log('Customer ID:', subscription.creem_customer_id);

    const creemAPI = new CreemAPI(creemConfig);
    const result = await creemAPI.createCustomerPortalSession(subscription.creem_customer_id);
    console.log('✅ Creem Customer Portal API response:', JSON.stringify(result, null, 2));
    
    // 5. 返回Customer Portal URL
    return NextResponse.json({
      success: true,
      url: result.customer_portal_link,
      message: 'Customer portal session created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating Creem Customer Portal session:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create customer portal session' 
    }, { status: 500 });
  }
}
