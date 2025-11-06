import React, { useState } from 'react';
import { CloseIcon, CopyIcon, WrenchScrewdriverIcon } from './Icons';

interface MaulRitualModalProps {
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

export const MaulRitualModal: React.FC<MaulRitualModalProps> = ({ onClose }) => {
    
    const RITUAL_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Unified Ritual for 'maul'
set -euo pipefail

# --- CONFIGURATION ---
_realname=maul
pkgname=maul
pkgver=2.3.1
pkgrel=1

# --- SCRIPT START ---
echo "--- Beginning the Unified Ritual for '$pkgname' ---"
echo "This incantation will forge the recipe, build the package, and publish it."

# Step 1: Forge the recipe (PKGBUILD)
echo "--> Scribing the recipe for '$pkgname'..."
PACKAGE_DIR="$HOME/packages/$pkgname"
mkdir -p "$PACKAGE_DIR"

cat > "$PACKAGE_DIR/PKGBUILD" << PKGBUILD_EOF
# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
# Original work by: CachyOS

_realname=\${_realname}
pkgname=\${pkgname}
pkgver=\${pkgver}
pkgrel=\${pkgrel}
pkgdesc="A tool to manage local pacman repositories"
arch=('x86_64')
url="https://github.com/CachyOS/\${_realname}"
license=('GPL3')
depends=('pacman-contrib')
makedepends=('rust' 'cargo' 'git')
source=("\${_realname}::git+\${url}.git#tag=v\${pkgver}")
sha256sums=('SKIP')

build() {
  cd "\${_realname}"
  export RUSTFLAGS="-C target-cpu=native"
  cargo build --release --locked
}

package() {
    cd "\${_realname}"
    install -Dm755 target/release/maul "\\$pkgdir/usr/bin/maul"
    install -Dm644 -t "\\$pkgdir/usr/share/licenses/maul/" LICENSE
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

    // UTF-8 safe encoding for a unified command
    const encodedScript = btoa(unescape(encodeURIComponent(RITUAL_SCRIPT_RAW.trim())));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <WrenchScrewdriverIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Ritual of the Maul</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this ritual will forge <strong className="text-dragon-fire">`maul`</strong>, a powerful CachyOS tool for managing local repositories, and place it within our Athenaeum.
                    </p>
                    <p>
                        This unified incantation will:
                    </p>
                    <ul className="list-decimal list-inside text-sm pl-4 space-y-1">
                        <li>Create a perfect <strong className="text-orc-steel">PKGBUILD</strong> recipe for `maul`.</li>
                        <li>Invoke our <strong className="text-orc-steel">publisher script</strong> to build, sign, and upload the finished package.</li>
                    </ul>
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
