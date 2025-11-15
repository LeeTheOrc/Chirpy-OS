
import React from 'react';
import { CloseIcon, QuestionMarkIcon } from '../core/Icons';

interface ChroniclerUsageModalProps {
  onClose: () => void;
}

export const ChroniclerUsageModal: React.FC<ChroniclerUsageModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <QuestionMarkIcon className="w-5 h-5 text-dragon-fire" />
                    <span>How to use Chronicler</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    This grimoire was restored after a premature Rite of Annihilation. Its contents will be re-forged shortly.
                </p>
                <p>
                    This explains how to use the Chronicler's Orb to record a terminal session and system logs for debugging.
                </p>
            </div>
        </div>
    </div>
  );
};
