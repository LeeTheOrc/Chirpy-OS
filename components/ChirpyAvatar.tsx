import React from 'react';

interface GuardianAvatarProps {
    isOnline?: boolean;
}

export const GuardianAvatar: React.FC<GuardianAvatarProps> = ({ isOnline }) => {
    // The breathing and pulsing glow make the avatar feel more alive.
    const onlineGlowClasses = isOnline ? 'animate-pulse-glow' : '';

    return (
        <div className={`group relative w-10 h-10 flex-shrink-0`}>
            {/* Separate div for the glow so it can pulse without affecting the image shadow */}
            <div className={`absolute -inset-0.5 rounded-full ${onlineGlowClasses}`} />
            <img 
                src="/image.jpg" 
                alt="Kael, the Forge Guardian"
                className="relative w-full h-full rounded-full object-cover shadow-lg animate-breathing group-hover:scale-105 transition-transform duration-300"
            />
        </div>
    );
};