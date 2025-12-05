import { useTranslations } from 'next-intl';
import ImageGenerationTool from '@/components/ui/ImageGenerationTool';

const ToolSection = () => {
  const t = useTranslations('toolSection');
  const examples = t.raw('examples') as string[];
  const aspectRatioOptions = [
    { value: '1:1', label: t('aspectRatio.square') },
    { value: '16:9', label: t('aspectRatio.landscape') },
    { value: '9:16', label: t('aspectRatio.portrait') }
  ];

  // 轮播图片配置
  const carouselImages = [
    {
      src: '/tool-section/1.webp',
      alt: 'AI Generated Example 1'
    },
    {
      src: '/tool-section/2.webp',
      alt: 'AI Generated Example 2'
    },
    {
      src: '/tool-section/3.webp',
      alt: 'AI Generated Example 3'
    }
  ];

  return (
    <section id="tool-section" className="py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 dark:from-primary/20 dark:via-background dark:to-primary/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative">
        {/* Title and Description */}
        <div className="text-center mb-12">
          <p className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('title')}
          </p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
      </div>
      
      {/* Full-width Tool Area */}
      <div className="relative z-10">
        <ImageGenerationTool
          placeholder={t('placeholder')}
          generateButton={t('generateButton')}
          aspectRatioLabel={t('aspectRatio.label')}
          aspectRatioOptions={aspectRatioOptions}
          examples={examples}
          carouselImages={carouselImages}
        />
      </div>
    </section>
  );
};

export default ToolSection; 