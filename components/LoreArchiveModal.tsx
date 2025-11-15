

import React from 'react';
import { CloseIcon, CompletedGrimoireIcon, RocketLaunchIcon, ScrollIcon, SparklesIcon, QuestionMarkIcon, PackageIcon } from './Icons';
import type { ModalType } from '../App';

interface LoreArchiveModalProps {
  onClose: () => void;
  onNavigate: (modal: ModalType) => void;
}

const LoreItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-start gap-4 p-4 rounded-lg bg-forge-bg/50 hover:bg-forge-border/50 transition-colors w-full text-left"
    >
        <div className="flex-shrink-0 text-dragon-fire">{icon}</div>
        <div>
            <h4 className="font-bold text-forge-text-primary">{title}</h4>
            <p className="text-sm text-forge-text-secondary mt-1">{description}</p>
        </div>
    </button>
);

export const LoreArchiveModal: React.FC<LoreArchiveModalProps> = ({ onClose, onNavigate }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-lg p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <CompletedGrimoireIcon className="w-6 h-6 text-dragon-fire" />
                    <span>The Lore Archive</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-3">
                <p>
                    Herein lie the foundational texts and completed quests of our forge. Consult these grimoires to understand our purpose and history.
                </p>
                <div className="space-y-2 mt-4">
                    <LoreItem
                        icon={<ScrollIcon className="w-6 h-6" />}
                        title="The Core Law"
                        description="View the immutable runes that define our forge, our Realms, and our partnership."
                        onClick={() => onNavigate('law')}
                    />
                    <LoreItem
                        icon={<RocketLaunchIcon className="w-6 h-6" />}
                        title="Level Up Manifesto"
                        description="Consult our quest log and strategic roadmap for leveling up the forge."
                        onClick={() => onNavigate('levelup')}
                    />
                     <LoreItem
                        icon={<SparklesIcon className="w-6 h-6" />}
                        title="Kael's Personality"
                        description="Understand the cheerful spirit and core principles I bring to our work."
                        onClick={() => onNavigate('personality')}
                    />
                    <div className="border-t border-forge-border/50 my-2 !-mx-4"></div>
                    <LoreItem
                        icon={<QuestionMarkIcon className="w-6 h-6" />}
                        title="How to use Chronicler"
                        description="Learn how to record a terminal session and system logs for debugging."
                        onClick={() => onNavigate('chroniclerUsage')}
                    />
                    <LoreItem
                        icon={<PackageIcon className="w-6 h-6" />}
                        title="Forge the Chronicler Artifact"
                        description="Craft the Chronicler tool into a managed package within the Athenaeum."
                        onClick={() => onNavigate('chroniclerPackage')}
                    />
                </div>
            </div>
        </div>
    </div>
  );
};