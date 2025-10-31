import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { LightBulbIcon, CopyIcon } from './Icons';

interface AnalysisResultCardProps {
  analysis: AnalysisResult;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
            <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words">
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-forge-panel/80 rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                aria-label="Copy code"
            >
                {copied ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ analysis }) => {
  return (
    <div className="mt-4 border-2 border-magic-purple/50 bg-gradient-to-br from-forge-panel to-[#2a1d3a] rounded-xl shadow-lg shadow-magic-purple/10 animate-fade-in">
        <div className="p-4">
            <h3 className="font-bold text-magic-purple font-display tracking-wider flex items-center gap-2 text-lg mb-3">
                <LightBulbIcon className="w-5 h-5" />
                Oracle's Vision
            </h3>

            <div className="space-y-4 text-sm">
                <div>
                    <h4 className="font-semibold text-forge-text-primary mb-1">Diagnosis</h4>
                    <p className="text-forge-text-secondary">{analysis.diagnosis}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-forge-text-primary mb-1">Incantation (The Fix)</h4>
                    <CodeBlock>{analysis.solutionCommand}</CodeBlock>
                </div>
                <div>
                    <h4 className="font-semibold text-forge-text-primary mb-1">Next Step</h4>
                    <p className="text-forge-text-secondary">{analysis.nextStep}</p>
                </div>
            </div>
        </div>
    </div>
  );
};