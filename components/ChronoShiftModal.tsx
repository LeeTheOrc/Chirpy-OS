import React from 'react';
import { CloseIcon, CopyIcon, ClockIcon } from './Icons';

interface ChronoShiftModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => {
    const [copied, setCopied] = React.useState(false);
    const textToCopy = React.Children.toArray(children).join('');

    const handleCopy = () => {
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group my-2">
            <pre className={`bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words max-h-64 overflow-y-auto ${lang ? `language-${lang}` : ''}`}>
                <code>{children}</code>
            </pre>
            <button 
                onClick={handleCopy} 
                className="absolute top-2 right-2 p-1.5 bg-forge-panel/80 rounded-md text-forge-text-secondary hover:text-forge-text-primary transition-all opacity-0 group-hover:opacity-100 focus:opacity-100" 
                aria-label="Copy code"
            >
                {copied ? <span className="text-xs font-sans">Copied!</span> : <CopyIcon className="w-4 h-4" />}
            </button>
        </div>
    );
};

export const ChronoShiftModal: React.FC<ChronoShiftModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ClockIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Chrono-Shift Ritual (Snapshots)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        Architect, one of the most powerful runes etched into every Kael OS Realm is the ability to manipulate time itself. Using <strong className="text-dragon-fire">BTRFS snapshots</strong>, you can instantly save the state of your system and restore it later, making it fearless to experiment.
                    </p>
                    <p>
                        The <strong className="text-orc-steel">Timeshift</strong> application provides a graphical interface for this magic, while <strong className="text-magic-purple">grub-btrfs</strong> ensures that every snapshot you create is automatically added to your boot menu for easy recovery, even if the system won't start.
                    </p>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">First Time Configuration</h3>
                    <p>
                        The first time you run Timeshift, it will ask you a few questions. Run this command to launch the configuration wizard:
                    </p>
                    <CodeBlock lang="bash">sudo timeshift-launcher</CodeBlock>
                    <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                        <li>Select <strong className="text-dragon-fire">BTRFS</strong> as the snapshot type.</li>
                        <li>Confirm the location of your BTRFS system volume (it should be detected automatically).</li>
                        <li>(Optional) Set up a schedule for automatic snapshots. Daily or weekly is a good start.</li>
                    </ul>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Common Incantations (Command Line)</h3>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Create a Manual Snapshot</h4>
                    <p className="text-xs">Create a save point before making significant changes.</p>
                    <CodeBlock lang="bash">sudo timeshift --create --comments "Before installing epic new drivers"</CodeBlock>

                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">List All Snapshots</h4>
                     <p className="text-xs">See all the save points you've created.</p>
                    <CodeBlock lang="bash">sudo timeshift --list</CodeBlock>
                    
                    <h4 className="font-semibold text-md text-forge-text-primary mt-3 mb-1">Restore from a Snapshot</h4>
                    <p className="text-xs">While you can restore from the command line, the safest and easiest way is to <strong className="text-dragon-fire">reboot your system</strong>. You will see a "BTRFS Snapshots" entry in your GRUB boot menu. Select it to choose and restore a previous state.</p>
                    <CodeBlock lang="bash"># For emergency use from a TTY. Follow on-screen prompts.
sudo timeshift --restore</CodeBlock>
                </div>
            </div>
        </div>
    );
};
