import React, { useState, useEffect } from 'react';
import { GpuIcon, DiscIcon, ScanIcon, CloseIcon } from './Icons';

interface SystemScanModalProps {
  onClose: () => void;
  onComplete: (report: string) => void;
}

const scanItems = [
    { name: 'Core Architecture', icon: <ScanIcon className="w-5 h-5 text-cyan-400" /> },
    { name: 'Graphics Card', icon: <GpuIcon className="w-5 h-5 text-green-400" /> },
    { name: 'Storage Drives', icon: <DiscIcon className="w-5 h-5 text-yellow-400" /> },
    { name: 'Memory Modules', icon: <ScanIcon className="w-5 h-5 text-cyan-400" /> },
    { name: 'Network Adapters', icon: <ScanIcon className="w-5 h-5 text-cyan-400" /> },
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
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Scrying Hardware...</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-3">
                    {scanItems.map((item, index) => (
                         <div key={item.name} className={`flex items-center gap-3 transition-opacity duration-300 ${currentItem >= index ? 'opacity-100' : 'opacity-40'}`}>
                           {item.icon}
                            <span className="text-slate-300 w-36 flex-shrink-0">{item.name}</span>
                            <div className="flex-grow text-right">
                                {currentItem > index && <span className="text-green-400 text-sm font-semibold">✓ Done</span>}
                                {currentItem === index && <span className="text-yellow-400 text-sm animate-pulse">Scrying...</span>}
                            </div>
                        </div>
                    ))}
                </div>
                {isComplete && (
                    <p className="text-center text-green-400 mt-6 animate-pulse">
                        Scrying Complete! Inscribing report...
                    </p>
                )}
            </div>
        </div>
    );
};
