import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const CopyIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
      <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a99ec3" />
        <stop offset="100%" stopColor="#8d81ac" />
      </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

export const KaelSigilIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <defs>
        <linearGradient id="dragonFireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffdd57" />
            <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
    </defs>
    <path stroke="url(#dragonFireGradient)" d="M4 20V4M4 12h8M12 12l6-8M12 12l6 8" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <path stroke="currentColor" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const LockClosedIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export const LockOpenIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5V6.75a4.5 4.5 0 019 0v3.75" />
  </svg>
);

export const GearIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m15 0h1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3" />
  </svg>
);

export const KeyIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="dragonFireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffdd57" />
            <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
    </defs>
    <path stroke="url(#dragonFireGradient)" strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.966-.564 1.563-.43A6 6 0 0121.75 12z" />
  </svg>
);

export const DiscIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="dragonFireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffdd57" />
            <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
    </defs>
    <path stroke="url(#dragonFireGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const FolderIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="dragonFireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffdd57" />
            <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
    </defs>
    <path stroke="url(#dragonFireGradient)" strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

export const QuestionMarkIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

export const GpuIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" {...props}>
        <defs>
            <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a99ec3" />
                <stop offset="100%" stopColor="#8d81ac" />
            </linearGradient>
            <linearGradient id="skyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#52a9ff" />
                <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
        </defs>
        <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
        <path stroke="url(#skyBlueGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
);

export const ScanIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="skyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#52a9ff" />
            <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
    </defs>
    <path stroke="url(#skyBlueGradient)" strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 013.75 9.375v-4.5zM3.75 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5zM13.5 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5zM13.5 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 01-1.875-1.875v-4.5z" />
  </svg>
);

export const FeatherIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75l-3.75-3.75m3.75 3.75L15.75 18m-3.75 3.75V4.5m0 13.5l-3.75-3.75m3.75 3.75l3.75-3.75M4.5 12l7.5-7.5 7.5 7.5" />
  </svg>
);

export const ScaleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0 0l-4.5-4.5m4.5 4.5l4.5-4.5M12 3l4.5 4.5M12 3L7.5 7.5" />
  </svg>
);

export const FlameIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048l5.962-5.962a.75.75 0 011.06 0l2.298 2.297a.75.75 0 010 1.06l-5.962 5.962" />
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="magicPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f380ff" />
            <stop offset="100%" stopColor="#e040fb" />
        </linearGradient>
    </defs>
    <path stroke="url(#magicPurpleGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.672-2.672L11.25 18l1.938-.648a3.375 3.375 0 002.672-2.672L16.25 13.5l.648 1.938a3.375 3.375 0 002.672 2.672L21.5 18l-1.938.648a3.375 3.375 0 00-2.672 2.672z" />
  </svg>
);

export const CpuChipIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a99ec3" />
            <stop offset="100%" stopColor="#8d81ac" />
        </linearGradient>
         <linearGradient id="dragonFireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffdd57" />
            <stop offset="100%" stopColor="#ffcc00" />
        </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5m0 15v1.5M12 4.5v-1.5m0 18v-1.5" />
    <path stroke="url(#dragonFireGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12 6.75h.008v.008H12V6.75zm0 3.75h.008v.008H12v-.008zm0 3.75h.008v.008H12v-.008zm0 3.75h.008v.008H12v-.008zM9.75 9.75h.008v.008H9.75V9.75zm0 3.75h.008v.008H9.75v-.008zm0 3.75h.008v.008H9.75v-.008zm0 3.75h.008v.008H9.75v-.008zM14.25 9.75h.008v.008H14.25V9.75zm0 3.75h.008v.008H14.25v-.008zm0 3.75h.008v.008H14.25v-.008zm0 3.75h.008v.008H14.25v-.008z" />
  </svg>
);

export const HddIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a99ec3" />
            <stop offset="100%" stopColor="#8d81ac" />
        </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.253 9.253 9 9.563 9h4.874c.31 0 .563.253.563.563v4.874c0 .31-.253.563-.563.563H9.563A.563.563 0 019 14.437V9.563z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M10.5 12h3" />
  </svg>
);

export const BtrfsIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);

export const GrubIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25-6h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

export const MemoryStickIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a99ec3" />
            <stop offset="100%" stopColor="#8d81ac" />
        </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M4.5 3.75h15A2.25 2.25 0 0121.75 6v12a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18V6A2.25 2.25 0 014.5 3.75z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M7.5 3v3.75m9-3.75v3.75" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cffcf" />
            <stop offset="100%" stopColor="#7aebbe" />
        </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
  </svg>
);

export const GlobeAltIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="skyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#52a9ff" />
            <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
    </defs>
    <path stroke="url(#skyBlueGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

