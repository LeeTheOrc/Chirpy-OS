


import React, { useState } from 'react';
import { CloseIcon, CopyIcon, ComputerDesktopIcon } from './Icons';
import { generateTuiInstallerScript } from '../lib/tui-generator';

interface TuiInstallerModalProps {
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


export const TuiInstallerModal: React.FC<TuiInstallerModalProps> = ({ onClose }) => {
    // Generate the full installer script by calling the new generator function
    const installScript = generateTuiInstallerScript();

    // UTF-8 safe encoding
    const encodedScript = btoa(unescape(encodeURIComponent(installScript)));
    const fullInstallCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    // A comprehensive uninstall script that also cleans up shell profiles.
    const cleansingScript = `#!/bin/bash
set -e
INSTALL_DIR="\$HOME/.local/bin"
INSTALL_PATH="\$INSTALL_DIR/kael-forge"
# Determine the user's actual login shell, not the shell running the script.
LOGIN_SHELL_PATH=\$(getent passwd \\$USER | cut -d: -f7)
CONFIG_SHELL="\${LOGIN_SHELL_PATH##*/}"

echo "--- Kael Forge TUI - Cleansing Rite ---"

# 1. Remove the executable
if [ -f "\$INSTALL_PATH" ]; then
    echo "--> Removing executable: \$INSTALL_PATH"
    rm -f "\$INSTALL_PATH"
    echo "--> Executable removed."
else
    echo "--> Executable not found at \$INSTALL_PATH. Skipping."
fi

# 2. Remove from shell profile
echo "--> Detected user's login shell as '\$CONFIG_SHELL'. Checking configuration..."

if [ "\$CONFIG_SHELL" = "fish" ]; then
    echo "--> Removing path from fish_user_paths..."
    if fish -c "contains \\\$INSTALL_DIR \\\$fish_user_paths"; then
        fish -c "set -U fish_user_paths (string match -v '\\\$INSTALL_DIR' \\\$fish_user_paths)"
        echo "--> Path removed from fish configuration. Please open a NEW terminal."
    else
        echo "--> Kael Forge path not found in fish configuration. Nothing to do."
    fi
elif [ "\$CONFIG_SHELL" = "zsh" ] || [ "\$CONFIG_SHELL" = "bash" ]; then
    PROFILE_FILE=""
    if [ "\$CONFIG_SHELL" = "zsh" ]; then
        PROFILE_FILE="\$HOME/.zshrc"
    else
        PROFILE_FILE="\$HOME/.bashrc"
    fi

    if [ -f "\$PROFILE_FILE" ]; then
        echo "--> Checking profile file: '\$PROFILE_FILE'"
        if grep -q "# Add Kael Forge TUI to PATH" "\$PROFILE_FILE"; then
            echo "--> Found Kael Forge configuration. Creating backup and removing it..."
            # Using a variable for the sed script to avoid quoting issues
            SED_SCRIPT='/# Add Kael Forge TUI to PATH/,+1d'
            sed -i.kael-bak "\$SED_SCRIPT" "\$PROFILE_FILE"
            echo "--> Configuration removed. Backup saved to '\$PROFILE_FILE.kael-bak'."
            echo "--> Please run 'source \$PROFILE_FILE' or open a NEW terminal."
        else
            echo "--> Kael Forge configuration not found in '\$PROFILE_FILE'. Nothing to do."
        fi
    else
        echo "--> Profile file '\$PROFILE_FILE' not found. Nothing to do."
    fi
else
    echo "--> Unsupported shell '\$CONFIG_SHELL'. Please manually remove '\$INSTALL_DIR' from your PATH."
fi

echo ""
echo "✅ Cleansing Rite Complete!"
`;

    // UTF-8 safe encoding for the cleansing script
    const encodedCleansingScript = btoa(unescape(encodeURIComponent(cleansingScript)));
    const fullCleansingCommand = `echo "${encodedCleansingScript}" | base64 --decode | bash`;


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ComputerDesktopIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Forge on Your PC (TUI)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this ritual will install the <strong className="text-dragon-fire">Kael Forge TUI</strong> directly onto your machine. This provides a powerful, menu-driven command-line interface for all our development rituals, allowing you to work faster without returning to this web UI.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Installation Incantation</h3>
                    <p>
                        Copy this single, unified command and run it in your terminal. It will create the <code className="font-mono text-xs">kael-forge</code> command, make it executable, and ensure it's in your system's PATH.
                    </p>
                    <CodeBlock lang="bash">{fullInstallCommand}</CodeBlock>

                    <p className="mt-2">
                        After the installation, you may need to open a <strong className="text-dragon-fire">new terminal window</strong> for the <code className="font-mono text-xs">kael-forge</code> command to become available in your current session.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">How to Use</h3>
                    <p>
                        Once installed, simply type the following command in your terminal to enter the forge:
                    </p>
                    <CodeBlock lang="bash">kael-forge</CodeBlock>
                    
                    <div className="w-full h-px bg-forge-border my-6" />

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Troubleshooting: The Cleansing Rite</h3>
                    <p>
                        If you are having issues or want to perform a clean re-installation, use this powerful Cleansing Rite. It will safely remove the <code className="font-mono text-xs">kael-forge</code> command and undo any changes made to your shell's profile (<code className="font-mono text-xs">.bashrc</code>, <code className="font-mono text-xs">.zshrc</code>, etc.).
                    </p>
                    <CodeBlock lang="bash">
                        {fullCleansingCommand}
                    </CodeBlock>
                    <p className="text-xs italic">
                        After running this command, you can attempt the main installation incantation again on a clean slate.
                    </p>
                </div>
            </div>
        </div>
    );
};
