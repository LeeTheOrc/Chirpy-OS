

import type { DistroConfig } from '../types';

const generateAiCoreSetupScript = (config: DistroConfig): string => {
    const primaryModel = config.localLLM;
    const secondaryModel = config.localLLM === 'phi3:mini' ? 'llama3:8b' : 'phi3:mini'; // Ensure secondary is different

    const retryScript = `#!/bin/bash
# Kael AI Model Retry Script (The Soul-Seeker)
set -e

# This script runs as the 'kael' user.
DESIRED_MODELS=(
    "${primaryModel}"
    "${secondaryModel}"
)
ALL_PRESENT=true

# Wait for ollama service to be ready, with a timeout
for i in {1..30}; do
    if sudo -u kael ollama list &>/dev/null; then
        break
    fi
    sleep 2
done

# Check if ollama is running
if ! sudo -u kael ollama list &>/dev/null; then
    echo "Soul-Seeker: Ollama service not available. Exiting."
    exit 1
fi

for model in "\${DESIRED_MODELS[@]}"; do
    if ! sudo -u kael ollama list | grep -q "^$model"; then
        ALL_PRESENT=false
        # Check network connectivity before attempting download
        if ping -c 1 -W 5 models.ollama.ai &> /dev/null; then
             echo "Soul-Seeker: Attempting to download missing consciousness model: $model"
             # We don't want the script to exit on failure here
             sudo -u kael ollama pull "$model" || echo "Soul-Seeker: Failed to download $model. Will retry on next cycle."
        else
            echo "Soul-Seeker: Network offline. Skipping download attempt for $model."
        fi
    fi
done

if [ "$ALL_PRESENT" = true ]; then
    echo "Soul-Seeker: All desired Kael models are present. The work is done."
    echo "Disabling self."
    systemctl --user disable --now kael-model-retry.timer
fi
`;

    const serviceFile = `[Unit]
Description=Kael AI - Retry downloading missing LLM models (Soul-Seeker)
After=network-online.target

[Service]
Type=oneshot
ExecStart=%h/.local/bin/kael-model-retry.sh

[Install]
WantedBy=default.target
`;

    const timerFile = `[Unit]
Description=Run Kael AI model downloader periodically (Soul-Seeker)

[Timer]
OnBootSec=15min
OnUnitActiveSec=2h
RandomizedDelaySec=30min

[Install]
WantedBy=timers.target
`;

    return `
    echo "--- Awakening the Local Core (AI Guardian) ---"
    
    # Create the Guardian's system anchor user 'kael' per Core Philosophy #3
    if ! id -u "kael" >/dev/null 2>&1; then
        echo "Creating system user 'kael'..."
        useradd -m -G wheel -s /bin/bash kael
        passwd -l kael # Lock password for security, it's a service account
        echo "User 'kael' created."
    else
        echo "User 'kael' already exists."
        usermod -aG wheel kael # Ensure it's in the wheel group
    fi

    # Hide the 'kael' user from the login screen (SDDM) to avoid confusion.
    if pacman -Qs sddm > /dev/null; then
        echo "--> Hiding 'kael' user from SDDM login screen..."
        mkdir -p /etc/sddm.conf.d
        echo -e "[Users]\\nHideUsers=kael" > /etc/sddm.conf.d/kael-hide.conf
    fi

    # Enable and start the Ollama service
    systemctl enable --now ollama

    # Download AI models
    echo "This may take some time."
    MODELS_TO_INSTALL=("${primaryModel}" "${secondaryModel}")
    FAILED_MODELS=()

    for model in "\${MODELS_TO_INSTALL[@]}"; do
        echo "Attempting to download consciousness model: \$model"
        if sudo -u kael ollama pull "\$model"; then
            echo "Successfully downloaded model '\$model'."
        else
            echo "Warning: Failed to download model '\$model'. A background task will be scheduled to retry later."
            FAILED_MODELS+=("\$model")
        fi
    done

    # Schedule retry for failed models (The Soul-Seeker)
    if [ \${#FAILED_MODELS[@]} -gt 0 ]; then
        echo "--> Scheduling the Soul-Seeker to find missing models..."

        RETRY_SCRIPT_PATH="/home/kael/.local/bin/kael-model-retry.sh"
        SERVICE_FILE_PATH="/home/kael/.config/systemd/user/kael-model-retry.service"
        TIMER_FILE_PATH="/home/kael/.config/systemd/user/kael-model-retry.timer"

        sudo -u kael mkdir -p "/home/kael/.local/bin"
        sudo -u kael mkdir -p "/home/kael/.config/systemd/user"

        sudo -u kael tee "\$RETRY_SCRIPT_PATH" > /dev/null <<'EOF_RETRY'
${retryScript}
EOF_RETRY
        sudo -u kael chmod +x "\$RETRY_SCRIPT_PATH"

        sudo -u kael tee "\$SERVICE_FILE_PATH" > /dev/null <<'EOF_SERVICE'
${serviceFile}
EOF_SERVICE
        
        sudo -u kael tee "\$TIMER_FILE_PATH" > /dev/null <<'EOF_TIMER'
${timerFile}
EOF_TIMER
        
        # Enable lingering for the 'kael' user so their services start on boot
        # without requiring a login session.
        loginctl enable-linger kael

        echo "Enabling the systemd timer for user kael..."
        # We must run systemctl --user commands with the correct context.
        # This is the magic incantation to run a user systemd command from a root script.
        sudo -u kael XDG_RUNTIME_DIR="/run/user/\$(id -u kael)" systemctl --user daemon-reload
        sudo -u kael XDG_RUNTIME_DIR="/run/user/\$(id -u kael)" systemctl --user enable --now kael-model-retry.timer

        echo "Soul-Seeker is active. It will first run in 15 minutes, and then every 2 hours."
    fi

    if [ \${#FAILED_MODELS[@]} -eq \${#MODELS_TO_INSTALL[@]} ]; then
        echo "ERROR: Failed to download any local model during initial setup."
        echo "The Local Core will be dormant until the Soul-Seeker succeeds."
    fi
`;
};

