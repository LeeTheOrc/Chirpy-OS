

import React, { useState, useEffect, useRef } from 'react';
import type { DistroConfig } from '../types';
import { LockClosedIcon, LockOpenIcon, GearIcon } from './Icons';
import { DistroBlueprintForm } from './DistroBlueprintForm';

interface DistroBlueprintPanelProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onLockToggle: () => void;
  onBuild: () => void;
  onInitiateAICoreAttunement: () => void;
  isAICoreInstalled: boolean;
}

export const DistroBlueprintPanel: React.FC<DistroBlueprintPanelProps> = ({ config, onConfigChange, isLocked, onLockToggle, onBuild, onInitiateAICoreAttunement, isAICoreInstalled }) => {
    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsActionsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleBuildClick = () => {
        onBuild();
        setIsActionsMenuOpen(false);
    };

    return (
        <div className="bg-forge-panel/70 border border-forge-border rounded-lg animate-fade-in divide-y divide-forge-border shadow-2xl shadow-black/30">
            <div className="p-5 flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-dragon-fire">The Architect's Blueprint</h3>
                    <p className="text-forge-text-secondary text-sm">A living document of our realm's configuration.</p>
                    <div className={`mt-2 text-xs font-semibold inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${isAICoreInstalled ? 'bg-dragon-fire/10 text-dragon-fire' : 'bg-forge-panel text-forge-text-secondary'}`}>
                        <div className={`w-2 h-2 rounded-full ${isAICoreInstalled ? 'bg-dragon-fire' : 'bg-forge-text-secondary/50'}`}></div>
                        AI Core: {isAICoreInstalled ? 'Attuned' : 'Not Attuned'}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onLockToggle} className="p-2 rounded-full hover:bg-forge-border/50 transition-colors text-forge-text-secondary hover:text-forge-text-primary" aria-label={isLocked ? 'Unlock Blueprint' : 'Lock Blueprint'}>
                        {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsActionsMenuOpen(prev => !prev)} 
                            className="p-2 rounded-full hover:bg-forge-border/50 transition-colors text-forge-text-secondary hover:text-forge-text-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                            aria-label="Forge Actions"
                            disabled={!isLocked}
                            title={!isLocked ? "Lock the blueprint to access forge actions" : "Forge Actions"}
                        >
                            <GearIcon className="w-5 h-5" />
                        </button>
                        {isActionsMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-forge-panel border border-forge-border rounded-md shadow-lg z-10 animate-fade-in-fast">
                                <ul className="py-1">
                                    <li>
                                        <button 
                                            onClick={handleBuildClick}
                                            className="w-full text-left px-4 py-2 text-sm text-forge-text-primary hover:bg-magic-purple/50"
                                        >
                                            Build Installation Script
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <DistroBlueprintForm 
                config={config} 
                onConfigChange={onConfigChange} 
                isLocked={isLocked}
                onInitiateAICoreAttunement={onInitiateAICoreAttunement}
            />
        </div>
    );
};