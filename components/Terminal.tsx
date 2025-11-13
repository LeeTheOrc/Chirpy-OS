import React, { useState, useRef, useEffect } from 'react';
import type { LinkState } from '../types';
import { 
    SendIcon, PaperClipIcon, SparklesIcon, BookOpenIcon, ScanIcon, KeyIcon, 
    VideoCameraIcon, EyeIcon, ForgeIcon, MagnifyingGlassIcon, 
    RocketLaunchIcon, ScrollIcon, ShieldCheckIcon, PackageIcon, ComputerDesktopIcon,
    PaintBrushIcon, BroomIcon, LibraryIcon, WrenchScrewdriverIcon, DuplicateIcon, BeakerIcon, ServerStackIcon,
    CopyIcon
} from './Icons';
import { CommandSuggestions } from './CommandSuggestions';

type ModalType = 
    | 'build' | 'keystone' | 'law' | 'levelup' 
    | 'personality' | 'codex' | 'system-scan' 
    | 'athenaeum-scryer' | 'housekeeping' | 'chronicler'
    | 'forge-inspector' | 'sigil-crafter' | 'keyring-attunement' 
    | 'local-source-ritual' | 'manual-forge' | 'athenaeum-mirror' | 'transmutation-ritual'
    | 'khws-ritual' | 'kael-service'
    | 'forge-builder' | 'tui-installer'
    | null;

interface TerminalProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSendMessage: () => void;
    isLoading: boolean;
    linkState: LinkState;
    onFileAttached: (file: File) => void;
    onOpenMenu: (menu: ModalType) => void;
    showSuggestions: boolean;
    suggestions: string[];
    onSelectSuggestion: (command: string) => void;
    activeTab: 'prompt' | 'script';
    onTabChange: (tab: 'prompt' | 'script') => void;
    stagedScript: string;
}