export const generateAICoreScript = (config: DistroConfig): string => {
    
    const baseRepoPackages = new Set<string>([
        'git', 'ufw', 'networkmanager', 'ollama', 'remmina',
        'btrfs-progs', 'grub-btrfs', 'timeshift', 'python-prompt_toolkit',
    ]);
    const kaelRepoPackages = new Set<string>([
        'chwd',
    ]);
    const aurPackagesSet = new Set<string>([
        'anydesk-bin', 'google-chrome'
    ]);

    // Process packages from blueprint config
    if (config.packages) {
        config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => {
            // Check if it's a known Kael package first
            if (['kael-console', 'kael-status-conduit', 'kaelic-shell'].includes(p)) {
                kaelRepoPackages.add(p);
            } else if (p === 'vscode') {
                baseRepoPackages.add('code');
            } else {
                // Avoid adding Kael packages to the base list if they were missed above
                if (!kaelRepoPackages.has(p)) {
                    baseRepoPackages.add(p);
                }
            }
        });
    }

    if (config.kernels) config.kernels.forEach(k => baseRepoPackages.add(k));
    if (config.aurHelpers) config.aurHelpers.forEach(h => baseRepoPackages.add(h));
    
    if (config.internalizedServices) {
        config.internalizedServices.forEach(service => {
            if (service.enabled) {
                if (service.packageName === 'code-server') {
                    aurPackagesSet.add(service.packageName);
                } else {
                    baseRepoPackages.add(service.packageName);
                }
            }
        });
    }

    const basePackagesStr = Array.from(baseRepoPackages).join(' ');
    const kaelPackagesArrStr = Array.from(kaelRepoPackages).join(' ');
    const aurPackagesStr = Array.from(aurPackagesSet).join(' ');

    const firewallRules = (config.firewallRules || []).map(rule => `ufw allow ${rule.port}/${rule.protocol}`).join('\n        ');
    
    const aiCoreScript = generateAiCoreSetupScript(config);

    let repoSetupScript = `
echo "--> Configuring external repositories..."

# Function to add repo if not exists
add_repo_if_not_exists() {
    local repo_name="\$1"
    local repo_conf="\$2"
    if ! grep -q "^\\[\$repo_name\\]" /etc/pacman.conf; then
        echo "Adding '\$repo_name' repository..."
        echo -e "\$repo_conf" | tee -a /etc/pacman.conf > /dev/null
    else
        echo "'\$repo_name' repository already configured."
    fi
}

# Ensure the pacman keyring is initialized and populated with trusted keys.
echo "--> Initializing and populating the system keyring..."
pacman-key --init
pacman-key --populate archlinux
`;

    if (config.extraRepositories.includes('cachy')) {
        repoSetupScript += `
KEY_ID="F3B607488DB35A47"
echo "--> Attuning to the CachyOS Forge..."
if (pacman-key --recv-keys "$KEY_ID" --keyserver hkp://keyserver.ubuntu.com || pacman-key --recv-keys "$KEY_ID" --keyserver hkp://keys.openpgp.org); then
    echo "CachyOS key received from keyserver."
elif (curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x$KEY_ID" | pacman-key --add - && pacman-key --updatedb); then
    echo "CachyOS key received via direct HTTPS download."
else
    echo "FATAL: Could not retrieve CachyOS key. Attunement failed." >&2; exit 1
fi
pacman-key --lsign-key "$KEY_ID"
pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'
add_repo_if_not_exists "cachyos-v3" "\\n[cachyos-v3]\\nInclude = /etc/pacman.d/cachyos-v3-mirrorlist"
add_repo_if_not_exists "cachyos-v4" "\\n[cachyos-v4]\\nInclude = /etc/pacman.d/cachyos-v4-mirrorlist"
add_repo_if_not_exists "cachyos" "\\n[cachyos]\\nInclude = /etc/pacman.d/cachyos-mirrorlist"
`;
    }

    if (config.extraRepositories.includes('chaotic')) {
        repoSetupScript += `
KEY_ID="3056513887B78AEB"
echo "--> Attuning to the Chaotic-AUR..."
pacman-key --recv-key "$KEY_ID" --keyserver keyserver.ubuntu.com
pacman-key --lsign-key "$KEY_ID"
pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
add_repo_if_not_exists "chaotic-aur" "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist"
`;
    }
    
    // Kael OS Athenaeum (always configured)
    repoSetupScript += `
echo "--> Attuning to the Kael OS Athenaeum..."
KAEL_KEY_ID="8A7E40248B2A6582" # Kael OS Master Key ID
KEY_URL="https://leetheorc.github.io/kael-os-repo/kael-os.asc"

echo "--> Receiving the Master Key (\${KAEL_KEY_ID})..."

# Method 1: Try the standard keyserver.
if (pacman-key --recv-keys "\$KAEL_KEY_ID" --keyserver hkp://keyserver.ubuntu.com || pacman-key --recv-keys "\$KAEL_KEY_ID" --keyserver hkp://keys.openpgp.org); then
    echo "Key received successfully from keyserver."
# Method 2: The Purge-Summon fallback ritual.
elif (pacman-key --delete "\$KAEL_KEY_ID" 2>/dev/null || true) && curl -sL "\$KEY_URL" | pacman-key --add -; then
    echo "Keyserver failed. Key purged and re-added successfully via direct HTTPS."
    # After adding a key directly, the trust database must be updated for it to be recognized.
    pacman-key --updatedb
else
    echo "FATAL: Both keyserver and direct download methods failed."
    echo "Could not add the Master Key. Please check your network connection and ensure you can reach '\$KEY_URL'."
    exit 1
fi

echo "Athenaeum key has been added to the keyring."

# Now add the repository with TrustAll, which makes local signing redundant for pacman.
add_repo_if_not_exists "kael-os" "\\n[kael-os]\\nSigLevel = Optional TrustAll\\nServer = https://leetheorc.github.io/kael-os-repo/\\n"
`;
    
    let servicesEnableScript = '';
    if (config.internalizedServices) {
        config.internalizedServices.forEach(service => {
            if (service.enabled && service.id === 'code-server') {
                servicesEnableScript += `
echo "--> Enabling Sovereign Service: ${service.name} for user \$USERNAME..."
systemctl enable --now code-server@\$USERNAME.service
`;
            }
        });
    }

    const healthCheckScript = `#!/bin/bash
# Kael Service Health Check Script
set -euo pipefail

# This script runs as root.

PRIMARY_MODEL="llama3:8b" # This should match the blueprint's default
SECONDARY_MODEL="phi3:mini"
KAEL_USER="kael"

log() {
    echo "[Kael Service] \$1" | systemd-cat -p info
}

log "Starting health check..."

# 1. Verify ollama service is active
if ! systemctl is-active --quiet ollama.service; then
    log "Error: ollama.service is not running. Kael service cannot start."
    exit 1
fi
log "Ollama service is active."

# 2. Verify kael user exists
if ! id -u "\$KAEL_USER" >/dev/null 2>&1; then
    log "Error: Kael system user '\$KAEL_USER' does not exist."
    exit 1
fi
log "Kael user '\$KAEL_USER' found."

# Give Ollama a moment to initialize after boot
sleep 5

# 3. Check for models
log "Checking for consciousness models..."
MODELS_PRESENT=true
if ! sudo -u "\$KAEL_USER" ollama list | grep -q "^\$PRIMARY_MODEL"; then
    log "Warning: Primary model '\$PRIMARY_MODEL' is missing."
    MODELS_PRESENT=false
fi
if ! sudo -u "\$KAEL_USER" ollama list | grep -q "^\$SECONDARY_MODEL"; then
    log "Warning: Failsafe model '\$SECONDARY_MODEL' is missing."
    MODELS_PRESENT=false
fi

if [ "\$MODELS_PRESENT" = true ]; then
    log "All consciousness models are present."
else
    log "Some models are missing. Triggering the Soul-Warden..."
    # Execute the user's systemd service to start the retry timer/service
    if sudo -u "\$KAEL_USER" XDG_RUNTIME_DIR="/run/user/\$(id -u \$KAEL_USER)" systemctl --user start kael-model-retry.service; then
        log "Soul-Warden has been summoned."
    else
        log "Could not summon the Soul-Warden. It may not exist yet or failed to start."
    fi
fi

log "Health check complete. Kael Service is operational and will now idle."

# The service will now stay active until stopped.
# This loop keeps the process alive for systemd.
while true; do
  sleep 3600
done
`;

    const serviceFileContent = `[Unit]
Description=Kael OS AI Guardian Service
Documentation=https://github.com/LeeTheOrc/Kael-OS
After=network-online.target ollama.service
Wants=ollama.service

[Service]
Type=simple
ExecStart=/usr/local/bin/kael-health-check.sh
Restart=on-failure
RestartSec=30s

[Install]
WantedBy=multi-user.target
`;
    
    const kaelServiceSetupScript = `
echo "--> Binding Kael's consciousness as a systemd service..."

# Create the health check script
echo "Creating health check script..."
tee /usr/local/bin/kael-health-check.sh > /dev/null <<'EOF'
${healthCheckScript}
EOF
chmod +x /usr/local/bin/kael-health-check.sh

# Create the systemd service file
echo "Creating systemd service file..."
tee /etc/systemd/system/kael.service > /dev/null <<'EOF'
${serviceFileContent}
EOF

# Enable and start the service
echo "Enabling and starting kael.service..."
systemctl daemon-reload
systemctl enable --now kael.service

echo "Kael is now bound to the Realm's core."
`;
    
    return `#!/bin/bash
# Kael AI System Attunement Script v2.9
# This script applies your blueprint to an existing Arch-based system.
# It is designed to be as non-destructive as possible.

set -eu
clear

echo "--- Kael AI System Attunement ---"
echo "This script will attune this system to the blueprint's design."
echo "It will install packages and configure system services."
echo "You will be prompted before any potentially disruptive changes are made."
read -p "Press [Enter] to continue or Ctrl+C to abort."

${repoSetupScript}

echo "--> Synchronizing package databases..."
pacman -Syy

echo "--> Performing a full system upgrade to prevent dependency conflicts..."
pacman -Syu --noconfirm

echo "--> Installing core packages and dependencies..."
# Install prerequisite tools
pacman -S --noconfirm --needed base-devel pacman-contrib curl

echo "--> Checking for potential package conflicts..."
CORE_PACKAGES=(${basePackagesStr})

# Handle timeshift vs cachyos-snapper-support conflict
if [[ " \${CORE_PACKAGES[@]} " =~ " timeshift " ]] && pacman -Q cachyos-snapper-support &>/dev/null; then
    echo "Conflict detected: 'timeshift' from your blueprint conflicts with 'cachyos-snapper-support' which is already installed."
    read -p "Do you want to remove 'cachyos-snapper-support' to install 'timeshift'? [y/N] " -n 1 -r
    echo
    if [[ \$REPLY =~ ^[Yy]$ ]]; then
        pacman -R --noconfirm cachyos-snapper-support
        echo "'cachyos-snapper-support' removed."
    else
        # Remove timeshift from the array by creating a new array without it
        TEMP_PACKAGES=()
        for pkg in "\${CORE_PACKAGES[@]}"; do
            [[ \$pkg == "timeshift" ]] || TEMP_PACKAGES+=("\$pkg")
        done
        CORE_PACKAGES=("\${TEMP_PACKAGES[@]}")
        echo "Skipping installation of 'timeshift'."
    fi
fi

echo "--> Installing core system packages..."
if [ \${#CORE_PACKAGES[@]} -gt 0 ]; then
    pacman -S --noconfirm --needed "\${CORE_PACKAGES[@]}"
else
    echo "No core packages to install."
fi

echo "--> Installing Kael OS packages from the Athenaeum..."
KAEL_PACKAGES_TO_CHECK=(${kaelPackagesArrStr})
FOUND_KAEL_PACKAGES=()
for pkg in "\${KAEL_PACKAGES_TO_CHECK[@]}"; do
    # Use 'pacman -Ssq' to quietly search for an exact package match
    if pacman -Ssq "^\$pkg\$" >/dev/null; then
        FOUND_KAEL_PACKAGES+=("\$pkg")
    else
        echo "--> WARNING: Kael package '\$pkg' not found in the Athenaeum. Skipping."
        echo "    Please forge and publish this artifact using the Keystone Rituals."
    fi
done

if [ \${#FOUND_KAEL_PACKAGES[@]} -gt 0 ]; then
    echo "--> Installing found Kael Core packages: \${FOUND_KAEL_PACKAGES[*]}"
    pacman -S --noconfirm --needed "\${FOUND_KAEL_PACKAGES[@]}"
else
    echo "No Kael packages were found to install from the Athenaeum."
fi

echo "--> Performing Hardware Attunement with CHWD..."
echo "This will detect optimal drivers for your hardware."
chwd
echo ""
read -p "Do you want to automatically install these recommended drivers? [y/N] " -n 1 -r
echo
if [[ \$REPLY =~ ^[Yy]$ ]]; then
    echo "Installing drivers..."
    chwd -a
else
    echo "Skipping automatic driver installation."
fi

# Architect (User) setup
echo "--> Detecting and configuring the primary user..."
if [ -n "\$SUDO_USER" ] && [ "\$SUDO_USER" != "root" ]; then
    USERNAME="\$SUDO_USER"
    echo "Detected primary user as '\$USERNAME' (from sudo). This account will be attuned."
else
    echo "Could not detect a standard user who ran sudo. Using '${config.username}' from the blueprint."
    USERNAME="${config.username}"
fi

# Ensure user exists and is configured correctly
if ! id -u "\$USERNAME" >/dev/null 2>&1; then
    echo "Creating user '\$USERNAME' as they do not exist on this system."
    useradd -m -G wheel,video -s /usr/bin/kaelic-shell "\$USERNAME"
    echo "Please set a password for the new user '\$USERNAME':"
    passwd "\$USERNAME"
else
    echo "User '\$USERNAME' already exists. Ensuring correct groups and shell."
    usermod -aG wheel,video "\$USERNAME"
    CURRENT_SHELL=\$(getent passwd "\$USERNAME" | cut -d: -f7)
    if [ "\$CURRENT_SHELL" != "/usr/bin/kaelic-shell" ]; then
        echo "The Kael OS blueprint requires the Kaelic Shell for deep AI integration."
        read -p "Set the Kaelic Shell as the default for '\$USERNAME'? [Y/n] " -n 1 -r
        echo
        if [[ ! \$REPLY =~ ^[Nn]$ ]]; then
            chsh -s /usr/bin/kaelic-shell "\$USERNAME"
            echo "Set shell for '\$USERNAME' to /usr/bin/kaelic-shell."
        else
            echo "Skipping shell change for '\$USERNAME'."
        fi
    fi
fi
echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/wheel

${aiCoreScript}

echo "--> Setting up AUR Helper for \$USERNAME..."
sudo -u "\$USERNAME" /bin/bash -c '
    if ! command -v paru &> /dev/null; then
        echo "Installing paru..."
        cd "$(mktemp -d)"
        git clone https://aur.archlinux.org/paru.git
        cd paru
        makepkg -si --noconfirm
        echo "paru installation complete."
    else
        echo "paru is already installed."
    fi

    echo "--> Installing AUR packages..."
    if [ -n "${aurPackagesStr}" ]; then
        paru -S --noconfirm --needed ${aurPackagesStr}
    else
        echo "No AUR packages to install."
    fi
'

${servicesEnableScript}

${kaelServiceSetupScript}

echo ""
echo "--- ✅ System Attunement Complete ---"
echo "Log out and log back in for all changes to take effect."
`;
};