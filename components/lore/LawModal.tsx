
import React from 'react';
import { ScrollIcon } from '../core/Icons';
import { KAEL_LAW_TEXT } from '../../basic';
import { LoreModal } from '../core/FormattedContent';

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
