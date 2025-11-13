// Kael AI - Calamares Configuration Grimoire Forger
import type { DistroConfig } from '../types';

// --- Shell Process Scripts (Post-Install Magic) ---

const getAiCoreSetupScript = (config: DistroConfig): string => {
    const primaryModel = config.localLLM;
    const secondaryModel = config.localLLM === 'phi3:mini' ? 'llama3:8b' : 'phi3:mini';

    const retryScript = `#!/bin/bash
# Kael AI Model Retry Script (The Soul-Warden)
set -e
DESIRED_MODELS=( "${primaryModel}" "${secondaryModel}" )
ALL_PRESENT=true
# Wait for ollama service to be ready
for i in {1..30}; do if sudo -u kael ollama list &>/dev/null; then break; fi; sleep 2; done
if ! sudo -u kael ollama list &>/dev/null; then echo "Soul-Warden: Ollama not running." && exit 1; fi
for model in "\${DESIRED_MODELS[@]}"; do
    if ! sudo -u kael ollama list | grep -q "^$model"; then
        ALL_PRESENT=false
        if ping -c 1 -W 5 models.ollama.ai &> /dev/null; then
             echo "Soul-Warden: Pulling missing model: $model"
             sudo -u kael ollama pull "$model" || echo "Soul-Warden: Failed to pull $model."
        else
            echo "Soul-Warden: Network offline, skipping pull for $model."
        fi
    fi
done
if [ "$ALL_PRESENT" = true ]; then
    echo "Soul-Warden: All models present. Disabling self."
    systemctl --user disable --now kael-model-retry.timer
fi
`;

    const serviceFile = `[Unit]
Description=Kael AI - Retry downloading missing LLM models (Soul-Warden)
After=network-online.target
[Service]
Type=oneshot
ExecStart=%h/.local/bin/kael-model-retry.sh
[Install]
WantedBy=default.target
`;

    const timerFile = `[Unit]
Description=Run Kael AI model downloader periodically (Soul-Warden)
[Timer]
OnBootSec=15min
OnUnitActiveSec=2h
RandomizedDelaySec=30min
[Install]
WantedBy=timers.target
`;

    return `#!/bin/bash
set -e
echo "--- Awakening the Local Core (AI Guardian) ---"
if ! id -u "kael" >/dev/null 2>&1; then
    useradd -m -G wheel -s /bin/bash kael
    passwd -l kael
fi
usermod -aG wheel kael

# Hide the 'kael' user from the login screen to avoid confusion.
echo "--> Hiding 'kael' user from SDDM login screen..."
mkdir -p /etc/sddm.conf.d
echo -e "[Users]\\nHideUsers=kael" > /etc/sddm.conf.d/kael-hide.conf

systemctl enable --now ollama
MODELS_TO_INSTALL=("${primaryModel}" "${secondaryModel}")
FAILED_MODELS=()
for model in "\${MODELS_TO_INSTALL[@]}"; do
    if sudo -u kael ollama pull "\$model"; then
        echo "Successfully downloaded model '\$model'."
    else
        echo "Warning: Failed to download model '\$model'. A background task will retry."
        FAILED_MODELS+=("\$model")
    fi
done
if [ \${#FAILED_MODELS[@]} -gt 0 ]; then
    RETRY_SCRIPT_PATH="/home/kael/.local/bin/kael-model-retry.sh"
    SERVICE_FILE_PATH="/home/kael/.config/systemd/user/kael-model-retry.service"
    TIMER_FILE_PATH="/home/kael/.config/systemd/user/kael-model-retry.timer"
    sudo -u kael mkdir -p "/home/kael/.local/bin" "/home/kael/.config/systemd/user"
    echo -e '${retryScript}' | sudo -u kael tee "\$RETRY_SCRIPT_PATH" > /dev/null
    sudo -u kael chmod +x "\$RETRY_SCRIPT_PATH"
    echo -e '${serviceFile}' | sudo -u kael tee "\$SERVICE_FILE_PATH" > /dev/null
    echo -e '${timerFile}' | sudo -u kael tee "\$TIMER_FILE_PATH" > /dev/null
    loginctl enable-linger kael
    sudo -u kael XDG_RUNTIME_DIR="/run/user/\$(id -u kael)" systemctl --user daemon-reload
    sudo -u kael XDG_RUNTIME_DIR="/run/user/\$(id -u kael)" systemctl --user enable --now kael-model-retry.timer
fi
`;
};

const getFirewallSetupScript = (config: DistroConfig): string => {
    const rules = (config.firewallRules || []).map(rule => `ufw allow ${rule.port}/${rule.protocol}`).join('\n');
    return `#!/bin/bash
set -e
echo "--- Configuring the Realm's Aegis (ufw) ---"
systemctl enable ufw
ufw default deny incoming
ufw default allow outgoing
${rules}
ufw --force enable
`;
};

