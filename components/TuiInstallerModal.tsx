import React, { useState } from 'react';
import { CloseIcon, CopyIcon, TerminalIcon } from './Icons';

interface TuiInstallerModalProps {
  script: string;
  onClose: () => void;
}

export const TuiInstallerModal: React.FC<TuiInstallerModalProps> = ({ script, onClose }) => {
    const [copied, setCopied] = useState(false);
    
    // The script is an installer for the TUI, which itself is a script.
    const encodedScript = btoa(unescape(encodeURIComponent(script)));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <TerminalIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Forge on Your PC (TUI Installer)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                       This ritual will install the <strong className="text-dragon-fire">Kael Forge TUI</strong>, a terminal-based interface for applying your blueprint to an existing Arch Linux system.
                    </p>
                    <p>
                        Run this single command in your terminal. It will install the TUI script to <code className="font-mono text-xs">~/.local/bin/kael-installer</code> and ensure it's in your system's PATH.
                    </p>
                     <div className="relative group my-2">
                        <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
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
                     <p>
                        After installation, open a <strong className="text-orc-steel">new terminal</strong> and run the command <code className="font-mono text-xs">kael-installer</code> to start the TUI.
                    </p>
                </div>
            </div>
        </div>
    );
};
