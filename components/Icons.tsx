import React from 'react';

export const SendIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

export const AttachmentIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.5 10.5a.75.75 0 001.06 1.06l10.5-10.5a.75.75 0 011.06 0s.318.318.53.53a1.5 1.5 0 010 2.122l-7.25 7.25a3 3 0 01-4.242 0l-2.5-2.5a.75.75 0 10-1.06 1.06l2.5 2.5a4.5 4.5 0 006.364 0l7.25-7.25a3 3 0 000-4.242Z"
        clipRule="evenodd"
      />
    </svg>
  );
  
  export const CloseIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className={className}
      aria-hidden="true"
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );

  export const BlueprintIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        aria-hidden="true"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
);

export const CopyIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 3.5A1.5 1.5 0 018.5 2h5.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 01.439 1.062V12.5A1.5 1.5 0 0116.5 14h-.5a.75.75 0 000 1.5h.5A3 3 0 0019.5 14V5.621a3 3 0 00-.879-2.121L16.499.879A3 3 0 0014.379 0H8.5A3 3 0 005.5 3v.5a.75.75 0 001.5 0v-.5z" />
      <path d="M3.5 7A1.5 1.5 0 002 8.5v9A1.5 1.5 0 003.5 19h8a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0011.5 7h-8zM8.5 16a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM8.5 13a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75zM8.5 10a.75.75 0 01-.75.75h-3a.75.75 0 010-1.5h3a.75.75 0 01.75.75z" />
    </svg>
  );
  
export const QuestionMarkIcon = ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className={className}
      aria-hidden="true"
    >
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.061 3.5 3.5 0 016.092 2.122c- .118.39- .246.754- .38 1.102A.75.75 0 0113 10.5c- .252 0- .49-.1- .662-.274a.75.75 0 00-1.214.865A4.38 4.38 0 0111.45 13.5a.75.75 0 01-1.06.061A4.373 4.373 0 019 12.25c0- .51.061-1.006.182-1.475a.75.75 0 00-.254- .586.75.75 0 00-.94-.093c-.3.195-.555.43-.756.697a.75.75 0 01-1.06-1.06zM10 15.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );

  export const GpuIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
        aria-hidden="true"
    >
        <rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect>
        <path d="M6 12H4m6 0H8m6 0h-2m6 0h-2"></path>
    </svg>
);

export const PlusCircleIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"
        clipRule="evenodd"
      />
    </svg>
  );
  
export const ScanIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
        aria-hidden="true"
    >
        <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
        <rect x="7" y="7" width="10" height="10" rx="1"></rect>
    </svg>
);

export const DiscIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

export const InformationCircleIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className} 
        aria-hidden="true"
    >
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
);

export const LockClosedIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className={className} 
        aria-hidden="true"
    >
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);
  
export const LockOpenIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className={className} 
        aria-hidden="true"
    >
      <path d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h4a2 2 0 012 2v1.5a.75.75 0 01-1.5 0V11a.5.5 0 00-.5-.5H9.5a.75.75 0 010-1.5H13z" />
    </svg>
);

export const DownloadIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className={className} 
        aria-hidden="true"
    >
        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
);

export const ServerIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className} 
        aria-hidden="true"
    >
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
        <line x1="6" y1="6" x2="6.01" y2="6"></line>
        <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
);

export const DesktopComputerIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className} 
        aria-hidden="true"
    >
        <path d="M3 5.25a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 5.25V15a2.25 2.25 0 01-2.25 2.25H3A2.25 2.25 0 01.75 15V5.25zM12 18.75a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6z" />
    </svg>
);

export const GearIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M11.49 3.17a.75.75 0 01.447.898l-.458 1.834a.25.25 0 00.22.285l1.833-.458a.75.75 0 01.898.447l1.229 2.457a.75.75 0 01-.448.898l-1.834.458a.25.25 0 00-.285.22l.458 1.833a.75.75 0 01-.898.447l-2.457 1.229a.75.75 0 01-.898-.448l-.458-1.834a.25.25 0 00-.22-.285l-1.833.458a.75.75 0 01-.898-.447l-1.229-2.457a.75.75 0 01.448-.898l1.834-.458a.25.25 0 00.285-.22l-.458-1.833a.75.75 0 01.898-.447l2.457-1.229zm-1.49.128a.25.25 0 00-.15-.3l-2.457-1.229a.25.25 0 00-.3.15l-1.229 2.457a.25.25 0 00.15.3l1.834.458a.75.75 0 01.66.855l-.458 1.833a.25.25 0 00.3.15l2.457 1.229a.25.25 0 00.3-.15l1.229-2.457a.25.25 0 00-.15-.3l-1.834-.458a.75.75 0 01-.66-.855l.458-1.833zM10 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9zM10 7a3 3 0 100 6 3 3 0 000-6z"
        clipRule="evenodd"
      />
    </svg>
  );
// Fix: Add missing icons used by AICoreTuner.
export const FeatherIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
        aria-hidden="true"
    >
        <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
        <line x1="16" y1="8" x2="2" y2="22"></line>
        <line x1="17.5" y1="15" x2="9" y2="15"></line>
    </svg>
);

export const ScaleIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
    </svg>
);

export const FlameIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path fillRule="evenodd" d="M10.802 1.905a.75.75 0 00-.893.876 5.625 5.625 0 002.59 4.718c0 4.375-3.75 8.125-3.75 8.125S5 12.373 5 8a5.625 5.625 0 002.53-4.686.75.75 0 00-.876-.893 6.875 6.875 0 00-3.049 5.608c0 5.25 4.375 9.375 4.375 9.375s4.375-4.125 4.375-9.375a6.875 6.875 0 00-3.049-5.608z" clipRule="evenodd" />
    </svg>
);

export const SparklesIcon = ({ className }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill="currentColor" 
        className={className}
        aria-hidden="true"
    >
        <path fillRule="evenodd" d="M10 2.5a.75.75 0 01.75.75v.255a.75.75 0 01-1.5 0V3.25A.75.75 0 0110 2.5zM10 16.75a.75.75 0 01.75.75v.255a.75.75 0 01-1.5 0V17.5a.75.75 0 01.75-.75zM3.25 10a.75.75 0 01.75-.75h.255a.75.75 0 010 1.5H4a.75.75 0 01-.75-.75zM16.75 10a.75.75 0 01.75-.75h.255a.75.75 0 010 1.5H17.5a.75.75 0 01-.75-.75zM5.893 5.893a.75.75 0 011.061 0l.18.18a.75.75 0 01-1.06 1.06l-.18-.18a.75.75 0 010-1.061zM14.107 14.107a.75.75 0 011.061 0l.18.18a.75.75 0 01-1.06 1.06l-.18-.18a.75.75 0 010-1.061zM5.893 14.107a.75.75 0 010 1.061l-.18.18a.75.75 0 01-1.06-1.06l.18-.18a.75.75 0 011.06 0zM14.107 5.893a.75.75 0 010 1.061l-.18.18a.75.75 0 01-1.06-1.06l.18-.18a.75.75 0 011.06 0z" clipRule="evenodd" />
    </svg>
);