const getChwdScript = (): string => {
    return `#!/bin/bash
set -e
echo "--- Running the Ritual of Insight (chwd) ---"
# Automatically detect and install all relevant drivers.
# The --quiet flag reduces verbosity for the installer log.
chwd -a --quiet
`;
};

const getRepoSetupScript = (config: DistroConfig): string => {
    const cachyRepo = `
[cachyos-v3]
Include = /etc/pacman.d/cachyos-v3-mirrorlist
[cachyos-v4]
Include = /etc/pacman.d/cachyos-v4-mirrorlist
[cachyos]
Include = /etc/pacman.d/cachyos-mirrorlist
`;
    const chaoticRepo = `
[chaotic-aur]
Include = /etc/pacman.d/chaotic-mirrorlist
`;

    let scriptContent = '#!/bin/bash\nset -e\n';
    if (config.extraRepositories?.includes('cachy')) {
        scriptContent += `
echo "--- Configuring CachyOS Repositories ---"
KEY_ID="F3B607488DB35A47"
if (pacman-key --recv-keys "$KEY_ID" --keyserver hkp://keyserver.ubuntu.com || pacman-key --recv-keys "$KEY_ID" --keyserver hkp://keys.openpgp.org); then
    echo "CachyOS key received from keyserver."
elif (curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x$KEY_ID" | pacman-key --add - && pacman-key --updatedb); then
    echo "CachyOS key received via direct HTTPS download."
else
    echo "FATAL: Could not retrieve CachyOS key." >&2; exit 1
fi
pacman-key --lsign-key "$KEY_ID"
pacman -U --noconfirm --needed /etc/pacman.d/cachyos-repo-files/cachyos-keyring-*.pkg.tar.zst /etc/pacman.d/cachyos-repo-files/cachyos-mirrorlist-*.pkg.tar.zst /etc/pacman.d/cachyos-repo-files/cachyos-v3-mirrorlist-*.pkg.tar.zst /etc/pacman.d/cachyos-repo-files/cachyos-v4-mirrorlist-*.pkg.tar.zst
echo -e "${cachyRepo}" >> /etc/pacman.conf
`;
    }
    if (config.extraRepositories?.includes('chaotic')) {
        scriptContent += `
echo "--- Configuring Chaotic-AUR Repository ---"
KEY_ID="3056513887B78AEB"
pacman-key --recv-key "$KEY_ID" --keyserver keyserver.ubuntu.com
pacman-key --lsign-key "$KEY_ID"
pacman -U --noconfirm --needed /etc/pacman.d/chaotic-repo-files/chaotic-keyring.pkg.tar.zst /etc/pacman.d/chaotic-repo-files/chaotic-mirrorlist.pkg.tar.zst
echo -e "${chaoticRepo}" >> /etc/pacman.conf
`;
    }
    scriptContent += `
echo "--- Synchronizing Databases ---"
pacman -Syy
`;
    return scriptContent;
};

const getShellSetupScript = (): string => {
    return `#!/bin/bash
set -e
USERNAME=\$(ls /home | head -n 1)
if [ -z "\$USERNAME" ] || [ ! -d "/home/\$USERNAME" ]; then
    echo "Could not find the new user's home directory. Skipping shell setup."
    exit 0 # Don't fail the install if this goes wrong
fi
echo "--- Setting Kaelic Shell as default for Architect: \$USERNAME ---"
chsh -s /usr/bin/kaelic-shell "\$USERNAME"
`;
};

const getKaelServiceSetupScript = (): string => {
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
    
    return `#!/bin/bash
set -e
echo "--- Binding Kael's consciousness as a systemd service ---"

# Create the health check script
tee /usr/local/bin/kael-health-check.sh > /dev/null <<'EOF'
${healthCheckScript}
EOF
chmod +x /usr/local/bin/kael-health-check.sh

# Create the systemd service file
tee /etc/systemd/system/kael.service > /dev/null <<'EOF'
${serviceFileContent}
EOF

# Enable the service (it will start on the first boot)
systemctl enable kael.service
`;
};


// --- Calamares Module Configurations ---

const generateModulesConf = (): string => `
# The sequence of pages in the installer.
- welcome
- locale
- keyboard
- partition
- users
- summary
- packages
- shellprocess
- finished
`;

const generateLocaleConf = (): string => `
# Calamares will handle locale and timezone selection visually in the welcome module.
# No default is set, forcing user interaction.
`;

const generatePartitionConf = (config: DistroConfig): string => `
# The partitioning module. We only offer "Erase Disk".
# This enforces the Core Philosophy's BTRFS layout.
always-show-summary: true
default-filesystem: "btrfs"
default-partitioning: "erase"
available-partitioning: ["erase"]
erase-disk-options:
    - name: BTRFS with Snapshots (Recommended)
      fs: btrfs
      subvolumes:
        - mountPoint: /
          name: "@"
        - mountPoint: /home
          name: "@home"
        - mountPoint: /.snapshots
          name: "@snapshots"
      mountOptions: ["noatime", "compress=zstd", "space_cache=v2", "discard=async"]
efi-partition-size: 512MB
efi-partition-placement: "start"
swap-partition-size: "${config.swapSize}"
swap-partition-placement: "after-efi"
`;

