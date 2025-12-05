import dynamic from 'next/dynamic';
import Hero from './Hero';

// 动态导入所有 Hero 变体
const Hero1 = dynamic(() => import('./hero/1/hero-section'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>,
});

const Hero2 = dynamic(() => import('./hero/2/hero-section'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>,
});

const Hero3 = dynamic(() => import('./hero/3/hero-section'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>,
});

const Hero4 = dynamic(() => import('./hero/4/hero-section'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>,
});

const Hero5 = dynamic(() => import('./hero/5/hero-section'), {
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>,
});

// Hero 组件映射
const heroComponents = {
  default: Hero,
  '1': Hero1,
  '2': Hero2,
  '3': Hero3,
  '4': Hero4,
  '5': Hero5,
} as const;

type HeroVariant = keyof typeof heroComponents;

/**
 * HeroSelector - 根据环境变量动态选择 Hero 组件
 * 
 * 使用方法：
 * 在 .env.local 中设置 NEXT_PUBLIC_HERO_VARIANT:
 * - default: 使用默认 Hero 组件
 * - 1, 2, 3, 4, 5: 使用对应的 Hero 变体
 * 
 * @example
 * // .env.local
 * NEXT_PUBLIC_HERO_VARIANT=default  // 使用默认 Hero
 * NEXT_PUBLIC_HERO_VARIANT=1        // 使用 Hero 变体 1
 * 
 * // 在页面中使用
 * import HeroSelector from '@/components/sections/HeroSelector'
 * 
 * export default function Page() {
 *   return <HeroSelector />
 * }
 */
export default function HeroSelector() {
  // 从环境变量读取 Hero 变体
  const heroVariant = (process.env.NEXT_PUBLIC_HERO_VARIANT || 'default') as HeroVariant;
  
  // 获取对应的 Hero 组件，如果找不到则使用默认
  const SelectedHero = heroComponents[heroVariant] || heroComponents.default;
  
  // 在开发环境中显示当前使用的变体
  if (process.env.NODE_ENV === 'development') {
    console.log(`[HeroSelector] Using Hero variant: ${heroVariant}`);
  }
  
  return <SelectedHero />;
}
