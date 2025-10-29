import React, { useState, useEffect, useMemo } from 'react';
import { DistroConfig } from '../types';
import { CloseIcon, DiscIcon } from './Icons';

interface BuildModalProps {
  config: DistroConfig;
  onClose: () => void;
}

interface BuildStep {
    name: string;
    duration: number; // in ms
}

// Turn the static array into a dynamic function
const generateBuildSteps = (config: DistroConfig): BuildStep[] => {
    const steps: BuildStep[] = [
        { name: 'Initializing forge environment...', duration: 1500 },
        { name: 'Downloading base system packages...', duration: 4000 },
        { name: `Installing kernel (${config.kernels[0]})...`, duration: 3000 },
        { name: 'Setting up bootloader (GRUB)...', duration: 2500 },
        { name: 'Configuring network services...', duration: 2000 },
        { name: `Installing desktop environment (KDE Plasma)...`, duration: 5000 },
        { name: `Configuring graphics stack (${config.gpuDriver})...`, duration: 2200 },
    ];

    if (config.graphicsMode === 'hybrid') {
        steps.push({ name: 'Setting up optimus-manager...', duration: 1800 });
    }

    if (config.packages.trim()) {
        const packageSummary = config.packages.split('\n').filter(p => p.trim()).slice(0, 2).join(', ');
        const ellipsis = config.packages.split('\n').filter(p => p.trim()).length > 2 ? '...' : '';
        steps.push({ name: `Installing user packages (${packageSummary}${ellipsis})...`, duration: 3500 });
    }

    if (config.enableSnapshots) {
        steps.push({ name: 'Configuring BTRFS snapshots with snapper...', duration: 2000 });
    }

    steps.push(
        { name: 'Applying user customizations...', duration: 2000 },
        { name: 'Running final system checks...', duration: 2500 },
        { name: 'Compressing live environment...', duration: 4000 },
        { name: 'Generating ISO image...', duration: 3000 },
    );
    
    return steps;
};


export const BuildModal: React.FC<BuildModalProps> = ({ config, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    
    // Memoize the generated steps to avoid recalculating on every render
    const buildSteps = useMemo(() => generateBuildSteps(config), [config]);
    const totalDuration = useMemo(() => buildSteps.reduce((acc, step) => acc + step.duration, 0), [buildSteps]);

    useEffect(() => {
        let stepTimeout: ReturnType<typeof setTimeout>;
        let progressInterval: ReturnType<typeof setInterval>;

        if (currentStep < buildSteps.length) {
            stepTimeout = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, buildSteps[currentStep].duration);
        }
        
        const startTime = Date.now();
        progressInterval = setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const currentProgress = Math.min(100, (elapsedTime / totalDuration) * 100);
            setProgress(currentProgress);
            if(currentProgress >= 100) {
                clearInterval(progressInterval);
                setIsFinished(true);
            }
        }, 100);

        return () => {
            clearTimeout(stepTimeout);
            clearInterval(progressInterval);
        };
    }, [currentStep, buildSteps, totalDuration]);

    const isoFileName = `ChirpyOS-${config.hostname}-${new Date().toISOString().split('T')[0]}.iso`;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-xl text-slate-200 flex flex-col max-h-[90vh] animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <DiscIcon className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-lg font-semibold">Forging Live CD</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-400">
                        The blueprint is being forged into a bootable ISO. This is a simulation of the build process.
                    </p>
                    
                    <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                        <div 
                            className="bg-yellow-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    
                    <div className="h-6 text-center">
                        <p className="text-sm font-mono text-slate-300 animate-fade-in">
                            {isFinished ? 'Build Complete!' : buildSteps[currentStep]?.name || 'Finalizing...'}
                        </p>
                    </div>

                    {isFinished && (
                        <div className="text-center p-4 bg-slate-800/50 rounded-lg animate-fade-in-fast">
                             <h3 className="text-lg font-semibold text-white">Blueprint Forged!</h3>
                             <p className="text-sm text-slate-400 mt-1 mb-4">Your custom Chirpy OS image is ready.</p>
                             <button className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-colors">
                                Download {isoFileName} (2.1 GB)
                             </button>
                        </div>
                    )}
                </div>
                 <footer className="p-4 border-t border-slate-800 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        {isFinished ? 'Close' : 'Cancel Build'}
                    </button>
                </footer>
            </div>
        </div>
    );
};
