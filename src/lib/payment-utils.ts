/**
 * 支付提供商工具函数
 * 用于在运行时判断当前使用的支付提供商
 */

export type PaymentProvider = 'stripe';

/**
 * 获取当前配置的支付提供商
 */
export function getPaymentProvider(): PaymentProvider {
  // 仅支持 stripe
  return 'stripe';
}

/**
 * 判断是否使用 Stripe 支付
 */
export function isStripePayment(): boolean {
  return true;
}

/**
 * 获取订阅管理API端点
 */
export function getPortalApiEndpoint(): string {
  // 统一使用 /api/payment/create-portal-session
  return '/api/payment/create-portal-session';
}

/**
 * 获取支付提供商显示名称
 */
export function getPaymentProviderDisplayName(): string {
  return 'Stripe';
}
