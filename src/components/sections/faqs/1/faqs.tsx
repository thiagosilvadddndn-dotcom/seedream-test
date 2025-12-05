import { useTranslations } from 'next-intl'

export default function FAQs() {
    const t = useTranslations('faq.variants.style1')

    const items = t.raw('items') as Array<{
        question: string
        answer: string
        steps?: string[]
        points?: string[]
    }>

    return (
        <section id="faq" className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            {t('title').split(' ').map((word, i, arr) => (
                                <span key={i}>
                                    {word}{' '}
                                    {i < arr.length - 1 && <br className="hidden lg:block" />}
                                </span>
                            ))}
                        </h2>
                        <p>{t('subtitle')}</p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className={index === 0 ? 'pb-6' : 'py-6'}>
                                <h3 className="font-medium">{item.question}</h3>
                                <p className="text-muted-foreground mt-4">{item.answer}</p>

                                {item.steps && (
                                    <ol className="list-outside list-decimal space-y-2 pl-4">
                                        {item.steps.map((step, stepIndex) => (
                                            <li
                                                key={stepIndex}
                                                className="text-muted-foreground mt-4">
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                )}

                                {item.points && (
                                    <ul className="list-outside list-disc space-y-2 pl-4">
                                        {item.points.map((point, pointIndex) => (
                                            <li
                                                key={pointIndex}
                                                className="text-muted-foreground mt-4">
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
