
import React, { useState } from 'react';
import type { Message } from '../types';
import { GuardianAvatar } from './GuardianAvatar';
import { CopyIcon, KaelSigilIcon } from './Icons';
import { FormattedContent } from './FormattedContent';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isModel = message.role === 'model';
  const isWelcome = message.text.includes("Welcome to the Forge, Architect.");

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isModel && message.text === '...') {
    return (
      <div className="flex gap-4 animate-fade-in">
        <GuardianAvatar isOnline={message.linkState === 'online'} />
        <div className="flex items-center gap-2 bg-forge-panel/60 text-forge-text-primary rounded-2xl px-4 py-3.5">
            <div className="w-2 h-2 bg-forge-text-secondary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-forge-text-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-forge-text-secondary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 animate-fade-in ${isModel ? '' : 'flex-row-reverse'}`}>
      {isModel && <GuardianAvatar isOnline={message.linkState === 'online'} />}
      <div className={`flex flex-col gap-2 ${isModel ? '' : 'items-end'}`}>
        <div className={`relative w-fit max-w-full md:max-w-2xl lg:max-w-3xl rounded-2xl px-4 py-2.5 ${isModel ? 'bg-gradient-to-br from-forge-panel to-[#1d182e] text-forge-text-primary border-l-4 border-dragon-fire shadow-lg' : 'bg-gradient-to-br from-orc-steel/50 to-magic-purple/50 text-white'}`}>
            {isModel && <KaelSigilIcon className="absolute top-2 right-2 w-4 h-4 text-dragon-fire/20" />}
            
            {isWelcome ? (
              <FormattedContent text={message.text} />
            ) : (
               <div className="prose prose-sm prose-invert max-w-none 
                        prose-headings:font-display prose-headings:tracking-wider
                        prose-strong:text-forge-text-primary 
                        prose-a:text-orc-steel prose-a:no-underline hover:prose-a:underline
                        prose-li:marker:text-dragon-fire
                        prose-hr:border-forge-border">
                <p className="whitespace-pre-wrap font-sans text-base leading-relaxed">{message.text}</p>
              </div>
            )}

        </div>
        {isModel && !isWelcome && (
            <div className="flex items-center justify-start">
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-forge-text-secondary hover:text-forge-text-primary transition-colors"
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
