import React from 'react';
import { TerminalIcon, FolderIcon, CodeBracketIcon, Cog6ToothIcon, BlueprintIcon, GpuIcon } from './Icons';

interface TopDockProps {
    onBlueprintClick: () => void;
}

const dockItems = [
    { icon: <TerminalIcon className="w-6 h-6" />, color: 'text-orc-steel', name: 'Terminal' },
    { icon: <FolderIcon className="w-6 h-6" />, color: 'text-dragon-fire', name: 'File Manager' },
    { icon: <CodeBracketIcon className="w-6 h-6" />, color: 'text-magic-purple', name: 'Code Editor' },
    { icon: <GpuIcon className="w-6 h-6" />, color: 'text-cyan-400', name: 'System Monitor' },
    { icon: <Cog6ToothIcon className="w-6 h-6" />, color: 'text-slate-400', name: 'Settings' },
];

export const TopDock: React.FC<TopDockProps> = ({ onBlueprintClick }) => {
    return (
        <header 
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-forge-panel/80 backdrop-blur-lg border border-forge-border z-30 px-3 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-black/30"
            aria-label="Application Dock"
        >
            {dockItems.map((item, index) => (
                <button
                    key={index}
                    className={`p-2 rounded-full transition-all duration-200 hover:bg-forge-border/60 ${item.color} hover:drop-shadow-[0_0_4px_#ffcc0066]`}
                    title={item.name}
                    aria-label={item.name}
                >
                    {item.icon}
                </button>
            ))}
            <div className="w-px h-8 bg-forge-border mx-2" />
            <button
                onClick={onBlueprintClick}
                className="p-2 rounded-full transition-all duration-200 text-dragon-fire hover:bg-forge-border/60 hover:drop-shadow-[0_0_4px_#ffcc00cc]"
                title="Open Blueprint"
                aria-label="Open Blueprint"
            >
                <BlueprintIcon className="w-6 h-6" />
            </button>
        </header>
    );
};