export const PlusCircleIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const RocketLaunchIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a99ec3" />
            <stop offset="100%" stopColor="#8d81ac" />
        </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-2.56 5.84m-2.56-5.84l-2.56-5.84a6 6 0 017.38-5.84m-4.82 5.84l5.84 2.56M12 12l-2.56-5.84a6 6 0 015.84-2.56m-5.84 2.56l-5.84 2.56a6 6 0 01-2.56 5.84m5.84-2.56l2.56 5.84" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cffcf" />
            <stop offset="100%" stopColor="#7aebbe" />
        </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CodeBracketIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="magicPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f380ff" />
            <stop offset="100%" stopColor="#e040fb" />
        </linearGradient>
    </defs>
    <path stroke="url(#magicPurpleGradient)" strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l-3.8-3.8a.75.75 0 00-1.06 1.06L5.69 8.5 1.89 12.3a.75.75 0 001.06 1.06l3.8-3.8zm10.5 0l3.8 3.8a.75.75 0 01-1.06 1.06L18.31 8.5l3.8 3.8a.75.75 0 01-1.06 1.06l-3.8-3.8z" />
  </svg>
);

export const Cog6ToothIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.04 1.226-1.263l.295-.098c.688-.228 1.457-.228 2.145 0l.295.098c.666.223 1.135.721 1.225 1.263l.094.542c.076.435.114.88.114 1.326v.159c0 .446-.038.891-.114 1.326l-.094.542c-.09.542-.56 1.04-1.225 1.263l-.295.098c-.688.228-1.457-.228-2.145 0l-.295-.098a2.25 2.25 0 0 1-1.226-1.263l-.094-.542A22.505 22.505 0 0 1 9 12.25v-.159c0-.446.038-.891.114-1.326l.094-.542z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
);

export const BlueprintIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m-16.5 0v1.5m16.5-1.5v1.5m-16.5 13.5v-1.5m16.5 1.5v-1.5m0 0h-16.5m16.5 0v-1.5m-16.5 1.5v-1.5" />
  </svg>
);

export const ScrollIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a99ec3" />
            <stop offset="100%" stopColor="#8d81ac" />
        </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const ForgeIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cffcf" />
            <stop offset="100%" stopColor="#7aebbe" />
        </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-2.25A4.5 4.5 0 009 14.25V9.75S8.625 9 8.25 9c-.375 0-.75.25-.75.25V14.25a4.5 4.5 0 004.5 4.5zm-3-9.75v-1.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5v1.5m-1.5-1.5a1.5 1.5 0 00-1.5-1.5h-1.5a1.5 1.5 0 00-1.5 1.5v1.5m-3.75 3a4.5 4.5 0 01-4.5-4.5v-1.5a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5v1.5" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="skyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#52a9ff" />
            <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
    </defs>
    <path stroke="url(#skyBlueGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const WrenchScrewdriverIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 21v-2.25A4.5 4.5 0 009 14.25V9.75S8.625 9 8.25 9c-.375 0-.75.25-.75.25V14.25a4.5 4.5 0 004.5 4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 21a2.25 2.25 0 002.25-2.25v-2.25a2.25 2.25 0 00-2.25-2.25H12.75v6.75zM17.25 12V9.75a2.25 2.25 0 00-2.25-2.25H9.75a2.25 2.25 0 00-2.25 2.25V12M12 15V9" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="skyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#52a9ff" />
            <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
    </defs>
    <path stroke="url(#skyBlueGradient)" strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const MagnifyingGlassIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a99ec3" />
            <stop offset="100%" stopColor="#8d81ac" />
        </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export const VideoCameraIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="magicPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f380ff" />
            <stop offset="100%" stopColor="#e040fb" />
        </linearGradient>
    </defs>
    <path stroke="url(#magicPurpleGradient)" strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
  </svg>
);

export const LightBulbIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-11.25H10.5a6.01 6.01 0 001.5 11.25v.25a2.25 2.25 0 01-2.25 2.25H9a2.25 2.25 0 01-2.25-2.25v-1.5M15.75 15.75V18m0-2.25v-1.5" />
  </svg>
);

export const PaperClipIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3.375 3.375 0 0119.5 7.372l-8.552 8.552a1.125 1.125 0 01-1.591-1.591l5.353-5.353" />
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cffcf" />
            <stop offset="100%" stopColor="#7aebbe" />
        </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
  </svg>
);

export const PackageIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cffcf" />
            <stop offset="100%" stopColor="#7aebbe" />
        </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    <path stroke="currentColor" strokeOpacity={0.5} strokeLinecap="round" strokeLinejoin="round" d="M12 12.75L3 7.5M21 7.5L12 12.75" />
  </svg>
);

export const ComputerDesktopIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
        <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cffcf" />
            <stop offset="100%" stopColor="#7aebbe" />
        </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
  </svg>
);

// --- NEW ICONS ---

export const ClockIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cffcf" />
            <stop offset="100%" stopColor="#7aebbe" />
        </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PaintBrushIcon: React.FC<IconProps> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
      <linearGradient id="magicPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f380ff" />
        <stop offset="100%" stopColor="#e040fb" />
      </linearGradient>
      <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a99ec3" />
        <stop offset="100%" stopColor="#8d81ac" />
      </linearGradient>
    </defs>
    <path stroke="url(#magicPurpleGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.75l-4.5 4.5m4.5-4.5v4.5m0-4.5h4.5m-4.5 0l4.5 4.5M12.75 11.25V21" />
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h9" />
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12.75 21a2.25 2.25 0 002.25-2.25v-1.5a2.25 2.25 0 00-2.25-2.25h-3a2.25 2.25 0 00-2.25 2.25v1.5A2.25 2.25 0 009.75 21h3z" />
  </svg>
);

