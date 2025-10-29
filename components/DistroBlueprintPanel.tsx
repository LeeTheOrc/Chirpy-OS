// Fix: Implement the DistroBlueprintPanel component.
import React, { useState, useMemo } from 'react';
import { DistroConfig } from '../types';
import { generateInstallScript } from '../lib/script-generator';
import { BlueprintIcon, CopyIcon, DiscIcon, GpuIcon, PlusCircleIcon, ScanIcon } from './Icons';
import { Tooltip } from './Tooltip';
import { AI_RESOURCE_PROFILES } from '../constants';

interface DistroBlueprintPanelProps {
  config: DistroConfig;
  onConfigChange: (newConfig: Partial<DistroConfig>) => void;
  onNewBlueprint: () => void;
  onOpenScanModal: () => void;
  onOpenBuildModal: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string; tooltip?: string; icon?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, tooltip, icon, children }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-700/50 min-h-[41px]">
        <div className="flex items-center gap-1.5">
            {icon}
            <span className="text-slate-400">{label}</span>
            {tooltip && <Tooltip text={tooltip} />}
        </div>
        {value && <span className="font-mono text-slate-200">{value}</span>}
        {children}
    </div>
);

const SegmentedControl: React.FC<{ options: string[]; value: string; onChange: (value: string) => void; disabled?: boolean }> = ({ options, value, onChange, disabled }) => (
    <div className={`flex items-center bg-slate-800/80 rounded-md p-1 ${disabled ? 'opacity-50' : ''}`}>
        {options.map(option => (
            <button
                key={option}
                onClick={() => !disabled && onChange(option)}
                disabled={disabled}
                className={`flex-1 text-center text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md transition-colors ${
                    value === option ? 'bg-slate-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'
                } ${disabled ? 'cursor-not-allowed' : ''}`}
            >
                {option}
            </button>
        ))}
    </div>
);

export const DistroBlueprintPanel: React.FC<DistroBlueprintPanelProps> = ({ config, onConfigChange, onNewBlueprint, onOpenScanModal, onOpenBuildModal }) => {
    const [activeTab, setActiveTab] = useState('config');
    const [copied, setCopied] = useState(false);

    const installScript = useMemo(() => generateInstallScript(config), [config]);

    const handleCopy = () => {
        navigator.clipboard.writeText(installScript);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleProfileChange = (key: string) => {
        const newAllocation = key as DistroConfig['aiResourceAllocation'];
        const newConfig: Partial<DistroConfig> = { aiResourceAllocation: newAllocation };

        if (newAllocation === 'dynamic' && config.graphicsMode === 'hybrid') {
            newConfig.aiGpuMode = 'dynamic';
        } else {
            // When switching away from dynamic, or if not hybrid, reset GPU mode.
            newConfig.aiGpuMode = 'none';
        }
        onConfigChange(newConfig);
    };

    const isGpuControlDisabled = config.graphicsMode !== 'hybrid' || config.aiResourceAllocation === 'dynamic';

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
                    <h3 className="text-sm font-semibold text-slate-400 pt-2 pb-1 uppercase tracking-wider">User & Security</h3>
                    <DetailItem label="Hostname" value={config.hostname} tooltip="The name of the computer on the network."/>
                    <DetailItem label="Username" value={config.username} tooltip="The name of the primary user account."/>
                    <DetailItem label="Password" value="********" tooltip="The user and root password will be set during the interactive installation." />

                    <h3 className="text-sm font-semibold text-slate-400 pt-4 pb-1 uppercase tracking-wider">AI Core Configuration</h3>
                     <div className="py-2">
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-slate-400 text-sm">Resource Profile</span>
                            <Tooltip text="Set resource limits for the AI's offline core to balance system performance." />
                        </div>
                        <div className="space-y-2">
                            {Object.entries(AI_RESOURCE_PROFILES).map(([key, profile]) => (
                                <button
                                    key={key}
                                    onClick={() => handleProfileChange(key)}
                                    className={`w-full text-left p-3 border rounded-lg transition-all duration-200 ease-in-out ${
                                        config.aiResourceAllocation === key
                                            ? 'bg-slate-700/70 border-yellow-500 shadow-lg shadow-yellow-500/10'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="font-semibold text-slate-100">{profile.name}</div>
                                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">{profile.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <DetailItem 
                        label="iGPU Mode" 
                        tooltip={
                            config.graphicsMode !== 'hybrid' 
                            ? "Only available on systems with hybrid graphics." 
                            : config.aiResourceAllocation === 'dynamic'
                            ? "Automatically set to 'Dynamic' when using the Dynamic resource profile."
                            : "None: iGPU is unused by AI. Dedicated: iGPU is exclusive to AI. Dynamic: iGPU is shared."
                        }
                    >
                        <SegmentedControl
                            options={['none', 'dedicated', 'dynamic']}
                            value={config.aiGpuMode}
                            onChange={(value) => onConfigChange({ aiGpuMode: value as DistroConfig['aiGpuMode'] })}
                            disabled={isGpuControlDisabled}
                        />
                    </DetailItem>


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
                            onChange={(e) => onConfigChange({ packages: e.target.value })}
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