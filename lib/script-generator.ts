import { DistroConfig } from '../types';

export const generateInstallScript = (config: DistroConfig): string => {
  const packagesList = [
    'base',
    'linux-firmware',
    ...config.kernels,
    'networkmanager',
    'grub',
    'efibootmgr',
    'os-prober',
    'man-db',
    'man-pages',
    'texinfo',
    'git',
    'fish', // as it is locked
    'plasma-desktop', // for KDE Plasma
    'sddm', // display manager for KDE
    'konsole', // terminal for KDE
    'dolphin', // file manager for KDE
    'firefox',
    config.gpuDriver,
    ...config.aurHelpers,
    ...config.packages.split('\n').filter(p => p.trim() !== '')
  ].join(' ');

  // Handling for hybrid graphics
  const hybridGraphicsSetup = config.graphicsMode === 'hybrid' ? `
echo "INFO: Installing optimus-manager for hybrid graphics..."
pacman -S --noconfirm optimus-manager
systemctl enable optimus-manager.service
` : '';

  // Handling for snapshots
  const snapshotSetup = config.enableSnapshots && config.filesystem === 'btrfs' ? `
echo "INFO: Installing snapper and grub-btrfs for snapshots..."
pacman -S --noconfirm snapper grub-btrfs
snapper --no-dbus -c root create-config /
` : '';

  const chaoticAurSetup = config.extraRepositories.includes('chaotic') ? `
echo "INFO: Setting up Chaotic-AUR repository..."
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
echo '[chaotic-aur]' >> /etc/pacman.conf
echo 'Include = /etc/pacman.d/chaotic-mirrorlist' >> /etc/pacman.conf
` : '';

  const cachyRepoSetup = config.extraRepositories.includes('cachy') ? `
echo "INFO: Setting up CachyOS repository..."
# A real script would need to install cachyos-keyring and cachyos-mirrorlist
# This is a simplified version for demonstration.
pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com
pacman-key --lsign-key F3B607488DB35A47
echo "
[cachyos]
Include = /etc/pacman.d/cachyos-mirrorlist" >> /etc/pacman.conf
# The mirrorlist file would need to be created/populated separately.
` : '';

  const staticNetworkConfig = config.networkMode === 'static' ? `
echo "INFO: Configuring static IP..."
cat <<EOF > /etc/NetworkManager/system-connections/wired.nmconnection
[connection]
id=static-eth0
type=ethernet
interface-name=eth0
[ipv4]
method=manual
address1=${config.ipAddress},${config.gateway}
dns=${config.dnsServers};
[ipv6]
method=auto
EOF
chmod 600 /etc/NetworkManager/system-connections/wired.nmconnection
` : '';


  const script = `#!/bin/bash
# Chirpy OS Automated Installer Script
# WARNING: This script will erase all data on the target disk.
# Use with extreme caution. Review the script before running.

set -e # Exit on error
set -o pipefail

# --- CONFIGURATION ---
TARGET_DISK="${config.targetDisk}"
HOSTNAME="${config.hostname}"
USERNAME="${config.username}"
PASSWORD="${config.password || 'password'}" # IMPORTANT: Change this or set it in the blueprint
TIMEZONE="${config.timezone}"
LOCALE="${config.locale}"
KEYBOARD_LAYOUT="${config.keyboardLayout}"
EFI_SIZE="${config.efiPartitionSize}"
SWAP_SIZE="${config.swapSize}"
FILESYSTEM_TYPE="${config.filesystem}"

echo "--- Chirpy OS Installation ---"
echo "TARGET DISK: ${"$"}{TARGET_DISK}"
echo "HOSTNAME: ${"$"}{HOSTNAME}"
echo "USERNAME: ${"$"}{USERNAME}"
echo "--------------------------------"
read -p "WARNING: This will destroy all data on ${"$"}{TARGET_DISK}. Type 'YES' to continue: " CONFIRMATION
if [ "${"$"}{CONFIRMATION}" != "YES" ]; then
    echo "Installation aborted."
    exit 1
fi

# 1. Partitioning the disk
echo "INFO: Partitioning ${"$"}{TARGET_DISK}..."
sgdisk --zap-all ${"$"}{TARGET_DISK}
sgdisk -n 1:0:+${"$"}{EFI_SIZE} -t 1:ef00 -c 1:EFI ${"$"}{TARGET_DISK}
sgdisk -n 2:0:+${"$"}{SWAP_SIZE} -t 2:8200 -c 2:SWAP ${"$"}{TARGET_DISK}
sgdisk -n 3:0:0 -t 3:8300 -c 3:ROOT ${"$"}{TARGET_DISK}

# Inform the OS of partition table changes
partprobe ${"$"}{TARGET_DISK}
sleep 3

# 2. Formatting partitions
echo "INFO: Formatting partitions..."
mkfs.fat -F32 /dev/disk/by-partlabel/EFI
mkswap /dev/disk/by-partlabel/SWAP
mkfs.${"$"}{FILESYSTEM_TYPE} -f /dev/disk/by-partlabel/ROOT

# 3. Mounting filesystems
echo "INFO: Mounting filesystems..."
mount /dev/disk/by-partlabel/ROOT /mnt
swapon /dev/disk/by-partlabel/SWAP
mkdir -p /mnt/boot
mount /dev/disk/by-partlabel/EFI /mnt/boot

# 4. Installing base system with pacstrap
echo "INFO: Installing base system and packages... This will take a while."
pacstrap -K /mnt ${packagesList}

# 5. Generating fstab
echo "INFO: Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab

# 6. Chrooting into the new system to continue configuration
echo "INFO: Chrooting into the new system..."
arch-chroot /mnt /bin/bash <<CHROOT_EOF
set -e

echo "INFO: Configuring timezone, locale, and hostname..."
ln -sf /usr/share/zoneinfo/${"$"}{TIMEZONE} /etc/localtime
hwclock --systohc
echo "${"$"}{LOCALE} UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=${"$"}{LOCALE}" > /etc/locale.conf
echo "KEYMAP=${"$"}{KEYBOARD_LAYOUT}" > /etc/vconsole.conf
echo "${"$"}{HOSTNAME}" > /etc/hostname

cat <<HOSTS_EOF > /etc/hosts
127.0.0.1   localhost
::1         localhost
127.0.1.1   ${"$"}{HOSTNAME}.localdomain ${"$"}{HOSTNAME}
HOSTS_EOF

# Set up extra repositories before pacman -Sy
${cachyRepoSetup}
${chaoticAurSetup}

pacman -Sy --noconfirm

echo "INFO: Setting root and user passwords..."
echo "root:${"$"}{PASSWORD}" | chpasswd
useradd -m -s /bin/fish ${"$"}{USERNAME}
echo "${"$"}{USERNAME}:${"$"}{PASSWORD}" | chpasswd
usermod -aG wheel ${"$"}{USERNAME}
echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/wheel

echo "INFO: Installing and configuring bootloader..."
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

echo "INFO: Enabling essential services..."
systemctl enable sddm.service
systemctl enable NetworkManager.service

${hybridGraphicsSetup}
${snapshotSetup}
${staticNetworkConfig}

echo "INFO: Finalizing setup in chroot..."
CHROOT_EOF

echo "--- Installation Complete! ---"
echo "Unmounting filesystems..."
umount -R /mnt
echo "You can now safely reboot your system."
`;
  return script;
};
