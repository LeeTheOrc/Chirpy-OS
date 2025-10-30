import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const FormattedContent: React.FC<{ text: string }> = ({ text }) => {
    return (
        <div className="prose prose-sm prose-invert max-w-none 
                        prose-headings:text-dragon-fire prose-headings:font-bold 
                        prose-strong:text-forge-text-primary 
                        prose-a:text-orc-steel prose-a:no-underline hover:prose-a:underline
                        prose-li:marker:text-dragon-fire
                        prose-hr:border-forge-border">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {text}
            </ReactMarkdown>
        </div>
    );
};
