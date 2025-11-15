
import React from 'react';
import { RocketLaunchIcon } from '../core/Icons';
import { LEVEL_UP_MANIFESTO_TEXT } from '../../basic';
import { LoreModal } from '../core/FormattedContent';

interface LevelUpModalProps {
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ onClose }) => {
  return (
    <LoreModal
      title="Level Up Manifesto"
      icon={<RocketLaunchIcon className="w-5 h-5 text-dragon-fire" />}
      content={LEVEL_UP_MANIFESTO_TEXT}
      onClose={onClose}
    />
  );
};
