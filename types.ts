export type Role = 'user' | 'model';
export type LinkState = 'online' | 'offline';
export type BuildTarget = 'bare-metal' | 'qemu' | 'virtualbox';
export type LocalLLM = 'llama3:8b' | 'phi3:mini';

export interface Message {
  role: Role;
  text: string;
  linkState?: LinkState;
}

export interface BuildStep {
    name: string;
    duration: number; // Estimated duration in milliseconds
}

export interface FirewallRule {
  port: string;
  protocol: 'tcp' | 'udp' | 'any';
  description: string;
}

// New: Interface for self-hosted services
export interface InternalizedService {
  id: 'code-server';
  name: string;
  port: number;
  protocol: 'tcp' | 'udp';
  enabled: boolean;
  description: string;
  packageName: string;
}

export interface DistroConfig {
  hostname?: string;
  username?: string;
  timezone: string;
  locale: string;
  desktopEnvironment: 'KDE Plasma';
  kernels: string[];
  architecture: string;
  ram: string;
  swapSize: string;
  location: string;
  keyboardLayout: string;
  packages: string;
  gpuDriver: string;
  graphicsMode: 'integrated' | 'nvidia' | 'hybrid';
  shell: 'zsh';
  aurHelpers: ('paru')[];
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
  aiResourceAllocation?: 'minimal' | 'balanced' | 'performance' | 'dynamic';
  aiGpuMode?: 'none' | 'dedicated' | 'dynamic';
  // New: Firewall configuration
  firewallRules: FirewallRule[];
  // New: Sovereign Services
  internalizedServices: InternalizedService[];
  // New: Local LLM selection
  localLLM: LocalLLM;
}

export interface Snippet {
  id: string;
  title: string;
  content: string;
}