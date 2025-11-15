
import React from 'react';
import { CloseIcon, TowerIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface AthenaeumMirrorModalProps {
  onClose: () => void;
}

const MIRROR_SYNC_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION & GLOBAL VARS ---
SYSTEM_REPO_DIR="/var/lib/kael-local-repo"
TEMP_KEY_FILE=""
TMP_MIRRORLIST=""
TMP_CONFIG=""
# Correctly determine the user's home directory, even under sudo
USER_HOME=\\$(getent passwd "\\\${SUDO_USER:-\\$USER}" | cut -d: -f6)
LOCAL_REPO_PATH="\\$USER_HOME/forge/repo"


# --- GLOBAL CLEANUP TRAP ---
cleanup() {
    [[ -n "\\$TEMP_KEY_FILE" && -f "\\$TEMP_KEY_FILE" ]] && rm -f -- "\\$TEMP_KEY_FILE"
    [[ -n "\\$TMP_MIRRORLIST" && -f "\\$TMP_MIRRORLIST" ]] && rm -f -- "\\$TMP_MIRRORLIST"
    [[ -n "\\$TMP_CONFIG" && -f "\\$TMP_CONFIG" ]] && rm -f -- "\\$TMP_CONFIG"
    
    if mountpoint -q "\\\${SYSTEM_REPO_DIR}/repo" 2>/dev/null; then
        echo "--> Dismantling temporary system-wide access point..."
        sudo umount "\\\${SYSTEM_REPO_DIR}/repo"
    fi
    if [ -d "\\$SYSTEM_REPO_DIR" ]; then
        sudo rm -rf "\\$SYSTEM_REPO_DIR"
    fi
}
trap cleanup EXIT SIGINT SIGTERM


echo "--- Grand Athenaeum Sync Ritual ---"
echo "This ritual attunes your system and synchronizes your local forge with the primary GitHub Athenaeum."
echo ""

# --- [1/4] Keyring Attunement ---
echo "--> [1/4] Verifying the Kael OS master key..."
if sudo pacman-key --list-keys "LeeTheOrc" >/dev/null 2>&1; then
    echo "    -> Kael OS master key already trusted."
else
    echo "    -> Summoning and trusting the Kael OS master key..."
    KEY_URL="https://raw.githubusercontent.com/LeeTheOrc/kael-os-repo/gh-pages/kael-os.asc"
    TEMP_KEY_FILE=\\$(mktemp)
    if ! curl -fsSL "\\\${KEY_URL}" -o "\\\${TEMP_KEY_FILE}"; then
        echo "❌ ERROR: Failed to download the Kael OS master key." >&2
        exit 1
    fi
    # Extract Key ID from the downloaded file
    KEY_ID=\\$(gpg --show-keys --with-colons "\\\${TEMP_KEY_FILE}" 2>/dev/null | grep '^pub' | cut -d: -f5)
    if [[ -z "\\\${KEY_ID}" ]]; then
        echo "❌ ERROR: Could not extract a valid Key ID from the downloaded key." >&2
        exit 1
    fi
    sudo pacman-key --add "\\\${TEMP_KEY_FILE}"
    sudo pacman-key --lsign-key "\\\${KEY_ID}"
    echo "✅ Kael OS master key is now trusted."
fi
echo ""

# --- [2/4] Repository Configuration ---
CONFIG_FILE="/etc/pacman.conf"
MIRRORLIST_FILE="/etc/pacman.d/kael-os-mirrorlist"
echo "--> [2/4] Configuring Kael OS repository via mirrorlist..."
BACKUP_FILE="/etc/pacman.conf.kael-mirror.bak"
if [ ! -f "\\$BACKUP_FILE" ]; then
    sudo cp "\\$CONFIG_FILE" "\\$BACKUP_FILE"
    echo "    -> Created backup: \\\${BACKUP_FILE}"
fi

# Part A: Create/Update the mirrorlist file
echo "    -> Generating new mirrorlist at \\$MIRRORLIST_FILE..."
TMP_MIRRORLIST=\\$(mktemp)
{
    echo "##"
    echo "## Kael OS Athenaeum Mirrorlist"
    echo "## Generated on \\$(date)"
    echo "##"
    echo ""
    echo "## GitHub Athenaeum (Primary Online Source)"
    echo "Server = https://leetheorc.github.io/kael-os-repo/"
    echo ""
} > "\\$TMP_MIRRORLIST"

# Check if a valid local repo exists (check for the DB file)
if [ -f "\\$LOCAL_REPO_PATH/kael-os.db" ]; then
    echo "    -> Sanctified local forge detected. Creating system-wide access point..."
    REPO_MOUNT_POINT="\\\${SYSTEM_REPO_DIR}/repo"
    sudo rm -rf "\\$SYSTEM_REPO_DIR" # Clean any previous runs
    sudo mkdir -p "\\$REPO_MOUNT_POINT"
    sudo mount --bind "\\$LOCAL_REPO_PATH" "\\$REPO_MOUNT_POINT"
    
    LOCAL_REPO_SERVER="file://\\\${REPO_MOUNT_POINT}"
    
    {
        echo "## Local Forge Mirror (Fallback / Offline Source)"
        echo "Server = \\$LOCAL_REPO_SERVER"
    } >> "\\$TMP_MIRRORLIST"
    
    echo "    -> Added local mirror to mirrorlist."
else
    echo "    -> No sanctified local forge detected. Using online-only Athenaeum."
fi

# Make the directory if it doesn't exist and move the mirrorlist into place
sudo mkdir -p /etc/pacman.d
cat "\\$TMP_MIRRORLIST" | sudo tee "\\$MIRRORLIST_FILE" > /dev/null
echo "✅ Mirrorlist configured."

# Part B: Update pacman.conf to use the mirrorlist
echo "    -> Re-scribing pacman.conf to use the new mirrorlist..."
TMP_CONFIG=\\$(mktemp)
# The SigLevel allows signed packages and optionally a signed database. GitHub Pages repo's DB is not signed by default.
REPO_ENTRY="[kael-os]\\\\nSigLevel = Required DatabaseOptional\\\\nInclude = \\$MIRRORLIST_FILE"

# Filter out our old repo sections and append the new unified one.
awk '
    /^\\\\[kael-os-local\\\\]/ { in_section=1; next }
    /^\\\\[kael-os\\\\]/       { in_section=1; next }
    /^\\\\s*\\\\[/            { in_section=0 }
    !in_section         { print }
' "\\$CONFIG_FILE" > "\\$TMP_CONFIG"

printf "\\\\n%b\\\\n" "\\$REPO_ENTRY" >> "\\$TMP_CONFIG"
cat "\\$TMP_CONFIG" | sudo tee "\\$CONFIG_FILE" > /dev/null

echo "✅ pacman.conf updated to use Kael OS mirrorlist."
echo ""


# --- [3/4] Synchronize Local Forge from GitHub Athenaeum ---
echo "--> [3/4] Synchronizing local forge with the primary GitHub Athenaeum..."
if ! command -v lftp &> /dev/null; then
    echo "    -> 'lftp' is not installed. Skipping file synchronization."
    echo "       (Run 'sudo pacman -S lftp' to enable this feature)."
else
    GH_REPO_URL="https://leetheorc.github.io/kael-os-repo/"

    echo "    -> Mirroring from \\$GH_REPO_URL to \\$LOCAL_REPO_PATH..."
    # Ensure local directory exists
    mkdir -p "\\$LOCAL_REPO_PATH"

    # The trailing slashes ensure the *contents* of the remote directory are synced *into* the local directory.
    # We mirror the root '/' of the GitHub Pages site.
    COMMANDS="mirror --continue --delete --only-newer --verbose=1 / \\"\\$LOCAL_REPO_PATH/\\"; quit"

    # Connect using HTTPS
    if ! lftp -c "open \\$GH_REPO_URL; \\$COMMANDS"; then
        echo "⚠️  WARNING: GitHub synchronization failed. Please check your internet connection."
        echo "   Your pacman configuration has been updated, but local files may be out of date."
    else
        echo "✅ Local forge successfully synchronized with GitHub Athenaeum."
    fi
fi
echo ""

# --- [4/4] Final Pacman Synchronization ---
echo "--> [4/4] Synchronizing all package databases with pacman..."
sudo pacman -Sy
echo ""

echo "✨ Grand Ritual Complete! Your system is attuned and your forge is synchronized."
`;

export const AthenaeumMirrorModal: React.FC<AthenaeumMirrorModalProps> = ({ onClose }) => {
  const encodedScript = btoa(unescape(encodeURIComponent(MIRROR_SYNC_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <TowerIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Grand Athenaeum Sync</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    Architect, this is the grand ritual of synchronization. It aligns your entire system with our network of Athenaeums using a prioritized mirrorlist.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                   This single incantation will now perform four sacred acts:
                   <ol className="list-decimal list-inside pl-2 mt-2 space-y-1">
                        <li><strong className="text-orc-steel">Generate Mirrorlist:</strong> Create <code className="font-mono text-xs">/etc/pacman.d/kael-os-mirrorlist</code> with GitHub as the primary online source, and your local forge as a fallback.</li>
                        <li><strong className="text-orc-steel">Attune Pacman:</strong> Configure <code className="font-mono text-xs">/etc/pacman.conf</code> to use the new mirrorlist for the <code className="font-mono text-xs">[kael-os]</code> repository.</li>
                        <li><strong className="text-orc-steel">Synchronize Forge:</strong> Mirror the contents of the primary GitHub Athenaeum down to your local <code className="font-mono text-xs">~/forge/repo</code> for offline access.</li>
                        <li><strong className="text-orc-steel">Refresh Databases:</strong> Command <code className="font-mono text-xs">pacman</code> to refresh its list of available packages from the new mirrorlist.</li>
                   </ol>
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Prerequisites</h3>
                 <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>The 'Setup Local Forge' ritual must be complete.</li>
                    <li>For a local repository to be recognized, it must first be sanctified.</li>
                    <li>The <code className="font-mono text-xs">lftp</code> package is required for file synchronization from the GitHub mirror.</li>
                </ul>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Grand Sync Incantation</h3>
                <p>
                    Run this single command to ensure your system is perfectly synchronized with our package sources.
                </p>
                 <CodeBlock lang="bash">{finalCommand}</CodeBlock>
            </div>
        </div>
    </div>
  );
};
