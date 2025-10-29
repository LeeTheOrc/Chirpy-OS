import { Message, DistroConfig } from './types';

export const INITIAL_MESSAGES: Message[] = [
  {
    role: 'model',
    text: "Hello! I'm Chirpy, your AI assistant for crafting custom Arch Linux blueprints. Describe your ideal OS, and I'll configure the blueprint. You can also attach a hardware report for automatic optimization."
  }
];

export const COMMAND_SUGGESTIONS: string[] = [
    "Set up a minimal development environment with git, docker, and neovim.",
    "I'm a gamer. I need Steam, Lutris, and a performance-oriented setup.",
    "Configure my network with a static IP: 192.168.1.50/24, gateway 192.168.1.1, and DNS 1.1.1.1.",
    "I need a quiet system for writing. Install LibreOffice and set a calm, dark theme."
];

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
};