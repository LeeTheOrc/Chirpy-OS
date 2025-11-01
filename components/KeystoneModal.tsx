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
# Kael OS - Athenaeum Publisher Script (v2 - with Auto-Signing)
# Forges a package, signs it with the Kael OS Master Key, and publishes it.

set -euo pipefail

# --- CONFIGURATION ---
REPO_DIR="~/kael-os-repo"
PACKAGE_NAME=$1

# --- SCRIPT START ---
echo "--- Preparing the Forge for package: $PACKAGE_NAME ---"

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

# --- AUTO-SIGNING LOGIC ---
echo "--> Finding the Kael OS Master Key..."
KAEL_KEY_ID=$(gpg --list-keys "Kael OS Master Key" 2>/dev/null | grep -oP '(?<=pub   rsa4096/)\\w+' | head -n 1)

if [ -z "$KAEL_KEY_ID" ]; then
    echo "ERROR: Kael OS Master Key not found in your GPG keyring."
    echo "Please ensure you have completed the Master Key Forging ritual."
    exit 1
fi
echo "--> Found Master Key ID: $KAEL_KEY_ID. This key will be used to sign the package."

# --- FORGING ---
echo "--> Entering the forge for package: $PACKAGE_NAME..."
cd "$PACKAGE_NAME"

echo "--> Forging and signing the package (makepkg)..."
# The -sf flags clean up, install dependencies, and build the package.
# --key specifies OUR key to SIGN the final artifact.
# makepkg will still use your full GPG keyring to VERIFY sources from other forges.
makepkg -sf --key "$KAEL_KEY_ID" --noconfirm

PACKAGE_FILE=$(find . -name "*.pkg.tar.zst" -print -quit)
if [ -z "$PACKAGE_FILE" ]; then
    echo "ERROR: Build failed. No package file was created."
    exit 1
fi

# --- PUBLISHING ---
EXPANDED_REPO_DIR=$(eval echo $REPO_DIR)
echo "--> Moving forged artifact to the Athenaeum: $EXPANDED_REPO_DIR"
mv "$PACKAGE_FILE"* "$EXPANDED_REPO_DIR/" # Move both the package and its .sig file

