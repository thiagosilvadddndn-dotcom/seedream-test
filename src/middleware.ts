import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware({
  ...routing,
  // Disable automatic locale detection
  localeDetection: false
});

export const config = {
  // Match only internationalized pathnames and exclude static assets
  matcher: ['/', '/(zh)/:path*', '/((?!api|_next|_vercel|.*\\..*|features|hero|tool-section|why-choose).*)']
}; 