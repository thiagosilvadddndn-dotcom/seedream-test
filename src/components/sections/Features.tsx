import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Zap, Award, Palette, Layers, Star, Shield, Clock, Users, Sparkles, Target } from 'lucide-react';

const iconMap = {
  0: Zap,
  1: Award,
  2: Palette,
  3: Layers,
  4: Star,
  5: Shield,
  6: Clock,
  7: Users,
  8: Sparkles,
  9: Target,
};

const Features = () => {
  const t = useTranslations('features');
  const features = t.raw('items') as Array<{title: string, description: string, image: string}>;

  return (
    <section id="features" className="py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => {
            const IconComponent = iconMap[index as keyof typeof iconMap] || Zap; // 使用Zap作为默认图标
            const isEven = index % 2 === 0;
            
            return (
              <div key={index} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-16`}>
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shadow-sm border border-primary/20 dark:border-primary/30">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Image */}
                <div className="flex-1">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-primary/10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/5 mix-blend-overlay"></div>
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={600}
                      height={400}
                      className="w-full h-[300px] md:h-[400px] object-cover"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features; 