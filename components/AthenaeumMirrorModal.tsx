import React from 'react';
import { CloseIcon, ServerStackIcon } from './Icons';
import { CodeBlock } from './CodeBlock';

interface AthenaeumMirrorModalProps {
  onClose: () => void;
}

const SETUP_LFTP = `sudo pacman -S --noconfirm lftp`;

const MIRROR_COMMAND_INTERACTIVE = `lftp -c "open -u 'leroy@leroyonline.co.za' ftps://ftp.leroyonline.co.za; mirror -R --verbose --delete --parallel=5 ./"`;

const MIRROR_COMMAND_SCRIPTED = `# WARNING: Exposes password in scripts/history. Use with caution.
lftp -c "open -u 'leroy@leroyonline.co.za','LeRoy0923!' ftps://ftp.leroyonline.co.za; mirror -R --verbose --delete --parallel=5 ./"`;

export const AthenaeumMirrorModal: React.FC<AthenaeumMirrorModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <ServerStackIcon className="w-5 h-5 text-dragon-fire" />
                        <span>Athenaeum Secondary Mirror</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This ritual establishes a secondary, private mirror for your Athenaeum's artifacts. It uses the <code className="font-mono text-xs">lftp</code> familiar to securely synchronize your compiled packages with a remote server via <strong className="text-orc-steel">FTPS</strong>.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Summon the `lftp` Familiar (One-Time Setup)</h3>
                    <p>
                        First, ensure the <code className="font-mono text-xs">lftp</code> familiar is present in your Realm.
                    </p>
                    <CodeBlock lang="bash">{SETUP_LFTP}</CodeBlock>

                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 2: The Mirroring Incantation</h3>
                     <p>
                        Run this command from within your local <code className="font-mono text-xs">kael-os-repo</code> directory after checking out the <code className="font-mono text-xs">gh-pages</code> branch. It will synchronize the local files with your remote server.
                    </p>
                    <p className="text-sm p-3 bg-dragon-fire/10 border-l-4 border-dragon-fire rounded">
                        <strong className="text-dragon-fire">Security Note:</strong> For maximum security, use the <strong className="text-forge-text-primary">Recommended</strong> command. <code className="font-mono text-xs">lftp</code> will securely prompt you for your password. The scripted version is for automation but exposes your password in your shell's history.
                    </p>
                     <h4 className="font-semibold text-forge-text-primary mt-3">Recommended (Interactive Password):</h4>
                    <CodeBlock lang="bash">{MIRROR_COMMAND_INTERACTIVE}</CodeBlock>

                     <h4 className="font-semibold text-forge-text-primary mt-3">For Automation Scripts:</h4>
                    <CodeBlock lang="bash">{MIRROR_COMMAND_SCRIPTED}</CodeBlock>

                </div>
            </div>
        </div>
    );
};
