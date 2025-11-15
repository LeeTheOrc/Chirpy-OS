
import React from 'react';
import { CloseIcon, ComputerDesktopIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface ForgeSetupModalProps {
  onClose: () => void;
}

const FORGE_SETUP_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

echo "--- Local Forge Setup Ritual ---"
echo "This ritual will create the necessary directories and clone the repositories."
echo ""

# --- [1/4] Prerequisite Check ---
echo "--> [1/4] Checking for required familiars (git, gh)..."
if ! command -v git &> /dev/null; then
    echo "❌ ERROR: 'git' is not installed. Please install it to proceed." >&2
    exit 1
fi
if ! command -v gh &> /dev/null; then
    echo "❌ ERROR: 'gh' (GitHub CLI) is not installed. Please install it to proceed." >&2
    exit 1
fi
echo "✅ Required familiars are present."
echo ""

# --- [2/4] Authentication Check ---
echo "--> [2/4] Verifying GitHub authentication..."
if ! gh auth status &>/dev/null; then
    echo "⚠️ You are not logged into GitHub."
    echo "   Please run 'gh auth login' and follow the prompts, then re-run this ritual."
    exit 1
fi
echo "✅ Authenticated with GitHub."
echo ""

# --- [3/4] Directory Structure ---
USER_HOME=$(getent passwd "\${SUDO_USER:-\$USER}" | cut -d: -f6)
FORGE_BASE="\$USER_HOME/forge"
echo "--> [3/4] Forging the directory structure at \${FORGE_BASE}..."
mkdir -p "\$FORGE_BASE/kael"
mkdir -p "\$FORGE_BASE/repo"
mkdir -p "\$FORGE_BASE/packages"
echo "✅ Forge structure created:"
echo "    - \${FORGE_BASE}/kael (Project Source)"
echo "    - \${FORGE_BASE}/repo (Local Athenaeum/Pacman Repo)"
echo "    - \${FORGE_BASE}/packages (PKGBUILD sources)"
echo ""

# --- [4/4] Repository Cloning ---
echo "--> [4/4] Summoning the sacred texts from the cloud..."

# Clone Kael-OS project
if [ -d "\$FORGE_BASE/kael/.git" ]; then
    echo "    -> Kael-OS project already exists. Skipping clone."
else
    echo "    -> Cloning Kael-OS project into \${FORGE_BASE}/kael..."
    git clone https://github.com/LeeTheOrc/Kael-OS.git "\$FORGE_BASE/kael"
fi

# Clone kael-os-repo to get PKGBUILDs
TEMP_REPO_DIR=\$(mktemp -d)
trap 'rm -rf -- "\$TEMP_REPO_DIR"' EXIT
echo "    -> Cloning Athenaeum sources to a temporary location..."
git clone https://github.com/LeeTheOrc/kael-os-repo.git "\$TEMP_REPO_DIR"

echo "    -> Organizing PKGBUILD recipes into \${FORGE_BASE}/packages..."
# Use find to copy all PKGBUILD directories into the packages folder
find "\$TEMP_REPO_DIR" -mindepth 1 -maxdepth 1 -type d ! -name '.git' -exec cp -r {} "\$FORGE_BASE/packages/" \\;

echo ""
echo "✨ Ritual Complete! Your local forge is now set up and ready."
echo "Your next step is to run the 'Install Forge Dependencies' ritual."
`;

export const ForgeSetupModal: React.FC<ForgeSetupModalProps> = ({ onClose }) => {
    const encodedScript = btoa(unescape(encodeURIComponent(FORGE_SETUP_SCRIPT_RAW)));
    const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ComputerDesktopIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Setup Local Forge</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this is the foundational ritual. It prepares your local machine to become a true forge, capable of crafting and maintaining Kael OS artifacts.
                    </p>
                    <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                        This incantation will create the necessary directory structure (<code className="font-mono text-xs">~/forge</code>) and clone the project repositories from GitHub, preparing your workspace for the quests ahead.
                    </p>
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Prerequisites</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>The <code className="font-mono text-xs">git</code> and <code className="font-mono text-xs">gh</code> (GitHub CLI) commands must be installed.</li>
                        <li>You must be authenticated with GitHub via <code className="font-mono text-xs">gh auth login</code>.</li>
                    </ul>
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Forging Incantation</h3>
                    <p>
                        Run this single command in your terminal. It will perform all the necessary setup steps.
                    </p>
                    <CodeBlock lang="bash">{finalCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};
