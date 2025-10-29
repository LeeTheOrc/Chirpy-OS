// Fix: Implement the ChirpyAvatar component.
import React from 'react';

interface ChirpyAvatarProps {
    isOnline?: boolean;
}

export const ChirpyAvatar: React.FC<ChirpyAvatarProps> = ({ isOnline }) => {
    const onlineClasses = isOnline ? 'shadow-[0_0_10px_#34d399,0_0_20px_#10b981]' : '';

    return (
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-red-600 via-purple-600 to-yellow-500 flex-shrink-0 flex items-center justify-center shadow-lg transition-shadow duration-500 ${onlineClasses}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="w-6 h-6 text-white"
                aria-label="Chirpy OS Avatar"
            >
                <path
                    fill="currentColor"
                    d="M232.5,89.1a8,8,0,0,0-8.7,1.8L205.2,110a80,80,0,0,0-154.4,0L32.2,90.9a8,8,0,1,0-10.9,12.2l21,18.9a8,8,0,0,0,5.7,2.2,8.3,8.3,0,0,0,5.2-1.8,7.9,7.9,0,0,0,1.8-8.7L41,92.6a64.1,64.1,0,0,1,111.4-44.9,63.4,63.4,0,0,1,34.8,20.1,40,40,0,0,1,10.7,46.9,8,8,0,0,0,4.2,6.4,8.2,8.2,0,0,0,7.8.4,8,8,0,0,0,5-7.4,56.1,56.1,0,0,0-15-64,80,80,0,0,0-112.2-22,79,79,0,0,0-31.5,14.2l-3.3-3a8,8,0,1,0-11.4,11.2l12,12.1a8,8,0,0,0,11.3,0,8.2,8.2,0,0,0,1.9-5.7,7.9,7.9,0,0,0-1.9-5.6L42,75.4a64.2,64.2,0,0,1,21.5-12.2,63.3,63.3,0,0,1,69,0,64,64,0,0,1,43.3,59.3,24,24,0,0,1-23.9,23.5H128a8,8,0,0,0,0,16h24a40,40,0,0,0,39.9-40.5,39.5,39.5,0,0,0-2.9-14.8l18.6-16.8A8,8,0,0,0,232.5,89.1ZM128,216a72,72,0,0,1-72-72,8,8,0,0,1,16,0,56,56,0,0,0,112,0,8,8,0,0,1,16,0A72,72,0,0,1,128,216Z"
                ></path>
            </svg>
        </div>
    );
};
