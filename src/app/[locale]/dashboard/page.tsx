'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/sections/hero/1/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Zap, Crown, Settings, ArrowLeft, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  user: {
    name: string;
    email: string;
    image: string;
    credits: number;
  };
  subscription: {
    planName: string;
    status: string;
    currentPeriodEnd: string;
    creditsPerMonth: number;
    stripePriceId: string;
  } | null;
  hasPaidPlan: boolean;
}

// 解析计划名称的辅助函数
interface ParsedPlan {
  billingPeriod: 'monthly' | 'yearly' | 'oneTime' | null;
  planTier: 'starter' | 'pro' | 'premium' | 'free';
}

const parsePlanName = (planName: string): ParsedPlan => {
  if (!planName) {
    return { billingPeriod: null, planTier: 'free' };
  }

  // 处理新格式: "yearly-pro", "monthly-starter", "oneTime-premium"
  const parts = planName.toLowerCase().split('-');
  if (parts.length === 2) {
    const [period, tier] = parts;
    const billingPeriod = ['monthly', 'yearly', 'onetime'].includes(period) 
      ? (period === 'onetime' ? 'oneTime' : period as 'monthly' | 'yearly') 
      : null;
    const planTier = ['starter', 'pro', 'premium'].includes(tier) 
      ? tier as 'starter' | 'pro' | 'premium' 
      : 'free';
    return { billingPeriod, planTier };
  }

  // 处理旧格式: "pro", "premium"
  const tier = ['starter', 'pro', 'premium'].includes(planName.toLowerCase()) 
    ? planName.toLowerCase() as 'starter' | 'pro' | 'premium' 
    : 'free';
  return { billingPeriod: 'monthly', planTier: tier };
};

import { getPortalApiEndpoint, getPaymentProviderDisplayName } from '@/lib/payment-utils';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingPortalSession, setIsCreatingPortalSession] = useState(false);
  const isZhLocale = pathname.startsWith('/zh');

  // 如果未登录，重定向到首页
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }

    // 获取dashboard数据
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/user/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsCreatingPortalSession(true);
    try {
      // 获取对应支付提供商的API端点
      const apiEndpoint = getPortalApiEndpoint();
      const providerName = getPaymentProviderDisplayName();
      
      console.log(`🔗 Creating ${providerName} Customer Portal session...`);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success && result.url) {
        // 跳转到 Customer Portal
        console.log(`✅ Redirecting to ${providerName} Customer Portal`);
        window.location.href = result.url;
      } else {
        console.error(`❌ 创建${providerName}管理会话失败:`, result.error);
        // 这里可以添加错误提示
      }
    } catch (error) {
      console.error('❌ 管理订阅出错:', error);
      // 这里可以添加错误提示
    } finally {
      setIsCreatingPortalSession(false);
    }
  };

  const formatDate = (dateString: string) => {
    const locale = isZhLocale ? 'zh-CN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanDisplayName = (planName: string) => {
    const parsed = parsePlanName(planName);
    
    // 获取层级名称
    let tierName = '';
    switch (parsed.planTier) {
      case 'starter':
        return t('plans.starter') || 'Starter';
      case 'pro':
        tierName = t('plans.pro') || 'Pro';
        break;
      case 'premium':
        tierName = t('plans.premium') || 'Premium';
        break;
      default:
        tierName = t('plans.free') || 'Free';
    }

    // 获取计费周期名称
    let periodName = '';
    switch (parsed.billingPeriod) {
      case 'monthly':
        periodName = ' (Monthly)';
        break;
      case 'yearly':
        periodName = ' (Yearly)';
        break;
      case 'oneTime':
        periodName = ' (One-time)';
        break;
      default:
        periodName = '';
    }

    return tierName + periodName;
  };

  const getBillingPeriodText = (planName: string) => {
    const parsed = parsePlanName(planName);
    switch (parsed.billingPeriod) {
      case 'monthly':
        return isZhLocale ? '月付订阅' : 'Monthly Subscription';
      case 'yearly':
        return isZhLocale ? '年付订阅' : 'Yearly Subscription';
      case 'oneTime':
        return isZhLocale ? '一次性购买' : 'One-time Purchase';
      default:
        return isZhLocale ? '免费计划' : 'Free Plan';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t('status.active')}</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('status.pastDue')}</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t('status.trialing')}</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">{t('status.canceled')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{t('status.inactive')}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">{t('errorLoading')}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              {t('retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="mb-4 p-0 hover:bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToHome')}
              </Button>
              <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Credits Card */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('credits.title')}</CardTitle>
                <Zap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{dashboardData.user.credits}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('credits.description')}
                </p>
              </CardContent>
            </Card>

            {/* Plan Card */}
            <Card className="border-2 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('plan.title')}</CardTitle>
                <Crown className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">
                    {getPlanDisplayName(dashboardData.subscription?.planName || 'free')}
                  </div>
                  {dashboardData.subscription && getStatusBadge(dashboardData.subscription.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardData.hasPaidPlan 
                    ? getBillingPeriodText(dashboardData.subscription?.planName || '') 
                    : t('plan.freePlan')
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Details */}
          {dashboardData.subscription && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{t('subscription.title')}</span>
                </CardTitle>
                <CardDescription>{t('subscription.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {(() => {
                    const parsed = parsePlanName(dashboardData.subscription?.planName || '');
                    const isOneTime = parsed.billingPeriod === 'oneTime';
                    
                    return (
                      <>
                        {!isOneTime && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              {t('subscription.renewalDate')}
                            </label>
                            <p className="text-lg font-semibold">
                              {formatDate(dashboardData.subscription!.currentPeriodEnd)}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            {isOneTime 
                              ? (isZhLocale ? '购买积分' : 'Credits Purchased')
                              : (parsed.billingPeriod === 'yearly' 
                                ? (isZhLocale ? '年度积分' : 'Yearly Credits')
                                : t('subscription.monthlyCredits')
                              )
                            }
                          </label>
                          <p className="text-lg font-semibold">
                            {dashboardData.subscription!.creditsPerMonth} {t('credits.unit')}
                          </p>
                        </div>
                        {isOneTime && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              {isZhLocale ? '购买类型' : 'Purchase Type'}
                            </label>
                            <p className="text-lg font-semibold text-green-600">
                              {isZhLocale ? '一次性购买 - 积分永不过期' : 'One-time Purchase - Credits Never Expire'}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>{t('actions.title')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!dashboardData.hasPaidPlan && (
                <Button 
                  onClick={() => router.push('/#pricing')}
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('actions.upgradePlan')}
                </Button>
              )}
              {dashboardData.hasPaidPlan && (
                <Button 
                  onClick={handleManageSubscription}
                  disabled={isCreatingPortalSession}
                  className="w-full"
                  variant="outline"
                >
                  {isCreatingPortalSession ? (
                    <>
                      <Skeleton className="w-4 h-4 mr-2" />
                      {t('actions.loadingPortal')}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('actions.manageSubscription')}
                    </>
                  )}
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {t('actions.startGenerating')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 