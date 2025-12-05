import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payment-utils';

/**
 * 统一的Customer Portal会话创建API
 * 根据环境变量决定使用 Stripe 还是 Creem
 */
export async function POST(request: NextRequest) {
  try {
    const provider = getPaymentProvider();
    
    // 获取请求体，原样转发
    const body = await request.text();
    const headers = new Headers(request.headers);
    
    // 根据支付提供商决定转发到哪个API
    const targetUrl = provider === 'stripe' 
      ? '/api/stripe/create-portal-session'
      : '/api/creem/create-portal-session';
    
    // 构建完整的URL
    const baseUrl = new URL(request.url).origin;
    const fullTargetUrl = new URL(targetUrl, baseUrl);
    
    // 转发请求到对应的支付API
    const response = await fetch(fullTargetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': headers.get('Cookie') || '',
        // 转发其他必要的头信息
        ...(headers.get('Authorization') && { 'Authorization': headers.get('Authorization')! }),
      },
      body: body,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    // 统一返回格式，兼容前端期望的格式
    const unifiedResponse = {
      success: true,
      url: data.url || data.customer_portal_link, // Creem 返回的是 customer_portal_link
      provider: provider,
    };
    
    return NextResponse.json(unifiedResponse);
    
  } catch (error) {
    console.error('Payment Portal API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to create portal session' 
    }, { status: 500 });
  }
}