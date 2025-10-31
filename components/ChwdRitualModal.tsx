import React, { useState } from 'react';
import { CloseIcon, CopyIcon, EyeIcon } from './Icons';

interface ChwdRitualModalProps {
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

const PKGBUILD_CONTENT = `# Maintainer: CachyOS <ptr1337@cachyos.org>
# Contributor: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
pkgname=chwd
pkgver=3.1
pkgrel=1
pkgdesc="CachyOS Hardware Detection Tool to install the right drivers"
arch=('x86_64')
url="https://github.com/CachyOS/chwd"
license=('GPL3')
depends=('pciutils' 'dmidecode' 'hwinfo' 'mesa-utils' 'xorg-xrandr' 'vulkan-tools')
makedepends=('meson' 'ninja')
source=("$pkgname-$pkgver.tar.gz::$url/archive/refs/tags/v$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
    cd "$pkgname-$pkgver"
    meson setup build --prefix=/usr --buildtype=release
    ninja -C build
}

package() {
    cd "$pkgname-$pkgver"
    DESTDIR="$pkgdir" meson install -C build
}
`;

const SETUP_COMMAND_BLOCK = `# 1. Create the directory structure for our new package
mkdir -p ~/packages/chwd

# 2. Create the PKGBUILD recipe file inside the new directory
cat > ~/packages/chwd/PKGBUILD << 'EOF'
${PKGBUILD_CONTENT}
EOF

echo "The recipe for 'chwd' has been created in ~/packages/chwd/"
`;


export const ChwdRitualModal: React.FC<ChwdRitualModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider flex items-center gap-3">
                        <EyeIcon className="w-5 h-5 text-dragon-fire" />
                        The Ritual of Insight: Forging `chwd`
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed">
                    <div className="animate-fade-in-fast space-y-4">
                        <p>Architect, this ritual will bestow upon our forge the gift of <strong className="text-dragon-fire">Insight</strong>. We will package the CachyOS Hardware Detection tool (<code className="font-mono text-xs">chwd</code>) and place it in our Athenaeum. Once this is done, every Realm we forge will automatically detect its host's hardware and install the perfect drivers.</p>
                        
                        <div>
                           <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Prepare Your Tools (One-Time Setup)</h3>
                            <p>If you have not already done so for the Keystone Ritual, your Forge needs the <code className="font-mono text-xs">git</code> and <code className="font-mono text-xs">gh</code> tools, and you must be logged into GitHub.</p>
                            <p>Run this command if this is your first time publishing. Otherwise, you can skip this step.</p>
                            <CodeBlock lang="bash">{`sudo pacman -S git github-cli --noconfirm && gh auth login`}</CodeBlock>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 2: Forge the `chwd` Recipe</h3>
                            <p>Next, we create the sacred recipe (<strong className="text-orc-steel">PKGBUILD</strong>) that teaches the forge how to build `chwd` from source. <strong className="text-dragon-fire">Copy this entire block and paste it into your terminal.</strong> It will create the directory and the recipe file.</p>
                            <CodeBlock lang="bash">{SETUP_COMMAND_BLOCK}</CodeBlock>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 3: Publish to the Athenaeum</h3>
                            <p>With the recipe prepared, we use the master Publisher Script to build the artifact and send it to our Athenaeum. This script should already exist at <code className="font-mono text-xs">~/packages/publish-package.sh</code> from the Keystone Ritual.</p>
                            <CodeBlock>
cd ~/packages && ./publish-package.sh chwd
                            </CodeBlock>
                            <p className="mt-2">Once this ritual is complete, the gift of Insight is ours. Every ISO forged from this moment on will contain this new power.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};