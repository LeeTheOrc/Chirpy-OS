import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon } from './Icons';
import type { DistroConfig } from '../types';

interface IsoModalProps {
  onClose: () => void;
  generatedScript: string;
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

const utf8ToBase64 = (str: string): string => {
    if (!str) return '';
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        console.error("Failed to base64 encode script:", e);
        return btoa("Error: Could not encode script due to invalid characters.");
    }
}

export const IsoModal: React.FC<IsoModalProps> = ({ onClose, generatedScript, config }) => {
    
    const customizeAiRootFsScript = `#!/bin/bash
set -euo pipefail

# This script is run by mkarchiso to customize the ISO image.

# 1. Make our installer script executable.
chmod +x /root/install.sh

# 2. Configure systemd to auto-login as root on the first terminal (tty1).
mkdir -p /etc/systemd/system/getty@tty1.service.d
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf <<'EOF'
[Service]
ExecStart=
ExecStart=-/usr/bin/agetty --autologin root --noclear %I $TERM
EOF

# 3. Configure the shell to run the installer script automatically on login.
# This is a simple and effective way to auto-launch the TUI.
cat >> /root/.bash_profile <<'EOF'

# Auto-launch Kael Installer
if [ -f /root/install.sh ]; then
    /root/install.sh
fi
EOF

# 4. Rebrand the boot menu for a seamless, friendly experience.
if [ -f /boot/grub/grub.cfg ]; then
    sed -i -E "s/menuentry 'Arch Linux archiso x86_64[^']*'/menuentry 'Install Kael OS (UEFI)'/g" /boot/grub/grub.cfg
fi
if [ -f /isolinux/syslinux.cfg ]; then
    sed -i -E "s/MENU LABEL Arch Linux archiso x86_64.*/MENU LABEL Install Kael OS (BIOS)/g" /isolinux/syslinux.cfg
fi
`;

    const packageList = new Set<string>();
    if (config) {
        packageList.add('dialog');
        packageList.add('networkmanager');
        packageList.add('grub');
        packageList.add('efibootmgr');
        packageList.add('reflector');

        if (config.packages) {
            config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => packageList.add(p));
        }
        if (Array.isArray(config.kernels)) {
            config.kernels.forEach(k => packageList.add(k));
        }
        if (config.desktopEnvironment) {
            const de = config.desktopEnvironment.toLowerCase();
            packageList.add('xorg');
            if (de.includes('kde')) {
                packageList.add('sddm');
                packageList.add('plasma-meta');
            } else if (de.includes('gnome')) {
                packageList.add('gdm');
                packageList.add('gnome');
            } else {
                packageList.add('gdm');
                packageList.add(de.split(' ')[0]);
            }
        }
        if (config.enableSnapshots && config.filesystem === 'btrfs') {
            packageList.add('grub-btrfs');
        }
        if (Array.isArray(config.aurHelpers)) {
            config.aurHelpers.forEach(h => {
                if (h === 'yay' || h === 'paru') packageList.add(h);
            });
        }
    }
    
    const standardPackagesOnly = Array.from(packageList).filter(p => !p.includes('cachyos'));
    const allPackages = standardPackagesOnly.sort();

    const hasChaotic = Array.isArray(config.extraRepositories) && config.extraRepositories.includes('chaotic');
    const hasCachy = Array.isArray(config.extraRepositories) && config.extraRepositories.includes('cachy');
    
    const masterBuildScript = `#!/bin/bash
# Kael AI :: Master ISO Forge Script
#
# Run this script on an existing Arch Linux system to build a bootable
# Kael OS installer ISO from your custom blueprint.
# It automates dependency checks, directory setup, script embedding,
# repository configuration, and the final ISO build.

set -euo pipefail
clear

# --- SCRIPT CONFIGURATION (Injected by Kael AI) ---
ISO_WORKDIR="kael-iso-build"
HAS_CACHY=${hasCachy}
HAS_CHAOTIC=${hasChaotic}

INSTALLER_SCRIPT_CONTENT=$(cat <<'EOF'
${generatedScript}
EOF
)

CUSTOMIZE_SCRIPT_CONTENT=$(cat <<'EOF'
${customizeAiRootFsScript}
EOF
)

PACKAGE_LIST_CONTENT=$(cat <<'EOF'
${allPackages.join('\n')}
EOF
)
# --- END SCRIPT CONFIGURATION ---

# --- Helper Functions ---
info() { echo -e "\\e[34m[INFO]\\e[0m $1"; }
warn() { echo -e "\\e[33m[WARN]\\e[0m $1"; }
success() { echo -e "\\e[32m[SUCCESS]\\e[0m $1"; }
error() { echo -e "\\e[31m[ERROR]\\e[0m $1"; exit 1; }

# --- Main Execution ---

# 1. Check dependencies and permissions
info "Checking for root permissions and dependencies..."
[ "$EUID" -eq 0 ] || error "This script must be run as root. Please use 'sudo ./build-iso.sh'."
pacman -Q archiso &>/dev/null || error "'archiso' package not found. Please install it with 'sudo pacman -S archiso'."

# 2. Prepare build directory
info "Setting up build directory at ~/$ISO_WORKDIR..."
cd ~
rm -rf "$ISO_WORKDIR"
mkdir "$ISO_WORKDIR"
cd "$ISO_WORKDIR"
cp -r /usr/share/archiso/configs/releng .
info "Build directory created."

# 3. Embed installer and customization scripts
info "Embedding the TUI installer script..."
echo "$INSTALLER_SCRIPT_CONTENT" > releng/airootfs/root/install.sh
chmod +x releng/airootfs/root/install.sh

info "Embedding the ISO customization script for auto-login and branding..."
echo "$CUSTOMIZE_SCRIPT_CONTENT" > releng/customize_airootfs.sh
chmod +x releng/customize_airootfs.sh
success "Scripts embedded successfully."

# 4. Configure build environment for custom repositories
if [ "$HAS_CACHY" = "true" ] || [ "$HAS_CHAOTIC" = "true" ]; then
    info "Configuring pacman for custom repositories (CachyOS/Chaotic-AUR)..."

    # Configure host system first to get keys and mirrorlists
    if [ "$HAS_CACHY" = "true" ]; then
        info "--> [Host] Setting up CachyOS repository..."
        pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com
        pacman-key --lsign-key F3B607488DB35A47
        pacman -U --noconfirm --needed \\
        'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' \\
        'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' \\
        'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' \\
        'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'
    fi
    if [ "$HAS_CHAOTIC" = "true" ]; then
        info "--> [Host] Setting up Chaotic-AUR repository..."
        pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
        pacman-key --lsign-key 3056513887B78AEB
        pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
        grep -q "chaotic-aur" /etc/pacman.conf || echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" | tee -a /etc/pacman.conf
    fi

    # Now configure the ISO profile by copying the host's config
    info "--> [Profile] Copying configuration to ISO build directory..."
    cp /etc/pacman.conf releng/pacman.conf
    mkdir -p releng/airootfs/etc/pacman.d

    if [ "$HAS_CACHY" = "true" ]; then
        cp /etc/pacman.d/cachyos-mirrorlist releng/airootfs/etc/pacman.d/
        cp /etc/pacman.d/cachyos-v3-mirrorlist releng/airootfs/etc/pacman.d/
        cp /etc/pacman.d/cachyos-v4-mirrorlist releng/airootfs/etc/pacman.d/
    fi
    if [ "$HAS_CHAOTIC" = "true" ]; then
        cp /etc/pacman.d/chaotic-mirrorlist releng/airootfs/etc/pacman.d/
    fi

    info "--> Synchronizing pacman databases..."
    pacman -Syu --noconfirm
    success "Repository configuration complete."
fi

# 5. Embed all package dependencies
info "Adding all blueprint packages to the ISO..."
echo "$PACKAGE_LIST_CONTENT" >> releng/packages.x86_64
success "Package list updated."

# 6. Build the ISO
info "Starting the ISO build process. This may take a while..."
warn "The build will happen in './work'. The output ISO will be in './out'."
# The default work dir is in /tmp which can be a small ramdisk. We use a local dir to avoid space issues.
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
            <div className="bg-forge-panel border border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary">The Master's Path: Forge ISO</h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed">
                    <div className="animate-fade-in-fast space-y-4">
                        <p>This path forges a completely custom Arch Linux ISO that boots directly into your installer. It is the ultimate method for creating a shareable, self-contained version of your OS. It requires an existing Arch Linux system (or a VM running Arch) to perform the build.</p>
                        
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