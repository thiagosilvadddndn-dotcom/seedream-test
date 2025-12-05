import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// 🆕 升级版Stripe价格ID配置 - 支持9种计划
export const STRIPE_PLANS = {
  monthly: {
    starter: {
      priceId: process.env.STRIPE_MONTHLY_STARTER_PRICE_ID || '',
      credits: 600, // 修正为盈利数值
      name: 'Starter',
    },
    pro: {
      priceId: process.env.STRIPE_MONTHLY_PRO_PRICE_ID || '',
      credits: 1500, // 修正为盈利数值
      name: 'Pro',
    },
    elite: {
      priceId: process.env.STRIPE_MONTHLY_ELITE_PRICE_ID || '',
      credits: 3300, // 修正为盈利数值
      name: 'Elite',
    },
  },
  yearly: {
    starter: {
      priceId: process.env.STRIPE_YEARLY_STARTER_PRICE_ID || '',
      credits: 7200, // 修正为盈利数值
      name: 'Starter',
    },
    pro: {
      priceId: process.env.STRIPE_YEARLY_PRO_PRICE_ID || '',
      credits: 18000, // 修正为盈利数值
      name: 'Pro',
    },
    elite: {
      priceId: process.env.STRIPE_YEARLY_ELITE_PRICE_ID || '',
      credits: 39600, // 修正为盈利数值
      name: 'Elite',
    },
  },
  oneTime: {
    trial: {
      priceId: process.env.STRIPE_ONETIME_TRIAL_PRICE_ID || '',
      credits: 60, // $1.99 给 60 积分 (约5张图)
      name: 'Micro Trial Pack',
      price: '$1.99'
    },
    starter: {
      priceId: process.env.STRIPE_ONETIME_STARTER_PRICE_ID || '',
      credits: 100, // 后端正确配置
      name: 'First Bite',
    },
    pro: {
      priceId: process.env.STRIPE_ONETIME_PRO_PRICE_ID || '',
      credits: 11000, // 后端正确配置
      name: 'Creator',
    },
    elite: {
      priceId: process.env.STRIPE_ONETIME_ELITE_PRICE_ID || '',
      credits: 19000, // 后端正确配置
      name: 'Power',
    },
  },
} as const;

// 向后兼容的旧版本格式
export const STRIPE_PLANS_LEGACY = {
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || process.env.STRIPE_MONTHLY_PRO_PRICE_ID || '',
    credits: 1500, // 修正为盈利数值
    name: 'Pro',
  },
  elite: {
    priceId: process.env.STRIPE_ELITE_PRICE_ID || process.env.STRIPE_MONTHLY_ELITE_PRICE_ID || '',
    credits: 3300, // 修正为盈利数值
    name: 'Elite',
  },
} as const;

export type BillingPeriod = keyof typeof STRIPE_PLANS;
export type PlanTier = keyof typeof STRIPE_PLANS.monthly;
export type PlanType = keyof typeof STRIPE_PLANS_LEGACY; // 向后兼容
