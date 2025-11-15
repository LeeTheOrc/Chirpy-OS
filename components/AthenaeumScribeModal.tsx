import React from 'react';
import { CloseIcon, PackageIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface AthenaeumScribeModalProps {
  onClose: () => void;
}

const FORGE_PUBLISH_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
LOCAL_REPO_PATH="$HOME/forge/repo"
BASE_TEMP_PATH="$HOME/forge/temp"
ARCH="x86_64"

# --- HELPER FUNCTION ---
# Safely sources the PKGBUILD in a subshell to avoid polluting the main script's environment,
# then echoes the requested variable.
get_pkgbuild_var() {
    (
        # The PKGBUILDs in our repo are trusted.
        source PKGBUILD
        # Use indirect expansion to get the value of the variable name passed in.
        # This handles both string and array variables correctly.
        # For arrays, it will print the first element.
        # FIX: Escaped the dollar sign in \\\\\${...} to prevent TypeScript from treating it as a template literal interpolation.
        eval echo "\\\${$1[0]}"
    )
}

# --- VALIDATION ---
echo "--- Kael Athenaeum Scribe ---"

if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "❌ ERROR: This script must be run from within a git repository."
    exit 1
fi

if [[ ! -f "PKGBUILD" ]]; then
    echo "❌ ERROR: No PKGBUILD found in the current directory."
    exit 1
fi

# Get details from PKGBUILD
pkgname=$(get_pkgbuild_var pkgname)
pkgver=$(get_pkgbuild_var pkgver)
pkgrel=$(get_pkgbuild_var pkgrel)
pkgarch=$(get_pkgbuild_var arch)
REPO_ROOT=$(git rev-parse --show-toplevel)
PKG_DIR_NAME=$(basename "$(pwd)")
PKG_TEMP_PATH="\${BASE_TEMP_PATH}/\${pkgname}" # Package-specific temp path

echo "--> Detected Package: $pkgname (Version: $pkgver-$pkgrel)"
echo "--> Source Directory: $PKG_DIR_NAME"
echo "--> Repository Root: $REPO_ROOT"
echo "--> Local Repo Mirror: $LOCAL_REPO_PATH"
echo ""

# --- STEP 1: VERSION CHECK & AUTO-INCREMENT ---
echo "--- [1/7] Checking version against Athenaeum Armory ---"
cd "$REPO_ROOT"
git fetch origin gh-pages

# Handle 'any' architecture
if [[ "$pkgarch" == "any" ]]; then
    ARCH="any"
fi

# Construct the expected filename for the current version
EXPECTED_PKG_FILE="\${pkgname}-\${pkgver}-\${pkgrel}-\${ARCH}.pkg.tar.zst"

# Check if this exact version already exists in the remote gh-pages branch
if git ls-tree -r --name-only origin/gh-pages | grep -Fxq "$EXPECTED_PKG_FILE"; then
    echo "⚠️  Version $pkgver-$pkgrel already exists in the Armory."
    cd "$REPO_ROOT/$PKG_DIR_NAME"
    
    # Auto-increment pkgrel
    new_pkgrel=$((pkgrel + 1))
    echo "--> Automatically incrementing pkgrel to $new_pkgrel..."
    
    # Using sed to update the PKGBUILD file.
    # It looks for a line starting with optional whitespace, then 'pkgrel=' and replaces the number.
    sed -i "s/^[[:space:]]*pkgrel=.*/pkgrel=$new_pkgrel/" PKGBUILD
    
    # Update our variable for the rest of the script
    pkgrel=$new_pkgrel
    echo "✅ PKGBUILD updated. New version is $pkgver-$pkgrel."
else
    echo "--> Version $pkgver-$pkgrel is new. Proceeding."
fi
echo ""


# --- STEP 2: Scribe the Recipe (main branch) ---
echo "--- [2/7] Scribing Recipe to 'main' branch ---"
cd "$REPO_ROOT"

if [[ $(git rev-parse --abbrev-ref HEAD) != "main" ]]; then
    echo "--> Switching to 'main' branch..."
    git checkout main &>/dev/null
fi
git pull origin main --rebase

echo "--> Committing and pushing recipe for '$pkgname'..."
git add "$PKG_DIR_NAME"
if [[ -n $(git status --porcelain "$PKG_DIR_NAME") ]]; then
    git commit -m "feat: Add/update PKGBUILD for $pkgname ($pkgver-$pkgrel)"
    git push origin main
    echo "✅ Recipe for '$pkgname' updated on 'main' branch."
else
    echo "--> No changes detected for '$pkgname' recipe. Skipping commit."
fi
echo ""


# --- STEP 3: Forge the Artifact ---
echo "--- [3/7] Forging Artifact ---"
cd "$REPO_ROOT/$PKG_DIR_NAME"

echo "--> Forging the package with 'makepkg'. This may ask for your sudo password to install dependencies."
rm -f *.pkg.tar.zst
# makepkg will use the (potentially updated) PKGBUILD
makepkg -scf --noconfirm
# Get the generated package file name. Should only be one.
PKG_FILE=$(ls *.pkg.tar.zst)
if [[ -z "$PKG_FILE" || ! -f "$PKG_FILE" ]]; then
    echo "❌ ERROR: Failed to forge the artifact. Check makepkg output."
    # Revert PKGBUILD change if we bumped it
    git checkout -- PKGBUILD
    exit 1
fi
echo "✅ Artifact '$PKG_FILE' forged."
echo ""

# --- STEP 4: Stage and Clean ---
echo "--- [4/7] Staging Artifact and Cleaning Forge ---"
echo "--> Creating unique sanctum and staging artifact at '$PKG_TEMP_PATH'..."
# Clean up any potential leftovers from a previous failed run for this package
rm -rf "\${PKG_TEMP_PATH}"
mkdir -p "\${PKG_TEMP_PATH}"
mv "$PKG_FILE" "\${PKG_TEMP_PATH}/"
echo "✅ Artifact staged."

echo "--> Cleaning up build artifacts from source directory..."
git clean -fdx
echo "✅ Forge is clean."
echo ""

# --- STEP 5: Archive in Remote Armory (gh-pages) ---
echo "--- [5/7] Archiving in Remote Armory ('gh-pages') ---"
cd "$REPO_ROOT"

echo "--> Switching to 'gh-pages' branch and updating..."
git checkout gh-pages &>/dev/null
git pull origin gh-pages --rebase

echo "--> Copying '$PKG_FILE' from sanctum to the Armory..."
cp "\${PKG_TEMP_PATH}/\${PKG_FILE}" .

echo "--> Updating the Athenaeum's indices..."
repo-add kael-os.db.tar.gz "$PKG_FILE"
repo-add kael-os-local.db.tar.gz "$PKG_FILE"

echo "--> Committing and pushing artifact to the 'gh-pages' branch..."
git add .
git commit -m "build: Add $PKG_FILE"
git push origin gh-pages
echo "✅ Artifact archived in remote 'gh-pages' branch."
echo ""

# --- STEP 6: Mirror to Local Armory ---
echo "--- [6/7] Mirroring to Local Armory ---"
echo "--> Synchronizing local repository at '$LOCAL_REPO_PATH'..."
(cd "$LOCAL_REPO_PATH" && git pull origin gh-pages --rebase)
echo "✅ Local Armory synchronized."
echo ""

# --- STEP 7: Purge Sanctum & Return to Scribe's Desk ---
echo "--- [7/7] Purging Sanctum & Returning to Scribe's Desk ---"
echo "--> Purging temporary sanctum at '$PKG_TEMP_PATH'..."
rm -rf "\${PKG_TEMP_PATH}"
echo "✅ Sanctum purged."

git checkout main &>/dev/null

echo "✨ Ritual complete! The package '$pkgname' has been fully published and mirrored."
`;

const SETUP_COMMAND_RAW = `set -e
cat > /tmp/forge-and-publish << 'EOF'
${FORGE_PUBLISH_SCRIPT_RAW}
EOF

chmod +x /tmp/forge-and-publish
sudo mv /tmp/forge-and-publish /usr/local/bin/forge-and-publish

echo "✅ 'forge-and-publish' command has been forged."
echo "   It is globally available from any directory."
`;

const WORKFLOW_STEPS = [
    "cd kael-os-repo",
    "mkdir my-new-package",
    "# Add your PKGBUILD and source files to the 'my-new-package' directory.",
    "cd my-new-package",
    "forge-and-publish"
].join('\n');

export const AthenaeumScribeModal: React.FC<AthenaeumScribeModalProps> = ({ onClose }) => {
    // UTF-8 safe encoding
    const encodedScript = btoa(unescape(encodeURIComponent(SETUP_COMMAND_RAW)));
    const finalSetupCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <PackageIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Athenaeum Scribe's Grimoire</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This grimoire contains the sacred rituals for forging new artifacts (packages). We will forge a master tool that automates the entire process of building, staging, publishing to the Athenaeum, and mirroring to your local repository.
                    </p>
                     <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                        <strong className="text-orc-steel">Update:</strong> This familiar now forges each artifact in a unique temporary sanctum (<code className="font-mono text-xs">~/forge/temp/package-name</code>). This sanctum is automatically purged upon a successful ritual, leaving a clean forge. If the ritual is interrupted, the sanctum remains, providing a clear sign of which artifact's forging failed. The familiar also automatically increments package revisions to prevent conflicts.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Ritual I: Forging the Master Tool (One-Time Setup)</h3>
                    <p>
                        This incantation forges the <code className="font-mono text-xs">forge-and-publish</code> familiar and places it in your system's path, making it globally available.
                    </p>
                    <CodeBlock lang="bash">{finalSetupCommand}</CodeBlock>
                   
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Ritual II: The Scribing Workflow</h3>
                     <p>
                        Once the master tool is forged, this is your new workflow for every package you wish to create or update.
                    </p>
                     <CodeBlock lang="bash">{WORKFLOW_STEPS}</CodeBlock>
                     <p>
                        Simply run <code className="font-mono text-xs">forge-and-publish</code> from inside the package's directory. The familiar will handle the rest.
                     </p>
                </div>
            </div>
        </div>
    );
};
