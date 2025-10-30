import React from 'react';
import type { DistroConfig } from '../types';
import { Tooltip } from './Tooltip';
import {
  CpuChipIcon,
  HddIcon,
  BtrfsIcon,
  GrubIcon,
  GpuIcon,
  MemoryStickIcon,
  ShieldIcon,
  GlobeAltIcon,
} from './Icons';
import { SegmentedControl } from './SegmentedControl';
import { FirewallConfigurator } from './FirewallConfigurator';
import { SovereignServicesConfigurator } from './SovereignServicesConfigurator';

interface GolemBuildConfiguratorProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
}

const Module: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-forge-panel/40 border border-forge-border/80 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
            <div className="text-dragon-fire">{icon}</div>
            <h5 className="font-bold text-forge-text-primary">{title}</h5>
        </div>
        <div className="space-y-3">{children}</div>
    </div>
);

const DetailInput: React.FC<{ label: string; name: keyof DistroConfig; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; tooltip?: string; disabled?: boolean; }> = ({ label, name, value, onChange, tooltip, disabled }) => (
    <div>
        <label htmlFor={name} className="flex items-center gap-1.5 text-forge-text-secondary text-xs mb-1">{label}{tooltip && <Tooltip text={tooltip} />}</label>
        <input type="text" id={name} name={name} value={value || ''} onChange={onChange} disabled={disabled} className="w-full bg-forge-panel/60 text-forge-text-primary font-medium text-sm border border-forge-border focus:ring-1 focus:ring-dragon-fire focus:border-dragon-fire rounded-md p-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
    </div>
);


export const GolemBuildConfigurator: React.FC<GolemBuildConfiguratorProps> = ({ config, onConfigChange, isLocked }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        onConfigChange({ ...config, [name]: val });
    };

    const handleSegmentChange = (name: keyof DistroConfig, value: string) => {
        onConfigChange({ ...config, [name]: value });
    };

    return (
        <div className="space-y-4">
            <Module title="Storage" icon={<HddIcon className="w-6 h-6" />}>
                <DetailInput
                    label="Target Disk"
                    name="targetDisk"
                    value={config.targetDisk}
                    onChange={handleChange}
                    tooltip="e.g., /dev/sda. This will be confirmed during the interactive installation."
                    disabled={isLocked}
                />
                <div className="flex justify-between items-center py-1.5">
                    <label className="flex items-center gap-1.5 text-forge-text-secondary text-xs">Filesystem
                        <Tooltip text="Per the Core Philosophy, BTRFS is the immutable foundation, providing the temporal magic of snapshots." />
                    </label>
                    <span className="bg-forge-panel/60 text-forge-text-primary font-medium text-sm rounded-md p-1.5 flex items-center gap-1.5">
                        <BtrfsIcon className="w-4 h-4" /> BTRFS
                    </span>
                </div>
                 <div className="flex justify-between items-center py-1.5">
                    <label className="flex items-center gap-1.5 text-forge-text-secondary text-xs">Bootable Snapshots
                        <Tooltip text="Enabled by default as a core feature of the BTRFS philosophy, allowing the Realm to be restored from boot." />
                    </label>
                    <span className="text-dragon-fire font-medium text-sm">
                        Enabled
                    </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                    <label className="flex items-center gap-1.5 text-forge-text-secondary text-xs">EFI Partition
                        <Tooltip text="Per the Core Philosophy, a 512MB EFI partition is the keystone for the GRUB bootloader." />
                    </label>
                    <span className="bg-forge-panel/60 text-forge-text-primary font-medium text-sm rounded-md p-1.5">
                        512MB
                    </span>
                </div>
            </Module>

            <Module title="Memory & Swap" icon={<MemoryStickIcon className="w-6 h-6" />}>
                <DetailInput
                    label="RAM (Blueprint)"
                    name="ram"
                    value={config.ram}
                    onChange={handleChange}
                    tooltip="Blueprint value for RAM. Actual swap is calculated from detected RAM during installation."
                    disabled={isLocked}
                />
                <div className="flex justify-between items-center py-1.5">
                    <label className="flex items-center gap-1.5 text-forge-text-secondary text-xs">Swap Partition
                        <Tooltip text="Per the Core Philosophy, a dedicated swap partition is created with a size equal to the system's total RAM plus 2 GB to ensure stability." />
                    </label>
                    <span className="bg-forge-panel/60 text-forge-text-primary font-medium text-sm rounded-md p-1.5">
                        RAM + 2GB
                    </span>
                </div>
            </Module>

            <Module title="Boot & Kernel" icon={<CpuChipIcon className="w-6 h-6" />}>
                <div className="flex justify-between items-center py-1.5">
                    <label className="flex items-center gap-1.5 text-forge-text-secondary text-xs">Bootloader
                        <Tooltip text="Per the Core Philosophy, GRUB is the immutable Keystone of the Realm." />
                    </label>
                    <span className="bg-forge-panel/60 text-forge-text-primary font-medium text-sm rounded-md p-1.5 flex items-center gap-1.5">
                        <GrubIcon className="w-4 h-4" /> GRUB
                    </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                    <label className="flex items-center gap-1.5 text-forge-text-secondary text-xs">Kernels
                        <Tooltip text="The 'Twin Hearts' philosophy dictates a performance kernel (cachyos) and a stability kernel (lts)." />
                    </label>
                    <span className="bg-forge-panel/60 text-forge-text-primary font-medium text-sm rounded-md p-1.5">
                        linux-cachyos, linux-lts
                    </span>
                </div>
            </Module>

            <Module title="Graphics" icon={<GpuIcon className="w-6 h-6" />}>
                 <div>
                    <label className="text-forge-text-secondary text-xs mb-1 block">Graphics Mode</label>
                    <SegmentedControl
                        value={config.graphicsMode}
                        onChange={(value) => handleSegmentChange('graphicsMode', value)}
                        disabled={isLocked}
                        options={[
                            { value: 'integrated', label: 'Integrated' },
                            { value: 'nvidia', label: 'NVIDIA' },
                            { value: 'hybrid', label: 'Hybrid' },
                        ]}
                    />
                </div>
                 <DetailInput
                    label="GPU Driver"
                    name="gpuDriver"
                    value={config.gpuDriver}
                    onChange={handleChange}
                    tooltip="e.g., nvidia, amd, intel. Ensure this matches your hardware."
                    disabled={isLocked}
                />
            </Module>

            <Module title="Security & Wards" icon={<ShieldIcon className="w-6 h-6" />}>
                <FirewallConfigurator
                    config={config}
                    onConfigChange={onConfigChange}
                    isLocked={isLocked}
                />
            </Module>

            <Module title="Sovereign Services" icon={<GlobeAltIcon className="w-6 h-6" />}>
                <SovereignServicesConfigurator
                    config={config}
                    onConfigChange={onConfigChange}
                    isLocked={isLocked}
                />
            </Module>
        </div>
    );
};