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
    sudo -u kael XDG_RUNTIME_DIR="/run/user/$(id -u kael)" systemctl --user daemon-reload
    sudo -u kael XDG_RUNTIME_DIR="/run/user/$(id -u kael)" systemctl --user enable --now kael-model-retry.timer
fi
`;
};

const getAurSetupScript = (config: DistroConfig): string => {
    return `#!/bin/bash
set -e
USERNAME="${config.username}"
echo "--- Setting up AUR Helper (paru) for Architect: $USERNAME ---"
# This script must be run as root after the user has been created.
if ! id -u "$USERNAME" >/dev/null 2>&1; then
    echo "User $USERNAME not found. Skipping AUR setup."
    exit 1
fi
sudo -u $USERNAME /bin/bash -c '
    cd "/home/$USERNAME"
    git clone https://aur.archlinux.org/paru.git
    chown -R "$USERNAME:$USERNAME" paru
    cd paru
    makepkg -si --noconfirm
    cd ..
    rm -rf paru
'
`;
};

const getAurPackagesScript = (config: DistroConfig): string => {
    return `#!/bin/bash
set -e
USERNAME="${config.username}"
echo "--- Installing AUR packages for Architect: $USERNAME ---"
sudo -u $USERNAME /bin/bash -c '
    paru -S --noconfirm --needed anydesk-bin
'
`;
};

const getFirewallSetupScript = (config: DistroConfig): string => {
    const rules = config.firewallRules.map(rule => `ufw allow ${rule.port}/${rule.protocol}`).join('\n');
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

const getKhwsScript = (): string => {
    return `#!/bin/bash
set -e
echo "--- Running the Ritual of Insight (khws) ---"
# Automatically detect and install all relevant drivers.
# The --quiet flag reduces verbosity for the installer log.
khws -a --quiet
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
pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com
pacman-key --lsign-key F3B607488DB35A47
pacman -U --noconfirm --needed /etc/pacman.d/cachyos-repo-files/cachyos-keyring-*.pkg.tar.zst /etc/pacman.d/cachyos-repo-files/cachyos-mirrorlist-*.pkg.tar.zst /etc/pacman.d/cachyos-repo-files/cachyos-v3-mirrorlist-*.pkg.tar.zst /etc/pacman.d/cachyos-repo-files/cachyos-v4-mirrorlist-*.pkg.tar.zst
echo -e "${cachyRepo}" >> /etc/pacman.conf
`;
    }
    if (config.extraRepositories?.includes('chaotic')) {
        scriptContent += `
echo "--- Configuring Chaotic-AUR Repository ---"
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
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

const generateLocaleConf = (config: DistroConfig): string => `
# Let Calamares autodetect, but have our blueprint as a fallback.
default-locale: "${config.locale}"
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

const generateUsersConf = (config: DistroConfig): string => `
# The user-creation module.
# Default username is from the blueprint. Password is set in the UI.
default-user-name: "${config.username}"
default-host-name: "${config.hostname}"
`;

const generatePackagesConf = (config: DistroConfig): string => {
    const packageList = new Set<string>([
        'base', 'base-devel', 'linux-firmware', 'sof-firmware',
        'networkmanager', 'git', 'reflector', 'efibootmgr', 'grub',
        'ollama', 'xorg', 'plasma-meta', 'sddm', 'konsole', 'dolphin',
        'ufw', 'gufw', 'kaccounts-integration', 'kaccounts-providers', 'kio-gdrive',
        'qemu-guest-agent', 'virtualbox-guest-utils', // Include both VM utils for universal ISO
        'remmina', 'google-chrome', 'khws' // Add khws to the core packages
    ]);
    config.kernels.forEach(k => packageList.add(k));
    config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => packageList.add(p));
    if (config.gpuDriver === 'nvidia') packageList.add('nvidia-dkms');
    else if (config.gpuDriver === 'amd') { packageList.add('mesa'); packageList.add('xf86-video-amdgpu'); }
    else if (config.gpuDriver === 'intel') { packageList.add('mesa'); packageList.add('xf86-video-intel'); }
    config.aurHelpers.forEach(h => packageList.add(h));

    if (config.extraRepositories.includes('kael-os')) {
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
-   # This is a list of shell processes.
    -   # First job: setup custom repositories
        name: "repositories"
        file: "/etc/calamares/scripts/setup-repos.sh"
        chrooted: true
    -   # Second job: run hardware detection
        name: "khws"
        file: "/etc/calamares/scripts/run-khws.sh"
        chrooted: true
    -   # Third job: setup AUR helper
        name: "aur"
        file: "/etc/calamares/scripts/setup-aur.sh"
        chrooted: true
    -   # Fourth job: install AUR packages
        name: "aur_packages"
        file: "/etc/calamares/scripts/install-aur-packages.sh"
        chrooted: true
    -   # Fifth job: configure firewall
        name: "firewall"
        file: "/etc/calamares/scripts/setup-firewall.sh"
        chrooted: true
    -   # Final job: attune the AI core
        name: "aicore"
        file: "/etc/calamares/scripts/attune-ai-core.sh"
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
        'modules/locale.conf': generateLocaleConf(config),
        'modules/keyboard.conf': '# Calamares will handle keyboard layout selection visually.',
        'modules/partition.conf': generatePartitionConf(config),
        'modules/users.conf': generateUsersConf(config),
        'modules/packages.conf': generatePackagesConf(config),
        'modules/shellprocess.conf': generateShellprocessConf(),
        'modules/finished.conf': 'show-logs: true',
        
        // Main configurations
        'settings.conf': generateBrandingConf(),
        'modules.conf': generateModulesConf(),

        // Post-install scripts
        'scripts/setup-repos.sh': getRepoSetupScript(config),
        'scripts/run-khws.sh': getKhwsScript(),
        'scripts/setup-aur.sh': getAurSetupScript(config),
        'scripts/install-aur-packages.sh': getAurPackagesScript(config),
        'scripts/setup-firewall.sh': getFirewallSetupScript(config),
        'scripts/attune-ai-core.sh': getAiCoreSetupScript(config),
    };
};