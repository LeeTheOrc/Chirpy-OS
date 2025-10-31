import React, { useState } from 'react';
import { CloseIcon, CopyIcon, KeyIcon } from './Icons';

interface KeystoneModalProps {
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

const PUBLISHER_SCRIPT = `#!/bin/bash
# Kael OS - Athenaeum Publisher Script
# Forges a package and publishes it to the sovereign repository.

set -euo pipefail

# --- CONFIGURATION ---
REPO_DIR="~/kael-os-repo"
PACKAGE_NAME=$1

# --- VALIDATION ---
if [ -z "$PACKAGE_NAME" ]; then
    echo "ERROR: You must specify a package directory to build."
    echo "Usage: ./publish-package.sh <package_name>"
    exit 1
fi

if [ ! -d "$PACKAGE_NAME" ] || [ ! -f "$PACKAGE_NAME/PKGBUILD" ]; then
    echo "ERROR: Directory '$PACKAGE_NAME' does not exist or does not contain a PKGBUILD."
    exit 1
fi

command -v git >/dev/null 2>&1 || { echo "ERROR: git is not installed. Run the setup command from Step 1." >&2; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "ERROR: GitHub CLI (gh) is not installed. Run the setup command from Step 1." >&2; exit 1; }
if ! gh auth status &>/dev/null; then
    echo "ERROR: You are not logged into GitHub. Run the setup command from Step 1." >&2;
    exit 1;
fi

# --- SCRIPT START ---
EXPANDED_REPO_DIR=$(eval echo $REPO_DIR)
echo "--- Entering the Forge for package: $PACKAGE_NAME ---"
cd "$PACKAGE_NAME"

echo "--> Forging the package (makepkg)..."
makepkg -sf --noconfirm

PACKAGE_FILE=$(find . -name "*.pkg.tar.zst" -print -quit)
if [ -z "$PACKAGE_FILE" ]; then
    echo "ERROR: Build failed. No package file was created."
    exit 1
fi

echo "--> Moving forged artifact to the Athenaeum: $EXPANDED_REPO_DIR"
mv "$PACKAGE_FILE" "$EXPANDED_REPO_DIR/"

cd "$EXPANDED_REPO_DIR"
echo "--> Updating the Athenaeum's grimoire (database)..."
repo-add kael-os-repo.db.tar.gz "$(basename "$PACKAGE_FILE")"

echo "--> Committing the new artifact to the Athenaeum's history..."
git add .
git commit -m "feat: Add/update package $PACKAGE_NAME"
git push

echo "--- The artifact has been successfully published to the Athenaeum. ---"
`;


export const KeystoneModal: React.FC<KeystoneModalProps> = ({ onClose }) => {

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <KeyIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Keystone Rituals</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, these are the sacred rituals for managing our <strong className="text-dragon-fire">Athenaeum</strong>—our sovereign package repository. This ensures our creations are securely stored and easily accessible to every Realm we forge.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: The First Ritual - Forge the Keystone (One-Time Setup)</h3>
                    <p>
                        This foundational ritual prepares your Forge to communicate with our Athenaeum on GitHub. It installs the necessary tools and securely links your GitHub account. <strong className="text-dragon-fire">You only need to perform this ritual once.</strong>
                    </p>
                    <CodeBlock lang="bash">{`sudo pacman -S git github-cli base-devel --noconfirm && gh auth login`}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: The Second Ritual - Clone the Athenaeum (One-Time Setup)</h3>
                    <p>
                        Next, you must bring a local copy of the Athenaeum to your Forge. This command clones the repository to your home directory.
                    </p>
                     <CodeBlock lang="bash">{`cd ~ && git clone https://github.com/LeeTheOrc/kael-os-repo.git`}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 3: The Third Ritual - Create the Publisher Script</h3>
                    <p>
                        This is our master spell for publishing new creations. This command will create a powerful script named <code className="font-mono text-xs">publish-package.sh</code> in a new <code className="font-mono text-xs">~/packages</code> directory. This script automates the entire process of building a package and uploading it to the Athenaeum.
                    </p>
                    <CodeBlock lang="bash">{`mkdir -p ~/packages && cat > ~/packages/publish-package.sh << 'EOF'\n${PUBLISHER_SCRIPT}\nEOF && chmod +x ~/packages/publish-package.sh`}</CodeBlock>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">How to Use the Publisher Script</h3>
                    <p>Once the setup is complete, publishing a new package is simple:</p>
                     <ol className="list-decimal list-inside space-y-2 pl-2">
                        <li>Create a new directory for your package inside <code className="font-mono text-xs">~/packages</code> (e.g., <code className="font-mono text-xs">~/packages/my-cool-app</code>).</li>
                        <li>Place your <code className="font-mono text-xs">PKGBUILD</code> file and any other source files inside that new directory.</li>
                        <li>
                            Navigate to the <code className="font-mono text-xs">~/packages</code> directory and run the publisher script, telling it which package to build:
                            <CodeBlock lang="bash">{`cd ~/packages && ./publish-package.sh my-cool-app`}</CodeBlock>
                        </li>
                    </ol>
                    <p className="mt-2">The script will handle the rest, and your new creation will be available to all our Realms.</p>
                </div>
            </div>
        </div>
    );
};
