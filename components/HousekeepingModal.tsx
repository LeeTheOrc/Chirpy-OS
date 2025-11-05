import React, { useState } from 'react';
import { CloseIcon, CopyIcon, TransmuteIcon } from './Icons';

interface HousekeepingModalProps {
  onClose: () => void;
}

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
                        <TransmuteIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Base64 Transmutation</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        A simple but powerful rune for transmuting data. Use it to encode plain text into Base64 or decode it back to its original form.
                    </p>

                    <div>
                        <label htmlFor="base64-input" className="block text-sm font-medium text-forge-text-secondary mb-1">Input</label>
                         <div className="relative group">
                            <textarea
                                id="base64-input"
                                rows={5}
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
                                rows={5}
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
            </div>
        </div>
    );
};