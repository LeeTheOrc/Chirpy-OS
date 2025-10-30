// Fix: Implement script generation functions.
import type { BuildTarget, DistroConfig } from './types';

const _getAICoreScriptBlock = (apiKey: string, config: DistroConfig): string => {
    if (!apiKey) {
      return `echo "FATAL: API_KEY was not provided during build." >&2; exit 1;`;
    }

    return `
# --- AI CORE INSTALLATION ---
echo "INFO: Installing Chirpy AI Core..."

# Create service config directory and user/group
mkdir -p /etc/chirpy-ai
if ! getent group chirpy-ai >/dev/null; then
    groupadd --system chirpy-ai
    echo "INFO: Created 'chirpy-ai' system group."
fi
if ! id -u chirpy-ai >/dev/null 2>&1; then
    useradd --system --no-create-home -g chirpy-ai chirpy-ai
    echo "INFO: Created 'chirpy-ai' system user."
fi
echo "INFO: Created /etc/chirpy-ai directory."

# Write the configuration files
cat <<AICONFIG > /etc/chirpy-ai/config.json
{
  "resource_profile": "${config.aiResourceAllocation}",
  "gpu_mode": "${config.aiGpuMode}"
}
AICONFIG
echo "INFO: Wrote AI Core configuration to /etc/chirpy-ai/config.json"

# Create chat config with API key
cat <<CHATCONFIG > /etc/chirpy-ai/chat.conf
API_KEY="${apiKey}"
CHATCONFIG
chown root:chirpy-ai /etc/chirpy-ai/chat.conf
chmod 640 /etc/chirpy-ai/chat.conf
echo "INFO: Wrote secured chat API configuration."

# Create a mock systemd service file
cat <<'SERVICE' > /etc/systemd/system/chirpy-ai-core.service
[Unit]
Description=Chirpy AI Core Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/chirpy-ai-daemon --config /etc/chirpy-ai/config.json
Restart=on-failure
User=chirpy-ai

[Install]
WantedBy=multi-user.target
SERVICE
echo "INFO: Created systemd service file."

# Create a mock executable for the daemon
cat <<'DAEMON' > /usr/bin/chirpy-ai-daemon
#!/bin/bash
echo "Chirpy AI Core started at \$(date). Reading config from \$1..."
[[ -f "\$1" ]] && cat "\$1"
echo "AI Core running..."
while true; do sleep 3600; done
DAEMON
chmod +x /usr/bin/chirpy-ai-daemon
echo "INFO: Created mock daemon at /usr/bin/chirpy-ai-daemon."

# Create the core tuner TUI
cat <<'TUNER' > /usr/bin/chirpy-core-tuner
#!/bin/bash
CONFIG_FILE="/etc/chirpy-ai/config.json"

if [ "\$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)"
  exit 1
fi

CURRENT_MODE=\$(jq -r '.resource_profile' \$CONFIG_FILE)

SELECTION=\$(dialog --clear \\
                --backtitle "Chirpy AI Core Tuner" \\
                --title "Power Stance Attunement" \\
                --no-cancel \\
                --menu "Select the desired power profile for the AI Core. Current: \${CURRENT_MODE^}" \\
                15 55 4 \\
                minimal "Stealth Mode (Minimal resources)" \\
                balanced "Guardian Stance (Balanced usage)" \\
                performance "Berserker Rage (Max performance)" \\
                dynamic "Shapeshifter Form (Adapts to load)" \\
                3>&1 1>&2 2>&3)

exit_status=\$?
clear

if [ \$exit_status -eq 0 ]; then
    if [ "\$SELECTION" != "\$CURRENT_MODE" ]; then
        echo "Attuning AI Core to: \${SELECTION^}..."
        jq ".resource_profile = \\"\$SELECTION\\"" \$CONFIG_FILE > tmp.\$\$ && mv tmp.\$\$ \$CONFIG_FILE
        
        GRAPHICS_MODE="${config.graphicsMode}"
        if [ "\$SELECTION" == "dynamic" ] && [ "\$GRAPHICS_MODE" == "hybrid" ]; then
            jq ".gpu_mode = \\"dynamic\\"" \$CONFIG_FILE > tmp.\$\$ && mv tmp.\$\$ \$CONFIG_FILE
            echo "Enabled dynamic GPU co-processing."
        elif [ "\$SELECTION" == "performance" ]; then
             jq ".gpu_mode = \\"dedicated\\"" \$CONFIG_FILE > tmp.\$\$ && mv tmp.\$\$ \$CONFIG_FILE
             echo "Set GPU mode to dedicated."
        else
            jq ".gpu_mode = \\"none\\"" \$CONFIG_FILE > tmp.\$\$ && mv tmp.\$\$ \$CONFIG_FILE
            echo "Set GPU mode to none."
        fi

        echo "Restarting AI Core service to apply changes..."
        systemctl restart chirpy-ai-core.service
        echo "Attunement complete."
    else
        echo "No changes made. AI Core remains in \${CURRENT_MODE^}."
    fi
else
    echo "Attunement cancelled."
fi
TUNER
chmod +x /usr/bin/chirpy-core-tuner
echo "INFO: Created TUI tuner at /usr/bin/chirpy-core-tuner."

# Create the interactive chat client
cat <<'CHAT' > /usr/bin/chirpy-chat
#!/bin/bash
# Chirpy AI :: Interactive Chat

CONFIG_FILE="/etc/chirpy-ai/chat.conf"

# First, check if the file exists at all.
if [ ! -f "\$CONFIG_FILE" ]; then
    echo "ERROR: AI Core configuration file not found at \$CONFIG_FILE." >&2
    echo "The AI Core may not be installed correctly. Try running the AI Core attunement script." >&2
    exit 1
fi

# Next, check if the file is readable by the current user.
if [ ! -r "\$CONFIG_FILE" ]; then
    # The file exists but we can't read it. This is a permissions issue.
    echo "ERROR: You do not have permission to read the AI Core configuration." >&2
    
    # Check if the user is configured to be in the group but just need to relog.
    if id -Gn "\$USER" | grep -q "\\bchirpy-ai\\b"; then
        echo "Your user account is in the 'chirpy-ai' group, but your current session needs to be refreshed." >&2
        echo "Please LOG OUT and LOG BACK IN completely for the group changes to take effect." >&2
    else
        # The user is not configured to be in the group at all.
        echo "Please add your user to the 'chirpy-ai' group to grant access:" >&2
        echo "  sudo usermod -aG chirpy-ai \$USER" >&2
        echo "After running the command, you must LOG OUT and LOG BACK IN." >&2
    fi
    exit 1
fi

source "\$CONFIG_FILE"

if [ -z "\$API_KEY" ]; then
    echo "ERROR: API_KEY not found in \$CONFIG_FILE. The file might be corrupted." >&2
    exit 1
fi

MODEL="gemini-2.5-flash"
API_URL="https://generativelanguage.googleapis.com/v1beta/models/\${MODEL}:generateContent?key=\${API_KEY}"

echo "================================================="
echo " Chirpy AI Chat Interface"
echo "================================================="
echo "Connected to model: \$MODEL"
echo "Type 'exit' or 'quit' to end the session."
echo

while true; do
    read -p "Architect > " user_input

    if [[ "\$user_input" == "exit" || "\$user_input" == "quit" ]]; then
        echo "Session ended. Farewell, Architect."
        break
    fi

    json_payload=\$(jq -n --arg user_input "\$user_input" \\
    '{
        "contents": [ { "parts": [ { "text": \$user_input } ] } ]
    }')

    response=\$(curl -s -S -X POST "\$API_URL" \\
        -H "Content-Type: application/json" \\
        -d "\$json_payload")

    if [ \$? -ne 0 ]; then
        echo "Chirpy > I encountered an error connecting to the AI core. Please check your internet connection."
        continue
    fi

    error_message=\$(echo "\$response" | jq -r '.error.message // empty')
    if [ -n "\$error_message" ]; then
        echo "Chirpy > API Error: \$error_message"
        continue
    fi
    
    model_response=\$(echo "\$response" | jq -r '.candidates[0].content.parts[0].text // "My apologies, Architect. I am unable to respond right now."')

    echo -e "Chirpy > \$model_response"
    echo
done
CHAT
chmod +x /usr/bin/chirpy-chat
echo "INFO: Created interactive chat client at /usr/bin/chirpy-chat."

# Create the CLI greeter with status check
cat <<'CHIRPY' > /usr/bin/chirpy
#!/bin/bash
clear
# ANSI color codes
C_CYAN="\\e[36m"
C_GREEN="\\e[32m"
C_YELLOW="\\e[33m"
C_RED="\\e[31m"
C_RESET="\\e[0m"

echo -e "\${C_CYAN}=========================================\${C_RESET}"
echo "   Greetings, Architect."
echo "   I am Chirpy, your AI co-pilot."
echo -e "\${C_CYAN}=========================================\${C_RESET}"
echo

# Check AI Core Service Status
SERVICE_NAME="chirpy-ai-core.service"
if systemctl list-units --full -all | grep -q "\$SERVICE_NAME"; then
    STATUS=\$(systemctl is-active \$SERVICE_NAME)
    if [ "\$STATUS" == "active" ]; then
        STATUS_COLOR="\${C_GREEN}"
    elif [ "\$STATUS" == "inactive" ]; then
        STATUS_COLOR="\${C_YELLOW}"
    else
        STATUS_COLOR="\${C_RED}"
    fi
    echo -e "My local core service is \${STATUS_COLOR}\${STATUS^^}\${C_RESET}."
else
    echo -e "My local core service is \${C_RED}NOT FOUND\${C_RESET}."
fi
echo

echo "To have a conversation with me, run:"
echo -e "  \${C_GREEN}chirpy-chat\${C_RESET}"
echo
echo "To re-attune my power stance, use:"
echo -e "  \${C_YELLOW}sudo chirpy-core-tuner\${C_RESET}"
echo
echo "For a detailed service status, run:"
echo "  systemctl status \$SERVICE_NAME"
echo
echo -e "\${C_CYAN}=========================================\${C_RESET}"
echo
read -n 1 -s -r -p "Press any key to close this window..."
CHIRPY
chmod +x /usr/bin/chirpy
echo "INFO: Created CLI greeter with status check at /usr/bin/chirpy."

# Create a desktop shortcut for the chat client
mkdir -p /usr/share/applications
cat <<'DESKTOP' > /usr/share/applications/chirpy-ai.desktop
[Desktop Entry]
Version=1.0
Type=Application
Name=Chirpy AI Assistant
Comment=Chat with your AI co-pilot
Exec=xterm -e /usr/bin/chirpy-chat
Icon=dialog-question
Terminal=false
Categories=System;Utility;
DESKTOP
echo "INFO: Created application menu shortcut for Chirpy AI."
# --- END AI CORE INSTALLATION ---
`;
};

