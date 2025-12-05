/**
 * 支付提供商工具函数
 * 用于在运行时判断当前使用的支付提供商
 */

export type PaymentProvider = 'stripe' | 'creem';

/**
 * 获取当前配置的支付提供商
 */
export function getPaymentProvider(): PaymentProvider {
  const provider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as PaymentProvider;
  return provider || 'stripe'; // 默认为 stripe
}

/**
 * 判断是否使用 Stripe 支付
 */
export function isStripePayment(): boolean {
  return getPaymentProvider() === 'stripe';
}

/**
 * 判断是否使用 Creem 支付
 */
export function isCreemPayment(): boolean {
  return getPaymentProvider() === 'creem';
}

/**
 * 获取订阅管理API端点
 */
export function getPortalApiEndpoint(): string {
  // 统一使用 /api/payment/create-portal-session
  // 内部会根据环境变量自动路由到正确的支付提供商
  return '/api/payment/create-portal-session';
}

/**
 * 获取支付提供商显示名称
 */
export function getPaymentProviderDisplayName(): string {
  const provider = getPaymentProvider();
  return provider === 'stripe' ? 'Stripe' : 'Creem';
}
