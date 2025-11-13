import React, { useState } from 'react';
import { CloseIcon, CopyIcon, ForgeIcon } from './Icons';

interface ForgeBuilderModalProps {
  script: string;
  onClose: () => void;
}

export const ForgeBuilderModal: React.FC<ForgeBuilderModalProps> = ({ script, onClose }) => {
    const [copied, setCopied] = useState(false);
    
    // The script is large, so we create a unified command
    const encodedScript = btoa(unescape(encodeURIComponent(script)));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ForgeIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Forge Genesis Ritual</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This Genesis Ritual will forge a complete, stable Arch Linux development environment on a machine. This is the recommended "Forge" for building Kael OS artifacts.
                    </p>
                    <p className="p-3 bg-dragon-fire/10 border border-dragon-fire/50 rounded-lg text-sm text-dragon-fire">
                        <strong className="font-bold">Warning:</strong> This script will ERASE the target disk. It is meant to be run from an Arch Linux live USB on a machine you wish to dedicate as a development forge.
                    </p>
                    <p>To perform the ritual, boot into an Arch Linux live environment and run this single, unified command:</p>

                     <div className="relative group my-2 h-64">
                        <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words h-full overflow-y-auto">
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
                </div>
                 <div className="mt-4 flex-shrink-0 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-forge-border rounded-md text-sm font-semibold text-forge-text-primary hover:bg-forge-panel/50">Close</button>
                </div>
            </div>
        </div>
    );
};