export const generateInstallScript = (
  config: DistroConfig,
  target: BuildTarget,
): string => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return `#!/bin/bash
echo "FATAL ERROR: API_KEY is not available in the build environment." >&2
echo "Cannot generate a functional OS installation script with AI Core." >&2
exit 1
`;
  }
  
  const allPackages = new Set<string>();

  if (config.packages) {
    config.packages
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => allPackages.add(p));
  }
  if (config.kernels) {
    config.kernels.forEach((k) => allPackages.add(k));
  }

  allPackages.add('base');
  allPackages.add('linux-firmware');
  allPackages.add('networkmanager');
  allPackages.add('git');
  allPackages.add(config.bootloader);
  // Add AI Core dependencies
  allPackages.add('jq');
  allPackages.add('dialog');
  allPackages.add('xterm');

  if (config.bootloader === 'grub') {
    allPackages.add('efibootmgr');
    if (config.enableSnapshots && config.filesystem === 'btrfs') {
        allPackages.add('grub-btrfs');
    }
  }
  if (config.filesystem === 'btrfs') {
    allPackages.add('btrfs-progs');
  }

  // VM Guest additions
  if (target === 'qemu') {
    allPackages.add('qemu-guest-agent');
  } else if (target === 'virtualbox') {
    allPackages.add('virtualbox-guest-utils');
  }

  const dePackages: { [key: string]: string[] } = {
    'kde plasma': ['plasma-meta', 'sddm'],
    gnome: ['gnome', 'gdm'],
    xfce: ['xfce4', 'xfce4-goodies', 'lightdm', 'lightdm-gtk-greeter'],
    cinnamon: ['cinnamon', 'lightdm', 'lightdm-gtk-greeter'],
  };

  const deKey = config.desktopEnvironment.toLowerCase();
  if (dePackages[deKey]) {
    dePackages[deKey].forEach((p) => allPackages.add(p));
    allPackages.add('xorg-server');
  } else if (config.desktopEnvironment) {
    allPackages.add(config.desktopEnvironment.split(' ')[0]);
    allPackages.add('xorg-server');
    allPackages.add('lightdm');
    allPackages.add('lightdm-gtk-greeter');
  }

  const packageList = Array.from(allPackages).join(' ');
  const aiCoreCommands = _getAICoreScriptBlock(apiKey, config);

  // Fix: Escaped shell variables inside the template literal (e.g., ${DISK} -> \${DISK})
  // to prevent TypeScript from trying to interpolate them as variables.
  return `#!/bin/bash
# Chirpy AI :: Forged Installation Script
# Target: ${target}
# Filesystem: ${config.filesystem}
# Bootloader: ${config.bootloader}
# DE: ${config.desktopEnvironment}

set -euo pipefail

# --- CONFIGURATION ---
DISK="${config.targetDisk || '/dev/vda'}" # Default to /dev/vda for VMs if not set
HOSTNAME="${config.hostname}"
USERNAME="${config.username}"
PASSWORD="${config.password || 'chirpy'}"
TIMEZONE="${config.timezone}"
LOCALE="${config.locale}"
KEYBOARD_LAYOUT="${config.keyboardLayout}"
EFI_PART_SIZE="${config.efiPartitionSize}"
SWAP_SIZE="${config.swapSize}"
FILESYSTEM="${config.filesystem}"
ENABLE_SNAPSHOTS=${config.enableSnapshots}

# --- SCRIPT ---

echo "INFO: Starting Chirpy OS installation on ${target}..."

# 1. Setup networking
timedatectl set-ntp true
pacman -Syy --noconfirm

# 2. Partitioning
echo "INFO: Partitioning disk \${DISK}..."
sgdisk -Z \${DISK}
sgdisk -n 1:0:+\${EFI_PART_SIZE} -t 1:ef00 -c 1:EFI \${DISK}
sgdisk -n 2:0:0 -t 2:8300 -c 2:Linux \${DISK}

EFI_PART="\${DISK}1"
ROOT_PART="\${DISK}2"
if [[ \${DISK} == /dev/nvme* || \${DISK} == /dev/sd* ]]; then
    EFI_PART="\${DISK}p1"
    ROOT_PART="\${DISK}p2"
fi

# 3. Formatting
echo "INFO: Formatting partitions..."
mkfs.fat -F32 \${EFI_PART}
if [ "$FILESYSTEM" = "btrfs" ]; then
    mkfs.btrfs -f \${ROOT_PART}
    mount \${ROOT_PART} /mnt
    btrfs subvolume create /mnt/@
    btrfs subvolume create /mnt/@home
    umount /mnt
    mount -o subvol=@,compress=zstd \${ROOT_PART} /mnt
    mkdir -p /mnt/home
    mount -o subvol=@home,compress=zstd \${ROOT_PART} /mnt/home
else # ext4
    mkfs.ext4 -F \${ROOT_PART}
    mount \${ROOT_PART} /mnt
fi

mkdir -p /mnt/boot
mount \${EFI_PART} /mnt/boot

# 4. Pacstrap
echo "INFO: Installing base system and packages..."
pacstrap /mnt ${packageList}

# 5. Fstab
genfstab -U /mnt >> /mnt/etc/fstab

# 6. Chroot and configure
echo "INFO: Configuring the installed system..."
arch-chroot /mnt /bin/bash <<EOF
set -euo pipefail

# Timezone & Locale
ln -sf /usr/share/zoneinfo/\${TIMEZONE} /etc/localtime
hwclock --systohc
echo "\${LOCALE} UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=\${LOCALE}" > /etc/locale.conf
echo "KEYMAP=\${KEYBOARD_LAYOUT}" > /etc/vconsole.conf

# Hostname
echo "\${HOSTNAME}" > /etc/hostname
cat <<HOSTS > /etc/hosts
127.0.0.1   localhost
::1         localhost
127.0.1.1   \${HOSTNAME}.localdomain \${HOSTNAME}
HOSTS

# Bootloader
if [ "${config.bootloader}" = "grub" ]; then
    grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
    grub-mkconfig -o /boot/grub/grub.cfg
else # systemd-boot
    bootctl --path=/boot install
    echo "default arch.conf" > /boot/loader/loader.conf
    echo "timeout 3" >> /boot/loader/loader.conf

    ROOT_PARTUUID=\$(blkid -s PARTUUID -o value \${ROOT_PART})
    cat <<ENTRY > /boot/loader/entries/arch.conf
title   Arch Linux
linux   /vmlinuz-linux
initrd  /initramfs-linux.img
options root=PARTUUID=\${ROOT_PARTUUID} rw
ENTRY
fi

${aiCoreCommands}

# User setup
echo "INFO: Setting up user '\${USERNAME}'..."
echo "root:\${PASSWORD}" | chpasswd
# Add user to 'wheel' for sudo and 'chirpy-ai' for chat access
useradd -m -G wheel,chirpy-ai \${USERNAME}
echo "\${USERNAME}:\${PASSWORD}" | chpasswd
echo "INFO: Granting sudo privileges to 'wheel' group..."
sed -i 's/^# %wheel ALL=(ALL:ALL) ALL/%wheel ALL=(ALL:ALL) ALL/' /etc/sudoers

# Enable services
systemctl enable NetworkManager
systemctl enable chirpy-ai-core.service
${target === 'qemu' ? 'systemctl enable qemu-guest-agent' : ''}
${target === 'virtualbox' ? 'systemctl enable vboxservice' : ''}
${
  dePackages[deKey]
    ? `systemctl enable ${dePackages[deKey][1] || 'lightdm'}`
    : ''
}

EOF

echo "INFO: Installation complete! Unmounting system..."
umount -R /mnt
echo "You can now reboot."
`;
};

