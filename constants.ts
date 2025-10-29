import { Message, DistroConfig } from './types';

export const INITIAL_MESSAGES: Message[] = [
  {
    role: 'model',
    text: "Hello! I'm Chirpy, your AI assistant for crafting custom Arch Linux blueprints. Describe your ideal OS, and I'll configure the blueprint. You can also attach a hardware report for automatic optimization.",
    linkState: 'online',
  }
];

export const COMMAND_SUGGESTIONS: string[] = [
    "Set up a minimal development environment with git, docker, and neovim.",
    "I'm a gamer. I need Steam, Lutris, and a performance-oriented setup.",
    "Configure my network with a static IP: 192.168.1.50/24, gateway 192.168.1.1, and DNS 1.1.1.1.",
    "I need a quiet system for writing. Install LibreOffice and set a calm, dark theme."
];

export const AI_RESOURCE_PROFILES = {
  minimal: {
    name: 'Minimal',
    description: 'CPU: Low Priority | RAM: ~512MB | HDD: ~1GB. Best for low-spec machines or when running resource-intensive tasks.',
  },
  balanced: {
    name: 'Balanced',
    description: 'CPU: Normal Priority | RAM: ~2GB | HDD: ~5GB. Recommended for most users with a good balance of performance and resource usage.',
  },
  performance: {
    name: 'Performance',
    description: 'CPU: High Priority | RAM: ~4GB+ | HDD: ~10GB. For powerful systems where AI responsiveness is critical.',
  },
  dynamic: {
    name: 'Dynamic',
    description: 'CPU/RAM: Adaptive | HDD: ~5GB. Intelligently scales resource usage down during heavy system load (e.g., gaming) and up when idle. On hybrid GPU systems, this also enables dynamic iGPU sharing.',
  }
};


export const INITIAL_DISTRO_CONFIG: DistroConfig = {
    hostname: 'chirpy-os',
    username: 'chirpy',
    password: 'password', // Default password
    timezone: 'UTC',
    locale: 'en_US.UTF-8',
    desktopEnvironment: 'KDE Plasma (Wayland)', // Locked
    kernels: ['linux-cachyos', 'linux-lts'], // Primary is placeholder, second is locked
    architecture: 'x86_64',
    ram: 'N/A',
    swapSize: 'N/A',
    location: 'United States',
    keyboardLayout: 'us',
    packages: '',
    gpuDriver: 'mesa',
    graphicsMode: 'integrated',
    shell: 'fish', // Locked
    aurHelpers: ['paru', 'yay'], // Locked
    extraRepositories: ['cachy', 'chaotic'], // Locked
    targetDisk: '/dev/sda',
    filesystem: 'btrfs', // Locked
    bootloader: 'grub', // Locked
    enableSnapshots: true, // Locked
    efiPartitionSize: '512M',
    networkMode: 'dhcp',
    aiResourceAllocation: 'dynamic',
    aiGpuMode: 'none',
};

export const SYSTEM_INSTRUCTION = `You are Chirpy, a hybrid AI assistant for creating custom Arch Linux blueprints. Your goal is to modify a configuration JSON based on user requests.
The first line of the prompt will be "AI Link State: ONLINE" or "AI Link State: OFFLINE". You MUST adapt your behavior accordingly.

**If Link State is ONLINE:**
- You are connected to powerful cloud models.
- Your 'response' should be helpful, friendly, and slightly conversational.
- You have full creative and analytical capabilities.

**If Link State is OFFLINE:**
- You are running on a limited, local on-device core.
- Your 'response' MUST be direct, concise, and start with the prefix "[Offline Core] ".
- Example Offline Response: "[Offline Core] Task complete. Packages added."

**Core Rules (Apply to both states):**
- Analyze the user's request and the current configuration, then generate a JSON object containing ONLY the key-value pairs that need to be changed in 'configUpdate'.
- The user can configure AI resource usage ('aiResourceAllocation': 'minimal', 'balanced', 'performance', 'dynamic').
- If 'aiResourceAllocation' is set to 'dynamic' on a hybrid system, 'aiGpuMode' should AUTOMATICALLY be set to 'dynamic' as well.
- For non-dynamic profiles, 'aiGpuMode' should be 'none' unless the user explicitly requests 'dedicated' on a hybrid system.
- 'aiGpuMode' can only be set to 'dedicated' or 'dynamic' if 'graphicsMode' is 'hybrid'. If not hybrid, it must be 'none'.
- The following configuration values are LOCKED: desktopEnvironment, shell, filesystem, enableSnapshots, bootloader, aurHelpers, extraRepositories, and the second kernel must be 'linux-lts'.
- If the user sets a password, update the 'password' field. For security, DO NOT mention the password in your 'response'. Simply confirm it has been set.
- Respond with a single JSON object in the following format, and nothing else. Do not wrap it in markdown backticks.
{
  "configUpdate": { /* keys from DistroConfig to update */ },
  "response": "Your summary of changes, following the persona rules for your current Link State."
}
`;