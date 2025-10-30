
import React, { useState, useEffect } from 'react';
import { CloseIcon, CopyIcon, DownloadIcon, BlueprintIcon } from './Icons';
import type { BuildStep } from '../types';

const CodeBlock: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    const [copied, setCopied] = useState(false);
    const textToCopy = React.Children.toArray(children).join('');

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-2">
            <pre className="bg-slate-950/70 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 font-mono pr-12 whitespace-pre-wrap break-words max-h-[40vh] overflow-y-auto">
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-slate-800/80 rounded-md text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                aria-label="Copy code"
            >
                {copied ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};


interface AICoreModalProps {
  steps: BuildStep[];
  script: string;
  onClose: () => void;
}

export const AICoreModal: React.FC<AICoreModalProps> = ({ steps, script, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

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
            const timer = setTimeout(() => setIsComplete(true), 300);
            return () => clearTimeout(timer);
        }
    }, [currentStep, steps]);

    const downloadScript = () => {
        const blob = new Blob([script], { type: 'text/bash' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attune-core.sh';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    const elapsedDuration = steps.slice(0, currentStep).reduce((acc, step) => acc + step.duration, 0) + (steps[currentStep]?.duration * (progress / 100) || 0);
    const overallProgress = (elapsedDuration / totalDuration) * 100;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BlueprintIcon className="w-6 h-6 text-yellow-300" />
                        <span>AI Core Attunement</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {!isComplete ? (
                     <div className="space-y-4">
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-purple-500 to-yellow-400 h-2.5 rounded-full transition-all duration-100" style={{ width: `${overallProgress}%` }}></div>
                        </div>
                        <div>
                            <p className="text-slate-300 text-center text-lg font-semibold">{steps[currentStep]?.name || "Finalizing..."}</p>
                            <p className="text-slate-400 text-center text-sm">{`Rite ${currentStep + 1} of ${steps.length}`}</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <h3 className="text-2xl font-bold text-center text-green-400 mb-4">AI Core Script Forged!</h3>
                        <div className="overflow-y-auto pr-2 text-slate-300 leading-relaxed space-y-4">
                            <p>This script installs and configures the <strong className="text-yellow-400">Chirpy AI Core</strong> service on your existing Arch Linux or CachyOS system. It is non-destructive.</p>
                            <h3 className="font-semibold text-lg text-white mt-4 mb-2">How to Use:</h3>
                            <ol className="list-decimal list-inside space-y-2 text-slate-400">
                                <li>Save the script below as <code className="bg-slate-800 px-1 rounded-sm font-mono">attune-core.sh</code> on your target system.</li>
                                <li>Open a terminal and make it executable: <code className="bg-slate-800 px-1 rounded-sm font-mono">chmod +x attune-core.sh</code></li>
                                <li>Run the script with root privileges: <code className="bg-slate-800 px-1 rounded-sm font-mono">sudo ./attune-core.sh</code></li>
                            </ol>
                            <CodeBlock>{script}</CodeBlock>
                            <div className="flex justify-center items-center gap-4 mt-6">
                                 <button
                                    onClick={downloadScript}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download attune-core.sh
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
