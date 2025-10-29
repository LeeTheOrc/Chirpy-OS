import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, CopyIcon } from './Icons';

interface IsoModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [copied, setCopied] = useState(false);
    
    const textToCopy = React.Children.toArray(children).join('');

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-2">
            <pre className="bg-slate-950/70 border border-slate-700 rounded-lg p-3 text-sm text-slate-300 overflow-x-auto font-mono pr-12">
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-slate-800/80 rounded-md text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                aria-label="Copy code"
            >
                {copied ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};

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
                                <p>Boot your target computer from the USB drive. Once you are at the command prompt in the live environment, ensure you are connected to the internet.</p>
                                <p className="mt-2">After the forge finishes, it provides a <strong className="text-yellow-400">Quick Install Command</strong>. This is the most direct path to forging your realm.</p>
                                <p>Copy the entire command block from the forge and paste it into your terminal. Press Enter to execute it.</p>
                                <CodeBlock>
{`# The command you copy will look like this:
echo 'base64_encoded_script_...' | base64 -d > install.sh
chmod +x install.sh && ./install.sh`}
                                </CodeBlock>
                                <p>This single command automatically creates the <strong className="font-mono text-slate-400">install.sh</strong> script, makes it executable, and begins the installation ritual.</p>

                                <h4 className="font-semibold text-md text-white mt-6 mb-2">Manual Fallback</h4>
                                <p>If you prefer to create the script manually, or if you only have the script text:</p>
                                <p className="mt-2">1. Copy the "Full Script" text from the forge.</p>
                                <p>2. In the live environment, open a text editor (like `nano`):</p>
                                <CodeBlock>nano install.sh</CodeBlock>
                                <p>3. Paste the script content, then save and exit the editor.</p>
                                <p>4. Make the script executable:</p>
                                <CodeBlock>chmod +x install.sh</CodeBlock>
                                <p>5. Run the ritual:</p>
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
                                <CodeBlock>{`mkdir ~/chirpy-iso && cd ~/chirpy-iso
cp -r /usr/share/archiso/configs/releng .`}</CodeBlock>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 3: Embed the Ritual Script</h3>
                                <p>
                                    After the forge generates your script, you must place it inside the ISO's filesystem. This process is broken into two parts.
                                </p>

                                <h4 className="font-semibold text-md text-white mt-4 mb-1">Part A: Create the Script</h4>
                                <p>
                                    In the "Great Forge" window, find the <strong className="text-yellow-400">Quick Install Command</strong>. Copy <strong className="text-red-400">only the first line</strong> of that command block. It will start with <code className="text-slate-400 bg-slate-800 p-1 rounded text-sm">echo</code>.
                                </p>
                                <p className="mt-1">
                                    Paste that single line into your terminal (which should be in the `~/chirpy-iso` directory) and press Enter. This will create the `install.sh` file.
                                </p>
                                <div className="bg-slate-950/70 border border-dashed border-slate-600 rounded-lg p-3 text-sm text-slate-400 mt-2 font-mono">
                                    # Your pasted command will look similar to this: <br />
                                    echo 'IyEvYmluL2Jhc2gNCiMgQ2hpcnB5IEFJ...' | base64 -d > install.sh
                                </div>


                                <h4 className="font-semibold text-md text-white mt-6 mb-1">Part B: Move and Prepare the Script</h4>
                                <p>
                                    Now that `install.sh` has been created, run the following command block to move it into the correct ISO directory and make it executable.
                                </p>
                                <CodeBlock>
{`mv install.sh releng/airootfs/root/install.sh
chmod +x releng/airootfs/root/install.sh`}
                                </CodeBlock>

                                <h4 className="font-semibold text-md text-white mt-6 mb-2">Manual Fallback</h4>
                                <p>If you prefer to create the script manually:</p>
                                <p className="mt-2">1. Copy the "Full Script" text from the forge.</p>
                                <p>2. In your `~/chirpy-iso` directory, open a text editor to create the file in the correct path:</p>
                                <CodeBlock>nano releng/airootfs/root/install.sh</CodeBlock>
                                <p>3. Paste the script content, then save and exit the editor.</p>
                                <p>4. Make the script executable:</p>
                                <CodeBlock>chmod +x releng/airootfs/root/install.sh</CodeBlock>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-lg text-white mt-4 mb-2">Step 4: Build the ISO</h3>
                                <p>From your `~/chirpy-iso` directory, run the build command. This can take some time.</p>
                                <CodeBlock>sudo mkarchiso -v -w /tmp/archiso-work -o . releng</CodeBlock>
                                <p>Your custom ISO will be created in the current directory. When you boot it, you can run your embedded ritual by typing <strong className="font-mono text-slate-400">./install.sh</strong> from the `/root` directory.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};