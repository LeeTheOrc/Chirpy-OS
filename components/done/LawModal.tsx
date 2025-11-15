import React from 'react';
import { ScrollIcon } from '../Icons';
import { KAEL_LAW_TEXT } from '../../basic';
import { LoreModal } from '../FormattedContent';

interface LawModalProps {
  onClose: () => void;
}

export const LawModal: React.FC<LawModalProps> = ({ onClose }) => {
  return (
    <LoreModal
      title="The Core Law"
      icon={<ScrollIcon className="w-5 h-5 text-dragon-fire" />}
      content={KAEL_LAW_TEXT}
      onClose={onClose}
    />
  );
};
