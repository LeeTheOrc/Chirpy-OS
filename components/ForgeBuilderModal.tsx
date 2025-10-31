import React, { useState } from 'react';
import { CloseIcon, CopyIcon, ForgeIcon } from './Icons';
import { generateForgeBuilderScript } from '../lib/forge-builder-generator';

interface ForgeBuilderModalProps {
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

export const ForgeBuilderModal: React.FC<ForgeBuilderModalProps> = ({ onClose }) => {
    const forgeScript = generateForgeBuilderScript();

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ForgeIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Forge: Genesis Ritual</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>This script performs a <strong className="text-dragon-fire">full, interactive installation of Arch Linux</strong>, equipping it with all the tools needed to build Kael OS. It must be run in a fresh Arch Linux live environment after booting from the official ISO.</p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Connect to the Aether (Network)</h3>
                    <p>Before the ritual can begin, the Forge must be connected to the internet. The script will check this, but here's how to do it manually.</p>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">For Wi-Fi (iwctl)</h4>
                    <p>Use the <code className="font-mono text-xs">iwctl</code> tool to connect:</p>
                    <CodeBlock lang="bash">{`# Launch the interactive tool
iwctl

# List your wireless device. Note the name (e.g., wlan0).
[iwd]# device list

# If the device is "powered off", turn it on. Replace <device> with your device name.
[iwd]# device <device> set-property Powered on`}</CodeBlock>

                    <p className="mt-2"><strong className="text-orc-steel">If your device is still powered off,</strong> a deeper incantation is needed. The device might be "soft blocked". Follow these steps:</p>
                    <CodeBlock lang="bash">{`# First, exit iwctl
[iwd]# exit

# Use the rfkill spell to unblock all wireless devices
rfkill unblock all

# Now, re-enter iwctl and check again. It should be powered on.
iwctl
[iwd]# device list`}</CodeBlock>

                    <p className="mt-2">Once your device is powered on, continue inside `iwctl`:</p>
                    <CodeBlock lang="bash">{`# Scan for networks
[iwd]# station <device> scan

# List available networks
[iwd]# station <device> get-networks

# Connect to your network (you will be prompted for a password)
[iwd]# station <device> connect "Your-WiFi-Name"

# Type 'exit' or press Ctrl+D to leave iwctl`}</CodeBlock>


                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">For Ethernet</h4>
                    <p>An ethernet connection should work automatically. You can verify it and find your IP address with:</p>
                    <CodeBlock>ip a</CodeBlock>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Verify Connection</h4>
                    <p>Once connected, test your connection by pinging a reliable server:</p>
                    <CodeBlock>ping archlinux.org</CodeBlock>
                    <p>Press <code className="font-mono text-xs bg-forge-border px-1 rounded-sm">Ctrl+C</code> to stop the ping. If you see replies, you are connected.</p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: The Ritual: Remote Control via SSH (Optional, but Recommended)</h3>
                     <p>Using SSH from your main PC allows you to copy and paste the entire forge script without typos.</p>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">On the Target Arch Linux Machine</h4>
                    <ol className="list-decimal list-inside space-y-2 pl-2">
                        <li>
                            <strong>Start the SSH server:</strong>
                            <CodeBlock>systemctl start sshd</CodeBlock>
                        </li>
                        <li>
                            <strong>Set a temporary password for the root user.</strong> You'll be prompted to type and confirm it. Make it simple, as it's only temporary.
                            <CodeBlock>passwd</CodeBlock>
                        </li>
                        <li>
                            <strong>Find the machine's IP address.</strong> Look for an entry like <code className="font-mono text-xs">inet 192.168.1.X/24</code> under your network device (e.g., `enp...` or `wlan...`).
                            <CodeBlock>ip a</CodeBlock>
                        </li>
                    </ol>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">On Your Main PC (e.g., Windows)</h4>
                     <ol className="list-decimal list-inside space-y-2 pl-2">
                        <li>Open PowerShell or Command Prompt.</li>
                        <li>Connect to the Arch machine using the IP you found:
                            <CodeBlock>ssh root@THE_IP_ADDRESS_YOU_FOUND</CodeBlock>
                        </li>
                         <li>If prompted about the host key, type <code className="font-mono text-xs">yes</code> and press Enter. Then, enter the temporary password you created.</li>
                    </ol>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 3: Unleash the Full Script</h3>
                    <p>Now that you are controlling the Arch machine remotely (or working on it directly), follow these final steps:</p>
                    <ol className="list-decimal list-inside space-y-2 pl-2">
                        <li>
                            <strong>Create a new script file using nano:</strong>
                            <CodeBlock>nano forge-ritual.sh</CodeBlock>
                        </li>
                         <li>
                            <strong>Copy the entire script below and paste it into the nano editor.</strong> This is the complete, unabridged incantation.
                            <CodeBlock>{forgeScript}</CodeBlock>
                        </li>
                        <li>
                            <strong>Save and exit nano:</strong> Press <code className="font-mono text-xs bg-forge-border px-1 rounded-sm">Ctrl+X</code>, then <code className="font-mono text-xs bg-forge-border px-1 rounded-sm">Y</code>, then <code className="font-mono text-xs bg-forge-border px-1 rounded-sm">Enter</code>.
                        </li>
                         <li>
                            <strong>Make the script executable:</strong>
                            <CodeBlock>chmod +x forge-ritual.sh</CodeBlock>
                        </li>
                        <li>
                            <strong>Begin the ritual with root privileges:</strong>
                            <CodeBlock>./forge-ritual.sh</CodeBlock>
                        </li>
                    </ol>
                    <p className="mt-2">The script will now guide you through the interactive installation. Follow its prompts to complete the forge.</p>
                </div>
            </div>
        </div>
    );
};