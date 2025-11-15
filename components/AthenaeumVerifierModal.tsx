
import React from 'react';
import { CloseIcon, EyeIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface AthenaeumVerifierModalProps {
  onClose: () => void;
}

const VERIFIER_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

echo "--- Athenaeum Verifier Ritual ---"
echo "This ritual will test connectivity to all configured Athenaeum sources."
echo ""

# --- [1/3] VERIFY LOCAL ATHENAEUM ---
echo -n "--> [1/3] Verifying Local Athenaeum... "
LOCAL_REPO_PATH="$HOME/forge/repo"
if [ -f "$LOCAL_REPO_PATH/kael-os.db" ]; then
    echo "✅ SUCCESS: Database file found at '$LOCAL_REPO_PATH/kael-os.db'."
else
    echo "❌ FAILED: Database file not found. Ensure the repo is sanctified and synchronized."
fi
echo ""

# --- [2/3] VERIFY GITHUB ATHENAEUM ---
echo -n "--> [2/3] Verifying GitHub Athenaeum... "
GITHUB_URL="https://leetheorc.github.io/kael-os-repo/kael-os.db"
# Use curl to check HTTP headers. -s for silent, -o /dev/null to discard body, -w '%{http_code}' to get status code.
HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" "$GITHUB_URL")
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ SUCCESS: Received HTTP 200 OK from '$GITHUB_URL'."
else
    echo "❌ FAILED: Received HTTP status \$HTTP_STATUS. Check the URL and your internet connection."
fi
echo ""


# --- [3/3] VERIFY FTPS ATHENAEUM ---
echo "--> [3/3] Verifying FTPS Athenaeum..."
if ! command -v lftp &> /dev/null; then
    echo "    -> ⚠️ SKIPPED: 'lftp' is not installed."
else
    FTP_HOST="ftp.leroyonline.co.za"
    FTP_USER="leroy@leroyonline.co.za"
    FTP_PASS='LeRoy0923!'
    FTP_REPO_PATH="/forge/repo"
    
    echo -n "    -> Connecting to ftps://\$FTP_HOST:21... "
    # The command attempts to list the contents of the repo dir and then quits.
    # The output is redirected to /dev/null. We only care about the exit code.
    COMMANDS="ls \\"\$FTP_REPO_PATH\\"; quit"
    FTP_OPTIONS="set ftp:ssl-force true; set ssl:verify-certificate no;"
    if lftp -c "\$FTP_OPTIONS open -p 21 -u '\$FTP_USER','\$FTP_PASS' ftp://\$FTP_HOST; \$COMMANDS" &> /dev/null; then
        echo "✅ SUCCESS: Connection successful and directory is listable."
    else
        echo "❌ FAILED: Could not connect or list directory. Check credentials, path, and connection."
    fi
fi
echo ""
echo "✨ Verification Ritual Complete!"
`;

export const AthenaeumVerifierModal: React.FC<AthenaeumVerifierModalProps> = ({ onClose }) => {
  const encodedScript = btoa(unescape(encodeURIComponent(VERIFIER_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <EyeIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Athenaeum Verifier Ritual</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                   Architect, this ritual is our scrying glass. It will perform a non-destructive test on all three of our Athenaeum sources to verify they are accessible and correctly configured.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                   The incantation will check the following:
                   <ol className="list-decimal list-inside pl-2 mt-2 space-y-1">
                        <li><strong className="text-orc-steel">Local Athenaeum:</strong> Verifies the existence of the database file at <code className="font-mono text-xs">~/forge/repo/kael-os.db</code>.</li>
                        <li><strong className="text-orc-steel">GitHub Athenaeum:</strong> Checks for a valid HTTP 200 response from the public repository URL.</li>
                        <li><strong className="text-orc-steel">FTPS Athenaeum:</strong> Attempts to connect to your FTPS server with the pre-configured credentials and list the contents of the repo directory.</li>
                   </ol>
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Verification Incantation</h3>
                <p>
                    Run this command to check the status of all your Athenaeum connections.
                </p>
                 <CodeBlock lang="bash">{finalCommand}</CodeBlock>
            </div>
        </div>
    </div>
  );
};
