import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon } from './Icons';
import type { DistroConfig } from '../types';

interface IsoModalProps {
  onClose: () => void;
  generatedScript: string;
  config: DistroConfig;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            <pre className="bg-slate-950/70 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono pr-12 whitespace-pre-wrap break-words">
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
    const [activeTab, setActiveTab] = useState<'easy' | 'virtual' | 'advanced'>('easy');

    const base64Script = utf8ToBase64(generatedScript);
    const quickInstallCommand = `echo "${base64Script}" | base64 -d > install.sh && chmod +x install.sh && ./install.sh`;
    const createScriptCommand = `echo "${base64Script}" | base64 -d > install.sh`;
    
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

# 3. Create and enable a systemd service to run our installer script automatically after login.
# This is much more reliable than hijacking shell profiles.
cat > /etc/systemd/system/chirpy-installer.service <<'EOF'
[Unit]
Description=Chirpy OS Installer Service
# We want this to run after the user session is set up on the TTY
After=systemd-user-sessions.service getty@tty1.service

[Service]
Type=simple
# The installer script needs to run on the TTY where the user is logged in
ExecStart=/root/install.sh
StandardInput=tty
StandardOutput=tty
StandardError=tty
TTYPath=/dev/tty1

[Install]
# Hook into the default target to run on boot
WantedBy=default.target
EOF

# Enable our new service so it starts on boot
systemctl enable chirpy-installer.service

# 4. Rebrand the boot menu for a seamless, friendly experience.
# These sed commands use more robust patterns to match the default archiso menu entries
# regardless of the specific version date in the label.

# For GRUB (modern EFI systems), which uses double quotes.
if [ -f /boot/grub/grub.cfg ]; then
    # Match the default Arch ISO entry and replace it.
    sed -i -E "s/menuentry \\"Arch Linux archiso x86_64[^\\"]*\\"/menuentry \\"Install Chirpy OS\\"/g" /boot/grub/grub.cfg
fi

# For Syslinux (older BIOS systems), which uses a simpler label.
if [ -f /isolinux/syslinux.cfg ]; then
    # Match the default Arch ISO label and replace it.
    sed -i -E "s/MENU LABEL Arch Linux archiso x86_64.*/MENU LABEL Install Chirpy OS/g" /isolinux/syslinux.cfg
fi
`;

    const packageList = new Set<string>();
    if (config) {
        packageList.add('dialog');
        packageList.add('networkmanager');
        packageList.add('grub');
        packageList.add('efibootmgr');
        packageList.add('cachyos-hw-prober');

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
    const allPackages = Array.from(packageList).sort();
    const addAllPackagesCommand = `bash -c 'cat <<EOF >> releng/packages.x86_64
${allPackages.join('\n')}
EOF'`;

    const hasChaotic = Array.isArray(config.extraRepositories) && config.extraRepositories.includes('chaotic');
    const hasCachy = Array.isArray(config.extraRepositories) && config.extraRepositories.includes('cachy');
    
    let configureEnvironmentCommand = '';
    if (hasCachy || hasChaotic) {
        const commands = [
            `# This is a multi-stage command. Please copy and paste the entire block.`,
            `# It configures both your host system and the ISO build profile.`,
            `set -e`,
            ``,
            `echo "--- STAGE 1: CONFIGURING HOST SYSTEM ---"`,
        ];
    
        if (hasCachy) {
            commands.push(
                `echo "--> [Host] Setting up CachyOS repository..."`,
                `# NOTE: These URLs are version-specific and may cause a 404 error in the future.`,
                `# If that happens, you will need to find the latest package URLs from the CachyOS mirror.`,
                `sudo pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com`,
                `sudo pacman-key --lsign-key F3B607488DB35A47`,
                `sudo pacman -U --noconfirm \\`,
                `'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' \\`,
                `'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' \\`,
                `'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' \\`,
                `'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'`,
            );
        }
        if (hasChaotic) {
            commands.push(
                `echo "--> [Host] Setting up Chaotic-AUR repository..."`,
                `sudo pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com`,
                `sudo pacman-key --lsign-key 3056513887B78AEB`,
                `sudo pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'`,
                `grep -q "chaotic-aur" /etc/pacman.conf || echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" | sudo tee -a /etc/pacman.conf`,
            );
        }
    
        commands.push(
            ``,
            `echo "--- STAGE 2: CONFIGURING ISO PROFILE ---"`,
            `echo "--> [Profile] Copying configuration to ISO build directory..."`,
            `sudo cp /etc/pacman.conf releng/pacman.conf`,
            `mkdir -p releng/airootfs/etc/pacman.d`,
        );
    
        if (hasCachy) {
            commands.push(
                `sudo cp /etc/pacman.d/cachyos-mirrorlist releng/airootfs/etc/pacman.d/`,
                `sudo cp /etc/pacman.d/cachyos-v3-mirrorlist releng/airootfs/etc/pacman.d/`,
                `sudo cp /etc/pacman.d/cachyos-v4-mirrorlist releng/airootfs/etc/pacman.d/`,
            );
        }
        if (hasChaotic) {
            commands.push(
                `sudo cp /etc/pacman.d/chaotic-mirrorlist releng/airootfs/etc/pacman.d/`,
            );
        }
        
        commands.push(
            ``,
            `echo "--- STAGE 3: SYNCHRONIZING DATABASES ---"`,
            `sudo pacman -Syu`,
            ``,
            `echo "Environment configuration complete!"`
        );
    
        configureEnvironmentCommand = commands.join('\n');
    }

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
                             onClick={() => setActiveTab('advanced')}
                             className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'advanced' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            The Artisan's Path (Custom ISO)
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

                                <h4 className="font-semibold text-md text-white mt-6 mb-2">Manual Fallback</h4>
                                <p>If you prefer to create the script manually:</p>
                                <p className="mt-2">1. In the live environment, open a text editor (like `nano`):</p>
                                <CodeBlock>nano install.sh</CodeBlock>
                                <p>2. Paste the full script content (which you can get from the "Build" window), then save and exit the editor.</p>
                                <p>3. Make the script executable:</p>
                                <CodeBlock>chmod +x install.sh</CodeBlock>
                                <p>4. Run the ritual:</p>
                                <CodeBlock>./install.sh</CodeBlock>
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
                                {/* Fix: Replaced <HOST_IP> with YOUR_HOST_IP to prevent JSX parsing errors. */}
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
                    {activeTab === 'advanced' && (
                        <div className="animate-fade-in-fast space-y-4">
                            <p>This path forges a completely custom Arch Linux ISO that boots directly into your installer. This is the ultimate "noob friendly" method for sharing your creation. It requires an existing Arch Linux system (or a VM running Arch) to perform the build.</p>
                            
                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 1: Install ArchISO</h3>
                                <p>This is the tool used to master ISO images.</p>
                                <CodeBlock>sudo pacman -S archiso</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 2: Prepare the Profile</h3>
                                <p>Create a working directory and copy the baseline `releng` profile.</p>
                                <CodeBlock>{`mkdir ~/chirpy-iso && cd ~/chirpy-iso
cp -r /usr/share/archiso/configs/releng .`}</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 3: Embed the Ritual Script</h3>
                                <p>First, create the `install.sh` file on your host system. This command decodes the script you just forged and saves it locally. Run it from your <strong className="font-mono text-slate-400">~/chirpy-iso</strong> directory.</p>
                                <CodeBlock>{createScriptCommand}</CodeBlock>
                                <p className="mt-4">Now, move the generated script into the profile for the ISO build.</p>
                                <CodeBlock>{`# Move the script into the ISO's root directory
mv install.sh releng/airootfs/root/install.sh`}</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 4: Configure Build Environment & Profile</h3>
                                {(hasCachy || hasChaotic) ? (
                                    <>
                                        <p>The builder uses a clean environment, so we must configure both your host system (to get the required keys/mirrorlists) and the ISO build profile (so the builder knows where to find packages).</p>
                                        <p className="mt-2">Run the entire command block below to perform this configuration.</p>
                                        <CodeBlock>{configureEnvironmentCommand}</CodeBlock>
                                    </>
                                ) : (
                                    <p className="text-slate-400">Your blueprint only uses official Arch repositories, so no special configuration is needed. You can proceed to the next step.</p>
                                )}
                            </div>
                            
                             <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 5: Embed All Dependencies</h3>
                                <p>To create a true offline installer, this command appends every package from your blueprint directly into the ISO's package list. This includes your desktop environment, kernels, and applications.</p>
                                <CodeBlock>{addAllPackagesCommand}</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-6 mb-2">Step 6: Automate & Rebrand the ISO</h3>
                                <p>This is the crucial step. We'll manually create a customization script to automatically run your installer on boot and rebrand the boot menu.</p>
                                <p className="mt-2">1. Run the following command to open the <strong className="text-yellow-400">nano</strong> text editor and create the script file:</p>
                                <CodeBlock>nano releng/customize_airootfs.sh</CodeBlock>
                                
                                <p className="mt-2">2. Copy the entire script below and paste it into the nano editor. This script will:</p>
                                <ul className="list-disc list-inside my-2 space-y-1 pl-2 text-slate-400">
                                    <li>Configure the live environment to auto-login as root.</li>
                                    <li>Create and enable a <strong className="font-mono text-slate-300">systemd service</strong> to reliably run your installer.</li>
                                    <li>Rename the boot menu entry to <strong className="text-yellow-300">"Install Chirpy OS"</strong>.</li>
                                </ul>
                                <CodeBlock>{customizeAiRootFsScript}</CodeBlock>

                                <p className="mt-2">3. Press <strong className="text-yellow-400">Ctrl+X</strong> to exit nano. You will be asked to save the file. Press <strong className="text-yellow-400">Y</strong> for 'Yes', then press <strong className="text-yellow-400">Enter</strong> to confirm the filename.</p>

                                <p className="mt-4">4. After saving, you must make this customization script executable:</p>
                                <CodeBlock>chmod +x releng/customize_airootfs.sh</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-6 mb-2">Step 7: Build the ISO</h3>
                                <p>From your <strong className="font-mono text-slate-400">~/chirpy-iso</strong> directory, run the build command. This can take some time.</p>
                                <CodeBlock>sudo mkarchiso -v -w /tmp/archiso-work -o . releng</CodeBlock>
                                <p>Your custom, auto-installing ISO will be created in the current directory. When you boot it, the installation ritual will start automatically.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};