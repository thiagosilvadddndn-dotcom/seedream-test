'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/sections/faqs/2/ui/accordion'

type FAQItem = {
    id: string
    question: string
    answer: string
}

export default function ClientAccordion({ items }: { items: FAQItem[] }) {
    return (
        <Accordion
            type="single"
            collapsible
            className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-4 dark:ring-0">
            {items.map((item) => (
                <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border-dashed">
                    <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                    <AccordionContent>
                        <p className="text-base">{item.answer}</p>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
