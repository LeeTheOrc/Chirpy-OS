import React, { useState } from 'react';
import { CloseIcon, CopyIcon, DownloadIcon } from './Icons';

const CodeBlock: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    const [copied, setCopied] = useState(false);
    const textToCopy = React.Children.toArray(children).join('');

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-2">
            <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words max-h-[40vh] overflow-y-auto">
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-forge-panel/80 rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                aria-label="Copy code"
            >
                {copied ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};


interface AttunementModalProps {
  script: string;
  onClose: () => void;
}

export const AttunementModal: React.FC<AttunementModalProps> = ({ script, onClose }) => {
    const downloadScript = () => {
        const blob = new Blob([script], { type: 'text/bash' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attune.sh';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary">System Attunement Script</h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>This script is designed to apply your blueprint's configuration to an <strong className="text-dragon-fire">existing Arch Linux or CachyOS system</strong>. It is non-destructive and will not format any drives.</p>
                    <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">How to Use:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-forge-text-secondary">
                        <li>Save the script below as <code className="bg-forge-border px-1 rounded-sm font-mono text-forge-text-secondary">attune.sh</code> on your target system.</li>
                        <li>Open a terminal and make the script executable: <code className="bg-forge-border px-1 rounded-sm font-mono text-forge-text-secondary">chmod +x attune.sh</code></li>
                        <li>Run the script with root privileges: <code className="bg-forge-border px-1 rounded-sm font-mono text-forge-text-secondary">sudo ./attune.sh</code></li>
                    </ol>
                    <CodeBlock>{script}</CodeBlock>
                    <div className="flex justify-center items-center gap-4 mt-6">
                         <button
                            onClick={downloadScript}
                            className="bg-magic-purple hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Download attune.sh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};