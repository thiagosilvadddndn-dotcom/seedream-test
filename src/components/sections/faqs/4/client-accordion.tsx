'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/sections/faqs/4/ui/accordion'

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
            className="bg-muted dark:bg-muted/50 w-full rounded-2xl p-1">
            {items.map((item) => (
                <div
                    className="group"
                    key={item.id}>
                    <AccordionItem
                        value={item.id}
                        className="data-[state=open]:bg-card dark:data-[state=open]:bg-muted peer rounded-xl border-none px-7 py-1 data-[state=open]:border-none data-[state=open]:shadow-sm">
                        <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                        <AccordionContent>
                            <p className="text-base">{item.answer}</p>
                        </AccordionContent>
                    </AccordionItem>
                    <hr className="mx-7 border-dashed group-last:hidden peer-data-[state=open]:opacity-0" />
                </div>
            ))}
        </Accordion>
    )
}
