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

const FULL_COMMAND = `sudo bash <<'EOF'
#!/bin/bash
# Kael OS - Keyring Fix Script
# Adds CachyOS and Chaotic-AUR repositories and keys to an existing system.

set -euo pipefail

echo "--- Starting System Trust Update ---"
echo "This script will add the required security keys for the CachyOS and Chaotic-AUR software sources."
echo "You will be asked for your password to authorize these system-level changes."
echo ""

# --- CachyOS Setup ---
echo "--> Adding the CachyOS software source and its security key..."
pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com
pacman-key --lsign-key F3B607488DB35A47
pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'

CACHY_CONFIG="
[cachyos-v3]
Include = /etc/pacman.d/cachyos-v3-mirrorlist
[cachyos-v4]
Include = /etc/pacman.d/cachyos-v4-mirrorlist
[cachyos]
Include = /etc/pacman.d/cachyos-mirrorlist"

if ! grep -q "\\[cachyos\\]" /etc/pacman.conf; then
    echo "Adding CachyOS configuration to /etc/pacman.conf"
    echo "$CACHY_CONFIG" >> /etc/pacman.conf
else
    echo "CachyOS configuration already present in /etc/pacman.conf"
fi
echo "--> CachyOS is now a trusted source."
echo ""

# --- Chaotic-AUR Setup ---
echo "--> Adding the Chaotic-AUR software source and its security key..."
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'

CHAOTIC_CONFIG="
[chaotic-aur]
Include = /etc/pacman.d/chaotic-mirrorlist"

if ! grep -q "\\[chaotic-aur\\]" /etc/pacman.conf; then
    echo "Adding Chaotic-AUR configuration to /etc/pacman.conf"
    echo "$CHAOTIC_CONFIG" >> /etc/pacman.conf
else
    echo "Chaotic-AUR configuration already present in /etc/pacman.conf"
fi
echo "--> Chaotic-AUR is now a trusted source."
echo ""

# --- Final Synchronization ---
echo "--> Updating all software sources to apply changes..."
pacman -Syyu --noconfirm

echo ""
echo "--- ✅ System Trust Update Complete! ---"
echo "Your system now trusts the CachyOS and Chaotic-AUR forges."
EOF
`;

export const KeyringAttunementModal: React.FC<KeyringAttunementModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ShieldCheckIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Fix 'Untrusted Key' Errors</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Are you seeing errors like "<strong className="text-dragon-fire">unknown public key</strong>" or "<strong className="text-dragon-fire">corrupted package</strong>" when trying to install software? This is a common security feature, and it's easy to fix.
                    </p>
                    <p>
                        It just means your system doesn't know if it can trust where the software is coming from. This script will introduce your system to two trusted software sources: <strong className="text-orc-steel">CachyOS</strong> and the <strong className="text-orc-steel">Chaotic-AUR</strong>.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The One-Step Fix</h3>
                    <p>
                       <strong className="text-dragon-fire">Copy the entire command block below and paste it into your terminal.</strong> It will ask for your password because it needs permission to update your system's list of trusted sources.
                    </p>
                    <CodeBlock lang="bash">{FULL_COMMAND}</CodeBlock>

                    <p className="mt-2">
                        After the script finishes, your system will be able to install and update software from these sources without any more trust issues.
                    </p>
                </div>
            </div>
        </div>
    );
};