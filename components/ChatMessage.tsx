// Fix: Implement the ChatMessage component.
import React, { useState } from 'react';
import type { Message } from '../types';
import { ChirpyAvatar } from './ChirpyAvatar';
import { CopyIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isModel = message.role === 'model';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-4 animate-fade-in ${isModel ? '' : 'flex-row-reverse'}`}>
      {isModel && <ChirpyAvatar />}
      <div className={`flex flex-col gap-2 ${isModel ? '' : 'items-end'}`}>
        <div className={`w-fit max-w-full md:max-w-2xl lg:max-w-3xl rounded-2xl px-4 py-2.5 ${isModel ? 'bg-slate-700/60 text-slate-200' : 'bg-purple-600 text-white'}`}>
            <p className="whitespace-pre-wrap font-sans text-base leading-relaxed">{message.text}</p>
        </div>
        {isModel && message.text !== '...' && (
            <div className="flex items-center justify-start">
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};