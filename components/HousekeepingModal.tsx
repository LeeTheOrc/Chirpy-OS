import React, { useState } from 'react';
import { CloseIcon, CopyIcon, WrenchScrewdriverIcon } from './Icons';

interface HousekeepingModalProps {
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
            <pre className={`bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words ${lang ? `language-${lang}` : ''}`}>
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
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <WrenchScrewdriverIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Forge Housekeeping</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, a clean forge is an efficient forge. This is where we perform maintenance rituals to keep our tools sharp and our workspace tidy.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Cleanse the Old `GH_TOKEN` Rune</h3>
                    <p>
                        Our rituals have improved. We no longer use the old <code className="font-mono text-xs">GH_TOKEN</code> rune for authentication; we now use the more secure `gh` command. Let's cleanse this old rune from your Zsh grimoire (<strong className="text-dragon-fire">.zshrc</strong>) to prevent conflicts and stop those pesky warning messages.
                    </p>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 1: Open the Grimoire</h4>
                     <p>Use the nano text editor to open your Zsh configuration file:</p>
                    <CodeBlock lang="bash">nano ~/.zshrc</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 2: Find and Remove the Old Rune</h4>
                    <p>Inside the nano editor, use the arrow keys to look for a line that starts with <code className="font-mono text-xs">export GH_TOKEN=</code>. It will look something like this:</p>
                     <CodeBlock lang="bash"># Your actual token will be a long string of letters and numbers
export GH_TOKEN="ghp_aBcDeFgHiJkLmNoP..."</CodeBlock>
                    <p>Once you find that line, delete the entire line.</p>


                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 3: Save and Close</h4>
                    <p>To save your changes and exit nano, follow this key sequence:</p>
                    <ol className="list-decimal list-inside pl-4 text-sm">
                        <li>Press <strong className="text-orc-steel">Ctrl + X</strong> to exit.</li>
                        <li>Nano will ask if you want to save. Press <strong className="text-orc-steel">Y</strong> for "Yes".</li>
                        <li>Nano will confirm the filename. Just press <strong className="text-orc-steel">Enter</strong>.</li>
                    </ol>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 4: Reload Your Terminal's Magic</h4>
                    <p>The changes won't take effect until you reload your terminal's configuration. The easiest way is to simply close your current terminal and open a new one. The warning message should now be gone!</p>
                </div>
            </div>
        </div>
    );
};