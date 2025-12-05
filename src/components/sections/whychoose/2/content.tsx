import { Cpu, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const iconMap = {
    zap: Zap,
    cpu: Cpu,
}

export default function ContentSection() {
    const t = useTranslations('whyChooseUs.variants.style2')
    const features = t.raw('features') as Array<{
        icon: keyof typeof iconMap
        title: string
        description: string
    }>

    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">{t('title')}</h2>
                <div className="relative">
                    <div className="relative z-10 space-y-4 md:w-1/2">
                        <p>
                            {t('description1')} <span className="font-medium">{t('description1Highlight')}</span> {t('description1After')}
                        </p>
                        <p>{t('description2')}</p>

                        <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
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
                    <div className="md:mask-l-from-35% md:mask-l-to-55% mt-12 h-fit md:absolute md:right-0 md:-top-16 md:mt-0 md:w-[80%]">
                        <div className="border-border/50 relative rounded-2xl border border-dotted p-2">
                            <Image
                                src={t('mainImageDark')}
                                className="hidden rounded-[12px] dark:block"
                                alt={t('mainImageAlt')}
                                width={1207}
                                height={929}
                            />
                            <Image
                                src={t('mainImageLight')}
                                className="rounded-[12px] shadow dark:hidden"
                                alt={t('mainImageAlt')}
                                width={1207}
                                height={929}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
