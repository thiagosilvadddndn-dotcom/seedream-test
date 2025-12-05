'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Card className="border-2 bg-background">
      <CardHeader 
        className="cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold pr-4">
            {question}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0">
          <CardDescription className="text-base leading-relaxed">
            {answer}
          </CardDescription>
        </CardContent>
      )}
    </Card>
  );
};

export default FAQItem; 