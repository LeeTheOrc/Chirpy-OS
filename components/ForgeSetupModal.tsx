import React from 'react';
import { CloseIcon, HammerIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface ForgeSetupModalProps {
  onClose: () => void;
}

// This is the actual logic that sets up the forge directories and repos.
const FORGE_SETUP_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
FORGE_DIR="$HOME/forge"
FORGE_REPO_URL="https://github.com/LeeTheOrc/Kael-OS.git"
PACKAGES_REPO_URL="https://github.com/LeeTheOrc/kael-os-repo.git"

echo "--- The Forge Setup Ritual ---"
echo "This ritual will create the sacred directories and summon the source grimoires."

# --- STEP 1: Create the main forge directory ---
echo "--> [1/4] Forging the main sanctum at \${FORGE_DIR}..."
mkdir -p "\${FORGE_DIR}"
cd "\${FORGE_DIR}"
echo "✅ Main sanctum is ready."

# --- STEP 2: Clone the Forge (Kael-OS UI) repository ---
echo "--> [2/4] Summoning The Forge (Kael-OS UI)..."
if [ -d "kael" ]; then
    echo "--> 'kael' directory already exists. Ensuring it's on the 'main' branch and pulling latest changes..."
    (
        cd kael
        git fetch
        current_branch=\$(git rev-parse --abbrev-ref HEAD)
        if [ "\$current_branch" != "main" ]; then
            echo "--> Switching from '\$current_branch' to 'main' branch."
            git checkout main
        fi
        git pull origin main
    )
else
    git clone --branch main "\${FORGE_REPO_URL}" kael
fi
echo "✅ The Forge is now in '\${FORGE_DIR}/kael'."

# --- STEP 3: Clone the Athenaeum Recipe Book (packages source) ---
echo "--> [3/4] Summoning the Athenaeum Recipe Book (PKGBUILDs)..."
if [ -d "packages" ]; then
    echo "--> 'packages' directory already exists. Ensuring it's on the 'main' branch and pulling latest changes..."
    (
        cd packages
        git fetch
        current_branch=\$(git rev-parse --abbrev-ref HEAD)
        if [ "\$current_branch" != "main" ]; then
            echo "--> Switching from '\$current_branch' to 'main' branch."
            git checkout main
        fi
        git pull origin main
    )
else
    git clone --branch main "\${PACKAGES_REPO_URL}" packages
fi
echo "✅ The Athenaeum Recipe Book is now in '\${FORGE_DIR}/packages'."

# --- STEP 4: Clone the Athenaeum Armory (local pacman repo mirror) ---
echo "--> [4/4] Summoning the Athenaeum Armory (local pacman mirror)..."
if [ -d "repo" ]; then
    echo "--> Local Armory at '\${FORGE_DIR}/repo' already exists. Pulling latest artifacts..."
    (
        cd "repo"
        git fetch
        current_branch=\$(git rev-parse --abbrev-ref HEAD)
        if [ "\$current_branch" != "gh-pages" ]; then
            echo "--> Switching from '\$current_branch' to 'gh-pages' branch."
            git checkout gh-pages
        fi
        git pull origin gh-pages
    )
else
    git clone --branch gh-pages "\${PACKAGES_REPO_URL}" "repo"
fi
echo "✅ The Athenaeum Armory is now mirrored in '\${FORGE_DIR}/repo'."


echo ""
echo "✨ Ritual Complete! Your local forge is now set up."
echo "   - The Forge (UI Source):          \${FORGE_DIR}/kael"
echo "   - The Athenaeum Recipe Book:    \${FORGE_DIR}/packages"
echo "   - The Athenaeum Armory (Mirror):  \${FORGE_DIR}/repo"
`;

// This script installs the one above as an immutable command.
const INSTALLER_SCRIPT_RAW = `set -e
# Temporarily make the old script mutable if it exists, ignore error if it doesn't
sudo chattr -i /usr/local/bin/setup-local-forge 2>/dev/null || true

cat > /tmp/setup-local-forge.sh << 'EOF'
${FORGE_SETUP_SCRIPT_RAW}
EOF

chmod +x /tmp/setup-local-forge.sh
sudo mv /tmp/setup-local-forge.sh /usr/local/bin/setup-local-forge
sudo chattr +i /usr/local/bin/setup-local-forge

echo "✅ 'setup-local-forge' command has been forged and is now immutable."
echo "   You can now run it from any directory to set up or update your forge."
echo "   To update the command itself in the future, first run:"
echo "   sudo chattr -i /usr/local/bin/setup-local-forge"
`;


export const ForgeSetupModal: React.FC<ForgeSetupModalProps> = ({ onClose }) => {
    // UTF-8 safe encoding for the installer script
    const encodedInstaller = btoa(unescape(encodeURIComponent(INSTALLER_SCRIPT_RAW)));
    const finalInstallCommand = `echo "${encodedInstaller}" | base64 --decode | bash`;
    const runCommand = `setup-local-forge`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <HammerIcon className="w-5 h-5 text-orc-steel" />
                        <span>The Forge Setup Ritual</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this ritual forges an <strong className="text-orc-steel">immutable master command</strong> for establishing your local forge. This ensures the setup process is always available, consistent, and protected from accidental changes.
                    </p>
                    <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded mt-2">
                        The command will establish our three core sanctums:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong className="text-forge-text-primary">~/forge/kael:</strong> The Forge itself (UI source).</li>
                            <li><strong className="text-forge-text-primary">~/forge/packages:</strong> The Athenaeum Recipe Book (PKGBUILDs).</li>
                            <li><strong className="text-forge-text-primary">~/forge/repo:</strong> The Athenaeum Armory (Local pacman mirror).</li>
                        </ul>
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Forge the Immutable Command (One-Time Setup)</h3>
                    <p>
                        Run this incantation once. It will create the <code className="font-mono text-xs">setup-local-forge</code> command and make it immutable. If you run it again, it will safely update the command for you.
                    </p>
                    <CodeBlock lang="bash">{finalInstallCommand}</CodeBlock>

                     <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Run the Setup Ritual</h3>
                    <p>
                        Now, and anytime you wish to update your forge, simply run the globally available command:
                    </p>
                    <CodeBlock lang="bash">{runCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};
