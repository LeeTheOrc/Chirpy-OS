
import React from 'react';
import { CloseIcon, EyeIcon } from '../core/Icons';
import { CodeBlock } from '../core/CodeBlock';

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
if [ -f "$LOCAL_REPO_PATH/kael-os-local.db.tar.gz" ]; then
    echo "✅ SUCCESS: Database file found at '$LOCAL_REPO_PATH/kael-os-local.db.tar.gz'."
else
    echo "❌ FAILED: Database file not found. Ensure the repo is sanctified."
fi
echo ""

# --- [2/3] VERIFY GITHUB ATHENAEUM ---
echo -n "--> [2/3] Verifying GitHub Athenaeum... "
GITHUB_URL="https://leetheorc.github.io/kael-os-repo/kael-os.db.tar.gz"
# Use curl to check HTTP headers. -s for silent, -o /dev/null to discard body, -w '%{http_code}' to get status code.
HTTP_STATUS=\$(curl -s -o /dev/null -w "%{http_code}" "$GITHUB_URL")
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ SUCCESS: Received HTTP 200 OK from '$GITHUB_URL'."
else
    echo "❌ FAILED: Received HTTP status \$HTTP_STATUS. Check the URL and your internet connection."
fi
echo ""


# --- [3/3] VERIFY WEBDISK ATHENAEUM ---
echo -n "--> [3/3] Verifying Public WebDisk Athenaeum... "
WEBDISK_URL="https://leroyonline.co.za/leroyonline.co.za/leroy/forge/repo/kael-os.db.tar.gz"
HTTP_STATUS_WD=\$(curl -s -o /dev/null -w "%{http_code}" "$WEBDISK_URL")
if [ "$HTTP_STATUS_WD" -eq 200 ]; then
    echo "✅ SUCCESS: Received HTTP 200 OK from the public WebDisk URL."
else
    echo "❌ FAILED: Received HTTP status \$HTTP_STATUS_WD. Check the public URL and your internet connection."
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
                   Architect, this ritual is our scrying glass. It will perform a non-destructive test on our Athenaeum sources to verify they are accessible and correctly configured.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                   The incantation will check the following:
                   <ol className="list-decimal list-inside pl-2 mt-2 space-y-1">
                        <li><strong className="text-orc-steel">Local Athenaeum:</strong> Verifies the existence of your developer database at <code className="font-mono text-xs">~/forge/repo/kael-os-local.db.tar.gz</code>.</li>
                        <li><strong className="text-orc-steel">GitHub Athenaeum:</strong> Checks for the public database at <code className="font-mono text-xs">.../kael-os.db.tar.gz</code>.</li>
                        <li><strong className="text-orc-steel">WebDisk Athenaeum:</strong> Checks for the public database at its public URL.</li>
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
