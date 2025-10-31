import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const FormattedContent: React.FC<{ text: string }> = ({ text }) => {
    const customComponents = {
        h3: ({ node, ...props }) => {
            if (node.children.length > 0 && node.children[0].type === 'text') {
                const textContent = node.children[0].value;
                const isRune = textContent.startsWith('RUNE ');
                const isQuest = textContent.startsWith('QUEST ');

                if (isRune || isQuest) {
                    const parts = textContent.split(':');
                    const keywordPart = parts[0]; 
                    const titlePart = parts.slice(1).join(':').trim(); 
                    
                    // Runes are purple (magic), Quests are green (orc steel)
                    const keywordColor = isRune ? '#e040fb' : '#7aebbe';
                    
                    return (
                        <h3 {...props} style={{ color: '#ffcc00' }}> 
                            <span style={{ color: keywordColor }}>{keywordPart}</span>
                            <span>: {titlePart}</span> 
                        </h3>
                    );
                }
            }
            return <h3 {...props}>{props.children}</h3>;
        },
    };

    return (
        <div className="prose prose-sm prose-invert max-w-none 
                        prose-headings:font-display prose-headings:tracking-wider
                        prose-strong:text-forge-text-primary 
                        prose-a:text-orc-steel prose-a:no-underline hover:prose-a:underline
                        prose-li:marker:text-dragon-fire
                        prose-hr:border-forge-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
                {text}
            </ReactMarkdown>
        </div>
    );
};