const TooltipButton: React.FC<{ title: string; onClick: () => void; children: React.ReactNode, colorClass: string }> = ({ title, onClick, children, colorClass }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-full bg-forge-panel/50 hover:bg-forge-border transition-colors group ${colorClass}`}
        aria-label={title}
        title={title}
    >
        {children}
    </button>
);

const CodeBlock: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    const [copied, setCopied] = useState(false);
    const textToCopy = React.Children.toArray(children).join('');

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group h-full">
            <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words h-full overflow-y-auto">
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-forge-panel/80 rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                aria-label="Copy code"
            >
                {copied ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};

export const Terminal: React.FC<TerminalProps> = ({
    value,
    onChange,
    onSendMessage,
    isLoading,
    linkState,
    onFileAttached,
    onOpenMenu,
    showSuggestions,
    suggestions,
    onSelectSuggestion,
    activeTab,
    onTabChange,
    stagedScript
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    useEffect(() => {
        if (activeTab === 'prompt' && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value, activeTab]);

    return (
        <div className="bg-forge-panel/90 backdrop-blur-sm border-t-2 border-forge-border rounded-t-xl mt-auto flex flex-col h-[40vh] max-h-[450px] min-h-[250px] shadow-2xl shadow-black/30">
            {/* Header with Toolbar and Tabs */}
            <div className="flex-shrink-0 border-b border-forge-border/50">
                <div className="flex items-center justify-between gap-2 p-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <TooltipButton title="Kael Codex" onClick={() => onOpenMenu('codex')} colorClass="text-cyan-400"><BookOpenIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Scry System Hardware" onClick={() => onOpenMenu('system-scan')} colorClass="text-blue-400"><ScanIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Chronicler's Orb" onClick={() => onOpenMenu('chronicler')} colorClass="text-magic-purple"><VideoCameraIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="The Forge on Your PC (TUI)" onClick={() => onOpenMenu('tui-installer')} colorClass="text-green-400"><ComputerDesktopIcon className="w-5 h-5" /></TooltipButton>
                        <div className="w-px h-6 bg-forge-border/50 mx-1" />
                        <TooltipButton title="Keystone Rituals" onClick={() => onOpenMenu('keystone')} colorClass="text-dragon-fire"><KeyIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Athenaeum Scryer" onClick={() => onOpenMenu('athenaeum-scryer')} colorClass="text-blue-400"><LibraryIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Athenaeum Mirroring" onClick={() => onOpenMenu('athenaeum-mirror')} colorClass="text-blue-400"><DuplicateIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Keyring Attunement" onClick={() => onOpenMenu('keyring-attunement')} colorClass="text-orc-steel"><ShieldCheckIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Ritual of Insight (khws)" onClick={() => onOpenMenu('khws-ritual')} colorClass="text-blue-400"><EyeIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Allied Forge Ritual (Manual)" onClick={() => onOpenMenu('manual-forge')} colorClass="text-red-400"><WrenchScrewdriverIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Package from Local Source" onClick={() => onOpenMenu('local-source-ritual')} colorClass="text-green-400"><PackageIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Ritual of Transmutation" onClick={() => onOpenMenu('transmutation-ritual')} colorClass="text-magic-purple"><BeakerIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Forge Inspector" onClick={() => onOpenMenu('forge-inspector')} colorClass="text-forge-text-secondary"><MagnifyingGlassIcon className="w-5 h-5" /></TooltipButton>
                        <div className="w-px h-6 bg-forge-border/50 mx-1" />
                        <TooltipButton title="Forge Dev Environment" onClick={() => onOpenMenu('forge-builder')} colorClass="text-orc-steel"><ForgeIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="The Sigil Crafter" onClick={() => onOpenMenu('sigil-crafter')} colorClass="text-magic-purple"><PaintBrushIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Housekeeping Rituals" onClick={() => onOpenMenu('housekeeping')} colorClass="text-forge-text-secondary"><BroomIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Kael Service Manager" onClick={() => onOpenMenu('kael-service')} colorClass="text-forge-text-secondary"><ServerStackIcon className="w-5 h-5" /></TooltipButton>
                        <div className="w-px h-6 bg-forge-border/50 mx-1" />
                        <TooltipButton title="The Core Law" onClick={() => onOpenMenu('law')} colorClass="text-forge-text-secondary"><ScrollIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Level Up Manifesto" onClick={() => onOpenMenu('levelup')} colorClass="text-forge-text-secondary"><RocketLaunchIcon className="w-5 h-5" /></TooltipButton>
                        <TooltipButton title="Kael's Personality" onClick={() => onOpenMenu('personality')} colorClass="text-forge-text-secondary"><SparklesIcon className="w-5 h-5" /></TooltipButton>
                    </div>
                </div>
                <div className="flex items-center px-4 -mt-1">
                    <button onClick={() => onTabChange('prompt')} className={`px-3 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'prompt' ? 'border-dragon-fire text-dragon-fire' : 'border-transparent text-forge-text-secondary hover:text-forge-text-primary'}`}>Prompt</button>
                    <button onClick={() => onTabChange('script')} className={`relative px-3 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'script' ? 'border-dragon-fire text-dragon-fire' : 'border-transparent text-forge-text-secondary hover:text-forge-text-primary'}`}>
                        Staged Script
                        {stagedScript && activeTab !== 'script' && <span className="absolute top-1 right-0 w-2 h-2 rounded-full bg-magic-purple animate-ping"></span>}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'prompt' && (
                    <div className="flex flex-col h-full">
                        {showSuggestions && <CommandSuggestions suggestions={suggestions} onSelect={onSelectSuggestion} />}
                        <div className="flex items-start gap-2 mt-auto font-mono text-sm">
                           <label htmlFor="terminal-input" className="flex-shrink-0 pt-2 text-orc-steel">architect@kael-os:~$</label>
                           <div className="flex-1 relative">
                                <textarea
                                    id="terminal-input"
                                    ref={textareaRef}
                                    value={value}
                                    onChange={onChange}
                                    onKeyDown={handleKeyDown}
                                    placeholder={linkState === 'online' ? 'Forge your command...' : 'Offline mode. Awaiting instructions...'}
                                    className="w-full bg-transparent p-2 pr-20 resize-none focus:ring-0 border-0 text-forge-text-primary placeholder:text-forge-text-secondary/50"
                                    rows={1}
                                    disabled={isLoading}
                                />
                                 <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
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
                )}
                {activeTab === 'script' && (
                    <div className="h-full">
                        {stagedScript ? (
                            <CodeBlock>{stagedScript}</CodeBlock>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-forge-text-secondary/50">
                                <p>No script is currently staged. <br/> Ask me to generate a script, or use one of the toolbar actions.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
