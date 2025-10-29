import React, { useState } from 'react';
import { CloseIcon, CopyIcon } from './Icons';

interface SystemScanModalProps {
  onClose: () => void;
  onSubmit: (report: string) => void;
}

const SCAN_SCRIPT = `
#!/bin/bash
# Chirpy OS Hardware Scrying Script
# This script is read-only and does not modify your system.

echo "--- Hardware Report ---"
RAM=$(free -h | awk '/^Mem:/ {print $2}')
ARCH=$(uname -m)
KERNEL=$(uname -r)

# Detect CPU microarchitecture for CachyOS kernel optimization
CPU_MICROARCH="x86-64" # Default
if grep -q "avx512f" /proc/cpuinfo; then
    CPU_MICROARCH="x86-64-v4"
elif grep -q "avx2" /proc/cpuinfo; then
    CPU_MICROARCH="x86-64-v3"
fi
echo "CPU_MICROARCH: $CPU_MICROARCH"

echo "RAM: $RAM"
echo "Architecture: $ARCH"
echo "Kernel: $KERNEL"
echo "--- GPU Info ---"
lspci | grep -i 'vga\\|3d\\|2d' | sed -e 's/.*: //g'
echo "--- End GPU Info ---"
echo "--- End of Report ---"
`.trim();

export const SystemScanModal: React.FC<SystemScanModalProps> = ({ onClose, onSubmit }) => {
    const [report, setReport] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(SCAN_SCRIPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = () => {
        if (report.trim()) {
            onSubmit(report);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl text-slate-200 flex flex-col max-h-[90vh] animate-slide-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-slate-800">
                    <h2 className="text-lg font-semibold">System Scry</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <h3 className="font-medium text-slate-100 mb-2">Step 1: Copy the Scrying Scroll</h3>
                        <p className="text-sm text-slate-400 mb-3">Run this read-only script in a terminal on the target machine (e.g., from a live CD) to detect its hardware.</p>
                        <div className="bg-slate-800/50 rounded-lg">
                           <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded-t-lg">
                             <h4 className="text-sm font-mono text-slate-300">scan_hardware.sh</h4>
                             <button 
                                onClick={handleCopy}
                                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                                title="Copy script"
                             >
                                <CopyIcon className="w-4 h-4" />
                                <span>{copied ? 'Copied!' : 'Copy'}</span>
                             </button>
                           </div>
                           <pre className="p-3 text-xs text-slate-400 overflow-x-auto"><code>{SCAN_SCRIPT}</code></pre>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-medium text-slate-100 mb-2">Step 2: Submit the Report</h3>
                        <p className="text-sm text-slate-400 mb-3">Paste the entire output from the script below. I'll analyze it and attune the blueprint to the hardware.</p>
                        <textarea
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            placeholder="--- Hardware Report ---&#10;CPU_MICROARCH: x86-64-v3&#10;RAM: 15Gi&#10;...&#10;--- GPU Info ---&#10;Intel Corporation UHD Graphics 620&#10;NVIDIA Corporation GP108M [GeForce MX150]&#10;--- End GPU Info ---&#10;--- End of Report ---"
                            className="w-full h-40 bg-slate-800/80 border border-slate-700 rounded-lg p-2 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                        />
                    </div>
                </div>

                <footer className="p-4 border-t border-slate-800 flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        disabled={!report.trim()}
                        className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Analyze and Update Blueprint
                    </button>
                </footer>
            </div>
        </div>
    );
};