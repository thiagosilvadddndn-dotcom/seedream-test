'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/sections/faqs/3/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default function ClientAccordion({ items }: { items: FAQItem[] }) {
    return (
        <Accordion
            type="single"
            collapsible
            className="w-full space-y-2">
            {items.map((item) => (
                <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="flex size-6">
                                <DynamicIcon
                                    name={item.icon}
                                    className="m-auto size-4"
                                />
                            </div>
                            <span className="text-base">{item.question}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-5">
                        <div className="px-9">
                            <p className="text-base">{item.answer}</p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
