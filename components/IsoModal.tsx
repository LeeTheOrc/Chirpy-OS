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
            <pre className={`bg-slate-950/70 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono pr-12 whitespace-pre-wrap break-words ${lang ? `language-${lang}` : ''}`}>
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-slate-800/80 rounded-md text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
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
    const [activeTab, setActiveTab] = useState<'easy' | 'virtual' | 'master'>('easy');

    const base64Script = utf8ToBase64(generatedScript);
    const quickInstallCommand = `echo "${base64Script}" | base64 -d > install.sh && chmod +x install.sh && ./install.sh`;
    
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

# Auto-launch Chirpy Installer
if [ -f /root/install.sh ]; then
    /root/install.sh
fi
EOF

# 4. Rebrand the boot menu for a seamless, friendly experience.
if [ -f /boot/grub/grub.cfg ]; then
    sed -i -E "s/menuentry 'Arch Linux archiso x86_64[^']*'/menuentry 'Install Chirpy OS (UEFI)'/g" /boot/grub/grub.cfg
fi
if [ -f /isolinux/syslinux.cfg ]; then
    sed -i -E "s/MENU LABEL Arch Linux archiso x86_64.*/MENU LABEL Install Chirpy OS (BIOS)/g" /isolinux/syslinux.cfg
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
    
    // This is the new, single, unified script for building the ISO.
    const masterBuildScript = `#!/bin/bash
# Chirpy AI :: Master ISO Forge Script
#
# Run this script on an existing Arch Linux system to build a bootable
# Chirpy OS installer ISO from your custom blueprint.
# It automates dependency checks, directory setup, script embedding,
# repository configuration, and the final ISO build.

set -euo pipefail
clear

# --- SCRIPT CONFIGURATION (Injected by Chirpy AI) ---
ISO_WORKDIR="chirpy-iso-build"
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

success "ISO build complete! Your custom Chirpy OS installer is located at '~/chirpy-iso-build/out/'."
`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Performing the Ritual</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="border-b border-slate-700 mb-4 flex-shrink-0">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            onClick={() => setActiveTab('easy')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'easy' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            The Simple Path (Bare Metal)
                        </button>
                        <button
                             onClick={() => setActiveTab('virtual')}
                             className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'virtual' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            The Virtual Path (QEMU/VM)
                        </button>
                        <button
                             onClick={() => setActiveTab('master')}
                             className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'master' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            The Master's Path (Build ISO)
                        </button>
                    </nav>
                </div>
                
                <div className="overflow-y-auto pr-2 text-slate-300 leading-relaxed">
                    {activeTab === 'easy' && (
                        <div className="animate-fade-in-fast space-y-4">
                            <p>This is the recommended method for installing on a physical computer. You'll use the official Arch Linux live environment to execute your custom installation script.</p>
                            
                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 1: Get the Arch Linux ISO</h3>
                                <p>If you don't have it already, download the latest official ISO file.</p>
                                <a href="https://archlinux.org/download/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg my-2 transition-colors">
                                    <DownloadIcon className="w-5 h-5" />
                                    Download from archlinux.org
                                </a>
                            </div>

                             <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 2: Create a Bootable USB</h3>
                                <p>Use a tool like <a href="https://www.balena.io/etcher/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Balena Etcher</a> or <a href="https://www.ventoy.net/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Ventoy</a> to write the downloaded ISO to a USB drive.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 3: Boot and Run the Ritual</h3>
                                <p>Boot your target computer from the USB drive. Once you are at the command prompt in the live environment, ensure you are connected to the internet.</p>
                                <p className="mt-2">This <strong className="text-yellow-400">Quick Install Command</strong> is the most direct path to forging your realm.</p>
                                <p>Copy the command below and paste it into your terminal. Press Enter to execute it.</p>
                                <CodeBlock>
                                    {quickInstallCommand}
                                </CodeBlock>
                                <p>This command automatically creates the <strong className="font-mono text-slate-400">install.sh</strong> script, makes it executable, and begins the installation ritual.</p>
                            </div>
                        </div>
                    )}
                     {activeTab === 'virtual' && (
                        <div className="animate-fade-in-fast space-y-4">
                            <p>This is the recommended method for installing inside a virtual machine like QEMU or VirtualBox. It avoids copy-paste issues by serving the script from your host machine.</p>
                            
                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 1: Save the Script on Your Host Machine</h3>
                                <p>In the "Great Forge" modal, go to the "View Full Script" tab and copy the entire script.</p>
                                <p>On your main computer (the "host"), create a new folder, and inside it, save the script into a file named <strong className="text-yellow-400">install.sh</strong>.</p>
                            </div>

                             <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 2: Start a Local Web Server</h3>
                                <p>Open a terminal on your host machine, navigate into the folder where you saved `install.sh`, and start a simple web server. If you have Python 3 installed, this is easy:</p>
                                <CodeBlock>python -m http.server 8000</CodeBlock>
                                <p>This will make the `install.sh` file available to other machines on your local network. Keep this terminal running.</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 3: Boot the VM & Find Your Host IP</h3>
                                <p>Boot the Arch Linux ISO in your QEMU (or other) virtual machine. Once at the command prompt, you need to find your host machine's IP address from the VM's perspective. It's usually the default gateway.</p>
                                <p>Run this command inside the VM:</p>
                                <CodeBlock>ip route | grep default</CodeBlock>
                                <p>The output will be something like `default via 10.0.2.2 dev enp0s3`. The IP address you need is the one after `via` (in this case, `10.0.2.2`).</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 4: Download and Run the Ritual</h3>
                                <p>Now, from within the VM, use `curl` to download the script from your host's web server. Replace `YOUR_HOST_IP` with the address you found in the previous step.</p>
                                <CodeBlock>{`# Replace YOUR_HOST_IP with your actual host IP (e.g., 10.0.2.2)
curl http://YOUR_HOST_IP:8000/install.sh -o install.sh`}</CodeBlock>
                                <p>Finally, make the script executable and run it:</p>
                                <CodeBlock>{`chmod +x install.sh
./install.sh`}</CodeBlock>
                                <p>The interactive installation will now begin inside your VM.</p>
                            </div>
                        </div>
                    )}
                    {activeTab === 'master' && (
                        <div className="animate-fade-in-fast space-y-4">
                            <p>This path forges a completely custom Arch Linux ISO that boots directly into your installer. It's the ultimate method for creating a shareable, "noob-friendly" version of your OS. It requires an existing Arch Linux system (or a VM running Arch) to perform the build.</p>
                            
                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 1: Save the Master Forge Script</h3>
                                <p>Copy the entire script below and save it as <strong className="text-yellow-400">build-iso.sh</strong> on an Arch Linux system.</p>
                                <CodeBlock lang="bash">
                                    {masterBuildScript}
                                </CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 2: Make it Executable</h3>
                                <p>Open a terminal, navigate to where you saved the script, and run:</p>
                                <CodeBlock>chmod +x build-iso.sh</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 3: Run with Sudo</h3>
                                <p>The script needs root permissions to install `archiso` and build the ISO. Execute it with:</p>
                                <CodeBlock>sudo ./build-iso.sh</CodeBlock>
                                <p className="mt-2">The script will handle everything else. Once it's finished, your custom bootable ISO will be located in the <strong className="font-mono text-slate-400">~/chirpy-iso-build/out/</strong> directory, ready to be written to a USB drive or used in a VM.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};