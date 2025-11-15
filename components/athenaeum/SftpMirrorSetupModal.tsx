

import React from 'react';
import { CloseIcon, ServerStackIcon } from '../core/Icons';
import { CodeBlock } from '../core/CodeBlock';

interface WebDiskMirrorSetupModalProps {
  onClose: () => void;
}

const WEBDAV_SETUP_SCRIPT_RAW = `#!/bin/bash
set -uo pipefail

echo "--- WebDisk Mirror Setup Ritual (Pre-configured) ---"
echo "This ritual will create the Kael OS forge directory structure on your remote WebDisk server."
echo ""

# --- [1/2] Prerequisite Check ---
echo "--> [1/2] Checking for curl familiar..."
if ! command -v curl &> /dev/null; then
    echo "❌ ERROR: 'curl' is not installed. Please install it to proceed." >&2
    exit 1
fi
echo "✅ Prerequisite 'curl' is present."
echo ""

# --- [2/2] Directory Creation ---
WEBDAV_URL="https://leroyonline.co.za:2078"
WEBDAV_USER="leroy@leroyonline.co.za"
WEBDAV_PASS='LeRoy0923!'
FORGE_PATH="/forge"

# Define all directories that need to exist, in order.
DIRECTORIES=(
    "\${FORGE_PATH}"
    "\${FORGE_PATH}/repo"
    "\${FORGE_PATH}/packages"
    "\${FORGE_PATH}/kael"
)

echo "--> [2/2] Connecting to \${WEBDAV_URL} and creating forge structure..."

SUCCESS_COUNT=0
HAD_ERROR=0
for DIR_PATH in "\${DIRECTORIES[@]}"; do
    echo "    -> Processing directory: \${DIR_PATH}"
    # Try to create the directory. The trailing slash is important for MKCOL.
    if curl --fail -s -u "\$WEBDAV_USER:\$WEBDAV_PASS" -X MKCOL "\${WEBDAV_URL}\${DIR_PATH}/" -o /dev/null; then
        echo "       -> Successfully created."
    # If create failed (likely because it exists), check if it's there.
    elif curl --fail -s -u "\$WEBDAV_USER:\$WEBDAV_PASS" -X PROPFIND "\${WEBDAV_URL}\${DIR_PATH}/" --header "Depth: 0" -o /dev/null; then
        echo "       -> Directory already exists. Skipping."
    # If both create and check failed, then it's a real problem.
    else
        echo "    ❌ FAILED: Could not create or verify directory '\${DIR_PATH}'."
        HAD_ERROR=1
        # Stop on the first real error to avoid cascading failures.
        break
    fi
    ((SUCCESS_COUNT++))
done

echo ""
if [[ "\$HAD_ERROR" -eq 1 ]]; then
    echo "⚠️  A directory could not be created. Please check your WebDisk server permissions and path."
    exit 1
fi

# We expect all directories to be processed successfully if no error occurred.
if [[ "\$SUCCESS_COUNT" -eq "\${#DIRECTORIES[@]}" ]]; then
    echo "✅ Remote forge structure created (or already existed) at: \${WEBDAV_URL}\${FORGE_PATH}"
else
    # This case should only be hit if the loop was broken by an error.
    echo "⚠️  An error occurred. Not all directories were processed successfully."
    exit 1
fi

echo "   - \${FORGE_PATH}/repo      (For Athenaeum artifacts)"
echo "   - \${FORGE_PATH}/packages  (For PKGBUILD sources)"
echo "   - \${FORGE_PATH}/kael      (For project source)"
echo ""
echo "✨ Ritual Complete! Your WebDisk mirror is now set up."
`;

export const WebDiskMirrorSetupModal: React.FC<WebDiskMirrorSetupModalProps> = ({ onClose }) => {
  const encodedScript = btoa(unescape(encodeURIComponent(WEBDAV_SETUP_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <ServerStackIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Setup WebDisk Mirror</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    Architect, this ritual establishes a redundant Athenaeum on your pre-configured remote WebDisk server. It will create the full forge directory structure (<code className="font-mono text-xs">repo</code>, <code className="font-mono text-xs">packages</code>, <code className="font-mono text-xs">kael</code>) on the server.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                    This creates the empty directory structure. The 'Publish to Athenaeum' and 'Concordance' rituals will then automatically mirror your local <code className="font-mono text-xs">repo</code> directory to your WebDisk. The other directories are available for manual backup.
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>The <code className="font-mono text-xs">curl</code> command must be installed on your local machine.</li>
                </ul>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Setup Incantation</h3>
                <p>
                    Run this single command to create the directory structure on your remote server.
                </p>
                 <CodeBlock lang="bash">{finalCommand}</CodeBlock>
            </div>
        </div>
    </div>
  );
};