/**
 * AI图片站配置文件
 * 由 HappyShip 自动生成，请勿手动修改
 */

export interface SiteConfig {
  // 站点基础信息
  site: {
    name: string;
    domain?: string;
    description: string;
    canonicalUrl: string;
  };

  // 主题配置
  theme: {
    presetTheme: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logo?: string;
    favicon?: string;
  };

  // 环境变量配置
  env: {
    databaseUrl?: string;
    replicateApiToken?: string;
    stripePublicKey?: string;
    stripeSecretKey?: string;
    nextAuthSecret?: string;
    nextAuthUrl?: string;
  };

  // 多语言配置
  i18n: {
    defaultLocale: string;
    locales: string[];
  };

}

// 配置实例
export const siteConfig: SiteConfig = {
  site: {
    name: "Seedream 4.5 Free Online | The Next Gen AI Image Generator",
    description: "Experience Seedream 4.5 online. We are building the most intuitive interface for ByteDance's latest image generation model. Sign up for early access.",
    domain: "",
    canonicalUrl: "https://www.seedream4-5.cc"
  },
  theme: {
    presetTheme: "template-default"
  },
  env: {
    databaseUrl: process.env.DATABASE_URL,
    replicateApiToken: process.env.REPLICATE_API_TOKEN,
    stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL
  },
  // 多语言配置
  i18n: {
    defaultLocale: 'en',
    locales: ["en","fr","es","de","ja","ko"]
  }
};

export default siteConfig;
