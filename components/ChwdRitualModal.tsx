import React from 'react';
import { CloseIcon, CopyIcon, EyeIcon } from './Icons';

interface KhwsRitualModalProps {
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

const RITUAL_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Unified Ritual of Insight for 'khws'
# This script forges the 'khws' recipe and publishes it to the Athenaeum.
set -euo pipefail

# --- CONFIGURATION ---
# This is the original source name, which makepkg will use for the directory.
_realname=chwd
# This is the name of our final package.
pkgname=khws
pkgver=1.16.1
pkgrel=1

# --- SCRIPT START ---
echo "--- Beginning the Unified Ritual of Insight for '$pkgname' ---"
echo "This incantation will forge the recipe, build the package, and publish it."

# Step 1: Forge the recipe (PKGBUILD)
echo "--> Scribing the recipe for '$pkgname'..."
PACKAGE_DIR="$HOME/packages/$pkgname"
mkdir -p "$PACKAGE_DIR"

# Here we embed the complete, correct PKGBUILD into the script.
cat > "$PACKAGE_DIR/PKGBUILD" << PKGBUILD_EOF
# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
# Original work by: CachyOS <ptr1337@cachyos.org>

_realname=\${_realname}
pkgname=\${pkgname}
provides=('chwd')
conflicts=('chwd')
pkgver=\${pkgver}
pkgrel=\${pkgrel}
pkgdesc="Kael Hardware Scry: Kael's hardware detection tool (based on CachyOS chwd)"
arch=('x86_64')
url="https://github.com/CachyOS/\${_realname}"
license=('GPL3')
depends=('pciutils' 'dmidecode' 'hwinfo' 'mesa-utils' 'xorg-xrandr' 'vulkan-tools' 'libdrm' 'pacman-contrib')
makedepends=('rust' 'cargo' 'git' 'pkg-config')
source=("\${_realname}::git+\${url}.git#tag=\${pkgver}")
sha256sums=('SKIP')
validpgpkeys=('335C57728630635441673A33B62C3D10C54D5DA9') # ptr1337 (CachyOS developer key for source verification)

prepare() {
	cd "\${_realname}"
	git submodule update --init
}

build() {
  cd "\${_realname}"
  export RUSTFLAGS="-C target-cpu=native"
  # This is the exact, proven build sequence from the CachyOS forge.
  (cd scripts/chwd-kernel && cargo build --release --locked)
  cargo build --release --locked --all-features
}

package() {
    cd "\${_realname}"
    # Install the binaries under the 'khws' name for our OS
    install -Dm755 target/release/chwd "\\$pkgdir/usr/bin/khws"
    install -Dm755 "scripts/chwd-kernel/target/release/chwd-kernel" "\\$pkgdir/usr/bin/khws-kernel"
    # The license should be installed under the name of the provided package
    install -Dm644 -t "\\$pkgdir/usr/share/licenses/khws/" LICENSE
}
PKGBUILD_EOF

echo "[SUCCESS] Recipe for '$pkgname' has been scribed."

# Step 2: Invoke the Publisher
echo "--> Initiating the Publishing Rite..."
if [ -f "\$HOME/packages/publish-package.sh" ]; then
    cd \$HOME/packages
    ./publish-package.sh "\$pkgname"
else
    echo ""
    echo "ERROR: The 'publish-package.sh' script was not found in '~/packages'."
    echo "Please perform Step 2 of the Keystone Ritual to create it, then try again."
    exit 1
fi

echo ""
echo "--- Ritual Complete ---"
echo "The artifact '$pkgname' has been successfully forged and published to the Athenaeum."
`;

export const KhwsRitualModal: React.FC<KhwsRitualModalProps> = ({ onClose }) => {
    
    const encodedScript = btoa(unescape(encodeURIComponent(RITUAL_SCRIPT_RAW.trim())));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <EyeIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Ritual of Insight (`khws`)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this is the unified ritual to forge our custom hardware scryer, <strong className="text-dragon-fire">`khws`</strong>. This single incantation handles everything from scribing the recipe to publishing the final artifact in our Athenaeum.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Unified Incantation</h3>
                    <p>
                        Ensure you have completed the one-time Keystone Rituals. Then, copy this single command and run it in your terminal.
                    </p>
                    <CodeBlock lang="bash">{fullCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};
