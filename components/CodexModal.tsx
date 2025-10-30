import React from 'react';
import type { Snippet } from '../types';
import { CloseIcon, CopyIcon } from './Icons';

interface CodexModalProps {
  onClose: () => void;
  snippets: Snippet[];
}

const SnippetItem: React.FC<{ snippet: Snippet }> = ({ snippet }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <details className="bg-forge-panel/50 rounded-lg group border border-forge-border">
            <summary className="p-4 cursor-pointer flex justify-between items-center font-semibold text-forge-text-primary group-hover:text-dragon-fire transition-colors">
                {snippet.title}
                <span className="transform transition-transform group-open:rotate-90 text-dragon-fire/80">{'>'}</span>
            </summary>
            <div className="p-4 border-t border-forge-border">
                <pre className="bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary max-h-48 overflow-y-auto font-mono relative">
                    <code>{snippet.content}</code>
                    <button onClick={handleCopy} className="absolute top-2 right-2 p-1 bg-forge-panel rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-colors" aria-label="Copy code snippet">
                        {copied ? 'Copied!' : <CopyIcon className="w-4 h-4" />}
                    </button>
                </pre>
            </div>
        </details>
    );
};


export const CodexModal: React.FC<CodexModalProps> = ({ onClose, snippets }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
        <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider">The Kael Codex</h2>
                <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2">
                {snippets.map((snippet) => (
                    <SnippetItem key={snippet.id} snippet={snippet} />
                ))}
            </div>
        </div>
    </div>
  );
};