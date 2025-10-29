import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon } from './Icons';

interface IsoModalProps {
  onClose: () => void;
  generatedScript: string;
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
            <pre className="bg-slate-950/70 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 overflow-x-auto font-mono pr-12">
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

export const IsoModal: React.FC<IsoModalProps> = ({ onClose, generatedScript }) => {
    const [activeTab, setActiveTab] = useState<'easy' | 'virtual' | 'advanced'>('easy');

    const quickInstallCommand = `# Create the installation script
echo '${utf8ToBase64(generatedScript)}' | base64 -d > install.sh

# Make it executable and run the ritual
chmod +x install.sh && ./install.sh
`;

    const createScriptCommand = `# Create the installation script on your host machine
echo '${utf8ToBase64(generatedScript)}' | base64 -d > install.sh`;

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
                                <p>Copy the entire command block below and paste it into your terminal. Press Enter to execute it.</p>
                                <CodeBlock>
                                    {quickInstallCommand}
                                </CodeBlock>
                                <p>This single command automatically creates the <strong className="font-mono text-slate-400">install.sh</strong> script, makes it executable, and begins the installation ritual.</p>

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
                            <p>This path allows you to build a completely custom Arch Linux ISO with your script and other modifications baked in. This requires an existing Arch Linux system (or a VM running Arch).</p>
                            
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
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 4: Pre-install Dependencies</h3>
                                <p>To make the TUI installer work without an internet connection, we'll embed the `dialog` package directly into the ISO.</p>
                                <CodeBlock>{`# Add 'dialog' to the list of packages to install in the ISO
echo "dialog" >> releng/packages.x86_64`}</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-6 mb-2">Step 5: Customize the Live Environment</h3>
                                <p>We'll create a customization script. This is the official ArchISO method to set permissions and enable services. This script will create a <strong className="text-yellow-400">systemd service</strong> to reliably auto-start your installer on boot.</p>
                                <CodeBlock>
{`cat > releng/customize_airootfs.sh <<'EOF'
#!/bin/bash
set -e

# Make the installer executable
chmod +x /root/install.sh

# Create the systemd service to auto-start the installer
cat > /etc/systemd/system/chirpy-installer.service <<'SERVICE'
[Unit]
Description=Chirpy OS Installation Ritual
Wants=getty@tty1.service
After=getty@tty1.service

[Service]
Type=oneshot
ExecStart=/root/install.sh
StandardInput=tty-force
TTYPath=/dev/tty1

[Install]
WantedBy=multi-user.target
SERVICE

# Enable the service
systemctl enable chirpy-installer.service
EOF`}
                                </CodeBlock>
                                <p>Finally, make this new customization script executable:</p>
                                <CodeBlock>chmod +x releng/customize_airootfs.sh</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-6 mb-2">Step 6: Build the ISO</h3>
                                <p>From your <strong className="font-mono text-slate-400">~/chirpy-iso</strong> directory, run the build command. This can take some time.</p>
                                <CodeBlock>sudo mkarchiso -v -w /tmp/archiso-work -o . releng</CodeBlock>
                                <p>Your custom ISO will be created in the current directory. When you boot it, the installation ritual will start automatically.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
