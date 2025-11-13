import React, { useState } from 'react';
import { CloseIcon, CopyIcon } from './Icons';

interface IsoModalProps {
  script: string;
  onClose: () => void;
}

export const IsoModal: React.FC<IsoModalProps> = ({ script, onClose }) => {
    const [copied, setCopied] = useState(false);
    
    const encodedScript = btoa(unescape(encodeURIComponent(script)));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | sudo bash`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider">Master ISO Forge Script</h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-sm text-forge-text-secondary mb-4">
                    <p>This is the master ritual to forge a bootable ISO image of your custom Kael OS. Run this on an existing Arch Linux system (or a Kael OS system).</p>
                    <p className="mt-2 font-semibold text-dragon-fire">Copy this single command and run it in your terminal. It will set up the build environment and create the ISO in your home directory.</p>
                </div>
                <div className="relative group flex-grow">
                     <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono whitespace-pre-wrap break-words h-full overflow-y-auto pr-10">
                        <code>{fullCommand}</code>
                    </pre>
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 bg-forge-panel/80 rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                        aria-label="Copy command"
                    >
                        {copied ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                    </button>
                </div>
                <div className="mt-4 flex-shrink-0 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-forge-border rounded-md text-sm font-semibold text-forge-text-primary hover:bg-forge-panel/50">Close</button>
                </div>
            </div>
        </div>
    );
};
