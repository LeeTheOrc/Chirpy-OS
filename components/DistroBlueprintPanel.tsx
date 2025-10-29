// Fix: Implement the DistroBlueprintPanel component.
import React, { useState, useMemo } from 'react';
import { DistroConfig } from '../types';
import { generateInstallScript } from '../lib/script-generator';
import { BlueprintIcon, CopyIcon, DiscIcon, GpuIcon, PlusCircleIcon, ScanIcon } from './Icons';
import { Tooltip } from './Tooltip';

interface DistroBlueprintPanelProps {
  config: DistroConfig;
  onPackagesChange: (packages: string) => void;
  onNewBlueprint: () => void;
  onOpenScanModal: () => void;
  onOpenBuildModal: () => void;
}

const DetailItem: React.FC<{ label: string; value: string; tooltip?: string; icon?: React.ReactNode }> = ({ label, value, tooltip, icon }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-700/50">
        <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-slate-400">{label}</span>
            {tooltip && <Tooltip text={tooltip} />}
        </div>
        <span className="font-mono text-slate-200">{value || 'N/A'}</span>
    </div>
);

export const DistroBlueprintPanel: React.FC<DistroBlueprintPanelProps> = ({ config, onPackagesChange, onNewBlueprint, onOpenScanModal, onOpenBuildModal }) => {
    const [activeTab, setActiveTab] = useState('config');
    const [copied, setCopied] = useState(false);

    const installScript = useMemo(() => generateInstallScript(config), [config]);

    const handleCopy = () => {
        navigator.clipboard.writeText(installScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

  return (
    <div className="w-full lg:w-[480px] bg-slate-900/60 border-r border-slate-800/50 backdrop-blur-sm flex flex-col flex-shrink-0 animate-slide-in-left">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
                <BlueprintIcon className="w-6 h-6 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Chirpy OS Blueprint</h2>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={onOpenScanModal} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Scan system hardware"><ScanIcon className="w-5 h-5" /></button>
                 <button onClick={onNewBlueprint} className="p-1.5 text-slate-400 hover:text-white transition-colors" title="Start a new blueprint"><PlusCircleIcon className="w-5 h-5" /></button>
                <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-white transition-colors" title={copied ? "Copied!" : "Copy Install Script"}>
                    <CopyIcon className="w-5 h-5" />
                </button>
                 <button onClick={onOpenBuildModal} className="ml-2 flex items-center gap-2 bg-yellow-500 text-slate-900 px-3 py-1.5 rounded-md hover:bg-yellow-400 transition-colors text-sm font-bold" title="Forge Live CD">
                    <DiscIcon className="w-5 h-5" />
                    <span>Forge</span>
                </button>
            </div>
        </div>

        <div className="p-4 overflow-y-auto">
            <div className="flex border-b border-slate-700/80 mb-4">
                <button 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'config' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setActiveTab('config')}
                >
                    Configuration
                </button>
                <button 
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'script' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400 hover:text-white'}`}
                    onClick={() => setActiveTab('script')}
                >
                    Installer Script
                </button>
            </div>
            
            {activeTab === 'config' && (
                <div className="space-y-1 animate-fade-in-fast">
                    <h3 className="text-sm font-semibold text-slate-400 pt-2 pb-1 uppercase tracking-wider">Core Features</h3>
                    <DetailItem label="Chirpy AI Core" value="Hybrid" tooltip="The AI assistant is a core, permanent feature. It uses powerful online models when connected and a specialized offline model (running on-device) when disconnected, ensuring you always have guidance." />
                    <DetailItem label="Neofetch Greeting" value="Enabled" tooltip="Shows system info with a custom ASCII logo on terminal login." />
                    <DetailItem label="BTRFS Snapshots" value="Enabled" tooltip="Configures snapper and grub-btrfs for bootable filesystem snapshots, allowing system rollbacks directly from the boot menu. Requires BTRFS." />
                    
                    <h3 className="text-sm font-semibold text-slate-400 pt-4 pb-1 uppercase tracking-wider">User & Security</h3>
                    <DetailItem label="Hostname" value={config.hostname} tooltip="The name of the computer on the network."/>
                    <DetailItem label="Username" value={config.username} tooltip="The name of the primary user account."/>
                    <DetailItem label="Password" value="********" tooltip="The user and root password will be set during the interactive installation." />

                    <h3 className="text-sm font-semibold text-slate-400 pt-4 pb-1 uppercase tracking-wider">Software Stack</h3>
                     <DetailItem label="Shell" value={config.shell.charAt(0).toUpperCase() + config.shell.slice(1)} tooltip="The command-line interface for your OS. Fish is the standard." />
                     <DetailItem label="AUR Helpers" value={config.aurHelpers.map(h => h.charAt(0).toUpperCase() + h.slice(1)).join(', ')} tooltip="Grants access to the Arch User Repository for a vast selection of community packages." />
                     <DetailItem label="Extra Repositories" value={config.extraRepositories.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')} tooltip="High-performance and pre-compiled package repositories." />
                     
                    <div className="pt-4 pb-2 space-y-2">
                         <div className="flex items-center gap-1.5">
                            <label htmlFor="packages" className="text-slate-200 font-medium">Additional Packages</label>
                            <Tooltip text="List additional packages to install via pacman, one per line. The core software stack is already included." />
                        </div>
                        <textarea
                            id="packages"
                            value={config.packages}
                            onChange={(e) => onPackagesChange(e.target.value)}
                            placeholder="git&#10;docker&#10;neovim"
                            className="w-full h-32 bg-slate-800/80 border border-slate-700 rounded-lg p-2 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                        />
                    </div>
                    
                    <h3 className="text-sm font-semibold text-slate-400 pt-4 pb-1 uppercase tracking-wider">System & Hardware</h3>
                    <DetailItem label="Desktop" value={config.desktopEnvironment} />
                    <DetailItem label="Kernels" value={config.kernels.join(', ')} tooltip="Primary kernel is a CachyOS performance-tuned kernel for your specific CPU, with linux-lts as a stable fallback." />
                    <DetailItem label="RAM" value={config.ram} tooltip="Detected system memory. Swap size is calculated based on this value." />
                    <DetailItem label="Swap Size" value={config.swapSize} tooltip="Automatically calculated as RAM + 2GB." />
                    <DetailItem label="Graphics Mode" value={config.graphicsMode.charAt(0).toUpperCase() + config.graphicsMode.slice(1)} tooltip="For dual-GPU laptops. 'Hybrid' mode enables switching between the integrated and dedicated GPU to balance performance and battery life." />
                    <DetailItem label="GPU Driver" value={config.gpuDriver} icon={<GpuIcon className="w-4 h-4 text-slate-500" />} />
                    
                    <h3 className="text-sm font-semibold text-slate-400 pt-4 pb-1 uppercase tracking-wider">Installation</h3>
                    <DetailItem label="Target Disk" value={config.targetDisk} tooltip="The block device for the new OS installation."/>
                    <DetailItem label="Filesystem" value={config.filesystem.toUpperCase()} />
                    <DetailItem label="Bootloader" value={config.bootloader} />
                    <DetailItem label="EFI Size" value={config.efiPartitionSize} />

                    <h3 className="text-sm font-semibold text-slate-400 pt-4 pb-1 uppercase tracking-wider">Networking</h3>
                    <DetailItem label="Mode" value={config.networkMode.toUpperCase()} tooltip="DHCP automatically gets an IP address. Static requires manual configuration." />
                    {config.networkMode === 'static' && (
                        <>
                            <DetailItem label="IP Address" value={config.ipAddress ?? 'Not set'} />
                            <DetailItem label="Gateway" value={config.gateway ?? 'Not set'} />
                            <DetailItem label="DNS Servers" value={config.dnsServers ?? 'Not set'} />
                        </>
                    )}

                    <h3 className="text-sm font-semibold text-slate-400 pt-4 pb-1 uppercase tracking-wider">Localization</h3>
                    <DetailItem label="Timezone" value={config.timezone} />
                    <DetailItem label="Locale" value={config.locale} />
                    <DetailItem label="Keyboard" value={config.keyboardLayout} />
                </div>
            )}
            
            {activeTab === 'script' && (
                <div className="space-y-4 animate-fade-in-fast">
                   <div className="bg-slate-800/50 rounded-lg">
                       <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded-t-lg">
                         <h3 className="text-sm font-mono text-slate-300">install.sh</h3>
                         <button 
                            onClick={handleCopy}
                            className="text-slate-400 hover:text-white transition-colors"
                            title={copied ? "Copied!" : "Copy script"}
                         >
                            <CopyIcon className="w-4 h-4" />
                         </button>
                       </div>
                       <pre className="p-3 text-xs text-slate-400 overflow-x-auto max-h-[calc(100vh-220px)]"><code>{installScript}</code></pre>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};