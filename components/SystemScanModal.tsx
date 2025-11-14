import React, { useState } from 'react';
import { ScanIcon, CloseIcon, CopyIcon } from './Icons';

interface SystemScanModalProps {
  onClose: () => void;
  onComplete: (report: string) => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-sm text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words">
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

export const SystemScanModal: React.FC<SystemScanModalProps> = ({ onClose, onComplete }) => {
    const [report, setReport] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!report.trim()) return;
        setIsSubmitting(true);
        onComplete(report);
        // Give a moment for the user to see the state change before closing
        setTimeout(() => {
            onClose();
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider flex items-center gap-3">
                        <ScanIcon className="w-5 h-5 text-dragon-fire" />
                        Scrying Local Hardware
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 space-y-4 text-forge-text-secondary leading-relaxed">
                    <p>To give me a complete picture of your forge, please run the following command in your system's terminal. This will generate a detailed hardware report.</p>
                    <p className="text-xs italic">You may need to install the tool first with: <code className="font-mono bg-forge-bg px-1 rounded">sudo pacman -S inxi</code></p>
                    
                    <div>
                        <h3 className="font-semibold text-md text-orc-steel mb-1">Step 1: Run this command</h3>
                        <CodeBlock>inxi -Fazy</CodeBlock>
                    </div>

                    <div>
                        <h3 className="font-semibold text-md text-orc-steel mb-1">Step 2: Paste the output below</h3>
                        <textarea
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            rows={8}
                            className="w-full bg-forge-bg border border-forge-border rounded-lg p-2 text-sm font-mono text-forge-text-primary focus:ring-1 focus:ring-dragon-fire transition-colors"
                            placeholder="Paste the full output from the 'inxi' command here..."
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
                <div className="mt-6 flex-shrink-0 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={!report.trim() || isSubmitting}
                        className="bg-dragon-fire hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Report to Kael'}
                    </button>
                </div>
            </div>
        </div>
    );
};