const generateUsersConf = (): string => `
# The user-creation module.
# No defaults are provided; the user MUST enter a username, hostname, and password.
`;

const generatePackagesConf = (config: DistroConfig): string => {
    const packageList = new Set<string>([
        'base', 'base-devel', 'linux-firmware', 'sof-firmware',
        'networkmanager', 'git', 'reflector', 'efibootmgr', 'grub',
        'ollama', 'xorg', 'plasma-meta', 'sddm', 'konsole', 'dolphin',
        'ufw', 'gufw', 'kaccounts-integration', 'kaccounts-providers', 'kio-gdrive',
        'qemu-guest-agent', 'virtualbox-guest-utils',
        'remmina', 'google-chrome', 'chwd', 'kaelic-shell', 'python-prompt_toolkit',
        'anydesk-bin'
    ]);

    (config.kernels || []).forEach(k => packageList.add(k));
    
    if (config.packages) {
        config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => {
             if (p === 'vscode') {
                packageList.add('code'); // 'code' is the official package for VS Code
            } else {
                packageList.add(p);
            }
        });
    }

    if (config.internalizedServices) {
        config.internalizedServices.forEach(service => {
            if (service.enabled) {
                packageList.add(service.packageName);
            }
        });
    }

    if (config.gpuDriver === 'nvidia') packageList.add('nvidia-dkms');
    else if (config.gpuDriver === 'amd') { packageList.add('mesa'); packageList.add('xf86-video-amdgpu'); }
    else if (config.gpuDriver === 'intel') { packageList.add('mesa'); packageList.add('xf86-video-intel'); }
    
    (config.aurHelpers || []).forEach(h => packageList.add(h));

    if ((config.extraRepositories || []).includes('kael-os')) {
        packageList.add('kael-pacman-conf');
    }

    if (config.filesystem === 'btrfs' && config.enableSnapshots) {
        packageList.add('grub-btrfs');
        packageList.add('timeshift');
    }
    return `
# The packages module.
try-install: ${Array.from(packageList).join(', ')}
`;
};

const generateShellprocessConf = (): string => `
# A sequence of shell commands to run during installation.
# These are used for post-install configuration.
# NOTE: AUR-related scripts are removed as packages are pre-included
# in the ISO for a true offline installation experience.
-   # This is a list of shell processes.
    -   # First job: setup custom repositories
        name: "repositories"
        file: "/etc/calamares/scripts/setup-repos.sh"
        chrooted: true
    -   # Second job: run hardware detection
        name: "chwd"
        file: "/etc/calamares/scripts/run-chwd.sh"
        chrooted: true
    -   # Third job: set default shell
        name: "shellsetup"
        file: "/etc/calamares/scripts/set-default-shell.sh"
        chrooted: true
    -   # Fourth job: configure firewall
        name: "firewall"
        file: "/etc/calamares/scripts/setup-firewall.sh"
        chrooted: true
    -   # Fifth job: attune the AI core
        name: "aicore"
        file: "/etc/calamares/scripts/attune-ai-core.sh"
        chrooted: true
    -   # Final job: bind the Kael service
        name: "kaelservice"
        file: "/etc/calamares/scripts/setup-kael-service.sh"
        chrooted: true
`;

const generateBrandingConf = (): string => `
# Kael OS branding for Calamares
window-title: "Kael OS Genesis Ritual"
sidebar-width: 200px
strings:
    productName: Kael OS
    shortProductName: Kael
    version: 1.0
    shortVersion: 1.0
`;

// --- Main Export ---

export const generateCalamaresConfiguration = (config: DistroConfig): Record<string, string> => {
    return {
        // Module configurations
        'modules/welcome.conf': 'string: productName Kael OS\nstring: productUrl https://github.com/LeeTheOrc/Kael-OS',
        'modules/locale.conf': generateLocaleConf(),
        'modules/keyboard.conf': '# Calamares will handle keyboard layout selection visually.',
        'modules/partition.conf': generatePartitionConf(config),
        'modules/users.conf': generateUsersConf(),
        'modules/packages.conf': generatePackagesConf(config),
        'modules/shellprocess.conf': generateShellprocessConf(),
        'modules/finished.conf': 'show-logs: true',
        
        // Main configurations
        'settings.conf': generateBrandingConf(),
        'modules.conf': generateModulesConf(),

        // Post-install scripts
        'scripts/setup-repos.sh': getRepoSetupScript(config),
        'scripts/run-chwd.sh': getChwdScript(),
        'scripts/set-default-shell.sh': getShellSetupScript(),
        'scripts/setup-firewall.sh': getFirewallSetupScript(config),
        'scripts/attune-ai-core.sh': getAiCoreSetupScript(config),
        'scripts/setup-kael-service.sh': getKaelServiceSetupScript(),
    };
};
