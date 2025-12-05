import { Cpu, Lock, Sparkles, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

const iconMap = {
    zap: Zap,
    cpu: Cpu,
    lock: Lock,
    sparkles: Sparkles,
}

export default function ContentSection() {
    const t = useTranslations('whyChooseUs.variants.style4')
    const features = t.raw('features') as Array<{
        icon: keyof typeof iconMap
        title: string
        description: string
    }>

    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                <div className="mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">{t('title')}</h2>
                    <p>{t('subtitle')}</p>
                </div>
                <img
                    className="rounded-(--radius) grayscale"
                    src={t('teamImage')}
                    alt={t('teamImageAlt')}
                    height=""
                    width=""
                    loading="lazy"
                />

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
