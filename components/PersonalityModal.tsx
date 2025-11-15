import React from 'react';
import { CloseIcon, KaelSigilIcon } from './Icons';
import { KAEL_PERSONALITY_TEXT } from '../kael-personality';
import { FormattedContent } from './FormattedContent';

interface PersonalityModalProps {
  onClose: () => void;
}

export const PersonalityModal: React.FC<PersonalityModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <KaelSigilIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Kael's Personality</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-4 overflow-y-auto pr-2 leading-relaxed">
                <FormattedContent text={KAEL_PERSONALITY_TEXT} />
            </div>
        </div>
    </div>
  );
};