export const generateAttunementScript = (config: DistroConfig): string => {
  const packagesToInstall = new Set<string>();
  if (config.packages) {
    config.packages
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => packagesToInstall.add(p));
  }
  if (config.kernels) {
    config.kernels.forEach((k) => packagesToInstall.add(k));
  }
  if (config.aurHelpers) {
    config.aurHelpers.forEach((h) => packagesToInstall.add(h));
  }

  const hasCachy = config.extraRepositories.includes('cachy');
  const hasChaotic = config.extraRepositories.includes('chaotic');

  let script = `#!/bin/bash
# Chirpy AI :: System Attunement Script
# This script applies settings to an existing Arch-based system.
# It is NON-DESTRUCTIVE and should be run with sudo.

set -euo pipefail

echo "INFO: Beginning system attunement..."

# 1. Set Hostname
echo "INFO: Setting hostname to ${config.hostname}"
hostnamectl set-hostname "${config.hostname}"

# 2. Set Timezone
echo "INFO: Setting timezone to ${config.timezone}"
timedatectl set-timezone "${config.timezone}"

# 3. Configure Locale
echo "INFO: Setting locale to ${config.locale}"
sed -i -e "s/#${config.locale}/${config.locale}/" /etc/locale.gen
echo "${config.locale} UTF-8" >> /etc/locale.gen
locale-gen
localectl set-locale LANG=${config.locale}

`;

  if (hasCachy || hasChaotic) {
    script += `# 4. Configure Extra Repositories
echo "INFO: Setting up extra repositories..."
`;
    if (hasChaotic) {
      script += `
# Setting up Chaotic-AUR
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
grep -q "chaotic-aur" /etc/pacman.conf || echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" >> /etc/pacman.conf
`;
    }
     if (hasCachy) {
      script += `
# Setting up CachyOS repos
pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com
pacman-key --lsign-key F3B607488DB35A47
pacman -U --noconfirm --needed 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' 'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst'
`;
    }
    script += 'pacman -Syy --noconfirm\n';
  }

  if (packagesToInstall.size > 0) {
    script += `
# 5. Install Packages
echo "INFO: Installing specified packages..."
pacman -S --noconfirm --needed ${Array.from(packagesToInstall).join(' ')}
`;
  }

  if (config.shell === 'fish') {
    script += `
# 6. Set default shell for user ${config.username}
echo "INFO: Setting default shell to fish for user ${config.username}"
if id -u ${config.username} >/dev/null 2>&1; then
    chsh -s /usr/bin/fish ${config.username}
else
    echo "WARN: User ${config.username} not found, skipping shell change."
fi
`;
  }

  script += `
# 7. Apply AI Core Configuration
echo "INFO: Applying AI Core configuration..."
mkdir -p /etc/chirpy-ai
cat <<AICONFIG > /etc/chirpy-ai/config.json
{
  "resource_profile": "${config.aiResourceAllocation}",
  "gpu_mode": "${config.aiGpuMode}"
}
AICONFIG
systemctl restart chirpy-ai-core.service || echo "WARN: chirpy-ai-core service not found or could not be restarted."

echo "SUCCESS: System attunement complete!"
`;

  return script;
};

