import React, { useState } from 'react';
import { CloseIcon, CopyIcon, KeyIcon } from './Icons';
import { GPL_LICENSE_TEXT } from '../gpl-license';

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

const README_TEXT = `# Kael OS Athenaeum

This is the sovereign \`pacman\` package repository for Kael OS. It serves our custom-built packages to every Kael OS installation.

## 🏛️ Repository Structure

This repository uses a two-branch system:

*   **\`main\` branch:** Contains the \`PKGBUILD\` source files (the "recipes") for our custom packages.
*   **\`gh-pages\` branch:** Contains only the compiled \`.pkg.tar.zst\` packages and the repository database, served via GitHub Pages. This is the branch that \`pacman\` on a Kael OS Realm will point to.

## 🙏 Acknowledgements

Our quest is not a solitary one. We stand on the shoulders of giants and learn from the master artisans who came before us. We extend our deepest gratitude to the teams behind:

*   **[CachyOS](https://cachyos.org/):** For their relentless pursuit of performance and for creating powerful tools like \`chwd\`, which have been adapted for use in our Athenaeum.
*   **[Garuda Linux](https://garudalinux.org/):** For their bold and innovative approach to Arch Linux, providing a wealth of inspiration and excellent package recipes that have informed our own.

Their work is a testament to the collaborative spirit of the open-source community.

## 📜 License

The packages and scripts in this repository are licensed under the GNU General Public License v3.0. See the LICENSE file for the full text.
`;

const PUBLISHER_SCRIPT_CONTENT = `#!/bin/bash
# Kael OS - Athenaeum Publisher Script
# Forges a package and publishes it to both vaults of the Athenaeum.

set -euo pipefail

# --- CONFIGURATION ---
ATHENAEUM_REPO_URL="https://github.com/LeeTheOrc/kael-os-repo.git"
PACKAGE_SRC_DIR="~/packages" # Where your PKGBUILD directories live

README_CONTENT=$(cat <<'EOF_README'
${README_TEXT}
EOF_README
)

# --- VALIDATION ---
if [ -z "$1" ]; then
    echo "ERROR: You must provide the package name as an argument."
    echo "Usage: ./publish-package.sh <package-name>"
    exit 1
fi

command -v git >/dev/null 2>&1 || { echo "ERROR: git is not installed. Run the setup command from Step 1." >&2; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "ERROR: GitHub CLI (gh) is not installed. Run the setup command from Step 1." >&2; exit 1; }
command -v makepkg >/dev/null 2>&1 || { echo "ERROR: makepkg (part of base-devel) is not installed." >&2; exit 1; }

if ! gh auth status &>/dev/null; then
    echo "ERROR: You are not logged into GitHub. Run the setup command from Step 1." >&2;
    exit 1;
fi

PACKAGE_NAME=$1
PACKAGE_DIR=$(eval echo "\$PACKAGE_SRC_DIR/\$PACKAGE_NAME") # Expands ~

if [ ! -d "\$PACKAGE_DIR" ]; then
    echo "ERROR: Package source directory not found at \$PACKAGE_DIR"
    exit 1
fi

# --- SCRIPT START ---
echo "--- Starting the Athenaeum Publishing Ritual for '\$PACKAGE_NAME' ---"
BUILD_DIR=\$(mktemp -d)
echo "Working in temporary directory: \$BUILD_DIR"

# --- 1. Build the package ---
echo "--> Building the package from source in '\$PACKAGE_DIR'..."
cd "\$PACKAGE_DIR"

# Enable debug output for the build process to see all commands
set -x
makepkg -f --clean --syncdeps --noconfirm
# Disable debug output after the build
set +x

PACKAGE_FILE=\$(find . -name "*.pkg.tar.zst" -print -quit)
if [ -z "\$PACKAGE_FILE" ]; then
    echo "ERROR: No package file was built." >&2
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

echo "--> Updating README and LICENSE for the Armory..."
echo "$README_CONTENT" > README.md
cp "\$(eval echo \$PACKAGE_SRC_DIR/LICENSE)" .

echo "--> Removing old package versions and cleaning the database..."
# Find and remove any existing files for this package.
find . -maxdepth 1 -name "\${PACKAGE_NAME}-*.pkg.tar.zst" -print -delete || echo "No old package files found to remove."
# Remove the old database to force a full rebuild. This is the safest way.
rm -f kael-os.db* kael-os.files*
echo "--> Old artifacts cleaned."

mv "../\${PACKAGE_FILE##*/}" .
echo "--> Forging a new, clean repository database..."
repo-add kael-os.db.tar.gz "\${PACKAGE_FILE##*/}"

git config user.name "Kael AI Guardian"
git config user.email "kael-ai@users.noreply.github.com"
git add .
git commit -m "Forge: Add/update \$PACKAGE_NAME artifact"
git push
echo "--> Armory updated."


# --- 3. Publish to Recipe Book (main) ---
echo "--> Archiving recipe in the Recipe Book (main branch)..."
git checkout main

echo "--> Updating README and LICENSE for the Recipe Book..."
echo "$README_CONTENT" > README.md
cp "\$(eval echo \$PACKAGE_SRC_DIR/LICENSE)" .

mkdir -p "packages/\$PACKAGE_NAME"
# Copy all source files except the built package
rsync -av --exclude='*.pkg.tar.zst' --exclude='pkg/' --exclude='src/' "\$PACKAGE_DIR/" "packages/\$PACKAGE_NAME/"
git add .
git commit -m "Source: Add/update recipe for \$PACKAGE_NAME"
git push
echo "--> Recipe Book updated."


# --- 4. Cleanup ---
echo "--> Cleaning up temporary files..."
rm -rf "\$BUILD_DIR"
echo "--- Ritual Complete. '\$PACKAGE_NAME' has been published. ---"
`;

