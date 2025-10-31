import type { DistroConfig, BuildStep, Snippet, InternalizedService, LocalLLM } from './types';

export const AI_RESOURCE_PROFILES = {
  minimal: { name: 'Featherlight', description: 'Lowest resource usage for background tasks.' },
  balanced: { name: 'Equilibrium', description: 'Balanced performance for general use.' },
  performance: { name: 'Inferno', description: 'High-performance for intensive AI workloads.' },
  dynamic: { name: 'Shapeshifter', description: 'Dynamically adapts to system load.' },
};

export const LOCAL_LLM_PROFILES: Record<LocalLLM, { name: string; description: string }> = {
    'llama3:8b': { name: 'Inferno (Llama 3)', description: 'Powerful, high-quality primary consciousness.' },
    'phi3:mini': { name: 'Featherlight (Phi-3)', description: 'A lightweight, resilient failsafe soul.' },
};

export const LOCATIONS_DATA = {
    "Africa": [
        { name: 'Nigeria', timezones: ['Africa/Lagos'], locales: ['en_NG.UTF-8'], keyboards: ['us'] },
        { name: 'Egypt', timezones: ['Africa/Cairo'], locales: ['ar_EG.UTF-8'], keyboards: ['ar'] },
        { name: 'South Africa', timezones: ['Africa/Johannesburg'], locales: ['en_ZA.UTF-8'], keyboards: ['us'] },
        { name: 'Kenya', timezones: ['Africa/Nairobi'], locales: ['en_KE.UTF-8'], keyboards: ['us'] },
        { name: 'Ghana', timezones: ['Africa/Accra'], locales: ['en_GH.UTF-8'], keyboards: ['us'] },
    ],
    "Asia": [
        { name: 'China', timezones: ['Asia/Shanghai', 'Asia/Urumqi'], locales: ['zh_CN.UTF-8'], keyboards: ['us'] },
        { name: 'India', timezones: ['Asia/Kolkata'], locales: ['en_IN.UTF-8'], keyboards: ['us'] },
        { name: 'Japan', timezones: ['Asia/Tokyo'], locales: ['ja_JP.UTF-8'], keyboards: ['jp'] },
        { name: 'South Korea', timezones: ['Asia/Seoul'], locales: ['ko_KR.UTF-8'], keyboards: ['kr'] },
        { name: 'Indonesia', timezones: ['Asia/Jakarta'], locales: ['id_ID.UTF-8'], keyboards: ['us'] },
        { name: 'Saudi Arabia', timezones: ['Asia/Riyadh'], locales: ['ar_SA.UTF-8'], keyboards: ['ar'] },
        { name: 'Turkey', timezones: ['Europe/Istanbul'], locales: ['tr_TR.UTF-8'], keyboards: ['tr'] },
    ],
    "Europe": [
        { name: 'United Kingdom', timezones: ['Europe/London'], locales: ['en_GB.UTF-8'], keyboards: ['uk'] },
        { name: 'Germany', timezones: ['Europe/Berlin'], locales: ['de_DE.UTF-8'], keyboards: ['de'] },
        { name: 'France', timezones: ['Europe/Paris'], locales: ['fr_FR.UTF-8'], keyboards: ['fr'] },
        { name: 'Spain', timezones: ['Europe/Madrid'], locales: ['es_ES.UTF-8'], keyboards: ['es'] },
        { name: 'Italy', timezones: ['Europe/Rome'], locales: ['it_IT.UTF-8'], keyboards: ['it'] },
        { name: 'Russia', timezones: ['Europe/Moscow', 'Asia/Yekaterinburg', 'Asia/Vladostok'], locales: ['ru_RU.UTF-8'], keyboards: ['ru'] },
        { name: 'Sweden', timezones: ['Europe/Stockholm'], locales: ['sv_SE.UTF-8'], keyboards: ['se'] },
        { name: 'Poland', timezones: ['Europe/Warsaw'], locales: ['pl_PL.UTF-8'], keyboards: ['pl'] },
    ],
    "North America": [
        { name: 'United States', timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu'], locales: ['en_US.UTF-8'], keyboards: ['us'] },
        { name: 'Canada', timezones: ['America/Toronto', 'America/Vancouver', 'America/Halifax', 'America/Winnipeg', 'America/St_Johns'], locales: ['en_CA.UTF-8', 'fr_CA.UTF-8'], keyboards: ['ca', 'ca-fr'] },
        { name: 'Mexico', timezones: ['America/Mexico_City', 'America/Tijuana', 'America/Cancun'], locales: ['es_MX.UTF-8'], keyboards: ['la-latin1'] },
    ],
    "Oceania": [
        { name: 'Australia', timezones: ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide'], locales: ['en_AU.UTF-8'], keyboards: ['us'] },
        { name: 'New Zealand', timezones: ['Pacific/Auckland'], locales: ['en_NZ.UTF-8'], keyboards: ['us'] },
    ],
    "South America": [
        { name: 'Brazil', timezones: ['America/Sao_Paulo', 'America/Manaus', 'America/Fortaleza'], locales: ['pt_BR.UTF-8'], keyboards: ['br'] },
        { name: 'Argentina', timezones: ['America/Argentina/Buenos_Aires'], locales: ['es_AR.UTF-8'], keyboards: ['la-latin1'] },
        { name: 'Colombia', timezones: ['America/Bogota'], locales: ['es_CO.UTF-8'], keyboards: ['la-latin1'] },
        { name: 'Chile', timezones: ['America/Santiago'], locales: ['es_CL.UTF-8'], keyboards: ['la-latin1'] },
    ]
};

const INITIAL_INTERNALIZED_SERVICES: InternalizedService[] = [
    {
        id: 'code-server',
        name: 'Code Server',
        port: 8080,
        protocol: 'tcp',
        enabled: true, // This is now a foundational service
        description: 'Access a web-based VS Code instance hosted directly from your Realm.',
        packageName: 'code-server',
    }
];


export const INITIAL_DISTRO_CONFIG: DistroConfig = {
    hostname: 'kael-os',
    username: 'architect',
    location: 'United States', // Country name
    timezone: 'America/New_York',
    locale: 'en_US.UTF-8',
    keyboardLayout: 'us',
    desktopEnvironment: 'KDE Plasma',
    kernels: ['linux-cachyos', 'linux-lts'],
    architecture: 'x86_64',
    ram: '8GB',
    swapSize: '10GB', // Default assuming 8GB RAM + 2GB
    packages: 'firefox, vscode, git, docker',
    gpuDriver: 'nvidia',
    graphicsMode: 'nvidia',
    shell: 'zsh',
    aurHelpers: ['paru'],
    extraRepositories: ['cachy', 'chaotic'],
    targetDisk: '/dev/sda',
    filesystem: 'btrfs',
    bootloader: 'grub',
    enableSnapshots: true,
    efiPartitionSize: '512M',
    networkMode: 'dhcp',
    aiResourceAllocation: 'balanced',
    aiGpuMode: 'none',
    localLLM: 'llama3:8b',
    firewallRules: [
        { port: '22', protocol: 'tcp', description: 'Allow SSH for remote access' },
        // Rule for code-server is now added by default
        { port: '8080', protocol: 'tcp', description: 'Allow Code Server' },
    ],
    internalizedServices: INITIAL_INTERNALIZED_SERVICES,
};

export const COMMAND_SUGGESTIONS = [
    "Let's start from scratch. Give me a minimal server setup.",
    "I'm a gamer. Forge me a high-performance Realm with KDE, NVIDIA drivers, and the latest kernel.",
    "Create a blueprint for a secure development machine with GNOME, docker, and a btrfs filesystem with snapshots.",
    "What are the benefits of using the 'chaotic' repository?",
];

export const BUILD_STEPS: BuildStep[] = [
    { name: 'Calibrating the Chrono-Anvil...', duration: 1000 },
    { name: 'Etching Configuration Grimoires...', duration: 1500 },
    { name: 'Summoning Calamares Spirit...', duration: 2000 },
    { name: 'Binding Post-Install Incantations...', duration: 2500 },
    { name: 'Forging the Master Build Script...', duration: 1000 },
];

export const CODEX_SNIPPETS: Snippet[] = [
    {
        id: '1',
        title: 'Manually Partition a Disk',
        content: `
# Use a tool like cfdisk or fdisk
# Example for UEFI/GPT with cfdisk
cfdisk /dev/sdX

# 1. Create EFI System Partition (512M, type: EFI System)
# 2. Create Swap Partition (e.g., 4G, type: Linux swap)
# 3. Create Root Partition (remaining space, type: Linux root (x86-64))

# Format the partitions
mkfs.fat -F32 /dev/sdX1
mkswap /dev/sdX2
mkfs.btrfs /dev/sdX3 # or mkfs.ext4 /dev/sdX3

# Mount the partitions
mount /dev/sdX3 /mnt
mkdir -p /mnt/boot
mount /dev/sdX1 /mnt/boot
swapon /dev/sdX2
        `.trim(),
    },
    {
        id: '2',
        title: 'Connect to Wi-Fi (iwctl)',
        content: `
# Start the iwd service if not running
systemctl start iwd

# Launch the interactive tool
iwctl

# List devices (e.g., wlan0)
[iwd]# device list

# Scan for networks
[iwd]# station <device_name> scan

# List available networks
[iwd]# station <device_name> get-networks

# Connect to a network
[iwd]# station <device_name> connect <SSID>

# Enter password when prompted.
# Exit iwctl with 'exit' or Ctrl+D.
# Verify connection
ping archlinux.org
`.trim(),
    },
    {
        id: '3',
        title: 'Pacman Basics',
        content: `
# Synchronize package databases
pacman -Sy

# Synchronize and update all packages
pacman -Syu

# Install a package
pacman -S <package_name>

# Install multiple packages
pacman -S <package1> <package2>

# Remove a package
pacman -R <package_name>

# Remove a package and its dependencies
pacman -Rs <package_name>

# Search for a package
pacman -Ss <search_term>
`.trim(),
    },
    {
        id: '4',
        title: 'Enable Chaotic-AUR Repository',
        content: `
# Install the primary key
pacman-key --recv-key 3056513887B78AEB --keyserver keyserver.ubuntu.com
pacman-key --lsign-key 3056513887B78AEB

# Install keyring and mirrorlist packages
pacman -U 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-keyring.pkg.tar.zst' 'https://cdn-mirror.chaotic.cx/chaotic-aur/chaotic-mirrorlist.pkg.tar.zst'

# Add to /etc/pacman.conf
echo -e "\\n[chaotic-aur]\\nInclude = /etc/pacman.d/chaotic-mirrorlist" >> /etc/pacman.conf

# Synchronize databases
pacman -Syu
`.trim(),
    },
    {
        id: '5',
        title: 'Using Paru (AUR Helper)',
        content: `
# Update all packages from official repositories and the AUR
paru

# Search for a package in repositories and the AUR
paru -Ss <search_term>

# Install a package (from repos or AUR)
paru -S <package_name>

# Remove a package and its dependencies
paru -Rs <package_name>

# Clean package cache and unneeded dependencies
paru -Sc
        `.trim(),
    },
    {
        id: '6',
        title: 'Managing UFW Firewall',
        content: `
# Check firewall status
sudo ufw status verbose

# Enable the firewall (if disabled)
sudo ufw enable

# Disable the firewall
sudo ufw disable

# Allow a port (e.g., 8080 for Code Server)
sudo ufw allow 8080/tcp

# Deny a port
sudo ufw deny 22/tcp

# Delete a rule
sudo ufw delete allow 8080/tcp
        `.trim(),
    },
    {
        id: '7',
        title: 'Managing Services (systemd)',
        content: `
# Check the status of a service (e.g., Code Server)
systemctl status code-server@$USER.service

# Start a service
sudo systemctl start code-server@$USER.service

# Stop a service
sudo systemctl stop code-server@$USER.service

# Enable a service to start on boot
sudo systemctl enable code-server@$USER.service

# Disable a service from starting on boot
sudo systemctl disable code-server@$USER.service

# View logs for a service (-f follows the log)
journalctl -u code-server@$USER.service -f
        `.trim(),
    },
    {
        id: '8',
        title: 'Working with BTRFS Snapshots',
        content: `
# NOTE: Automating snapshots with Timeshift or Snapper is recommended.
# This is a basic manual example.

# 1. List existing BTRFS subvolumes (your root is likely '@')
sudo btrfs subvolume list /mnt

# 2. Create a read-only snapshot of your root subvolume.
# Using a date format for the name is a good practice.
sudo btrfs subvolume snapshot -r /mnt/@ /mnt/@snapshots/root_$(date +%Y-%m-%d_%H-%M)

# 3. List your snapshots
ls -la /mnt/@snapshots

# Restoring from a snapshot is an advanced operation that involves
# booting from a live USB, renaming subvolumes, and is best performed
# after careful research. The grub-btrfs package helps make snapshots
# bootable for easier recovery.
        `.trim(),
    },
];