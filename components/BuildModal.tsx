import React, { useState, useEffect } from 'react';
import { CloseIcon, BlueprintIcon } from './Icons';
import type { BuildStep } from '../types';

interface BuildModalProps {
  steps: BuildStep[];
  script: string;
  onClose: () => void;
  onShowInstructions: () => void;
}

export const BuildModal: React.FC<BuildModalProps> = ({ steps, script, onClose, onShowInstructions }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (currentStep < steps.length) {
            const stepDuration = steps[currentStep].duration;
            const startTime = Date.now();
            
            const interval = setInterval(() => {
                const elapsedTime = Date.now() - startTime;
                const stepProgress = Math.min((elapsedTime / stepDuration) * 100, 100);
                setProgress(stepProgress);

                if (elapsedTime >= stepDuration) {
                    clearInterval(interval);
                    setCurrentStep(prev => prev + 1);
                    setProgress(0);
                }
            }, 50);

            return () => clearInterval(interval);
        } else {
            setIsComplete(true);
        }
    }, [currentStep, steps]);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    const elapsedDuration = steps.slice(0, currentStep).reduce((acc, step) => acc + step.duration, 0) + (steps[currentStep]?.duration * (progress / 100) || 0);
    const overallProgress = (elapsedDuration / totalDuration) * 100;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BlueprintIcon className="w-6 h-6 text-yellow-300" />
                        <span>The Great Forge</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {!isComplete ? (
                     <div className="space-y-4">
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-purple-500 to-yellow-400 h-2.5 rounded-full" style={{ width: `${overallProgress}%` }}></div>
                        </div>
                        <div>
                            <p className="text-slate-300 text-center text-lg font-semibold">{steps[currentStep]?.name || "Finalizing..."}</p>
                            <p className="text-slate-400 text-center text-sm">{`Rite ${currentStep + 1} of ${steps.length}`}</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h3 className="text-2xl font-bold text-center text-green-400 mb-4">Artifact Forged!</h3>
                        <pre className="bg-slate-950/70 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 max-h-60 overflow-y-auto font-mono">
                           <code>{script}</code>
                        </pre>
                        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                             <button onClick={handleCopy} className="bg-yellow-500 text-slate-900 font-bold py-2 px-6 rounded-lg hover:bg-yellow-400 transition-colors w-full sm:w-auto">
                                {copied ? "Ritual Copied!" : "Copy Installation Ritual"}
                            </button>
                            <button onClick={onShowInstructions} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-500 transition-colors w-full sm:w-auto">
                                How to Use This Script
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};