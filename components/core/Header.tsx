
import React from 'react';
import type { LinkState } from '../../types';
import { Logo } from './Logo';

interface HeaderProps {
    linkState: LinkState;
}

export const Header: React.FC<HeaderProps> = ({ linkState }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-30 p-4 bg-forge-bg/80 backdrop-blur-sm border-b border-forge-border">
            <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
                <Logo linkState={linkState} />
            </div>
        </header>
    );
};
