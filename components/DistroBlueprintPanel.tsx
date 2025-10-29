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
}

export const DistroBlueprintPanel: React.FC<DistroBlueprintPanelProps> = ({ config, onConfigChange, isLocked, onLockToggle, onBuild }) => {
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
        <div className="bg-slate-900/70 border border-slate-800 rounded-lg animate-fade-in divide-y divide-slate-800 shadow-2xl shadow-black/30">
            <div className="p-5 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-yellow-300">The Architect's Blueprint</h3>
                    <p className="text-slate-400 text-sm">A living document of our realm's configuration.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onLockToggle} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white" aria-label={isLocked ? 'Unlock Blueprint' : 'Lock Blueprint'}>
                        {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button 
                            onClick={() => setIsActionsMenuOpen(prev => !prev)} 
                            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                            aria-label="Forge Actions"
                            disabled={!isLocked}
                            title={!isLocked ? "Lock the blueprint to access forge actions" : "Forge Actions"}
                        >
                            <GearIcon className="w-5 h-5" />
                        </button>
                        {isActionsMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-10 animate-fade-in-fast">
                                <ul className="py-1">
                                    <li>
                                        <button 
                                            onClick={handleBuildClick}
                                            className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-purple-600/50"
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
            />
        </div>
    );
};