import React from 'react';
import type { BuildTarget } from '../types';
import { CloseIcon, ServerIcon, DesktopComputerIcon } from './Icons';

interface TargetSelectionModalProps {
  onClose: () => void;
  onSelectTarget: (target: BuildTarget) => void;
}

const targets = [
    { 
        id: 'bare-metal', 
        name: 'Bare Metal', 
        description: 'For physical hardware installation.', 
        icon: <ServerIcon className="w-10 h-10 text-dragon-fire" /> 
    },
    { 
        id: 'qemu', 
        name: 'QEMU/KVM VM', 
        description: 'Optimized for QEMU/KVM with guest agent.', 
        icon: <DesktopComputerIcon className="w-10 h-10 text-magic-purple" /> 
    },
    { 
        id: 'virtualbox', 
        name: 'VirtualBox VM', 
        description: 'Optimized for VirtualBox with guest additions.', 
        icon: <DesktopComputerIcon className="w-10 h-10 text-purple-500" /> 
    },
];

export const TargetSelectionModal: React.FC<TargetSelectionModalProps> = ({ onClose, onSelectTarget }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border border-forge-border rounded-lg shadow-2xl w-full max-w-lg p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-forge-text-primary">Choose Your Forge</h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    {targets.map(target => (
                        <button 
                            key={target.id}
                            onClick={() => onSelectTarget(target.id as BuildTarget)}
                            className="w-full text-left p-4 bg-forge-panel/60 border border-forge-border rounded-lg hover:bg-forge-panel/80 hover:border-dragon-fire transition-all flex items-center gap-4 group"
                        >
                            <div className="flex-shrink-0">
                                {target.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-forge-text-primary group-hover:text-dragon-fire">{target.name}</h3>
                                <p className="text-forge-text-secondary text-sm">{target.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};