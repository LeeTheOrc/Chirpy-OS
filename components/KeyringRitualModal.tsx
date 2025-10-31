import React, { useState } from 'react';
import { CloseIcon, CopyIcon, ShieldCheckIcon } from './Icons';

interface KeyringRitualModalProps {
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

const KAEL_KEYRING_PKGBUILD = `# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
pkgname=kael-keyring
pkgver=$(date +%Y.%m.%d)
pkgrel=1
pkgdesc="Kael OS master keyring"
arch=('any')
url="https://github.com/LeeTheOrc/Kael-OS"
license=('GPL3')
source=('kael-os.gpg')
install=kael-keyring.install
sha256sums=('SKIP')

package() {
	install -Dm644 kael-os.gpg "$pkgdir/usr/share/pacman/keyrings/kael-os.gpg"
	install -Dm644 kael-os.gpg "$pkgdir/usr/share/pacman/keyrings/kael-os-trusted"
}`;

const KAEL_KEYRING_INSTALL = `post_install() {
  pacman-key --init
  pacman-key --populate kael-os
}

post_upgrade() {
  post_install
}

post_remove() {
  local key
  for key in $(pacman-key -l | grep 'Kael OS' | awk '{print $2}'); do
    pacman-key --delete "$key"
  done
}`;

const KAEL_PACMAN_CONF_PKGBUILD = `# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
pkgname=kael-pacman-conf
pkgver=$(date +%Y.%m.%d)
pkgrel=1
pkgdesc="Pacman config for the Kael OS repository"
arch=('any')
url="https://github.com/LeeTheOrc/Kael-OS"
license=('GPL3')
source=('kael-os.conf')
install=kael-pacman-conf.install
sha256sums=('SKIP')

package() {
	install -Dm644 kael-os.conf "$pkgdir/etc/pacman.d/kael-os.conf"
}`;

const KAEL_PACMAN_CONF_INSTALL = `post_install() {
  if ! grep -q "Include = /etc/pacman.d/kael-os.conf" /etc/pacman.conf; then
    echo ">>> Adding Kael OS repository to /etc/pacman.conf..."
    echo -e "\\n# Added by kael-pacman-conf package\\nInclude = /etc/pacman.d/kael-os.conf" >> /etc/pacman.conf
    echo ">>> Repository enabled. Run 'sudo pacman -Syy' to sync."
  else
    echo ">>> Kael OS repository is already configured in /etc/pacman.conf."
  fi
}

post_remove() {
  sed -i "/# Added by kael-pacman-conf package/,/Include = \\/etc\\/pacman.d\\/kael-os.conf/d" /etc/pacman.conf
  echo ">>> Kael OS repository configuration removed from /etc/pacman.conf."
}`;

const KAEL_OS_CONF = `[kael-os]
SigLevel = Required DatabaseOptional
Server = https://leetheorc.github.io/kael-os-repo/`;


export const KeyringRitualModal: React.FC<KeyringRitualModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ShieldCheckIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Keyring Rituals</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, these rituals fortify our Athenaeum's security. By signing our packages, we ensure their integrity and authenticity.
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Rite I: Trusting Allied Forges (CachyOS)</h3>
                    <p>To build packages from the CachyOS grimoires (like `chwd`), our forge must trust their master artisans' signatures. This command imports their key into your local GPG keyring.</p>
                    <CodeBlock lang="bash">{`gpg --recv-key F3B607488DB35A47\ngpg --lsign-key F3B607488DB35A47`}</CodeBlock>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Rite II: Forging the Kael OS Master Key</h3>
                    <p>
                        This grand ritual creates our own secure identity. We will forge a GPG master key, package it, and publish it to our Athenaeum. This is the foundation of our supply chain security.
                    </p>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 1: Generate the Master Key</h4>
                    <p>Run this command to begin the interactive key generation process. Use the recommended values provided below.</p>
                    <CodeBlock lang="bash">gpg --full-generate-key</CodeBlock>
                    <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                        <li>Please select what kind of key you want: <strong className="text-dragon-fire">(1) RSA and RSA</strong></li>
                        <li>What keysize do you want?: <strong className="text-dragon-fire">4096</strong></li>
                        <li>Key is valid for?: <strong className="text-dragon-fire">0</strong> (does not expire)</li>
                        <li>Real name: <strong className="text-dragon-fire">Kael OS Master Key</strong></li>
                        <li>Email address: <strong className="text-dragon-fire">security@kael-os.com</strong></li>
                        <li>You will be prompted to create a secure passphrase. Remember it!</li>
                    </ul>

                     <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 2: Prepare the `kael-keyring` Package</h4>
                     <p>First, find your new key's ID and export it. Replace <code className="font-mono text-xs">YOUR_KEY_ID</code> with the long string of characters from the `gpg --list-keys` output.</p>
                     <CodeBlock lang="bash">{`# List your keys to find the ID
gpg --list-secret-keys

# Create the package directory
mkdir -p ~/packages/kael-keyring/

# Export your public key (REPLACE THE ID!)
gpg --armor --export YOUR_KEY_ID > ~/packages/kael-keyring/kael-os.gpg`}</CodeBlock>

                    <p>Now, create the `PKGBUILD` and `install` files for the keyring package with this command:</p>
                     <CodeBlock lang="bash">{`cat > ~/packages/kael-keyring/PKGBUILD << 'EOF'
${KAEL_KEYRING_PKGBUILD}
EOF

cat > ~/packages/kael-keyring/kael-keyring.install << 'EOF'
${KAEL_KEYRING_INSTALL}
EOF`}</CodeBlock>

                     <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 3: Publish the `kael-keyring` Package</h4>
                     <p>Use the publisher script to sign, build, and upload our new keyring package to the Athenaeum.</p>
                     <CodeBlock lang="bash">cd ~/packages && ./publish-package.sh kael-keyring</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 4: Prepare and Publish the `kael-pacman-conf` Package</h4>
                    <p>This final package makes it trivial for new systems to use our repository. This command prepares all the necessary files.</p>
                    <CodeBlock lang="bash">{`# Create the directory structure
mkdir -p ~/packages/kael-pacman-conf/

# Create the repository config file
cat > ~/packages/kael-pacman-conf/kael-os.conf << 'EOF'
${KAEL_OS_CONF}
EOF

# Create the PKGBUILD
cat > ~/packages/kael-pacman-conf/PKGBUILD << 'EOF'
${KAEL_PACMAN_CONF_PKGBUILD}
EOF

# Create the install script
cat > ~/packages/kael-pacman-conf/kael-pacman-conf.install << 'EOF'
${KAEL_PACMAN_CONF_INSTALL}
EOF`}</CodeBlock>
                    <p>Now, publish it:</p>
                    <CodeBlock lang="bash">cd ~/packages && ./publish-package.sh kael-pacman-conf</CodeBlock>
                    <p className="mt-2 font-semibold text-orc-steel">With these rituals complete, our Athenaeum is now secure! New installations can simply install `kael-keyring` and `kael-pacman-conf` to trust and use our packages.</p>

                </div>
            </div>
        </div>
    );
};