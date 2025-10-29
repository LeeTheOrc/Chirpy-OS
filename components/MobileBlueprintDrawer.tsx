import React from 'react';
import type { DistroConfig } from '../types';
import { DistroBlueprintForm } from './DistroBlueprintForm';
import { CloseIcon, LockClosedIcon, LockOpenIcon } from './Icons';

interface MobileBlueprintDrawerProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onLockToggle: () => void;
  onClose: () => void;
}

export const MobileBlueprintDrawer: React.FC<MobileBlueprintDrawerProps> = ({ config, onConfigChange, isLocked, onLockToggle, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-40 md:hidden animate-fade-in-fast" onClick={onClose}>
      <div
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-slate-950 shadow-2xl flex flex-col animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-800 flex-shrink-0 flex items-center justify-between">
          <h3 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
            The Blueprint
          </h3>
          <div className="flex items-center gap-2">
            <button onClick={onLockToggle} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white" aria-label={isLocked ? 'Unlock Blueprint' : 'Lock Blueprint'}>
                {isLocked ? <LockClosedIcon className="w-5 h-5" /> : <LockOpenIcon className="w-5 h-5" />}
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
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