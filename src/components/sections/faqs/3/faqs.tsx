import { type IconName } from 'lucide-react/dynamic'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import ClientAccordion from './client-accordion'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default async function FAQsThree() {
    const t = await getTranslations('faq.variants.style3')

    const faqItems: FAQItem[] = (
        t.raw('items') as Array<{
            icon: IconName
            question: string
            answer: string
        }>
    ).map((item, index) => ({
        id: `item-${index + 1}`,
        ...item,
    }))

    return (
        <section id="faq" className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">{t('title')}</h2>
                            <p className="text-muted-foreground mt-4">
                                {t('contactText')}{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    {t('contactLinkText')}
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <ClientAccordion items={faqItems} />
                    </div>
                </div>
            </div>
        </section>
    )
}
