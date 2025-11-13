

import React from 'react';
import { CloseIcon, CopyIcon, EyeIcon } from './Icons';

interface KhwsRitualModalProps {
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

const PREPARE_FORGE_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Allied Forge Preparation
set -euo pipefail
echo "--- Preparing Forge and Attuning Key ---"
if [ -d "$HOME/cachyos-pkgbuilds" ]; then
    echo "--> Found local CachyOS recipes. Updating..."
    git -C "$HOME/cachyos-pkgbuilds" pull
else
    echo "--> Cloning CachyOS recipes for the first time..."
    git clone https://github.com/CachyOS/cachyos-pkgbuilds.git "$HOME/cachyos-pkgbuilds"
fi
echo "--> Attuning to CachyOS artisan's signature..."
gpg --recv-key B62C3D10C54D5DA9 && gpg --lsign-key B62C3D10C54D5DA9 || echo "Key already trusted or attunement failed, but proceeding..."
echo "✅ Forge is ready."
`;

const DOWNLOAD_PREPARE_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Download & Prepare Source for khws
set -euo pipefail
PACKAGE_NAME="chwd"
PACKAGE_DIR="$HOME/cachyos-pkgbuilds/$PACKAGE_NAME"
if [ ! -d "$PACKAGE_DIR" ]; then echo "ERROR: Recipe for '$PACKAGE_NAME' not found in '$HOME/cachyos-pkgbuilds'." >&2; exit 1; fi
cd "$PACKAGE_DIR"
echo "--> Downloading sources, installing dependencies, and running prepare() for '$PACKAGE_NAME'..."
makepkg -os
echo "✅ Source is now ready for modification in '$PACKAGE_DIR/src/'"
`;

const FORGE_PUBLISH_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Forge & Publish Modified khws Source
set -euo pipefail
PACKAGE_NAME="chwd"
PACKAGE_DIR="$HOME/cachyos-pkgbuilds/$PACKAGE_NAME"
if [ ! -d "$PACKAGE_DIR" ]; then echo "ERROR: Recipe for '$PACKAGE_NAME' not found." >&2; exit 1; fi
cd "$PACKAGE_DIR"
echo "--> Finding GPG Master Key..."
SIGNING_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1 || gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
if [ -z "$SIGNING_KEY_ID" ]; then echo "ERROR: No GPG signing key found. Please run the Keystone Ritual." >&2; exit 1; fi
echo "Using key: $SIGNING_KEY_ID for signing."
echo "--> Building from modified source..."
makepkg -ef --sign --key "$SIGNING_KEY_ID" --noconfirm
PACKAGE_FILE=$(find . -name "*.pkg.tar.zst" -print -quit)
if [ -z "$PACKAGE_FILE" ]; then echo "ERROR: Build failed." >&2; exit 1; fi
REPO_DIR="$HOME/kael-os-repo"
echo "--> Moving artifact to Athenaeum..."
mv "$PACKAGE_FILE"* "$REPO_DIR/"
cd "$REPO_DIR"

# --- Intelligent Database Update ---
PKG_BASE_NAME=$(basename "$PACKAGE_FILE" .pkg.tar.zst | sed 's/-\\([0-9]\\|\\.rev\\|\\.rc\\|\\.beta\\|\\.alpha\\|\\.pre\\).*//')
echo "--> Updating Athenaeum database for '$PKG_BASE_NAME'..."
if tar -tf kael-os-repo.db.tar.gz | grep -q "^$PKG_BASE_NAME-"; then
    echo "--> Existing entry found for '$PKG_BASE_NAME'. Removing old version..."
    repo-remove kael-os-repo.db.tar.gz "$PKG_BASE_NAME"
fi
repo-add kael-os-repo.db.tar.gz "$(basename "$PACKAGE_FILE")"

echo "--> Committing and publishing..."
git add .
if git diff --staged --quiet; then
    echo "--> No changes to commit. Athenaeum is up to date."
else
    git commit -m "feat(manual-forge): Add/update package $PKG_BASE_NAME"
    git push
fi
echo "--- ✅ Ritual Complete. The artifact has been published. ---"
`;

const PUBLISH_SOURCE_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Publish Source Recipe for khws
set -euo pipefail

# --- CONFIGURATION ---
PACKAGE_NAME="khws"
ORIGIN_DIR="$HOME/cachyos-pkgbuilds/chwd" # This is where the user modified the PKGBUILD
SRC_REPO_DIR="$HOME/kael-os-repo-sources"
SRC_REPO_URL="https://github.com/LeeTheOrc/kael-os-repo.git"

# --- SCRIPT START ---
echo "--- Publishing Source Recipe for '$PACKAGE_NAME' ---"

# Step 1: Clone or update the source repository (main branch)
if [ -d "$SRC_REPO_DIR" ]; then
    echo "--> Found local source Athenaeum. Updating..."
    cd "$SRC_REPO_DIR"
    # Ensure we are on the main branch before pulling
    git checkout main
    git pull
else
    echo "--> Cloning the source Athenaeum for the first time..."
    # Clone only the main branch to save space/time
    git clone --branch main --single-branch "$SRC_REPO_URL" "$SRC_REPO_DIR"
fi

# Step 2: Copy the modified recipe and any patches
echo "--> Copying the modified recipe to the source Athenaeum..."
DEST_DIR="$SRC_REPO_DIR/$PACKAGE_NAME"
mkdir -p "$DEST_DIR"

# Copy the PKGBUILD
cp "$ORIGIN_DIR/PKGBUILD" "$DEST_DIR/"

# Copy any .patch files the user might have created
find "$ORIGIN_DIR" -maxdepth 1 -name "*.patch" -exec cp {} "$DEST_DIR/" \\;

# Step 3: Commit and push the changes
cd "$SRC_REPO_DIR"
echo "--> Committing and publishing the source recipe..."

git add .
if git diff --staged --quiet; then
    echo "--> Source recipe is already up to date. No changes to commit."
else
    git commit -m "feat(recipe): Add/update source for $PACKAGE_NAME"
    git push
fi

echo "--- ✅ Source Recipe Published Successfully ---"
echo "The PKGBUILD is now stored in the 'main' branch of the Athenaeum."
`;

const createUniversalCommand = (script: string) => {
    const encoded = btoa(unescape(encodeURIComponent(script.trim())));
    return `echo "${encoded}" | base64 --decode | bash`;
};


export const KhwsRitualModal: React.FC<KhwsRitualModalProps> = ({ onClose }) => {
    
    const prepareForgeCommand = createUniversalCommand(PREPARE_FORGE_SCRIPT_RAW);
    const downloadPrepareCommand = createUniversalCommand(DOWNLOAD_PREPARE_SCRIPT_RAW);
    const forgePublishCommand = createUniversalCommand(FORGE_PUBLISH_SCRIPT_RAW);
    const publishSourceCommand = createUniversalCommand(PUBLISH_SOURCE_SCRIPT_RAW);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <EyeIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Ritual of Insight (`khws` Manual Forge)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-6">
                    <p>
                        This is the master ritual for manually forging our test package, <strong className="text-dragon-fire">`khws`</strong>, from its origin at CachyOS. This multi-step process gives you complete control to download, modify, and then publish the artifact.
                    </p>
                    
                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 1: Prepare the Forge & Recipes</h3>
                        <p className="text-sm">
                            This one-time setup clones the CachyOS package recipes and attunes your system to their signing key.
                        </p>
                        <CodeBlock lang="bash">{prepareForgeCommand}</CodeBlock>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 2: Download & Prepare Source</h3>
                        <p className="text-sm">
                           Run this command to download the source code for <code className="font-mono text-xs">chwd</code> (the origin of `khws`).
                        </p>
                        <CodeBlock lang="bash">{downloadPrepareCommand}</CodeBlock>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 3: Modify the Source & Recipe</h3>
                        <p className="text-sm">
                            The source is now ready in <code className="font-mono text-xs bg-forge-border px-1 rounded-sm">~/cachyos-pkgbuilds/chwd/</code>. You are now the artisan. To transmute this into `khws`, you must at minimum:
                        </p>
                         <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                            <li>Edit <code className="font-mono text-xs">~/cachyos-pkgbuilds/chwd/PKGBUILD</code> to change <code className="font-mono text-xs">pkgname=chwd</code> to <code className="font-mono text-xs">pkgname=khws</code>.</li>
                            <li>Add <code className="font-mono text-xs">provides=('chwd')</code> and <code className="font-mono text-xs">conflicts=('chwd')</code> to the PKGBUILD.</li>
                            <li>(Optional) Modify the files in the <code className="font-mono text-xs">src/</code> directory to change branding from "CachyOS" to "Kael OS".</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 4: Forge & Publish the Artifact</h3>
                        <p className="text-sm">
                            Once your modifications are complete, run this final command. It will build the package from your modified source and publish it to our Athenaeum's binary repository.
                        </p>
                        <CodeBlock lang="bash">{forgePublishCommand}</CodeBlock>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-orc-steel">Step 5: Publish the Source Recipe (GPL Compliance)</h3>
                        <p className="text-sm">
                            Finally, to honor the GPL, we must publish our modified recipe. This command will clone the 'main' branch of our Athenaeum, copy your modified PKGBUILD and any patch files into it, and publish the changes.
                        </p>
                        <CodeBlock lang="bash">{publishSourceCommand}</CodeBlock>
                    </div>
                </div>
            </div>
        </div>
    );
};