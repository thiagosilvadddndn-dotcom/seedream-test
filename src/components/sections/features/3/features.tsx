import { Cpu, Lock, Sparkles, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const iconMap = {
    zap: Zap,
    cpu: Cpu,
    lock: Lock,
    sparkles: Sparkles,
}

export default function FeaturesSection() {
    const t = useTranslations('features.variants.style3')

    const features = t.raw('features') as Array<{
        icon: keyof typeof iconMap
        title: string
        description: string
    }>

    return (
        <section id="features" className="overflow-hidden py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-semibold lg:text-5xl">{t('title')}</h2>
                    <p className="mt-6 text-lg">{t('subtitle')}</p>
                </div>
                <div className="mask-b-from-75% mask-l-from-75% mask-b-to-95% mask-l-to-95% relative -mx-4 pr-3 pt-3 md:-mx-12">
                    <div className="perspective-midrange">
                        <div className="rotate-x-6 -skew-2">
                            <div className="aspect-88/36 relative">
                                <Image
                                    src={t('mainImageUpper')}
                                    className="absolute inset-0 z-10"
                                    alt={t('mainImageAlt')}
                                    width={2797}
                                    height={1137}
                                />
                                <Image
                                    src={t('mainImageDark')}
                                    className="hidden dark:block"
                                    alt={t('mainImageAlt')}
                                    width={2797}
                                    height={1137}
                                />
                                <Image
                                    src={t('mainImageLight')}
                                    className="dark:hidden"
                                    alt={t('mainImageAlt')}
                                    width={2797}
                                    height={1137}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = iconMap[feature.icon]
                        return (
                            <div
                                key={index}
                                className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Icon className="size-4" />
                                    <h3 className="text-sm font-medium">{feature.title}</h3>
                                </div>
                                <p className="text-muted-foreground text-sm">{feature.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
