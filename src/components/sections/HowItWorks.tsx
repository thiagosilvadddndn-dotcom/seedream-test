import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Palette, Download } from 'lucide-react';

const iconMap = [MessageSquare, Palette, Download];

const HowItWorks = () => {
  const t = useTranslations('howItWorks');
  const steps = t.raw('steps') as Array<{title: string, description: string}>;

  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      {/* Beautiful gradient background with primary tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 dark:from-primary/20 dark:via-background dark:to-primary/10"></div>
      
      {/* Decorative elements */}
      <div className="absolute left-0 top-1/3 w-64 h-64 bg-primary/10 dark:bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute right-0 bottom-1/3 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines for desktop with improved gradient */}
            <div className="hidden md:block absolute top-20 left-1/6 right-1/6 h-1 bg-gradient-to-r from-primary/30 via-primary/50 to-primary/30 z-0 rounded-full shadow-sm"></div>
            
            {steps.map((step, index) => {
              const IconComponent = iconMap[index];
              return (
                <div key={index} className="relative z-10">
                  <Card className="border-2 border-primary/20 dark:border-primary/30 bg-card/80 dark:bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center relative shadow-inner border border-primary/20 dark:border-primary/30">
                        <IconComponent className="w-8 h-8 text-primary" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md shadow-primary/20">
                          {index + 1}
                        </div>
                      </div>
                      <CardTitle className="text-xl text-foreground">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center text-base leading-relaxed text-muted-foreground">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 