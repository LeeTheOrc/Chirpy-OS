

export const generateForgeBuilderScript = (): string => {
    return `#!/bin/bash
# Kael OS - The Forge Genesis Script
# Sets up a dedicated development environment for building Kael OS.

set -euo pipefail
clear

# --- Helper Functions ---
info() { echo -e "\\e[34m[INFO]\\e[0m $1"; }
warn() { echo -e "\\e[33m[WARN]\\e[0m $1"; }
success() { echo -e "\\e[32m[SUCCESS]\\e[0m $1"; }
error() { echo -e "\\e[31m[ERROR]\\e[0m $1"; exit 1; }
prompt() { read -p "$(echo -e "\\e[32m[PROMPT]\\e[0m $1: ")"; echo $REPLY; }
prompt_pass() { read -sp "$(echo -e "\\e[32m[PROMPT]\\e[0m $1: ")"; echo $REPLY; }

# --- Main Script ---
info "Welcome to the Forge Genesis Ritual."
info "This script will install a stable Arch Linux development environment."

# --- Pre-flight Checks ---
info "Checking for internet connection..."
if ! ping -c 1 -W 3 archlinux.org &> /dev/null; then
    warn "No internet connection detected."
    info "You need to connect to the internet to proceed."
    info "For Wi-Fi, use 'iwctl'. For Ethernet, it should connect automatically."
    info "Example for Wi-Fi:"
    info "  # iwctl"
    info "  [iwd]# device list"
    info "  [iwd]# station <device> scan"
    info "  [iwd]# station <device> get-networks"
    info "  [iwd]# station <device> connect <SSID>"
    info "After connecting, please run this script again."
    error "Aborting due to no internet connection."
fi
success "Internet connection established."


warn "This will ERASE the target disk. Proceed with extreme caution."
read -p "Press [Enter] to continue or Ctrl+C to abort."

# --- Gather Information ---
lsblk -d -o NAME,SIZE,MODEL
TARGET_DISK_INPUT=$(prompt "Enter the target disk (e.g., sda, nvme0n1)")
TARGET_DISK="/dev/$\{TARGET_DISK_INPUT##*/}" # Sanitize input
[[ -b "$TARGET_DISK" ]] || error "Disk $TARGET_DISK not found."

HOSTNAME=$(prompt "Enter a hostname for the Forge")
USERNAME=$(prompt "Enter your username")
PASSWORD=$(prompt_pass "Enter your password")
echo
PASSWORD_CONFIRM=$(prompt_pass "Confirm your password")
echo
[[ "$PASSWORD" == "$PASSWORD_CONFIRM" ]] || error "Passwords do not match."

# --- Cleanup ---
info "Attempting to unmount any previous mounts to ensure a clean slate..."
umount -R /mnt &>/dev/null || true
swapoff -a &>/dev/null || true
# A second pass to be sure, targeting the specific disk
for part in $(lsblk -lnpo NAME "$TARGET_DISK" | grep "$TARGET_DISK" || true); do
    umount "$part" &>/dev/null || true
done

# --- Partitioning ---
info "Wiping and partitioning $TARGET_DISK..."
sgdisk --zap-all "$TARGET_DISK"
sgdisk -n 1:0:+512M -t 1:ef00 -c 1:"EFI System Partition" "$TARGET_DISK" # EFI
sgdisk -n 2:0:+8G -t 2:8200 -c 2:"Swap" "$TARGET_DISK" # Swap
sgdisk -n 3:0:0 -t 3:8300 -c 3:"Linux Root" "$TARGET_DISK" # Root

# Get partition names
if [[ "$TARGET_DISK" == /dev/nvme* ]]; then
    EFI_PART="$\{TARGET_DISK}p1"
    SWAP_PART="$\{TARGET_DISK}p2"
    ROOT_PART="$\{TARGET_DISK}p3"
else
    EFI_PART="$\{TARGET_DISK}1"
    SWAP_PART="$\{TARGET_DISK}2"
    ROOT_PART="$\{TARGET_DISK}3"
fi

# --- Formatting ---
info "Formatting partitions..."
mkfs.fat -F32 "$EFI_PART"
mkswap "$SWAP_PART"
mkfs.btrfs -f "$ROOT_PART"

# --- Mounting ---
info "Mounting filesystems..."
mount "$ROOT_PART" /mnt
btrfs subvolume create /mnt/@
btrfs subvolume create /mnt/@home
umount /mnt
mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@ "$ROOT_PART" /mnt
mkdir -p /mnt/home
mount -o noatime,compress=zstd,space_cache=v2,discard=async,subvol=@home "$ROOT_PART" /mnt/home
mkdir -p /mnt/boot
mount "$EFI_PART" /mnt/boot
swapon "$SWAP_PART"

# --- Pacstrap ---
info "Installing base system and packages... This will take a while."
PACKAGES=(
    base base-devel linux-lts linux-lts-headers linux-firmware
    git lftp bc xmlto docbook-xsl kmod inetutils libelf
    networkmanager zsh plasma-meta konsole dolphin sddm
    grub efibootmgr remmina ollama curl
)
pacstrap /mnt "$\{PACKAGES[@]}"

# --- Generate fstab ---
info "Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab

# --- Chroot and Configure ---
info "Chrooting into new system to configure..."
arch-chroot /mnt /bin/bash -e <<EOF
# --- Helper Functions (for inside chroot) ---
info() { echo -e "\\e[34m[INFO]\\e[0m \$1"; }
warn() { echo -e "\\e[33m[WARN]\\e[0m \$1"; }
success() { echo -e "\\e[32m[SUCCESS]\\e[0m \$1"; }
error() { echo -e "\\e[31m[ERROR]\\e[0m \$1"; exit 1; }

# --- Localization ---
info "Setting timezone, locale, and hostname..."
ln -sf /usr/share/zoneinfo/UTC /etc/localtime
hwclock --systohc
echo "en_US.UTF-8 UTF-8" > /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
echo "$HOSTNAME" > /etc/hostname

# --- User and Password ---
info "Creating user and setting passwords..."
useradd -m -G wheel -s /bin/zsh "$USERNAME"
echo "$USERNAME:$PASSWORD" | chpasswd
echo "root:$PASSWORD" | chpasswd
echo "%wheel ALL=(ALL:ALL) ALL" >> /etc/sudoers

# --- Services ---
info "Enabling essential services..."
systemctl enable NetworkManager
systemctl enable sddm
systemctl enable ollama

# --- Pacman and Repos ---
info "Configuring pacman and allied forges..."

# CachyOS
info "--> Attuning to the CachyOS Forge using the official script..."
if curl https://mirror.cachyos.org/cachyos-repo.tar.xz -o /tmp/cachyos-repo.tar.xz; then
    (cd /tmp && tar xvf cachyos-repo.tar.xz && cd cachyos-repo && ./cachyos-repo.sh) || warn "CachyOS setup script failed."
else
    warn "Failed to download CachyOS repository setup. Skipping."
fi

# Chaotic-AUR
info "--> Attuning to the Chaotic-AUR..."
KEY_ID_CHAOTIC="3056513887B78AEB"
pacman-key --recv-key "\$KEY_ID_CHAOTIC" --keyserver keyserver.ubuntu.com
pacman-key --lsign-key "\$KEY_ID_CHAOTIC"
pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst'
pacman -U --noconfirm --needed 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
grep -q "chaotic-aur" /etc/pacman.conf || echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" | tee -a /etc/pacman.conf

# Kael-OS
info "--> Attuning to the Kael OS Athenaeum..."
KAEL_KEY_ID="8A7E40248B2A6582"
pacman-key --recv-keys "\$KAEL_KEY_ID" --keyserver hkp://keyserver.ubuntu.com || pacman-key --recv-keys "\$KAEL_KEY_ID" --keyserver hkp://keys.openpgp.org
pacman-key --lsign-key "\$KAEL_KEY_ID"
grep -q "kael-os" /etc/pacman.conf || echo -e "\\n[kael-os]\\nSigLevel = Optional TrustAll\\nServer = https://leetheorc.github.io/kael-os-repo/\\n" | tee -a /etc/pacman.conf

info "--> Synchronizing pacman databases..."
pacman -Syyu --noconfirm

# --- Bootloader ---
info "Installing GRUB bootloader..."
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=KaelOS
grub-mkconfig -o /boot/grub/grub.cfg

EOF

# --- Finalization ---
info "Unmounting filesystems..."
umount -R /mnt
swapoff -a

success "Forge Genesis Ritual is complete! You may now reboot."
`;
};