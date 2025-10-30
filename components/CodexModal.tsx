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
        <details className="bg-slate-800/50 rounded-lg group">
            <summary className="p-4 cursor-pointer flex justify-between items-center font-semibold text-slate-200 group-hover:text-yellow-300 transition-colors">
                {snippet.title}
                <span className="transform transition-transform group-open:rotate-90 text-yellow-400/80">{'>'}</span>
            </summary>
            <div className="p-4 border-t border-slate-700">
                <pre className="bg-slate-950/70 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 max-h-48 overflow-y-auto font-mono relative">
                    <code>{snippet.content}</code>
                    <button onClick={handleCopy} className="absolute top-2 right-2 p-1 bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors" aria-label="Copy code snippet">
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
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-white">The Chirpy Codex</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-white">
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