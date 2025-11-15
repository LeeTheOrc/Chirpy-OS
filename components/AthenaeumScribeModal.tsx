
import React from 'react';
import { CloseIcon, BookOpenIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface AthenaeumScribeModalProps {
  onClose: () => void;
}

const SCRIBE_SCRIPT_RAW = `#!/bin/bash
# Kael Athenaeum Scribe (forge-and-publish) v3.0 Pre-configured Publisher
set -euo pipefail

echo "--- Athenaeum Scribe Ritual (v3.0 Pre-configured) ---"
echo "This ritual forges, signs, and publishes an artifact to local and all remote Athenaeums."

# --- [1/5] PREPARATION ---
if [ ! -f "PKGBUILD" ]; then
    echo "❌ ERROR: No PKGBUILD found in the current directory." >&2
    echo "   Please run this ritual from within a package source directory." >&2
    exit 1
fi

USER_HOME=$(getent passwd "\${SUDO_USER:-\$USER}" | cut -d: -f6)
LOCAL_REPO_PATH="\$USER_HOME/forge/repo"
REPO_DB_LOCAL="\$LOCAL_REPO_PATH/kael-os-local.db.tar.gz"
TEMP_GH_DIR=""
TEMP_FTPS_STAGE=""

cleanup() {
    [[ -n "\$TEMP_GH_DIR" && -d "\$TEMP_GH_DIR" ]] && rm -rf -- "\$TEMP_GH_DIR"
    [[ -n "\$TEMP_FTPS_STAGE" && -d "\$TEMP_FTPS_STAGE" ]] && rm -rf -- "\$TEMP_FTPS_STAGE"
}
trap cleanup EXIT SIGINT SIGTERM

# --- [2/5] FORGE ARTIFACT ---
echo "--> [2/5] Forging the artifact (makepkg -sf --sign)..."
if ! makepkg -sf --sign; then
    echo "❌ ERROR: makepkg failed to build or sign the artifact." >&2
    exit 1
fi

mapfile -t PKG_FILES < <(find . -maxdepth 1 -name "*.pkg.tar.zst" ! -name "*.sig")
if [ \${#PKG_FILES[@]} -eq 0 ]; then
    echo "❌ ERROR: No package file found after build." >&2
    exit 1
fi

echo "✅ Forged artifact: $(basename "\${PKG_FILES[0]}")"
echo ""

# --- [3/5] PUBLISH TO LOCAL ATHENAEUM ---
echo "--> [3/5] Publishing to the Local Forge Athenaeum..."
if [ ! -d "\$LOCAL_REPO_PATH" ]; then
    echo "    -> Local Athenaeum not found. Creating it at '\$LOCAL_REPO_PATH'..."
    mkdir -p "\$LOCAL_REPO_PATH"
fi

COPIED_PKG_PATHS=()
for pkg_path in "\${PKG_FILES[@]}"; do
    pkg_basename=$(basename "\$pkg_path")
    sig_path="\${pkg_path}.sig"
    
    cp "\$pkg_path" "\$LOCAL_REPO_PATH/"
    COPIED_PKG_PATHS+=("\$LOCAL_REPO_PATH/\$pkg_basename")

    if [ ! -f "\$sig_path" ]; then
        echo "❌ FATAL: Signature file '\$sig_path' not found!" >&2
        echo "   Ensure your GPG key is configured in /etc/makepkg.conf (GPGKEY=...)." >&2
        exit 1
    fi
    cp "\$sig_path" "\$LOCAL_REPO_PATH/"
done

echo "    -> Scribing artifact into the local database (kael-os-local.db)..."
repo-add --sign "\$REPO_DB_LOCAL" "\${COPIED_PKG_PATHS[@]}"
echo "✅ Published to Local Athenaeum."
echo ""

# --- [4/5] PUBLISH TO GITHUB ATHENAEUM ---
echo "--> [4/5] Checking for GitHub Athenaeum..."
if gh auth status &>/dev/null; then
    echo "    -> Authenticated with GitHub. Preparing to publish..."
    
    GH_REPO_URL="https://github.com/LeeTheOrc/kael-os-repo.git"
    TEMP_GH_DIR=$(mktemp -d)
    
    echo "    -> Cloning gh-pages branch from \$GH_REPO_URL..."
    git clone --branch=gh-pages --single-branch "\$GH_REPO_URL" "\$TEMP_GH_DIR"
    
    REPO_DB_GITHUB="\$TEMP_GH_DIR/kael-os-repo.db.tar.gz"
    COPIED_TO_GH=()
    
    echo "    -> Staging artifacts for GitHub..."
    for pkg_path in "\${PKG_FILES[@]}"; do
        cp "\$pkg_path" "\$pkg_path.sig" "\$TEMP_GH_DIR/"
        COPIED_TO_GH+=("\$TEMP_GH_DIR/$(basename "\$pkg_path")")
    done

    echo "    -> Scribing artifact into the GitHub database (kael-os-repo.db)..."
    (
        cd "\$TEMP_GH_DIR"
        repo-add --sign "\$REPO_DB_GITHUB" "\${COPIED_TO_GH[@]}"
    )

    (
        cd "\$TEMP_GH_DIR"
        git config user.name "Kael Scribe Bot"
        git config user.email "kael-bot@users.noreply.github.com"
        echo "    -> Committing and pushing changes to gh-pages..."
        git add .
        if git diff-index --quiet HEAD --; then
            echo "    -> No changes detected in the GitHub Athenaeum. Nothing to commit."
        else
            git commit -m "chore(release): publish artifact(s)" -m "Published: $(basename "\${PKG_FILES[0]}")"
            git push
        fi
    )
    rm -rf "\$TEMP_GH_DIR" # Redundant with trap, but good practice
    echo "✅ Published to GitHub Athenaeum."
else
    echo "    -> Not authenticated with 'gh'. Skipping GitHub Pages publish."
    echo "       (Run 'gh auth login' to enable this feature)."
fi
echo ""

# --- [5/5] PUBLISH TO FTPS ATHENAEUM ---
echo "--> [5/5] Publishing to the pre-configured FTPS Athenaeum..."

FTP_HOST="ftp.leroyonline.co.za"
FTP_USER="leroy@leroyonline.co.za"
FTP_PASS='LeRoy0923!'
FTP_BASE_PATH="/forge"
FTP_REPO_PATH="\$FTP_BASE_PATH/repo"
TEMP_FTPS_STAGE=$(mktemp -d)

echo "    -> Staging local repository for FTPS transmutation..."
rsync -a "\$LOCAL_REPO_PATH/" "\$TEMP_FTPS_STAGE/"

echo "    -> Transmuting database name for FTPS (kael-os-ftps.db)..."
(
    cd "\$TEMP_FTPS_STAGE"
    find . -maxdepth 1 -name "kael-os-local.db*" -exec bash -c 'mv "$0" "\${0/kael-os-local/kael-os-ftps}"' {} \\;
)

echo "    -> Mirroring staged repository to ftps://\$FTP_HOST:21\$FTP_REPO_PATH..."
COMMANDS="mirror -R -v --delete --only-newer \\"\$TEMP_FTPS_STAGE/\\" \\"\$FTP_REPO_PATH/\\"; quit"
FTP_OPTIONS="set ftp:ssl-force true; set ssl:verify-certificate no;"
if ! lftp -c "\$FTP_OPTIONS open -p 21 -u '\$FTP_USER','\$FTP_PASS' ftp://\$FTP_HOST; \$COMMANDS"; then
    echo "⚠️  WARNING: FTPS publish failed. Please check your connection and credentials."
else
    echo "✅ Published to FTPS Athenaeum at \$FTP_HOST."
fi

echo ""
echo "✨ Grand Publishing Ritual Complete!"
`;

const INSTALLER_SCRIPT_RAW = `set -e
cat > /tmp/forge-and-publish << 'EOF'
${SCRIBE_SCRIPT_RAW}
EOF

chmod +x /tmp/forge-and-publish
sudo mv /tmp/forge-and-publish /usr/local/bin/forge-and-publish

echo "✅ 'forge-and-publish' command has been reforged."
echo "   It is now a global publisher."
`;


export const AthenaeumScribeModal: React.FC<AthenaeumScribeModalProps> = ({ onClose }) => {
    // Inject the scribe script into the installer script
    const finalInstallerScript = INSTALLER_SCRIPT_RAW.replace('${SCRIBE_SCRIPT_RAW}', SCRIBE_SCRIPT_RAW);
    
    // The unified script is encoded to base64 to comply with Rune XVI.
    const encodedInstaller = btoa(unescape(encodeURIComponent(finalInstallerScript)));
    const finalInstallCommand = `echo "${encodedInstaller}" | base64 --decode | bash`;
    
    const runCommand = `forge-and-publish`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <BookOpenIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Athenaeum Scribe</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        A wise decree, Architect. An artifact should be forged once, then distributed to all Athenaeums for resilience and redundancy. I have reforged the Scribe's ritual to do exactly that.
                    </p>
                    <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                        The <code className="font-mono text-xs">forge-and-publish</code> command is now a global publisher. It will add your new package to the local Athenaeum, then publish it to all configured remote Athenaeums with the correct, platform-specific database names.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Publishing Destinations & Databases</h3>
                     <ul className="list-disc list-inside space-y-2 text-sm">
                        <li><strong className="text-forge-text-primary">Local Athenaeum:</strong> Publishes to <code className="font-mono text-xs">~/forge/repo</code> using <code className="font-mono text-xs">kael-os-local.db</code>.</li>
                        <li><strong className="text-forge-text-primary">GitHub Athenaeum:</strong> Enabled via <code className="font-mono text-xs">gh auth login</code>. Rebuilds the database as <code className="font-mono text-xs">kael-os-repo.db</code>.</li>
                        <li><strong className="text-forge-text-primary">FTPS Mirror:</strong> Pre-configured. Creates <code className="font-mono text-xs">kael-os-ftps.db</code> for the mirror.</li>
                    </ul>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Forge the Scribe (One-Time Setup)</h3>
                    <p>
                        Run this incantation once to create or upgrade the global <code className="font-mono text-xs">forge-and-publish</code> command.
                    </p>
                    <CodeBlock lang="bash">{finalInstallCommand}</CodeBlock>

                     <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: Scribe an Artifact</h3>
                    <p>
                        Navigate into any directory containing a <code className="font-mono text-xs">PKGBUILD</code> file and invoke the Scribe. It will handle the rest.
                    </p>
                    <CodeBlock lang="bash">{runCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};
