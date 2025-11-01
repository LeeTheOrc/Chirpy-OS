import React, { useState, useRef, useEffect } from 'react';
import type { LinkState } from '../types';
import { 
    SendIcon, PaperClipIcon, SparklesIcon, BookOpenIcon, ScanIcon, KeyIcon, 
    WrenchScrewdriverIcon, VideoCameraIcon, EyeIcon, ForgeIcon, MagnifyingGlassIcon, 
    RocketLaunchIcon, ScrollIcon, CodeBracketIcon, ShieldCheckIcon
} from './Icons';

type ModalType = 
    | 'build' | 'iso' | 'keystone' | 'ai-core' | 'law' | 'levelup' 
    | 'personality' | 'codex' | 'system-scan' | 'forge-builder'
    | 'athenaeum-scryer' | 'housekeeping' | 'chwd-ritual' | 'chronicler'
    | 'forge-inspector' | 'sigil-crafter' | 'keyring-attunement' | null;

interface BottomPanelProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSendMessage: () => void;
    isLoading: boolean;
    linkState: LinkState;
    onFileAttached: (file: File) => void;
    onOpenMenu: (menu: ModalType) => void;
}

const TooltipButton: React.FC<{ title: string; onClick: () => void; children: React.ReactNode, colorClass: string }> = ({ title, onClick, children, colorClass }) => (
    <button
        onClick={onClick}
        className={`p-2.5 rounded-full bg-forge-panel hover:bg-forge-border transition-colors group ${colorClass}`}
        aria-label={title}
        title={title}
    >
        {children}
    </button>
);


export const BottomPanel: React.FC<BottomPanelProps> = ({
    value,
    onChange,
    onSendMessage,
    isLoading,
    linkState,
    onFileAttached,
    onOpenMenu
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = currentTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };
    
    const handleFileClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileAttached(e.target.files[0]);
        }
    };

    return (
        <div className="bg-forge-panel/80 backdrop-blur-sm border-t border-forge-border p-3 rounded-t-xl mt-auto">
            {/* Toolbar Row */}
            <div className="flex items-center justify-between gap-2 border-b border-forge-border pb-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Primary Tools */}
                    <TooltipButton title="Kael Codex" onClick={() => onOpenMenu('codex')} colorClass="text-cyan-400"><BookOpenIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Scry System Hardware" onClick={() => onOpenMenu('system-scan')} colorClass="text-blue-400"><ScanIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Forge Dev Environment" onClick={() => onOpenMenu('forge-builder')} colorClass="text-orc-steel"><ForgeIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Keystone Rituals" onClick={() => onOpenMenu('keystone')} colorClass="text-dragon-fire"><KeyIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Chronicler's Orb" onClick={() => onOpenMenu('chronicler')} colorClass="text-magic-purple"><VideoCameraIcon className="w-5 h-5" /></TooltipButton>
                    
                    <div className="w-px h-6 bg-forge-border mx-1" />
                    
                    {/* Forge Tools */}
                    <TooltipButton title="The Sigil Crafter" onClick={() => onOpenMenu('sigil-crafter')} colorClass="text-forge-text-secondary"><CodeBracketIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Ritual of Insight (`khws`)" onClick={() => onOpenMenu('chwd-ritual')} colorClass="text-forge-text-secondary"><EyeIcon className="w-5 h-5" /></TooltipButton>
                   
                    <div className="w-px h-6 bg-forge-border mx-1" />
                    
                    {/* Athenaeum Tools */}
                    <TooltipButton title="Keyring Attunement" onClick={() => onOpenMenu('keyring-attunement')} colorClass="text-forge-text-secondary"><ShieldCheckIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Athenaeum Scryer" onClick={() => onOpenMenu('athenaeum-scryer')} colorClass="text-forge-text-secondary"><BookOpenIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Forge Housekeeping" onClick={() => onOpenMenu('housekeeping')} colorClass="text-forge-text-secondary"><WrenchScrewdriverIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Forge Inspector" onClick={() => onOpenMenu('forge-inspector')} colorClass="text-forge-text-secondary"><MagnifyingGlassIcon className="w-5 h-5" /></TooltipButton>

                    <div className="w-px h-6 bg-forge-border mx-1" />

                    {/* Library */}
                    <TooltipButton title="The Core Law" onClick={() => onOpenMenu('law')} colorClass="text-forge-text-secondary"><ScrollIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Level Up Manifesto" onClick={() => onOpenMenu('levelup')} colorClass="text-forge-text-secondary"><RocketLaunchIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Kael's Personality" onClick={() => onOpenMenu('personality')} colorClass="text-forge-text-secondary"><SparklesIcon className="w-5 h-5" /></TooltipButton>
                </div>
                 <div className="text-right font-mono text-xs text-forge-text-secondary/80">
                    <div>{formattedTime}</div>
                    <div>{formattedDate}</div>
                </div>
            </div>
            {/* Chat Input Row */}
            <div className="flex items-start gap-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={onChange}
                        onKeyDown={handleKeyDown}
                        placeholder={linkState === 'online' ? 'Forge your command...' : 'Offline mode. Awaiting instructions...'}
                        className="w-full bg-forge-bg border border-forge-border rounded-xl p-3 pr-20 resize-none focus:ring-1 focus:ring-dragon-fire transition-colors"
                        rows={1}
                        disabled={isLoading}
                    />
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                         <button
                            onClick={handleFileClick}
                            className="p-2 text-forge-text-secondary hover:text-forge-text-primary transition-colors disabled:opacity-50"
                            aria-label="Attach file"
                            disabled={isLoading}
                        >
                            <PaperClipIcon className="w-5 h-5" />
                        </button>
                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button
                            onClick={onSendMessage}
                            disabled={isLoading || (!value.trim())}
                            className="p-2 bg-dragon-fire text-black rounded-lg transition-colors disabled:bg-forge-border disabled:text-forge-text-secondary"
                            aria-label="Send message"
                        >
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};