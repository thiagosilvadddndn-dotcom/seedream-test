import { NextRequest, NextResponse } from 'next/server';
import { getPaymentProvider } from '@/lib/payment-utils';

/**
 * 统一的支付会话创建API
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
      ? '/api/stripe/create-checkout-session'
      : '/api/creem/create-checkout-session';
    
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
    
    // 统一返回格式，确保都包含 sessionId 和 url
    const unifiedResponse = {
      sessionId: data.sessionId,
      url: data.url,
      provider: provider, // 告诉前端使用的是哪个支付提供商
    };
    
    return NextResponse.json(unifiedResponse);
    
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to create checkout session' 
    }, { status: 500 });
  }
}