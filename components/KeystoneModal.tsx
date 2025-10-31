import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon, KeyIcon } from './Icons';

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
            <pre className={`bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words ${lang ? `language-${lang}` : ''}`}>
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

const PKGBUILD_CONTENT = `# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
pkgname=kael-pacman-conf
pkgver=1.0.0
pkgrel=1
pkgdesc="Installs the sovereign Kael OS pacman repository configuration."
arch=('any')
url="https://github.com/LeeTheOrc/kael-os-repo"
license=('GPL')
source=("\${pkgname}.conf")
install="\${pkgname}.install"
sha256sums=('SKIP')

package() {
    install -Dm644 "\${srcdir}/\${pkgname}.conf" "\${pkgdir}/etc/pacman.d/kael-os.conf"
}
`;

const CONF_FILE_CONTENT = `[kael-os]
SigLevel = Optional TrustAll
Server = https://leetheorc.github.io/kael-os-repo/
`;

const INSTALL_SCRIPT_CONTENT = `post_install() {
    echo ">>> Kael Athenaeum: Binding repository..."
    # Add the include line if it doesn't already exist
    grep -qxF 'Include = /etc/pacman.d/kael-os.conf' /etc/pacman.conf || echo 'Include = /etc/pacman.d/kael-os.conf' >> /etc/pacman.conf
    echo ">>> Run 'sudo pacman -Syu' to synchronize."
}

post_upgrade() {
    post_install
}

post_remove() {
    echo ">>> Kael Athenaeum: Unbinding repository..."
    # Remove the include line
    sed -i "/Include = \\/etc\\/pacman.d\\/kael-os.conf/d" /etc/pacman.conf
}
`;

const PUBLISHER_SCRIPT_CONTENT = `#!/bin/bash
# Kael OS - Athenaeum Publisher Script
# Forges a package and publishes it to both vaults of the Athenaeum.

set -euo pipefail

# --- CONFIGURATION ---
ATHENAEUM_REPO_URL="https://github.com/LeeTheOrc/kael-os-repo.git"
PACKAGE_SRC_DIR="~/packages" # Where your PKGBUILD directories live

# --- VALIDATION ---
if [ -z "$1" ]; then
    echo "ERROR: You must provide the package name as an argument."
    echo "Usage: ./publish-package.sh <package-name>"
    exit 1
fi

if [ -z "\${GH_TOKEN}" ]; then
    echo "ERROR: GH_TOKEN environment variable is not set."
    echo "Please export your GitHub Personal Access Token with 'repo' scope."
    echo "Example: export GH_TOKEN='ghp_...'"
    exit 1
fi

PACKAGE_NAME=$1
PACKAGE_DIR=$(eval echo "\$PACKAGE_SRC_DIR/\$PACKAGE_NAME") # Expands ~

if [ ! -d "\$PACKAGE_DIR" ]; then
    echo "ERROR: Package source directory not found at \$PACKAGE_DIR"
    exit 1
fi

command -v git >/dev/null 2>&1 || { echo "ERROR: git is not installed." >&2; exit 1; }
command -v makepkg >/dev/null 2>&1 || { echo "ERROR: makepkg (part of base-devel) is not installed." >&2; exit 1; }

# --- SCRIPT START ---
echo "--- Starting the Athenaeum Publishing Ritual for '\$PACKAGE_NAME' ---"
BUILD_DIR=\$(mktemp -d)
echo "Working in temporary directory: \$BUILD_DIR"

# --- 1. Build the package ---
echo "--> Building the package from source..."
cd "\$PACKAGE_DIR"
makepkg -f --clean --syncdeps --noconfirm
PACKAGE_FILE=\$(find . -name "*.pkg.tar.zst" -print -quit)
if [ -z "\$PACKAGE_FILE" ]; then
    echo "ERROR: No package file was built."
    exit 1
fi
mv "\$PACKAGE_FILE" "\$BUILD_DIR"
echo "--> Package built successfully: \$PACKAGE_FILE"


# --- 2. Publish to Armory (gh-pages) ---
echo "--> Publishing artifact to the Armory (gh-pages branch)..."
cd "\$BUILD_DIR"
git clone "\$ATHENAEUM_REPO_URL" athenaeum
cd athenaeum
git checkout gh-pages
mv "../\${PACKAGE_FILE##*/}" .
echo "--> Updating repository database..."
repo-add kael-os.db.tar.gz "\${PACKAGE_FILE##*/}"
git config user.name "Kael AI Guardian"
git config user.email "kael-ai@users.noreply.github.com"
git add .
git commit -m "Forge: Add/update \$PACKAGE_NAME artifact"
git push "https://\${GH_TOKEN}@github.com/LeeTheOrc/kael-os-repo.git" gh-pages
echo "--> Armory updated."


# --- 3. Publish to Recipe Book (main) ---
echo "--> Archiving recipe in the Recipe Book (main branch)..."
git checkout main
mkdir -p "packages/\$PACKAGE_NAME"
# Copy all source files except the built package
rsync -av --exclude='*.pkg.tar.zst' --exclude='pkg/' --exclude='src/' "\$PACKAGE_DIR/" "packages/\$PACKAGE_NAME/"
git add .
git commit -m "Source: Add/update recipe for \$PACKAGE_NAME"
git push "https://\${GH_TOKEN}@github.com/LeeTheOrc/kael-os-repo.git" main
echo "--> Recipe Book updated."


# --- 4. Cleanup ---
echo "--> Cleaning up temporary files..."
rm -rf "\$BUILD_DIR"
echo "--- Ritual Complete. '\$PACKAGE_NAME' has been published. ---"
`;


