import dynamic from 'next/dynamic';
import FAQ from './FAQ';

// 动态导入所有 FAQ 变体
const FAQ1 = dynamic(() => import('./faqs/1/faqs'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const FAQ2 = dynamic(() => import('./faqs/2/faqs'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const FAQ3 = dynamic(() => import('./faqs/3/faqs'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const FAQ4 = dynamic(() => import('./faqs/4/faqs'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

// FAQ 组件映射
const faqComponents = {
  default: FAQ,
  '1': FAQ1,
  '2': FAQ2,
  '3': FAQ3,
  '4': FAQ4,
} as const;

type FAQVariant = keyof typeof faqComponents;

/**
 * FAQSelector - 根据环境变量动态选择 FAQ 组件
 * 
 * 使用方法：
 * 在 .env.local 中设置 NEXT_PUBLIC_FAQ_VARIANT:
 * - default: 使用默认 FAQ 组件
 * - 1, 2, 3, 4: 使用对应的 FAQ 变体
 * 
 * @example
 * // .env.local
 * NEXT_PUBLIC_FAQ_VARIANT=default  // 使用默认 FAQ
 * NEXT_PUBLIC_FAQ_VARIANT=1        // 使用 FAQ 变体 1
 * 
 * // 在页面中使用
 * import FAQSelector from '@/components/sections/FAQSelector'
 * 
 * export default function Page() {
 *   return <FAQSelector />
 * }
 */
export default function FAQSelector() {
  // 从环境变量读取 FAQ 变体
  const faqVariant = (process.env.NEXT_PUBLIC_FAQ_VARIANT || 'default') as FAQVariant;
  
  // 获取对应的 FAQ 组件，如果找不到则使用默认
  const SelectedFAQ = faqComponents[faqVariant] || faqComponents.default;
  
  // 在开发环境中显示当前使用的变体
  if (process.env.NODE_ENV === 'development') {
    console.log(`[FAQSelector] Using FAQ variant: ${faqVariant}`);
  }
  
  return <SelectedFAQ />;
}
