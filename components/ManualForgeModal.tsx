
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

const PREPARE_FORGE_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Allied Forge Preparation
set -euo pipefail
echo "--- Preparing Forge and Attuning Key ---"
# Clone/Update CachyOS Pkgbuilds Repo
if [ -d "$HOME/cachyos-pkgbuilds" ]; then
    echo "--> Found local CachyOS recipes. Updating..."
    git -C "$HOME/cachyos-pkgbuilds" pull
else
    echo "--> Cloning CachyOS recipes for the first time..."
    git clone https://github.com/CachyOS/cachyos-pkgbuilds.git "$HOME/cachyos-pkgbuilds"
fi
# Attune to CachyOS Key (for source verification)
echo "--> Attuning to CachyOS artisan's signature..."
gpg --recv-key B1B70BB1CD56047DEF31DE2EB62C3D10C54D5DA9 && gpg --lsign-key B1B70BB1CD56047DEF31DE2EB62C3D10C54D5DA9 || echo "Key already trusted or attunement failed, but proceeding..."
echo "✅ Forge is ready."
`;

const DOWNLOAD_PREPARE_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Download & Prepare Source
set -euo pipefail
PACKAGE_NAME="$1"
PACKAGE_DIR="$HOME/cachyos-pkgbuilds/$PACKAGE_NAME"
if [ ! -d "$PACKAGE_DIR" ]; then echo "ERROR: Recipe for '$PACKAGE_NAME' not found in '$HOME/cachyos-pkgbuilds'." >&2; exit 1; fi
cd "$PACKAGE_DIR"
echo "--> Downloading sources, installing dependencies, and running prepare() for '$PACKAGE_NAME'..."
makepkg -os
echo "✅ Source is now ready for modification in '$PACKAGE_DIR/src/'"
`;

const FORGE_PUBLISH_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Forge & Publish Modified Source
set -euo pipefail
PACKAGE_NAME="$1"
PACKAGE_DIR="$HOME/cachyos-pkgbuilds/$PACKAGE_NAME"
if [ ! -d "$PACKAGE_DIR" ]; then echo "ERROR: Recipe for '$PACKAGE_NAME' not found." >&2; exit 1; fi
cd "$PACKAGE_DIR"
echo "--> Finding GPG Master Key..."
SIGNING_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1 || gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
if [ -z "$SIGNING_KEY_ID" ]; then echo "ERROR: No GPG signing key found. Please run the Keystone Ritual." >&2; exit 1; fi
echo "Using key: $SIGNING_KEY_ID for signing."
echo "--> Building from modified source..."
# -e: build from existing sources in src/
# -f: overwrite existing package
makepkg -ef --sign --key "$SIGNING_KEY_ID" --noconfirm
# Publishing logic
PACKAGE_FILE=$(find . -name "*.pkg.tar.zst" -print -quit)
if [ -z "$PACKAGE_FILE" ]; then echo "ERROR: Build failed." >&2; exit 1; fi
REPO_DIR="$HOME/kael-os-repo"
echo "--> Moving artifact to Athenaeum..."
mv "$PACKAGE_FILE"* "$REPO_DIR/"
cd "$REPO_DIR"

# --- Intelligent Database Update ---
PKG_BASE_NAME=$(basename "$PACKAGE_FILE" .pkg.tar.zst | sed 's/-\\([0-9]\\|\\.rev\\|\\.rc\\|\\.beta\\|\\.alpha\\|\\.pre\\).*//')
echo "--> Updating Athenaeum database for '$PKG_BASE_NAME'..."
if tar -tf kael-os-repo.db.tar.gz | grep -q "^$PKG_BASE_NAME-"; then
    echo "--> Existing entry found for '$PKG_BASE_NAME'. Removing old version..."
    repo-remove kael-os-repo.db.tar.gz "$PKG_BASE_NAME"
fi
repo-add kael-os-repo.db.tar.gz "$(basename "$PACKAGE_FILE")"

echo "--> Committing and publishing..."
git add .
if git diff --staged --quiet; then
    echo "--> No changes to commit. Athenaeum is up to date."
else
    git commit -m "feat(manual-forge): Add/update package $PACKAGE_NAME"
    git push
fi
echo "--- ✅ Ritual Complete. The artifact has been published. ---"
`;

const createUniversalCommand = (script: string, args: string = "") => {
    const encoded = btoa(unescape(encodeURIComponent(script.trim())));
    return `echo "${encoded}" | base64 --decode | bash -s -- ${args}`;
};


export const ManualForgeModal: React.FC<ManualForgeModalProps> = ({ onClose }) => {
    const [pkgName, setPkgName] = useState('');
    
    const prepareForgeCommand = createUniversalCommand(PREPARE_FORGE_SCRIPT_RAW);
    const downloadPrepareCommand = pkgName.trim() ? createUniversalCommand(DOWNLOAD_PREPARE_SCRIPT_RAW, pkgName.trim()) : '';
    const forgePublishCommand = pkgName.trim() ? createUniversalCommand(FORGE_PUBLISH_SCRIPT_RAW, pkgName.trim()) : '';

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <WrenchScrewdriverIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Ritual of the Allied Forge (Manual Build)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-6">
                    <p>
                        This is the master ritual for manually forging an artifact from an allied forge (CachyOS). This multi-step process gives you complete control, allowing you to download the source, make your own modifications, and then build and publish the final package.
                    </p>
                    
                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 1: Prepare the Forge & Recipes</h3>
                        <p className="text-sm">
                            This one-time setup clones the CachyOS package recipes and attunes your system to their signing key.
                        </p>
                        <CodeBlock lang="bash">{prepareForgeCommand}</CodeBlock>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 2: Name the Artifact & Prepare Source</h3>
                        <p className="text-sm">
                            Enter the name of the package you wish to forge. This must match the directory name in the{' '}
                            <a href="https://github.com/CachyOS/cachyos-pkgbuilds" target="_blank" rel="noopener noreferrer" className="text-orc-steel underline hover:text-dragon-fire">
                                CachyOS Pkgbuilds repository
                            </a>. Then, run the generated command.
                        </p>
                        <div className="my-2">
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
                        {pkgName.trim() && (
                            <div className="animate-fade-in">
                                <CodeBlock lang="bash">{downloadPrepareCommand}</CodeBlock>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 3: Modify the Source</h3>
                        <p className="text-sm">
                            The source code is now located in <code className="font-mono text-xs bg-forge-border px-1 rounded-sm">~/cachyos-pkgbuilds/{pkgName || '[package-name]'}/src/</code>. Navigate to this directory and make any changes you desire using your favorite text editor. You are now the artisan.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 4: Forge & Publish the Artifact</h3>
                        <p className="text-sm">
                            Once your modifications are complete, run this final command. It will build the package from your modified source and publish it to our Athenaeum.
                        </p>
                         {pkgName.trim() ? (
                            <div className="animate-fade-in">
                                <CodeBlock lang="bash">{forgePublishCommand}</CodeBlock>
                            </div>
                        ) : (
                            <p className="text-xs italic text-center text-forge-text-secondary/80 py-4">Enter a package name above to generate this command.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};