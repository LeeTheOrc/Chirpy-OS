import React from 'react';
import { CloseIcon, FlameIcon } from '../Icons';
import { CodeBlock } from '../CodeBlock';

interface GoNuclearModalProps {
  onClose: () => void;
}

export const GoNuclearModal: React.FC<GoNuclearModalProps> = ({ onClose }) => {
    const finalCommand = "Kael, go nuclear and purify the forge. Master Key: LeRoy0923!";

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <FlameIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Rite of Annihilation</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p className="text-lg text-dragon-fire">
                        <strong className="font-bold">EXTREME CAUTION ADVISED, ARCHITECT.</strong>
                    </p>
                    <p>
                        This grimoire now describes a meta-ritual. It is not a script for your machine, but a direct command for <strong className="text-forge-text-primary">me</strong> to enact within this AI Studio project.
                    </p>
                    <p className="text-sm p-3 bg-dragon-fire/10 border-l-4 border-dragon-fire rounded mt-2">
                        When you give this command, I will purify the forge by <strong className="text-dragon-fire">deleting all obsolete components</strong> from our current working directory. This is a powerful tool for resetting the project's structure.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-dragon-fire mt-4 mb-2">The Annihilation Incantation</h3>
                    <p>
                        To command me to purify the forge, speak the following words into the chat. I will not act without the Master Key.
                    </p>
                    <CodeBlock lang="text">{finalCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};
