import React from 'react';
import { CloseIcon, CopyIcon, FeatherIcon } from './Icons';

interface AthenaeumScribeModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => {
    const [copied, setCopied] = React.useState(false);
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

const SCRIBE_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Athenaeum Scribe Script v1
# Commits package source recipes (PKGBUILDs) to the 'main' branch.

set -euo pipefail

# --- CONFIGURATION ---
PACKAGE_NAME="$1"
PACKAGE_SOURCE_DIR="$HOME/packages/$PACKAGE_NAME"
REPO_DIR="$HOME/kael-os-repo"

# --- VALIDATION ---
if [ -z "$PACKAGE_NAME" ]; then echo "Usage: ./scribe-recipe.sh <package_name>" >&2; exit 1; fi
if [ ! -d "$PACKAGE_SOURCE_DIR" ]; then echo "ERROR: Source directory '$PACKAGE_SOURCE_DIR' not found." >&2; exit 1; fi
if [ ! -d "$REPO_DIR" ]; then echo "ERROR: Athenaeum clone '$REPO_DIR' not found. Please run the Keystone Ritual." >&2; exit 1; fi

# --- SCRIPT START ---
echo "--- Scribing the recipe for '$PACKAGE_NAME' into the Athenaeum's main branch ---"
cd "$REPO_DIR"

echo "--> Switching to 'main' branch and pulling latest changes..."
git checkout main
git pull origin main --rebase

DEST_DIR="$REPO_DIR/packages/$PACKAGE_NAME"
echo "--> Preparing destination: $DEST_DIR"
mkdir -p "$DEST_DIR"

echo "--> Copying recipe and all source files..."
# Use rsync for robust copying, excluding git/build artifacts
rsync -a --delete --exclude '.git' --exclude '*.pkg.tar.zst*' --exclude '*.log' --exclude 'src/' --exclude 'pkg/' "$PACKAGE_SOURCE_DIR/" "$DEST_DIR/"

echo "--> Committing recipe to the Athenaeum's history..."
git add .
if git diff --staged --quiet; then
    echo "--> Recipe for '$PACKAGE_NAME' is already up to date. No changes to commit."
else
    git commit -m "recipe: Add/update source for $PACKAGE_NAME"
    echo "--> Pushing recipe to the remote Athenaeum..."
    git push origin main
fi

echo ""
echo "--- ✅ The recipe has been successfully scribed. ---"
`;

const createUniversalCommand = (script: string) => {
    const encoded = btoa(unescape(encodeURIComponent(script.trim())));
    return `echo "${encoded}" | base64 --decode | bash`;
};

export const AthenaeumScribeModal: React.FC<AthenaeumScribeModalProps> = ({ onClose }) => {
    const scribeCreationScript = `
cat > ~/packages/scribe-recipe.sh << 'EOF'
${SCRIBE_SCRIPT_RAW}
EOF

chmod +x ~/packages/scribe-recipe.sh
    `.trim();

    const scribeUsageScript = `
cd ~/packages && ./scribe-recipe.sh your-package-name-here
    `.trim();

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <FeatherIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Athenaeum Scribe</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this is the sacred ritual for chronicling our package <strong className="text-orc-steel">recipes</strong>. Per Rune XIV, the Athenaeum has two vaults: one for compiled artifacts (`gh-pages`), and one for the source recipes (`main`). This ritual ensures the recipes are saved.
                    </p>
                    <p>
                        Use this rite to commit a package's `PKGBUILD` and any associated source files (like `.patch` files) to the `main` branch of our Athenaeum.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Forge the Scribe's Quill (One-Time)</h3>
                    <p>
                        This command forges the `scribe-recipe.sh` script, our quill for writing to the Athenaeum's recipe book. Run this once to place the script in your `~/packages` directory.
                    </p>
                    <CodeBlock lang="bash">{createUniversalCommand(scribeCreationScript)}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Scribe a Recipe</h3>
                    <p>
                        To record a recipe, run the script with the package's folder name. This should be done <strong className="text-dragon-fire">before</strong> you run the main `publish-package.sh` script.
                    </p>
                    <CodeBlock lang="bash">{createUniversalCommand(scribeUsageScript)}</CodeBlock>
                     <p className="text-sm mt-2">
                        This completes the workflow: first you <strong className="text-orc-steel">scribe the recipe</strong> to the `main` branch, then you <strong className="text-dragon-fire">publish the artifact</strong> to the `gh-pages` branch.
                    </p>
                </div>
            </div>
        </div>
    );
};
