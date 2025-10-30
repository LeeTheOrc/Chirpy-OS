import React from 'react';
import { CloseIcon, RocketLaunchIcon } from './Icons';
import { LEVEL_UP_MANIFESTO_TEXT } from '../levelUpManifesto';
import { FormattedContent } from './FormattedContent';

interface LevelUpModalProps {
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <RocketLaunchIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Level Up Manifesto</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 leading-relaxed">
                <FormattedContent text={LEVEL_UP_MANIFESTO_TEXT} />
            </div>
        </div>
    </div>
  );
};