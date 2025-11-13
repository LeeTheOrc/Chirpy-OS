import React, { useState } from 'react';
import { CloseIcon, CopyIcon, TowerIcon } from './Icons';

interface AthenaeumAttunementModalProps {
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

const ATTUNEMENT_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Athenaeum Client Attunement Ritual v2
set -euo pipefail
clear
echo "--- Attuning this system to the Kael OS Athenaeum (v2) ---"

echo "--> Performing a Cache Cleansing Rite to ensure freshest data..."
sudo pacman -Scc --noconfirm

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
echo "--> Attuning to the Kael OS Athenaeum..."
KAEL_KEY_ID="8A7E40248B2A6582"
KEY_URL="https://leetheorc.github.io/kael-os-repo/kael-os.asc"
echo "--> Receiving the Master Key ($KAEL_KEY_ID)..."
if (sudo pacman-key --recv-keys "$KAEL_KEY_ID" --keyserver hkp://keyserver.ubuntu.com || sudo pacman-key --recv-keys "$KAEL_KEY_ID" --keyserver hkp://keys.openpgp.org); then
    echo "Key received successfully from keyserver."
elif (sudo pacman-key --delete "$KAEL_KEY_ID" 2>/dev/null || true) && curl -sL "$KEY_URL" | sudo pacman-key --add -; then
    echo "Keyserver failed. Key purged and re-added successfully via direct HTTPS."
    sudo pacman-key --updatedb
else
    echo "FATAL: Both keyserver and direct download methods failed." >&2
    exit 1
fi
echo "Athenaeum key has been added to the keyring."
add_repo_if_not_exists "kael-os" "\\n[kael-os]\\nSigLevel = Optional TrustAll\\nServer = https://leetheorc.github.io/kael-os-repo/\\n"
echo "--> Synchronizing all package databases..."
sudo pacman -Syy
echo ""
echo "--- ✅ Attunement Complete ---"
echo "Your system is now connected to the Kael OS Athenaeum."
echo "You can now install packages, e.g., 'sudo pacman -S kaelic-shell'"
`;

export const AthenaeumAttunementModal: React.FC<AthenaeumAttunementModalProps> = ({ onClose }) => {
    const encodedScript = btoa(unescape(encodeURIComponent(ATTUNEMENT_SCRIPT_RAW.trim())));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <TowerIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Athenaeum Client Attunement</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, if you cannot install a Kael OS package, it is likely because your system is not yet attuned to our Athenaeum. This ritual will connect your system to our sovereign repository.
                    </p>
                    <p>
                        This unified incantation will:
                    </p>
                     <ul className="list-decimal list-inside text-sm pl-4 space-y-1">
                        <li>Perform a <strong className="text-magic-purple">Cache Cleansing Rite</strong> to ensure you get the latest data.</li>
                        <li>Receive and trust our Athenaeum's master GPG key.</li>
                        <li>Add the <strong className="text-orc-steel">[kael-os]</strong> repository to your pacman configuration.</li>
                        <li>Force a synchronization of all package databases.</li>
                    </ul>
                    <p>
                        Run this single command in your terminal to begin the attunement.
                    </p>
                    <CodeBlock lang="bash">{fullCommand}</CodeBlock>
                    <p>After the ritual is complete, you will be able to install any package from our Athenaeum with a standard `sudo pacman -S` command.</p>
                </div>
            </div>
        </div>
    );
};