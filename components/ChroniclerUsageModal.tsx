import React from 'react';
import { CloseIcon, VideoCameraIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface ChroniclerUsageModalProps {
  onClose: () => void;
}

export const ChroniclerUsageModal: React.FC<ChroniclerUsageModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <VideoCameraIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Using The Chronicler's Orb</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        The Chronicler's Orb is a sacred artifact for capturing the events of your Realm. It records both system-wide logs and your personal terminal session, combining them into a single "Chronicle" file that you can share with me for analysis.
                    </p>
                     <p className="text-sm p-3 bg-magic-purple/10 border-l-4 border-magic-purple rounded mt-2">
                        The <code className="font-mono text-xs">chronicler</code> command is installed as a core dependency of your Realm. Here is how to use it.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-magic-purple mt-4 mb-2">Step 1: Activate the Orb</h3>
                    <p>
                        Whenever you want to start recording, simply run the command from any directory:
                    </p>
                    <CodeBlock lang="bash">chronicler</CodeBlock>
                     <p>The Orb is now active. It will tell you the name of the log file it's creating.</p>

                    <h3 className="font-semibold text-lg text-magic-purple mt-4 mb-2">Step 2: Perform Your Actions</h3>
                    <p>
                        Now, run all the commands you want to record. The Orb will capture both your commands and the system's reactions in the background.
                    </p>

                    <h3 className="font-semibold text-lg text-magic-purple mt-4 mb-2">Step 3: End the Recording</h3>
                     <p>
                        When you are finished, type the following command and press Enter. This stops the recording and combines everything into the final log file.
                    </p>
                    <CodeBlock lang="bash">exit</CodeBlock>
                    
                    <h3 className="font-semibold text-lg text-magic-purple mt-4 mb-2">Step 4: Share the Chronicle</h3>
                    <p>
                        The final Chronicle file is saved in a daily sub-folder inside <code className="font-mono text-xs">~/ChroniclesReports</code>. Use the attachment button in our chat to upload this file so I can analyze your steps and help you on your quest.
                    </p>
                </div>
            </div>
        </div>
    );
};