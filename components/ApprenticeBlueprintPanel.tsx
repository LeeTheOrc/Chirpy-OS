import React, { useState } from 'react';
import type { DistroConfig } from '../types';
import { APPRENTICE_PRESETS } from '../constants';
import { DiscIcon } from './Icons';

interface ApprenticeBlueprintPanelProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  onBuild: () => void;
}

type PresetKey = keyof typeof APPRENTICE_PRESETS;

export const ApprenticeBlueprintPanel: React.FC<ApprenticeBlueprintPanelProps> = ({ config, onConfigChange, onBuild }) => {
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('general');

    const handlePresetChange = (presetKey: PresetKey) => {
        setSelectedPreset(presetKey);
        const preset = APPRENTICE_PRESETS[presetKey];
        onConfigChange({
            ...config,
            packages: preset.packages,
            gpuDriver: preset.gpuDriver,
            // also apply repos if they exist, otherwise default back
            // FIX: Use 'in' operator to safely access optional property on a union type.
            extraRepositories: 'extraRepositories' in preset ? preset.extraRepositories : ['kael-os', 'cachy', 'chaotic'],
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onConfigChange({ ...config, [name]: value });
    };

    return (
        <div className="bg-gradient-to-br from-forge-panel to-[#1a1626] border-2 border-forge-border rounded-lg ring-1 ring-forge-border/50 animate-fade-in divide-y divide-forge-border shadow-2xl shadow-black/30 p-6 space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-dragon-fire font-display tracking-wider">The Apprentice's Path</h3>
                <p className="text-forge-text-secondary text-sm">Welcome! Answer a few questions to forge your custom Realm.</p>
            </div>
            
            <div className="pt-6">
                <label className="block text-lg font-bold text-orc-steel mb-3 font-display tracking-wide">1. What is your quest?</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(Object.keys(APPRENTICE_PRESETS) as PresetKey[]).map(key => {
                        const preset = APPRENTICE_PRESETS[key];
                        const isSelected = selectedPreset === key;
                        return (
                            <button
                                key={key}
                                onClick={() => handlePresetChange(key)}
                                className={`p-4 rounded-lg border-2 text-left transition-all duration-200
                                  ${isSelected 
                                    ? 'bg-dragon-fire/10 border-dragon-fire shadow-lg shadow-dragon-fire/10' 
                                    : 'bg-forge-panel/50 border-forge-border hover:border-forge-text-secondary/50'
                                  }`}
                            >
                                <h5 className={`font-semibold ${isSelected ? 'text-forge-text-primary' : 'text-forge-text-secondary'}`}>{preset.name}</h5>
                                <p className="text-xs text-forge-text-secondary">{preset.description}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="pt-6">
                <h4 className="block text-lg font-bold text-orc-steel mb-4 font-display tracking-wide">2. Name your creation</h4>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="hostname" className="text-forge-text-secondary text-sm mb-1 block">Realm Name (hostname)</label>
                        <input type="text" id="hostname" name="hostname" value={config.hostname || ''} onChange={handleInputChange} className="w-full bg-forge-panel/60 text-forge-text-primary font-medium text-sm border border-forge-border focus:ring-1 focus:ring-dragon-fire focus:border-dragon-fire rounded-md p-2 transition-all" />
                    </div>
                     <div>
                        <label htmlFor="username" className="text-forge-text-secondary text-sm mb-1 block">Your Name (username)</label>
                        <input type="text" id="username" name="username" value={config.username || ''} onChange={handleInputChange} className="w-full bg-forge-panel/60 text-forge-text-primary font-medium text-sm border border-forge-border focus:ring-1 focus:ring-dragon-fire focus:border-dragon-fire rounded-md p-2 transition-all" />
                    </div>
                </div>
            </div>
            
            <div className="pt-6 text-center">
                 <button
                    onClick={onBuild}
                    className="w-full md:w-auto text-center py-3 px-8 bg-dragon-fire/90 border-2 border-dragon-fire text-black rounded-lg text-lg font-bold hover:bg-dragon-fire disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-dragon-fire/40 animate-pulse-glow"
                >
                    <div className="flex items-center justify-center gap-3">
                        <DiscIcon className="w-6 h-6" />
                        <span>Forge Installation ISO</span>
                    </div>
                </button>
                <p className="text-xs text-forge-text-secondary mt-3">This will begin the process of creating a bootable installer.</p>
            </div>
        </div>
    );
};