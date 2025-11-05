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

export const ChwdRitualModal: React.FC<ChwdRitualModalProps> = ({ onClose }) => {
    
    const PKGBUILD_CONTENT = `
# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
# Original work by: CachyOS <ptr1337@cachyos.org>

_realname=chwd
pkgname=khws
pkgver=1.16.1
pkgrel=1
pkgdesc="Kael Hardware Scry: Kael's hardware detection tool (based on CachyOS chwd)"
arch=('x86_64')
url="https://github.com/CachyOS/\${_realname}"
license=('GPL3')
depends=('pciutils' 'dmidecode' 'hwinfo' 'mesa-utils' 'xorg-xrandr' 'vulkan-tools' 'libdrm')
makedepends=('rust' 'cargo' 'git')
source=("\${_realname}::git+\${url}.git#tag=\${pkgver}")
sha256sums=('SKIP')

prepare() {
	cd "\${_realname}"
	git submodule update --init
}

build() {
    cd "\${_realname}"
    cargo build --release --locked --all-features
}

package() {
    cd "\${_realname}"
    install -Dm755 target/release/chwd "$pkgdir/usr/bin/khws"
    install -Dm755 target/release/chwd-kernel "$pkgdir/usr/bin/khws-kernel"
    install -Dm644 -t "$pkgdir/usr/share/licenses/\$pkgname/" LICENSE
}
`.trim();

    const RITUAL_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Unified Ritual of Insight for 'khws'
set -euo pipefail

echo "--- Beginning the Ritual of Insight ---"
echo "This incantation will forge the 'khws' recipe and publish it to the Athenaeum."

# Ensure the packages directory exists.
mkdir -p ~/packages

# Step 1: Check for and forge the Unified Publisher Script if missing
if [ ! -f "$HOME/packages/publish-package.sh" ]; then
    echo "--> 'publish-package.sh' not found. Forging it now..."
    # The script content is embedded here via Base64 to ensure integrity.
    PUBLISHER_SCRIPT_B64='IyEvYmluL2Jhc2gKIyBLYWVsIE9TIC0gQXRoZW5hZXVtIFB1Ymxpc2hlciBTY3JpcHQgKHY1IC0gd2l0aCBwcmUtZmxpZ2h0IGNoZWNrcykKIyBGb3JnZXMgYSBwYWNrYWdlLCBzaWducyBpdCwgYW5kIHB1Ymxpc2hlcyBpdC4KCnNldCAtZXVvIHBpcGVmYWlsCgojIC0tLSBQUkUtRkxJR0hUIENIRUNLUyAtLS0KaWYgISBjb21tYW5kIC12IGdpdCAmPiAvZGV2L251bGw7IHRoZW4KICAgIGVjaG8gIkVSUk9SOiAnZ2l0JyBpcyBub3QgaW5zdGFsbGVkLiBQbGVhc2UgcnVuIFN0ZXAgMSBvZiB0aGUgS2V5c3RvbmUgUml0dWFsLiIgPiYyCiAgICBleGl0IDEKZmkKaWYgISBjb21tYW5kIC12IGdoICY+IC9kZXYvbnVsbDsgdGhlbgogICAgZWNobyAiRVJST1I6IEdpdEh1YiBDTEkgJ2doJyBpcyBub3QgaW5zdGFsbGVkLiBQbGVhc2UgcnVuIFN0ZXAgMSBvZiB0aGUgS2V5c3RvbmUgUml0dWFsLiIgPiYyCiAgICBleGl0IDEKZmkKaWYgISBnaCBhdXRoIHN0YXR1cyAmPiAvZGV2L251bGw7IHRoZW4KICAgIGVjaG8gIkVSUk9SOiBZb3UgYXJlIG5vdCBhdXRoZW50aWNhdGVkIHdpdGggR2l0SHViLiBQbGVhc2UgcnVuICdnaCBhdXRoIGxvZ2luJyBvciBTdGVwIDEgb2YgdGhlIEtleXN0b25lIFJpdHVhbC4iID4mMgogICAgZXhpdCAxCmZpCmlmICEgY29tbWFuZCAtdiByZXBvLWFkZCAmPiAvZGV2L251bGw7IHRoZW4KICAgIGVjaG8gIkVSUk9SOiAncmVwby1hZGQnIGlzIG5vdCBpbnN0YWxsZWQuIEl0IGlzIHBhcnQgb2YgJ3BhY21hbi1jb250cmliJy4gUGxlYXNlIHJ1biAnc3VkbyBwYWNtYW4gLVMgcGFjbWFuLWNvbnRyaWInLiIgPiYyCiAgICBleGl0IDEKZmkKCiMgLS0tIENPTkZJR1VSQVRJT04gLS0tClJFUE9fRElSPSJ+L2thZWwtb3MtcmVwbyIKUEFDS0FHRV9OQU1FPSQxCiMgLS0tIFNDUklQVCBTVEFSVCAtLS0KZWNobyAiLS0tIFByZXBhcmluZyB0aGUgRm9yZ2UgZm9yIHBhY2thZ2U6ICRQQUNLQUdFX05BTUUgLS0tIgoKIyAtLS0gVkFMSURBVElPTiAtLS0KaWYgWyAteiAiJFBBY2thZ2VOYW1lIiBdOyB0aGVuCiAgICBlY2hvICJFUlJPUjogWW91IG11c3Qgc3BlY2lmeSBhIHBhY2thZ2UgZGlyZWN0b3J5IHRvIGJ1aWxkLiIKICAgIGVjaG8gIlVzYWdlOiAuL3B1Ymxpc2gtcGFja2FnZS5zaCA8cGFja2FnZV9uYW1lPiIKICAgIGV4aXQgMQpmaQppZiBbICEgLWQgIiRQQUNLQUdFX05BTUUiIF0gfHwgWyAhIC1mICIkUEFDS0FHRV9OQU1FL1BLR0JVSUxEIiBdOyB0aGVuCiAgICBlY2hvICJFUlJPUjogRGlyZWN0b3J5ICckUEFDS0FHRV9OQU1FJyBkb2VzIG5vdCBleGlzdCBvciBkb2VzIG5vdCBjb250YWluIGEgUEtHQlVJTEQuIgogICAgZXhpdCAxCmZpCgojIC0tLSBBVVRPLVNJR05JTkcgTE9HSUMgLS0tCmVjaG8gIi0tPiBTZWFyY2hpbmcgZm9yIEdQRyBrZXkgZm9yIHNpZ25pbmcuLi4iCiMgRmlyc3QsIHRyeSB0byBmaW5kIHRoZSBzcGVjaWZpYyAnS2FlbCBPUyBNYXN0ZXIgS2V5Jy4KU0lHTklOR19LRVlfSUQ9JChncGcgLS1saXN0LXNlY3JldC1rZXlzIC0td2l0aC1jb2xvbnMgIkthZWwgT1MgTWFzdGVyIEtleSIgMj4vZGV2L251bGwgfCBhd2sgLUY6ICckMSA9PSAic2VjIiB7IHByaW50ICQ1IH0nIHwgaGVhZCAtbiAxKQoKIyBJZiBub3QgZm9undwgZmFsbCBidWNrIHRvIHRoZSBmaXJzdCBhdmFpbGFibGUgc2VjcmV0IGtleS4KaWYgWyAteiAiJFNJR05JTkdfS0VZX0lEIiBdOyB0aGVuCiAgICBlY2hvICItLT4gJ0thZWwgT1MgTWFzdGVyIEtleScgbm90IGZvdW5kLiBVc2luZyBmaXJzdCBhdmFpbGFibGUgc2VjcmV0IGtleS4iCiAgICBTSUdOSU5HX0tFWV9JRD0kKGdwZyAtLWxpc3Qtc2VjcmV0LWtleXMgLS13aXRoLWNvbG9ucyAyPi9kZXYvbnVsbCB8IGF3ayAtRjogJyQxID09ICJzZWMiIHsgcHJpbnQgJDUgfScgfCBoZWFkIC1uIDEpCmZpCgojIElmIHN0aWxsIG5vIGtleSwgdGhlbiB3ZSBjYW5ub3QgcHJvY2VlZC4KaWYgWyAteiAiJFNJR05JTkdfS0VZX0lEIiBdOyB0aGVuCiAgICBlY2hvICJFUlJPUjogQ291bGQgbm90IGZpbmQgYW55IEdQRyBzZWNyZXQga2V5IGZvciBzaWduaW5nLiBBYm9ydGluZy4iCiAgICBlY2hvICJQbGVhc2UgZW5zdXJlIHlvdSBoYXZlIGEgR1BHIGtleSBieSBydW5uaW5nIFN0ZXAgMiBvZiB0aGUgS2V5c3RvbmUgUml0dWFsLiIKICAgIGV4aXQgMQpmaQoKZWNobyAiW1NVQ0NFU1NdIFVzaW5nIE1hc3RlciBLZXk6ICRTSUdOSU5HX0tFWV9JRCBmb3Igc2lnbmluZy4iCgojIC0tLSBGT1JHSU5HIC0tLQplY2hvICItLT4gRW50ZXJpbmcgdGhlIGZvcmdlIGZvciBwYWNrYWdlOiAkUEFDS0FHRV9OQU1FLi4uIgpkZWNsYXJlIC1hIG1ha2Vwa2dfYXJncyAoXQptYWtlcGtnX2FyZ3MrPSgtc2YpCm1ha2Vwa2dfYXJncysoLS1zaWduKQptYWtlcGtnX2FyZ3MrPSgtLWtleikKbWFrZXBrZ19hcmdzKz0oIlNESUdOSU5HX0tFWV9JRCIpCm1ha2Vwa2dfYXJncysoLS1za2lwcGdwY2hlY2spCm1ha2Vwa2dfYXJncysoLS1ub25jb25maXJtKQoKY2QgIiRQQUNLQUdFX05BTUUiCgplY2hvICItLT4gRm9yZ2luZyBhbmQgc2lnbmluZyB0aGUgcGFja2FnZSAobWFrZXBrZykuLi4iCm1ha2Vwa2cg"\${mYWtlcGtnX2FyZ3N[@]}"CgpQQUNLQUdFX0ZJTEU9JChmaW5kIC4gLW5hbWUgIioucGtnLnRhci56c3QiIC1wcmludCAtcXVpdCkKaWYgWyAteiAiJFBBY2thZ2VGaWxlIiBdOyB0aGVuCiAgICBlY2hvICJFUlJPUjogQnVpbGQgZmFpbGVkLiBObyBwYWNrYWdlIGZpbGUgd2FzIGNyZWF0ZWQuIgogICAgZXhpdCAxCmZpCgojIC0tLSBQVUJMSVNISU5HIC0tLQpFWFBBTkRFRF9SRVBPX0RJUj0kKGV2YWwgZWNobyAkUkVQT19ESVIpCmVjaG8gIi0tPiBNb3ZpbmcgZm9yZ2VkIGFydGlmYWN0IHRvIHRoZSBBdGhlbmFldW06ICRFWFBBTkRFRF9SRVBPX0RJUiIKbXYgIiRQQUNLQUdFX0ZJTEUiKiAiJEVYUEFOREVEX1JFUE9fRElSIiAvICMgTW92ZSBib3RoIHRoZSBwYWNrYWdlIGFuZCBpdHMgLnNpZyBmaWxlCgpjZCAiJEVYUEFOREVEX1JFUE9fRElSIgplY2hvICItLT4gVXBkYXRpbmcgdGhlIEF0aGVuYWV1bSdzIGdyaW1vaXJlIChkYXRhYmFzZSkuLi4iCiMgUmVtb3ZlIG9sZCBwYWNrYWdlIGVudHJ5IGZpcnN0IHRvIHByZXZlbnQgZHVwbGljYXRlcy5yZXBvLXJlbW92ZSBrYWVsLW9zLXJlcG8uZGIudGFyLmd6ICIkKGJhc2VuYW1lICIkUEFDS0FHRV9GSUxFIiAucGtnLnRhci56c3QpIiAyPi9kZXYvbnVsbCB8fCB0cnVlCnJlcG8tYWRkIGthZWwtb3MtcmVwby5kYi50YXIuZ3ogIiQoYmFzZW5hbWUgIiRQQUNLQUdFX0ZJTEUiKSIKCiMgVXBkYXRlIHRoZSBwYWNrYWdlIHNvdXJjZXMgcmVwb3NpdG9yeSBpZiBpdCBleGlzdHMKaWYgWyAtZCAiLi4vJFBBY2thZ2VOYW1lLy5naXQiIF07IHRoZW4KICAgIGVjaG8gIi0tPiBVcGRhdGluZyBzb3VyY2UgcmVwb3NpdG9yeSBmb3IgJFBBY2thZ2VOYW1lLi4uIgogICAgY2QgIi4uLyRQQUNLQUdFX05BTUUiCiAgICBnaXQgcHVsbCBvcmlnaW4gbWFzdGVyCmZpCmVjaG8gIi0tLSBDb21taXR0aW5nIHRoZSBuZXcgYXJ0aWZhY3QgdG8gdGhlIEF0aGVuYWV1bSdzIGhpc3RvcnkuLi4iCmdpdCBhZGQgLgogICAgZ2l0IGNvbW1pdCAtbSAiZmVhdDogQWRkL3VwZGF0ZSBwYWNrYWdlICRQQUNLQUdFX05BTUUiCiAgICBnaXQgcHVzaAoKZWNobyAiLS0tIFRoZSBhcnRpZmFjdCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgcHVibGlzaGVkIHRvIHRoZSBBdGhlbmFldW0uIC0tLSI='
    echo "$PUBLISHER_SCRIPT_B64" | base64 --decode > "$HOME/packages/publish-package.sh"
    chmod +x "$HOME/packages/publish-package.sh"
    echo "[SUCCESS] 'publish-package.sh' has been forged."
fi

# Step 2: Scribe the recipe for 'khws'
echo "--> Scribing the recipe for 'khws'..."
mkdir -p ~/packages/khws
cat > ~/packages/khws/PKGBUILD << 'PKGBUILD_EOF'
${PKGBUILD_CONTENT}
PKGBUILD_EOF
echo "[SUCCESS] Recipe has been scribed."

# Step 3: Initiate the Publishing Rite
echo "--> Initiating the Publishing Rite..."
cd ~/packages
./publish-package.sh khws

echo "--- The Ritual of Insight is Complete ---"
`.trim();

    // UTF-8 safe encoding
    const encodedScript = btoa(unescape(encodeURIComponent(RITUAL_SCRIPT_RAW)));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | bash`;


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <EyeIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Ritual of Insight (\`khws\`)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this grand incantation will forge our version of the CachyOS hardware detection tool, christen it <strong className="text-dragon-fire">`khws` (Kael Hardware Scry)</strong>, and publish it to our Athenaeum.
                    </p>
                    <p>
                        This unified command performs all necessary steps: it ensures the publisher script exists, scribes the correct recipe for `khws`, and then immediately begins the rite of forging and publishing.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Unified Incantation</h3>
                    <p>
                        Ensure you have completed <strong className="text-dragon-fire">Part I of the Keystone Rituals</strong> first to set up your forge and Athenaeum. Then, copy and run this single command.
                    </p>
                    <CodeBlock lang="bash">{fullCommand}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">On the Forged Realm</h3>
                    <p>
                        Once published, any Kael OS Realm can install this tool with a simple command:
                    </p>
                    <CodeBlock lang="bash">sudo pacman -S khws</CodeBlock>
                    <p>
                        And then run the hardware scan with:
                    </p>
                    <CodeBlock lang="bash">sudo khws -a</CodeBlock>

                </div>
            </div>
        </div>
    );
};
