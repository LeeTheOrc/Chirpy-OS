import React, { useState } from 'react';
import { CloseIcon, CopyIcon, WrenchScrewdriverIcon } from './Icons';

interface ManualForgeModalProps {
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

const ALLIED_FORGE_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Ritual of the Allied Forge (v2)
set -euo pipefail

# --- CONFIGURATION (Passed as argument) ---
PACKAGE_NAME="$1"
FORGE_REPO_URL="https://github.com/CachyOS/cachyos-pkgbuilds.git"
FORGE_DIR_NAME="cachyos-pkgbuilds"

# --- VALIDATION ---
if [ -z "$PACKAGE_NAME" ]; then
    echo "ERROR: No package name provided to the ritual." >&2
    exit 1
fi

echo "--- Beginning the Ritual of the Allied Forge for '$PACKAGE_NAME' ---"

# --- Step 1: Prepare the Forge and Recipes ---
echo "--> Ensuring the allied forge recipes are present..."
if [ -d "$HOME/$FORGE_DIR_NAME" ]; then
    echo "--> Found local copy of recipes. Updating..."
    cd "$HOME/$FORGE_DIR_NAME"
    git pull
else
    echo "--> Cloning allied forge recipes for the first time..."
    cd "$HOME"
    git clone "$FORGE_REPO_URL"
fi

# --- Step 2: Navigate to the correct recipe and build ---
PACKAGE_DIR="$HOME/$FORGE_DIR_NAME/$PACKAGE_NAME"
if [ ! -d "$PACKAGE_DIR" ]; then
    echo "ERROR: Recipe for '$PACKAGE_NAME' not found in the allied forge." >&2
    exit 1
fi
cd "$PACKAGE_DIR"
echo "--> Entered forge for '$PACKAGE_NAME'."

echo "--> Finding GPG Master Key..."
SIGNING_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1 || gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
if [ -z "$SIGNING_KEY_ID" ]; then echo "ERROR: No GPG signing key found. Please run the Keystone Ritual." >&2; exit 1; fi
echo "Using key: $SIGNING_KEY_ID"

echo "--> Forging and signing the package (makepkg)..."
makepkg -sf --sign --key "$SIGNING_KEY_ID" --noconfirm

# --- Step 3: Publish the artifact ---
PACKAGE_FILE=$(find . -name "*.pkg.tar.zst" -print -quit)
if [ -z "$PACKAGE_FILE" ]; then
    echo "ERROR: Build failed. No package file was created."
    exit 1
fi
echo "Found: $PACKAGE_FILE"

echo "--> Moving artifact to Athenaeum..."
# Use a variable for the file glob to make it dynamic. The package name might not match the directory name.
# We get the base name from the package file itself.
PKG_BASE_NAME=$(basename "$PACKAGE_FILE" .pkg.tar.zst)
mv \${PKG_BASE_NAME}*.pkg.tar.zst* ~/kael-os-repo/

echo "--> Updating Athenaeum and publishing..."
cd ~/kael-os-repo
# Remove old package entry first to prevent duplicates
repo-remove kael-os-repo.db.tar.gz "$PACKAGE_NAME" 2>/dev/null || true
# Add the new one
repo-add kael-os-repo.db.tar.gz \${PKG_BASE_NAME}.pkg.tar.zst

git add .
COMMIT_MSG="feat: Add/update \${PACKAGE_NAME} from official CachyOS pkgbuild"
if git diff --staged --quiet; then
    echo "--> No changes to commit. Athenaeum is up to date."
else
    git commit -m "$COMMIT_MSG"
    git push
fi

echo ""
echo "--- Ritual Complete ---"
echo "The artifact '$PACKAGE_NAME' has been successfully forged and published to the Athenaeum."
`;

const createUniversalCommandWithArg = (script: string, pkgName: string) => {
    const encoded = btoa(unescape(encodeURIComponent(script.trim())));
    return `echo "${encoded}" | base64 --decode | bash -s -- ${pkgName}`;
}

export const ManualForgeModal: React.FC<ManualForgeModalProps> = ({ onClose }) => {
    const [pkgName, setPkgName] = useState('');
    const [generatedCommand, setGeneratedCommand] = useState('');

    const handleGenerate = () => {
        if (!pkgName.trim()) return;
        const command = createUniversalCommandWithArg(ALLIED_FORGE_SCRIPT_RAW, pkgName.trim());
        setGeneratedCommand(command);
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <WrenchScrewdriverIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Ritual of the Allied Forge</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This automated ritual forges any artifact from a trusted allied forge (CachyOS) and publishes it directly to our Athenaeum.
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Name the Artifact</h3>
                    <p>
                        Enter the name of the package you wish to forge. This must match the directory name found in the{' '}
                        <a href="https://github.com/CachyOS/cachyos-pkgbuilds" target="_blank" rel="noopener noreferrer" className="text-orc-steel underline hover:text-dragon-fire">
                            CachyOS Pkgbuilds repository
                        </a>.
                    </p>
                     <div className="flex items-end gap-2 my-4">
                        <div className="flex-grow">
                            <label htmlFor="pkg-name-input" className="block text-sm font-medium text-forge-text-secondary mb-1">Package Name</label>
                            <input
                                id="pkg-name-input"
                                type="text"
                                value={pkgName}
                                onChange={(e) => setPkgName(e.target.value)}
                                placeholder="e.g., chwd, maul, grub-cachyos"
                                className="w-full bg-forge-bg border border-forge-border rounded-lg p-2 text-sm text-forge-text-primary focus:ring-1 focus:ring-dragon-fire transition-colors"
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={!pkgName.trim()}
                            className="px-4 py-2 bg-dragon-fire text-black font-bold rounded-md hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           Generate
                        </button>
                    </div>

                    {generatedCommand && (
                         <div className="animate-fade-in">
                            <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Cast the Incantation</h3>
                            <p>Copy this single, powerful command and run it in your terminal. It will perform all necessary steps automatically.</p>
                            <CodeBlock lang="bash">{generatedCommand}</CodeBlock>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};