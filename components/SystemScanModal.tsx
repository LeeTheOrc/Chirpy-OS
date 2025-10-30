import React, { useState, useEffect } from 'react';
import { GpuIcon, DiscIcon, ScanIcon, CloseIcon } from './Icons';

interface SystemScanModalProps {
  onClose: () => void;
  onComplete: (report: string) => void;
}

const scanItems = [
    { name: 'Core Architecture', icon: <ScanIcon className="w-5 h-5 text-dragon-fire" /> },
    { name: 'Graphics Card', icon: <GpuIcon className="w-5 h-5 text-dragon-fire" /> },
    { name: 'Storage Drives', icon: <DiscIcon className="w-5 h-5 text-dragon-fire" /> },
    { name: 'Memory Modules', icon: <ScanIcon className="w-5 h-5 text-dragon-fire" /> },
    { name: 'Network Adapters', icon: <ScanIcon className="w-5 h-5 text-dragon-fire" /> },
];

const MOCK_SYSTEM_REPORT = `
## Scrying Report: System Hardware

- **CPU**: Intel Core i7-10700K @ 3.80GHz (8-core, 16-thread)
- **GPU**: NVIDIA GeForce RTX 3080 (Hybrid)
- **RAM**: 32 GB DDR4 @ 3200MHz
- **Disks**:
  - \`/dev/nvme0n1\`: 1TB NVMe SSD (Samsung 970 Evo Plus)
  - \`/dev/sda\`: 2TB HDD (Seagate Barracuda)
- **Network**:
  - \`enp3s0\`: Realtek RTL8111/8168/8411 PCI Express Gigabit Ethernet Controller
- **Architecture**: x86_64
`;

export const SystemScanModal: React.FC<SystemScanModalProps> = ({ onClose, onComplete }) => {
    const [currentItem, setCurrentItem] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (currentItem >= scanItems.length) {
            setIsComplete(true);
            return;
        }

        const timeout = setTimeout(() => {
            setCurrentItem(currentItem + 1);
        }, 700);

        return () => clearTimeout(timeout);
    }, [currentItem]);

    useEffect(() => {
        if (isComplete) {
            const timeout = setTimeout(() => {
                onComplete(MOCK_SYSTEM_REPORT);
                onClose();
            }, 1000);
            return () => clearTimeout(timeout);
        }
    }, [isComplete, onComplete, onClose]);
    
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border border-forge-border rounded-lg shadow-2xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-forge-text-primary">Scrying Hardware...</h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-3">
                    {scanItems.map((item, index) => (
                         <div key={item.name} className={`flex items-center gap-3 transition-opacity duration-300 ${currentItem >= index ? 'opacity-100' : 'opacity-40'}`}>
                           {item.icon}
                            <span className="text-forge-text-secondary w-36 flex-shrink-0">{item.name}</span>
                            <div className="flex-grow text-right">
                                {currentItem > index && <span className="text-dragon-fire text-sm font-semibold">✓ Done</span>}
                                {currentItem === index && <span className="text-magic-purple text-sm animate-pulse">Scrying...</span>}
                            </div>
                        </div>
                    ))}
                </div>
                {isComplete && (
                    <p className="text-center text-dragon-fire mt-6 animate-pulse">
                        Scrying Complete! Inscribing report...
                    </p>
                )}
            </div>
        </div>
    );
};