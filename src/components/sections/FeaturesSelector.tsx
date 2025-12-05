import dynamic from 'next/dynamic';
import Features from './Features';

// 动态导入所有 Features 变体
const Features1 = dynamic(() => import('./features/1/features'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const Features2 = dynamic(() => import('./features/2/features'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const Features3 = dynamic(() => import('./features/3/features'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

const Features4 = dynamic(() => import('./features/4/features'), {
  loading: () => <div className="py-20 flex items-center justify-center">Loading...</div>,
});

// Features 组件映射
const featuresComponents = {
  default: Features,
  '1': Features1,
  '2': Features2,
  '3': Features3,
  '4': Features4,
} as const;

type FeaturesVariant = keyof typeof featuresComponents;

/**
 * FeaturesSelector - 根据环境变量动态选择 Features 组件
 * 
 * 使用方法：
 * 在 .env.local 中设置 NEXT_PUBLIC_FEATURES_VARIANT:
 * - default: 使用默认 Features 组件
 * - 1, 2, 3, 4: 使用对应的 Features 变体
 * 
 * @example
 * // .env.local
 * NEXT_PUBLIC_FEATURES_VARIANT=default  // 使用默认 Features
 * NEXT_PUBLIC_FEATURES_VARIANT=1        // 使用 Features 变体 1
 * 
 * // 在页面中使用
 * import FeaturesSelector from '@/components/sections/FeaturesSelector'
 * 
 * export default function Page() {
 *   return <FeaturesSelector />
 * }
 */
export default function FeaturesSelector() {
  // 从环境变量读取 Features 变体
  const variant = (process.env.NEXT_PUBLIC_FEATURES_VARIANT || 'default') as FeaturesVariant;
  
  // 获取对应的 Features 组件，如果找不到则使用默认
  const SelectedComponent = featuresComponents[variant] || featuresComponents.default;
  
  // 在开发环境中显示当前使用的变体
  if (process.env.NODE_ENV === 'development') {
    console.log(`[FeaturesSelector] Using Features variant: ${variant}`);
  }
  
  return <SelectedComponent />;
}
