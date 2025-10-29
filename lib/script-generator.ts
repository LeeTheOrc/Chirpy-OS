import type { DistroConfig, BuildTarget } from '../types';

export function generateInstallScript(config: DistroConfig, target: BuildTarget = 'bare-metal'): string {
  // Add a guard clause for the entire config object to prevent crashes.
  if (!config) {
    console.error("generateInstallScript called with null or undefined config. Using default.");
    config = {} as DistroConfig; // Fallback to an empty object to allow defaults to kick in.
  }
  
  // Use || to handle all falsy values (null, undefined, "") and provide a sensible default.
  const hostname = config.hostname || 'chirpy-realm';
  const username = config.username || 'chirpy';
  const password = config.password;
  const timezone = config.timezone || 'UTC';
  const locale = config.locale || 'en_US.UTF-8';
  const desktopEnvironment = config.desktopEnvironment || 'kde plasma';
  const targetDisk = config.targetDisk || '/dev/nvme0n1';
  const filesystem = config.filesystem || 'btrfs';
  const bootloader = config.bootloader || 'grub';
  const gpuDriver = config.gpuDriver || 'nvidia';
  const packages = config.packages || 'git, vim, firefox, docker, steam, lutris';
  const shell = config.shell || 'fish';
  // For booleans, ?? is better as we want to preserve `false`.
  const enableSnapshots = config.enableSnapshots ?? true;
  const efiPartitionSize = config.efiPartitionSize || '512M';
  const swapSize = config.swapSize || '18GB';
  const networkMode = config.networkMode || 'dhcp';
  const ipAddress = config.ipAddress;
  const gateway = config.gateway;
  const dnsServers = config.dnsServers;
  const aiResourceAllocation = config.aiResourceAllocation || 'dynamic';
  const aiGpuMode = config.aiGpuMode || 'dynamic';
  const graphicsMode = config.graphicsMode || 'hybrid';

  // Ensure arrays are valid and have content where required.
  const safeKernels = Array.isArray(config.kernels) && config.kernels.length > 0 ? config.kernels : ['linux'];
  const safeAurHelpers = Array.isArray(config.aurHelpers) ? config.aurHelpers : [];
  const safeExtraRepositories = Array.isArray(config.extraRepositories) ? config.extraRepositories : [];

  let deInstallScript: string;
  if (desktopEnvironment.toLowerCase().includes('kde')) {
    deInstallScript = `pacman -S --noconfirm xorg sddm plasma-meta plasma-wayland-session
systemctl enable sddm`;
  } else if (desktopEnvironment.toLowerCase().includes('gnome')) {
    deInstallScript = `pacman -S --noconfirm xorg gdm gnome
systemctl enable gdm`;
  } else {
    // Fallback for simple DE package names that use GDM
    const dePackage = desktopEnvironment.split(' ')[0];
    deInstallScript = `pacman -S --noconfirm xorg gdm ${dePackage}
systemctl enable gdm`;
  }

  let vmPackages = '';
  let vmServices = '';

  if (target === 'qemu') {
    vmPackages = ' qemu-guest-agent';
    vmServices = `
echo "Enabling QEMU Guest Agent..."
systemctl enable qemu-guest-agent.service
`;
  } else if (target === 'virtualbox') {
    vmPackages = ' virtualbox-guest-utils';
    vmServices = `
echo "Enabling VirtualBox Guest Services..."
systemctl enable vboxservice.service
`;
  }

  const script = `#!/bin/bash
# Chirpy AI :: Installation Ritual
# Forged on: ${new Date().toUTCString()}
# Build Target: ${target}
# 
# WARNING: This sacred ritual will re-format the runes on ${targetDisk}.
# Meditate upon its contents before proceeding.

set -e
echo "⚔️ The Installation Ritual for '${hostname}' begins..."

# -----------------------------------------------------------------------------
# Phase 1: Scribing Runes onto the Disk
# -----------------------------------------------------------------------------
echo "Sanctifying the temporal weave (timezone)..."
timedatectl set-timezone ${timezone}
timedatectl set-ntp true

echo "Carving the partitions on ${targetDisk}..."
parted ${targetDisk} --script mklabel gpt
parted ${targetDisk} --script mkpart "EFI System Partition" fat32 1MiB ${efiPartitionSize}
parted ${targetDisk} --script set 1 esp on
parted ${targetDisk} --script mkpart "Primary Realm" ${filesystem} ${efiPartitionSize} 100%

echo "Anointing partitions with filesystem sigils..."
mkfs.fat -F32 ${targetDisk}1
mkfs.${filesystem} -f ${targetDisk}2

echo "Mounting the nascent realm..."
mount ${targetDisk}2 /mnt
mkdir -p /mnt/boot
mount ${targetDisk}1 /mnt/boot

# -----------------------------------------------------------------------------
# Phase 2: Summoning the Base System
# -----------------------------------------------------------------------------
echo "Summoning the base system and kernel spirits..."
pacstrap /mnt base ${safeKernels.join(' ')} linux-firmware

echo "Generating the fstab grimoire..."
genfstab -U /mnt >> /mnt/etc/fstab

# -----------------------------------------------------------------------------
# Phase 3: Attuning the New Realm (chroot)
# -----------------------------------------------------------------------------
arch-chroot /mnt /bin/bash <<EOF
set -e

echo "Bestowing the realm its name: ${hostname}..."
echo "${hostname}" > /etc/hostname

echo "Setting the realm's time and tongue..."
ln -sf /usr/share/zoneinfo/${timezone} /etc/localtime
hwclock --systohc
echo "${locale} UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=${locale}" > /etc/locale.conf

echo "Opening pathways to the digital aether (networking)..."
pacman -S --noconfirm networkmanager
systemctl enable NetworkManager

${networkMode === 'static' ? `
echo "Scribing static network runes..."
cat > /etc/NetworkManager/system-connections/wired.nmconnection <<NET
[connection]
id=static-eth0
type=ethernet
interface-name=eth0

[ipv4]
method=manual
address=${ipAddress}
gateway=${gateway}
dns=${dnsServers}
NET
` : ''}

echo "Setting the root user's secret word..."
echo "root:${password || 'chirpy'}" | chpasswd

echo "Anointing the master user: ${username}..."
useradd -m -g users -G wheel -s /bin/${shell} ${username}
echo "${username}:${password || 'chirpy'}" | chpasswd
echo "%wheel ALL=(ALL:ALL) ALL" >> /etc/sudoers

echo "Forging a swapfile of ${swapSize} as a pocket dimension..."
fallocate -l ${swapSize} /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap defaults 0 0' >> /etc/fstab

# Opening portals to other realms (Extra Repos)
${safeExtraRepositories.includes('chaotic') ? `
echo "Opening a chaotic portal..."
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst'
pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
echo '[chaotic-aur]' >> /etc/pacman.conf
echo 'Include = /etc/pacman.d/chaotic-mirrorlist' >> /etc/pacman.conf
` : ''}

${safeExtraRepositories.includes('cachy') ? `
echo "Unlocking the CachyOS high-performance caches..."
pacman -S --noconfirm wget
wget https://mirror.cachyos.org/cachyos-repo.tar.xz
tar xf cachyos-repo.tar.xz
cd cachyos-repo
chmod +x cachyos-repo.sh
./cachyos-repo.sh
cd ..
rm -rf cachyos-repo cachyos-repo.tar.xz
` : ''}

echo "Synchronizing with the digital aether and upgrading the realm..."
pacman -Syu --noconfirm

echo "Imbuing the power core (${bootloader})..."
pacman -S --noconfirm grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

echo "Summoning essential artifacts (packages)..."
pacman -S --noconfirm ${packages}${vmPackages}

echo "Erecting the halls of the Desktop Environment: ${desktopEnvironment}..."
${deInstallScript}

echo "Attuning the graphics drivers: ${gpuDriver}..."
${gpuDriver === 'nvidia' ? 'pacman -S --noconfirm nvidia-dkms' : ''}
${gpuDriver === 'amd' ? 'pacman -S --noconfirm mesa lib32-mesa vulkan-radeon lib32-vulkan-radeon' : ''}
${gpuDriver === 'intel' ? 'pacman -S --noconfirm mesa lib32-mesa vulkan-intel lib32-vulkan-intel' : ''}

echo "Summoning helpers from the Arch User Repository..."
${safeAurHelpers.includes('yay') ? 'pacman -S --noconfirm yay' : ''}
${safeAurHelpers.includes('paru') ? 'pacman -S --noconfirm paru' : ''}

${enableSnapshots && filesystem === 'btrfs' ? `
echo "Weaving temporal safeguards (BTRFS snapshots)..."
pacman -S --noconfirm grub-btrfs
systemctl enable grub-btrfsd
` : ''}

${vmServices}

# -----------------------------------------------------------------------------
# Phase 4: AI Core Configuration
# -----------------------------------------------------------------------------
echo "Attuning the Chirpy AI Core..."
# Placeholder for AI Core service file
touch /etc/systemd/system/chirpy-ai-core.service

${aiResourceAllocation === 'dynamic' ? `
echo "Setting AI Core to Shapeshifter Form (Dynamic)..."
# Placeholder for enabling the dynamic resource allocation daemon
# systemctl enable --now chirpy-dynamic-tuner.service
` : ''}

${graphicsMode === 'hybrid' && (aiGpuMode === 'dedicated' || aiGpuMode === 'dynamic') ? `
echo "Configuring AI Core for iGPU usage (${aiGpuMode} mode)..."
# Placeholder for iGPU configuration. This might involve setting up
# PRIME render offload environment variables or specific Xorg configs.
touch /etc/chirpy/igpu.conf
` : ''}

EOF

echo "✅ The ritual is complete! The realm of ${hostname} has been forged."
umount -R /mnt
echo "You may now reboot into your new reality."
`;

  return script;
}
