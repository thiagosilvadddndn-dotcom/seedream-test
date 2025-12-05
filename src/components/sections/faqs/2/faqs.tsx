import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import ClientAccordion from './client-accordion'

export default async function FAQsTwo() {
    const t = await getTranslations('faq.variants.style2')

    const faqItems = (
        t.raw('items') as Array<{
            question: string
            answer: string
        }>
    ).map((item, index) => ({
        id: `item-${index + 1}`,
        ...item,
    }))

    return (
        <section id="faq" className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">{t('title')}</h2>
                    <p className="text-muted-foreground mt-4 text-balance">{t('subtitle')}</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <ClientAccordion items={faqItems} />

                    <p className="text-muted-foreground mt-6 px-8">
                        {t('contactText')}{' '}
                        <Link
                            href="#"
                            className="text-primary font-medium hover:underline">
                            {t('contactLinkText')}
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
