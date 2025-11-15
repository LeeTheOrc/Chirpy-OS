
import React from 'react';
import { CloseIcon, PackageIcon } from '../core/Icons';
import { CodeBlock } from '../core/CodeBlock';

interface ForgeDependenciesModalProps {
  onClose: () => void;
}

const FORGE_DEPS_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION & GLOBAL VARS ---
SYSTEM_REPO_DIR="/var/lib/kael-local-repo"
TEMP_DIR=""
TEMP_KEY_FILE=""
TMP_CONFIG=""

# --- GLOBAL CLEANUP TRAP ---
# This function will be called on script exit to clean up temporary files/directories.
cleanup() {
    # The '-n' checks if the variable is set, and the file/dir check ensures we don't try to delete nothing.
    [[ -n "$TEMP_DIR" && -d "$TEMP_DIR" ]] && rm -rf -- "$TEMP_DIR"
    [[ -n "$TEMP_KEY_FILE" && -f "$TEMP_KEY_FILE" ]] && rm -f -- "$TEMP_KEY_FILE"
    [[ -n "$TMP_CONFIG" && -f "$TMP_CONFIG" ]] && rm -f -- "$TMP_CONFIG"
    
    # Unmount and remove our system-wide repo dir if it was created
    # Use sudo here since we created it with sudo
    if mountpoint -q "\\\${SYSTEM_REPO_DIR}/repo" 2>/dev/null; then
        echo "--> Dismantling system-wide access point..."
        sudo umount "\\\${SYSTEM_REPO_DIR}/repo"
    fi
    if [ -d "$SYSTEM_REPO_DIR" ]; then
        sudo rm -rf "$SYSTEM_REPO_DIR"
    fi
}
trap cleanup EXIT SIGINT SIGTERM


echo "--- Forge Dependencies Ritual ---"
echo "This ritual prepares your system by installing essential tools and attuning it to our allies' repositories."

# --- [1/5] Install Bootstrap Tools ---
echo ""
echo "--> [1/5] Installing bootstrap tools (base-devel, curl)..."
# We only install the absolute minimum needed for the rest of the script to function.
# The rest of the tools are installed after all repositories are configured.
sudo pacman -S --needed --noconfirm base-devel curl
echo "✅ Bootstrap tools are ready."
echo ""

# --- [2/5] Attune to CachyOS Repository ---
echo "--> [2/5] Attuning to the CachyOS repository for performance-tuned artifacts..."
if pacman -Q cachyos-keyring > /dev/null 2>&1; then
    echo "--> CachyOS keyring already installed. Skipping attunement."
else
    TEMP_DIR=$(mktemp -d)
    echo "--> Summoning CachyOS setup scripts to \\\${TEMP_DIR}..."
    (
        cd "$TEMP_DIR"
        curl -fsSL "https://mirror.cachyos.org/cachyos-repo.tar.xz" -o "cachyos-repo.tar.xz"
        tar xvf cachyos-repo.tar.xz > /dev/null
        cd cachyos-repo && sudo ./cachyos-repo.sh
    )
    echo "✅ CachyOS repository attuned successfully."
fi
echo ""

# --- [3/5] Attune to Chaotic-AUR Repository ---
echo "--> [3/5] Attuning to the Chaotic-AUR for a vast selection of pre-built packages..."
if pacman -Q chaotic-keyring > /dev/null 2>&1; then
    echo "--> Chaotic-AUR keyring already installed. Skipping attunement."
else
    echo "--> Retrieving and signing the Chaotic-AUR master key..."
    sudo pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
    sudo pacman-key --lsign-key 3056513887B78AEB
    
    echo "--> Installing Chaotic-AUR keyring and mirrorlist packages..."
    # Pacman can handle https urls for -U, so curl is not a hard dependency for this step
    sudo pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'

    echo "--> Appending Chaotic-AUR to pacman configuration..."
    if ! grep -q "^\\[chaotic-aur\\]" /etc/pacman.conf; then
        echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" | sudo tee -a /etc/pacman.conf > /dev/null
    fi
    echo "✅ Chaotic-AUR repository attuned successfully."
fi
echo ""

# --- [4/5] Attune to Kael OS Athenaeum ---
echo "--> [4/5] Attuning to the Kael OS Athenaeum (Local & Online)..."
# Part A: Keyring Attunement
if sudo pacman-key --list-keys "LeeTheOrc" >/dev/null 2>&1; then
    echo "--> Kael OS master key already trusted. Skipping key attunement."
else
    echo "--> Summoning and trusting the Kael OS master key..."
    KEY_URL="https://raw.githubusercontent.com/LeeTheOrc/kael-os-repo/gh-pages/kael-os.asc"
    TEMP_KEY_FILE=$(mktemp)
    if ! curl -fsSL "\\\${KEY_URL}" -o "\\\${TEMP_KEY_FILE}"; then
        echo "❌ ERROR: Failed to download the Kael OS master key." >&2
        exit 1
    fi
    KEY_ID=$(gpg --show-keys --with-colons "\\\${TEMP_KEY_FILE}" 2>/dev/null | grep '^pub' | cut -d: -f5)
    if [[ -z "\\\${KEY_ID}" ]]; then
        echo "❌ ERROR: Could not extract a valid Key ID from the downloaded key." >&2
        exit 1
    fi
    sudo pacman-key --add "\\\${TEMP_KEY_FILE}"
    sudo pacman-key --lsign-key "\\\${KEY_ID}"
    echo "✅ Kael OS master key is now trusted."
fi

# Part B: Repository Configuration
CONFIG_FILE="/etc/pacman.conf"
echo "--> Configuring Kael OS repositories in pacman.conf..."
BACKUP_FILE="/etc/pacman.conf.kael-deps.bak"
if [ ! -f "$BACKUP_FILE" ]; then
    sudo cp "$CONFIG_FILE" "$BACKUP_FILE"
    echo "--> Created backup: \\\${BACKUP_FILE}"
