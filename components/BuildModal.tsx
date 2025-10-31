import React, { useState, useEffect } from 'react';
import type { BuildStep } from '../types';
import { CloseIcon, DiscIcon } from './Icons';

interface BuildModalProps {
  steps: BuildStep[];
  onClose: () => void;
  onComplete: () => void;
}

export const BuildModal: React.FC<BuildModalProps> = ({ steps, onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentStep >= steps.length) {
            setIsComplete(true);
            return;
        }

        const currentStepData = steps[currentStep];
        const timeout = setTimeout(() => {
            setCurrentStep(currentStep + 1);
        }, currentStepData.duration);

        return () => clearTimeout(timeout);
    }, [currentStep, steps]);
    
    useEffect(() => {
        if (isComplete) {
            const timeout = setTimeout(() => {
                onComplete();
            }, 1000); // Wait a moment after completion before switching modal
            return () => clearTimeout(timeout);
        }
    }, [isComplete, onComplete]);

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider">Forging the ISO...</h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div key={step.name} className={`flex items-center gap-3 transition-opacity duration-300 ${currentStep >= index ? 'opacity-100' : 'opacity-40'}`}>
                            <DiscIcon className={`w-5 h-5 flex-shrink-0 ${currentStep > index ? 'text-dragon-fire' : 'text-magic-purple animate-spin'}`} />
                            <span className="text-forge-text-secondary w-64 flex-shrink-0">{step.name}</span>
                            <div className="flex-grow text-right">
                                {currentStep > index && <span className="text-dragon-fire text-sm font-semibold">✓ Done</span>}
                                {currentStep === index && <span className="text-magic-purple text-sm animate-pulse">Forging...</span>}
                            </div>
                        </div>
                    ))}
                </div>
                {isComplete && (
                    <p className="text-center text-dragon-fire mt-6 animate-pulse">
                        Forge Complete! Summoning the Genesis Ritual...
                    </p>
                )}
            </div>
        </div>
    );
};
