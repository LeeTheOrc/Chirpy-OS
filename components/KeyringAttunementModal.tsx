

import React, { useState } from 'react';
import { CloseIcon, CopyIcon, ShieldCheckIcon } from './Icons';

interface KeyringAttunementModalProps {
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

const CHWD_FIX_SCRIPT_RAW = `#!/bin/bash
# Kael OS - CachyOS/Chaotic Key Attunement
set -euo pipefail
echo "--- Attuning to Artisan's Signature ---"
echo "This will add the security key required to build certain packages."
echo "Key ID: B62C3D10C54D5DA9"

# Step 1: Ensure the pacman keyring is initialized and populated.
echo "--> Initializing and populating keyring..."
sudo pacman-key --init
sudo pacman-key --populate archlinux

# Step 2: Receive the key directly into the pacman keyring.
echo "--> Receiving key from keyserver..."
sudo pacman-key --recv-keys B62C3D10C54D5DA9

# Step 3: Locally sign the key to establish trust.
echo "--> Signing the key to establish trust..."
sudo pacman-key --lsign-key B62C3D10C54D5DA9

echo "--- ✅ Attunement Complete ---"
echo "The forge now trusts the artisan. You may retry your build."
`;


export const KeyringAttunementModal: React.FC<KeyringAttunementModalProps> = ({ onClose }) => {
    // UTF-8 safe encoding for a unified command
    const encodedChwdScript = btoa(unescape(encodeURIComponent(CHWD_FIX_SCRIPT_RAW)));
    const fullChwdCommand = `echo "${encodedChwdScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ShieldCheckIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Keyring Attunement Rituals</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, if you're encountering errors like "<strong className="text-dragon-fire">unknown public key</strong>" when forging artifacts, it means the forge doesn't trust the signature of the artisan. This ritual will attune your system to trust the necessary keys.
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Unified Trust Incantation</h3>
                    <p>
                       This unified command will perform the complete three-step ritual to initialize your system's keyring, receive the required key from the public servers, and then sign it to establish local trust. This is often necessary when building packages from repositories like CachyOS or Chaotic-AUR for the first time.
                    </p>
                    <p>
                        <strong className="text-dragon-fire">Copy this entire command block and run it in your terminal.</strong>
                    </p>
                    <CodeBlock lang="bash">{fullChwdCommand}</CodeBlock>
                    
                    <p className="mt-2">
                        After this ritual, your system will be able to verify the signatures from the respective artisan, and you can retry your build.
                    </p>
                </div>
            </div>
        </div>
    );
};