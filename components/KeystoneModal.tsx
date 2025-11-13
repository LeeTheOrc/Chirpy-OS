
import React, { useState } from 'react';
import { CloseIcon, CopyIcon, KeyIcon } from './Icons';

interface KeystoneModalProps {
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

const INITIAL_SETUP_SCRIPT_RAW = `
set -e
# This script installs tools, configures Git, and logs into GitHub.

echo "--> Installing essential forging tools..."
sudo pacman -S git github-cli base-devel pacman-contrib --noconfirm

echo "--> Configuring Git with your identity. You can change these later."
# IMPORTANT: Configure Git with your identity to prevent commit errors.
git config --global user.name "LeeTheOrc"
git config --global user.email "leetheorc@gmail.com"

echo "--> Authenticating with GitHub..."
# This will open a browser for you to log in.
gh auth login

echo "[SUCCESS] Initial setup complete. You are now authenticated."
`;

const REPO_SETUP_SCRIPT_RAW = `
set -e
# This script clones or updates the Athenaeum repository and prepares the branches.

# --- CWD Safety ---
ORIGINAL_CWD=$(pwd -P)
# Ensure we return to a safe directory on exit, error, or interrupt
trap 'cd "$ORIGINAL_CWD" || cd "$HOME"' EXIT

# Clone or update the Athenaeum repository
if [ -d "$HOME/kael-os-repo" ]; then
    echo "--> Athenaeum found locally. Updating and resetting..."
    cd "$HOME/kael-os-repo"
    # Fetch latest changes from remote and ensure we are on main
    git fetch origin
    git checkout main
    # Force reset to origin/main to discard any local changes and prevent errors
    git reset --hard origin/main
    git pull origin main
else
    echo "--> Cloning the Athenaeum for the first time..."
    # cd to home first to ensure clone happens there
    cd "$HOME"
    git clone https://github.com/LeeTheOrc/kael-os-repo.git
    cd "$HOME/kael-os-repo"
fi

# Set up the gh-pages branch for publishing artifacts
echo "--> Configuring the 'gh-pages' branch for publishing..."

# Unconditionally delete any stale local gh-pages branch to ensure a clean state
git branch -D gh-pages 2>/dev/null || true

# Attempt to switch to the remote-tracking branch. If it fails, create it.
if git checkout -t origin/gh-pages 2>/dev/null; then
    echo "--> Switched to existing remote 'gh-pages' branch and pulled latest changes."
    git pull origin gh-pages
else
    echo "--> 'gh-pages' branch not found remotely. Creating a new orphan branch..."
    git checkout --orphan gh-pages
    git rm -rf .
    echo "# Kael OS Athenaeum - Binary Artifacts" > README.md
    git add README.md
    git commit -m "initial: Create gh-pages branch for artifacts"
    git push --set-upstream origin gh-pages
fi

# Switch back to main to be in a clean state for recipe management
echo "--> Returning to 'main' branch for recipe management."
git checkout main

echo "[SUCCESS] Local Athenaeum clone is prepared and up to date."
`;


const KEY_AND_RECIPE_SCRIPT_RAW = `
set -e
# This script finds or creates a GPG key and forges foundational recipes.

echo "--> Searching for the 'Kael OS Master Key'..."
# Attempt to find the specific key by its name
GPG_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)

# If the specific key is not found, try to find the first available secret key.
if [ -z "$GPG_KEY_ID" ]; then
    echo "--> Specific 'Kael OS Master Key' not found. Searching for any available key..."
    GPG_KEY_ID=$(gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)

    if [ ! -z "$GPG_KEY_ID" ]; then
        KEY_INFO=$(gpg --list-secret-keys "$GPG_KEY_ID" | grep 'uid')
        echo ""
        echo "[ATTENTION] Using the first available GPG key found on your system:"
        echo "    Key ID: $GPG_KEY_ID"
        echo "    Owner: $KEY_INFO"
        echo "    This key will be used for signing. If this is not the correct key, please cancel and manage your GPG keys."
        echo ""
    fi
fi

# If still no key ID, then no keys exist. Proceed to creation.
if [ -z "$GPG_KEY_ID" ]; then
    echo "--> No GPG keys found on your system. Let us forge one now."
    echo "    Please follow the prompts with these values:"
    echo "    -> Kind of key: (1) RSA and RSA"
    echo "    -> Keysize: 4096"
    echo "    -> Expires: 0 (does not expire)"
    echo "    -> Real name: Kael OS Master Key"
    echo "    -> Email address: leetheorc@gmail.com"
    echo "    -> And a secure passphrase you can remember!"
    
    gpg --full-generate-key

    # Re-fetch the key ID after creation.
    GPG_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
    
    if [ -z "$GPG_KEY_ID" ]; then
        echo "ERROR: Key creation failed or name does not exactly match 'Kael OS Master Key'."
        echo "Please check your GPG setup and try again."
        exit 1
    fi
    echo "[SUCCESS] Master Key forged successfully! Key ID: $GPG_KEY_ID"

else
    echo "[SUCCESS] Found and will use GPG Key ID: $GPG_KEY_ID"
fi

# Export the public key
echo "--> Exporting public key..."
gpg --armor --export "$GPG_KEY_ID" > ~/kael-os.asc

# Create the keyring package structure and recipe (PKGBUILD)
echo "--> Forging recipe for kael-keyring..."
mkdir -p ~/packages/kael-keyring
mv ~/kael-os.asc ~/packages/kael-keyring/
cat > ~/packages/kael-keyring/PKGBUILD << 'PKGBUILD_EOF'
# Maintainer: The Architect <leetheorc@gmail.com>
pkgname=kael-keyring
pkgver=1
pkgrel=1
pkgdesc="Kael OS Master Keyring"
arch=('any')
license=('GPL')
source=('kael-os.asc')
sha256sums=('SKIP')

package() {
    install -Dm644 "$srcdir/kael-os.asc" "$pkgdir/usr/share/pacman/keyrings/kael-os.gpg"
}
PKGBUILD_EOF

# Create the pacman-conf package structure and recipe
echo "--> Forging recipe for kael-pacman-conf..."
mkdir -p ~/packages/kael-pacman-conf
cat > ~/packages/kael-pacman-conf/kael-os.conf << 'CONF_EOF'
[kael-os]
SigLevel = Optional TrustAll
Server = https://leetheorc.github.io/kael-os-repo/
CONF_EOF

cat > ~/packages/kael-pacman-conf/PKGBUILD << 'PKGBUILD_EOF'
# Maintainer: The Architect <leetheorc@gmail.com>
pkgname=kael-pacman-conf
pkgver=1
pkgrel=1
pkgdesc="Pacman configuration for the Kael OS repository"
arch=('any')
license=('GPL')
source=('kael-os.conf')
sha256sums=('SKIP')

package() {
    install -Dm644 "$srcdir/kael-os.conf" "$pkgdir/etc/pacman.d/kael-os.conf"
}
PKGBUILD_EOF

echo ""
echo "[SUCCESS] Foundational recipes have been forged in ~/packages/"
`;

const PUBLISH_FOUNDATION_SCRIPT_RAW = `
set -e

# --- CWD Safety ---
ORIGINAL_CWD=$(pwd -P)
# Ensure we return to a safe directory on exit, error, or interrupt
trap 'cd "$ORIGINAL_CWD" || cd "$HOME"' EXIT

# Find your Master Key ID to use for signing
echo "--> Searching for GPG key for signing..."
GPG_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
if [ -z "$GPG_KEY_ID" ]; then
    echo "--> 'Kael OS Master Key' not found. Using first available secret key."
    GPG_KEY_ID=$(gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
fi
if [ -z "$GPG_KEY_ID" ]; then
    echo "ERROR: Could not find any GPG secret key for signing. Aborting."
    exit 1
fi
echo "[SUCCESS] Using Master Key: $GPG_KEY_ID for signing."

# Build the packages first
echo "--> Building kael-keyring..."
cd "$HOME/packages/kael-keyring"
makepkg -sf --sign --key "$GPG_KEY_ID" --noconfirm --skippgpcheck
KEYRING_PKG_FILE_PATH=$(makepkg --packagelist | head -n 1)

echo "--> Building kael-pacman-conf..."
cd "$HOME/packages/kael-pacman-conf"
makepkg -sf --sign --key "$GPG_KEY_ID" --noconfirm --skippgpcheck
CONF_PKG_FILE_PATH=$(makepkg --packagelist | head -n 1)

# Navigate to the repository and handle publishing
echo "--> Committing new artifacts to the Athenaeum..."
cd "$HOME/kael-os-repo"

echo "--> Switching to gh-pages branch for publishing..."
git checkout gh-pages
git pull origin gh-pages --rebase

# Now, copy the artifacts into the gh-pages branch working directory
echo "--> Placing forged artifacts into the Athenaeum..."
mv "$KEYRING_PKG_FILE_PATH"* .
mv "$CONF_PKG_FILE_PATH"* .
cp "$HOME/packages/kael-keyring/kael-os.asc" .

# Remove old entries before adding to prevent duplicates after re-building
PACKAGES_TO_UPDATE=("kael-keyring" "kael-pacman-conf")
for pkg_name in "\${PACKAGES_TO_UPDATE[@]}"; do
    if tar -tf kael-os-repo.db.tar.gz | grep -q "^$pkg_name-"; then
        echo "--> Removing old entry for '$pkg_name'..."
        repo-remove kael-os-repo.db.tar.gz "$pkg_name"
    fi
done
# Use the basename of the absolute paths for repo-add
repo-add kael-os-repo.db.tar.gz "$(basename "$KEYRING_PKG_FILE_PATH")" "$(basename "$CONF_PKG_FILE_PATH")"

# Create a hard copy of the database for pacman compatibility with GitHub Pages
echo "--> Creating pacman DB copy for compatibility..."
cp kael-os-repo.db.tar.gz kael-os-repo.db

git add .

if git diff --staged --quiet; then
    echo "--> No new artifacts to commit. Athenaeum is up to date."
else
    git commit -m "feat: Establish/update Athenaeum foundation"
    git push origin gh-pages
fi

echo "--> Returning to main branch..."
git checkout main

echo ""
echo "[SUCCESS] Foundation laid. The Athenaeum is now live."
`;

const PUBLISHER_SCRIPT_RAW = `#!/bin/bash
# Kael OS - Athenaeum Publisher Script (v15 - Cleansing Rite)
# Forges a package, signs it, and publishes it. Optionally includes dependencies.

set -euo pipefail

# --- CWD Safety ---
ORIGINAL_CWD=$(pwd -P)
# Ensure we return to a safe directory on exit, error, or interrupt
trap 'cd "$ORIGINAL_CWD" || cd "$HOME"' EXIT

# --- PRE-FLIGHT CHECKS ---
if ! command -v git &> /dev/null; then echo "ERROR: 'git' is not installed..." >&2; exit 1; fi
if ! command -v gh &> /dev/null; then echo "ERROR: GitHub CLI 'gh' is not installed..." >&2; exit 1; fi
if ! gh auth status &>/dev/null; then echo "ERROR: You are not authenticated with GitHub..." >&2; exit 1; fi
if ! command -v repo-add &> /dev/null; then echo "ERROR: 'repo-add' is not installed..." >&2; exit 1; fi

# --- CONFIGURATION & ARGUMENT PARSING ---
REPO_DIR="$HOME/kael-os-repo"
SCRIPT_DIR=$( cd -- "$( dirname -- "\${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
WITH_DEPS=false
PACKAGE_NAME=""

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --with-deps) WITH_DEPS=true; shift ;;
        *) if [ -z "$PACKAGE_NAME" ]; then PACKAGE_NAME="$1"; fi; shift ;;
    esac
done

# --- SCRIPT START ---
echo "--- Preparing the Forge for package: $PACKAGE_NAME ---"

# --- VALIDATION ---
if [ -z "$PACKAGE_NAME" ]; then echo "Usage: ./publish-package.sh [--with-deps] <package_name>" >&2; exit 1; fi
PACKAGE_DIR_ABS="$SCRIPT_DIR/$PACKAGE_NAME"
if [ ! -d "$PACKAGE_DIR_ABS" ] || [ ! -f "$PACKAGE_DIR_ABS/PKGBUILD" ]; then echo "ERROR: Directory '$PACKAGE_DIR_ABS' does not exist or does not contain a PKGBUILD." >&2; exit 1; fi

# --- AUTO-SIGNING LOGIC ---
echo "--> Searching for GPG key for signing..."
SIGNING_KEY_ID=$(gpg --list-secret-keys --with-colons "Kael OS Master Key" 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
if [ -z "$SIGNING_KEY_ID" ]; then
    echo "--> 'Kael OS Master Key' not found. Using first available secret key."
    SIGNING_KEY_ID=$(gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '$1 == "sec" { print $5 }' | head -n 1)
fi
if [ -z "$SIGNING_KEY_ID" ]; then echo "ERROR: Could not find any GPG secret key for signing." >&2; exit 1; fi
echo "[SUCCESS] Using Master Key: $SIGNING_KEY_ID for signing."

# --- FORGING ---
echo "--> Entering the forge for package: $PACKAGE_NAME..."
cd "$PACKAGE_DIR_ABS"
echo "--> Forging and signing the package (makepkg)..."
makepkg -sf --sign --key "$SIGNING_KEY_ID" --noconfirm

# Use --packagelist to get the absolute path to the created package file.
PACKAGE_FILE_PATH=$(makepkg --packagelist | head -n 1)
if [ -z "$PACKAGE_FILE_PATH" ] || [ ! -f "$PACKAGE_FILE_PATH" ]; then
    echo "ERROR: Build failed or could not find created package file." >&2
    exit 1
fi
echo "--> Forged artifact at: $PACKAGE_FILE_PATH"

# --- PUBLISHING ---
echo "--> Entering the Athenaeum: $REPO_DIR"
if [ ! -d "$REPO_DIR" ]; then echo "ERROR: Athenaeum directory '$REPO_DIR' not found." >&2; exit 1; fi
cd "$REPO_DIR"
echo "--> Switching to gh-pages branch for publishing..."
git checkout gh-pages

echo "--> Performing a Cleansing Rite to synchronize with the remote Athenaeum..."
git fetch origin gh-pages
git reset --hard origin/gh-pages

echo "--> Moving forged artifact into the Athenaeum..."
mv "$PACKAGE_FILE_PATH"* . # The glob '*' handles the associated .sig file

FILES_TO_ADD_TO_DB=()
FILES_TO_ADD_TO_DB+=("$(basename "$PACKAGE_FILE_PATH")")

# --- DEPENDENCY HOARDING (Optional) ---
if [ "$WITH_DEPS" = true ]; then
    echo "--> Initiating the Dependency Hoarding Rite..."
    # cd back to the package directory to correctly source the PKGBUILD
    cd "$PACKAGE_DIR_ABS"
    source <(sed '/^\\s*\\(#\\|$\\)/d' PKGBUILD)
    ALL_DEPS=()
    if declare -p depends &>/dev/null && [ \${#depends[@]} -gt 0 ]; then ALL_DEPS+=("\${depends[@]}"); fi
    if declare -p makedepends &>/dev/null && [ \${#makedepends[@]} -gt 0 ]; then ALL_DEPS+=("\${makedepends[@]}"); fi
    HOARDED_DEPS=()
    echo "--> Searching pacman cache for dependencies..."
    for dep in "\${ALL_DEPS[@]}"; do
        dep_name=$(echo "$dep" | sed -e 's/[<>=!].*//')
        dep_file=$(find /var/cache/pacman/pkg/ -name "$dep_name-*.pkg.tar.zst" | sort -V | tail -n 1)
        if [ -n "$dep_file" ]; then
            dep_filename=$(basename "$dep_file")
            if [ ! -f "$REPO_DIR/$dep_filename" ]; then
                echo "--> Hoarding: $dep_filename"
                cp "$dep_file" "$REPO_DIR/"
                HOARDED_DEPS+=("$dep_filename")
            else
                echo "--> Dependency '$dep_filename' already in Athenaeum. Skipping."
            fi
        else
            echo "--> NOTE: Dependency '$dep_name' not found in cache. It might be a base package, in a group, or already installed."
        fi
    done
    # Return to the repo directory for the final steps
    cd "$REPO_DIR"
    if [ \${#HOARDED_DEPS[@]} -gt 0 ]; then
        echo "--> Hoarded \${#HOARDED_DEPS[@]} new dependency artifacts."
        FILES_TO_ADD_TO_DB+=("\${HOARDED_DEPS[@]}")
    else
        echo "--> No new dependencies were hoarded from the cache."
    fi
fi

# --- Intelligent Database Update ---
echo "--> Updating Athenaeum database for '$PACKAGE_NAME'..."
if tar -tf kael-os-repo.db.tar.gz | grep -q "^$PACKAGE_NAME-"; then
    echo "--> Existing entry found for '$PACKAGE_NAME'. Removing old version..."
    repo-remove kael-os-repo.db.tar.gz "$PACKAGE_NAME"
fi
echo "--> Adding new artifact(s) to the database..."
repo-add kael-os-repo.db.tar.gz "\${FILES_TO_ADD_TO_DB[@]}"

# Create a hard copy of the database for pacman compatibility with GitHub Pages
echo "--> Creating pacman DB copy for compatibility..."
cp kael-os-repo.db.tar.gz kael-os-repo.db

# --- GIT ---
echo "--> Committing the new artifact to the Athenaeum's history..."
git add .
if git diff --staged --quiet; then
    echo "--> No changes detected. Skipping commit and push."
else
    git commit -m "feat: Add/update package $PACKAGE_NAME"
    git push origin gh-pages
fi
echo "--> Returning to main branch..."
git checkout main
echo "--- The artifact has been successfully published to the Athenaeum. ---"
`;

// Helper to create a shell-agnostic command
const createUniversalCommand = (script: string) => {
    // UTF-8 safe encoding
    const encoded = btoa(unescape(encodeURIComponent(script.trim())));
    return `echo "${encoded}" | base64 --decode | bash`;
};

export const KeystoneModal: React.FC<KeystoneModalProps> = ({ onClose }) => {
    const publisherCreationScript = `
cat > ~/packages/publish-package.sh << 'EOF'
${PUBLISHER_SCRIPT_RAW}
EOF

chmod +x ~/packages/publish-package.sh
    `.trim();

    const publishArtifactScript = `
        cd ~/packages && ./publish-package.sh your-package-name-here
    `.trim();

    const publishWithDepsScript = `
        cd ~/packages && ./publish-package.sh --with-deps your-package-name-here
    `.trim();


    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <KeyIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Keystone Rituals: Forging the Athenaeum</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this is the master grimoire for our <strong className="text-dragon-fire">Athenaeum</strong>—our sovereign package repository. These rituals establish the foundation of trust for every package we forge. We will create our unique signature, build the repository's foundation, and then learn the rite for publishing all future artifacts.
                    </p>

                     <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Part 0: The Cleansing Rite (Optional Reset)</h3>
                    <p>If a mistake was made during the rituals, you can perform this Cleansing Rite to reset your forge and start over. This is useful if you used the wrong key or a step failed.</p>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Soft Reset (Recommended)</h4>
                    <p>This is the safest way to reset. It removes the temporary files and package recipes we created, but <strong className="text-dragon-fire">leaves your GPG keys untouched</strong>. After running this, you can start again from Part I, Step 2.</p>
                    <CodeBlock lang="bash">{createUniversalCommand('rm -rf ~/packages ~/kael-os.asc')}</CodeBlock>

                    <details className="bg-forge-panel/30 rounded-lg p-3 border border-forge-border/50">
                        <summary className="cursor-pointer font-semibold text-forge-text-primary">Advanced: Hard Reset (Use with Caution)</summary>
                        <div className="mt-3 space-y-3">
                            <p className="text-red-400">This ritual will <strong className="font-bold">permanently delete the "Kael OS Master Key" from your system</strong>. This action cannot be undone. Only do this if you are certain you want to destroy the key and create a new one from scratch.</p>
                            <h5 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step A: Find the Key ID</h5>
                            <CodeBlock lang="bash">{`gpg --list-secret-keys "Kael OS Master Key"`}</CodeBlock>
                            <h5 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step B: Delete the Key</h5>
                            <p>Replace <code className="font-mono text-xs">&lt;KEY_ID&gt;</code> with the ID you found above.</p>
                            <CodeBlock lang="bash">{`gpg --delete-secret-keys <KEY_ID>
gpg --delete-key <KEY_ID>`}</CodeBlock>
                        </div>
                    </details>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Part I: Seeding the Athenaeum</h3>
                    <p>This grand ritual establishes our repository and its unique signature. The first step only needs to be performed once per machine.</p>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 1: Initial Forge Setup (One-Time)</h4>
                    <p>This incantation installs the necessary tools, declares your identity to Git, and authenticates with GitHub. Run this once per machine.</p>
                    <CodeBlock lang="bash">{createUniversalCommand(INITIAL_SETUP_SCRIPT_RAW)}</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 2: Prepare Local Athenaeum Clone</h4>
                    <p>This clones a local copy of our Athenaeum or updates it if it already exists. Run this if you need to fetch the latest recipes from the remote repository.</p>
                    <CodeBlock lang="bash">{createUniversalCommand(REPO_SETUP_SCRIPT_RAW)}</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 3: Forge the Master Key & Foundational Recipes</h4>
                    <p>This powerful incantation combines several steps. It will first check if you have a "Kael OS Master Key".</p>
                    <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                        <li>If the key is <strong className="text-orc-steel">found</strong>, it will use it.</li>
                        <li>If not, it will look for <strong className="text-orc-steel">any other GPG key</strong> on your system and use the first one it finds.</li>
                        <li>If <strong className="text-dragon-fire">no keys are found at all</strong>, it will guide you through creating a new one.</li>
                    </ul>
                    <p>After ensuring a key exists, it will create the recipes for our two cornerstone packages: `kael-keyring` and `kael-pacman-conf`.</p>
                    <CodeBlock lang="bash">{createUniversalCommand(KEY_AND_RECIPE_SCRIPT_RAW)}</CodeBlock>
                    
                     <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 4: Publish the Foundational Artifacts</h4>
                    <p>With the cornerstones forged, we now place them in the Athenaeum, properly signed with our Master Key.</p>
                    <CodeBlock lang="bash">{createUniversalCommand(PUBLISH_FOUNDATION_SCRIPT_RAW)}</CodeBlock>
                    <p className="text-orc-steel font-semibold">The Athenaeum is now live and its signature is trusted.</p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Part II: The Publishing Rite (Ongoing Workflow)</h3>
                    <p>For all future packages, this simple rite is all you need.</p>

                     <div className="p-3 bg-forge-bg border border-forge-border rounded-lg text-sm">
                        <h5 className="font-semibold text-dragon-fire mb-2">A Note on Artisanship & Credit</h5>
                        <p>When adapting a <code className="font-mono text-xs">PKGBUILD</code> from another forge, it is our custom to honor the original creators. Always include a line crediting their work, for example: <br /><code className="font-mono text-xs"># Original work by: CachyOS &lt;email@cachyos.org&gt;</code></p>
                    </div>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 1: Trust Allied Forges (As Needed)</h4>
                    <p>Before building a package from an ally like CachyOS, you must first trust their signature so \`makepkg\` can verify the source files.</p>
                    <CodeBlock lang="bash">{createUniversalCommand('gpg --recv-key F3B607488DB35A47 && gpg --lsign-key F3B607488DB35A47')}</CodeBlock>

                     <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 2: Forge the Unified Publisher Script</h4>
                    <p>This powerful script automates the entire process of building, signing with our Master Key, and publishing. Create it once with this command:</p>
                    <CodeBlock lang="bash">{createUniversalCommand(publisherCreationScript)}</CodeBlock>
                    
                     <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Step 3: Publish an Artifact</h4>
                    <p>To publish any package, simply go to your <code className="font-mono text-xs">~/packages</code> directory and run the script with the package's folder name.</p>
                     <CodeBlock lang="bash">{createUniversalCommand(publishArtifactScript)}</CodeBlock>
                    <p className="mt-2">For advanced usage, you can also hoard a package's dependencies into our Athenaeum by adding the <code className="font-mono text-xs text-dragon-fire">--with-deps</code> flag. Use this with caution, as it can greatly increase the repository size.</p>
                     <CodeBlock lang="bash">{createUniversalCommand(publishWithDepsScript)}</CodeBlock>

                </div>
            </div>
        </div>
    );
};
