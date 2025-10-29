import React, { useState, useEffect, useRef } from 'react';
import type { DistroConfig } from '../types';
import { DistroBlueprintForm } from './DistroBlueprintForm';
import { CloseIcon, LockClosedIcon, LockOpenIcon, GearIcon } from './Icons';

interface MobileBlueprintDrawerProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onLockToggle: () => void;
  onClose: () => void;
  onBuild: () => void;
}

export const MobileBlueprintDrawer: React.FC<MobileBlueprintDrawerProps> = ({ config, onConfigChange, isLocked, onLockToggle, onClose, onBuild }) => {
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
      onClose(); 
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in-fast" onClick={onClose}>
      <div
        className="fixed top-0 left-0 h-full w-full max-w-sm bg-slate-950 shadow-2xl flex flex-col animate-slide-in-left"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex-shrink-0 flex items-center justify-between">
          <h3 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
            The Blueprint
          </h3>
          <div className="flex items-center gap-1">
            <button onClick={onLockToggle} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white" aria-label={isLocked ? 'Unlock Blueprint' : 'Lock Blueprint'}>
                {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
            </button>
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setIsActionsMenuOpen(prev => !prev)}
                    className="p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isLocked}
                    aria-label="Forge Actions"
                >
                    <GearIcon className="w-5 h-5" />
                </button>
                {isActionsMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20 animate-fade-in-fast">
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
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto">
          <DistroBlueprintForm
            config={config}
            onConfigChange={onConfigChange}
            isLocked={isLocked}
          />
        </div>
      </div>
    </div>
  );
};