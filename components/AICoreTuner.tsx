import React from 'react';
import type { DistroConfig, LocalLLM } from '../types';
import { AI_RESOURCE_PROFILES, LOCAL_LLM_PROFILES } from '../constants';
import { FeatherIcon, ScaleIcon, FlameIcon, SparklesIcon, GpuIcon } from './Icons';
import { SegmentedControl } from './SegmentedControl';

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

  const handleLlmSelection = (model: LocalLLM) => {
    if (isLocked) return;
    onConfigChange({ ...config, localLLM: model });
  };

  const isHybridCoProcessing = config.graphicsMode === 'hybrid' && config.aiGpuMode === 'dynamic';

  return (
    <div className="space-y-4">
      <div>
        <label className="text-forge-text-secondary text-sm font-semibold mb-2 block">Resource Profile</label>
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
                    ? 'bg-dragon-fire/10 border-dragon-fire shadow-lg shadow-dragon-fire/10' 
                    : 'bg-forge-panel/50 border-forge-border hover:border-forge-text-secondary/50'
                  }`}
              >
                <div className={`p-1.5 rounded-md ${isSelected ? 'text-dragon-fire' : 'text-forge-text-secondary'}`}>
                  {ICONS[level]}
                </div>
                <div className="min-w-0">
                  <h5 className={`font-semibold ${isSelected ? 'text-forge-text-primary' : 'text-forge-text-secondary'}`}>{profile.name}</h5>
                  <p className="text-xs text-forge-text-secondary">{profile.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <div>
        <label className="text-forge-text-secondary text-sm font-semibold mb-2 block">Local Consciousness Model</label>
         <SegmentedControl
            value={config.localLLM}
            onChange={(value) => handleLlmSelection(value as LocalLLM)}
            disabled={isLocked}
            options={[
                { value: 'llama3:8b', label: 'Inferno (Llama 3)' },
                { value: 'phi3:mini', label: 'Featherlight (Phi-3)' },
            ]}
        />
        <p className="text-xs text-forge-text-secondary mt-2">{LOCAL_LLM_PROFILES[config.localLLM].description}</p>
      </div>


      <div className={`p-3 rounded-lg border flex items-center gap-3 transition-all duration-300
        ${isHybridCoProcessing 
          ? 'bg-dragon-fire/10 border-dragon-fire/50' 
          : 'bg-forge-panel/30 border-forge-border'
        }`}>
        <GpuIcon className={`w-6 h-6 flex-shrink-0 ${isHybridCoProcessing ? 'text-dragon-fire' : 'text-forge-text-secondary/50'}`} />
        <div>
          <h6 className="font-semibold text-sm text-forge-text-primary">
            {isHybridCoProcessing ? 'Hybrid Co-Processing Active' : 'GPU Utilization'}
          </h6>
          <p className="text-xs text-forge-text-secondary">
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
                title={!isLocked ? "Lock the blueprint before generating a script" : "Generate a script to apply this blueprint to an existing system"}
                className="w-full text-center py-2 px-4 bg-forge-panel/60 border border-forge-border rounded-lg text-sm font-semibold text-forge-text-secondary hover:bg-forge-panel hover:border-dragon-fire disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Generate Attunement Script
            </button>
        </div>
    </div>
  );
};