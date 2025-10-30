import React from 'react';
import type { DistroConfig } from '../types';
import { AI_RESOURCE_PROFILES } from '../constants';
import { FeatherIcon, ScaleIcon, FlameIcon, SparklesIcon, GpuIcon } from './Icons';

const ICONS = {
  minimal: <FeatherIcon className="w-6 h-6" />,
  balanced: <ScaleIcon className="w-6 h-6" />,
  performance: <FlameIcon className="w-6 h-6" />,
  dynamic: <SparklesIcon className="w-6 h-6" />,
};

type AllocationLevel = keyof typeof AI_RESOURCE_PROFILES;

interface AICoreTunerProps {
  config: DistroConfig;
  onConfigChange: (newConfig: DistroConfig) => void;
  isLocked: boolean;
  onInitiateAICoreAttunement: () => void;
}

export const AICoreTuner: React.FC<AICoreTunerProps> = ({ config, onConfigChange, isLocked, onInitiateAICoreAttunement }) => {
  const handleSelection = (level: AllocationLevel) => {
    if (isLocked) return;
    const newConfig = { ...config, aiResourceAllocation: level };

    // This is the "hybrid AI" logic. When Shapeshifter is selected on a hybrid system,
    // automatically enable dynamic GPU sharing.
    if (level === 'dynamic' && config.graphicsMode === 'hybrid') {
      newConfig.aiGpuMode = 'dynamic';
    } else {
      // For other modes, provide a sensible default.
      if (level === 'performance') {
        newConfig.aiGpuMode = 'dedicated';
      } else {
        newConfig.aiGpuMode = 'none';
      }
    }
    onConfigChange(newConfig);
  };

  const isHybridCoProcessing = config.graphicsMode === 'hybrid' && config.aiGpuMode === 'dynamic';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(AI_RESOURCE_PROFILES) as AllocationLevel[]).map((level) => {
          const profile = AI_RESOURCE_PROFILES[level];
          const isSelected = config.aiResourceAllocation === level;
          return (
            <button
              key={level}
              onClick={() => handleSelection(level)}
              disabled={isLocked}
              className={`p-3 rounded-lg border-2 text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col justify-between items-start h-28
                ${isSelected 
                  ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-900/50' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                }`}
            >
              <div className={`p-1.5 rounded-md ${isSelected ? 'text-yellow-300' : 'text-slate-400'}`}>
                {ICONS[level]}
              </div>
              <div className="min-w-0">
                <h5 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{profile.name}</h5>
                <p className="text-xs text-slate-400">{profile.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className={`p-3 rounded-lg border flex items-center gap-3 transition-all duration-300
        ${isHybridCoProcessing 
          ? 'bg-green-500/10 border-green-400/50' 
          : 'bg-slate-800/30 border-slate-800'
        }`}>
        <GpuIcon className={`w-6 h-6 flex-shrink-0 ${isHybridCoProcessing ? 'text-green-400' : 'text-slate-500'}`} />
        <div>
          <h6 className="font-semibold text-sm text-slate-200">
            {isHybridCoProcessing ? 'Hybrid Co-Processing Active' : 'GPU Utilization'}
          </h6>
          <p className="text-xs text-slate-400">
            {isHybridCoProcessing 
              ? 'AI Core will dynamically share the iGPU with the system.' 
              : `Current mode is '${config.aiGpuMode}'. Select 'Shapeshifter' on hybrid systems to enable co-processing.`
            }
          </p>
        </div>
      </div>

       <div className="pt-2">
            <button
                onClick={onInitiateAICoreAttunement}
                disabled={!isLocked}
                title={!isLocked ? "Lock the blueprint before generating a script" : "Generate a script to install just the AI Core"}
                className="w-full text-center py-2 px-4 bg-slate-700/60 border border-slate-600 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-700 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Generate AI Core Script
            </button>
        </div>
    </div>
  );
};