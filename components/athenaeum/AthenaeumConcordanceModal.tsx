
import React from 'react';
import { CloseIcon, SignalIcon } from '../core/Icons';
import { CodeBlock } from '../core/CodeBlock';

interface AthenaeumConcordanceModalProps {
  onClose: () => void;
}

const CONCORDANCE_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

echo "--- Athenaeum Concordance Ritual (v5.0 Standardized DB) ---"
echo "This ritual intelligently synchronizes your local Athenaeum to all remote mirrors,"
echo "ensuring platform-specific database integrity."
echo ""

# --- [1/4] PREPARATION ---
USER_HOME=$(getent passwd "\${SUDO_USER:-\$USER}" | cut -d: -f6)
LOCAL_REPO_PATH="\$USER_HOME/forge/repo"
TEMP_GH_DIR=""

cleanup() {
    [[ -n "\$TEMP_GH_DIR" && -d "\$TEMP_GH_DIR" ]] && rm -rf -- "\$TEMP_GH_DIR"
}
trap cleanup EXIT SIGINT SIGTERM

if [ ! -d "\$LOCAL_REPO_PATH" ] || [ -z "\$(ls -A "\$LOCAL_REPO_PATH")" ]; then
    echo "❌ ERROR: Local Athenaeum at '\$LOCAL_REPO_PATH' is empty or does not exist." >&2
    exit 1
fi
echo "✅ Local Athenaeum found."
echo ""

# --- [2/4] SYNC TO GITHUB ATHENAEUM ---
echo "--> [2/4] Synchronizing with GitHub Athenaeum..."
if gh auth status &>/dev/null; then
    echo "    -> Authenticated with GitHub. Preparing to publish..."

    GH_REPO_URL="https://github.com/LeeTheOrc/kael-os-repo.git"
    TEMP_GH_DIR=\$(mktemp -d)

    echo "    -> Cloning gh-pages branch from \$GH_REPO_URL..."
    git clone --branch=gh-pages --depth=1 --single-branch "\$GH_REPO_URL" "\$TEMP_GH_DIR"

    echo "    -> Mirroring package artifacts to the clone..."
    # Intelligently sync ONLY package files and their signatures.
    rsync -av --delete --include='*.pkg.tar.zst' --include='*.pkg.tar.zst.sig' --exclude='*' "\$LOCAL_REPO_PATH/" "\$TEMP_GH_DIR/"

    echo "    -> Re-sanctifying the GitHub Athenaeum database (kael-os.db)..."
    (
        cd "\$TEMP_GH_DIR"
        # The repo-add command will rebuild the database from the files present.
        repo-add --sign --remove ./kael-os.db.tar.gz ./*.pkg.tar.zst
    )

    (
        cd "\$TEMP_GH_DIR"
        git config user.name "Kael Concordance Bot"
        git config user.email "kael-bot@users.noreply.github.com"
        echo "    -> Committing and pushing changes to gh-pages..."
        git add .
        if git diff-index --quiet HEAD --; then
            echo "    -> No changes detected in the GitHub Athenaeum. Nothing to commit."
        else
            git commit -m "chore(sync): synchronize Athenaeum state" -m "Full repository synchronization via Concordance Ritual."
            git push
        fi
    )
    echo "✅ GitHub Athenaeum is now in concordance."
else
    echo "    -> Not authenticated with 'gh'. Skipping GitHub sync."
    echo "       (Run 'gh auth login' to enable this feature)."
fi
echo ""

# --- [3/4] SYNC TO WEBDISK ATHENAEUM ---
echo "--> [3/4] Synchronizing with WebDisk Athenaeum via davfs2..."
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

        echo "    -> Synchronizing staged repository to WebDisk via rsync..."
        rsync -av --delete "\$TEMP_WEBDAV_STAGE/" "\$MOUNT_POINT\$WEBDAV_REPO_PATH/"

        echo "✅ WebDisk Athenaeum is now in concordance."
    )
    if [ \$? -ne 0 ]; then
         echo "⚠️  WARNING: WebDisk sync with davfs2 failed."
    fi
fi
echo ""


# --- [4/4] Final Pacman Synchronization ---
echo "--> [4/4] Reminding to synchronize local pacman databases..."
echo "    Run 'sudo pacman -Syyu' to ensure your system sees the latest changes."
echo ""
echo "✨ Concordance Ritual Complete! All Athenaeums are synchronized."
`;

export const AthenaeumConcordanceModal: React.FC<AthenaeumConcordanceModalProps> = ({ onClose }) => {
  const encodedScript = btoa(unescape(encodeURIComponent(CONCORDANCE_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <SignalIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Athenaeum Concordance Ritual</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    Architect, this is the grand ritual of concordance. It intelligently synchronizes the state of your local Athenaeum (<code className="font-mono text-xs">~/forge/repo</code>) with all remote Athenaeums.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                   This is our master "push" command. It now intelligently handles database names to ensure all public mirrors serve a standardized <strong className="text-orc-steel">kael-os.db</strong> database.
                    <ul className="list-disc list-inside pl-2 mt-2 space-y-1">
                        <li><strong className="text-orc-steel">GitHub:</strong> Rebuilds the database from scratch as <code className="font-mono text-xs">kael-os.db</code>.</li>
                        <li><strong className="text-orc-steel">WebDisk:</strong> Mirrors the local repo but renames the database to <code className="font-mono text-xs">kael-os.db</code>.</li>
                   </ul>
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Prerequisites</h3>
                 <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Your local Athenaeum must exist and contain artifacts.</li>
                    <li><code className="font-mono text-xs">gh auth login</code> is required for GitHub sync.</li>
                    <li>The <code className="font-mono text-xs">davfs2</code> package is required for WebDisk sync.</li>
                </ul>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Concordance Incantation</h3>
                <p>
                    Run this single command to bring all your Athenaeums into perfect alignment.
                </p>
                 <CodeBlock lang="bash">{finalCommand}</CodeBlock>
            </div>
        </div>
    </div>
  );
};
