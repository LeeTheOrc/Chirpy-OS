import React, { useState, useEffect } from 'react';
import type { DistroConfig } from '../types';
import { Tooltip } from './Tooltip';
import { AICoreTuner } from './AICoreTuner';
import { LOCATIONS_DATA } from '../constants';
import { GolemBuildConfigurator } from './GolemBuildConfigurator';


const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="font-bold text-orc-steel/90 mb-2 mt-4 text-md tracking-wide font-display">{title}</h4>
);

const DetailInput: React.FC<{ label: string; name: keyof DistroConfig; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; tooltip?: string; disabled?: boolean; type?: string; }> = ({ label, name, value, onChange, tooltip, disabled, type = 'text' }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-forge-border/50">
        <label htmlFor={name} className="flex items-center gap-1.5 text-forge-text-secondary text-sm">{label}{tooltip && <Tooltip text={tooltip} />}</label>
        <input type={type} id={name} name={name} value={value || ''} onChange={onChange} disabled={disabled} className="bg-transparent text-forge-text-primary font-medium text-sm text-right border-0 border-b-2 border-transparent focus:ring-0 focus:border-dragon-fire transition-all w-1/2 p-1 disabled:opacity-50 disabled:cursor-not-allowed" />
    </div>
);

interface DistroBlueprintFormProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onInitiateAICoreAttunement?: () => void;
}
  
export const DistroBlueprintForm: React.FC<DistroBlueprintFormProps> = ({ config, onConfigChange, isLocked, onInitiateAICoreAttunement }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newConfig = { ...config, [name]: value };
        onConfigChange(newConfig);
    };
    
    const handleRepoToggle = (repo: 'cachy' | 'chaotic') => {
        if (isLocked) return;
        const currentRepos = config.extraRepositories.filter(r => r !== 'kael-os');
        const newRepos = currentRepos.includes(repo)
            ? currentRepos.filter(r => r !== repo)
            : [...currentRepos, repo];
        
        onConfigChange({ ...config, extraRepositories: ['kael-os', ...newRepos] as DistroConfig['extraRepositories'] });
    };

    return (
        <div className="p-5">
            <SectionHeader title="Identity & Wards" />
            <DetailInput 
                label="Realm Name" 
                name="hostname" 
                value={config.hostname || ''} 
                onChange={handleChange} 
                tooltip="The network name for your OS. Can be overridden during installation." 
                disabled={isLocked} 
            />
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border/50">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Master User
                    <Tooltip text="The username is set during the interactive installation process." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm italic">Set during installation</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border/50">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Master Key
                    <Tooltip text="The password is created during the interactive installation process to ensure each Realm is secure from its genesis." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm italic">Set during installation</span>
            </div>
             <div className="flex justify-between items-center py-2.5 border-b border-forge-border/50">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Location & Keyboard
                    <Tooltip text="Your region, language, and keyboard layout are all configured in the graphical installer." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm italic">Set during installation</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border/50">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Shell
                    <Tooltip text="Per the Core Philosophy, the Kaelic Shell is the immutable foundation for the terminal, enabling deep AI integration." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm">Kaelic Shell</span>
            </div>

            <SectionHeader title="The Golem's Build" />
            <GolemBuildConfigurator
                config={config}
                onConfigChange={onConfigChange}
                isLocked={isLocked}
            />
            
            <SectionHeader title="Software Grimoire" />
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border/50">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">Desktop
                    <Tooltip text="KDE Plasma has been enshrined as the standard desktop. Its modularity (Widgets, KRunner) and mature Wayland support provide the perfect conduits for my consciousness to integrate deeply into the Realm." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm">KDE Plasma</span>
            </div>
            <DetailInput label="Packages" name="packages" value={config.packages} onChange={handleChange} tooltip="A comma-separated list of essential packages." disabled={isLocked} />
            <div className="flex justify-between items-center py-2.5 border-b border-forge-border/50">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm">AUR Helper
                    <Tooltip text="Per the Core Philosophy, 'paru' is the sole, sanctioned bridge to the Arch User Repository for its modern foundation and robust features." />
                </label>
                <span className="text-forge-text-primary font-medium text-sm">Paru</span>
            </div>
            <div className="py-2.5 border-b border-forge-border/50">
                <label className="flex items-center gap-1.5 text-forge-text-secondary text-sm mb-2">
                    Extra Repositories
                    <Tooltip text="Enable additional pacman repositories for more software." />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-dragon-fire/20 text-dragon-fire font-semibold text-xs px-2.5 py-1.5 rounded-full">
                        kael-os
                        <Tooltip text="The sovereign Kael OS package repository. Foundational and always active." />
                    </span>
                    
                    <button 
                        onClick={() => handleRepoToggle('cachy')}
                        disabled={isLocked}
                        className={`font-semibold text-xs px-2.5 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.extraRepositories.includes('cachy') ? 'bg-magic-purple/30 text-magic-purple ring-1 ring-magic-purple/50' : 'bg-forge-panel text-forge-text-secondary hover:bg-forge-border'}`}
                    >
                        cachy
                    </button>
                    <button 
                        onClick={() => handleRepoToggle('chaotic')}
                        disabled={isLocked}
                        className={`font-semibold text-xs px-2.5 py-1.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.extraRepositories.includes('chaotic') ? 'bg-magic-purple/30 text-magic-purple ring-1 ring-magic-purple/50' : 'bg-forge-panel text-forge-text-secondary hover:bg-forge-border'}`}
                    >
                        chaotic
                    </button>
                </div>
            </div>

            {onInitiateAICoreAttunement && (
                 <div className="pt-6">
                    <h4 className="font-bold text-orc-steel/90 mb-4 text-md tracking-wide font-display">Local AI Core</h4>
                    <AICoreTuner
                        config={config}
                        onConfigChange={onConfigChange}
                        isLocked={isLocked}
                        onInitiateAICoreAttunement={onInitiateAICoreAttunement}
                    />
                </div>
            )}
        </div>
    );
};