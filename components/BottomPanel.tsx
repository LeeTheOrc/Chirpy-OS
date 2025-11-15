import React from 'react';
import { SendIcon, VideoCameraIcon, RocketLaunchIcon, ScrollIcon, SparklesIcon, PackageIcon, ServerStackIcon, ShieldCheckIcon, HammerIcon, TowerIcon, BeakerIcon, LibraryIcon } from './Icons';
import type { ModalType } from '../App';

interface BottomPanelProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSendMessage: () => void;
    isLoading: boolean;
    onOpenMenu: (menu: ModalType) => void;
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


export const BottomPanel: React.FC<BottomPanelProps> = ({ value, onChange, onSendMessage, isLoading, onOpenMenu }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
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
            
             <div className="flex items-center justify-center gap-2 p-2 flex-wrap">
                <TooltipButton title="Chronicler's Orb (Usage)" onClick={() => onOpenMenu('chroniclerUsage')} colorClass="text-magic-purple"><VideoCameraIcon className="w-5 h-5" /></TooltipButton>
                 <div className="w-px h-6 bg-forge-border/50 mx-1" />
                <TooltipButton title="Forge Dependencies" onClick={() => onOpenMenu('forgeDependencies')} colorClass="text-magic-purple"><BeakerIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Setup Local Forge" onClick={() => onOpenMenu('forgeSetup')} colorClass="text-orc-steel"><HammerIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Forge Chronicler Package" onClick={() => onOpenMenu('forgeChroniclerPackage')} colorClass="text-orc-steel"><PackageIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Athenaeum Pathfinding" onClick={() => onOpenMenu('athenaeumPathfinding')} colorClass="text-sky-400"><TowerIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Athenaeum Sanctification" onClick={() => onOpenMenu('athenaeumSanctification')} colorClass="text-sky-400"><LibraryIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Athenaeum Scribe" onClick={() => onOpenMenu('athenaeumScribe')} colorClass="text-orc-steel"><PackageIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Athenaeum Mirror" onClick={() => onOpenMenu('athenaeumMirror')} colorClass="text-orc-steel"><ServerStackIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Keyring Attunement" onClick={() => onOpenMenu('keyringAttunement')} colorClass="text-orc-steel"><ShieldCheckIcon className="w-5 h-5" /></TooltipButton>
                <div className="w-px h-6 bg-forge-border/50 mx-1" />
                <TooltipButton title="The Core Law" onClick={() => onOpenMenu('law')} colorClass="text-forge-text-secondary"><ScrollIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Level Up Manifesto" onClick={() => onOpenMenu('levelup')} colorClass="text-forge-text-secondary"><RocketLaunchIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Kael's Personality" onClick={() => onOpenMenu('personality')} colorClass="text-forge-text-secondary"><SparklesIcon className="w-5 h-5" /></TooltipButton>
            </div>

            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={'Converse with Kael...'}
                    className="w-full bg-forge-bg border-2 border-forge-border rounded-lg p-3 pr-16 resize-none focus:ring-1 focus:ring-dragon-fire text-sm transition-colors text-forge-text-primary placeholder:text-forge-text-secondary"
                    rows={1}
                    disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
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