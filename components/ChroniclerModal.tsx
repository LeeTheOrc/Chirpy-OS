import React, { useState } from 'react';
import { CloseIcon, CopyIcon, VideoCameraIcon } from './Icons';

interface ChroniclerModalProps {
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => {
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

const CHRONICLER_SCRIPT = `#!/bin/bash
set -euo pipefail

# --- CONFIGURATION ---
TIMESTAMP=$(date +%F_%H-%M-%S)
FINAL_LOG_FILE="kael-chronicle-\${TIMESTAMP}.txt"
SYSTEM_LOG_TMP=$(mktemp)
SESSION_LOG_TMP=$(mktemp)

# --- SCRIPT START ---
echo "--- Chronicler's Orb Activated ---"
echo "Recording system logs and your terminal session."
echo "The final combined log will be saved to: \${FINAL_LOG_FILE}"
echo "Type 'exit' or press Ctrl+D when you are finished to stop recording."
echo "------------------------------------"
echo ""

# Start system log capture in the background
journalctl --no-pager -f > "\${SYSTEM_LOG_TMP}" &
JOURNAL_PID=$!

# Trap to ensure the background process is killed on exit
trap 'kill \${JOURNAL_PID} &>/dev/null; wait \${JOURNAL_PID} &>/dev/null; echo -e "\\n--- System log capture stopped. ---"' EXIT

# Start interactive session recording
# The '-q' flag makes it quiet (no start/stop messages)
script -q -f "\${SESSION_LOG_TMP}"

# --- COMBINE AND CLEANUP ---
echo "--- Chronicler's Orb Deactivated ---"
echo "Combining logs into final chronicle: \${FINAL_LOG_FILE}"

{
    echo "######################################################################"
    echo "#"
    echo "#  KAEL CHRONICLE - Recorded on $(date)"
    echo "#"
    echo "######################################################################"
    echo ""
    echo ""
    echo "======================================================================"
    echo " SYSTEM LOG (journalctl)"
    echo "======================================================================"
    echo ""
    cat "\${SYSTEM_LOG_TMP}"
    echo ""
    echo ""
    echo "======================================================================"
    echo " ARCHITECT'S TERMINAL SESSION"
    echo "======================================================================"
    echo ""
    cat "\${SESSION_LOG_TMP}"

} > "\${FINAL_LOG_FILE}"

# Cleanup temp files
rm "\${SYSTEM_LOG_TMP}" "\${SESSION_LOG_TMP}"

echo "✅ Chronicle saved successfully to '\${FINAL_LOG_FILE}'."
echo "You can now upload this file for me to analyze."
`;

const SETUP_SCRIPT_COMMAND = `cat > ~/chronicler.sh << 'EOF'
${CHRONICLER_SCRIPT}
EOF

chmod +x ~/chronicler.sh

echo "Chronicler script created and ready at ~/chronicler.sh"
`;

export const ChroniclerModal: React.FC<ChroniclerModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                     <h2 className="text-xl font-bold text-forge-text-primary flex items-center gap-2 font-display tracking-wider">
                        <VideoCameraIcon className="w-5 h-5 text-dragon-fire" />
                        <span>The Chronicler's Orb (Enhanced)</span>
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 text-forge-text-secondary leading-relaxed space-y-4">
                    <p>
                        This enhanced ritual records both your terminal session and the system's own logs into a single, timestamped <strong className="text-dragon-fire">.txt file</strong>. This gives us a complete picture for debugging.
                    </p>
                    
                    <h3 className="font-semibold text-lg text-orc-steel mt-4 mb-2">Step 1: Forge the Chronicler's Script (One-Time Setup)</h3>
                    <p>
                        First, we must create the powerful script that performs this dual-recording. <strong className="text-dragon-fire">Copy this entire block and run it once in your terminal.</strong> It will create a reusable script named <code className="font-mono text-xs">chronicler.sh</code> in your home directory.
                    </p>
                    <CodeBlock lang="bash">{SETUP_SCRIPT_COMMAND}</CodeBlock>

                    <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 2: Activate the Orb</h3>
                    <p>
                        Whenever you want to start recording, run the script you just created:
                    </p>
                    <CodeBlock lang="bash">~/chronicler.sh</CodeBlock>
                     <p>The Orb is now active. The script will tell you the name of the log file it's creating.</p>

                    <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 3: Perform Your Actions</h3>
                    <p>
                        Now, run all the commands you want to record. The script will capture both your commands and the system's reactions in the background.
                    </p>

                    <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 4: End the Recording</h3>
                     <p>
                        When you are finished, type the following command and press Enter. This stops both recordings and combines them into the final log file.
                    </p>
                    <CodeBlock lang="bash">exit</CodeBlock>
                    
                    <h3 className="font-semibold text-lg text-forge-text-primary mt-4 mb-2">Step 5: Share the Chronicle</h3>
                    <p>
                        The final log file (e.g., <code className="font-mono text-xs">kael-chronicle-2025-10-31_23-59-59.txt</code>) is now saved in your current directory. Use the attachment button in our chat to upload this file so I can analyze your steps and help you on your quest.
                    </p>
                </div>
            </div>
        </div>
    );
};