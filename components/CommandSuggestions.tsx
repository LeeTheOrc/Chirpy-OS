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
                    className="text-left p-4 bg-forge-panel/60 border border-forge-border rounded-lg hover:bg-forge-panel transition-colors group"
                >
                    <p className="text-forge-text-secondary text-sm">{suggestion}</p>
                    <div className="flex justify-end mt-2">
                        <SendIcon className="w-5 h-5 text-forge-text-secondary/50 group-hover:text-orc-steel transition-colors" />
                    </div>
                </button>
            ))}
        </div>
    );
};