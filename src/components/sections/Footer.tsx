'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const t = useTranslations('footer');
  const pathname = usePathname();
  const isZhLocale = pathname.startsWith('/zh');
  const links = t.raw('links') as {
    product: { title: string; items: string[] };
    company: { title: string; items: string[] };
    support: { title: string; items: string[] };
    legal: { title: string; items: string[] };
  };

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <Link href={isZhLocale ? '/zh' : '/'} className="font-bold text-xl mb-4 block">
              {t('company')}
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">{links.product.title}</h3>
            <ul className="space-y-2">
              {links.product.items.map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{links.company.title}</h3>
            <ul className="space-y-2">
              {links.company.items.map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{links.support.title}</h3>
            <ul className="space-y-2">
              {links.support.items.map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              {t('copyright')}
            </p>
            <div className="flex space-x-6">
              {links.legal.items.map((item, index) => (
                <a key={index} href="#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 