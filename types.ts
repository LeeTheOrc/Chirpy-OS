// Fix: Create type definitions for the application.
export type Role = 'user' | 'model';
export type LinkState = 'online' | 'offline';
export type BuildTarget = 'bare-metal' | 'qemu' | 'virtualbox';

export interface Message {
  role: Role;
  text: string;
  linkState?: LinkState;
}

export interface BuildStep {
    name: string;
    duration: number; // Estimated duration in milliseconds
}

export interface DistroConfig {
  hostname: string;
  username:string;
  password?: string; // New field for user/root password
  timezone: string;
  locale: string;
  desktopEnvironment: string;
  kernels: string[];
  architecture: string;
  ram: string;
  swapSize: string;
  location: string;
  keyboardLayout: string;
  packages: string;
  gpuDriver: string;
  graphicsMode: 'integrated' | 'nvidia' | 'hybrid';
  shell: 'bash' | 'fish';
  aurHelpers: ('paru' | 'yay')[];
  extraRepositories: ('cachy' | 'chaotic')[];
  // New properties for detailed installation
  targetDisk: string;
  filesystem: 'btrfs' | 'ext4';
  bootloader: 'grub' | 'systemd-boot';
  enableSnapshots: boolean;
  efiPartitionSize: string;
  // Networking
  networkMode: 'dhcp' | 'static';
  ipAddress?: string; // e.g., '192.168.1.100/24'
  gateway?: string; // e.g., '192.168.1.1'
  dnsServers?: string; // e.g., '1.1.1.1,8.8.8.8'
  // AI Core Configuration
  aiResourceAllocation: 'minimal' | 'balanced' | 'performance' | 'dynamic';
  aiGpuMode: 'none' | 'dedicated' | 'dynamic';
}

export interface Snippet {
  id: string;
  title: string;
  content: string;
}