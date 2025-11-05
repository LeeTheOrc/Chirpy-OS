import React, { useState } from 'react';
import { CloseIcon, CopyIcon, EyeIcon } from './Icons';

interface ChwdRitualModalProps {
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
            <pre className={`bg-forge-bg border border-forge-border rounded-lg p-3 text-xs text-forge-text-secondary font-mono pr-12 whitespace-pre-wrap break-words max-h-48 overflow-y-auto ${lang ? `language-${lang}` : ''}`}>
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

const Stepper: React.FC<{ currentStep: number, steps: string[] }> = ({ currentStep, steps }) => (
    <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentStep > stepNumber;
            const isActive = currentStep === stepNumber;
            return (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                            isActive ? 'bg-dragon-fire text-black' : 
                            isCompleted ? 'bg-orc-steel text-black' : 
                            'bg-forge-border text-forge-text-secondary'
                        }`}>
                            {isCompleted ? '✓' : stepNumber}
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${isActive || isCompleted ? 'text-forge-text-primary' : 'text-forge-text-secondary'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 transition-colors ${isCompleted ? 'bg-orc-steel' : 'bg-forge-border'}`}></div>
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

const RadioGroup: React.FC<{label: string, name: string, options: {value: string, label: string}[], selected: string, onChange: (value: string) => void}> = ({label, name, options, selected, onChange}) => (
    <div>
        <label className="block text-sm font-medium text-forge-text-secondary mb-2">{label}</label>
        <div className="flex gap-4">
            {options.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-forge-text-primary cursor-pointer">
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={selected === opt.value}
                        onChange={() => onChange(opt.value)}
                        className="form-radio bg-forge-bg border-forge-border text-dragon-fire focus:ring-dragon-fire"
                    />
                    {opt.label}
                </label>
            ))}
        </div>
    </div>
);

const InputField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string}> = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-forge-text-secondary mb-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-forge-bg border border-forge-border rounded-lg p-2 text-sm text-forge-text-primary focus:ring-1 focus:ring-dragon-fire transition-colors"
        />
    </div>
);


const PKGBUILD_CONTENT = `# Maintainer: The Architect & Kael <https://github.com/LeeTheOrc/Kael-OS>
# Original work by: CachyOS <ptr1337@cachyos.org>
pkgname=khws
pkgver=0.3.3
pkgrel=12
pkgdesc="Kael Hardware Scry: Kael's hardware detection tool (based on CachyOS chwd)"
arch=('x86_64')
url="https://github.com/CachyOS/chwd"
license=('GPL3')
depends=('pciutils' 'dmidecode' 'hwinfo' 'mesa-utils' 'xorg-xrandr' 'vulkan-tools' 'libdrm')
makedepends=('meson' 'ninja')
source=('src')
sha256sums=('SKIP')
noextract=("src")

build() {
    cd "$srcdir/src"
    meson setup _build --prefix=/usr --buildtype=release
    ninja -C _build
}

package() {
    cd "$srcdir/src"
    DESTDIR="$pkgdir" ninja -C _build install
}
`;


// Helper to create a shell-agnostic command
const createUniversalCommand = (script: string) => {
    // UTF-8 safe encoding
    const encoded = btoa(unescape(encodeURIComponent(script.trim())));
    return `echo "${encoded}" | base64 --decode | bash`;
};

