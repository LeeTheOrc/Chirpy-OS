
import React, { useState } from 'react';
import { CloseIcon, CopyIcon, MagnifyingGlassIcon } from './Icons';

interface ForgeInspectorModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => {
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
            <pre className={`bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words max-h-64 overflow-y-auto ${lang ? `language-${lang}` : ''}`}>
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

const INSTALL_INXI_RAW = `paru -S --noconfirm inxi`;

export const ForgeInspectorModal: React.FC<ForgeInspectorModalProps> = ({ onClose }) => {
    
    const createUniversalCommand = (script: string) => {
        const encoded = btoa(unescape(encodeURIComponent(script.trim())));
        return `echo "${encoded}" | base64 --decode | sudo bash`;
    };

    const installInxiCommand = createUniversalCommand(INSTALL_INXI_RAW);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <MagnifyingGlassIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Forge Inspector</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, the Forge Inspector is not a single tool, but a rite of inspection using the powerful <strong className="text-dragon-fire">`inxi`</strong> script. This grimoire allows you to scry deep into the Realm's hardware and software configuration, revealing everything from the CPU's heart to the kernel's soul.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Ensure `inxi` is Forged</h3>
                    <p>
                        While `inxi` is often a part of a well-equipped forge, you can ensure its presence with this command:
                    </p>
                    <CodeBlock lang="bash">{installInxiCommand}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Common Inspection Incantations</h3>
                    <p>
                        Here are some common incantations to reveal the Realm's secrets.
                    </p>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Quick Overview</h4>
                    <p className="text-xs">A brief, but informative, summary of the system.</p>
                    <CodeBlock lang="bash">inxi -b</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">The Full Grimoire (Very Detailed)</h4>
                    <p className="text-xs">This is the master incantation. It reveals an exhaustive report on every aspect of the system. This is the most useful command for deep debugging.</p>
                    <CodeBlock lang="bash">inxi -Fazy</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Graphics Scrying</h4>
                     <p className="text-xs">Focus the inspection on the graphics card, drivers, and display server.</p>
                    <CodeBlock lang="bash">inxi -Gazy</CodeBlock>
                </div>
            </div>
        </div>
    );
};
