'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AspectRatioSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}

const AspectRatioSelector = ({ value, onChange, options }: AspectRatioSelectorProps) => {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const getRatioClass = (ratio: string) => {
    switch (ratio) {
      case '1:1':
        return 'aspect-square';
      case '16:9':
        return 'aspect-video';
      case '9:16':
        return 'aspect-[9/16]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 lg:gap-4">
        {options.map((option) => {
          const isSelected = value === option.value;
          const isHovered = hoveredOption === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              onMouseEnter={() => setHoveredOption(option.value)}
              onMouseLeave={() => setHoveredOption(null)}
              className={cn(
                "relative p-2 lg:p-4 rounded-xl transition-all duration-300 transform",
                "hover:scale-105 active:scale-95",
                "group focus:outline-none focus:ring-2 focus:ring-primary/50",
                isSelected
                  ? "bg-gradient-to-br from-primary/30 to-primary/15 border-2 border-primary shadow-xl shadow-primary/30 scale-105 ring-2 ring-primary/40"
                  : "bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-muted/30 hover:border-primary/40 hover:shadow-md"
              )}
            >
              {/* Selection indicator with enhanced visibility */}
              {isSelected && (
                <>
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                  </div>
                  {/* Additional corner glow */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary/30 rounded-full animate-pulse blur-sm"></div>
                </>
              )}
              
              <div className="space-y-2 lg:space-y-3">
                {/* Visual representation with enhanced selected state */}
                <div className="mx-auto max-w-[40px] lg:max-w-[50px] relative">
                  <div className={cn(
                    "w-full rounded-lg transition-all duration-300 border-2 relative overflow-hidden",
                    getRatioClass(option.value),
                    isSelected 
                      ? "bg-gradient-to-br from-primary/40 to-primary/25 border-primary shadow-lg shadow-primary/20" 
                      : "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
                    isHovered && !isSelected && "border-primary/40 bg-gradient-to-br from-primary/20 to-primary/10"
                  )}>
                    {/* Enhanced inner glow effect for selected state */}
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-lg animate-pulse"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg"></div>
                      </>
                    )}
                  </div>
                  
                  {/* Enhanced animated border effect */}
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 rounded-lg border-2 border-primary/50 animate-ping"></div>
                      <div className="absolute -inset-1 rounded-lg border border-primary/30 animate-pulse"></div>
                    </>
                  )}
                </div>
                
                {/* Enhanced label with selected state */}
                <div className={cn(
                  "text-xs font-bold text-center transition-all duration-300",
                  isSelected 
                    ? "text-primary scale-110 drop-shadow-sm" 
                    : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {option.value}
                  {/* Selected badge */}
                  {isSelected && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                  )}
                </div>
                
                {/* Enhanced description with selected emphasis */}
                <div className={cn(
                  "text-[9px] lg:text-[10px] text-center transition-all duration-300",
                  isSelected 
                    ? "opacity-100 text-primary/80 font-medium" 
                    : "opacity-0 group-hover:opacity-100 text-muted-foreground/70"
                )}>
                  {option.label.replace(/.*\(|\)/g, '')}
                </div>
              </div>
              
              {/* Enhanced hover effect overlay */}
              <div className={cn(
                "absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none",
                "bg-gradient-to-br from-primary/5 to-transparent opacity-0",
                isHovered && "opacity-100"
              )}></div>
              
              {/* Selection glow effect */}
              {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 via-transparent to-primary/5 animate-pulse pointer-events-none"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Enhanced selected option details */}
      <div className="text-center">
        <div className={cn(
          "inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300",
          "bg-gradient-to-r from-primary/15 to-primary/10 border border-primary/20 shadow-lg"
        )}>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-sm"></div>
          <span className="text-xs lg:text-sm font-semibold text-primary">
            Selected: {options.find(opt => opt.value === value)?.label}
          </span>
          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-ping"></div>
        </div>
      </div>
    </div>
  );
};

export default AspectRatioSelector; 