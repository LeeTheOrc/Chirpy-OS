

import React, { useState } from 'react';
// Fix: Import BroomIcon for title consistency and keep TransmuteIcon for swap button.
import { CloseIcon, CopyIcon, BroomIcon, TransmuteIcon } from './Icons';

interface HousekeepingModalProps {
  onClose: () => void;
}

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
            <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words">
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


export const HousekeepingModal: React.FC<HousekeepingModalProps> = ({ onClose }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');
    const [copiedInput, setCopiedInput] = useState(false);
    const [copiedOutput, setCopiedOutput] = useState(false);

    const handleCopy = (text: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEncode = () => {
        setError('');
        if (!input) {
            setOutput('');
            return;
        }
        try {
            // Use encodeURIComponent to handle UTF-8 characters correctly before btoa
            const encoded = btoa(unescape(encodeURIComponent(input)));
            setOutput(encoded);
        } catch (e) {
            setError('Failed to encode text. Check for invalid characters.');
            setOutput('');
        }
    };

    const handleDecode = () => {
        setError('');
        if (!input) {
            setOutput('');
            return;
        }
        try {
            // Use decodeURIComponent to handle UTF-8 characters correctly after atob
            const decoded = decodeURIComponent(escape(atob(input)));
            setOutput(decoded);
        } catch (e) {
            setError('Failed to decode. The input is not valid Base64.');
            setOutput('');
        }
    };

    const handleSwap = () => {
        setInput(output);
        setOutput(input);
        setError('');
    }

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        {/* Fix: Use BroomIcon for consistency with the button that opens this modal. */}
                        <BroomIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Housekeeping Rituals</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    
                    {/* Base64 Section */}
                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel mb-2">Base64 Transmutation</h3>
                        <p className="text-sm mb-4">A simple but powerful rune for transmuting data. Use it to encode plain text into Base64 or decode it back to its original form.</p>

                        <div>
                            <label htmlFor="base64-input" className="block text-sm font-medium text-forge-text-secondary mb-1">Input</label>
                             <div className="relative group">
                                <textarea
                                    id="base64-input"
                                    rows={3}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full bg-forge-bg border border-forge-border rounded-lg p-2 text-sm text-forge-text-primary focus:ring-1 focus:ring-dragon-fire transition-colors pr-10"
                                    placeholder="Enter text to transmute..."
                                />
                                 <button
                                    onClick={() => handleCopy(input, setCopiedInput)}
                                    className="absolute top-2 right-2 p-1.5 bg-forge-panel/80 rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="Copy input"
                                >
                                    {copiedInput ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-4 my-2">
                            <button onClick={handleEncode} className="px-4 py-2 bg-orc-steel/80 text-white rounded-md hover:bg-orc-steel transition-colors text-sm font-semibold">Encode</button>
                            <button onClick={handleSwap} className="p-2 text-forge-text-secondary hover:text-forge-text-primary rounded-full hover:bg-forge-border" title="Swap Input/Output">
                                <TransmuteIcon className="w-5 h-5" />
                            </button>
                            <button onClick={handleDecode} className="px-4 py-2 bg-magic-purple/80 text-white rounded-md hover:bg-magic-purple transition-colors text-sm font-semibold">Decode</button>
                        </div>

                        <div>
                            <label htmlFor="base64-output" className="block text-sm font-medium text-forge-text-secondary mb-1">Output</label>
                            <div className="relative group">
                                <textarea
                                    id="base64-output"
                                    rows={3}
                                    value={output}
                                    readOnly
                                    className="w-full bg-forge-bg/50 border border-forge-border rounded-lg p-2 text-sm text-forge-text-primary focus:ring-0"
                                    placeholder="Transmuted text will appear here..."
                                />
                                 <button
                                    onClick={() => handleCopy(output, setCopiedOutput)}
                                    className="absolute top-2 right-2 p-1.5 bg-forge-panel/80 rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="Copy output"
                                >
                                    {copiedOutput ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
                        </div>
                    </div>

                    <div className="w-full h-px bg-forge-border my-6" />

                    {/* Cleansing Section */}
                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel mb-2">Forge Cleansing</h3>
                        <p className="text-sm mb-4">If a ritual has gone wrong or you wish to start anew, these incantations will cleanse your forge of temporary files and cloned repositories.</p>
                        
                        <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Soft Cleanse (Recommended)</h4>
                        <p className="text-xs">This will remove all local package build <strong className="text-dragon-fire">directories</strong> inside `~/packages`. It's the safest way to get a clean slate, as it leaves essential scripts like `publish-package.sh` untouched.</p>
                        <CodeBlock>find ~/packages -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +</CodeBlock>
                        
                        <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Deep Cleanse (Destructive)</h4>
                        <p className="text-xs text-red-400">WARNING: This will remove your local package builds AND your local clone of the Athenaeum repository (`kael-os-repo`). You will need to re-run Step 1 of the Keystone Ritual to clone it again.</p>
                        <CodeBlock>find ~/packages -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} + && rm -rf ~/kael-os-repo</CodeBlock>
                    </div>
                </div>
            </div>
        </div>
    );
};