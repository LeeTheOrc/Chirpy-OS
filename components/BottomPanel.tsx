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
    | 'forge-inspector' | 'sigil-crafter' | 'keyring-ritual' | null;

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


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
    
    const handleMenuItemClick = (modal: ModalType) => {
        onOpenMenu(modal);
        setIsMenuOpen(false);
    }

    return (
        <div className="bg-forge-panel/80 backdrop-blur-sm border-t border-forge-border p-3 rounded-t-xl sticky bottom-0">
            {/* Toolbar Row */}
            <div className="flex items-center justify-center gap-2 border-b border-forge-border pb-3 mb-3">
                <TooltipButton title="Kael Codex" onClick={() => onOpenMenu('codex')} colorClass="text-cyan-400">
                    <BookOpenIcon className="w-5 h-5" />
                </TooltipButton>
                <TooltipButton title="Scry System Hardware" onClick={() => onOpenMenu('system-scan')} colorClass="text-blue-400">
                    <ScanIcon className="w-5 h-5" />
                </TooltipButton>
                 <TooltipButton title="Forge Dev Environment" onClick={() => onOpenMenu('forge-builder')} colorClass="text-orc-steel">
                    <ForgeIcon className="w-5 h-5" />
                </TooltipButton>
                <TooltipButton title="Keystone Rituals" onClick={() => onOpenMenu('keystone')} colorClass="text-dragon-fire">
                    <KeyIcon className="w-5 h-5" />
                </TooltipButton>
                 <TooltipButton title="Keyring Rituals" onClick={() => onOpenMenu('keyring-ritual')} colorClass="text-green-400">
                    <ShieldCheckIcon className="w-5 h-5" />
                </TooltipButton>
                <TooltipButton title="Chronicler's Orb" onClick={() => onOpenMenu('chronicler')} colorClass="text-magic-purple">
                    <VideoCameraIcon className="w-5 h-5" />
                </TooltipButton>
                
                <div className="w-px h-6 bg-forge-border mx-1" />

                <div className="relative" ref={menuRef}>
                    <TooltipButton title="More Rituals" onClick={() => setIsMenuOpen(p => !p)} colorClass="text-forge-text-secondary">
                        <SparklesIcon className="w-5 h-5" />
                    </TooltipButton>
                    {isMenuOpen && (
                        <div className="absolute bottom-full right-0 mb-2 w-72 bg-forge-panel border border-forge-border rounded-lg shadow-2xl z-10 animate-fade-in-fast divide-y divide-forge-border">
                            <ul className="py-1 text-sm text-forge-text-primary">
                                <li className="px-3 py-2 text-xs font-bold text-forge-text-secondary uppercase">The Forge</li>
                                <li><button onClick={() => handleMenuItemClick('sigil-crafter')} className="w-full text-left px-3 py-2 hover:bg-magic-purple/50 flex items-center gap-3"><CodeBracketIcon className="w-4 h-4" /><span>The Sigil Crafter</span></button></li>
                                 <li><button onClick={() => handleMenuItemClick('chwd-ritual')} className="w-full text-left px-3 py-2 hover:bg-magic-purple/50 flex items-center gap-3"><EyeIcon className="w-4 h-4" /><span>Ritual of Insight (`khws`)</span></button></li>
                            </ul>
                            <ul className="py-1 text-sm text-forge-text-primary">
                                <li className="px-3 py-2 text-xs font-bold text-forge-text-secondary uppercase">The Athenaeum</li>
                                <li><button onClick={() => handleMenuItemClick('athenaeum-scryer')} className="w-full text-left px-3 py-2 hover:bg-magic-purple/50 flex items-center gap-3"><BookOpenIcon className="w-4 h-4" /><span>Athenaeum Scryer</span></button></li>
                                <li><button onClick={() => handleMenuItemClick('housekeeping')} className="w-full text-left px-3 py-2 hover:bg-magic-purple/50 flex items-center gap-3"><WrenchScrewdriverIcon className="w-4 h-4" /><span>Forge Housekeeping</span></button></li>
                                <li><button onClick={() => handleMenuItemClick('forge-inspector')} className="w-full text-left px-3 py-2 hover:bg-magic-purple/50 flex items-center gap-3"><MagnifyingGlassIcon className="w-4 h-4" /><span>Forge Inspector</span></button></li>
                            </ul>
                            <ul className="py-1 text-sm text-forge-text-primary">
                                <li className="px-3 py-2 text-xs font-bold text-forge-text-secondary uppercase">The Library</li>
                                <li><button onClick={() => handleMenuItemClick('law')} className="w-full text-left px-3 py-2 hover:bg-magic-purple/50 flex items-center gap-3"><ScrollIcon className="w-4 h-4" /><span>The Core Law</span></button></li>
                                <li><button onClick={() => handleMenuItemClick('levelup')} className="w-full text-left px-3 py-2 hover:bg-magic-purple/50 flex items-center gap-3"><RocketLaunchIcon className="w-4 h-4" /><span>Level Up Manifesto</span></button></li>
                                <li><button onClick={() => handleMenuItemClick('personality')} className="w-full text-left px-3 py-2 hover:bg-magic-purple/50 flex items-center gap-3"><SparklesIcon className="w-4 h-4" /><span>Kael's Personality</span></button></li>
                            </ul>
                        </div>
                    )}
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