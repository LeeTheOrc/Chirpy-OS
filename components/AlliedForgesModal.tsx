

import React from 'react';
import { CloseIcon, CopyIcon, LibraryIcon } from './Icons';

interface AlliedForgesModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
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
            <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
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

const ALLIED_FORGES_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Allied Forges Attunement Ritual
set -euo pipefail
clear

echo "--- Attuning to Allied Forges ---"
echo "This ritual will configure your system to trust and use repositories from CachyOS and the Chaotic-AUR."
read -p "Press [Enter] to continue or Ctrl+C to abort."

# --- Helper Function ---
add_repo_if_not_exists() {
    local repo_name="$1"
    local repo_conf="$2"
    if ! grep -q "^\\[$repo_name\\]" /etc/pacman.conf; then
        echo "--> Adding '$repo_name' repository to /etc/pacman.conf..."
        echo -e "$repo_conf" | sudo tee -a /etc/pacman.conf > /dev/null
    else
        echo "--> '$repo_name' repository already configured."
    fi
}

# --- Keyring Initialization ---
echo "--> Initializing and populating the system keyring..."
sudo pacman-key --init
sudo pacman-key --populate archlinux

# --- CachyOS ---
KEY_ID_CACHY="F3B607488DB35A47"
echo "--> Attuning to the CachyOS Forge..."
if (sudo pacman-key --recv-keys "$KEY_ID_CACHY" --keyserver hkp://keyserver.ubuntu.com || sudo pacman-key --recv-keys "$KEY_ID_CACHY" --keyserver hkp://keys.openpgp.org); then
    echo "CachyOS key received from keyserver."
elif (curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x$KEY_ID_CACHY" | sudo pacman-key --add - && sudo pacman-key --updatedb); then
    echo "CachyOS key received via direct HTTPS download."
else
    echo "FATAL: Could not retrieve CachyOS key. Attunement failed." >&2; exit 1
fi
sudo pacman-key --lsign-key "$KEY_ID_CACHY"
sudo pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'
add_repo_if_not_exists "cachyos-v3" "\\n[cachyos-v3]\\nInclude = /etc/pacman.d/cachyos-v3-mirrorlist"
add_repo_if_not_exists "cachyos-v4" "\\n[cachyos-v4]\\nInclude = /etc/pacman.d/cachyos-v4-mirrorlist"
add_repo_if_not_exists "cachyos" "\\n[cachyos]\\nInclude = /etc/pacman.d/cachyos-mirrorlist"

# --- Chaotic-AUR ---
KEY_ID_CHAOTIC="3056513887B78AEB"
echo "--> Attuning to the Chaotic-AUR..."
sudo pacman-key --recv-key "$KEY_ID_CHAOTIC" --keyserver keyserver.ubuntu.com
sudo pacman-key --lsign-key "$KEY_ID_CHAOTIC"
sudo pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
add_repo_if_not_exists "chaotic-aur" "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist"

# --- Final Sync ---
echo "--> Synchronizing all package databases..."
sudo pacman -Syy

echo ""
echo "--- ✅ Attunement Complete ---"
echo "Your system is now configured to use CachyOS and Chaotic-AUR repositories."
`;

export const AlliedForgesModal: React.FC<AlliedForgesModalProps> = ({ onClose }) => {
    const encodedScript = btoa(unescape(encodeURIComponent(ALLIED_FORGES_SCRIPT_RAW)));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <LibraryIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Allied Forges Attunement</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This unified ritual will attune your system to the repositories of our most powerful allies, granting access to their vast libraries of packages. This includes:
                    </p>
                     <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                        <li><strong className="text-orc-steel">CachyOS:</strong> For performance-optimized packages.</li>
                        <li><strong className="text-magic-purple">Chaotic-AUR:</strong> For a massive, pre-compiled collection of AUR packages.</li>
                    </ul>
                    <p>
                        Run this single command in your terminal to begin the attunement.
                    </p>
                    <CodeBlock lang="bash">{fullCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};
