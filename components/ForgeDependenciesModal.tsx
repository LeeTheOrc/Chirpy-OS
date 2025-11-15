import React from 'react';
import { CloseIcon, BeakerIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface ForgeDependenciesModalProps {
  onClose: () => void;
}

const DEPENDENCIES_SCRIPT_RAW = `#!/bin/bash
set -euo pipefail

# --- GLOBAL CLEANUP TRAP ---
# This function will be called on script exit to clean up temporary files/directories.
cleanup() {
    # The '-n' checks if the variable is set, and the file/dir check ensures we don't try to delete nothing.
    [[ -n "\${TEMP_DIR-}" && -d "$TEMP_DIR" ]] && rm -rf -- "$TEMP_DIR"
    [[ -n "\${TEMP_KEY_FILE-}" && -f "$TEMP_KEY_FILE" ]] && rm -f -- "$TEMP_KEY_FILE"
    [[ -n "\${TMP_CONFIG-}" && -f "$TMP_CONFIG" ]] && rm -f -- "$TMP_CONFIG"
}
trap cleanup EXIT SIGINT SIGTERM


echo "--- Forge Dependencies Ritual ---"
echo "This ritual prepares your system by installing essential tools and attuning it to our allies' repositories."

# --- [1/5] Install Core Forge Tools ---
echo ""
echo "--> [1/5] Installing core development tools (base-devel, git, curl, etc.)..."
# Use --needed to only install missing packages. Added 'curl' as it's required by subsequent steps.
# This now includes 'chronicler', assuming it has been published to the local/remote repo.
sudo pacman -S --needed --noconfirm base-devel git pacman-contrib lftp github-cli curl chronicler
echo "✅ Core tools are ready."
echo ""

# --- [2/5] Attune to CachyOS Repository ---
echo "--> [2/5] Attuning to the CachyOS repository for performance-tuned artifacts..."
if pacman -Q cachyos-keyring > /dev/null 2>&1; then
    echo "--> CachyOS keyring already installed. Skipping attunement."
else
    TEMP_DIR=$(mktemp -d)
    echo "--> Summoning CachyOS setup scripts to \${TEMP_DIR}..."
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
    if ! curl -fsSL "\${KEY_URL}" -o "\${TEMP_KEY_FILE}"; then
        echo "❌ ERROR: Failed to download the Kael OS master key." >&2
        exit 1
    fi
    KEY_ID=\$(gpg --show-keys --with-colons "\${TEMP_KEY_FILE}" 2>/dev/null | grep '^pub' | cut -d: -f5)
    if [[ -z "\${KEY_ID}" ]]; then
        echo "❌ ERROR: Could not extract a valid Key ID from the downloaded key." >&2
        exit 1
    fi
    sudo pacman-key --add "\${TEMP_KEY_FILE}"
    sudo pacman-key --lsign-key "\${KEY_ID}"
    echo "✅ Kael OS master key is now trusted."
fi

# Part B: Repository Configuration
CONFIG_FILE="/etc/pacman.conf"
if grep -q "^\\[kael-os-local\\]" "\${CONFIG_FILE}"; then
    echo "--> Kael OS repositories already configured in pacman.conf. Skipping."
else
    echo "--> Configuring Kael OS repositories in pacman.conf..."
    BACKUP_FILE="/etc/pacman.conf.kael-deps.bak"
    if [ ! -f "\$BACKUP_FILE" ]; then
        sudo cp "\$CONFIG_FILE" "\$BACKUP_FILE"
        echo "--> Created backup: \${BACKUP_FILE}"
    fi
    
    # Correctly determine the user's home directory, even under sudo
    USER_HOME=\$(getent passwd "\${SUDO_USER:-\$USER}" | cut -d: -f6)
    
    LOCAL_REPO_SERVER="file://\${USER_HOME}/forge/repo"
    LOCAL_REPO_ENTRY="[kael-os-local]\\nSigLevel = Required DatabaseOptional\\nServer = \${LOCAL_REPO_SERVER}"
    ONLINE_REPO_ENTRY="[kael-os]\\nSigLevel = Required DatabaseOptional\\nServer = https://leetheorc.github.io/kael-os-repo/"
    
    TMP_CONFIG=\$(mktemp)
    
    printf "%b\\n\\n" "\$LOCAL_REPO_ENTRY" > "\$TMP_CONFIG"
    awk '
      /^\\[kael-os-local\\]/ { in_section=1; next }
      /^\\[kael-os\\]/       { in_section=1; next }
      /^\\s*\\[/           { in_section=0 }
      !in_section       { print }
    ' "\$CONFIG_FILE" >> "\$TMP_CONFIG"
    printf "\\n%b\\n" "\$ONLINE_REPO_ENTRY" >> "\$TMP_CONFIG"
    
    cat "\$TMP_CONFIG" | sudo tee "\$CONFIG_FILE" > /dev/null
    echo "✅ pacman.conf configured for Kael OS Athenaeum."
fi
echo ""

# --- [5/5] Final Synchronization ---
echo "--> [5/5] Synchronizing all package databases..."
sudo pacman -Sy

echo ""
echo "✨ Ritual Complete! Your forge is now fully equipped with all necessary dependencies."
`;

export const ForgeDependenciesModal: React.FC<ForgeDependenciesModalProps> = ({ onClose }) => {
    // UTF-8 safe encoding
    const encodedScript = btoa(unescape(encodeURIComponent(DEPENDENCIES_SCRIPT_RAW)));
    const finalSetupCommand = `echo "${encodedScript}" | base64 --decode | bash`;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <BeakerIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Forge Dependencies Ritual</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, this is our master ritual for preparing a new system. It ensures all the tools, libraries, and allied connections we need are in place before we begin our work.
                    </p>
                    <p className="text-sm p-3 bg-magic-purple/10 border-l-4 border-magic-purple rounded mt-2">
                        This one incantation will:
                         <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Install essential packages like <code className="font-mono text-xs">base-devel</code>, <code className="font-mono text-xs">git</code>, <code className="font-mono text-xs">github-cli</code>, and our own <code className="font-mono text-xs">chronicler</code>.</li>
                            <li>Attune <code className="font-mono text-xs">pacman</code> to the official <strong className="text-forge-text-primary">CachyOS</strong> repository for performance-tuned artifacts.</li>
                            <li>Attune <code className="font-mono text-xs">pacman</code> to the <strong className="text-forge-text-primary">Chaotic-AUR</strong> for a vast library of pre-compiled AUR packages.</li>
                            <li>Attune <code className="font-mono text-xs">pacman</code> to our own <strong className="text-forge-text-primary">Kael OS Athenaeum</strong>, prioritizing your local package mirror first.</li>
                        </ul>
                    </p>
                    
                    <h3 className="font-semibold text-lg text-magic-purple mt-4 mb-2">The Dependencies Incantation (Run Once on New Systems)</h3>
                    <p>
                        Run this command on any new Arch-based system to prepare it for our forge rituals. It is safe to run multiple times, as it will intelligently skip steps that have already been completed.
                    </p>
                    <CodeBlock lang="bash">{finalSetupCommand}</CodeBlock>
                </div>
            </div>
        </div>
    );
};