export const ChwdRitualModal: React.FC<ChwdRitualModalProps> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [sourceType, setSourceType] = useState<'folder' | 'archive'>('folder');
    const [sourcePath, setSourcePath] = useState('');

    const steps = ["Source", "Prepare", "Recipe", "Forge"];
    
    const getFinalCommand = () => {
        if (!sourcePath) {
            return "echo 'ERROR: Source path was not provided. Please go back and fill it in.'";
        }
        
        // Shell-escape the sourcePath to prevent issues with spaces or special characters
        const escapedSourcePath = "'" + sourcePath.replace(/'/g, "'\\''") + "'";

        let prepCommand;
        if (sourceType === 'folder') {
            prepCommand = `
echo "--> Preparing source files from folder..."
# Check if source directory exists before copying
if [ ! -d ${escapedSourcePath} ]; then
    echo "ERROR: Source directory not found at ${escapedSourcePath}"
    exit 1
fi
mkdir -p ~/packages/khws/src
cp -r ${escapedSourcePath}/. ~/packages/khws/src/
`;
        } else {
            prepCommand = `
echo "--> Preparing source files from archive..."
# Check if source file exists before extracting
if [ ! -f ${escapedSourcePath} ]; then
    echo "ERROR: Source archive not found at ${escapedSourcePath}"
    exit 1
fi
mkdir -p ~/packages/khws/src
tar -xvf ${escapedSourcePath} -C ~/packages/khws/src --strip-components=1
`;
        }

        const finalScript = `#!/bin/bash
set -e
echo "--- Beginning the Ritual of Insight ---"

# Step 1: Prepare the source files
${prepCommand}
echo "[SUCCESS] Source files prepared."

# Step 2: Scribe the recipe
echo "--> Scribing the recipe for 'khws'..."
mkdir -p ~/packages/khws
cat > ~/packages/khws/PKGBUILD << 'PKGBUILD_EOF'
${PKGBUILD_CONTENT}
PKGBUILD_EOF
echo "[SUCCESS] Recipe has been scribed."

# Step 3: Initiate the Publishing Rite
echo "--> Initiating the Publishing Rite..."
cd ~/packages
if [ -f "./publish-package.sh" ]; then
    ./publish-package.sh khws
else
    echo "ERROR: 'publish-package.sh' not found in '~/packages'."
    echo "Please perform the Keystone Ritual to create it."
    exit 1
fi

echo "--- The Ritual of Insight is Complete ---"
`;
        return createUniversalCommand(finalScript);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider flex items-center gap-3">
                        <EyeIcon className="w-5 h-5 text-dragon-fire" />
                        The Ritual of Insight: Forging \`khws\`
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <Stepper currentStep={step} steps={steps} />

                <div className="overflow-y-auto pr-2 flex-grow space-y-4">
                     {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                             <p>Architect, this ritual will bestow upon our forge the gift of <strong className="text-dragon-fire">Insight</strong>. We will package our own version of the CachyOS Hardware Detection tool, naming it <strong className="text-orc-steel">khws (Kael Hardware Scry)</strong>, and publish it to our Athenaeum.</p>
                            <div className="p-3 bg-forge-bg border border-forge-border rounded-lg text-sm">
                                <h5 className="font-semibold text-dragon-fire mb-2">Prerequisites</h5>
                                <p>First, you must have the source code for <strong className="font-mono text-xs">chwd</strong> on your machine. You can acquire it by running the <strong className="text-orc-steel">Athenaeum Scryer</strong> ritual for CachyOS, or by downloading it directly from their GitHub repository.</p>
                            </div>
                            <RadioGroup
                                label="What is the source type?"
                                name="sourceType"
                                options={[{value: 'folder', label: 'A folder on my machine'}, {value: 'archive', label: 'A .zip or .tar.gz archive'}]}
                                selected={sourceType}
                                onChange={(val) => setSourceType(val as 'folder' | 'archive')}
                            />
                        </div>
                    )}
                    {step === 2 && (
                         <div className="space-y-4 animate-fade-in">
                            <p>Excellent. Now, tell me the location of the <strong className="font-mono text-xs">chwd</strong> source code. This path will be used in the final, unified command.</p>
                            <InputField 
                                label={`Full path to the source ${sourceType}`} 
                                value={sourcePath} 
                                onChange={(e) => setSourcePath(e.target.value)} 
                                placeholder={`/home/architect/downloads/${sourceType === 'folder' ? 'chwd' : 'chwd-0.3.3.tar.gz'}`} 
                            />
                             {sourceType === 'archive' && <p className="text-xs text-forge-text-secondary/80">Note: The final command will use '--strip-components=1' which is a common spell to remove the top-level folder from inside the archive.</p>}
                        </div>
                    )}
                    {step === 3 && (
                         <div className="space-y-4 animate-fade-in">
                            <p>The materials are in place. Now we must scribe the recipe—the <strong className="text-orc-steel">PKGBUILD</strong>. I have prepared it to work with the local source files you provided.</p>
                            <CodeBlock lang="bash">{PKGBUILD_CONTENT}</CodeBlock>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="space-y-4 animate-fade-in">
                            <p>The ritual is nearly complete! I have forged the final, unified incantation. This single command will perform all the necessary steps:</p>
                            <ul className="list-disc list-inside text-sm pl-4 space-y-1">
                                <li>Prepare the source files from the path you provided.</li>
                                <li>Scribe the PKGBUILD recipe into the correct directory.</li>
                                <li>Initiate the Publishing Rite to build, sign, and upload the package.</li>
                            </ul>
                            <h4 className="font-semibold text-orc-steel">Final Unified Command:</h4>
                            <p className="text-sm">Copy and run this in your terminal to complete the process.</p>
                            <CodeBlock lang="bash">{getFinalCommand()}</CodeBlock>
                            <p className="mt-2">Once this ritual is complete, the gift of Insight is ours. Every Realm forged from this moment on will contain this new power.</p>
                        </div>
                    )}
                </div>

                 <div className="pt-4 flex justify-between items-center flex-shrink-0">
                    <button 
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 1}
                        className="px-4 py-2 bg-forge-border text-forge-text-secondary rounded-md hover:bg-forge-panel transition-colors disabled:opacity-50"
                    >
                        Back
                    </button>
                    {step < steps.length ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={(step === 2 && sourcePath.trim() === '')}
                            className="px-6 py-2 bg-dragon-fire text-black font-bold rounded-md hover:bg-yellow-400 transition-colors disabled:opacity-50"
                        >
                            Continue
                        </button>
                    ) : (
                         <button
                            onClick={onClose}
                            className="px-6 py-2 bg-orc-steel text-black font-bold rounded-md hover:bg-green-400 transition-colors"
                        >
                            Finish
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};