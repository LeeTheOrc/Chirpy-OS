


import React from 'react';
import { CloseIcon, ServerStackIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface SftpMirrorSetupModalProps {
  onClose: () => void;
}

const FTPS_SETUP_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

echo "--- FTPS Mirror Setup Ritual (Pre-configured) ---"
echo "This ritual will create the Kael OS forge directory structure on your remote FTPS server."
echo ""

# --- [1/2] Prerequisite Check ---
echo "--> [1/2] Checking for lftp familiar..."
if ! command -v lftp &> /dev/null; then
    echo "❌ ERROR: 'lftp' is not installed. Please install it to proceed." >&2
    echo "   On Arch Linux, you can install it with: sudo pacman -S lftp" >&2
    exit 1
fi
echo "✅ Prerequisite 'lftp' is present."
echo ""

# --- [2/2] Directory Creation ---
FTP_HOST="ftp.leroyonline.co.za"
FTP_USER="leroy@leroyonline.co.za"
FTP_PASS='LeRoy0923!'
FTP_PATH="/forge"

echo "--> [2/2] Connecting to ftps://\${FTP_HOST}:21 and creating directories..."

REMOTE_BASE="\$FTP_PATH"
# lftp's 'mkdir -p' command will create parent directories as needed.
COMMANDS="mkdir -p \\"\$REMOTE_BASE/repo\\"; mkdir -p \\"\$REMOTE_BASE/packages\\"; mkdir -p \\"\$REMOTE_BASE/kael\\"; quit"

# Connect using explicit FTPS on port 21.
# 'set ftp:ssl-force true' ensures the connection is upgraded to TLS.
# 'set ssl:verify-certificate no' is added for compatibility with common server setups.
FTP_OPTIONS="set ftp:ssl-force true; set ssl:verify-certificate no;"
if ! lftp -c "\$FTP_OPTIONS open -p 21 -u '\$FTP_USER','\$FTP_PASS' ftp://\$FTP_HOST; \$COMMANDS"; then
    echo "❌ ERROR: Failed to create directories on the FTPS server." >&2
    echo "   Please check your credentials, port, and path, and ensure the user has write permissions." >&2
    exit 1
fi

echo "✅ Remote forge structure created at: ftps://\${FTP_HOST}\${REMOTE_BASE}"
echo "   - \${REMOTE_BASE}/repo      (For Athenaeum artifacts)"
echo "   - \${REMOTE_BASE}/packages  (For PKGBUILD sources)"
echo "   - \${REMOTE_BASE}/kael      (For project source)"
echo ""
echo "✨ Ritual Complete! Your FTPS mirror is now set up and ready to receive artifacts."
`;

export const SftpMirrorSetupModal: React.FC<SftpMirrorSetupModalProps> = ({ onClose }) => {
  const encodedScript = btoa(unescape(encodeURIComponent(FTPS_SETUP_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <ServerStackIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Setup FTPS Mirror</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    Architect, this ritual establishes a redundant Athenaeum on your pre-configured remote FTPS server. It will create the necessary directory structure on the server, mirroring your local forge.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                    This creates the empty directory structure. The 'Publish to Athenaeum' ritual will then automatically mirror your local <code className="font-mono text-xs">repo</code> directory to the remote server at <code className="font-mono text-xs">ftp.leroyonline.co.za</code> via explicit FTPS on port 21.
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>The <code className="font-mono text-xs">lftp</code> command must be installed on your local machine.</li>
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