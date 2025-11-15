
import React from 'react';
import { CloseIcon, ShieldCheckIcon } from '../core/Icons';
import { CodeBlock } from '../core/CodeBlock';

interface AthenaeumSanctificationModalProps {
  onClose: () => void;
}

const SANCTIFY_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

echo "--- Athenaeum Sanctification Ritual ---"
echo "This ritual creates and signs a database for your local Athenaeum."
echo "This is a one-time setup step for a new forge."
echo ""

# --- [1/3] Path and Prerequisite Check ---
echo "--> [1/3] Verifying forge and GPG key..."
LOCAL_REPO_PATH="$HOME/forge/repo"
REPO_DB="$LOCAL_REPO_PATH/kael-os-local.db.tar.gz"

if [ ! -d "$LOCAL_REPO_PATH" ]; then
    echo "❌ ERROR: Local Athenaeum directory not found at '$LOCAL_REPO_PATH'." >&2
    echo "   Please run the 'Setup Local Forge' ritual first." >&2
    exit 1
fi

GPG_KEY_ID=""
# Method 1: Check makepkg.conf
if [ -f /etc/makepkg.conf ] && grep -q -E '^GPGKEY=' /etc/makepkg.conf; then
    GPG_KEY_ID=$(grep -E '^GPGKEY=' /etc/makepkg.conf | head -1 | cut -d'=' -f2 | tr -d '[:space:]"')
fi
# Method 2: Check git config
if [[ -z "$GPG_KEY_ID" ]] && command -v git &>/dev/null && git config --global user.signingkey &>/dev/null; then
    GPG_KEY_ID=$(git config --global user.signingkey)
fi
# Method 3: Fallback to the first available secret key
if [[ -z "$GPG_KEY_ID" ]]; then
    GPG_KEY_ID=$(gpg --list-secret-keys --with-colons | awk -F: '/^sec/{print $5; exit}')
fi

if [[ -z "$GPG_KEY_ID" ]]; then
    echo "❌ ERROR: Could not automatically detect a GPG signing key." >&2
    echo "   Please ensure a default key is configured and run the 'Attune GPG Keyring' ritual." >&2
    exit 1
fi

echo "✅ Using GPG key: $GPG_KEY_ID"
echo "✅ Local Athenaeum found at: $LOCAL_REPO_PATH"
echo ""

# --- [2/3] Confirmation ---
echo "--> [2/3] Preparing to sanctify..."
if [ -f "$REPO_DB" ]; then
    echo "⚠️  An existing local Athenaeum database was found. It will be removed and re-created."
fi
read -p "    Proceed with sanctification? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Sanctification aborted."
    exit 0
fi
echo ""

# --- [3/3] Sanctification ---
echo "--> [3/3] Removing old database files..."
# Remove all related database files to ensure a clean start
rm -f "$LOCAL_REPO_PATH"/kael-os-local.db*
rm -f "$LOCAL_REPO_PATH"/kael-os-local.files*

echo "--> Creating and signing a new, empty database..."
# repo-add with no packages will create an empty database. The --sign flag is crucial.
if ! repo-add --sign "$REPO_DB"; then
    echo "❌ ERROR: Failed to create or sign the repository database." >&2
    echo "   Please ensure your GPG key '$GPG_KEY_ID' is trusted by pacman." >&2
    echo "   You may need to re-run the 'Attune GPG Keyring' ritual." >&2
    exit 1
fi

echo ""
echo "✨ Ritual Complete! Your local Athenaeum is now sanctified."
echo "   The database is located at: $REPO_DB"
`;

export const AthenaeumSanctificationModal: React.FC<AthenaeumSanctificationModalProps> = ({ onClose }) => {
  const encodedScript = btoa(unescape(encodeURIComponent(SANCTIFY_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <ShieldCheckIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Sanctify Athenaeum Repo</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    Architect, this ritual sanctifies your local Athenaeum. It performs the crucial one-time setup of creating a new, empty, and <strong className="text-forge-text-primary">cryptographically signed</strong> package database named <code className="font-mono text-xs">kael-os-local.db.tar.gz</code>.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                    This act of signing is what imbues the repository with trust. Without a signed database, <code className="font-mono text-xs">pacman</code> will refuse to draw artifacts from it. This ritual ensures the integrity of our local supply line.
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>The 'Setup Local Forge' ritual must be complete.</li>
                    <li>The 'Attune GPG Keyring' ritual must be complete to ensure your key is trusted.</li>
                </ul>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Sanctification Incantation</h3>
                <p>
                    Run this command to create and sign the initial database for your local repository at <code className="font-mono text-xs">~/forge/repo</code>.
                </p>
                 <CodeBlock lang="bash">{finalCommand}</CodeBlock>
            </div>
        </div>
    </div>
  );
};
