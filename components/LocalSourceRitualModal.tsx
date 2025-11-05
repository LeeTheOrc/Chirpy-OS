import React, { useState } from 'react';
import { CloseIcon, CopyIcon, PackageIcon } from './Icons';

interface LocalSourceRitualModalProps {
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

const TextAreaField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; helpText?: string}> = ({ label, value, onChange, placeholder, helpText }) => (
    <div>
        <label className="block text-sm font-medium text-forge-text-secondary mb-1">{label}</label>
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={4}
            className="w-full bg-forge-bg border border-forge-border rounded-lg p-2 text-sm font-mono text-forge-text-primary focus:ring-1 focus:ring-dragon-fire transition-colors"
        />
        {helpText && <p className="text-xs text-forge-text-secondary/80 mt-1">{helpText}</p>}
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


export const LocalSourceRitualModal: React.FC<LocalSourceRitualModalProps> = ({ onClose }) => {
    const [step, setStep] = useState(1);
    const [sourceType, setSourceType] = useState<'folder' | 'archive'>('folder');
    const [pkgName, setPkgName] = useState('');
    const [sourcePath, setSourcePath] = useState('');
    const [pkgData, setPkgData] = useState({
        pkgdesc: '',
        pkgver: '1.0',
        pkgrel: '1',
        arch: 'any',
        license: 'GPL3',
        buildCmds: '# No build commands needed by default\necho "Nothing to build."',
        packageCmds: '# Example: copy an executable to /usr/bin\ninstall -Dm 755 -t "$pkgdir/usr/bin/" your-executable-file',
    });

    const steps = ["Source", "Prepare", "Recipe", "Forge"];

    const getPrepCommand = () => {
        if (!pkgName || !sourcePath) return "# Please fill in all fields";
        if (sourceType === 'folder') {
            return `mkdir -p ~/packages/${pkgName}/src\ncp -r ${sourcePath}/. ~/packages/${pkgName}/src/`;
        } else {
            return `mkdir -p ~/packages/${pkgName}/src\ntar -xvf ${sourcePath} -C ~/packages/${pkgName}/src --strip-components=1`;
        }
    };

    const getPkgbuildContent = () => {
        return `# Maintainer: The Architect <your-email@example.com>
pkgname=${pkgName || 'my-local-package'}
pkgver=${pkgData.pkgver || '1.0'}
pkgrel=${pkgData.pkgrel || '1'}
pkgdesc="${pkgData.pkgdesc || 'A package forged from local sources.'}"
arch=('${pkgData.arch}')
license=('${pkgData.license || 'GPL3'}')
source=('src')
sha256sums=('SKIP')
noextract=("src")

build() {
    cd "$srcdir/src"
    ${pkgData.buildCmds}
}

package() {
    cd "$srcdir/src"
    ${pkgData.packageCmds}
}
`;
    };
    
    const getFinalCommand = () => {
        const pkgbuildContent = getPkgbuildContent();
        const finalScript = `#!/bin/bash
set -e
echo "--> Scribing the recipe for '${pkgName}'..."
mkdir -p ~/packages/${pkgName}
cat > ~/packages/${pkgName}/PKGBUILD << 'PKGBUILD_EOF'
${pkgbuildContent}
PKGBUILD_EOF
echo "[SUCCESS] Recipe has been scribed."
echo "--> Initiating the Publishing Rite..."
cd ~/packages
if [ -f "./publish-package.sh" ]; then
    ./publish-package.sh ${pkgName}
else
    echo "ERROR: 'publish-package.sh' not found in '~/packages'."
    echo "Please create it using the Keystone Rituals guide."
    exit 1
fi
`;
        const encoded = btoa(unescape(encodeURIComponent(finalScript.trim())));
        return `echo "${encoded}" | base64 --decode | bash`;
    };

    const isStep1Complete = pkgName.trim() !== '';
    const isStep2Complete = sourcePath.trim() !== '';
    const isStep3Complete = pkgData.pkgdesc.trim() !== '';

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-forge-panel border-2 border-forge-border rounded-lg shadow-2xl w-full max-w-2xl p-6 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-forge-text-primary font-display tracking-wider flex items-center gap-3">
                        <PackageIcon className="w-5 h-5 text-dragon-fire" />
                        The Ritual of Local Forging
                    </h2>
                    <button onClick={onClose} className="text-forge-text-secondary hover:text-forge-text-primary">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <Stepper currentStep={step} steps={steps} />
                
                <div className="overflow-y-auto pr-2 flex-grow space-y-4">
                    {step === 1 && (
                        <div className="space-y-4 animate-fade-in">
                            <p>Greetings, Architect. Let's forge an artifact from local source code. First, tell me about the raw materials.</p>
                            <InputField label="What is the package name?" value={pkgName} onChange={(e) => setPkgName(e.target.value)} placeholder="e.g., my-cool-script" />
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
                            <p>Excellent. Now, tell me the location of the source code so I can generate the correct incantation to move it into our forge.</p>
                            <InputField label={`Full path to the source ${sourceType}`} value={sourcePath} onChange={(e) => setSourcePath(e.target.value)} placeholder={`/home/architect/downloads/${sourceType === 'folder' ? 'my-project' : 'my-project.tar.gz'}`} />
                            <p className="text-sm">Run this command in your terminal to prepare the files:</p>
                            <CodeBlock lang="bash">{getPrepCommand()}</CodeBlock>
                             {sourceType === 'archive' && <p className="text-xs text-forge-text-secondary/80">Note: The '--strip-components=1' part is a common spell to remove the top-level folder from inside the archive, which is usually what you want.</p>}
                        </div>
                    )}
                    {step === 3 && (
                         <div className="space-y-4 animate-fade-in">
                            <p>The materials are in place. Now we must scribe the recipe—the PKGBUILD. Fill in these details.</p>
                             <InputField label="Description" value={pkgData.pkgdesc} onChange={(e) => setPkgData({...pkgData, pkgdesc: e.target.value})} placeholder="A short description of the package." />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Version" value={pkgData.pkgver} onChange={(e) => setPkgData({...pkgData, pkgver: e.target.value})} />
                                <InputField label="Release" value={pkgData.pkgrel} onChange={(e) => setPkgData({...pkgData, pkgrel: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="License" value={pkgData.license} onChange={(e) => setPkgData({...pkgData, license: e.target.value})} />
                                <RadioGroup
                                    label="Architecture"
                                    name="arch"
                                    options={[{value: 'any', label: 'Any (scripts)'}, {value: 'x86_64', label: 'x86_64 (compiled)'}]}
                                    selected={pkgData.arch}
                                    onChange={(val) => setPkgData({...pkgData, arch: val})}
                                />
                            </div>
                            <TextAreaField label="Build Commands" value={pkgData.buildCmds} onChange={(e) => setPkgData({...pkgData, buildCmds: e.target.value})} helpText="Commands to compile the code. Leave as is if not needed." />
                            <TextAreaField label="Package Commands" value={pkgData.packageCmds} onChange={(e) => setPkgData({...pkgData, packageCmds: e.target.value})} helpText="Commands to copy the built files into the final package." />
                        </div>
                    )}
                     {step === 4 && (
                         <div className="space-y-4 animate-fade-in">
                            <p>The ritual is nearly complete! I have forged the final incantation. This single command will scribe the PKGBUILD and then immediately begin the Publishing Rite.</p>
                            <h4 className="font-semibold text-orc-steel">Generated PKGBUILD Recipe:</h4>
                            <CodeBlock lang="bash">{getPkgbuildContent()}</CodeBlock>
                             <h4 className="font-semibold text-orc-steel">Final Unified Command:</h4>
                            <p className="text-sm">Copy and run this in your terminal to complete the process.</p>
                            <CodeBlock lang="bash">{getFinalCommand()}</CodeBlock>
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
                    {step < 4 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={(step === 1 && !isStep1Complete) || (step === 2 && !isStep2Complete) || (step === 3 && !isStep3Complete)}
                            className="px-6 py-2 bg-dragon-fire text-black font-bold rounded-md hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
