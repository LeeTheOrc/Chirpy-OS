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
    const fullScriptCommand = `cat > forge-ritual.sh << 'EOF'
${forgeScript}
EOF`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
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
                    
                    <details className="bg-forge-panel/30 rounded-lg p-3 border border-forge-border/50">
                        <summary className="cursor-pointer font-semibold text-forge-text-primary">Click here for detailed network connection instructions</summary>
                        <div className="mt-3 space-y-3">
                            <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">For Wi-Fi (iwctl)</h4>
                            <p>Use the <code className="font-mono text-xs">iwctl</code> tool to connect:</p>
                            <CodeBlock lang="bash">{`# Launch the interactive tool
iwctl

# List your wireless device. Note the name (e.g., wlan0).
[iwd]# device list

# If the device is "powered off", turn it on. Replace <device> with your device name.
[iwd]# device <device> set-property Powered on`}</CodeBlock>
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
                        </div>
                    </details>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Unleash the Full Script</h3>
                    <p>This unified incantation will create the <strong className="text-dragon-fire">forge-ritual.sh</strong> script on your live system. <strong className="text-dragon-fire">Copy the entire block below and paste it into your terminal.</strong></p>
                    <CodeBlock lang="bash">{fullScriptCommand}</CodeBlock>

                     <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 3: Begin the Ritual</h3>
                    <p>Now, make the script executable and run it to begin the interactive installation. The script will guide you through the rest of the process.</p>
                    <CodeBlock lang="bash">{`chmod +x forge-ritual.sh
./forge-ritual.sh`}</CodeBlock>

                    <p className="mt-2 text-xs italic">
                        For a better experience, you can optionally connect to the live environment via SSH from your main PC. This allows for easier copy-pasting of large command blocks. You would need to start the `sshd` service, set a temporary `passwd`, and find the machine's IP address with `ip a`.
                    </p>
                </div>
            </div>
        </div>
    );
};