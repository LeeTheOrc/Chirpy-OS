import React from 'react';

export const FormattedContent: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="prose prose-slate prose-invert prose-sm max-w-none">
            {text.split('\n').map((line, index) => {
                if (line.startsWith('#### ')) {
                    return <h4 key={index} className="font-bold text-forge-text-secondary text-sm mt-3 mb-1">{line.substring(5)}</h4>;
                }
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="font-bold text-dragon-fire text-base mt-4 mb-2">{line.substring(4)}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="font-bold text-xl text-forge-text-primary mb-3">{line.substring(3)}</h2>;
                }
                if (line.startsWith('- **')) {
                     const boldMatch = line.match(/- \*\*(.*?)\*\*:(.*)/);
                    if (boldMatch) {
                        return (
                            <li key={index} className="ml-4 list-disc">
                                <strong className="text-forge-text-primary">{boldMatch[1]}:</strong>
                                <span className="text-forge-text-secondary">{boldMatch[2]}</span>
                            </li>
                        );
                    }
                }
                if (line.startsWith('- ')) {
                    const [firstPart, ...rest] = line.substring(2).split(/:(.*)/s);
                    return (
                        <li key={index} className="ml-4 list-disc">
                            <strong className="text-forge-text-primary">{firstPart}:</strong>
                            {rest.length > 0 && <span className="text-forge-text-secondary">{rest.join(':')}</span>}
                        </li>
                    );
                }
                 if (line.startsWith('*')) {
                    return <p key={index} className="text-forge-text-secondary italic mt-1">{line.substring(1).trim()}</p>;
                }
                if (line.trim() === '---') {
                    return <hr key={index} className="border-forge-border my-4" />;
                }
                return <p key={index} className="text-forge-text-primary">{line}</p>;
            })}
        </div>
    );
};