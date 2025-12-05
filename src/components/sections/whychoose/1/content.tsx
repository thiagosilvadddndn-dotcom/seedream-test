import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function ContentSection() {
    const t = useTranslations('whyChooseUs.variants.style1')
    const testimonial = t.raw('testimonial') as {
        quote: string
        author: string
        companyLogo: string
        companyLogoAlt: string
    }

    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">{t('title')}</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative mb-6 sm:mb-0">
                        <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                            <Image
                                src={t('mainImageDark')}
                                className="hidden rounded-[15px] dark:block"
                                alt={t('mainImageAlt')}
                                width={1207}
                                height={929}
                            />
                            <Image
                                src={t('mainImageLight')}
                                className="rounded-[15px] shadow dark:hidden"
                                alt={t('mainImageAlt')}
                                width={1207}
                                height={929}
                            />
                        </div>
                    </div>

                    <div className="relative space-y-4">
                        <p className="text-muted-foreground">
                            {t('description1')} <span className="text-accent-foreground font-bold">{t('description1Highlight')}</span> {t('description1After')}
                        </p>
                        <p className="text-muted-foreground">{t('description2')}</p>

                        <div className="pt-6">
                            <blockquote className="border-l-4 pl-4">
                                <p>{testimonial.quote}</p>

                                <div className="mt-6 space-y-3">
                                    <cite className="block font-medium">{testimonial.author}</cite>
                                    <img
                                        className="h-5 w-fit dark:invert"
                                        src={testimonial.companyLogo}
                                        alt={testimonial.companyLogoAlt}
                                        height="20"
                                        width="auto"
                                    />
                                </div>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
