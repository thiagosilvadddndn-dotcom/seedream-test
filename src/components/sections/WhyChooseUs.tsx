import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Brain, Users, Zap, DollarSign } from 'lucide-react';

const iconMap = [Brain, Users, Zap, DollarSign];

const WhyChooseUs = () => {
  const t = useTranslations('whyChooseUs');
  const benefits = t.raw('benefits') as Array<{title: string, description: string}>;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 dark:from-primary/20 dark:via-background dark:to-primary/10"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-40 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                {t('title')}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t('subtitle')}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('description')}
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const IconComponent = iconMap[index];
                return (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg bg-white/60 dark:bg-background/60 border border-primary/20 dark:border-primary/30 backdrop-blur-sm hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-primary/20 dark:border-primary/30">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg text-foreground">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Image */}
          <div className="flex-1">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary/20 dark:border-primary/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/5 mix-blend-overlay"></div>
              <Image
                src={t('image')}
                alt="Why Choose Us"
                width={600}
                height={500}
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-primary/10 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs; 