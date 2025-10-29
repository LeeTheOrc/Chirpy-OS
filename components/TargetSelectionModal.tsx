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
        icon: <ServerIcon className="w-10 h-10 text-yellow-400" /> 
    },
    { 
        id: 'qemu', 
        name: 'QEMU/KVM VM', 
        description: 'Optimized for QEMU/KVM with guest agent.', 
        icon: <DesktopComputerIcon className="w-10 h-10 text-purple-400" /> 
    },
    { 
        id: 'virtualbox', 
        name: 'VirtualBox VM', 
        description: 'Optimized for VirtualBox with guest additions.', 
        icon: <DesktopComputerIcon className="w-10 h-10 text-cyan-400" /> 
    },
];

export const TargetSelectionModal: React.FC<TargetSelectionModalProps> = ({ onClose, onSelectTarget }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-lg p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Choose Your Forge</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4">
                    {targets.map(target => (
                        <button 
                            key={target.id}
                            onClick={() => onSelectTarget(target.id as BuildTarget)}
                            className="w-full text-left p-4 bg-slate-800/60 border border-slate-700 rounded-lg hover:bg-slate-700/80 hover:border-yellow-400 transition-all flex items-center gap-4 group"
                        >
                            <div className="flex-shrink-0">
                                {target.icon}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-100 group-hover:text-yellow-300">{target.name}</h3>
                                <p className="text-slate-400 text-sm">{target.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};