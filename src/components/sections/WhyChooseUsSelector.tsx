import dynamic from 'next/dynamic';
import WhyChooseUs from './WhyChooseUs';

// 动态导入所有 WhyChooseUs 变体
const WhyChooseUs1 = dynamic(() => import('./whychoose/1/content'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const WhyChooseUs2 = dynamic(() => import('./whychoose/2/content'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const WhyChooseUs3 = dynamic(() => import('./whychoose/3/content'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const WhyChooseUs4 = dynamic(() => import('./whychoose/4/content'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

// WhyChooseUs 组件映射
const whyChooseUsComponents = {
  default: WhyChooseUs,
  '1': WhyChooseUs1,
  '2': WhyChooseUs2,
  '3': WhyChooseUs3,
  '4': WhyChooseUs4,
} as const;

type WhyChooseUsVariant = keyof typeof whyChooseUsComponents;

/**
 * WhyChooseUsSelector - 根据环境变量动态选择 WhyChooseUs 组件
 * 
 * 使用方法：
 * 在 .env.local 中设置 NEXT_PUBLIC_WHYCHOOSEUS_VARIANT:
 * - default: 使用默认 WhyChooseUs 组件
 * - 1, 2, 3, 4: 使用对应的 WhyChooseUs 变体
 * 
 * @example
 * // .env.local
 * NEXT_PUBLIC_WHYCHOOSEUS_VARIANT=default  // 使用默认 WhyChooseUs
 * NEXT_PUBLIC_WHYCHOOSEUS_VARIANT=1        // 使用 WhyChooseUs 变体 1
 * 
 * // 在页面中使用
 * import WhyChooseUsSelector from '@/components/sections/WhyChooseUsSelector'
 * 
 * export default function Page() {
 *   return <WhyChooseUsSelector />
 * }
 */
export default function WhyChooseUsSelector() {
  // 从环境变量读取 WhyChooseUs 变体
  const variant = (process.env.NEXT_PUBLIC_WHYCHOOSEUS_VARIANT || 'default') as WhyChooseUsVariant;
  
  // 获取对应的 WhyChooseUs 组件，如果找不到则使用默认
  const SelectedComponent = whyChooseUsComponents[variant] || whyChooseUsComponents.default;
  
  // 在开发环境中显示当前使用的变体
  if (process.env.NODE_ENV === 'development') {
    console.log(`[WhyChooseUsSelector] Using WhyChooseUs variant: ${variant}`);
  }
  
  return <SelectedComponent />;
}
