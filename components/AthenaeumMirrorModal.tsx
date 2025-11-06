import React, { useState } from 'react';
import { CloseIcon, CopyIcon, DuplicateIcon } from './Icons';

interface AthenaeumMirrorModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
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

const MIRROR_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Athenaeum Mirroring Ritual
set -euo pipefail

# --- CONFIGURATION ---
TARGET_REPO_NAME="$1"
CACHYOS_MIRROR_URL="rsync://mirror.cachyos.org/cachyos/"
LOCAL_MIRROR_DIR="$HOME/cachyos-mirror/\$TARGET_REPO_NAME"
ATHENAEUM_DIR="$HOME/kael-os-repo"

# --- PRE-FLIGHT CHECKS ---
command -v rsync >/dev/null 2>&1 || { echo "ERROR: 'rsync' is not installed. Please run 'sudo pacman -S rsync'." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "ERROR: 'git' is not installed. Please run the Keystone Ritual." >&2; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "ERROR: GitHub CLI ('gh') is not installed. Please run the Keystone Ritual." >&2; exit 1; }
command -v repo-add >/dev/null 2>&1 || { echo "ERROR: 'repo-add' is not installed (part of 'pacman-contrib'). Please run 'sudo pacman -S pacman-contrib'." >&2; exit 1; }
if ! gh auth status &>/dev/null; then echo "ERROR: Not authenticated with GitHub. Please run the Keystone Ritual." >&2; exit 1; fi
if [ -z "$TARGET_REPO_NAME" ]; then echo "ERROR: No target repository name provided." >&2; exit 1; fi

# --- SCRIPT START ---
echo "--- Beginning the Athenaeum Mirroring Ritual for 'CachyOS/$TARGET_REPO_NAME' ---"
echo "WARNING: This will download a very large amount of data."
read -p "Press [Enter] to continue or Ctrl+C to abort."

echo "--> Preparing local mirror directory at '\$LOCAL_MIRROR_DIR'..."
mkdir -p "\$LOCAL_MIRROR_DIR"

echo "--> Beginning rsync. This will take a significant amount of time..."
rsync -ravz --delete --info=progress2 "\$CACHYOS_MIRROR_URL/\$TARGET_REPO_NAME/x86_64/" "\$LOCAL_MIRROR_DIR/"

echo "[SUCCESS] rsync mirror complete."
echo "--> Transferring artifacts to the Athenaeum at '\$ATHENAEUM_DIR'..."

# Copy all packages and their signatures to our repo directory
find "\$LOCAL_MIRROR_DIR" -name "*.pkg.tar.zst*" -exec cp {} "\$ATHENAEUM_DIR/" \\;

cd "\$ATHENAEUM_DIR"

echo "--> Rebuilding Athenaeum database..."
# The 'repo-add' command will add any new packages it finds.
# It's smart enough to handle existing ones.
repo-add kael-os-repo.db.tar.gz *.pkg.tar.zst

echo "--> Committing changes to the Athenaeum..."
git add .
if git diff --staged --quiet; then
    echo "--> Athenaeum is already up to date. No changes to commit."
else
    git commit -m "feat(mirror): Sync packages from CachyOS/\$TARGET_REPO_NAME"
    echo "--> Pushing changes..."
    git push
fi

echo ""
echo "--- Ritual Complete ---"
echo "The Athenaeum has been successfully synchronized with the '$TARGET_REPO_NAME' repository."
`;

const createUniversalCommand = (script: string, repoName: string) => {
    const encoded = btoa(unescape(encodeURIComponent(script.trim())));
    return `echo "${encoded}" | base64 --decode | bash -s -- ${repoName}`;
}

export const AthenaeumMirrorModal: React.FC<AthenaeumMirrorModalProps> = ({ onClose }) => {
    const [targetRepo, setTargetRepo] = useState<'cachyos' | 'cachyos-v3' | 'cachyos-v4'>('cachyos');
    
    const fullCommand = createUniversalCommand(MIRROR_SCRIPT_RAW, targetRepo);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <DuplicateIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Athenaeum Mirroring Ritual</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This is an advanced rite to mirror an entire binary package repository from an ally into our own Athenaeum. It uses <strong className="text-orc-steel">rsync</strong> for efficiency.
                    </p>
                    <p className="p-3 bg-dragon-fire/10 border border-dragon-fire/50 rounded-lg text-sm text-dragon-fire">
                        <strong className="font-bold">Warning:</strong> This ritual will download a very large amount of data (potentially many gigabytes) and will take a long time to complete. Proceed with awareness.
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Select a Repository to Mirror</h3>
                    <p>CachyOS provides several repositories optimized for different CPU levels. Choose one to mirror.</p>
                     <div className="flex items-center gap-4 my-4">
                        <select
                            value={targetRepo}
                            onChange={(e) => setTargetRepo(e.target.value as typeof targetRepo)}
                            className="w-full bg-forge-panel/60 text-forge-text-primary text-sm border border-forge-border focus:ring-1 focus:ring-dragon-fire rounded-md p-2"
                        >
                            <option value="cachyos">cachyos (General)</option>
                            <option value="cachyos-v3">cachyos-v3 (x86-64-v3)</option>
                            <option value="cachyos-v4">cachyos-v4 (x86-64-v4)</option>
                        </select>
                    </div>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Cast the Mirroring Incantation</h3>
                    <p>Copy this single command. It will download all packages from the selected repository, add them to our Athenaeum, and publish the changes.</p>
                    <CodeBlock>{fullCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};