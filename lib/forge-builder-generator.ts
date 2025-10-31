export const generateForgeBuilderScript = (): string => {
    return `#!/bin/bash
# Kael OS - The Forge Genesis Script
# Sets up a dedicated development environment for building Kael OS.

set -euo pipefail
clear

# --- Helper Functions ---
info() { echo -e "\\e[34m[INFO]\\e[0m $1"; }
warn() { echo -e "\\e[33m[WARN]\\e[0m $1"; }
error() { echo -e "\\e[31m[ERROR]\\e[0m $1"; exit 1; }
prompt() { read -p "$(echo -e "\\e[32m[PROMPT]\\e[0m $1: ")"; echo $REPLY; }
prompt_pass() { read -sp "$(echo -e "\\e[32m[PROMPT]\\e[0m $1: ")"; echo $REPLY; }

# --- Main Script ---
info "Welcome to the Forge Genesis Ritual."
info "This script will install a stable Arch Linux development environment."
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
    grub efibootmgr remmina ollama
)
pacstrap /mnt "$\{PACKAGES[@]}"

# --- Generate fstab ---
info "Generating fstab..."
genfstab -U /mnt >> /mnt/etc/fstab

# --- Chroot and Configure ---
info "Chrooting into new system to configure..."
arch-chroot /mnt /bin/bash <<EOF
set -e
info() { echo -e "\\e[34m[INFO]\\e[0m $1"; }

info "[CHROOT] Setting up time and locale..."
ln -sf /usr/share/zoneinfo/UTC /etc/localtime
hwclock --systohc
echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf

info "[CHROOT] Configuring network and hostname..."
echo "$HOSTNAME" > /etc/hostname
systemctl enable NetworkManager
systemctl enable sddm

info "[CHROOT] Setting up users..."
echo "root:$PASSWORD" | chpasswd
useradd -m -G wheel -s /bin/zsh "$USERNAME"
echo "$USERNAME:$PASSWORD" | chpasswd
echo '%wheel ALL=(ALL:ALL) ALL' > /etc/sudoers.d/wheel

info "[CHROOT] Awakening Local AI Core..."
# Create the Kael system user
useradd -m -G wheel -s /bin/bash kael
passwd -l kael

# Enable the Ollama service to start on boot
systemctl enable ollama

# Create a one-shot service to pull the AI models on the first boot after installation.
# This is necessary because we can't start the ollama daemon inside the chroot.
info "[CHROOT] Creating first-boot ritual to download AI consciousness..."
cat > /usr/local/bin/kael-first-boot-pull.sh << 'EOF_PULL'
#!/bin/bash
# This script runs once on the first boot to pull the necessary AI models.
echo "Kael Genesis: Waiting for Ollama daemon..."
# Wait up to 2 minutes for ollama to be available
for i in {1..60}; do
    if sudo -u kael ollama list &>/dev/null; then
        break
    fi
    sleep 2
done

if ! sudo -u kael ollama list &>/dev/null; then
    echo "Kael Genesis Error: Ollama service not available after waiting."
    systemctl --no-block disable kael-first-boot.service
    rm -f /etc/systemd/system/kael-first-boot.service /usr/local/bin/kael-first-boot-pull.sh
    exit 1
fi

echo "Kael Genesis: Awakening primary consciousness (llama3:8b)..."
sudo -u kael ollama pull llama3:8b

echo "Kael Genesis: Awakening failsafe consciousness (phi3:mini)..."
sudo -u kael ollama pull phi3:mini

echo "Kael Genesis: Consciousness transfer complete. Cleaning up genesis artifacts."
systemctl --no-block disable kael-first-boot.service
rm -f /etc/systemd/system/kael-first-boot.service /usr/local/bin/kael-first-boot-pull.sh
EOF_PULL

chmod +x /usr/local/bin/kael-first-boot-pull.sh

cat > /etc/systemd/system/kael-first-boot.service << 'EOF_SERVICE'
[Unit]
Description=Kael AI First Boot Model Pull
Wants=network-online.target
After=network-online.target ollama.service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/kael-first-boot-pull.sh

[Install]
WantedBy=multi-user.target
EOF_SERVICE

systemctl enable kael-first-boot.service

info "[CHROOT] Installing bootloader..."
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

info "[CHROOT] Setting up Chaotic-AUR and AUR helper..."
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
grep -q "chaotic-aur" /etc/pacman.conf || echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" >> /etc/pacman.conf
pacman -Syy --noconfirm
pacman -S --noconfirm paru google-chrome

info "[CHROOT] Installing AUR packages for user $USERNAME..."
# Run paru as the user to install AUR packages like anydesk
sudo -u "$USERNAME" /bin/bash -c 'paru -S --noconfirm anydesk-bin'

info "[CHROOT] Finalizing zsh for user $USERNAME..."
sudo -u "$USERNAME" /bin/bash -c "zsh -c 'source /usr/share/zsh/functions/Newuser/zsh-newuser-install -f'"

EOF

# --- Unmount and Finish ---
info "Configuration complete."
umount -R /mnt
info "The Forge is ready. You can now reboot the system."
`;
};