fi

# Correctly determine the user's home directory, even under sudo
USER_HOME=$(getent passwd "\\\${SUDO_USER:-\$USER}" | cut -d: -f6)
LOCAL_REPO_PATH="\$USER_HOME/forge/repo"

ONLINE_REPO_ENTRY="[kael-os]\\nSigLevel = Required DatabaseOptional\\nServer = https://leetheorc.github.io/kael-os-repo/"

TMP_CONFIG=$(mktemp)

# Conditionally add the local repo entry only if the DATABASE FILE exists
if [ -f "\$LOCAL_REPO_PATH/kael-os-local.db" ]; then
    echo "--> Sanctified local forge detected. Creating system-wide access point via bind mount..."
    
    REPO_MOUNT_POINT="\\\${SYSTEM_REPO_DIR}/repo"

    # The trap will handle unmounting and deletion on exit.
    sudo rm -rf "$SYSTEM_REPO_DIR"
    sudo mkdir -p "$REPO_MOUNT_POINT"
    
    # Create a bind mount. This makes the user's repo directory accessible at the system path
    # without running into home directory permission issues that can foil symlinks.
    sudo mount --bind "\$LOCAL_REPO_PATH" "\$REPO_MOUNT_POINT"
    
    LOCAL_REPO_SERVER="file://\\\${REPO_MOUNT_POINT}"
    # This SigLevel is crucial for security. It requires that both the packages
    # and the repository database itself are signed with a trusted GPG key.
    LOCAL_REPO_ENTRY="[kael-os-local]\\nSigLevel = Required DatabaseRequired\\nServer = \$LOCAL_REPO_SERVER"

    # The local repo MUST come first to be prioritized.
    printf "%b\\n\\n" "\$LOCAL_REPO_ENTRY" > "\$TMP_CONFIG"
else
    echo "--> No sanctified local forge detected. Using online-only Athenaeum."
    echo "    (If you have a local forge, run the 'sanctify-athenaeum' ritual)."
    # Create an empty temp file if no local repo
    > "\$TMP_CONFIG"
fi

# Append the rest of pacman.conf, but filter out our managed entries.
# The regexes here are carefully escaped for bash inside a JS template literal.
# We want awk to see '/^\\[section\\]/', so we escape the backslashes once for JS -> \\\\[
awk '
    /^\\\[kael-os-local\\\]/ { in_section=1; next }
    /^\\\[kael-os\\\]/       { in_section=1; next }
    /^\\s*\\\[/            { in_section=0 }
    !in_section         { print }
' "\$CONFIG_FILE" >> "\$TMP_CONFIG"

# Append our online repo entry to the end of the temp file.
printf "\\n%b\\n" "\$ONLINE_REPO_ENTRY" >> "\$TMP_CONFIG"

# Replace the original config with our new one.
cat "\$TMP_CONFIG" | sudo tee "\$CONFIG_FILE" > /dev/null
echo "✅ pacman.conf configured for Kael OS Athenaeum."
echo ""

# --- [5/5] Final Synchronization & Full Tool Installation ---
echo "--> [5/5] Synchronizing all package databases and installing remaining tools..."
sudo pacman -Sy

echo "--> Installing remaining forge tools..."
# Before installing, check for the old manual chronicler script and remove it to prevent conflicts.
echo "--> Checking for conflicting manual installations..."
if [ -f /usr/local/bin/chronicler ]; then
    echo "--> Found manual installation of 'chronicler'. Removing to allow package installation..."
    # We may need to remove the immutable flag set by the old package install script
    sudo chattr -i /usr/local/bin/chronicler &>/dev/null || true
    sudo rm -f /usr/local/bin/chronicler
fi

# Now that all repositories are configured, we can install everything else.
# Add davfs2 for WebDisk mounting
sudo pacman -S --needed --noconfirm git pacman-contrib lftp github-cli chronicler davfs2
echo "✅ All forge tools installed."


echo ""
echo "✨ Ritual Complete! Your forge is now fully equipped with all necessary dependencies."
`;

export const ForgeDependenciesModal: React.FC<ForgeDependenciesModalProps> = ({ onClose }) => {
    // The unified script is encoded to base64 to comply with Rune XVI.
    const encodedScript = btoa(unescape(encodeURIComponent(FORGE_DEPS_SCRIPT_RAW)));
    const finalForgeCommand = `echo "${encodedScript}" | base64 --decode | bash`;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                    <PackageIcon className="w-5 h-5 text-dragon-fire" />
                    <span>Install Forge Dependencies</span>
                </h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                <p>
                    This grand ritual prepares your system to become a true forge. It will install all necessary tools (including <code className="font-mono text-xs">davfs2</code> for WebDisk mounting) and attune your machine to our allied repositories, including CachyOS for performance-tuned artifacts, the Chaotic-AUR for a vast selection of packages, and our own Kael OS Athenaeum.
                </p>
                <p className="text-sm p-3 bg-orc-steel/10 border-l-4 border-orc-steel rounded">
                    <strong className="text-orc-steel">Conflict Resolution Update:</strong> This ritual will now automatically detect and remove any old, manually-installed <code className="font-mono text-xs">chronicler</code> scripts. This prevents the "conflicting files" error and allows the new, signed package to be installed correctly.
                </p>
                <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">The Unified Incantation</h3>
                <p>
                    Copy and run this single command in your terminal. It contains the entire ritual, encoded for a flawless execution.
                </p>
                <CodeBlock lang="bash">{finalForgeCommand}</CodeBlock>
            </div>
        </div>
    </div>
  );
};
