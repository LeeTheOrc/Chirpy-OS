import React, { useState } from 'react';
import { CloseIcon, CopyIcon, ShieldCheckIcon } from './Icons';

interface AthenaeumVerifierModalProps {
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

const VERIFIER_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Athenaeum Verifier Ritual v2
set -eu
clear
echo "--- Athenaeum Verifier Ritual ---"
REPO_URL="https://leetheorc.github.io/kael-os-repo"
LIVE_DB_FILE=$(mktemp)
trap 'rm -f "$LIVE_DB_FILE"' EXIT
echo "--> Scrying the live Athenaeum from the cloud..."
if curl -sLf "$REPO_URL/kael-os-repo.db.tar.gz" -o "$LIVE_DB_FILE"; then
    echo "✅ Live database downloaded."
    echo ""
    echo "--- Contents of LIVE Athenaeum Database ---"
    # Correctly list directory entries which represent packages
    bsdtar -tf "$LIVE_DB_FILE" | grep '/$' | sed 's|/||' | sort
    echo "-------------------------------------------"
else
    echo "❌ ERROR: Could not download the live repository database from $REPO_URL."
    echo "This could mean GitHub Pages is down, the URL is incorrect, or the repo is empty."
    exit 1
fi
echo ""
echo "--> Scrying your local forge's Athenaeum clone..."
LOCAL_REPO_DIR="$HOME/kael-os-repo"
if [ -d "$LOCAL_REPO_DIR" ]; then
    cd "$LOCAL_REPO_DIR"
    (git stash push -m "verifier-stash" >/dev/null) || true
    if git checkout gh-pages &>/dev/null; then
        echo "Switched to gh-pages branch."
        git pull origin gh-pages --rebase
        LOCAL_DB_FILE="$LOCAL_REPO_DIR/kael-os-repo.db.tar.gz"
        if [ -f "$LOCAL_DB_FILE" ]; then
            echo ""
            echo "--- Contents of LOCAL Athenaeum Database ---"
            # Correctly list directory entries which represent packages
            bsdtar -tf "$LOCAL_DB_FILE" | grep '/$' | sed 's|/||' | sort
            echo "------------------------------------------"
        else
            echo "❌ WARNING: Local database file not found on gh-pages branch."
        fi
        git checkout main &>/dev/null
    else
        echo "❌ WARNING: Could not switch to gh-pages branch. Does it exist locally?"
    fi
    (git stash pop >/dev/null 2>&1) || true
else
    echo "❌ WARNING: Local Athenaeum clone not found at $LOCAL_REPO_DIR."
fi
echo ""
echo "--- Oracle's Insight ---"
echo "Compare the 'LIVE' and 'LOCAL' lists."
echo "  - If a package is in LOCAL but not LIVE: You need to 'git push' from the 'gh-pages' branch in '$LOCAL_REPO_DIR'."
echo "  - If a package is missing from both: You need to run the Publishing Rite for that package again."
echo "  - If the lists match but pacman fails: The issue may be with your client system's cache or network. Try the Athenaeum Attunement ritual again."
echo ""
echo "✅ Verification Complete."
`;

export const AthenaeumVerifierModal: React.FC<AthenaeumVerifierModalProps> = ({ onClose }) => {
    const encodedScript = btoa(unescape(encodeURIComponent(VERIFIER_SCRIPT_RAW.trim())));
    const fullCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ShieldCheckIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Athenaeum Verifier</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, if packages are not found after publishing, it's likely a desynchronization between your local forge and the public Athenaeum. This ritual will help us scry the truth.
                    </p>
                    <p>
                        This unified incantation will:
                    </p>
                     <ul className="list-decimal list-inside text-sm pl-4 space-y-1">
                        <li>Download the <strong className="text-orc-steel">LIVE</strong> repository database from the web.</li>
                        <li>Inspect your <strong className="text-magic-purple">LOCAL</strong> repository database from your forge machine.</li>
                        <li>Display a comparison of the package lists and provide guidance.</li>
                    </ul>
                    <p>
                        Run this single command in your terminal to begin the verification.
                    </p>
                    <CodeBlock lang="bash">{fullCommand}</CodeBlock>
                    <p>Based on the output, you will know whether you need to push your changes or re-run the publishing rite for a specific package.</p>
                </div>
            </div>
        </div>
    );
};