export const generateAICoreScript = (config: DistroConfig): string => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return `#!/bin/bash
echo "FATAL ERROR: API_KEY is not available in the build environment." >&2
echo "Cannot generate a functional AI Core script." >&2
exit 1
`;
  }
  
  const aiCoreCommands = _getAICoreScriptBlock(apiKey, config);

  return `#!/bin/bash
# Chirpy AI :: AI Core Attunement Script
# This script installs and configures the Chirpy AI Core service and tools.
# It is NON-DESTRUCTIVE and should be run with sudo.

set -euo pipefail

echo "INFO: Starting AI Core setup..."

# 1. Install dependencies for UI and API communication
echo "INFO: Installing TUI, CLI, and desktop interface dependencies..."
pacman -S --noconfirm --needed dialog jq xterm

${aiCoreCommands}

# Reload systemd, enable, and start the service
echo "INFO: Enabling and starting the Chirpy AI Core service..."
systemctl daemon-reload
systemctl enable --now chirpy-ai-core.service

# Add current user to the chirpy-ai group
if [ -n "\$SUDO_USER" ] && id -u "\$SUDO_USER" >/dev/null 2>&1; then
    echo "INFO: Adding user '\$SUDO_USER' to the 'chirpy-ai' group for chat access..."
    usermod -aG chirpy-ai "\$SUDO_USER"
    echo "SUCCESS: User '\$SUDO_USER' added. Please log out and log back in for the change to take effect."
else
    echo "WARN: Could not determine the user who ran sudo. Please add your user to the 'chirpy-ai' group manually with:"
    echo "      sudo usermod -aG chirpy-ai <your_username>"
fi

echo
echo "SUCCESS: Chirpy AI Core service has been configured and started."
systemctl status chirpy-ai-core.service --no-pager
`;
};
