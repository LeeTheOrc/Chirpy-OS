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
  const timezone = config.timezone || 'UTC';
  const locale = config.locale || 'en_US.UTF-8';
  const desktopEnvironment = config.desktopEnvironment || 'kde plasma';
  const filesystem = config.filesystem || 'btrfs';
  const bootloader = config.bootloader || 'grub';
  const packages = config.packages || 'git, vim, firefox, docker, steam, lutris';
  const shell = config.shell || 'fish';
  const location = config.location || 'USA';
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
    deInstallScript = `pacman -S --noconfirm xorg sddm plasma-meta && systemctl enable sddm`;
  } else if (desktopEnvironment.toLowerCase().includes('gnome')) {
    deInstallScript = `pacman -S --noconfirm xorg gdm gnome && systemctl enable gdm`;
  } else {
    // Fallback for simple DE package names that use GDM
    const dePackage = desktopEnvironment.split(' ')[0];
    deInstallScript = `pacman -S --noconfirm xorg gdm ${dePackage} && systemctl enable gdm`;
  }

  let vmPackages = '';
  let vmServices = '';

  if (target === 'qemu') {
    vmPackages = ' qemu-guest-agent';
    vmServices = `echo "Enabling QEMU Guest Agent..." && systemctl enable qemu-guest-agent.service`;
  } else if (target === 'virtualbox') {
    vmPackages = ' virtualbox-guest-utils';
    vmServices = `echo "Enabling VirtualBox Guest Services..." && systemctl enable vboxservice.service`;
  }

  const multilibEnableScript = `
echo "Enabling multilib repository for 32-bit compatibility..."
sed -i "/\\[multilib\\]/,/Include/s/^#//" /etc/pacman.conf
`;

  const script = `#!/bin/bash
# Chirpy AI :: The Forging Ritual (TUI Installer)
# Forged on: ${new Date().toUTCString()}
# Build Target: ${target}
#
# This script will guide you through the installation of Chirpy OS.

set -uo pipefail
trap 's_err_report "'"\${BASH_SOURCE}"'" "'"\${LINENO}"'"' ERR

# --- UI Constants ---
TITLE="Chirpy OS Forge"
BACKTITLE="A Guided Installation Ritual :: Version 2.0"
WIDTH=70
HEIGHT=20

# --- Error Reporting ---
s_err_report() {
    # This function is called on any script error. It might be called before dialog is installed.
    if command -v dialog &> /dev/null; then
        dialog --backtitle "$BACKTITLE" --title "Anomalous Error" --msgbox "A critical error occurred at line $2 in $1. The ritual is halted to prevent corruption of the realm." 8 60
    else
        echo "A critical error occurred at line $2 in $1." >&2
        echo "The ritual is halted to prevent corruption of the realm." >&2
    fi
    exit 1
}

# --- Pre-flight Checks & Setup ---
pre_flight_checks() {
    # 1. Check for root privileges
    if [ "$EUID" -ne 0 ]; then
        echo "Error: This ritual must be performed with root privileges." >&2
        echo "Please ensure you are the root user in the Arch Linux live environment." >&2
        exit 1
    fi

    # 2. Check for internet connectivity
    echo "Pinging the digital aether (checking internet connection)..."
    if ! ping -c 1 archlinux.org &> /dev/null; then
        echo "Error: Connection to the digital aether failed." >&2
        echo "Please connect to the internet (e.g., using 'iwctl') and try again." >&2
        exit 1
    fi
    echo "Connection established."

    # 3. Check for and install dialog if needed
    if ! command -v dialog &> /dev/null; then
        echo "The 'dialog' utility is required for the TUI, but it was not found."
        echo "Attempting to summon it via pacman..."
        pacman -Sy --noconfirm --needed dialog
        if ! command -v dialog &> /dev/null; then
            echo "Failed to summon 'dialog'. The ritual cannot proceed." >&2
            echo "Please check your pacman configuration and mirrors." >&2
            exit 1
        fi
        echo "'dialog' has been successfully summoned."
    fi
}

# --- State Variables ---
HOSTNAME_VAR="${hostname}"
USERNAME_VAR="${username}"
PASSWORD_VAR=""
LOCALE_VAR="${locale}"
TIMEZONE_VAR="${timezone}"
TARGET_DISK=""
CONFIG_CONFIRMED=0
DISK_CONFIGURED=0

# --- Main Logic ---
main_menu() {
    while true; do
        SELECTION=$(dialog --backtitle "$BACKTITLE" --title "$TITLE" --cancel-label "Exit" --menu "The Ritual Circle" $HEIGHT $WIDTH 4 \\
            "1" "Configure the Realm (User & Locale)" \\
            "2" "Select the Target Disk" \\
            "3" "Begin The Great Forging" \\
            3>&1 1>&2 2>&3)

        exit_status=$?
        if [ $exit_status -ne 0 ]; then
            clear
            echo "The ritual has been aborted by the Architect."
            exit
        fi

        case $SELECTION in
            1) configure_realm ;;
            2) select_disk ;;
            3) 
                if [ $DISK_CONFIGURED -eq 1 ]; then
                    review_and_forge
                else
                    dialog --backtitle "$BACKTITLE" --title "Halt!" --msgbox "You must select a target disk before the forging can begin." 6 60
                fi
                ;;
        esac
    done
}

configure_realm() {
    HOSTNAME_VAR=$(dialog --backtitle "$BACKTITLE" --title "Realm Name" --inputbox "Enter the hostname for this machine:" 8 40 "$HOSTNAME_VAR" 3>&1 1>&2 2>&3)
    USERNAME_VAR=$(dialog --backtitle "$BACKTITLE" --title "Master User" --inputbox "Enter the username for the main user:" 8 40 "$USERNAME_VAR" 3>&1 1>&2 2>&3)
    
    while true; do
        PASSWORD_VAR=$(dialog --backtitle "$BACKTITLE" --title "Secret Word" --passwordbox "Enter password for root and $USERNAME_VAR:" 8 40 3>&1 1>&2 2>&3)
        PASSWORD_CONFIRM_VAR=$(dialog --backtitle "$BACKTITLE" --title "Secret Word Confirmation" --passwordbox "Confirm the password:" 8 40 3>&1 1>&2 2>&3)
        
        if [ -z "$PASSWORD_VAR" ]; then
            dialog --backtitle "$BACKTITLE" --title "Warning" --msgbox "The secret word cannot be empty." 6 40
        elif [ "$PASSWORD_VAR" == "$PASSWORD_CONFIRM_VAR" ]; then
            dialog --backtitle "$BACKTITLE" --title "Confirmed" --infobox "Secret word is confirmed and sealed." 5 40
            sleep 1
            break
        else
            dialog --backtitle "$BACKTITLE" --title "Warning" --msgbox "The secret words do not match. Try again." 6 40
        fi
    done

    LOCALE_VAR=$(dialog --backtitle "$BACKTITLE" --title "System Language" --inputbox "Enter the locale for the system (e.g., en_US.UTF-8):" 8 40 "$LOCALE_VAR" 3>&1 1>&2 2>&3)
    TIMEZONE_VAR=$(dialog --backtitle "$BACKTITLE" --title "Temporal Weave" --inputbox "Enter your timezone (e.g., America/New_York):" 8 40 "$TIMEZONE_VAR" 3>&1 1>&2 2>&3)
}

select_disk() {
    mapfile -t DISK_OPTIONS < <(lsblk -p -d -n -o NAME,SIZE,MODEL | awk '{print $1 " (" $2 ") " $3}')
    if [ \${#DISK_OPTIONS[@]} -eq 0 ]; then
        dialog --backtitle "$BACKTITLE" --title "Scrying Failure" --msgbox "No suitable disks found! Cannot proceed." 6 60
        return
    fi
    
    DISK_CHOICES=()
    for item in "\${DISK_OPTIONS[@]}"; do
        DISK_CHOICES+=("$(echo "$item" | awk '{print $1}')" "$(echo "$item" | cut -d' ' -f2-)")
    done

    TARGET_DISK=$(dialog --backtitle "$BACKTITLE" --title "Select Target Disk" --radiolist "Choose the disk where the realm will be forged. ALL DATA on the selected disk will be PERMANENTLY ERASED." $HEIGHT $WIDTH \${#DISK_CHOICES[@]} "\${DISK_CHOICES[@]}" 3>&1 1>&2 2>&3)

    if [ -n "$TARGET_DISK" ]; then
        dialog --backtitle "$BACKTITLE" --title "Final Warning!" --yesno "You have chosen to forge the realm on: \\n\\n$TARGET_DISK\\n\\nThis action is IRREVERSIBLE and will ERASE ALL DATA on this disk. Are you prepared to proceed?" 10 60
        response=$?
        if [ $response -eq 0 ]; then
            DISK_CONFIGURED=1
            dialog --backtitle "$BACKTITLE" --title "Disk Confirmed" --infobox "The target disk $TARGET_DISK has been sealed." 5 60
            sleep 1
        else
            TARGET_DISK=""
            DISK_CONFIGURED=0
            dialog --backtitle "$BACKTITLE" --title "Aborted" --infobox "The disk selection has been unsealed." 5 60
            sleep 1
        fi
    fi
}

review_and_forge() {
    SUMMARY="Hostname: $HOSTNAME_VAR\\n"
    SUMMARY+="Username: $USERNAME_VAR\\n"
    SUMMARY+="Timezone: $TIMEZONE_VAR\\n"
    SUMMARY+="Target Disk: $TARGET_DISK\\n"
    SUMMARY+="Filesystem: ${filesystem}\\n"
    SUMMARY+="Desktop: ${desktopEnvironment}"

    dialog --backtitle "$BACKTITLE" --title "Review the Blueprint" --yesno "The blueprint is complete. Review the details below. Shall we begin the Great Forging?\\n\\n$SUMMARY" 15 60
    
    if [ $? -eq 0 ]; then
        run_installation
    fi
}

run_installation() {
    (
        # Phase 1: Preparation
        echo 5; echo "Sanctifying the temporal weave (timezone)..."
        timedatectl set-timezone "\${TIMEZONE_VAR}"
        timedatectl set-ntp true
        sleep 1

        # Phase 2: Scribing Runes onto the Disk
        echo 10; echo "Carving the partitions on \${TARGET_DISK}..."
        if [[ "\$TARGET_DISK" == *nvme* ]]; then
            EFI_PART="\${TARGET_DISK}p1"
            ROOT_PART="\${TARGET_DISK}p2"
        else
            EFI_PART="\${TARGET_DISK}1"
            ROOT_PART="\${TARGET_DISK}2"
        fi
        parted \${TARGET_DISK} --script mklabel gpt
        parted \${TARGET_DISK} --script mkpart EFI fat32 1MiB ${efiPartitionSize}
        parted \${TARGET_DISK} --script set 1 esp on
        parted \${TARGET_DISK} --script mkpart ROOT ${filesystem} ${efiPartitionSize} 100%
        sleep 1

        echo 20; echo "Anointing partitions with filesystem sigils..."
        mkfs.fat -F32 "\${EFI_PART}"
        mkfs.${filesystem} -f "\${ROOT_PART}"
        sleep 1
        
        echo 25; echo "Mounting the nascent realm..."
        mount "\${ROOT_PART}" /mnt
        mkdir -p /mnt/boot
        mount "\${EFI_PART}" /mnt/boot
        sleep 1
        
        # Phase 2.5: Attuning Mirrors
        echo 35; echo "Attuning mirrors in ${location} for best speed..."
        # The output of reflector can be verbose and will mess with the dialog UI.
        # We redirect it. The 'set -uo pipefail' ensures that the script will exit on failure.
        reflector --country "${location}" --protocol https --latest 20 --sort rate --save /etc/pacman.d/mirrorlist &>/dev/null
        sleep 1

        # Phase 3: Summoning the Base System
        echo 40; echo "Summoning the base system and kernel spirits (pacstrap)..."
        pacstrap /mnt base ${safeKernels.join(' ')} linux-firmware intel-ucode amd-ucode

        echo 60; echo "Generating the fstab grimoire..."
        genfstab -U /mnt >> /mnt/etc/fstab
        sleep 1

        # Phase 4: Attuning the New Realm (chroot)
        echo 70; echo "Entering the new realm to configure it..."
        
        arch-chroot /mnt /bin/bash <<CHROOT_EOF
set -e
echo "Bestowing the realm its name: $HOSTNAME_VAR..."
echo "$HOSTNAME_VAR" > /etc/hostname

echo "Setting the realm's time and tongue..."
ln -sf /usr/share/zoneinfo/$TIMEZONE_VAR /etc/localtime
hwclock --systohc
echo "$LOCALE_VAR UTF-8" >> /etc/locale.gen
locale-gen
echo "LANG=$LOCALE_VAR" > /etc/locale.conf

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
echo "root:$PASSWORD_VAR" | chpasswd

echo "Summoning the chosen shell: ${shell}..."
pacman -S --noconfirm --needed ${shell}

echo "Anointing the master user: $USERNAME_VAR..."
useradd -m -g users -G wheel -s /bin/${shell} "$USERNAME_VAR"
echo "$USERNAME_VAR:$PASSWORD_VAR" | chpasswd
echo "%wheel ALL=(ALL:ALL) ALL" >> /etc/sudoers

echo "Forging a swapfile of ${swapSize}..."
fallocate -l ${swapSize} /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap defaults 0 0' >> /etc/fstab

echo "Configuring software repositories..."
${safeExtraRepositories.includes('cachy') ? `
echo "-> Setting up CachyOS repositories..."
# Using the documented bootstrap method.
# NOTE: These URLs can become outdated. The custom 'pacman' package install was removed for stability.

