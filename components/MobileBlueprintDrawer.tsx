import React, { useState, useEffect, useRef } from 'react';
import type { DistroConfig } from '../types';
import { DistroBlueprintForm } from './DistroBlueprintForm';
import { CloseIcon, LockClosedIcon, LockOpenIcon, GearIcon, KeyIcon, DiscIcon } from './Icons';

interface MobileBlueprintDrawerProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onLockToggle: () => void;
  onClose: () => void;
  onBuild: () => void;
  onForgeKeystone: () => void;
  onInitiateAICoreAttunement: () => void;
  isAICoreScriptGenerated: boolean;
}

export const MobileBlueprintDrawer: React.FC<MobileBlueprintDrawerProps> = ({ config, onConfigChange, isLocked, onLockToggle, onClose, onBuild, onForgeKeystone, onInitiateAICoreAttunement, isAICoreScriptGenerated }) => {
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

  const handleActionClick = (action: () => void) => {
      action();
      setIsActionsMenuOpen(false);
      onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in-fast" onClick={onClose}>
      <div
        className="fixed top-0 left-0 h-full w-full max-w-sm bg-forge-bg shadow-2xl flex flex-col animate-slide-in-left"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-forge-border flex-shrink-0 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-dragon-fire flex items-center gap-2">
              The Blueprint
            </h3>
            <div className={`mt-1 text-xs font-semibold inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${isAICoreScriptGenerated ? 'bg-dragon-fire/10 text-dragon-fire' : 'bg-forge-panel text-forge-text-secondary'}`}>
                <div className={`w-2 h-2 rounded-full ${isAICoreScriptGenerated ? 'bg-dragon-fire' : 'bg-forge-text-secondary/50'}`}></div>
                Attunement Script: {isAICoreScriptGenerated ? 'Generated' : 'Not Generated'}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onLockToggle} className="p-2 rounded-full hover:bg-forge-panel/50 transition-colors text-forge-text-secondary hover:text-forge-text-primary" aria-label={isLocked ? 'Unlock Blueprint' : 'Lock Blueprint'}>
                {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
            </button>
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsActionsMenuOpen(prev => !prev)}
                    className="p-2 rounded-full hover:bg-forge-panel/50 transition-colors text-forge-text-secondary hover:text-forge-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isLocked}
                    aria-label="Forge Actions"
                >
                    <GearIcon className="w-5 h-5" />
                </button>
                {isActionsMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-forge-panel border border-forge-border rounded-md shadow-lg z-20 animate-fade-in-fast">
                         <ul className="py-1 text-sm text-forge-text-primary">
                            <li className="px-4 py-2 text-xs font-bold text-forge-text-secondary uppercase">Build Artifacts</li>
                            <li>
                                <button 
                                    onClick={() => handleActionClick(onBuild)}
                                    className="w-full text-left px-4 py-2 hover:bg-magic-purple/50 flex items-center gap-3"
                                >
                                    <DiscIcon className="w-4 h-4" />
                                    <span>Build Installation ISO</span>
                                </button>
                            </li>
                             <li className="px-4 pt-2 pb-1 text-xs font-bold text-forge-text-secondary uppercase">Athenaeum</li>
                            <li>
                                <button 
                                    onClick={() => handleActionClick(onForgeKeystone)}
                                    className="w-full text-left px-4 py-2 hover:bg-magic-purple/50 flex items-center gap-3"
                                >
                                    <KeyIcon className="w-4 h-4" />
                                    <span>Forge Athenaeum Keystone</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary p-2">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto">
          <DistroBlueprintForm
            config={config}
            onConfigChange={onConfigChange}
            isLocked={isLocked}
            onInitiateAICoreAttunement={onInitiateAICoreAttunement}
          />
        </div>
      </div>
    </div>
  );
};