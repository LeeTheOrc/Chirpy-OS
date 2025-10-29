import React from 'react';
import type { DistroConfig } from '../types';
import { Tooltip } from './Tooltip';
import { AI_RESOURCE_PROFILES } from '../constants';

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="font-bold text-yellow-400/90 mb-2 mt-4 text-md tracking-wide">{title}</h4>
);

const DetailInput: React.FC<{ label: string; name: keyof DistroConfig; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; tooltip?: string; disabled?: boolean }> = ({ label, name, value, onChange, tooltip, disabled }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
        <label htmlFor={name} className="flex items-center gap-1.5 text-slate-400 text-sm">{label}{tooltip && <Tooltip text={tooltip} />}</label>
        <input id={name} name={name} value={value || ''} onChange={onChange} disabled={disabled} className="bg-slate-800/50 text-slate-200 font-medium text-sm text-right border-none focus:ring-1 focus:ring-purple-500 rounded-md w-1/2 p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
    </div>
);

const DetailSelect: React.FC<{ label: string; name: keyof DistroConfig; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {value: string, label: string}[]; tooltip?: string, disabled?: boolean }> = ({ label, name, value, onChange, options, tooltip, disabled }) => (
     <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
        <label htmlFor={name} className="flex items-center gap-1.5 text-slate-400 text-sm">{label}{tooltip && <Tooltip text={tooltip} />}</label>
        <select id={name} name={name} value={value || ''} onChange={onChange} disabled={disabled} className="bg-slate-800/50 text-slate-200 font-medium text-sm text-right border-none focus:ring-1 focus:ring-purple-500 rounded-md w-1/2 p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);


interface DistroBlueprintFormProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
}

// Defensive renderer for array-like fields to prevent crashes from malformed AI responses.
const renderArrayAsString = (value: unknown): string => {
    if (Array.isArray(value)) {
      // Ensure all items are strings before joining, just in case.
      return value.map(String).join(', ');
    }
    // If it's already a string, use it. This can happen with a corrupted state.
    if (typeof value === 'string') {
      return value;
    }
    // Otherwise, default to empty string for safety.
    return '';
  };
  
export const DistroBlueprintForm: React.FC<DistroBlueprintFormProps> = ({ config, onConfigChange, isLocked }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newConfig = { ...config, [name]: value };
        
        if (name === 'aiResourceAllocation' && value === 'dynamic' && config.graphicsMode === 'hybrid') {
            newConfig.aiGpuMode = 'dynamic';
        }
        
        onConfigChange(newConfig);
    };

    const handleArrayChange = (name: 'aurHelpers' | 'extraRepositories' | 'kernels', value: string) => {
        onConfigChange({ ...config, [name]: value.split(',').map(s => s.trim()).filter(Boolean) as any });
    };
    
    // Explicitly check for a valid profile before accessing its properties to prevent render errors.
    const activeProfile = AI_RESOURCE_PROFILES[config.aiResourceAllocation as keyof typeof AI_RESOURCE_PROFILES];
    const powerStanceTooltip = activeProfile ? activeProfile.description : "Select a valid power profile to see a description.";

    return (
        <div className="p-5">
            <SectionHeader title="Identity & Wards" />
            <DetailInput label="Realm Name" name="hostname" value={config.hostname} onChange={handleChange} disabled={isLocked} />
            <DetailInput label="Master User" name="username" value={config.username} onChange={handleChange} disabled={isLocked} />
            <DetailInput label="Timezone" name="timezone" value={config.timezone} onChange={handleChange} disabled={isLocked} />
            <DetailInput label="Locale" name="locale" value={config.locale} onChange={handleChange} disabled={isLocked} />
            <DetailSelect label="Shell" name="shell" value={config.shell} onChange={handleChange} options={[{value: 'bash', label: 'Bash'}, {value: 'fish', label: 'Fish'}]} disabled={isLocked} />

            <SectionHeader title="The Golem's Build" />
            <DetailInput label="Target Disk" name="targetDisk" value={config.targetDisk} onChange={handleChange} disabled={isLocked} />
            <DetailSelect label="Filesystem" name="filesystem" value={config.filesystem} onChange={handleChange} options={[{value: 'btrfs', label: 'BTRFS'}, {value: 'ext4', label: 'EXT4'}]} disabled={isLocked} />
            <DetailSelect label="Bootloader" name="bootloader" value={config.bootloader} onChange={handleChange} options={[{value: 'grub', label: 'GRUB'}, {value: 'systemd-boot', label: 'systemd-boot'}]} disabled={isLocked} />
            <DetailInput label="Kernels" name="kernels" value={renderArrayAsString(config.kernels)} onChange={(e) => handleArrayChange('kernels', e.target.value)} tooltip="Comma-separated list of kernel packages (e.g., linux, linux-lts)." disabled={isLocked} />
            <DetailSelect label="Graphics Mode" name="graphicsMode" value={config.graphicsMode} onChange={handleChange} options={[{value: 'integrated', label: 'Integrated'}, {value: 'nvidia', label: 'NVIDIA'}, {value: 'hybrid', label: 'Hybrid'}]} disabled={isLocked} />
            <DetailInput label="GPU Driver" name="gpuDriver" value={config.gpuDriver} onChange={handleChange} tooltip="e.g., nvidia, amd, intel" disabled={isLocked} />
            
            <SectionHeader title="AI Core Attunement" />
            <DetailSelect 
                label="Power Stance" 
                name="aiResourceAllocation" 
                value={config.aiResourceAllocation} 
                onChange={handleChange}
                options={Object.entries(AI_RESOURCE_PROFILES).map(([key, val]) => ({ value: key, label: val.name }))}
                tooltip={powerStanceTooltip}
                disabled={isLocked}
            />
             <DetailSelect 
                label="AI GPU Mode" 
                name="aiGpuMode" 
                value={config.aiGpuMode} 
                onChange={handleChange}
                options={[{value: 'none', label: 'None'}, {value: 'dedicated', label: 'Dedicated'}, {value: 'dynamic', label: 'Dynamic (Shared)'}]}
                tooltip="Determines how the AI Core utilizes the GPU. 'Dynamic' is auto-selected for Shapeshifter Form on Hybrid systems."
                disabled={isLocked || (config.aiResourceAllocation === 'dynamic' && config.graphicsMode === 'hybrid')}
            />

            <SectionHeader title="Software Grimoire" />
            <DetailInput label="Desktop" name="desktopEnvironment" value={config.desktopEnvironment} onChange={handleChange} disabled={isLocked} />
            <DetailInput label="Packages" name="packages" value={config.packages} onChange={handleChange} tooltip="A comma-separated list of essential packages." disabled={isLocked} />
            <DetailInput label="AUR Helper(s)" name="aurHelpers" value={renderArrayAsString(config.aurHelpers)} onChange={(e) => handleArrayChange('aurHelpers', e.target.value)} disabled={isLocked} />
            <DetailInput label="Extra Repos" name="extraRepositories" value={renderArrayAsString(config.extraRepositories)} onChange={(e) => handleArrayChange('extraRepositories', e.target.value)} disabled={isLocked} />
        </div>
    );
};