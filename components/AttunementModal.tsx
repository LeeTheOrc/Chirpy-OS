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
            <pre className="bg-slate-950/70 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono pr-12 whitespace-pre-wrap break-words max-h-[40vh] overflow-y-auto">
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-slate-800/80 rounded-md text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
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
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">System Attunement Script</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-slate-300 leading-relaxed space-y-4">
                    <p>This script is designed to apply your blueprint's configuration to an <strong className="text-yellow-400">existing Arch Linux or CachyOS system</strong>. It is non-destructive and will not format any drives.</p>
                    <h3 className="font-semibold text-lg text-white mt-4 mb-2">How to Use:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-400">
                        <li>Save the script below as <code className="bg-slate-800 px-1 rounded-sm font-mono">attune.sh</code> on your target system.</li>
                        <li>Open a terminal and make the script executable: <code className="bg-slate-800 px-1 rounded-sm font-mono">chmod +x attune.sh</code></li>
                        <li>Run the script with root privileges: <code className="bg-slate-800 px-1 rounded-sm font-mono">sudo ./attune.sh</code></li>
                    </ol>
                    <CodeBlock>{script}</CodeBlock>
                    <div className="flex justify-center items-center gap-4 mt-6">
                         <button
                            onClick={downloadScript}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
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