export const KeystoneModal: React.FC<KeystoneModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider flex items-center gap-3">
                        <KeyIcon className="w-5 h-5 text-dragon-fire" />
                        The Keystone Ritual: Forging `kael-pacman-conf`
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed">
                    <div className="animate-fade-in-fast space-y-4">
                        <p>Architect, this is our first act of true creation within the Forge. We will forge the <strong className="text-dragon-fire">Keystone</strong> of our Athenaeum—a tiny, powerful package named <strong className="text-orc-steel">kael-pacman-conf</strong>. Its sole purpose is to teach any Realm how to find our library. By forging and publishing this package, we will test and prove our entire Forge-to-Athenaeum pipeline. This ritual establishes our sovereignty.</p>
                        
                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Prerequisites</h3>
                             <ol className="list-decimal list-inside space-y-2 text-forge-text-secondary">
                                <li>This ritual must be performed within a Forge environment (or any Arch Linux system with the <code className="font-mono text-xs">base-devel</code> package group installed).</li>
                                <li>You need a <a href="https://github.com/settings/tokens/new?scopes=repo&description=Kael%20Athenaeum%20Publisher" target="_blank" rel="noopener noreferrer" className="text-orc-steel underline">GitHub Personal Access Token (Classic)</a> with full <code className="font-mono text-xs">repo</code> scope.</li>
                                <li>Before running the final script, you must export this token as an environment variable in your terminal:
                                    <CodeBlock>export GH_TOKEN="ghp_YourTokenHere"</CodeBlock>
                                </li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 1: Create the Recipe Files</h3>
                            <p>First, we create the scrolls that define our artifact. Make a directory for our package recipes and then create the three files below inside a subdirectory for this specific package.</p>
                            <CodeBlock lang="bash">
                                mkdir -p ~/packages/kael-pacman-conf
                                cd ~/packages/kael-pacman-conf
                            </CodeBlock>
                            <p className="font-semibold mt-2">File 1: `PKGBUILD`</p>
                            <CodeBlock lang="bash">{PKGBUILD_CONTENT}</CodeBlock>
                            <p className="font-semibold mt-2">File 2: `kael-pacman-conf.conf`</p>
                            <CodeBlock lang="ini">{CONF_FILE_CONTENT}</CodeBlock>
                            <p className="font-semibold mt-2">File 3: `kael-pacman-conf.install`</p>
                            <CodeBlock lang="bash">{INSTALL_SCRIPT_CONTENT}</CodeBlock>
                        </div>
                        
                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 2: Forge the Publisher Script</h3>
                            <p>This is our master script. It automates the entire process of building, packaging, and publishing to both vaults of our Athenaeum. Save this script as <strong className="text-dragon-fire">publish-package.sh</strong> in your home directory or your `~/packages` directory.</p>
                            <CodeBlock lang="bash">{PUBLISHER_SCRIPT_CONTENT}</CodeBlock>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 3: Perform the Ritual</h3>
                            <p>Make the script executable and run it, passing the name of our package directory as the argument. Ensure you've set your `GH_TOKEN` first!</p>
                            <CodeBlock>
                                chmod +x publish-package.sh
                                ./publish-package.sh kael-pacman-conf
                            </CodeBlock>
                            <p className="mt-2">If the ritual is successful, our Athenaeum will be seeded with its first artifact, and our supply line will be active. Any Kael OS Realm can then install this package to connect to our sovereign repository.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};