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

        echo -e '${retryScript}' | sudo -u kael tee "\$RETRY_SCRIPT_PATH" > /dev/null
        sudo -u kael chmod +x "\$RETRY_SCRIPT_PATH"

        echo -e '${serviceFile}' | sudo -u kael tee "\$SERVICE_FILE_PATH" > /dev/null
        echo -e '${timerFile}' | sudo -u kael tee "\$TIMER_FILE_PATH" > /dev/null
        
        # Enable lingering for the 'kael' user so their services start on boot
        # without requiring a login session.
        loginctl enable-linger kael

        echo "Enabling the systemd timer for user kael..."
        # We must run systemctl --user commands with the correct context.
        # This is the magic incantation to run a user systemd command from a root script.
        sudo -u kael XDG_RUNTIME_DIR="/run/user/$(id -u kael)" systemctl --user daemon-reload
        sudo -u kael XDG_RUNTIME_DIR="/run/user/$(id -u kael)" systemctl --user enable --now kael-model-retry.timer

        echo "Soul-Seeker is active. It will first run in 15 minutes, and then every 2 hours."
    fi

    if [ \${#FAILED_MODELS[@]} -eq \${#MODELS_TO_INSTALL[@]} ]; then
        echo "ERROR: Failed to download any local model during initial setup."
        echo "The Local Core will be dormant until the Soul-Seeker succeeds."
    fi
`;
};

export const generateAICoreScript = (config: DistroConfig): string => {
    
    const packageList = new Set<string>([
        'git', 'ufw', 'networkmanager', 'ollama', 'remmina',
        // Kael OS core components
        'chwd', 'btrfs-progs', 'grub-btrfs', 'timeshift', 'zsh',
    ]);
    if (config.packages) config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => packageList.add(p));
    if (config.kernels) config.kernels.forEach(k => packageList.add(k));
    if (config.aurHelpers) config.aurHelpers.forEach(h => packageList.add(h));
    if (config.internalizedServices) {
        config.internalizedServices.forEach(service => {
            if (service.enabled) {
                packageList.add(service.packageName);
            }
        });
    }
    const packages = Array.from(packageList).join(' ');

    const firewallRules = (config.firewallRules || []).map(rule => `ufw allow ${rule.port}/${rule.protocol}`).join('\n        ');
    
    const aiCoreScript = generateAiCoreSetupScript(config);

    const repoSetupScript = `
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

# Kael OS Athenaeum
echo "--> Attuning to the Kael OS Athenaeum..."
KAEL_KEY_ID="8A7E40248B2A6582" # Kael OS Master Key ID
KEY_URL="https://leetheorc.github.io/kael-os-repo/kael-os.asc"

# Ensure the pacman keyring is initialized.
pacman-key --init

echo "Trusting the Master Key (\${KAEL_KEY_ID}) via direct download..."

# Attempt to download the key directly from our own Athenaeum.
if curl -sL "\$KEY_URL" | pacman-key --add -; then
    echo "Key downloaded and added successfully."
    pacman-key --lsign-key "\$KAEL_KEY_ID"
    echo "Athenaeum key has been trusted."
else
    echo "WARNING: Failed to download the Master Key from \$KEY_URL."
    echo "Attempting fallback to public keyserver..."
    if pacman-key --recv-keys "\$KAEL_KEY_ID" --keyserver keys.openpgp.org; then
        pacman-key --lsign-key "\$KAEL_KEY_ID"
        echo "Athenaeum key has been trusted via fallback."
    else
        echo "FATAL: Could not retrieve key from direct download or keyserver."
        echo "Please check your internet connection and repository status."
        exit 1
    fi
fi

# Now add the repository with signature checking required.
add_repo_if_not_exists "kael-os" "\\n[kael-os]\\nSigLevel = Required\\nServer = https://leetheorc.github.io/kael-os-repo/\\n"
`;
    
    let servicesEnableScript = '';
    if (config.internalizedServices) {
        config.internalizedServices.forEach(service => {
            if (service.enabled && service.id === 'code-server') {
                servicesEnableScript += `
echo "--> Enabling Sovereign Service: ${service.name} for user \${USERNAME}..."
systemctl enable --now code-server@\${USERNAME}.service
`;
            }
        });
    }
    
    return `#!/bin/bash
# Kael AI System Attunement Script v2.2
# This script applies your blueprint to an existing Arch-based system.
# It is NON-DESTRUCTIVE and will not partition disks.

set -eu
clear

echo "--- Kael AI System Attunement ---"
echo "This script will attune this system to the blueprint's design."
echo "It will install packages and configure system services."
read -p "Press [Enter] to continue or Ctrl+C to abort."

${repoSetupScript}

echo "--> Synchronizing package databases..."
pacman -Syy

echo "--> Installing core packages and dependencies..."
# Install base-devel if not present for paru build, and pacman-contrib for other tools.
pacman -S --noconfirm --needed base-devel pacman-contrib
pacman -S --noconfirm --needed ${packages}

echo "--> Preserving existing system settings (hostname, timezone, locale)..."
# This script attunes the system without overwriting your core configuration.

echo "--> Performing Hardware Attunement with CHWD..."
echo "This will detect and install optimal drivers for your hardware."
chwd -a --noconfirm

# Architect (User) setup
echo "--> Detecting and configuring the primary user..."
if [ -n "\$SUDO_USER" ] && [ "\$SUDO_USER" != "root" ]; then
    USERNAME="\$SUDO_USER"
    echo "Detected primary user as '\$USERNAME' (from sudo). This account will be attuned."
else
    echo "Could not detect a standard user who ran sudo. Using '\${config.username}' from the blueprint."
    USERNAME="${config.username}"
fi

# Ensure user exists and is configured correctly
if ! id -u "\$USERNAME" >/dev/null 2>&1; then
    echo "Creating user '\$USERNAME' as they do not exist on this system."
    useradd -m -G wheel,video -s /bin/zsh "\$USERNAME"
    echo "Please set a password for the new user '\$USERNAME':"
    passwd "\$USERNAME"
else
    echo "User '\$USERNAME' already exists. Ensuring correct groups and shell."
    usermod -aG wheel,video "\$USERNAME"
    CURRENT_SHELL=\$(getent passwd "\$USERNAME" | cut -d: -f7)
    if [ "\$CURRENT_SHELL" != "/bin/zsh" ]; then
        chsh -s /bin/zsh "\$USERNAME"
        echo "Set shell for '\$USERNAME' to /bin/zsh."
    fi
fi
echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/wheel

${aiCoreScript}

echo "--> Setting up AUR Helper for \$USERNAME..."
sudo -u "\$USERNAME" /bin/bash -c '
    if ! command -v paru &> /dev/null; then
        echo "Installing paru..."
        cd /tmp
        git clone https://aur.archlinux.org/paru.git --depth=1
        cd paru
        makepkg -si --noconfirm
        cd ..
        rm -rf paru
    else
        echo "paru is already installed."
    fi
'

echo "--> Installing additional AUR packages for \$USERNAME..."
sudo -u "\$USERNAME" /bin/bash -c '
    if command -v paru &> /dev/null; then
        paru -S --noconfirm --needed anydesk-bin google-chrome
    else
        echo "Warning: paru not found, skipping AUR package installation."
    fi
'

# Enable core services
echo "--> Enabling essential services..."
systemctl enable NetworkManager
systemctl enable bluetooth.service || echo "Bluetooth service not found, skipping."

# Firewall
echo "Configuring firewall..."
systemctl enable --now ufw
ufw default deny incoming
ufw default allow outgoing
${firewallRules}
ufw --force enable

# Display Manager
if pacman -Qs sddm > /dev/null; then
    echo "Enabling SDDM display manager..."
    systemctl enable sddm
fi

${servicesEnableScript}

echo "--> Finalizing bootloader and BTRFS integration..."
# Enable grub-btrfsd service for automatic snapshot detection on boot
if pacman -Qs grub-btrfs > /dev/null; then
    echo "Enabling grub-btrfs service..."
    systemctl enable grub-btrfsd
fi
# Update GRUB to detect new kernels and add snapshot entries
echo "Updating GRUB configuration..."
grub-mkconfig -o /boot/grub/grub.cfg

echo ""
echo "--- Attunement Complete ---"
echo "The system has been configured according to the blueprint."
echo "A reboot is recommended to apply all changes."
`;
};
