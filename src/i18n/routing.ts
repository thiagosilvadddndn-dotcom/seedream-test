import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en","fr","es","de","ja","ko"],

  // Used when no locale matches
  defaultLocale: 'en',

  // Configure locale prefix - 英文不需要前缀，其他语言需要前缀
  localePrefix: {
    mode: 'as-needed'
  },

  // Disable automatic locale detection
  localeDetection: false
});
