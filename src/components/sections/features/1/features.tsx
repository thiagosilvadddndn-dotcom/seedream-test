import { Activity, DraftingCompass, Mail, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

const iconMap = {
    mail: Mail,
    zap: Zap,
    activity: Activity,
    'drafting-compass': DraftingCompass,
}

export default function FeaturesSection() {
    const t = useTranslations('features.variants.style1')

    const supportItems = t.raw('supportItems') as Array<{
        icon: keyof typeof iconMap
        text: string
    }>

    return (
        <section id="features" className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid items-center gap-12 md:grid-cols-2 md:gap-12 lg:grid-cols-5 lg:gap-24">
                    <div className="lg:col-span-2">
                        <div className="md:pr-6 lg:pr-0">
                            <h2 className="text-4xl font-semibold lg:text-5xl">{t('title')}</h2>
                            <p className="mt-6">{t('subtitle')}</p>
                        </div>
                        <ul className="mt-8 divide-y border-y *:flex *:items-center *:gap-3 *:py-3">
                            {supportItems.map((item, index) => {
                                const Icon = iconMap[item.icon]
                                return (
                                    <li key={index}>
                                        <Icon className="size-5" />
                                        {item.text}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                    <div className="border-border/50 relative rounded-3xl border p-3 lg:col-span-3">
                        <div className="bg-linear-to-b relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                            <Image
                                src={t('mainImageDark')}
                                className="hidden w-full h-auto rounded-[15px] dark:block"
                                alt={t('mainImageAlt')}
                                width={1207}
                                height={929}
                            />
                            <Image
                                src={t('mainImageLight')}
                                className="w-full h-auto rounded-[15px] shadow dark:hidden"
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
