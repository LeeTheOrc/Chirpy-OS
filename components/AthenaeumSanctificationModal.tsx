import React from 'react';
import { CloseIcon, LibraryIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface AthenaeumSanctificationModalProps {
  onClose: () => void;
}

const SANCTIFY_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
PACKAGES_REPO_PATH="$HOME/forge/packages" # This is the main git repo for kael-os-repo
LOCAL_MIRROR_PATH="$HOME/forge/repo"   # This is the gh-pages clone

echo "--- The Athenaeum Sanctification Ritual ---"

# --- VALIDATION ---
if [[ ! -d "$PACKAGES_REPO_PATH" ]]; then
    echo "❌ ERROR: The Athenaeum Recipe Book is not found at '$PACKAGES_REPO_PATH'."
    echo "   Please run the 'setup-local-forge' ritual first."
    exit 1
fi

echo "--> [1/4] Entering the Athenaeum's source..."
cd "$PACKAGES_REPO_PATH"
# Stash any local changes to avoid checkout conflicts.
# The output is silenced as it's noisy if there's nothing to stash.
git stash >/dev/null 2>&1

echo "--> [2/4] Opening the Armory vault ('gh-pages')..."
git checkout gh-pages &>/dev/null
git pull origin gh-pages --rebase

if [[ -f "kael-os.db.tar.gz" && -f "kael-os-local.db.tar.gz" ]]; then
    echo "✅ The Athenaeum has already been fully sanctified. No action needed."
    git checkout main &>/dev/null
    # Pop stash if it exists, silencing output.
    git stash pop >/dev/null 2>&1 || true
    exit 0
fi

echo "--> [3/4] Scribing the initial empty index files for both local and remote Athenaeums..."
# Create empty tarballs for the main 'kael-os' repo.
tar -czf kael-os.db.tar.gz --files-from /dev/null
tar -czf kael-os.files.tar.gz --files-from /dev/null

# Create copies for the 'kael-os-local' repo, as pacman requires filenames to match the repo name.
cp kael-os.db.tar.gz kael-os-local.db.tar.gz
cp kael-os.files.tar.gz kael-os-local.files.tar.gz

# Create all the symlinks pacman uses.
ln -sf kael-os.db.tar.gz kael-os.db
ln -sf kael-os.files.tar.gz kael-os.files
ln -sf kael-os-local.db.tar.gz kael-os-local.db
ln -sf kael-os-local.files.tar.gz kael-os-local.files

echo "✅ Index files created."

echo "--> [4/4] Committing the sanctification rite to the remote Armory..."
git add kael-os.db.tar.gz kael-os.files.tar.gz kael-os.db kael-os.files
git add kael-os-local.db.tar.gz kael-os-local.files.tar.gz kael-os-local.db kael-os-local.files
git commit -m "chore: Sanctify Athenaeum with initial databases"
git push origin gh-pages
echo "✅ Remote Athenaeum sanctified."

echo "--> Synchronizing local mirror..."
# The mirror is a separate clone, so we must pull the changes there too.
(cd "$LOCAL_MIRROR_PATH" && git pull origin gh-pages)
echo "✅ Local Athenaeum mirror sanctified."

echo "--> Returning to the Scribe's Desk ('main')..."
git checkout main &>/dev/null
# Pop the stash back to restore any user changes
git stash pop >/dev/null 2>&1 || true

echo ""
echo "✨ Ritual Complete! The Athenaeum is now ready to receive artifacts."
`;

const INSTALLER_SCRIPT_RAW = `set -e
cat > /tmp/sanctify-athenaeum << 'EOF'
${SANCTIFY_SCRIPT_RAW}
EOF

chmod +x /tmp/sanctify-athenaeum
sudo mv /tmp/sanctify-athenaeum /usr/local/bin/sanctify-athenaeum

echo "✅ 'sanctify-athenaeum' command has been forged."
echo "   It is now globally available."
`;

export const AthenaeumSanctificationModal: React.FC<AthenaeumSanctificationModalProps> = ({ onClose }) => {
    const encodedInstaller = btoa(unescape(encodeURIComponent(INSTALLER_SCRIPT_RAW)));
    const finalInstallCommand = `echo "${encodedInstaller}" | base64 --decode | bash`;
    const runCommand = `sanctify-athenaeum`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <LibraryIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Athenaeum Sanctification</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, a newly forged Athenaeum is a place of infinite potential, but it is also an empty void. Before it can house our artifacts, we must perform this one-time ritual to give it form and substance.
                    </p>
                    <p className="text-sm p-3 bg-sky-400/10 border-l-4 border-sky-400 rounded mt-2">
                        This incantation sanctifies our remote and local repositories by creating the initial, empty database files for both <code className="font-mono text-xs">kael-os</code> and <code className="font-mono text-xs">kael-os-local</code>. This prevents <code className="font-mono text-xs">pacman</code> from reporting errors about missing databases, resolving the issues you've observed.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-sky-400 mt-4 mb-2">Step 1: Forge the Command (One-Time Setup)</h3>
                    <p>
                        Run this incantation once. It will create the global <code className="font-mono text-xs">sanctify-athenaeum</code> command.
                    </p>
                    <CodeBlock lang="bash">{finalInstallCommand}</CodeBlock>

                     <h3 className="font-semibold text-lg text-sky-400 mt-4 mb-2">Step 2: Run the Sanctification Ritual</h3>
                    <p>
                        After setting up your local forge for the first time, run this command. It only needs to be done once per repository. If you run it again, it will safely add any missing files.
                    </p>
                    <CodeBlock lang="bash">{runCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};
