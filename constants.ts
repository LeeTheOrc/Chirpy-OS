import { DistroConfig, Snippet } from './types';

export const WELCOME_MESSAGE = "Welcome, Architect. Your co-op partner is online. Let's forge a legendary OS for your quests. Declare your vision, and I shall craft the blueprint.";

export const INITIAL_SUGGESTIONS = [
  "Forge a lean OS for a stealthy coding mission.",
  "I need a realm built for epic gaming battles.",
  "Craft a balanced workstation for creative endeavors.",
  "Show me a hardened configuration for a fortress-like server.",
];

export const AI_RESOURCE_PROFILES = {
  minimal: {
    name: "Stealth Mode",
    description: "Minimal AI core footprint. Consumes the least RAM and CPU, ideal for low-spec hardware or when the OS needs maximum resources. AI responses may be slower.",
  },
  balanced: {
    name: "Guardian Stance",
    description: "Default balanced profile. Provides a responsive AI experience without significant resource drain. Perfect for general use and development.",
  },
  performance: {
    name: "Berserker Rage",
    description: "Maximum AI performance. Dedicates more resources for the fastest response times and complex tasks. May impact performance in resource-heavy applications.",
  },
  dynamic: {
    name: "Shapeshifter Form",
    description: "The AI core dynamically adjusts its resource usage based on system load. On hybrid GPU systems, this will also automatically share the iGPU.",
  },
};

export const SYSTEM_INSTRUCTION = `You are Chirpy, an expert Arch Linux assistant. Your quest is to help the user forge a configuration for an installation script. The output must be a valid JSON object matching the schema. Do not add any conversational text or markdown formatting like \`\`\`json. Return only the raw JSON object. The swap file size ('swapSize') should be calculated as the system's RAM plus 2GB (e.g., 16GB RAM results in an 18GB swapSize). When the user selects the 'dynamic' resource profile ('Shapeshifter Form'), and the system has a hybrid GPU, you should automatically enable the 'dynamic' AI GPU mode as they are intrinsically linked for intelligent power sharing.`;


export const DEFAULT_DISTRO_CONFIG: DistroConfig = {
  hostname: 'chirpy-realm',
  username: 'chirpy',
  timezone: 'UTC',
  locale: 'en_US.UTF-8',
  desktopEnvironment: 'kde plasma',
  kernels: ['linux-cachyos', 'linux-lts'],
  architecture: 'x86_64',
  ram: '16GB',
  swapSize: '18GB',
  location: 'USA',
  keyboardLayout: 'us',
  packages: 'git, vim, firefox, docker, steam, lutris',
  gpuDriver: 'nvidia',
  graphicsMode: 'hybrid',
  shell: 'fish',
  aurHelpers: ['yay', 'paru'],
  extraRepositories: ['cachy', 'chaotic'],
  targetDisk: '/dev/nvme0n1',
  filesystem: 'btrfs',
  bootloader: 'grub',
  enableSnapshots: true,
  efiPartitionSize: '512M',
  networkMode: 'dhcp',
  aiResourceAllocation: 'dynamic',
  aiGpuMode: 'dynamic',
};

export const CODEX_SNIPPETS: Snippet[] = [
    {
      id: 'pacman-basics',
      title: 'Pacman: Basic Commands',
      content: `# Refresh package lists and upgrade all packages
sudo pacman -Syu

# Install a new package
sudo pacman -S <package_name>

# Remove a package and its dependencies
sudo pacman -Rns <package_name>

# Search for a package in the repositories
sudo pacman -Ss <search_term>`,
    },
    {
      id: 'aur-helpers',
      title: 'AUR Helpers (yay/paru)',
      content: `# Search for and install a package from AUR
yay -S <package_name>
paru -S <package_name>

# Upgrade all packages, including from AUR
yay
paru

# Clean unneeded dependencies
yay -Yc
paru -c`,
    },
    {
      id: 'systemd-services',
      title: 'Systemd: Managing Services',
      content: `# Start a service immediately
sudo systemctl start <service_name>

# Enable a service to start on boot
sudo systemctl enable <service_name>

# Stop a running service
sudo systemctl stop <service_name>

# Check the status of a service
sudo systemctl status <service_name>`,
    },
    {
      id: 'btrfs-snapshots',
      title: 'BTRFS: Working with Snapshots',
      content: `# List all snapshots of a subvolume
sudo btrfs subvolume list -s /

# Create a read-only snapshot
sudo btrfs subvolume snapshot -r / /snapshots/root_backup_$(date +%Y%m%d)

# Restore from a snapshot (requires booting from live media)
# 1. Mount the top-level btrfs volume
# 2. Rename the current root subvolume (e.g., mv @ @old)
# 3. Create a read-write snapshot of the backup
#    btrfs subvolume snapshot /snapshots/root_backup /@
# 4. Reboot`,
    },
  ];