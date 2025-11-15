




import React from 'react';
import { SendIcon, RocketLaunchIcon, ScrollIcon, SparklesIcon, FlameIcon, ComputerDesktopIcon, PackageIcon, KeyIcon, TowerIcon, FolderIcon, ShieldCheckIcon, BookOpenIcon, QuestionMarkIcon, CompletedGrimoireIcon, ServerStackIcon, SignalIcon, EyeIcon } from './Icons';
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
            
             <div className="flex items-center justify-center gap-2 p-2 flex-wrap border-b-2 border-forge-border/50 mb-2">
                <TooltipButton title="Setup Local Forge" onClick={() => onOpenMenu('forgeSetup')} colorClass="text-orc-steel"><ComputerDesktopIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Install Forge Dependencies" onClick={() => onOpenMenu('forgeDependencies')} colorClass="text-orc-steel"><PackageIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Attune GPG Keyring" onClick={() => onOpenMenu('keyringAttunement')} colorClass="text-orc-steel"><KeyIcon className="w-5 h-5" /></TooltipButton>
                <div className="w-px h-6 bg-forge-border/50 mx-1" />
                <TooltipButton title="Sync Athenaeum Mirrorlist" onClick={() => onOpenMenu('athenaeumMirror')} colorClass="text-sky-400"><TowerIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Configure Athenaeum Paths" onClick={() => onOpenMenu('athenaeumPathfinding')} colorClass="text-sky-400"><FolderIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Sanctify Athenaeum Repo" onClick={() => onOpenMenu('athenaeumSanctification')} colorClass="text-sky-400"><ShieldCheckIcon className="w-5 h-5" /></TooltipButton>
                <div className="w-px h-6 bg-forge-border/50 mx-1" />
                {/* FIX: Corrected modal type from 'sftpMirrorSetup' to 'webDiskMirrorSetup' to align with ModalType definition and updated title for consistency. */}
                <TooltipButton title="Setup WebDisk Mirror" onClick={() => onOpenMenu('webDiskMirrorSetup')} colorClass="text-sky-400"><ServerStackIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Publish to Athenaeum" onClick={() => onOpenMenu('athenaeumScribe')} colorClass="text-sky-400"><BookOpenIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Sync All Athenaeums" onClick={() => onOpenMenu('athenaeumConcordance')} colorClass="text-sky-400"><SignalIcon className="w-5 h-5" /></TooltipButton>
                <TooltipButton title="Verify Athenaeums" onClick={() => onOpenMenu('athenaeumVerifier')} colorClass="text-sky-400"><EyeIcon className="w-5 h-5" /></TooltipButton>
            </div>

            <div className="flex items-center justify-center gap-2 p-2 flex-wrap">
                <TooltipButton title="Lore Archive" onClick={() => onOpenMenu('loreArchive')} colorClass="text-forge-text-secondary"><CompletedGrimoireIcon className="w-5 h-5" /></TooltipButton>
                <div className="w-px h-6 bg-forge-border/50 mx-1" />
                <TooltipButton title="Go Nuclear (Reset Forge)" onClick={() => onOpenMenu('goNuclear')} colorClass="text-dragon-fire"><FlameIcon className="w-5 h-5" /></TooltipButton>
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