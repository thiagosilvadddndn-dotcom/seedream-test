import Header from '@/components/sections/Header';
import HeroSelector from '@/components/sections/HeroSelector';
import ToolSection from '@/components/sections/ToolSection';
import FeaturesSelector from '@/components/sections/FeaturesSelector';
import HowItWorks from '@/components/sections/HowItWorks';
import WhyChooseUsSelector from '@/components/sections/WhyChooseUsSelector';
import Pricing from '@/components/sections/Pricing';
import CTA from '@/components/sections/CTA';
import WallOfLoveSection from '@/components/sections/testimonials/1/testimonials';
import FAQSelector from '@/components/sections/FAQSelector';
import Footer from '@/components/sections/Footer';
import PaymentSuccessModal from '@/components/ui/PaymentSuccessModal';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site.config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({ locale: resolvedParams.locale, namespace: 'seo.homepage' });
  
  // 使用配置的canonical URL
  const siteUrl = t('canonicalUrl') || siteConfig.site.canonicalUrl || 'https://www.seedream4-5.cc';
  const canonicalUrl = resolvedParams.locale === 'en' 
    ? siteUrl 
    : `${siteUrl}/${resolvedParams.locale}`;
  
  return {
    // 使用Layout的title配置，不添加额外后缀
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
            <HeroSelector />
      <ToolSection />

      <FeaturesSelector />
      <HowItWorks />
      <WhyChooseUsSelector />
      <WallOfLoveSection/>
      <Pricing />

      <CTA />
      <FAQSelector />
      <Footer />
      <PaymentSuccessModal />
    </main>
  );
} 