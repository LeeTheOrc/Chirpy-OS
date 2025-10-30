import React, { useState, useEffect } from 'react';
import { CloseIcon, BlueprintIcon, DownloadIcon } from './Icons';
import type { BuildStep } from '../types';

interface BuildModalProps {
  steps: BuildStep[];
  script: string;
  onClose: () => void;
  onShowInstructions: () => void;
}

// Helper to safely Base64-encode a string that might contain Unicode characters.
const utf8ToBase64 = (str: string): string => {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        console.error("Failed to base64 encode script:", e);
        // Return a safe, encoded error message to prevent a UI crash.
        return btoa("Error: Could not encode script due to invalid characters.");
    }
}

export const BuildModal: React.FC<BuildModalProps> = ({ steps, script, onClose, onShowInstructions }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [copied, setCopied] = useState<null | 'script' | 'command'>(null);
    const [view, setView] = useState<'command' | 'script'>('command'); // Default to the new command view

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
    
    const base64Script = utf8ToBase64(script);
    const quickInstallCommand = `echo "${base64Script}" | base64 -d > install.sh && chmod +x install.sh && ./install.sh`;

    const handleCopy = (type: 'script' | 'command') => {
        const textToCopy = type === 'script' ? script : quickInstallCommand;
        navigator.clipboard.writeText(textToCopy);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const downloadScript = () => {
        const blob = new Blob([script], { type: 'text/bash' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'install.sh';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };


    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    const elapsedDuration = steps.slice(0, currentStep).reduce((acc, step) => acc + step.duration, 0) + (steps[currentStep]?.duration * (progress / 100) || 0);
    const overallProgress = (elapsedDuration / totalDuration) * 100;

    const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${active ? 'border-dragon-fire text-dragon-fire' : 'border-transparent text-forge-text-secondary hover:text-forge-text-primary'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2">
                        <BlueprintIcon className="w-6 h-6 text-dragon-fire" />
                        <span>The Great Forge</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                {!isComplete ? (
                     <div className="space-y-4">
                        <div className="w-full bg-forge-border rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-magic-purple to-dragon-fire h-2.5 rounded-full" style={{ width: `${overallProgress}%` }}></div>
                        </div>
                        <div>
                            <p className="text-forge-text-primary text-center text-lg font-semibold">{steps[currentStep]?.name || "Finalizing..."}</p>
                            <p className="text-forge-text-secondary text-center text-sm">{`Rite ${currentStep + 1} of ${steps.length}`}</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h3 className="text-2xl font-bold text-center text-dragon-fire mb-4">Artifact Forged!</h3>
                        
                        <div className="border-b border-forge-border mb-4 flex justify-center">
                            <nav className="-mb-px flex space-x-4">
                               <TabButton active={view === 'command'} onClick={() => setView('command')}>
                                   Quick Install Command
                               </TabButton>
                               <TabButton active={view === 'script'} onClick={() => setView('script')}>
                                   View Full Script
                               </TabButton>
                            </nav>
                        </div>

                        {view === 'command' ? (
                            <div>
                                <p className="text-forge-text-secondary text-sm mb-2 text-center">Paste this single command into your Arch Linux live environment to perform the ritual.</p>
                                <pre className="bg-forge-bg border border-forge-border rounded-lg p-4 text-xs text-forge-text-secondary max-h-60 overflow-y-auto font-mono whitespace-pre-wrap break-words">
                                    <code>{quickInstallCommand}</code>
                                </pre>
                                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                                    <button onClick={() => handleCopy('command')} className="bg-dragon-fire text-forge-bg font-bold py-2 px-6 rounded-lg hover:shadow-glow-dragon-fire transition-shadow w-full sm:w-auto">
                                        {copied === 'command' ? "Command Copied!" : "Copy Quick Install Command"}
                                    </button>
                                    <button onClick={onShowInstructions} className="bg-forge-border text-forge-text-primary font-bold py-2 px-6 rounded-lg hover:bg-magic-purple transition-colors w-full sm:w-auto">
                                        Full Instructions
                                    </button>
                                </div>
                            </div>
                        ) : (
                             <div>
                                <pre className="bg-forge-bg border border-forge-border rounded-lg p-4 text-xs text-forge-text-secondary max-h-60 overflow-y-auto font-mono">
                                   <code>{script}</code>
                                </pre>
                                <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-3">
                                     <button onClick={() => handleCopy('script')} className="bg-dragon-fire text-forge-bg font-bold py-2 px-6 rounded-lg hover:shadow-glow-dragon-fire transition-shadow w-full sm:w-auto">
                                        {copied === 'script' ? "Script Copied!" : "Copy Script"}
                                    </button>
                                    <button
                                        onClick={downloadScript}
                                        className="bg-magic-purple hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2 w-full sm:w-auto"
                                    >
                                        <DownloadIcon className="w-5 h-5" />
                                        Download install.sh
                                    </button>
                                    <button onClick={onShowInstructions} className="bg-forge-border text-forge-text-primary font-bold py-2 px-6 rounded-lg hover:bg-magic-purple transition-colors w-full sm:w-auto">
                                        How to Use This Script
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};