export const BroomIcon: React.FC<IconProps> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
      <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a99ec3" />
        <stop offset="100%" stopColor="#8d81ac" />
      </linearGradient>
      <linearGradient id="dragonFireGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffdd57" />
        <stop offset="100%" stopColor="#ffcc00" />
      </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12.75 21v-4.5m0 4.5h-1.5m1.5 0h1.5M12.75 4.5v12m0-12h-1.5m1.5 0h1.5" />
    <path stroke="url(#dragonFireGradient)" strokeLinecap="round" strokeLinejoin="round" d="M3.75 12.75h16.5M3.75 14.25h16.5M3.75 15.75h16.5" />
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M8.25 21a1.5 1.5 0 01-1.5-1.5v-1.5a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v1.5a1.5 1.5 0 01-1.5 1.5h-7.5z" />
  </svg>
);

export const LibraryIcon: React.FC<IconProps> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
     <defs>
      <linearGradient id="skyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#52a9ff" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path stroke="url(#skyBlueGradient)" strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
  </svg>
);

// Fix: Add the missing TransmuteIcon component. It is used for the swap button in the Housekeeping modal.
export const TransmuteIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
  </svg>
);

export const DuplicateIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
      <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#a99ec3" />
        <stop offset="100%" stopColor="#8d81ac" />
      </linearGradient>
    </defs>
    <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M9.375 3.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 01-1.125-1.125v-9.75c0-.621.504-1.125 1.125-1.125h1.5z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M12.375 3.375h6.75a1.125 1.125 0 011.125 1.125v9.75a1.125 1.125 0 01-1.125 1.125h-6.75" />
  </svg>
);

export const BeakerIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="magicPurpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f380ff" />
            <stop offset="100%" stopColor="#e040fb" />
        </linearGradient>
    </defs>
    <path stroke="url(#magicPurpleGradient)" strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.25M9.75 3.104C11.22 2.237 13.09 1.5 15 1.5v5.714c0 .597-.237 1.17-.659 1.591L9.75 14.25M5 14.25h14" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M5 14.25a2.25 2.25 0 01-2.25-2.25v-1.5a2.25 2.25 0 012.25-2.25H19a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25M5 14.25v3.375c0 .621.504 1.125 1.125 1.125h11.75c.621 0 1.125-.504 1.125-1.125v-3.375" />
  </svg>
);

export const ServerStackIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
        <defs>
            <linearGradient id="coolGrayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a99ec3" />
                <stop offset="100%" stopColor="#8d81ac" />
            </linearGradient>
        </defs>
        <path stroke="url(#coolGrayGradient)" strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l-.75 3.375a2.25 2.25 0 002.25 2.625h9.5a2.25 2.25 0 002.25-2.625l-.75-3.375m-13.5 0A2.25 2.25 0 016.75 5.25h10.5a2.25 2.25 0 012.25 2.25m-13.5 0H21M6.75 7.5v9m10.5-9v9m-1.5-9h-7.5" />
    </svg>
);

export const SignalIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
      <linearGradient id="skyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#52a9ff" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path stroke="url(#skyBlueGradient)" strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.136 11.886a9.75 9.75 0 0113.728 0M1.984 8.734a14.25 14.25 0 0120.032 0M12 18.382a.375.375 0 110-.75.375.375 0 010 .75z" />
  </svg>
);

export const ShellPromptIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
        <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8cffcf" />
            <stop offset="100%" stopColor="#7aebbe" />
        </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M13.5 19.5h6" />
  </svg>
);

// New Icon for Athenaeum Attunement
export const TowerIcon: React.FC<IconProps> = (props) => (
  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
      <linearGradient id="skyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#52a9ff" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path stroke="url(#skyBlueGradient)" strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V9.75a.75.75 0 01.41-.665l.38-.21a.75.75 0 00.41-.665V3.75A.75.75 0 017 3h10a.75.75 0 01.75.75v4.32a.75.75 0 00.41.665l.38.21a.75.75 0 01.41.665V21M9 9h6v12H9V9z" />
  </svg>
);

export const HammerIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} {...props}>
    <defs>
      <linearGradient id="orcSteelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8cffcf" />
        <stop offset="100%" stopColor="#7aebbe" />
      </linearGradient>
    </defs>
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.083L17.917 9.75 9.75 17.917 6.083 14.25 14.25 6.083z" />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M5.167 13.333L2.25 16.25l5.5 5.5 2.917-2.917M14.25 6.083l5.5 5.5" />
    <path stroke="url(#orcSteelGradient)" strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.083L16.5 3.75 20.25 7.5l-2.25 2.25" />
  </svg>
);