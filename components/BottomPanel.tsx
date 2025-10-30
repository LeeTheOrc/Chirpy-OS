import React, { useState, useEffect } from 'react';
import { LinkState } from '../types';
import { ScrollIcon, InformationCircleIcon, RocketLaunchIcon, WifiIcon, SpeakerWaveIcon } from './Icons';

interface BottomPanelProps {
    linkState: LinkState;
    onToggleLinkState: () => void;
    onCodexClick: () => void;
    onPhilosophyClick: () => void;
    onManifestoClick: () => void;
}

const KaelStartIcon: React.FC = () => (
     <button className="p-2 rounded-lg hover:bg-forge-border/60 transition-colors" title="Kael Menu" aria-label="Kael Menu">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-dragon-fire group-hover:drop-shadow-[0_0_3px_#ffcc00] transition-all duration-300"
            aria-label="Kael AI Logo"
        >
            <path d="M4 20V4M4 12h8M12 12l6-8M12 12l6 8"/>
        </svg>
    </button>
);

const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };
    
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    return (
        <div className="text-center text-sm font-medium text-forge-text-secondary">
            <p>{formatDate(time)}</p>
            <p className="text-forge-text-primary text-base tracking-wider">{formatTime(time)}</p>
        </div>
    );
};

const LinkStateIndicator: React.FC<{ linkState: LinkState; onToggle: () => void; }> = ({ linkState, onToggle }) => {
    const isOnline = linkState === 'online';
    const indicatorClasses = isOnline ? 'bg-dragon-fire animate-pulse-glow-small' : 'bg-forge-text-secondary/50';
    return (
        <button
            onClick={onToggle}
            className={`w-4 h-4 rounded-full transition-colors ${indicatorClasses}`}
            aria-label={`Current status: ${linkState}. Click to toggle.`}
            title={isOnline ? "Cloud Core: Online" : "Cloud Core: Offline"}
        />
    );
};

export const BottomPanel: React.FC<BottomPanelProps> = ({ linkState, onToggleLinkState, onCodexClick, onPhilosophyClick, onManifestoClick }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 h-14 bg-forge-panel/90 backdrop-blur-sm border-t border-forge-border z-20 px-4 flex items-center justify-between">
            <div className="flex-1 flex justify-start">
                <KaelStartIcon />
            </div>
            <div className="flex-1 flex justify-center">
                <Clock />
            </div>
            <div className="flex-1 flex justify-end items-center gap-3">
                 <button onClick={onManifestoClick} className="p-2 rounded-full hover:bg-forge-border/60 text-forge-text-secondary transition-colors" title="Level Up Manifesto">
                    <RocketLaunchIcon className="w-5 h-5" />
                </button>
                 <button onClick={onPhilosophyClick} className="p-2 rounded-full hover:bg-forge-border/60 text-forge-text-secondary transition-colors" title="Core Philosophy">
                    <ScrollIcon className="w-5 h-5" />
                </button>
                 <button onClick={onCodexClick} className="p-2 rounded-full hover:bg-forge-border/60 text-forge-text-secondary transition-colors" title="Kael Codex">
                    <InformationCircleIcon className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-forge-border/70" />
                <div className="flex items-center gap-3 text-forge-text-secondary">
                    <SpeakerWaveIcon className="w-5 h-5" />
                    <WifiIcon className="w-5 h-5" />
                    <LinkStateIndicator linkState={linkState} onToggle={onToggleLinkState} />
                </div>
            </div>
        </footer>
    );
};
