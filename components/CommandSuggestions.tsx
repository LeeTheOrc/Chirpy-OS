// Fix: Implement the CommandSuggestions component.
import React from 'react';
import { SendIcon } from './Icons';

interface CommandSuggestionsProps {
    suggestions: string[];
    onSelect: (command: string) => void;
}

export const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({ suggestions, onSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(suggestion)}
                    className="text-left p-4 bg-slate-700/60 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                    <p className="text-slate-300 text-sm">{suggestion}</p>
                    <div className="flex justify-end mt-2">
                        <SendIcon className="w-5 h-5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                    </div>
                </button>
            ))}
        </div>
    );
};