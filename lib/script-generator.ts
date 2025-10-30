import type { DistroConfig, BuildTarget } from './types';

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
        
        loginctl enable-linger kael

        echo "Enabling the systemd timer for user kael..."
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


export const generateInstallScript = (config: DistroConfig, target: BuildTarget): string => {
    // Generate a list of packages to install
    const packageList = new Set<string>([
        'base', 'base-devel', 'linux-firmware', 'sof-firmware',
        'networkmanager', 'dialog', 'git', 'reflector', 'efibootmgr', 'grub',
        'ollama' // Add ollama for the AI Core
    ]);

    if (config.kernels) config.kernels.forEach(k => packageList.add(k));
    if (config.packages) config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => packageList.add(p));
    
    // Desktop Environment
    packageList.add('xorg');
    packageList.add('plasma-meta');
    packageList.add('sddm');
    packageList.add('konsole');
    packageList.add('gwenview');
    packageList.add('dolphin');

    // GPU Drivers
    if (config.gpuDriver) {
        if (config.gpuDriver === 'nvidia') {
            packageList.add('nvidia-dkms');
        } else if (config.gpuDriver === 'amd') {
            packageList.add('mesa');
            packageList.add('xf86-video-amdgpu');
        } else if (config.gpuDriver === 'intel') {
            packageList.add('mesa');
            packageList.add('xf86-video-intel');
        }
    }
    
    // VM guest additions
    if (target === 'qemu') {
        packageList.add('qemu-guest-agent');
    } else if (target === 'virtualbox') {
        packageList.add('virtualbox-guest-utils');
    }

    // AUR Helper
    if (config.aurHelpers) config.aurHelpers.forEach(h => packageList.add(h));
    
    // BTRFS snapshots
    if (config.filesystem === 'btrfs' && config.enableSnapshots) {
        packageList.add('grub-btrfs');
        packageList.add('timeshift');
    }
    
    // Firewall
    packageList.add('ufw');
    packageList.add('gufw');

    // Online Accounts
    packageList.add('kaccounts-integration');
    packageList.add('kaccounts-providers');
    packageList.add('kio-gdrive');

    const packages = Array.from(packageList).join(' ');

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

    let pacmanConfRepos = '';
    if (config.extraRepositories?.includes('cachy')) {
        pacmanConfRepos += cachyRepo;
    }
    if (config.extraRepositories?.includes('chaotic')) {
        pacmanConfRepos += chaoticRepo;
    }

    const firewallRules = config.firewallRules.map(rule => `ufw allow ${rule.port}/${rule.protocol}`).join('\n        ');
    const aiCoreScript = generateAiCoreSetupScript(config);

    return `#!/bin/bash
# Kael OS Installation Script
# Generated by Kael AI for target: ${target}

set -e

# --- TUI Helper Functions ---
show_message() {
    dialog --title "$1" --msgbox "$2" 10 60
}

get_input() {
    dialog --title "$1" --inputbox "$2" 10 60 3>&1 1>&2 2>&3
}

get_password() {
    dialog --title "$1" --passwordbox "$2" 10 60 3>&1 1>&2 2>&3
}

confirm_action() {
    dialog --title "$1" --yesno "$2" 10 60
    return $?
}

# --- Script Start ---
clear
show_message "Welcome Architect" "Welcome to the Kael OS installation ritual. This guided process will forge your new Realm. Please ensure you have a stable internet connection."

# 1. Get user input and confirm settings
HOSTNAME=$(get_input "Hostname" "Please enter a hostname for your Realm:" || echo "${config.hostname}")
USERNAME=$(get_input "Username" "Please enter your desired username:" || echo "${config.username}")
PASSWORD=$(get_password "Master Key" "Set the Master Key (password) for your user account:")
ROOT_PASSWORD=$(get_password "Root Master Key" "Set the Master Key (password) for the root account:")

lsblk -d -o NAME,SIZE,MODEL
TARGET_DISK=$(get_input "Target Disk" "Enter the target disk for installation (e.g., /dev/sda):" || echo "${config.targetDisk}")

CONFIRM_SUMMARY="
Realm Name: $HOSTNAME
Master User: $USERNAME
Target Disk: $TARGET_DISK (ALL DATA WILL BE ERASED)

Are you ready to begin the forging?
"
confirm_action "Confirmation" "$CONFIRM_SUMMARY" || { show_message "Aborted" "The forging has been aborted."; exit 1; }

# 2. Setup network and time
show_message "Network Setup" "Connecting to the aether..."
timedatectl set-ntp true
systemctl start NetworkManager
show_message "Network Setup" "Successfully connected."

# 3. Partitioning and Formatting
show_message "Partitioning" "Etching runes upon the disk: $TARGET_DISK..."
sgdisk -Z $TARGET_DISK
sgdisk -n 1:0:+${config.efiPartitionSize} -t 1:ef00 -c 1:"EFI System Partition" $TARGET_DISK
sgdisk -n 2:0:+${config.swapSize} -t 2:8200 -c 2:"Swap" $TARGET_DISK
sgdisk -n 3:0:0 -t 3:8300 -c 3:"Linux Root" $TARGET_DISK

PART_EFI="\${TARGET_DISK}1"
PART_SWAP="\${TARGET_DISK}2"
PART_ROOT="\${TARGET_DISK}3"
if [ -b "\${TARGET_DISK}p1" ]; then
    PART_EFI="\${TARGET_DISK}p1"
    PART_SWAP="\${TARGET_DISK}p2"
    PART_ROOT="\${TARGET_DISK}p3"
fi

mkfs.fat -F32 \$PART_EFI
mkswap \$PART_SWAP
mkfs.btrfs -f \$PART_ROOT
show_message "Partitioning" "Disk runes etched successfully."

# 4. Mount filesystems
show_message "Mounting" "Binding the foundations..."
mount \$PART_ROOT /mnt
swapon \$PART_SWAP

# Create BTRFS subvolumes for snapshots
btrfs subvolume create /mnt/@
btrfs subvolume create /mnt/@home
btrfs subvolume create /mnt/@snapshots
umount /mnt

mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@ \$PART_ROOT /mnt
mkdir -p /mnt/{boot,home,.snapshots}
mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@home \$PART_ROOT /mnt/home
mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@snapshots \$PART_ROOT /mnt/.snapshots
mount \$PART_EFI /mnt/boot
show_message "Mounting" "Foundations bound."

# 5. Pacstrap
show_message "Pacstrap" "Invoking the software spirits... This may take some time."
reflector --country "${config.location}" --age 12 --protocol https --sort rate --save /etc/pacman.d/mirrorlist

# Configure custom repos for pacstrap
if [ "${config.extraRepositories?.includes('cachy')}" = "true" ]; then
    pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com
    pacman-key --lsign-key F3B607488DB35A47
    pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'
fi
if [ "${config.extraRepositories?.includes('chaotic')}" = "true" ]; then
    pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
    pacman-key --lsign-key 3056513887B78AEB
    pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
fi
if [ -n "${pacmanConfRepos}" ]; then
    echo -e "${pacmanConfRepos}" >> /etc/pacman.conf
fi
pacman -Syy

pacstrap /mnt ${packages}
genfstab -U /mnt >> /mnt/etc/fstab
show_message "Pacstrap" "Spirits have been bound to the Realm."

# 6. Chroot and configure
show_message "Configuration" "Imbuing the Realm with consciousness..."
# Pass the AI Core script into the chroot environment to be executed.
AI_CORE_SCRIPT_TO_RUN='${aiCoreScript}'
arch-chroot /mnt /bin/bash -c "
    set -e
    # Timezone
    ln -sf /usr/share/zoneinfo/${config.timezone} /etc/localtime
    hwclock --systohc

    # Localization
    echo '${config.locale} UTF-8' > /etc/locale.gen
    locale-gen
    echo 'LANG=${config.locale}' > /etc/locale.conf
    echo 'KEYMAP=${config.keyboardLayout}' > /etc/vconsole.conf

    # Hostname
    echo '$HOSTNAME' > /etc/hostname
    echo '127.0.0.1 localhost' >> /etc/hosts
    echo '::1       localhost' >> /etc/hosts
    echo '127.0.1.1 $HOSTNAME.localdomain $HOSTNAME' >> /etc/hosts

    # Passwords for Architect and Root
    echo 'root:$ROOT_PASSWORD' | chpasswd
    useradd -m -G wheel -s /bin/zsh $USERNAME
    echo '$USERNAME:$PASSWORD' | chpasswd
    echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/wheel

    # Execute the AI Core setup script inside chroot
    eval \"\$AI_CORE_SCRIPT_TO_RUN\"

    # Bootloader
    grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=kael-os
    sed -i 's/GRUB_CMDLINE_LINUX_DEFAULT=\"loglevel=3 quiet\"/GRUB_CMDLINE_LINUX_DEFAULT=\"loglevel=3 quiet nowatchdog\"/' /etc/default/grub
    grub-mkconfig -o /boot/grub/grub.cfg

    # Services
    systemctl enable NetworkManager
    systemctl enable sddm
    systemctl enable ufw
    if [ "${target}" = "qemu" ]; then
        systemctl enable qemu-guest-agent
    elif [ "${target}" = "virtualbox" ]; then
        systemctl enable vboxservice
    fi

    # Firewall
    ufw default deny incoming
    ufw default allow outgoing
    ${firewallRules}
    ufw enable

    # Custom Repos inside chroot
    if [ -n \\"${pacmanConfRepos}\\" ]; then
        echo -e \\"${pacmanConfRepos}\\" >> /etc/pacman.conf
        pacman -Syy
    fi

    # AUR Helper setup for the Architect
    sudo -u $USERNAME /bin/bash -c '
        cd /home/$USERNAME
        git clone https://aur.archlinux.org/paru.git
        cd paru
        makepkg -si --noconfirm
        cd ..
        rm -rf paru
    '
"

show_message "Complete" "The forging is complete. The Realm is ready. You may now reboot."
umount -R /mnt
reboot
`;
};


