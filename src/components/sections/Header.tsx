'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/sections/hero/1/ui/button';
import {  Menu, X, User, LogOut, Coins, Globe, ChevronDown, History } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import SignInDialog from '@/components/auth/SignInDialog';
import { siteConfig } from '@/config/site.config';
import { routing } from '@/i18n/routing';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const t = useTranslations('header');
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [userCredits, setUserCredits] = useState<number>(0);

  // 语言配置 - 与配置页面保持一致 (src/types/config.ts)
  const languages: Record<string, { name: string; flag: string }> = {
    en: { name: 'English', flag: '🇺🇸' },
    zh: { name: '中文', flag: '🇨🇳' },
    fr: { name: 'Français', flag: '🇫🇷' },
    es: { name: 'Español', flag: '🇪🇸' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    ja: { name: '日本語', flag: '🇯🇵' },
    ko: { name: '한국어', flag: '🇰🇷' },
    pt: { name: 'Português', flag: '🇵🇹' },
    ru: { name: 'Русский', flag: '🇷🇺' },
    it: { name: 'Italiano', flag: '🇮🇹' }
  };

  // 获取当前配置的语言列表（兼容缺省 i18n 配置）
  type LanguageOption = { code: string; name: string; flag: string };
  type I18nConfig = { defaultLocale: string; locales: string[] };
  const i18nConfig: I18nConfig = ((siteConfig as unknown) as { i18n?: I18nConfig }).i18n || { defaultLocale: String(routing.defaultLocale), locales: [...routing.locales] as string[] };
  const configuredLanguages: LanguageOption[] = (i18nConfig.locales as string[])
    .map((loc) => {
      const info = languages[loc];
      return info ? { code: loc, name: info.name, flag: info.flag } : null;
    })
    .filter((lang): lang is LanguageOption => Boolean(lang)); // 过滤掉未定义的语言

  const currentLanguage = languages[locale as keyof typeof languages] || languages.en;

  // 语言切换处理函数
  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname;
    let newPath = '';

    // 移除当前语言前缀
    const pathWithoutLocale = currentPath.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';

    // 添加新语言前缀（如果不是默认语言）
    if (newLocale === i18nConfig.defaultLocale) {
      newPath = pathWithoutLocale;
    } else {
      newPath = `/${newLocale}${pathWithoutLocale}`;
    }

    window.location.href = newPath;
  };

  useEffect(() => {
    const fetchUserCredits = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/credits');
          if (response.ok) {
            const data = await response.json();
            setUserCredits(data.credits || 0);
          }
        } catch (error) {
          console.error('Error fetching user credits:', error);
        }
      }
    };

    fetchUserCredits();
  }, [session?.user?.email]);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };



  const handleSignIn = () => {
    setIsSignInOpen(true);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <>
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={locale === i18nConfig.defaultLocale ? '/' : `/${locale}`} className="flex items-center space-x-3">
                <Image
                  src={t('logoImage')}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="font-bold text-xl">{t('logo')}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.features')}
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.howItWorks')}
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.pricing')}
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.faq')}
              </a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>{currentLanguage.flag} {currentLanguage.name}</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {configuredLanguages.map((lang) => {
                    return (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={locale === lang.code ? "bg-accent" : ""}
                      >
                        {lang.flag} {lang.name}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : session?.user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Coins className="w-4 h-4" />
                    <span>{t('auth.credits', { count: userCredits })}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center space-x-2 p-2"
                      >
                        {session.user.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="max-w-20 truncate">{session.user.name || 'User'}</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                        {t('auth.welcome', { name: session.user.name || 'User' })}
                      </div>
                      <DropdownMenuItem asChild>
                        <Link
                          href={locale === i18nConfig.defaultLocale ? '/dashboard' : `/${locale}/dashboard`}
                          className="flex items-center w-full"
                        >
                          <User className="w-4 h-4 mr-2" />
                          {t('auth.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={locale === i18nConfig.defaultLocale ? '/history' : `/${locale}/history`}
                          className="flex items-center w-full"
                        >
                          <History className="w-4 h-4 mr-2" />
                          History
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('auth.signOut')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <Button size="sm" onClick={handleSignIn}>
                  {t('auth.signIn')}
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Globe className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {configuredLanguages.map((lang) => {
                    return (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={locale === lang.code ? "bg-accent" : ""}
                      >
                        {lang.flag} {lang.code.toUpperCase()}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" onClick={handleToggleMenu}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4 space-y-4">
              <a href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.features')}
              </a>
              <a href="#how-it-works" className="block text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.howItWorks')}
              </a>
              <a href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.pricing')}
              </a>
              <a href="#faq" className="block text-muted-foreground hover:text-foreground transition-colors">
                {t('nav.faq')}
              </a>
              
              {session?.user ? (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Coins className="w-4 h-4" />
                    <span>{t('auth.credits', { count: userCredits })}</span>
                  </div>
                  <div className="text-sm">
                    {t('auth.welcome', { name: session.user.name || 'User' })}
                  </div>
                  <Link 
                    href={locale === i18nConfig.defaultLocale ? '/dashboard' : `/${locale}/dashboard`}
                    className="block"
                  >
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      {t('auth.dashboard')}
                    </Button>
                  </Link>
                  <Link 
                    href={locale === i18nConfig.defaultLocale ? '/history' : `/${locale}/history`}
                    className="block"
                  >
                    <Button size="sm" variant="outline" className="w-full justify-start">
                      <History className="w-4 h-4 mr-2" />
                      History
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={handleSignOut} className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('auth.signOut')}
                  </Button>
                </div>
              ) : (
                <Button size="sm" className="w-full" onClick={handleSignIn}>
                  {t('auth.signIn')}
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Sign In Dialog */}
      <SignInDialog 
        open={isSignInOpen} 
        onOpenChange={setIsSignInOpen} 
      />
    </>
  );
};

export default Header; 