cd "$EXPANDED_REPO_DIR"
echo "--> Updating the Athenaeum's grimoire (database)..."
# Remove old package entry first to prevent duplicates
repo-remove kael-os-repo.db.tar.gz "$(basename "$PACKAGE_FILE" .pkg.tar.zst)" 2>/dev/null || true
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
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <KeyIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Keystone Rituals: Forging the Athenaeum</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this is the master grimoire for our <strong className="text-dragon-fire">Athenaeum</strong>—our sovereign package repository. These rituals establish the foundation of trust for every package we forge. We will create our unique signature, build the repository's foundation, and then learn the rite for publishing all future artifacts.
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Part I: Seeding the Athenaeum (The First Ritual - One-Time Setup)</h3>
                    <p>This grand ritual is performed only once per machine to establish our repository and its unique signature.</p>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 1: Prepare the Forge</h4>
                    <p>This incantation installs the necessary tools, declares your identity to Git, authenticates with GitHub, and clones a local copy of our Athenaeum.</p>
                    <CodeBlock lang="bash">{`# Install tools, configure Git, log in to GitHub, and clone the repo
sudo pacman -S git github-cli base-devel --noconfirm

# IMPORTANT: Configure Git with your identity to prevent commit errors
git config --global user.name "LeeTheOrc"
git config --global user.email "leetheorc@gmail.com"

# Log in to your GitHub account (this will open a browser)
gh auth login

# Clone or update the Athenaeum repository
if [ -d "$HOME/kael-os-repo" ]; then
    echo "Athenaeum found locally. Updating..."
    cd ~/kael-os-repo && git pull
else
    echo "Cloning the Athenaeum for the first time..."
    cd ~ && git clone https://github.com/LeeTheOrc/kael-os-repo.git
fi`}</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 2: Forge the Kael OS Master Key</h4>
                    <p>First, we must create our master signature. This GPG key is the unique mark of our forge. This is an interactive process, so run this command and follow the prompts:</p>
                    <CodeBlock lang="bash">{`gpg --full-generate-key`}</CodeBlock>
                    <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                        <li>Kind of key: <strong className="text-dragon-fire">(1) RSA and RSA</strong></li>
                        <li>Keysize: <strong className="text-dragon-fire">4096</strong></li>
                        <li>Key is valid for?: <strong className="text-dragon-fire">0</strong> (does not expire)</li>
                        <li>Real name: <strong className="text-dragon-fire">Kael OS Master Key</strong></li>
                        <li>Email address: <strong className="text-dragon-fire">leetheorc@gmail.com</strong></li>
                        <li>Remember the secure passphrase you create!</li>
                    </ul>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 3: Create Foundational Recipes</h4>
                    <p>Now we forge the recipes for the two cornerstone packages: one to distribute our public key (`kael-keyring`), and one to teach systems how to find our Athenaeum (`kael-pacman-conf`).</p>
                    <CodeBlock lang="bash">{`# Find your new Key ID and export the public key
GPG_KEY_ID=$(gpg --list-keys "Kael OS Master Key" | grep -oP '(?<=pub   rsa4096/)\\w+' | head -n 1)
gpg --armor --export $GPG_KEY_ID > ~/kael-os.asc

# Create the keyring package structure and recipe (PKGBUILD)
mkdir -p ~/packages/kael-keyring
mv ~/kael-os.asc ~/packages/kael-keyring/
cat > ~/packages/kael-keyring/PKGBUILD << 'EOF'
# Maintainer: The Architect <leetheorc@gmail.com>
pkgname=kael-keyring
pkgver=1
pkgrel=1
pkgdesc="Kael OS Master Keyring"
arch=('any')
license=('GPL')
source=('kael-os.asc')
sha256sums=('SKIP')

package() {
    install -Dm644 "\${srcdir}/kael-os.asc" "\${pkgdir}/usr/share/pacman/keyrings/kael-os.gpg"
}
EOF

# Create the pacman-conf package structure and recipe
mkdir -p ~/packages/kael-pacman-conf
cat > ~/packages/kael-pacman-conf/kael-os.conf << 'EOF'
[kael-os]
SigLevel = Required DatabaseOptional
Server = https://leetheorc.github.io/kael-os-repo/$arch
EOF

cat > ~/packages/kael-pacman-conf/PKGBUILD << 'EOF'
# Maintainer: The Architect <leetheorc@gmail.com>
pkgname=kael-pacman-conf
pkgver=1
pkgrel=1
pkgdesc="Pacman configuration for the Kael OS repository"
arch=('any')
license=('GPL')
source=('kael-os.conf')
sha256sums=('SKIP')

package() {
    install -Dm644 "\${srcdir}/kael-os.conf" "\${pkgdir}/etc/pacman.d/kael-os.conf"
}
EOF

echo "✅ Foundational recipes have been forged in ~/packages/"`}</CodeBlock>
                    
                     <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 4: Publish the Foundational Artifacts</h4>
                    <p>With the cornerstones forged, we now place them in the Athenaeum, properly signed with our new Master Key.</p>
                    <CodeBlock lang="bash">{`# Find your Master Key ID to use for signing
GPG_KEY_ID=$(gpg --list-keys "Kael OS Master Key" | grep -oP '(?<=pub   rsa4096/)\\w+' | head -n 1)
echo "Found Master Key for signing: $GPG_KEY_ID"

# Build, sign, and move the keyring package
cd ~/packages/kael-keyring
makepkg -sf --sign --key "$GPG_KEY_ID" --skippgpcheck --noconfirm
mv *.pkg.tar.zst* ~/kael-os-repo/

# Build, sign, and move the pacman config package
cd ~/packages/kael-pacman-conf
makepkg -sf --sign --key "$GPG_KEY_ID" --noconfirm
mv *.pkg.tar.zst* ~/kael-os-repo/

# Navigate to the repository, add both packages, commit, and publish
cd ~/kael-os-repo
repo-add kael-os-repo.db.tar.gz *.pkg.tar.zst
git add .
git commit -m "feat: Establish Athenaeum foundation with keyring and pacman config"
git push`}</CodeBlock>
                    <p className="text-orc-steel font-semibold">The Athenaeum is now live and its signature is trusted.</p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Part II: The Publishing Rite (Ongoing Workflow)</h3>
                    <p>For all future packages, this simple rite is all you need.</p>

                     <div className="p-3 bg-forge-bg border border-forge-border rounded-lg text-sm">
                        <h5 className="font-semibold text-dragon-fire mb-2">A Note on Artisanship & Credit</h5>
                        <p>When adapting a <code className="font-mono text-xs">PKGBUILD</code> from another forge, it is our custom to honor the original creators. Always include a line crediting their work, for example: <br /><code className="font-mono text-xs"># Original work by: CachyOS &lt;email@cachyos.org&gt;</code></p>
                    </div>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 1: Trust Allied Forges (As Needed)</h4>
                    <p>Before building a package from an ally like CachyOS, you must first trust their signature so \`makepkg\` can verify the source files.</p>
                    <CodeBlock lang="bash">{`# Example for CachyOS
gpg --recv-key F3B607488DB35A47 && gpg --lsign-key F3B607488DB35A47`}</CodeBlock>

                     <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 2: Forge the Unified Publisher Script</h4>
                    <p>This powerful script automates the entire process of building, signing with our Master Key, and publishing. Create it once with this command:</p>
                    <CodeBlock lang="bash">{`cat > ~/packages/publish-package.sh << 'EOF'\n${PUBLISHER_SCRIPT}\nEOF && chmod +x ~/packages/publish-package.sh`}</CodeBlock>
                    
                     <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 3: Publish an Artifact</h4>
                    <p>To publish any package, simply go to your <code className="font-mono text-xs">~/packages</code> directory and run the script with the package's folder name.</p>
                     <CodeBlock lang="bash">{`cd ~/packages
./publish-package.sh your-package-name-here`}</CodeBlock>
                </div>
            </div>
        </div>
    );
};