echo "--> Importing and signing CachyOS key..."
pacman-key --recv-keys F3B607488DB35A47 --keyserver keyserver.ubuntu.com
pacman-key --lsign-key F3B607488DB35A47

echo "--> Installing CachyOS keyring and mirrorlists..."
pacman -U --noconfirm \\
'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-keyring-20240331-1-any.pkg.tar.zst' \\
'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-mirrorlist-22-1-any.pkg.tar.zst' \\
'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v3-mirrorlist-22-1-any.pkg.tar.zst' \\
'https://mirror.cachyos.org/repo/x86_64/cachyos/cachyos-v4-mirrorlist-22-1-any.pkg.tar.zst'

# THIS IS THE CRITICAL FIX: The repository definitions were missing from pacman.conf.
echo "--> Appending CachyOS repositories to pacman.conf..."
cat << 'EOF' >> /etc/pacman.conf

[cachyos-v4]
Include = /etc/pacman.d/cachyos-v4-mirrorlist
[cachyos-v3]
Include = /etc/pacman.d/cachyos-v3-mirrorlist
[cachyos]
Include = /etc/pacman.d/cachyos-mirrorlist
EOF
` : ''}

${multilibEnableScript}

${safeExtraRepositories.includes('chaotic') ? `
echo "-> Adding Chaotic-AUR repository (fallback priority)..."
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB
pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst'
pacman -U --noconfirm 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'
# Append Chaotic-AUR config to the end of pacman.conf
echo '' >> /etc/pacman.conf
echo '[chaotic-aur]' >> /etc/pacman.conf
echo 'Include = /etc/pacman.d/chaotic-mirrorlist' >> /etc/pacman.conf
` : ''}

echo "Synchronizing with the digital aether and upgrading the realm..."
pacman -Syu --noconfirm

echo "Imbuing the power core (${bootloader})..."
pacman -S --noconfirm grub efibootmgr
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=GRUB
grub-mkconfig -o /boot/grub/grub.cfg

echo "Summoning essential artifacts (packages)..."
pacman -S --noconfirm --needed ${packages}${vmPackages}

echo "Erecting the halls of the Desktop Environment: ${desktopEnvironment}..."
${deInstallScript}

echo "Attuning hardware drivers via CachyOS Hardware Prober..."
pacman -S --noconfirm --needed cachyos-hw-prober
cachyos-hw-prober

echo "Summoning helpers from the Arch User Repository..."
${safeAurHelpers.includes('yay') ? 'pacman -S --noconfirm yay' : ''}
${safeAurHelpers.includes('paru') ? 'pacman -S --noconfirm paru' : ''}

${enableSnapshots && filesystem === 'btrfs' ? `
echo "Weaving temporal safeguards (BTRFS snapshots)..."
pacman -S --noconfirm grub-btrfs
systemctl enable grub-btrfsd
` : ''}

${vmServices}

echo "Attuning the Chirpy AI Core..."
touch /etc/systemd/system/chirpy-ai-core.service

${aiResourceAllocation === 'dynamic' ? `
echo "Setting AI Core to Shapeshifter Form (Dynamic)..."
` : ''}

${graphicsMode === 'hybrid' && (aiGpuMode === 'dedicated' || aiGpuMode === 'dynamic') ? `
echo "Configuring AI Core for iGPU usage (${aiGpuMode} mode)..."
touch /etc/chirpy/igpu.conf
` : ''}

CHROOT_EOF

        echo 95; echo "Unmounting the realm..."
        umount -R /mnt
        sleep 1

        echo 100; echo "The ritual is complete!"
        sleep 2
    ) | dialog --backtitle "$BACKTITLE" --title "The Great Forging" --gauge "The ritual is underway..." 10 $WIDTH 0

    dialog --backtitle "$BACKTITLE" --title "Success!" --msgbox "The ritual is complete! The realm of \$HOSTNAME_VAR has been forged.\\n\\nYou may now reboot into your new reality." 8 60
    clear
}

# --- Script Entry Point ---
pre_flight_checks
main_menu
`;

  return script;
}