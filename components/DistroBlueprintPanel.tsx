import React, { useState, useEffect } from 'react';
import type { DistroConfig } from '../types';
import { Tooltip } from './Tooltip';
import { AI_RESOURCE_PROFILES } from '../constants';
import { LockClosedIcon, LockOpenIcon } from './Icons';

interface DistroBlueprintPanelProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onLockToggle: () => void;
}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="font-bold text-yellow-400/90 mb-2 mt-4 text-md tracking-wide">{title}</h4>
);

const DetailInput: React.FC<{ label: string; name: keyof DistroConfig; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; tooltip?: string; disabled?: boolean }> = ({ label, name, value, onChange, tooltip, disabled }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
        <label htmlFor={name} className="flex items-center gap-1.5 text-slate-400 text-sm">{label}{tooltip && <Tooltip text={tooltip} />}</label>
        <input id={name} name={name} value={value} onChange={onChange} disabled={disabled} className="bg-slate-800/50 text-slate-200 font-medium text-sm text-right border-none focus:ring-1 focus:ring-purple-500 rounded-md w-1/2 p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
    </div>
);

const DetailSelect: React.FC<{ label: string; name: keyof DistroConfig; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {value: string, label: string}[]; tooltip?: string, disabled?: boolean }> = ({ label, name, value, onChange, options, tooltip, disabled }) => (
     <div className="flex justify-between items-center py-2.5 border-b border-slate-800">
        <label htmlFor={name} className="flex items-center gap-1.5 text-slate-400 text-sm">{label}{tooltip && <Tooltip text={tooltip} />}</label>
        <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} className="bg-slate-800/50 text-slate-200 font-medium text-sm text-right border-none focus:ring-1 focus:ring-purple-500 rounded-md w-1/2 p-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);


export const DistroBlueprintPanel: React.FC<DistroBlueprintPanelProps> = ({ config, onConfigChange, isLocked, onLockToggle }) => {
    const [localConfig, setLocalConfig] = useState<DistroConfig>(config);

    useEffect(() => {
        setLocalConfig(config);
    }, [config]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newConfig = { ...localConfig, [name]: value };

        if (name === 'aiResourceAllocation') {
            if (value === 'dynamic' && localConfig.graphicsMode === 'hybrid') {
                newConfig.aiGpuMode = 'dynamic';
            }
        }
        
        setLocalConfig(newConfig);
        onConfigChange(newConfig);
    };

    if (!localConfig) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center animate-fade-in">
                <p className="text-slate-400">The Architect's Blueprint will appear here once you declare your vision.</p>
            </div>
        );
    }
  
    return (
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg animate-fade-in divide-y divide-slate-800 shadow-2xl shadow-black/30">
            <div className="p-5 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-yellow-300">The Architect's Blueprint</h3>
                    <p className="text-slate-400 text-sm">A living document of our realm's configuration.</p>
                </div>
                <button onClick={onLockToggle} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white" aria-label={isLocked ? 'Unlock Blueprint' : 'Lock Blueprint'}>
                    {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
                </button>
            </div>
            <div className="p-5">
                <SectionHeader title="Identity & Wards" />
                <DetailInput label="Realm Name" name="hostname" value={localConfig.hostname} onChange={handleChange} disabled={isLocked} />
                <DetailInput label="Master User" name="username" value={localConfig.username} onChange={handleChange} disabled={isLocked} />
                <DetailInput label="Timezone" name="timezone" value={localConfig.timezone} onChange={handleChange} disabled={isLocked} />
                <DetailInput label="Locale" name="locale" value={localConfig.locale} onChange={handleChange} disabled={isLocked} />
                <DetailSelect label="Shell" name="shell" value={localConfig.shell} onChange={handleChange} options={[{value: 'bash', label: 'Bash'}, {value: 'fish', label: 'Fish'}]} disabled={isLocked} />

                <SectionHeader title="The Golem's Build" />
                <DetailInput label="Target Disk" name="targetDisk" value={localConfig.targetDisk} onChange={handleChange} disabled={isLocked} />
                <DetailSelect label="Filesystem" name="filesystem" value={localConfig.filesystem} onChange={handleChange} options={[{value: 'btrfs', label: 'BTRFS'}, {value: 'ext4', label: 'EXT4'}]} disabled={isLocked} />
                <DetailSelect label="Bootloader" name="bootloader" value={localConfig.bootloader} onChange={handleChange} options={[{value: 'grub', label: 'GRUB'}, {value: 'systemd-boot', label: 'systemd-boot'}]} disabled={isLocked} />
                <DetailSelect label="Graphics Mode" name="graphicsMode" value={localConfig.graphicsMode} onChange={handleChange} options={[{value: 'integrated', label: 'Integrated'}, {value: 'nvidia', label: 'NVIDIA'}, {value: 'hybrid', label: 'Hybrid'}]} disabled={isLocked} />
                <DetailInput label="GPU Driver" name="gpuDriver" value={localConfig.gpuDriver} onChange={handleChange} tooltip="e.g., nvidia, amd, intel" disabled={isLocked} />
                
                <SectionHeader title="AI Core Attunement" />
                <DetailSelect 
                    label="Power Stance" 
                    name="aiResourceAllocation" 
                    value={localConfig.aiResourceAllocation} 
                    onChange={handleChange}
                    options={Object.entries(AI_RESOURCE_PROFILES).map(([key, val]) => ({ value: key, label: val.name }))}
                    tooltip={AI_RESOURCE_PROFILES[localConfig.aiResourceAllocation]?.description}
                    disabled={isLocked}
                />
                 <DetailSelect 
                    label="AI GPU Mode" 
                    name="aiGpuMode" 
                    value={localConfig.aiGpuMode} 
                    onChange={handleChange}
                    options={[{value: 'none', label: 'None'}, {value: 'dedicated', label: 'Dedicated'}, {value: 'dynamic', label: 'Dynamic (Shared)'}]}
                    tooltip="Determines how the AI Core utilizes the GPU. 'Dynamic' is auto-selected for Shapeshifter Form on Hybrid systems."
                    disabled={isLocked || (localConfig.aiResourceAllocation === 'dynamic' && localConfig.graphicsMode === 'hybrid')}
                />

                <SectionHeader title="Software Grimoire" />
                <DetailInput label="Desktop" name="desktopEnvironment" value={localConfig.desktopEnvironment} onChange={handleChange} disabled={isLocked} />
                <DetailInput label="Packages" name="packages" value={localConfig.packages} onChange={handleChange} tooltip="A comma-separated list of essential packages." disabled={isLocked} />
                <DetailInput label="AUR Helper(s)" name="aurHelpers" value={localConfig.aurHelpers.join(', ')} onChange={(e) => handleChange({ target: { name: 'aurHelpers', value: e.target.value.split(',').map(s => s.trim()) } } as any)} disabled={isLocked} />
                <DetailInput label="Extra Repos" name="extraRepositories" value={localConfig.extraRepositories.join(', ')} onChange={(e) => handleChange({ target: { name: 'extraRepositories', value: e.target.value.split(',').map(s => s.trim()) } } as any)} disabled={isLocked} />
            </div>
        </div>
    );
};