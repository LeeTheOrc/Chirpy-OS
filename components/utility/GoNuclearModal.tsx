
import React from 'react';
import { CloseIcon, FlameIcon } from '../core/Icons';
import { CodeBlock } from '../core/CodeBlock';

interface GoNuclearModalProps {
  onClose: () => void;
}

const GO_NUCLEAR_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
# Assumes the forge is set up at ~/forge/kael
USER_HOME=$(getent passwd "\${SUDO_USER:-\$USER}" | cut -d: -f6)
COMPONENTS_DIR="\$USER_HOME/forge/kael/components"

echo "--- The Rite of Annihilation ---"
echo "WARNING: This will permanently delete all non-archived components."

if [[ ! -d "\$COMPONENTS_DIR" ]]; then
    echo "❌ ERROR: Components directory not found at '\$COMPONENTS_DIR'."
    echo "   Have you run the 'setup-local-forge' ritual?"
    exit 1
fi

cd "\$COMPONENTS_DIR"

echo "The following items will be PERMANENTLY DELETED:"
# Use find to list items, excluding specified files/dirs and '.'
find . -mindepth 1 -maxdepth 1 \\
    ! -name 'done' \\
    ! -name 'GoNuclearModal.tsx' \\
    ! -name 'Icons.tsx' \\
    ! -name 'CodeBlock.tsx' \\
    ! -name 'FormattedContent.tsx' | sed 's|^./|  - |'

echo ""
read -p "Are you absolutely sure you want to proceed? This cannot be undone. (y/N) " -n 1 -r
echo
if [[ ! \$REPLY =~ ^[Yy]$ ]]; then
    echo "Annihilation aborted. The forge remains intact."
    exit 0
fi

echo "--> Commencing annihilation..."
# The actual deletion command
find . -mindepth 1 -maxdepth 1 \\
    ! -name 'done' \\
    ! -name 'GoNuclearModal.tsx' \\
    ! -name 'Icons.tsx' \\
    ! -name 'CodeBlock.tsx' \\
    ! -name 'FormattedContent.tsx' -exec rm -rf {} +

echo "✅ Annihilation complete. The forge has been purified."
`;

const INSTALLER_SCRIPT_RAW = `set -e
cat > /tmp/go-nuclear << 'EOF'
${GO_NUCLEAR_SCRIPT_RAW}
EOF

chmod +x /tmp/go-nuclear
sudo mv /tmp/go-nuclear /usr/local/bin/go-nuclear

echo "✅ 'go-nuclear' command has been forged."
echo "   It is now globally available."
`;

export const GoNuclearModal: React.FC<GoNuclearModalProps> = ({ onClose }) => {
    const encodedInstaller = btoa(unescape(encodeURIComponent(INSTALLER_SCRIPT_RAW)));
    const finalInstallCommand = `echo "${encodedInstaller}" | base64 --decode | bash`;
    const runCommand = `go-nuclear`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <FlameIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Rite of Annihilation (Go Nuclear)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p className="text-lg text-dragon-fire">
                        <strong className="font-bold">EXTREME CAUTION ADVISED, ARCHITECT.</strong>
                    </p>
                    <p>
                        This is our failsafe. When enchantments conflict and the forge becomes unstable, this ritual will purify it with fire. It is a destructive act, but sometimes necessary for a fresh start.
                    </p>
                    <p className="text-sm p-3 bg-dragon-fire/10 border-l-4 border-dragon-fire rounded mt-2">
                        This incantation will permanently delete all components except:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>The <code className="font-mono text-xs">done/</code> directory (our completed works).</li>
                            <li>Shared components (<code className="font-mono text-xs">Icons.tsx</code>, <code className="font-mono text-xs">CodeBlock.tsx</code>, etc.).</li>
                            <li>This grimoire (<code className="font-mono text-xs">GoNuclearModal.tsx</code>).</li>
                        </ul>
                    </p>
                    
                    <h3 className="font-semibold text-lg text-dragon-fire mt-4 mb-2">Step 1: Forge the Command (One-Time Setup)</h3>
                    <p>
                        Run this incantation once to create the global <code className="font-mono text-xs">go-nuclear</code> command.
                    </p>
                    <CodeBlock lang="bash">{finalInstallCommand}</CodeBlock>

                     <h3 className="font-semibold text-lg text-dragon-fire mt-4 mb-2">Step 2: Unleash the Cleansing Fire</h3>
                    <p>
                        When you are ready to reset the forge, run this command. You will be asked for final confirmation.
                    </p>
                    <CodeBlock lang="bash">{runCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};