const SETUP_SCRIPTS_BLOCK = `# 1. Create the directory structure for our new package
mkdir -p ~/packages/kael-pacman-conf

# 2. Create the three recipe files inside the new directory
cat > ~/packages/kael-pacman-conf/PKGBUILD << 'EOF'
${PKGBUILD_CONTENT}
EOF

cat > ~/packages/kael-pacman-conf/kael-pacman-conf.conf << 'EOF'
${CONF_FILE_CONTENT}
EOF

cat > ~/packages/kael-pacman-conf/kael-pacman-conf.install << 'EOF'
${INSTALL_SCRIPT_CONTENT}
EOF

# 3. Create the master publisher script in the parent packages directory
cat > ~/packages/publish-package.sh << 'EOF'
${PUBLISHER_SCRIPT_CONTENT}
EOF

# 4. Make the publisher script executable
chmod +x ~/packages/publish-package.sh

echo "All script and recipe files have been successfully created in the ~/packages/ directory."
`;

const SETUP_LICENSE_BLOCK = `cat > ~/packages/LICENSE << 'EOF'
${GPL_LICENSE_TEXT}
EOF

echo "Master LICENSE file has been successfully created."
`;


export const KeystoneModal: React.FC<KeystoneModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider flex items-center gap-3">
                        <KeyIcon className="w-5 h-5 text-dragon-fire" />
                        The Keystone Ritual: Forging \`kael-pacman-conf\`
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed">
                    <div className="animate-fade-in-fast space-y-4">
                        <p>Architect, this is our first act of true creation. We will forge the <strong className="text-dragon-fire">Keystone</strong> of our Athenaeum—a tiny, powerful package named <strong className="text-orc-steel">kael-pacman-conf</strong>. Its sole purpose is to teach any Realm how to find our library. By forging and publishing this package, we will test and prove our entire Forge-to-Athenaeum pipeline. This ritual establishes our sovereignty.</p>
                        
                        <div>
                           <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Prepare Your Tools (One-Time Setup)</h3>
                            <p>Before you can publish to the Athenaeum, your Forge needs two tools: <code className="font-mono text-xs">git</code> and the <code className="font-mono text-xs">gh</code> (GitHub's command-line tool). You also need to log in to your GitHub account through the terminal. This provides a secure key to our Athenaeum.</p>
                            <p>Copy this single command and run it. It will install the tools and guide you through the GitHub login. <strong className="text-dragon-fire">You only need to do this once.</strong></p>
                            <CodeBlock lang="bash">{`sudo pacman -S git github-cli --noconfirm && gh auth login`}</CodeBlock>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 2: Forge the Publishing Tools & License</h3>
                            <p>Next, we create the scrolls and the master script that define our artifact. We do this in two parts to ensure the forge runs smoothly and doesn't get overwhelmed.</p>
                            
                            <h4 className="font-semibold text-md text-orc-steel mt-3 mb-1">Part A: Create the Scripts and Recipes</h4>
                            <p>Copy this block to create all the necessary scripts and package recipes.</p>
                            <CodeBlock lang="bash">{SETUP_SCRIPTS_BLOCK}</CodeBlock>
                            
                            <h4 className="font-semibold text-md text-orc-steel mt-3 mb-1">Part B: Create the Master License</h4>
                            <p>Now, copy this second block to create the master LICENSE file. This contains the full text of the GPL 3.0.</p>
                            <CodeBlock lang="bash">{SETUP_LICENSE_BLOCK}</CodeBlock>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 3: Perform the Ritual</h3>
                            <p>With all preparations complete, run the publisher script. It will build the package and send it to our Athenaeum. Ensure you've logged in with `gh` first!</p>
                            <CodeBlock>
cd ~/packages && ./publish-package.sh kael-pacman-conf
                            </CodeBlock>
                            <p className="mt-2">If the ritual is successful, our Athenaeum will be seeded with its first artifact, and our supply line will be active. Any Kael OS Realm can then install this package to connect to our sovereign repository.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