export const generateAICoreScript = (config: DistroConfig): string => {
    
    const packageList = new Set<string>([
        'git', 'ufw', 'networkmanager', 'ollama'
    ]);
    if (config.packages) config.packages.split(',').map(p => p.trim()).filter(Boolean).forEach(p => packageList.add(p));
    if (config.kernels) config.kernels.forEach(k => packageList.add(k));
    if (config.aurHelpers) config.aurHelpers.forEach(h => packageList.add(h));
    
    const packages = Array.from(packageList).join(' ');

    const firewallRules = config.firewallRules.map(rule => `ufw allow ${rule.port}/${rule.protocol}`).join('\n        ');
    const aiCoreScript = generateAiCoreSetupScript(config);
    
    return `#!/bin/bash
# Kael AI System Attunement Script
# This script applies your blueprint to an existing Arch-based system.
# It is NON-DESTRUCTIVE and will not partition disks.

set -eu
clear

echo "--- Kael AI System Attunement ---"
echo "This script will attune this system to the blueprint's design."
echo "It will install packages and configure system settings."
read -p "Press [Enter] to continue or Ctrl+C to abort."

echo "--> Synchronizing package databases..."
pacman -Syy

echo "--> Installing core packages and dependencies..."
pacman -S --noconfirm --needed ${packages}

echo "--> Configuring system settings..."

# Timezone
echo "Setting timezone to ${config.timezone}..."
timedatectl set-timezone ${config.timezone}

# Locale
echo "Setting locale to ${config.locale}..."
echo '${config.locale} UTF-8' > /etc/locale.gen
locale-gen
echo 'LANG=${config.locale}' > /etc/locale.conf

# Hostname
if [ "$(hostname)" != "${config.hostname}" ]; then
    echo "Setting hostname to ${config.hostname}..."
    hostnamectl set-hostname ${config.hostname}
fi

# Firewall
echo "Configuring firewall..."
systemctl enable --now ufw
ufw default deny incoming
ufw default allow outgoing
${firewallRules}
ufw --force enable

# Architect (User) setup
if ! id -u "${config.username}" >/dev/null 2>&1; then
    echo "Creating user: ${config.username}"
    useradd -m -G wheel -s /bin/zsh "${config.username}"
    echo "Please set a password for ${config.username}:"
    passwd "${config.username}"
else
    echo "User ${config.username} already exists."
    usermod -aG wheel "${config.username}"
fi
echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/wheel

${aiCoreScript}

echo "--> Setting up AUR Helper for ${config.username}..."
sudo -u "${config.username}" /bin/bash -c '
    if ! command -v paru &> /dev/null; then
        echo "Installing paru..."
        cd /home/"${config.username}"
        git clone https://aur.archlinux.org/paru.git
        chown -R "${config.username}":"${config.username}" paru
        cd paru
        makepkg -si --noconfirm
        cd ..
        rm -rf paru
    else
        echo "paru is already installed."
    fi
'

# Enable core services
echo "--> Enabling essential services..."
systemctl enable NetworkManager
# Assuming SDDM from KDE Plasma
if pacman -Qs sddm > /dev/null; then
    systemctl enable sddm
fi

echo ""
echo "--- Attunement Complete ---"
echo "The system has been configured according to the blueprint."
echo "A reboot is recommended to apply all changes."
`;
};