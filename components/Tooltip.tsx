import React, { useState } from 'react';
import { QuestionMarkIcon } from './Icons';

interface TooltipProps {
  text: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <QuestionMarkIcon className="w-4 h-4 text-forge-text-secondary/70 cursor-help" />
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-forge-bg border border-forge-border text-forge-text-secondary text-xs rounded-lg shadow-lg z-10 animate-fade-in-fast">
          {text}
        </div>
      )}
    </div>
  );
};