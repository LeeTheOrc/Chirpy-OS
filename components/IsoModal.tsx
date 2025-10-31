import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon } from './Icons';
import type { DistroConfig } from '../types';
import { generateCalamaresConfiguration } from '../lib/calamares-generator';

interface IsoModalProps {
  onClose: () => void;
  config: DistroConfig;
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


export const IsoModal: React.FC<IsoModalProps> = ({ onClose, config }) => {
    const calamaresConfigs = generateCalamaresConfiguration(config);

    const customizeAiRootFsScript = `#!/bin/bash
set -euo pipefail
# This script is run by mkarchiso to customize the ISO image.

# 1. Configure Calamares with our generated configs
# Note: The files are placed here by the master build script.
mkdir -p /etc/calamares/modules
mkdir -p /etc/calamares/scripts

# Move all generated configs to their final destination
mv /tmp/calamares-config/modules/* /etc/calamares/modules/
mv /tmp/calamares-config/scripts/* /etc/calamares/scripts/
mv /tmp/calamares-config/settings.conf /etc/calamares/settings.conf
mv /tmp/calamares-config/modules.conf /etc/calamares/modules.conf

# Make all post-install scripts executable
chmod +x /etc/calamares/scripts/*

# 2. Setup the live user and autostart Calamares
# We'll use the Architect's chosen username for the live session
LIVE_USER="${config.username}"
if ! id -u "$LIVE_USER" >/dev/null 2>&1; then
    useradd -m -G wheel -s /bin/bash "$LIVE_USER"
    # Set a blank password for easy login in the live environment
    echo "$LIVE_USER:" | chpasswd -e
fi
# Grant passwordless sudo to the live user
echo "$LIVE_USER ALL=(ALL) NOPASSWD: ALL" > "/etc/sudoers.d/99_liveuser"

# Autologin to the live session
sed -i 's/autologin-user=.*/autologin-user='"$LIVE_USER"'/' /etc/sddm.conf.d/autologin.conf

# Autostart the Calamares installer
mkdir -p "/home/$LIVE_USER/.config/autostart"
cat > "/home/$LIVE_USER/.config/autostart/calamares.desktop" <<EOF
[Desktop Entry]
Name=Install Kael OS
Exec=sudo calamares
Icon=system-installer
Terminal=false
Type=Application
EOF
chown -R "$LIVE_USER:$LIVE_USER" "/home/$LIVE_USER/.config"
`;

    const packageList = new Set<string>([
        'archiso', 'calamares', 'kpmcore', 'grub', 'efibootmgr',
        'networkmanager', 'git', 'reflector'
    ]);
    
    // Add packages from the blueprint so they are available for Calamares to install
    config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => packageList.add(p));
    config.kernels.forEach(k => packageList.add(k));

    const allPackages = Array.from(packageList).filter(p => !p.includes('cachyos')).sort();
    
    const hasChaotic = config.extraRepositories.includes('chaotic');
    const hasCachy = config.extraRepositories.includes('cachy');
    
