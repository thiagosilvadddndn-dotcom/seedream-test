import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

const Hero = () => {
  const t = useTranslations('hero');

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient with primary tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 rounded-full px-4 py-2 border border-primary/20 dark:border-primary/30 shadow-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI Powered</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-center lg:text-left text-foreground">
              {t('title')}
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-center lg:text-left">
              {t('subtitle')}
            </p>
          </div>

          {/* Right Image */}
          <div className="flex-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20 dark:border-primary/30">
              <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
              <Image
                src={t('image')}
                alt="AI Image Generation"
                width={600}
                height={500}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-primary/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 