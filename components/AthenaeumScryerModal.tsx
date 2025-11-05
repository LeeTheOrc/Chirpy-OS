

import React, { useState } from 'react';
import { CloseIcon, CopyIcon, BookOpenIcon } from './Icons';

interface AthenaeumScryerModalProps {
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

const scryerScriptBody = `
set -euo pipefail

# --- CONFIGURATION ---
TARGET_FORGE=$1
DEST_DIR="~/scried-grimoires"

# --- VALIDATION ---
if [ -z "$TARGET_FORGE" ]; then
    echo "ERROR: You must specify a forge to scry: 'garuda' or 'cachyos'"
    exit 1
fi

command -v git >/dev/null 2>&1 || { echo "ERROR: git is not installed. Run the setup command from Step 1." >&2; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "ERROR: GitHub CLI (gh) is not installed. Run the setup command from Step 1." >&2; exit 1; }
if ! gh auth status &>/dev/null; then
    echo "ERROR: You are not logged into GitHub. Run the setup command from Step 1." >&2;
    exit 1;
fi

# --- SCRIPT START ---
echo "--- Preparing the Scrying Ritual for Forge: $TARGET_FORGE ---"
EXPANDED_DEST_DIR=$(eval echo "$DEST_DIR/$TARGET_FORGE")
mkdir -p "$EXPANDED_DEST_DIR"
TEMP_DIR=$(mktemp -d)
echo "Working in temporary directory: $TEMP_DIR"
cd "$TEMP_DIR"

# --- DEFINE REPOSITORIES ---
declare -A FORGE_ORGS
FORGE_ORGS["garuda"]="garuda-linux"
FORGE_ORGS["cachyos"]="CachyOS"

# --- SCRYING ---
ORG_NAME="\${FORGE_ORGS[$TARGET_FORGE]}"
echo "--> Scrying all repositories from the '$ORG_NAME' organization..."

gh repo list "$ORG_NAME" --limit 1000 --json name --jq '.[].name' | while read -r repo_name; do
    echo "----> Cloning $ORG_NAME/$repo_name..."
    git clone --depth 1 "https://github.com/$ORG_NAME/$repo_name.git" "$repo_name" &>/dev/null || echo "Could not clone $repo_name, skipping."
done

echo "--> All repositories have been cloned. Now extracting the sacred recipes (PKGBUILDs)..."
find . -type f -name "PKGBUILD" | while read -r pkgbuild_path; do
    # Create a unique, clean path for each PKGBUILD
    repo_name=$(echo "$pkgbuild_path" | cut -d'/' -f2)
    package_name=$(dirname "$pkgbuild_path" | cut -d'/' -f3-)
    mkdir -p "$EXPANDED_DEST_DIR/$repo_name/$package_name"
    cp "$pkgbuild_path" "$EXPANDED_DEST_DIR/$repo_name/$package_name/"
done

# --- CLEANUP ---
echo "--> Cleaning up temporary artifacts..."
rm -rf "$TEMP_DIR"
echo "--- Ritual Complete. ---"
echo "All found PKGBUILDs from the $TARGET_FORGE forge have been saved to:"
echo "$EXPANDED_DEST_DIR"
`;

const fullScryerCommand = (target: 'garuda' | 'cachyos') => {
    // We pass the script to bash and use "-s --" to pass arguments to the script itself.
    const script = `
        # Kael OS - Athenaeum Scryer
        # Downloads all PKGBUILD files from a target forge for study.
        ${scryerScriptBody}
    `.trim();
    const encodedScript = btoa(script);
    return `echo "${encodedScript}" | base64 --decode | bash -s -- ${target}`;
};

export const AthenaeumScryerModal: React.FC<AthenaeumScryerModalProps> = ({ onClose }) => {
    const setupCommand = `echo "c3VkbyBwYWNtYW4gLVMgZ2l0IGdpdGh1Yi1jbGkgLS1ub25jb25maXJtICYmIGdoIGF1dGggbG9naW4=" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <BookOpenIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Athenaeum Scryer</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, to forge our own path, we must study the grimoires of other great builders. This ritual lets you download all the package recipes (<strong className="text-orc-steel">PKGBUILDs</strong>) from popular projects like Garuda Linux and CachyOS for inspiration.
                    </p>
                     <p className="text-xs italic text-forge-text-secondary/80">
                        This is permitted under the <strong className="text-dragon-fire">Open Source Covenant (GPL 3.0)</strong>, which encourages study and modification. Remember to give credit to the original artisans for their work.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Prepare Your Tools (One-Time Setup)</h3>
                    <p>Before you can scry, your Forge needs two tools: <code className="font-mono text-xs">git</code> and the <code className="font-mono text-xs">gh</code> (GitHub's command-line tool). You also need to log in to your GitHub account through the terminal. This provides a secure key to the Athenaeum.</p>
                    <p>Copy this single command and run it. It will install the tools and guide you through the GitHub login. <strong className="text-dragon-fire">You only need to do this once.</strong></p>
                    <CodeBlock lang="bash">{setupCommand}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Cast the Scrying Spell</h3>
                    <p>
                        Now, choose which forge's library you want to study. <strong className="text-dragon-fire">Copy the entire command block</strong> for your choice and paste it into your terminal. The script will do the rest, creating a <code className="font-mono text-xs">~/scried-grimoires</code> folder with all the recipes inside.
                    </p>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">To Scry Garuda Linux:</h4>
                    <CodeBlock lang="bash">{fullScryerCommand('garuda')}</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">To Scry CachyOS:</h4>
                    <CodeBlock lang="bash">{fullScryerCommand('cachyos')}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 3: Study and Adapt</h3>
                    <p>
                        The script will create a directory called <code className="font-mono text-xs">~/scried-grimoires</code> and save all the recipes inside, organized by forge. You can now browse these files, learn from them, and adapt them for our own Athenaeum. Once you have modified a recipe, you can publish it to our own repository using the <strong className="text-dragon-fire">Publisher Script</strong> from the Keystone Ritual.
                    </p>
                </div>
            </div>
        </div>
    );
};
