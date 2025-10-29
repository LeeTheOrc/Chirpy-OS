import React from 'react';
import { CloseIcon } from './Icons';

interface FileAttachmentProps {
  fileName: string;
  onRemove: () => void;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ fileName, onRemove }) => {
  return (
    <div className="flex items-center justify-between gap-2 bg-gray-700/80 text-gray-300 text-sm rounded-lg mb-3 px-3 py-1.5 animate-fade-in">
      <span className="font-mono truncate" title={fileName}>
        Context: {fileName}
      </span>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        aria-label="Remove attached file"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
