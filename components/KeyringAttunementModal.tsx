import React from 'react';
import { CloseIcon, ShieldCheckIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface KeyringAttunementModalProps {
  onClose: () => void;
}

const ATTUNEMENT_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
# The URL where the Kael OS public PGP key is hosted.
KEY_URL="https://raw.githubusercontent.com/LeeTheOrc/kael-os-repo/gh-pages/kael-os.asc"
TEMP_KEY_FILE="/tmp/kael-os.asc"

echo "--- Athenaeum Keyring Attunement Ritual ---"

# --- CLEANUP TRAP ---
cleanup() {
    rm -f "\${TEMP_KEY_FILE}"
}
trap cleanup EXIT SIGINT SIGTERM

echo "--> [1/3] Summoning the master key from the Athenaeum..."
# Use curl with flags to fail on server errors and follow redirects.
if ! curl -fsSL "\${KEY_URL}" -o "\${TEMP_KEY_FILE}"; then
    echo "❌ ERROR: Failed to download the master key from \${KEY_URL}."
    echo "    Please verify the URL and your internet connection."
    exit 1
fi
if [[ ! -s "\${TEMP_KEY_FILE}" ]]; then
    echo "❌ ERROR: Downloaded key file is empty. The ritual cannot proceed."
    exit 1
fi
echo "✅ Key downloaded successfully."

# Extract the Key ID from the key file
KEY_ID=$(gpg --show-keys --with-colons "\${TEMP_KEY_FILE}" 2>/dev/null | grep '^pub' | cut -d: -f5)

if [[ -z "\${KEY_ID}" ]]; then
    echo "❌ ERROR: Could not extract a valid Key ID from the downloaded key file."
    exit 1
fi
echo "--> Found Key ID: \${KEY_ID}"

echo "--> [2/3] Adding the key to the pacman keyring..."
# Use --noconfirm to prevent prompts in scripts
sudo pacman-key --add "\${TEMP_KEY_FILE}" --noconfirm
echo "✅ Key added to pacman's keyring."

echo "--> [3/3] Signing the key locally to establish trust..."
sudo pacman-key --lsign-key "\${KEY_ID}"
echo "✅ Key ID \${KEY_ID} is now trusted by pacman."

echo ""
echo "✨ Attunement Complete! Your Realm now trusts artifacts from the Kael OS Athenaeum."
`;

export const KeyringAttunementModal: React.FC<KeyringAttunementModalProps> = ({ onClose }) => {
    // UTF-8 safe encoding
    const encodedScript = btoa(unescape(encodeURIComponent(ATTUNEMENT_SCRIPT_RAW)));
    const finalSetupCommand = `echo "${encodedScript}" | base64 --decode | sudo bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ShieldCheckIcon className="w-6 h-6" />
                        <span>The Athenaeum Keyring Attunement</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Greetings, Architect. For our Realm to trust the artifacts we forge for the Athenaeum, we must perform this one-time ritual.
                    </p>
                    <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded mt-2">
                        This incantation attunes your system's <code className="font-mono text-xs">pacman</code> keyring to my master signing key. It teaches your system to recognize my signature, ensuring every artifact is authentic and untampered with. This is a crucial step for the security and integrity of your Realm.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Attunement Incantation (One-Time Ritual)</h3>
                    <p>
                        Run this command in your terminal. It will securely download the Kael OS master key, add it to your system's trusted keyring, and sign it to establish trust.
                    </p>
                    <CodeBlock lang="bash">{finalSetupCommand}</CodeBlock>
                    <p className="text-xs italic mt-2 text-forge-text-secondary">
                        This ritual assumes the public key is located at <code className="font-mono text-xs bg-forge-bg p-1 rounded">kael-os-repo/gh-pages/kael-os.asc</code> within your GitHub repository.
                    </p>
                </div>
            </div>
        </div>
    );
};