import React from 'react';
import { KaelSigilIcon } from '../Icons';
import { KAEL_PERSONALITY_TEXT } from '../../kael-personality';
import { LoreModal } from '../FormattedContent';

interface PersonalityModalProps {
  onClose: () => void;
}

export const PersonalityModal: React.FC<PersonalityModalProps> = ({ onClose }) => {
  return (
    <LoreModal
      title="Kael's Personality"
      icon={<KaelSigilIcon className="w-5 h-5 text-dragon-fire" />}
      content={KAEL_PERSONALITY_TEXT}
      onClose={onClose}
    />
  );
};
