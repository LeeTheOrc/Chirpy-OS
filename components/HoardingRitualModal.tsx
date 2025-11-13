import React from 'react';
import { CloseIcon, CopyIcon, ServerStackIcon } from './Icons';

interface HoardingRitualModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => {
    const [copied, setCopied] = React.useState(false);
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

export const HoardingRitualModal: React.FC<HoardingRitualModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ServerStackIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Hoarding Ritual</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this is a powerful but dangerous ritual. It allows you to "hoard" all of a package's dependencies from your system's cache and add them to our Athenaeum alongside the main artifact.
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Power and the Peril</h3>
                    <ul className="list-disc list-inside text-sm pl-4 space-y-2">
                        <li><strong className="text-orc-steel">Power (Pros):</strong> Creates self-contained package sets. If you hoard dependencies for an app, you can install that app and its exact dependency versions from our Athenaeum, even if the main Arch repos change. This is excellent for ensuring an application bundle is stable and works offline.</li>
                        <li><strong className="text-dragon-fire">Peril (Cons):</strong> This can massively bloat our Athenaeum. It is NOT a replacement for a true mirror. Hoarding dependencies for many packages can lead to a huge repository size and potential conflicts with system-wide updates.</li>
                    </ul>
                    <p className="mt-2 p-3 bg-dragon-fire/10 border border-dragon-fire/50 rounded-lg text-sm text-dragon-fire">
                        <strong className="font-bold">My Counsel:</strong> Use this ritual sparingly. It is best reserved for specific, self-contained applications where version stability is critical (e.g., bundling a game with all its specific library versions).
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Incantation</h3>
                    <p>
                        The <code className="font-mono text-xs">publish-package.sh</code> script you forged in the Keystone Ritual has been imbued with this power. To invoke it, simply add the <code className="font-mono text-xs text-dragon-fire">--with-deps</code> flag before the package name.
                    </p>
                    <CodeBlock lang="bash">
                        cd ~/packages
                        <br />
                        ./publish-package.sh --with-deps your-package-name
                    </CodeBlock>
                    <p>
                        This will build <code className="font-mono text-xs">your-package-name</code>, then find all its dependencies in your pacman cache, copy them to the Athenaeum, and add everything to the repository database before publishing.
                    </p>
                </div>
            </div>
        </div>
    );
};