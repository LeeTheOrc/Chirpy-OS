import React from 'react';
import type { DistroConfig } from '../types';
import { LockClosedIcon, LockOpenIcon } from './Icons';
import { DistroBlueprintForm } from './DistroBlueprintForm';

interface DistroBlueprintPanelProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onLockToggle: () => void;
}

export const DistroBlueprintPanel: React.FC<DistroBlueprintPanelProps> = ({ config, onConfigChange, isLocked, onLockToggle }) => {
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
            <DistroBlueprintForm 
                config={config} 
                onConfigChange={onConfigChange} 
                isLocked={isLocked}
            />
        </div>
    );
};