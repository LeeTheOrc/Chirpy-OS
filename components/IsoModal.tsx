import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, BlueprintIcon } from './Icons';

interface IsoModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-950/70 border border-slate-700 rounded-lg p-3 my-2 text-sm text-slate-300 overflow-x-auto font-mono">
        <code>{children}</code>
    </pre>
);

export const IsoModal: React.FC<IsoModalProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'easy' | 'advanced'>('easy');

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Performing the Ritual</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="border-b border-slate-700 mb-4 flex-shrink-0">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            onClick={() => setActiveTab('easy')}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'easy' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            The Simple Path
                        </button>
                        <button
                             onClick={() => setActiveTab('advanced')}
                             className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'advanced' ? 'border-yellow-400 text-yellow-400' : 'border-transparent text-slate-400 hover:text-white'}`}
                        >
                            The Artisan's Path (Custom ISO)
                        </button>
                    </nav>
                </div>
                
                <div className="overflow-y-auto pr-2 text-slate-300 leading-relaxed">
                    {activeTab === 'easy' && (
                        <div className="animate-fade-in-fast space-y-4">
                            <p>This is the recommended method. You'll use the official Arch Linux live environment to execute your custom installation script.</p>
                            
                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 1: Get the Arch Linux ISO</h3>
                                <p>If you don't have it already, download the latest official ISO file.</p>
                                <a href="https://archlinux.org/download/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg my-2 transition-colors">
                                    <DownloadIcon className="w-5 h-5" />
                                    Download from archlinux.org
                                </a>
                            </div>

                             <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 2: Create a Bootable USB</h3>
                                <p>Use a tool like <a href="https://www.balena.io/etcher/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Balena Etcher</a> or <a href="https://www.ventoy.net/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">Ventoy</a> to write the downloaded ISO to a USB drive.</p>
                            </div>

                             <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 3: Boot and Run the Ritual</h3>
                                <p>Boot your target computer from the USB drive. Once you're at the command prompt in the live environment, follow these steps:</p>
                                <p className="mt-2">1. Make sure you are connected to the internet.</p>
                                <p>2. Create the script file using a text editor:</p>
                                <CodeBlock>vim install.sh</CodeBlock>
                                <p>3. Paste the script you copied from the forge into the editor and save the file.</p>
                                <p>4. Make the script executable:</p>
                                <CodeBlock>chmod +x install.sh</CodeBlock>
                                <p>5. Run the ritual. Be certain you've set the correct `targetDisk` in the blueprint!</p>
                                <CodeBlock>./install.sh</CodeBlock>
                            </div>
                        </div>
                    )}
                    {activeTab === 'advanced' && (
                         <div className="animate-fade-in-fast space-y-4">
                            <p>This path allows you to build a completely custom Arch Linux ISO with your script and any other modifications baked in. This requires an existing Arch Linux system.</p>
                            
                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 1: Install ArchISO</h3>
                                <p>This is the tool used to master ISO images.</p>
                                <CodeBlock>sudo pacman -S archiso</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 2: Prepare the Profile</h3>
                                <p>Create a working directory and copy the baseline `releng` profile.</p>
                                <CodeBlock>mkdir ~/chirpy-iso && cd ~/chirpy-iso
cp -r /usr/share/archiso/configs/releng/ .</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 3: Embed Your Script</h3>
                                <p>Place your copied script into the live filesystem. It will be available at `/root/install.sh` when you boot the custom ISO.</p>
                                <CodeBlock># Make sure your script is saved as 'install.sh' in your current directory
# Then, copy it into the profile:
cp ./install.sh releng/airootfs/root/install.sh</CodeBlock>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 4: Build the ISO</h3>
                                <p>Run the build command. This can take some time.</p>
                                <CodeBlock>sudo mkarchiso -v -w /tmp/archiso-work -o . releng</CodeBlock>
                                <p>Your custom ISO (named something like `archlinux-202X.XX.XX-x86_64.iso`) will be created in your `~/chirpy-iso` directory, ready to be flashed to a USB.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};