    const masterBuildScript = `#!/bin/bash
# Kael AI :: Master ISO Forge Script (Calamares Edition)
# Run on an existing Arch Linux system to build a bootable Kael OS installer ISO.
set -euo pipefail
clear

# --- SCRIPT CONFIGURATION (Injected by Kael AI) ---
ISO_WORKDIR="kael-iso-build"
HAS_CACHY=${hasCachy}
HAS_CHAOTIC=${hasChaotic}

CUSTOMIZE_SCRIPT_CONTENT=$(cat <<'EOF_CUSTOMIZE'
${customizeAiRootFsScript}
EOF_CUSTOMIZE
)

# --- Calamares Configs ---
${Object.entries(calamaresConfigs).map(([filename, content]) => `
CALAMARES_${filename.replace(/[\/\.]/g, '_')}_CONTENT=$(cat <<'EOF_CALAMARES_${filename.replace(/[\/\.]/g, '_')}'
${content}
EOF_CALAMARES_${filename.replace(/[\/\.]/g, '_')}
)
`).join('')}

PACKAGE_LIST_CONTENT=$(cat <<'EOF_PACKAGES'
${allPackages.join('\n')}
EOF_PACKAGES
)
# --- END SCRIPT CONFIGURATION ---

# --- Helper Functions ---
info() { echo -e "\\e[34m[INFO]\\e[0m $1"; }
warn() { echo -e "\\e[33m[WARN]\\e[0m $1"; }
success() { echo -e "\\e[32m[SUCCESS]\\e[0m $1"; }
error() { echo -e "\\e[31m[ERROR]\\e[0m $1"; exit 1; }

# --- Main Execution ---
info "Checking for root permissions and dependencies..."
[ "$EUID" -eq 0 ] || error "This script must be run as root. Please use 'sudo ./build-iso.sh'."
pacman -Q archiso &>/dev/null || pacman -S --noconfirm archiso

info "Setting up build directory at ~/$ISO_WORKDIR..."
cd ~; rm -rf "$ISO_WORKDIR"; mkdir "$ISO_WORKDIR"; cd "$ISO_WORKDIR"
cp -r /usr/share/archiso/configs/releng .

info "Embedding customization script..."
echo "$CUSTOMIZE_SCRIPT_CONTENT" > releng/customize_airootfs.sh
chmod +x releng/customize_airootfs.sh

info "Embedding Calamares configuration grimoires..."
mkdir -p releng/airootfs/tmp/calamares-config/modules
mkdir -p releng/airootfs/tmp/calamares-config/scripts
${Object.entries(calamaresConfigs).map(([filename]) => `
echo "$CALAMARES_${filename.replace(/[\/\.]/g, '_')}_CONTENT" > "releng/airootfs/tmp/calamares-config/${filename}"
`).join('')}
success "Scripts and configs embedded successfully."

# Configure build environment for custom repositories
if [ "$HAS_CACHY" = "true" ] || [ "$HAS_CHAOTIC" = "true" ]; then
    info "Configuring pacman for custom repositories..."
    if [ "$HAS_CACHY" = "true" ]; then
        info "--> [Host] Setting up CachyOS repository..."
        pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com; pacman-key --lsign-key F3B607488DB35A47
        pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'
    fi
    if [ "$HAS_CHAOTIC" = "true" ]; then
        info "--> [Host] Setting up Chaotic-AUR repository..."
        pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com; pacman-key --lsign-key 3056513887B78AEB
        pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
        grep -q "chaotic-aur" /etc/pacman.conf || echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" | tee -a /etc/pacman.conf
    fi
    info "--> [Profile] Copying configuration to ISO build directory..."
    cp /etc/pacman.conf releng/pacman.conf
    mkdir -p releng/airootfs/etc/pacman.d
    if [ "$HAS_CACHY" = "true" ]; then
        cp /etc/pacman.d/cachyos-mirrorlist releng/airootfs/etc/pacman.d/; cp /etc/pacman.d/cachyos-v3-mirrorlist releng/airootfs/etc/pacman.d/; cp /etc/pacman.d/cachyos-v4-mirrorlist releng/airootfs/etc/pacman.d/
        # Also copy the keyring and mirrorlist packages for the target system
        mkdir -p releng/airootfs/etc/pacman.d/cachyos-repo-files
        cp /var/cache/pacman/pkg/cachyos-*.pkg.tar.zst releng/airootfs/etc/pacman.d/cachyos-repo-files/
    fi
    if [ "$HAS_CHAOTIC" = "true" ]; then
        cp /etc/pacman.d/chaotic-mirrorlist releng/airootfs/etc/pacman.d/
        mkdir -p releng/airootfs/etc/pacman.d/chaotic-repo-files
        cp /var/cache/pacman/pkg/chaotic-*.pkg.tar.zst releng/airootfs/etc/pacman.d/chaotic-repo-files/
    fi
    info "--> Synchronizing pacman databases..."; pacman -Syu --noconfirm
fi

info "Adding all blueprint packages to the ISO..."
echo "$PACKAGE_LIST_CONTENT" >> releng/packages.x86_64
success "Package list updated."

info "Starting the ISO build process. This may take a while..."
mkarchiso -v -w work -o out releng
success "ISO build complete! Your custom Kael OS installer is located at '~/kael-iso-build/out/'."
`;

    const downloadScript = () => {
        const blob = new Blob([masterBuildScript], { type: 'text/bash' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'build-iso.sh';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider">The Genesis Ritual: Forge ISO</h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed">
                    <div className="animate-fade-in-fast space-y-4">
                        <p>This path forges a completely custom Arch Linux ISO that boots directly into a <strong className="text-dragon-fire">graphical installer (Calamares)</strong>. It is the ultimate method for creating a shareable, self-contained version of your OS. It requires an existing Arch Linux system (or a VM running Arch) to perform the build.</p>
                        
                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 1: Get the Master Forge Script</h3>
                            <p>Download the script directly, or copy the entire script below and save it as <strong className="text-dragon-fire">build-iso.sh</strong> on an Arch Linux system.</p>
                             <div className="flex justify-center items-center gap-4 my-4">
                                <button
                                    onClick={downloadScript}
                                    className="bg-magic-purple hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download build-iso.sh
                                </button>
                            </div>
                            <CodeBlock lang="bash">
                                {masterBuildScript}
                            </CodeBlock>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 2: Make it Executable</h3>
                            <p>Open a terminal, navigate to where you saved the script, and run:</p>
                            <CodeBlock>chmod +x build-iso.sh</CodeBlock>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 3: Run with Sudo</h3>
                            <p>The script needs root permissions to install `archiso` and build the ISO. Execute it with:</p>
                            <CodeBlock>sudo ./build-iso.sh</CodeBlock>
                            <p className="mt-2">The script will handle everything else. Once finished, your custom bootable ISO will be located in the <strong className="font-mono text-forge-text-secondary">~/kael-iso-build/out/</strong> directory, ready to be written to a USB drive or used in a VM.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};