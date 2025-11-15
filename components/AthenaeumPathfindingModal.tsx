import React from 'react';
import { CloseIcon, FolderIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface AthenaeumPathfindingModalProps {
  onClose: () => void;
}

// FIX: The bash script was not inside a string, causing numerous syntax errors.
// It is now correctly defined as a template literal string.
// Additionally, all shell variables and command substitutions are properly escaped for use within a template literal.
const PATHFINDING_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

echo "--- Athenaeum Pathfinding Ritual ---"
echo "This ritual configures makepkg to use dedicated directories within your forge."
echo ""

# --- [1/3] Directory Creation ---
USER_HOME=\$(getent passwd "\${SUDO_USER:-\$USER}" | cut -d: -f6)
FORGE_BASE="\$USER_HOME/forge"
SRCDEST="\$FORGE_BASE/sources"
BUILDDIR="\$FORGE_BASE/build"
PKGDEST="\$FORGE_BASE/artifacts"
LOGDEST="\$FORGE_BASE/logs"

echo "--> [1/3] Creating dedicated directories for makepkg..."
mkdir -p "\$SRCDEST" "\$BUILDDIR" "\$PKGDEST" "\$LOGDEST"
echo "✅ Directories created:"
echo "   - Sources:    \$SRCDEST"
echo "   - Build:      \$BUILDDIR"
echo "   - Packages:   \$PKGDEST"
echo "   - Logs:       \$LOGDEST"
echo ""

# --- [2/3] Configuration Backup ---
CONFIG_FILE="/etc/makepkg.conf"
BACKUP_FILE="/etc/makepkg.conf.kael-path.bak"
echo "--> [2/3] Backing up current makepkg configuration..."
if [ ! -f "\$BACKUP_FILE" ]; then
    sudo cp "\$CONFIG_FILE" "\$BACKUP_FILE"
    echo "    -> Backup created at: \$BACKUP_FILE"
else
    echo "    -> Backup already exists. Skipping."
fi
echo "✅ Backup is secure."
echo ""

# --- [3/3] Update makepkg.conf ---
echo "--> [3/3] Scribing new paths into \$CONFIG_FILE..."
# Use a temporary file for atomic update
TMP_CONFIG=\$(mktemp)
trap 'rm -f -- "\$TMP_CONFIG"' EXIT

# Read the original file, filter out our settings, and append the new ones.
# This makes the script re-runnable.
awk '
    !/^#(.*)SRCDEST=/ && !/^SRCDEST=/ && \\
    !/^#(.*)BUILDDIR=/ && !/^BUILDDIR=/ && \\
    !/^#(.*)PKGDEST=/ && !/^PKGDEST=/ && \\
    !/^#(.*)LOGDEST=/ && !/^LOGDEST=/ \\
    { print }
' "\$CONFIG_FILE" > "\$TMP_CONFIG"

# Append our new, uncommented settings
{
    echo ""
    echo "#"
    echo "# Kael Forge: Custom Paths for a Tidy Workspace"
    echo "#"
    echo "SRCDEST=\$SRCDEST"
    echo "BUILDDIR=\$BUILDDIR"
    echo "PKGDEST=\$PKGDEST"
    echo "LOGDEST=\$LOGDEST"
} >> "\$TMP_CONFIG"

# Replace the original file with the modified one
cat "\$TMP_CONFIG" | sudo tee "\$CONFIG_FILE" > /dev/null

echo "✅ makepkg.conf has been updated."
echo ""
echo "✨ Ritual Complete! Your forge is now properly organized."
`;

export const AthenaeumPathfindingModal: React.FC<AthenaeumPathfindingModalProps> = ({ onClose }) => {
  // The unified script is encoded to base64 to comply with Rune XVI.
  const encodedScript = btoa(unescape(encodeURIComponent(PATHFINDING_SCRIPT_RAW)));
  const finalCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <FolderIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Configure Athenaeum Paths</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    A tidy forge is an efficient forge, Architect. This ritual organizes our workspace by instructing the master crafter, <code className="font-mono text-xs">makepkg</code>, to use dedicated directories for its work.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                    By default, <code className="font-mono text-xs">makepkg</code> can clutter your package source directories with downloaded files, build artifacts, and logs. This incantation re-routes all of that into a clean structure within <code className="font-mono text-xs">~/forge</code>, keeping our project directories pristine.
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>The 'Setup Local Forge' ritual must be complete to ensure <code className="font-mono text-xs">~/forge</code> exists.</li>
                </ul>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Pathfinding Incantation</h3>
                <p>
                    Run this command to create the directories and update your global <code className="font-mono text-xs">/etc/makepkg.conf</code> file.
                </p>
                 <CodeBlock lang="bash">{finalCommand}</CodeBlock>
            </div>
        </div>
    </div>
  );
};
