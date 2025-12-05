'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/sections/hero/1/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2 } from 'lucide-react';
import SignInDialog from '../auth/SignInDialog';
import { BillingPeriod, PlanTier, STRIPE_PLANS } from '@/lib/stripe';

const Pricing = () => {
  const { data: session } = useSession();
  const t = useTranslations('pricing');
  const [loading, setLoading] = useState<string | null>(null);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');
  
  const billingPeriods = t.raw('billingPeriods') as Record<BillingPeriod, string>;
  const allPlans = t.raw('plans') as Record<BillingPeriod, Array<{
    name: string;
    price: string;
    period: string;
    originalPrice?: string;
    description: string;
    features: string[];
    cta: string;
    popular?: boolean;
  }>>;

  const plans = allPlans[billingPeriod] || [];

  // 映射计划名称到planTier（基于Stripe实际产品名称）
  const getPlanTier = (planName: string): PlanTier | null => {
    switch (planName.toLowerCase()) {
      case 'seedling':
      case 'starter':
      case '入门版':
      case 'first bite':
        return 'starter';
      case 'pro':
      case '专业版':
      case 'creator':
        return 'pro';
      case 'elite':
      case 'premium':
      case '高级版':
      case 'power':
        return 'elite';
      case 'micro trial':
        return 'pro'; // Micro Trial使用Pro级别的处理
      default:
        return null;
    }
  };

  // 计算节省百分比
  const getSavingsPercentage = (originalPrice: string, currentPrice: string): number => {
    const original = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
    const current = parseFloat(currentPrice.replace(/[^0-9.]/g, ''));
    return Math.round(((original - current) / original) * 100);
  };

  const handleSubscribe = async (planName: string) => {
    // 检查用户是否登录
    if (!session) {
      setShowSignInDialog(true);
      return;
    }

    const planTier = getPlanTier(planName);
    if (!planTier) {
      console.error('Invalid plan:', planName);
      return;
    }

    try {
      setLoading(`${billingPeriod}-${planTier}`);

      // 调用统一的支付API
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingPeriod: billingPeriod,
          planTier: planTier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Checkout session error:', data);
        alert(data.message || 'Failed to create checkout session');
        return;
      }

      // 根据支付提供商类型进行重定向
      if (data.sessionId) {
        // 动态加载Stripe，只在需要时加载
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
          });

          if (error) {
            console.error('Stripe redirect error:', error);
            alert('Failed to redirect to checkout');
          }
        }
      } else if (data.url) {
        // 直接使用URL重定向
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <section id="pricing" className="py-20 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 dark:from-primary/20 dark:via-background dark:to-primary/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t('title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t('subtitle')}
            </p>

            {/* Billing Period Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-muted p-1 rounded-lg flex">
                {Object.entries(billingPeriods).map(([period, label]) => (
                  <button
                    key={period}
                    onClick={() => setBillingPeriod(period as BillingPeriod)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                      billingPeriod === period
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                    {period === 'yearly' && (
                      <span className="absolute -top-2 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {t('save', { percentage: '20' })}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => {
              const planTier = getPlanTier(plan.name);
              const isLoading = loading === `${billingPeriod}-${planTier}`;
              
              return (
                <Card key={index} className={`relative border-2 ${plan.popular ? 'border-primary dark:border-primary shadow-xl shadow-primary/10 scale-105' : 'border-primary/20 dark:border-primary/30'} bg-card/80 dark:bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-primary text-primary-foreground px-8 py-2 rounded-full text-sm font-bold flex items-center whitespace-nowrap justify-center shadow-lg">
                        <Star className="w-4 h-4 text-primary-foreground mr-2 flex-shrink-0" />
                        <span className="drop-shadow-sm">Most Popular</span>
                        <Star className="w-4 h-4 text-primary-foreground ml-2 flex-shrink-0" />
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8 pt-8">
                    <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                    <div className="mt-4">
                      {plan.originalPrice && billingPeriod === 'yearly' && (
                        <div className="text-sm text-muted-foreground line-through mb-1">
                          {plan.originalPrice}
                        </div>
                      )}
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                      {plan.originalPrice && billingPeriod === 'yearly' && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          {t('save', { percentage: getSavingsPercentage(plan.originalPrice, plan.price) })}
                        </div>
                      )}
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/30' : 'border-2 border-primary bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-primary transition-all duration-300'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Micro Trial Banner - Always visible at bottom */}
          <div className="mt-12 p-6 border rounded-xl bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-lg">{t('microTrial.title')}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t('microTrial.badge')}</span>
              </div>
              <p className="text-muted-foreground">{t('microTrial.description')}</p>
              <p className="text-sm text-muted-foreground mt-1">✨ {t('microTrial.features')}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold">{t('microTrial.price')}</span>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/30"
                variant="default"
                size="lg"
                onClick={() => handleSubscribe('Micro Trial')}
                disabled={loading === 'micro-trial'}
              >
                {loading === 'micro-trial' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  t('microTrial.cta')
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sign In Dialog */}
      <SignInDialog 
        open={showSignInDialog} 
        onOpenChange={setShowSignInDialog} 
      />
    </>
  );
};

export default Pricing; 