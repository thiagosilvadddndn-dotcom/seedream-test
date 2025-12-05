'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/sections/hero/1/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CTA = () => {
  const t = useTranslations('cta');
  const router = useRouter();

  const handleCTAClick = () => {
    // 查找工具部分元素
    const toolSection = document.getElementById('tool-section');
    
    // 如果找到元素，滚动到该位置
    if (toolSection) {
      toolSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // 如果没找到元素（可能在不同页面），则跳转到首页并添加hash
      router.push('/#tool-section');
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/30 dark:border-primary/30 shadow-xl shadow-primary/5">
          {/* 装饰性背景元素 */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
          
          <div className="relative p-12 md:p-20 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-primary/20 to-primary/30 rounded-full px-4 py-2 border border-primary/30 dark:border-primary/30 shadow-sm">
                <Sparkles className="w-5 h-5 text-primary dark:text-primary" />
                <span className="text-sm font-medium text-primary dark:text-primary">Ready to Start</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight text-foreground">
              {t('title')}
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCTAClick}
            >
              {t('button')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA; 