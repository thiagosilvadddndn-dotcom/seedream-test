import { createHmac } from 'crypto';

// Creem SDK 配置文件
// 注意：请根据实际的 Creem SDK 文档调整 API

// Creem 配置
interface CreemConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
}

if (!process.env.CREEM_API_KEY) {
  throw new Error('CREEM_API_KEY is not defined in environment variables');
}

// Creem SDK 初始化
export const creemConfig: CreemConfig = {
  apiKey: process.env.CREEM_API_KEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
};

// 计划配置（使用 product_id 而不是 price_id）
export const CREEM_PLANS = {
  // Monthly plans
  monthly: {
    starter: {
      productId: process.env.CREEM_MONTHLY_STARTER_PRODUCT_ID || '',
      credits: 100,
      name: 'Starter',
      period: 'monthly'
    },
    pro: {
      productId: process.env.CREEM_MONTHLY_PRO_PRODUCT_ID || '',
      credits: 200,
      name: 'Pro',
      period: 'monthly'
    },
    premium: {
      productId: process.env.CREEM_MONTHLY_PREMIUM_PRODUCT_ID || '',
      credits: 500,
      name: 'Premium',
      period: 'monthly'
    },
  },
  // Yearly plans
  yearly: {
    starter: {
      productId: process.env.CREEM_YEARLY_STARTER_PRODUCT_ID || '',
      credits: 1200, // 100 * 12
      name: 'Starter',
      period: 'yearly'
    },
    pro: {
      productId: process.env.CREEM_YEARLY_PRO_PRODUCT_ID || '',
      credits: 2400, // 200 * 12
      name: 'Pro',
      period: 'yearly'
    },
    premium: {
      productId: process.env.CREEM_YEARLY_PREMIUM_PRODUCT_ID || '',
      credits: 6000, // 500 * 12
      name: 'Premium',
      period: 'yearly'
    },
  },
  // One-time plans
  oneTime: {
    starter: {
      productId: process.env.CREEM_ONETIME_STARTER_PRODUCT_ID || '',
      credits: 100,
      name: 'Starter',
      period: 'one-time'
    },
    pro: {
      productId: process.env.CREEM_ONETIME_PRO_PRODUCT_ID || '',
      credits: 200,
      name: 'Pro',
      period: 'one-time'
    },
    premium: {
      productId: process.env.CREEM_ONETIME_PREMIUM_PRODUCT_ID || '',
      credits: 500,
      name: 'Premium',
      period: 'one-time'
    },
  },
} as const;

export type BillingPeriod = 'monthly' | 'yearly' | 'oneTime';
export type PlanTier = 'starter' | 'pro' | 'premium';
export type PlanType = keyof typeof CREEM_PLANS;

// Creem API 包装器类
export class CreemAPI {
  private config: CreemConfig;

  constructor(config: CreemConfig) {
    this.config = config;
  }

  // 创建支付会话
  async createCheckoutSession(params: {
    productId: string;
    successUrl: string;
    customerEmail: string;
    billingPeriod: BillingPeriod;
    planTier: PlanTier;
    userId: string;
    metadata?: Record<string, string>;
    requestId?: string;
  }) {
    // 根据 API 密钥类型判断环境
    const isTestMode = this.config.apiKey.startsWith('creem_test');
    const apiUrl = isTestMode 
      ? 'https://test-api.creem.io/v1/checkouts'  // 测试环境
      : 'https://api.creem.io/v1/checkouts';      // 生产环境

    const payload = {
      product_id: params.productId,
      success_url: params.successUrl,
      customer: {
        email: params.customerEmail,
      },
      metadata: {
        userId: params.userId,
        billingPeriod: params.billingPeriod,
        planTier: params.planTier,
        credits: CREEM_PLANS[params.billingPeriod][params.planTier].credits.toString(),
        ...params.metadata,
      },
      request_id: params.requestId,
    };

    console.log('🔍 Creem API Request:');
    console.log('Environment:', isTestMode ? 'TEST' : 'PRODUCTION');
    console.log('URL:', apiUrl);
    console.log('API Key:', this.config.apiKey ? `${this.config.apiKey.substring(0, 15)}...` : 'MISSING');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📡 Creem API Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Creem API Error Response:', errorData);
      throw new Error(`Creem API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  // 创建Customer Portal会话
  async createCustomerPortalSession(customerId: string) {
    // 根据API密钥类型判断环境
    const isTestMode = this.config.apiKey.startsWith('creem_test');
    const apiUrl = isTestMode 
      ? 'https://test-api.creem.io/v1/customers/billing'  // 测试环境
      : 'https://api.creem.io/v1/customers/billing';      // 生产环境

    console.log('🔍 Creem Customer Portal API Request:');
    console.log('Environment:', isTestMode ? 'TEST' : 'PRODUCTION');
    console.log('URL:', apiUrl);
    console.log('Customer ID:', customerId);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_id: customerId,
      }),
    });

    console.log('📡 Creem Customer Portal API Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Creem Customer Portal API Error Response:', errorData);
      throw new Error(`Creem Customer Portal API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  // 验证 webhook 签名（根据 Creem 文档实现）
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // 根据 Creem 的 webhook 验证方式实现
    // 这只是一个示例，请根据实际文档调整
    try {
      // 假设 Creem 使用 HMAC SHA256
      const expectedSignature = createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

// 导出配置实例和类
export const creem = new CreemAPI(creemConfig);

// 辅助函数
export function getCreemPlan(billingPeriod: BillingPeriod, planTier: PlanTier) {
  return CREEM_PLANS[billingPeriod][planTier];
}

export function getAllCreemPlans() {
  return CREEM_PLANS;
}
