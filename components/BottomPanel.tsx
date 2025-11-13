import React, { useState, useRef } from 'react';
import type { LinkState } from '../types';
import { 
    SendIcon, PaperClipIcon, SparklesIcon, BookOpenIcon, ScanIcon, KeyIcon, 
    VideoCameraIcon, EyeIcon, ForgeIcon, MagnifyingGlassIcon, 
    RocketLaunchIcon, ScrollIcon, ShieldCheckIcon, PackageIcon, ComputerDesktopIcon,
    PaintBrushIcon, BroomIcon, LibraryIcon, WrenchScrewdriverIcon, DuplicateIcon, BeakerIcon, ServerStackIcon, TerminalIcon,
    SignalIcon, ShellPromptIcon, Cog6ToothIcon, ClockIcon
} from './Icons';
import { CommandSuggestions } from './CommandSuggestions';

type ModalType = 
    | 'build' | 'keystone' | 'law' | 'levelup' 
    | 'personality' | 'codex' | 'system-scan' 
    | 'athenaeum-scryer' | 'housekeeping' | 'chronicler'
    | 'forge-inspector' | 'sigil-crafter' | 'keyring-attunement' 
    | 'local-source-ritual' | 'manual-forge' | 'athenaeum-mirror' | 'transmutation-ritual'
    | 'khws-ritual' | 'kael-service'
    | 'forge-builder' | 'tui-installer' | 'kael-console' | 'kael-status-conduit'
    | 'kaelic-shell' | 'allied-forges' | 'hoarding-ritual' | 'chrono-shift'
    | null;


interface BottomPanelProps {
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
}

const TooltipButton: React.FC<{ title: string; onClick: () => void; children: React.ReactNode, colorClass: string }> = ({ title, onClick, children, colorClass }) => (
    <button
        onClick={onClick}
        className={`p-3 rounded-full bg-forge-panel/50 hover:bg-forge-border transition-colors group ${colorClass}`}
        aria-label={title}
        title={title}
    >
        {children}
    </button>
);


export const BottomPanel: React.FC<BottomPanelProps> = ({ value, onChange, onSendMessage, isLoading, linkState, onFileAttached, onOpenMenu, showSuggestions, suggestions, onSelectSuggestion }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div className="bg-forge-panel/90 backdrop-blur-sm border-t-2 border-forge-border rounded-t-xl mt-auto pb-4 px-4 pt-2 shadow-2xl shadow-black/30">
            {showSuggestions && <CommandSuggestions suggestions={suggestions} onSelect={onSelectSuggestion} />}
            
             <div className="flex items-center justify-between gap-2 p-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <TooltipButton title="Kael Codex" onClick={() => onOpenMenu('codex')} colorClass="text-cyan-400"><BookOpenIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Scry System Hardware" onClick={() => onOpenMenu('system-scan')} colorClass="text-blue-400"><ScanIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Chronicler's Orb" onClick={() => onOpenMenu('chronicler')} colorClass="text-magic-purple"><VideoCameraIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="The Kaelic Shell" onClick={() => onOpenMenu('kaelic-shell')} colorClass="text-orc-steel"><ShellPromptIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Kael Command Console (GUI)" onClick={() => onOpenMenu('kael-console')} colorClass="text-green-400"><ComputerDesktopIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="The Forge on Your PC (TUI)" onClick={() => onOpenMenu('tui-installer')} colorClass="text-orc-steel"><TerminalIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Kael Status Conduit (Tray Icon)" onClick={() => onOpenMenu('kael-status-conduit')} colorClass="text-blue-400"><SignalIcon className="w-5 h-5" /></TooltipButton>
                     <div className="w-px h-6 bg-forge-border/50 mx-1" />
                    <TooltipButton title="Keystone Rituals" onClick={() => onOpenMenu('keystone')} colorClass="text-dragon-fire"><KeyIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Attune Allied Forges" onClick={() => onOpenMenu('allied-forges')} colorClass="text-blue-400"><LibraryIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Scry Allied Forges" onClick={() => onOpenMenu('athenaeum-scryer')} colorClass="text-cyan-400"><BookOpenIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Athenaeum Mirroring" onClick={() => onOpenMenu('athenaeum-mirror')} colorClass="text-blue-400"><DuplicateIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="The Hoarding Ritual" onClick={() => onOpenMenu('hoarding-ritual')} colorClass="text-blue-400"><ServerStackIcon className="w-5 h-5" /></TooltipButton>
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
                    <TooltipButton title="Chrono-Shift Ritual (Snapshots)" onClick={() => onOpenMenu('chrono-shift')} colorClass="text-orc-steel"><ClockIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Kael Service Manager" onClick={() => onOpenMenu('kael-service')} colorClass="text-forge-text-secondary"><Cog6ToothIcon className="w-5 h-5" /></TooltipButton>
                    <div className="w-px h-6 bg-forge-border/50 mx-1" />
                    <TooltipButton title="The Core Law" onClick={() => onOpenMenu('law')} colorClass="text-forge-text-secondary"><ScrollIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Level Up Manifesto" onClick={() => onOpenMenu('levelup')} colorClass="text-forge-text-secondary"><RocketLaunchIcon className="w-5 h-5" /></TooltipButton>
                    <TooltipButton title="Kael's Personality" onClick={() => onOpenMenu('personality')} colorClass="text-forge-text-secondary"><SparklesIcon className="w-5 h-5" /></TooltipButton>
                </div>
            </div>

            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={linkState === 'online' ? 'Converse with Kael...' : 'Offline mode. Awaiting instructions...'}
                    className="w-full bg-forge-bg border-2 border-forge-border rounded-lg p-3 pr-24 resize-none focus:ring-1 focus:ring-dragon-fire text-sm transition-colors text-forge-text-primary placeholder:text-forge-text-secondary"
                    rows={1}
                    disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
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
    );
};