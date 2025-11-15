
import React from 'react';
import { CloseIcon, KeyIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface KeyringAttunementModalProps {
  onClose: () => void;
}

const KEYRING_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

echo "--- GPG Keyring Attunement Ritual ---"
echo "This ritual will make your personal GPG signing key trusted by pacman."
echo ""

# --- [1/4] Initialize Pacman Keyring ---
echo "--> [1/4] Ensuring pacman keyring is initialized..."
# Check if the keyring directory is missing or empty
if [ ! -d "/etc/pacman.d/gnupg" ] || [ -z "$(ls -A /etc/pacman.d/gnupg)" ]; then
    echo "    -> Pacman's keyring is not initialized. Performing first-time setup..."
    sudo pacman-key --init
fi
# Populate with default Arch keys. This is safe to re-run.
sudo pacman-key --populate archlinux
echo "✅ Pacman keyring is ready."
echo ""


# --- [2/4] Auto-Detect GPG Key ---
echo "--> [2/4] Detecting default GPG signing key..."
GPG_KEY_ID=""

# Method 1: Check makepkg.conf (most specific)
if [ -f /etc/makepkg.conf ] && grep -q -E '^GPGKEY=' /etc/makepkg.conf; then
    GPG_KEY_ID=$(grep -E '^GPGKEY=' /etc/makepkg.conf | head -1 | cut -d'=' -f2 | tr -d '[:space:]"')
    echo "    -> Found key in /etc/makepkg.conf: \$GPG_KEY_ID"
fi

# Method 2: Check git config (common for developers)
if [[ -z "\$GPG_KEY_ID" ]] && command -v git &>/dev/null && git config --global user.signingkey &>/dev/null; then
    GPG_KEY_ID=$(git config --global user.signingkey)
    echo "    -> Found key in git config: \$GPG_KEY_ID"
fi

# Method 3: Fallback to the first available secret key
if [[ -z "\$GPG_KEY_ID" ]]; then
    GPG_KEY_ID=$(gpg --list-secret-keys --with-colons | awk -F: '/^sec/{print $5; exit}')
    if [[ -n "\$GPG_KEY_ID" ]]; then
      echo "    -> Found first available secret key: \$GPG_KEY_ID"
    fi
fi

# Final validation of the auto-detected key
if [[ -z "\$GPG_KEY_ID" ]]; then
    echo "❌ ERROR: Could not automatically detect a GPG signing key." >&2
    echo "   Please ensure a default key is configured in GPG, git, or /etc/makepkg.conf." >&2
    exit 1
fi

if ! gpg --list-keys "\$GPG_KEY_ID" &>/dev/null; then
    echo "❌ ERROR: Detected GPG Key '\$GPG_KEY_ID' is not found in your keyring." >&2
    echo "   Please ensure the detected key is correct and fully imported." >&2
    exit 1
fi

echo "✅ Detected key: \$GPG_KEY_ID"
echo ""

# --- [3/4] Export and Add Key ---
echo "--> [3/4] Exporting and adding public key to pacman's keyring..."
TEMP_KEY_FILE=$(mktemp)
# Ensure cleanup happens on exit
trap 'rm -f -- "\$TEMP_KEY_FILE"' EXIT

gpg --armor --export "\$GPG_KEY_ID" > "\$TEMP_KEY_FILE"
sudo pacman-key --add "\$TEMP_KEY_FILE"
echo "    Key added successfully."
echo ""

# --- [4/4] Sign Key for Trust ---
echo "--> [4/4] Signing the key locally to establish trust..."
sudo pacman-key --lsign-key "\$GPG_KEY_ID"
echo ""

echo "✅ Ritual Complete! The key for '\$GPG_KEY_ID' is now trusted by pacman."
echo "--> To apply these changes, force a refresh of your package databases with:"
echo "    sudo pacman -Syyu"
`;

export const KeyringAttunementModal: React.FC<KeyringAttunementModalProps> = ({ onClose }) => {
  const encodedScript = btoa(unescape(encodeURIComponent(KEYRING_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <KeyIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Attune GPG Keyring</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                  Architect, to ensure the integrity of our local Athenaeum, every artifact and database must be signed. This ritual performs the crucial one-time step of making the system's package guardian (<code className="font-mono text-xs">pacman</code>) trust your personal GPG signing key.
                </p>
                 <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                    This incantation will first ensure the master pacman keyring is initialized with the standard Arch Linux keys. It will then automatically detect your default GPG signing key, add it to the keyring, and "locally sign" it to establish trust.
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Attunement Incantation</h3>
                <p>
                    Run this command in your terminal. It will automatically detect your key and guide you through the process.
                </p>
                 <CodeBlock lang="bash">{finalCommand}</CodeBlock>
                 <p className="font-semibold">
                    After the ritual is complete, it is wise to force a refresh of your package databases by running <code className="font-mono text-xs">sudo pacman -Syyu</code>.
                 </p>
            </div>
        </div>
    </div>
  );
};
