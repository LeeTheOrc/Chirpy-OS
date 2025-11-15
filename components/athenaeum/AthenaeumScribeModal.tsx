
import React from 'react';
import { CloseIcon, BookOpenIcon } from '../core/Icons';
import { CodeBlock } from '../core/CodeBlock';

interface AthenaeumScribeModalProps {
  onClose: () => void;
}

const SCRIBE_SCRIPT_RAW = `#!/bin/bash
# Kael Athenaeum Scribe (forge-and-publish) v5.0 Standardized DB
set -euo pipefail

echo "--- Athenaeum Scribe Ritual (v5.0 Standardized DB) ---"
echo "This ritual forges, signs, and publishes an artifact to all Athenaeums."

# --- [1/5] PREPARATION ---
if [ ! -f "PKGBUILD" ]; then
    echo "❌ ERROR: No PKGBUILD found in the current directory." >&2
    exit 1
fi

USER_HOME=$(getent passwd "\${SUDO_USER:-\$USER}" | cut -d: -f6)
LOCAL_REPO_PATH="\$USER_HOME/forge/repo"
REPO_DB_LOCAL="\$LOCAL_REPO_PATH/kael-os-local.db.tar.gz"
TEMP_GH_DIR=""

cleanup() {
    [[ -n "\$TEMP_GH_DIR" && -d "\$TEMP_GH_DIR" ]] && rm -rf -- "\$TEMP_GH_DIR"
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
    
    REPO_DB_GITHUB="\$TEMP_GH_DIR/kael-os.db.tar.gz"
    COPIED_TO_GH=()
    
    echo "    -> Staging artifacts for GitHub..."
    for pkg_path in "\${PKG_FILES[@]}"; do
        cp "\$pkg_path" "\$pkg_path.sig" "\$TEMP_GH_DIR/"
        COPIED_TO_GH+=("\$TEMP_GH_DIR/$(basename "\$pkg_path")")
    done

    echo "    -> Scribing artifact into the GitHub database (kael-os.db)..."
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
    echo "✅ Published to GitHub Athenaeum."
else
    echo "    -> Not authenticated with 'gh'. Skipping GitHub Pages publish."
    echo "       (Run 'gh auth login' to enable this feature)."
fi
echo ""

# --- [5/5] PUBLISH TO WEBDISK ATHENAEUM ---
echo "--> [5/5] Publishing to the pre-configured WebDisk Athenaeum..."
if ! command -v mount.davfs &> /dev/null; then
    echo "    -> ⚠️ SKIPPED: 'davfs2' is not installed. (sudo pacman -S davfs2)"
else
    ( # Start of subshell for encapsulated mount logic
        WEBDAV_URL="https://leroyonline.co.za:2078"
        WEBDAV_USER="leroy@leroyonline.co.za"
        WEBDAV_PASS='LeRoy0923!'
        WEBDAV_REPO_PATH="/forge/repo"
        TEMP_WEBDAV_STAGE=\$(mktemp -d)
        MOUNT_POINT=\$(mktemp -d)

        trap '
            if mountpoint -q "'"\$MOUNT_POINT"'" 2>/dev/null; then
                echo "    -> Unmounting WebDisk..."
                sudo umount "'"\$MOUNT_POINT"'"
            fi
            rm -rf -- "'"\$MOUNT_POINT"'"
            rm -rf -- "'"\$TEMP_WEBDAV_STAGE"'"
        ' EXIT SIGINT SIGTERM

        echo "    -> Staging local repository for WebDisk transmutation..."
        rsync -a --exclude=".git" "\$LOCAL_REPO_PATH/" "\$TEMP_WEBDAV_STAGE/"

        echo "    -> Transmuting database name for WebDisk (kael-os.db)..."
        (
            cd "\$TEMP_WEBDAV_STAGE"
            find . -maxdepth 1 -name "kael-os-local.db*" -exec bash -c 'mv "\$0" "\${0/kael-os-local/kael-os}"' {} \\;
        )

        echo "    -> Mounting remote WebDisk to \${MOUNT_POINT}..."
        USER_ID=\${SUDO_UID:-\$(id -u)}
        GROUP_ID=\${SUDO_GID:-\$(id -g)}
        
        if ! (echo "\$WEBDAV_PASS") | sudo mount -t davfs -o uid=\$USER_ID,gid=\$GROUP_ID,rw "\$WEBDAV_URL" "\$MOUNT_POINT"; then
            echo "❌ ERROR: Failed to mount WebDisk. Please check connection, credentials, and davfs2 setup." >&2
            exit 1
        fi
        echo "✅ WebDisk mounted."
        
        mkdir -p "\$MOUNT_POINT\$WEBDAV_REPO_PATH"

        echo "    -> Publishing to WebDisk via rsync..."
        rsync -av --delete "\$TEMP_WEBDAV_STAGE/" "\$MOUNT_POINT\$WEBDAV_REPO_PATH/"
        
        echo "✅ Published to WebDisk Athenaeum."
    )
    if [ \$? -ne 0 ]; then
        echo "⚠️  WARNING: WebDisk publish failed."
    fi
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
                        The <code className="font-mono text-xs">forge-and-publish</code> command now publishes to all mirrors using a standardized database name, ensuring consistency for end-users.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Publishing Destinations & Databases</h3>
                     <ul className="list-disc list-inside space-y-2 text-sm">
                        <li><strong className="text-forge-text-primary">Local Athenaeum:</strong> Publishes to <code className="font-mono text-xs">~/forge/repo</code> using the developer-specific <code className="font-mono text-xs">kael-os-local.db</code>.</li>
                        <li><strong className="text-forge-text-primary">GitHub & WebDisk Athenaeums:</strong> Publishes using the public, standardized <code className="font-mono text-xs">kael-os.db</code>.</li>
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
