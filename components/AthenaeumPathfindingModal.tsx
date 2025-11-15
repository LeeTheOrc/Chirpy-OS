import React from 'react';
import { CloseIcon, TowerIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface AthenaeumPathfindingModalProps {
  onClose: () => void;
}

const ATTUNE_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
CONFIG_FILE="/etc/pacman.conf"
BACKUP_FILE="/etc/pacman.conf.kael.bak" # Static backup file name

# --- RITUAL START ---
echo "--- Athenaeum Pathfinding Ritual: Attuning to Local Source ---"

# --- DEFINE REPO ENTRIES ---
# Correctly determine the user's home directory, even when run with sudo
USER_HOME=$(getent passwd "\${SUDO_USER:-\$USER}" | cut -d: -f6)
LOCAL_REPO_SERVER="file://\${USER_HOME}/forge/repo"
LOCAL_REPO_ENTRY="[kael-os-local]\\nSigLevel = Required DatabaseOptional\\nServer = \${LOCAL_REPO_SERVER}"

ONLINE_REPO_ENTRY="[kael-os]\\nSigLevel = Required DatabaseOptional\\nServer = https://leetheorc.github.io/kael-os-repo/"

# --- BACKUP ---
if [ ! -f "$BACKUP_FILE" ]; then
    echo "--> Creating first-time backup of pacman.conf to \${BACKUP_FILE}..."
    sudo cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo "✅ Backup created. You can restore it later if needed."
else
    echo "--> Backup file already exists at \${BACKUP_FILE}. Skipping."
fi

# --- REBUILD CONFIG ---
echo "--> Rebuilding pacman.conf to prioritize local repository..."

TMP_CONFIG=$(mktemp)
# Ensure tmp file is cleaned up on exit
trap 'rm -f -- "$TMP_CONFIG"' EXIT

# 1. Add our local repo entry to the top of the temp file.
# Using printf is safer than echo -e for portability.
printf "%b\\n\\n" "$LOCAL_REPO_ENTRY" > "$TMP_CONFIG"

# 2. Append the rest of pacman.conf, but filter out our managed entries.
awk '
  /^\\[kael-os-local\\]/ { in_section=1; next }
  /^\\[kael-os\\]/       { in_section=1; next }
  /^\\s*\\[/           { in_section=0 }
  !in_section       { print }
' "$CONFIG_FILE" >> "$TMP_CONFIG"

# 3. Append our online repo entry to the end of the temp file.
printf "\\n%b\\n" "$ONLINE_REPO_ENTRY" >> "$TMP_CONFIG"

# 4. Replace the original config with our new one.
cat "$TMP_CONFIG" | sudo tee "$CONFIG_FILE" > /dev/null

echo "✅ pacman.conf has been successfully attuned."

# --- SYNC DATABASES ---
echo "--> Refreshing pacman databases with new configuration..."
sudo pacman -Sy

echo ""
echo "✨ Pathfinding Complete! Pacman will now check your local Athenaeum first."
`;

const RESTORE_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
CONFIG_FILE="/etc/pacman.conf"
BACKUP_FILE="/etc/pacman.conf.kael.bak"

echo "--- Athenaeum Pathfinding Ritual: Restoring Original Paths ---"

if [ -f "$BACKUP_FILE" ]; then
    echo "--> Restoring pacman.conf from backup: \${BACKUP_FILE}..."
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo "✅ pacman.conf restored."
    
    echo "--> Refreshing pacman databases..."
    sudo pacman -Sy
    
    echo "✨ Restoration complete. Pacman is back to its original configuration."
else
    echo "❌ No backup file found at \${BACKUP_FILE}."
    echo "   Cannot restore automatically. Please check your system."
fi
`;

export const AthenaeumPathfindingModal: React.FC<AthenaeumPathfindingModalProps> = ({ onClose }) => {
    // UTF-8 safe encoding for both scripts
    const encodedAttuneScript = btoa(unescape(encodeURIComponent(ATTUNE_SCRIPT_RAW)));
    const finalAttuneCommand = `echo "${encodedAttuneScript}" | base64 --decode | sudo bash`;

    const encodedRestoreScript = btoa(unescape(encodeURIComponent(RESTORE_SCRIPT_RAW)));
    const finalRestoreCommand = `echo "${encodedRestoreScript}" | base64 --decode | sudo bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <TowerIcon className="w-5 h-5" />
                        <span>The Athenaeum Pathfinding</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This ritual attunes your Realm's package manager (<code className="font-mono text-xs">pacman</code>) to seek artifacts from your local Athenaeum first, before venturing out to the online repositories.
                    </p>
                    <p className="text-sm p-3 bg-sky-400/10 border-l-4 border-sky-400 rounded mt-2">
                        This is invaluable for offline development and for our fellow Architects in regions with unreliable or expensive internet. It ensures you can forge and install your custom packages instantly, without needing a connection.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-sky-400 mt-4 mb-2">Ritual I: Attune to Local Source</h3>
                    <p>
                        Run this command to modify your <code className="font-mono text-xs">/etc/pacman.conf</code>. It will safely back up your current configuration and then rewrite it to prioritize your local package repository located at <code className="font-mono text-xs">~/forge/repo</code>.
                    </p>
                    <CodeBlock lang="bash">{finalAttuneCommand}</CodeBlock>
                    
                    <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Ritual II: Restore Original Paths</h3>
                    <p>
                        If you wish to undo this change, run the restore command. It will use the backup created by the first ritual to return your <code className="font-mono text-xs">pacman.conf</code> to its original state.
                    </p>
                    <CodeBlock lang="bash">{finalRestoreCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};