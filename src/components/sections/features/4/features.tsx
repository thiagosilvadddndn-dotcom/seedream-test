'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/sections/features/4/ui/accordion'
import { BorderBeam } from '@/components/sections/features/4/ui/border-beam'
import { ChartBarIncreasingIcon, Database, Fingerprint, IdCard } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const iconMap = {
    database: Database,
    fingerprint: Fingerprint,
    'id-card': IdCard,
    'chart-bar-increasing': ChartBarIncreasingIcon,
}

export default function Features() {
    type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'
    const t = useTranslations('features.variants.style4')

    const items = t.raw('items') as Array<{
        icon: keyof typeof iconMap
        title: string
        description: string
        image: string
        imageAlt: string
    }>

    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    const images = items.reduce(
        (acc, item, index) => {
            acc[`item-${index + 1}` as ImageKey] = {
                image: item.image,
                alt: item.imageAlt,
            }
            return acc
        },
        {} as Record<ImageKey, { image: string; alt: string }>
    )

    return (
        <section id="features" className="py-12 md:py-20 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">{t('title')}</h2>
                    <p>{t('subtitle')}</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value) => setActiveItem(value as ImageKey)}
                        className="w-full">
                        {items.map((item, index) => {
                            const Icon = iconMap[item.icon]
                            return (
                                <AccordionItem
                                    key={`item-${index + 1}`}
                                    value={`item-${index + 1}`}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-2 text-base">
                                            <Icon className="size-4" />
                                            {item.title}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>{item.description}</AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>

                    <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
                        <div className="bg-background relative w-full rounded-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md">
                                    <Image
                                        src={images[activeItem].image}
                                        className="w-full h-auto object-cover dark:mix-blend-lighten"
                                        alt={images[activeItem].alt}
                                        width={1207}
                                        height={929}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
